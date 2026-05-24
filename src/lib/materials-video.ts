/** Converte URL pública do YouTube em URL de embed, se permitida. */
export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return `https://www.youtube.com/embed/${fromQuery}`;

      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) {
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/** Converte URL pública do Vimeo em URL de embed, se permitida. */
export function getVimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = parsed.pathname.match(/\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function getVideoEmbedUrl(url: string): string | null {
  return getYoutubeEmbedUrl(url) ?? getVimeoEmbedUrl(url);
}
