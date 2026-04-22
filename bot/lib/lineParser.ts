import type { DraftRow } from "../types/draft";

const TEAM_FIELD_ID = "TEAM_BLOCK";

/** 구조 오류(슬래시 없음·비어 있음·토큰 부족 등) 시 동일 안내 */
export const NICK_CHAMP_SLASH_HINT =
  "닉네임과 챔피언 사이는 /로 구분해 주세요";

export function teamFieldId() {
  return TEAM_FIELD_ID;
}

function parseNonNegIntToken(
  raw: string,
  lineNo: number,
  fieldLabel: string,
): { ok: true; value: number } | { ok: false; message: string } {
  const t = raw.trim().replace(/,/g, "");
  if (!/^\d+$/.test(t)) {
    return {
      ok: false,
      message: `라인 ${lineNo}: **${fieldLabel}**에는 0 이상의 정수만 입력하세요. (입력: \`${raw.trim() || "(비어 있음)"}\`)`,
    };
  }
  const value = Number(t);
  if (!Number.isFinite(value) || value < 0) {
    return {
      ok: false,
      message: `라인 ${lineNo}: **${fieldLabel}** 숫자가 올바르지 않습니다.`,
    };
  }
  return { ok: true, value: Math.floor(value) };
}

function structuralError(lineNo: number): { ok: false; message: string } {
  return { ok: false, message: `라인 ${lineNo}: ${NICK_CHAMP_SLASH_HINT}` };
}

/**
 * 한 줄: `닉네임/챔피언 K D A 딜량`
 * - 닉네임과 챔피언은 **첫 번째 `/` 한 번**으로만 구분 (닉네임에 공백 가능).
 * - `/` 뒤: 챔피언(공백 허용) + 공백으로 구분된 K, D, A, 딜량(마지막 4토큰은 숫자).
 */
export function parseNickChampionSlashLine(
  raw: string,
  lineNo: number,
): { ok: true; row: DraftRow } | { ok: false; message: string } {
  const line = raw.trim();
  if (!line.includes("/")) {
    return structuralError(lineNo);
  }

  const slashIdx = line.indexOf("/");
  const nickname = line.slice(0, slashIdx).trim();
  const rest = line.slice(slashIdx + 1).trim();

  if (!nickname || !rest) {
    return structuralError(lineNo);
  }

  const tokens = rest.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length < 5) {
    return structuralError(lineNo);
  }

  const kStr = tokens[tokens.length - 4]!;
  const dStr = tokens[tokens.length - 3]!;
  const aStr = tokens[tokens.length - 2]!;
  const dmgStr = tokens[tokens.length - 1]!;
  const champion = tokens.slice(0, -4).join(" ").trim();

  if (!champion) {
    return structuralError(lineNo);
  }

  const k = parseNonNegIntToken(kStr, lineNo, "K(킬)");
  if (!k.ok) return k;
  const d = parseNonNegIntToken(dStr, lineNo, "D(데스)");
  if (!d.ok) return d;
  const a = parseNonNegIntToken(aStr, lineNo, "A(어시)");
  if (!a.ok) return a;
  const dmg = parseNonNegIntToken(dmgStr, lineNo, "딜량");
  if (!dmg.ok) return dmg;

  return {
    ok: true,
    row: {
      nickname,
      champion,
      kills: k.value,
      deaths: d.value,
      assists: a.value,
      damage: dmg.value,
    },
  };
}

/** 줄바꿈으로 5줄, 각 줄 `닉네임/챔피언 K D A 딜량` */
export function parseTeamTextBlock(
  raw: string,
): { ok: true; rows: DraftRow[] } | { ok: false; message: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length !== 5) {
    return {
      ok: false,
      message:
        `정확히 **5줄**이 필요합니다. (현재 ${lines.length}줄) ` +
        `한 줄: \`닉네임/챔피언 K D A 딜량\` (${NICK_CHAMP_SLASH_HINT})`,
    };
  }
  const rows: DraftRow[] = [];
  for (let i = 0; i < 5; i++) {
    const parsed = parseNickChampionSlashLine(lines[i]!, i + 1);
    if (!parsed.ok) return parsed;
    rows.push(parsed.row);
  }
  return { ok: true, rows };
}
