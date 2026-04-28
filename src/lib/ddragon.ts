import { unstable_cache } from "next/cache";
import { CHAMPION_ALIAS_TO_ID } from "@/lib/champion-aliases";

const DDRAGON = "https://ddragon.leagueoflegends.com";

export const getLatestDdragonVersion = unstable_cache(
  async () => {
    const res = await fetch(`${DDRAGON}/api/versions.json`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("versions.json 요청 실패");
    const data = (await res.json()) as string[];
    return data[0];
  },
  ["ddragon-latest-version"],
  { revalidate: 3600 },
);

type ChampionJson = {
  data: Record<
    string,
    {
      key: string;
      name: string;
      id: string;
    }
  >;
};

/** 띄어쓰기·대소문자·특수문자 차이를 줄여 매칭률을 높입니다. */
export function normalizeChampionQuery(s: string) {
  return s
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s\-_'·.]/g, "");
}

function ingestChampions(json: ChampionJson, map: Map<string, string>) {
  for (const ch of Object.values(json.data)) {
    map.set(normalizeChampionQuery(ch.name), ch.id);
    map.set(normalizeChampionQuery(ch.id), ch.id);
    const noPunctId = ch.id.replace(/['']/g, "");
    if (noPunctId !== ch.id) {
      map.set(normalizeChampionQuery(noPunctId), ch.id);
    }
  }
}

/** unstable_cache 직렬화 시 Map → 일반 객체가 되므로 캐시 경계에서는 Record만 사용 */
type ChampionLookupPayload = { version: string; map: Record<string, string> };

/**
 * 챔피언 별칭/룩업 캐시 버전.
 * 별칭 테이블(`CHAMPION_ALIAS_TO_ID`)이 바뀌면 값을 올려서 즉시 캐시를 무효화합니다.
 */
const CHAMPION_LOOKUP_CACHE_VERSION = "v2-2026-04-29";

const getChampionLookupMerged = unstable_cache(
  async (): Promise<ChampionLookupPayload> => {
    const version = await getLatestDdragonVersion();
    const [koRes, enRes] = await Promise.all([
      fetch(`${DDRAGON}/cdn/${version}/data/ko_KR/champion.json`, {
        next: { revalidate: 86400 },
      }),
      fetch(`${DDRAGON}/cdn/${version}/data/en_US/champion.json`, {
        next: { revalidate: 86400 },
      }),
    ]);
    if (!koRes.ok) throw new Error("champion.json(ko) 요청 실패");
    if (!enRes.ok) throw new Error("champion.json(en) 요청 실패");
    const ko = (await koRes.json()) as ChampionJson;
    const en = (await enRes.json()) as ChampionJson;

    const map = new Map<string, string>();
    ingestChampions(ko, map);
    ingestChampions(en, map);

    for (const [alias, id] of Object.entries(CHAMPION_ALIAS_TO_ID)) {
      map.set(normalizeChampionQuery(alias), id);
    }

    return { version, map: Object.fromEntries(map) };
  },
  ["ddragon-champion-lookup-merged", CHAMPION_LOOKUP_CACHE_VERSION],
  { revalidate: 86400 },
);

function resolveIdFromMap(
  championName: string,
  map: Record<string, string>,
): string | null {
  const key = normalizeChampionQuery(championName);
  if (!key) return null;
  const direct = map[key];
  if (direct) return direct;
  const compact = key.replace(/\s+/g, "");
  if (compact !== key) {
    const hit = map[compact];
    if (hit) return hit;
  }
  return null;
}

export async function resolveChampionId(
  championName: string,
): Promise<string | null> {
  const { map } = await getChampionLookupMerged();
  return resolveIdFromMap(championName, map);
}

export async function championIconUrlByName(championName: string) {
  if (championName == null || typeof championName !== "string") return null;
  const name = championName.normalize("NFKC").trim();
  if (!name) return null;

  try {
    const { version, map } = await getChampionLookupMerged();
    if (
      !version ||
      typeof version !== "string" ||
      !map ||
      typeof map !== "object" ||
      Array.isArray(map)
    ) {
      return null;
    }
    const id = resolveIdFromMap(name, map);
    if (!id || typeof id !== "string") return null;
    return `${DDRAGON}/cdn/${version}/img/champion/${id}.png`;
  } catch {
    return null;
  }
}
