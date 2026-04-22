"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type Props = { players: string[] };

export function HomeSearch({ players }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return players.slice(0, 12);
    return players.filter((p) => p.toLowerCase().includes(t)).slice(0, 20);
  }, [players, q]);

  return (
    <div className="relative w-full max-w-2xl">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="유저 닉네임 검색..."
        className="h-12 w-full rounded-full border-0 bg-[var(--op-panel)] pl-5 pr-12 text-sm text-[var(--op-text)] shadow-inner outline-none ring-0 placeholder:text-[var(--op-muted)] focus:ring-2 focus:ring-[var(--op-accent)]/45"
        autoComplete="off"
      />
      <Search
        className="pointer-events-none absolute right-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-[var(--op-muted)]"
        aria-hidden
      />
      {q.trim() && filtered.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-auto rounded-2xl border-0 bg-[var(--op-panel)] py-1 shadow-xl shadow-black/40">
          {filtered.map((name) => (
            <li key={name}>
              <Link
                href={`/players/${encodeURIComponent(name)}`}
                className="block px-4 py-2.5 text-sm text-[var(--op-text)] hover:bg-[var(--op-elevated)]"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
