import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <div className="mx-auto max-w-md bg-[var(--op-page)] px-4 py-24 text-center">
      <h1 className="mb-2 text-xl font-semibold text-[var(--op-text)]">
        소환사를 찾을 수 없습니다
      </h1>
      <p className="mb-6 text-sm text-[var(--op-muted)]">
        해당 닉네임의 전적이 아직 없거나 주소가 잘못되었습니다.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-[var(--op-accent-bright)] hover:text-[var(--op-accent)]"
      >
        ← 홈으로
      </Link>
    </div>
  );
}
