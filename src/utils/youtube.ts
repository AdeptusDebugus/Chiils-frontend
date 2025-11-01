export const extractYouTubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      if (id) return id;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchYouTubeTitle = async (url: string): Promise<string | null> => {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return typeof data?.title === 'string' ? data.title : null;
  } catch (error) {
    console.error('Failed to fetch YouTube title for', url, error);
    return null;
  }
};

