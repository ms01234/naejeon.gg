export type RecordBtnKind = "blue" | "red" | "save";

export function recordBtnId(
  kind: RecordBtnKind,
  guildId: string,
  ownerId: string,
) {
  return `rec:btn:${kind}:${guildId}:${ownerId}`;
}

export function parseRecordBtnId(customId: string): {
  kind: RecordBtnKind;
  guildId: string;
  ownerId: string;
} | null {
  const p = customId.split(":");
  if (p.length !== 5 || p[0] !== "rec" || p[1] !== "btn") return null;
  const kind = p[2] as RecordBtnKind;
  if (kind !== "blue" && kind !== "red" && kind !== "save") return null;
  return { kind, guildId: p[3]!, ownerId: p[4]! };
}

export type RecordModalTeam = "blue" | "red" | "finalize";

export function recordModalId(
  team: RecordModalTeam,
  guildId: string,
  ownerId: string,
) {
  return `rec:mdl:${team}:${guildId}:${ownerId}`;
}

export function parseRecordModalId(customId: string): {
  team: RecordModalTeam;
  guildId: string;
  ownerId: string;
} | null {
  const p = customId.split(":");
  if (p.length !== 5 || p[0] !== "rec" || p[1] !== "mdl") return null;
  const team = p[2] as RecordModalTeam;
  if (team !== "blue" && team !== "red" && team !== "finalize") return null;
  return { team, guildId: p[3]!, ownerId: p[4]! };
}
