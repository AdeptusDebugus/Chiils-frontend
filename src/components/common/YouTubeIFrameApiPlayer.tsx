import React, { useEffect, useMemo, useRef, useState } from 'react';
import { extractYouTubeId } from '../../utils/youtube.ts';

type Props = {
  videoUrl: string;
  className?: string;
  playerId?: string;
  title?: string;
  playerVars?: Record<string, any>;
};

const YouTubeIFrameApiPlayer: React.FC<Props> = ({
  videoUrl,
  className,
  playerId,
  title,
  playerVars,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const videoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);
  const stablePlayerId = useMemo(
    () => playerId ?? `yt-player-${Math.random().toString(36).slice(2)}`,
    [playerId]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!videoId || !containerRef.current) return;
      setIsReady(false);

      const { ensureYouTubeAPI } = await import('../../utils/youtube.ts');
      await ensureYouTubeAPI();
      if (!mounted || !containerRef.current) return;

      const w = window as any;

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Failed to destroy existing player', e);
        }
      }

      containerRef.current.innerHTML = `<div id="${stablePlayerId}"></div>`;

      const basePlayerVars = {
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
        autoplay: 0,
      };

      playerRef.current = new w.YT.Player(stablePlayerId, {
        videoId,
        width: '100%',
        height: '100%',
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          ...basePlayerVars,
          ...(playerVars ?? {}),
        },
        events: {
          onReady: () => mounted && setIsReady(true),
          onError: (e: any) => console.error('YouTube Player Error:', e.data),
        },
      });
    })();

    return () => {
      mounted = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Player destroy failed', e);
        }
      }
      playerRef.current = null;
    };
  }, [videoId, stablePlayerId, playerVars]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="yt-embed"
        aria-label={title ?? 'YouTube video'}
        aria-busy={!isReady}
      />
    </div>
  );
};

export default YouTubeIFrameApiPlayer;

