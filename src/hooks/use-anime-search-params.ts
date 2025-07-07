import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useAnimeSearchParams() {
  const searchParams = useSearchParams();

  return useMemo(() => {
    // Provide a fallback for searchParams to avoid null
    const params = searchParams ?? new URLSearchParams();

    const get = (key: string) => params.get(key) || undefined;

    return {
      q: get("q") ?? "",
      page: Number(get("page")) || 1,
      type: get("type") || "",
      status: get("status") || "",
      rated: get("rated") || "",
      season: get("season") || "",
      language: get("language") || "",
      sort: get("sort") || "",
      genres: get("genres") || "",
    };
  }, [searchParams]);
}
