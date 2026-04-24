/**
 * 사이트 전역 설정 (메타·OG·탭 제목·로고 경로).
 * 배포 URL·브랜딩 변경 시 이 파일을 우선 수정하세요.
 */

export const SITE_CANONICAL_URL = "https://naejeon-gg.vercel.app";

export const SITE_TITLE = "내전.GG";

/** 메타 description용 — 시각적으로 비움, 크롤러는 비어 있지 않은 값으로 인식 */
export const SITE_META_DESCRIPTION_PLACEHOLDER = "\u200B";

/** og-image·파비콘 등 정적 에셋 캐시 무력화 */
export const SITE_ASSET_CACHE_VERSION = "9";

/** 헤더 등 UI에서 쓰는 `public` 기준 로고 경로 */
export const SITE_PUBLIC_LOGO_PATH = "/naejeon.png";

export function siteOgImageAbsoluteUrl(): string {
  return `${SITE_CANONICAL_URL}/og-image.png?v=${SITE_ASSET_CACHE_VERSION}`;
}

export function siteIconPath(): string {
  return `/icon.png?v=${SITE_ASSET_CACHE_VERSION}`;
}

/** 종합 랭킹 1·2·3등 메달 (요청 색상) — globals `--op-*` 와 함께 다크 UI에 사용 */
export const RANK_MEDAL_GOLD = "#D4AF37";
export const RANK_MEDAL_SILVER = "#C0C0C0";
export const RANK_MEDAL_BRONZE = "#CD7F32";
