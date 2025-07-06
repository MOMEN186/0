import { hianime } from "@/lib/hianime";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const animeEpisodeId = searchParams.get("animeEpisodeId") as string;

    if (!animeEpisodeId) {
      return Response.json({ error: "animeEpisodeId is required" }, { status: 400 });
    }

    console.log("API: Getting episode servers for:", animeEpisodeId);

    const data = await hianime.getEpisodeServers(
      decodeURIComponent(animeEpisodeId),
    );

    console.log("API: Episode servers result:", data);

    if (!data || !data.sub || !Array.isArray(data.sub)) {
      return Response.json({ error: "No servers found" }, { status: 404 });
    }

    return Response.json({ data });
  } catch (err) {
    console.error("API: Episode servers error:", err);
    return Response.json({ error: "Failed to fetch episode servers" }, { status: 500 });
  }
}
