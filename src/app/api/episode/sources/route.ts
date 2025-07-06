import { hianime } from "@/lib/hianime";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("animeEpisodeId") as string;
    const server = searchParams.get("server") as string;
    const category = searchParams.get("category") as "sub" | "dub" | "raw";

    if (!episodeId) {
      return Response.json({ error: "animeEpisodeId is required" }, { status: 400 });
    }

    if (!category) {
      return Response.json({ error: "category is required" }, { status: 400 });
    }

    console.log("API: Getting episode sources for:", { episodeId, server, category });

    // Convert server string to proper AnimeServers type or use default
    const serverType = server as any || "hd-1";

    const data = await hianime.getEpisodeSources(
      decodeURIComponent(episodeId),
      serverType,
      category,
    );

    console.log("API: Episode sources result:", data);

    if (!data || !data.sources || data.sources.length === 0) {
      return Response.json({ error: "No sources found" }, { status: 404 });
    }

    return Response.json({ data });
  } catch (err) {
    console.error("API: Episode sources error:", err);
    return Response.json({ error: "Failed to fetch episode sources" }, { status: 500 });
  }
}
