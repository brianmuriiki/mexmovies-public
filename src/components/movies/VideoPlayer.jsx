import { useEffect, useRef } from 'react';
import { archiveId, youtubeId } from '../../utils/format.js';

let youTubeApi = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  youTubeApi ||= new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return youTubeApi;
}

// YouTube: the official player API tells us when the movie is really playing.
function YouTubePlayer({ videoId, startAt, handlers, setPositionGetter }) {
  const holder = useRef(null);
  useEffect(() => {
    let player;
    let dead = false;
    loadYouTubeApi().then((YT) => {
      if (dead || !holder.current) return;
      const target = document.createElement('div');
      holder.current.appendChild(target);
      player = new YT.Player(target, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { start: Math.floor(startAt), rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => setPositionGetter?.(() => player?.getCurrentTime?.() ?? 0),
          onStateChange: (e) => {
            if (e.data === 1) handlers.current.onPlay();
            else if (e.data === 2) handlers.current.onPause();
            else if (e.data === 0) handlers.current.onEnded();
          },
        },
      });
    });
    return () => {
      dead = true;
      try {
        player?.destroy();
      } catch {
        /* already gone */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, startAt]);
  return <div ref={holder} />;
}

// Uploaded files (r2), direct MP4 links, and HLS streams.
function Html5Player({ movie, startAt, handlers, setPositionGetter }) {
  const ref = useRef(null);
  const isHls = movie.videoSource === 'hls';

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    setPositionGetter?.(() => video.currentTime);
    let hls;
    if (isHls) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = movie.videoUrl;
      } else {
        import('hls.js').then(({ default: Hls }) => {
          if (!Hls.isSupported()) return;
          hls = new Hls();
          hls.loadSource(movie.videoUrl);
          hls.attachMedia(video);
        });
      }
    }
    return () => hls?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.videoUrl, isHls]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      preload="metadata"
      poster={movie.backdropUrl || movie.posterUrl}
      src={isHls ? undefined : movie.videoUrl}
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (startAt > 0 && startAt < v.duration - 10) v.currentTime = startAt;
      }}
      onPlay={() => handlers.current.onPlay()}
      onPause={() => handlers.current.onPause()}
      onEnded={() => handlers.current.onEnded()}
    />
  );
}

export const isTrackable = (movie) => movie.videoSource !== 'archive';

export default function VideoPlayer({ movie, startAt = 0, tracker }) {
  const handlers = useRef(tracker);
  handlers.current = tracker;
  const setPositionGetter = (fn) => tracker.setPositionGetter(fn);

  if (movie.videoSource === 'youtube') {
    const id = youtubeId(movie.videoUrl);
    return id ? (
      <div className="player"><YouTubePlayer videoId={id} startAt={startAt} handlers={handlers} setPositionGetter={setPositionGetter} /></div>
    ) : null;
  }
  if (movie.videoSource === 'archive') {
    const id = archiveId(movie.videoUrl);
    return id ? (
      <div className="player">
        <iframe src={`https://archive.org/embed/${id}`} title={`${movie.title} video`} allowFullScreen />
      </div>
    ) : null;
  }
  return (
    <div className="player">
      <Html5Player movie={movie} startAt={startAt} handlers={handlers} setPositionGetter={setPositionGetter} />
    </div>
  );
}
