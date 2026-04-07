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

/**
 * Ensures the YouTube IFrame API script is loaded.
 */
export const ensureYouTubeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
        const w = window as any;
        if (w.YT && w.YT.Player) {
            resolve();
            return;
        }
        const prev = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null;
        if (!prev) {
            const tag = document.createElement('script');
            tag.id = 'youtube-iframe-api';
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);
        }
        const existingCallback = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
            if (existingCallback) existingCallback();
            resolve();
        };
    });
};

/**
 * Fetches the duration of a YouTube video using a hidden player instance.
 */
export const fetchYouTubeDuration = async (videoId: string): Promise<number | null> => {
    await ensureYouTubeAPI();
    return new Promise((resolve) => {
        const w = window as any;
        const tempDiv = document.createElement('div');
        tempDiv.id = `temp-yt-player-${Date.now()}`;
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        let player: any;
        const cleanup = () => {
             if (player && typeof player.destroy === 'function') {
                 try { player.destroy(); } catch (e) { console.warn('Player destroy failed', e); }
             }
             if (tempDiv.parentNode) document.body.removeChild(tempDiv);
        };

        player = new w.YT.Player(tempDiv.id, {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                showinfo: 0,
                rel: 0,
                origin: window.location.origin
            },
            events: {
                onReady: () => {
                    const duration = player.getDuration();
                    cleanup();
                    resolve(duration);
                },
                onError: (e: any) => {
                    console.error('YouTube Duration Fetch Error:', e.data);
                    cleanup();
                    resolve(null);
                }
            }
        });

        // Fallback timeout
        setTimeout(() => {
            if (tempDiv.parentNode) {
                cleanup();
                resolve(null);
            }
        }, 15000);
    });
};

