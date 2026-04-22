"use client";

import { useEffect } from "react";

/** 서버에서 받은 조회 결과를 브라우저 콘솔에서 확인 */
export function RecentMatchesFetchedLog({ data }: { data: unknown }) {
  useEffect(() => {
    console.log("Fetched data:", data);
  }, [data]);
  return null;
}
