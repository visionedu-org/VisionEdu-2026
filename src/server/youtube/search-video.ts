const YOUTUBE_SEARCH_URL =
  "https://www.googleapis.com/youtube/v3/search";

export async function searchYoutubeVideo(
  query: string
): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const url = new URL(YOUTUBE_SEARCH_URL);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("relevanceLanguage", "pt");
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  } catch {
    return null;
  }
}
