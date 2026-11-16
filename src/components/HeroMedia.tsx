"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type HeroMediaProps = {
  poster: string;
  posterAlt: string;
  /** Video sources, tried in order. Muted and looped; never plays audio. */
  videoSources?: { src: string; type: string }[];
};

/**
 * Cinematic hero background.
 * - The poster renders immediately (priority image) and is the fallback.
 * - The video only loads after hydration, and never when the visitor prefers
 *   reduced motion or has Data Saver on.
 * - A visible pause control satisfies WCAG 2.2.2 for moving content.
 */
export function HeroMedia({ poster, posterAlt, videoSources = [] }: HeroMediaProps) {
  const hasVideo = videoSources.length > 0;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowVideo, setAllowVideo] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasVideo) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // Deferring the decision to after mount keeps the video out of the critical path.
    const id = window.requestAnimationFrame(() => {
      if (!reduce && !saveData) setAllowVideo(true);
      else setPlaying(false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [hasVideo]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => setPlaying(false));
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const showVideo = allowVideo && hasVideo && !failed;

  return (
    <>
      <div aria-hidden className="absolute inset-0">
        <Image src={poster} alt={posterAlt} fill priority sizes="100vw" className="object-cover" />
        {showVideo ? (
          <video
            ref={videoRef}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setReady(true)}
          >
            {videoSources.map((s, i) => (
              <source
                key={s.src}
                src={s.src}
                type={s.type}
                // If the last source fails, no format worked: keep the poster.
                onError={i === videoSources.length - 1 ? () => setFailed(true) : undefined}
              />
            ))}
          </video>
        ) : null}
        {/* Legibility scrim for the headline */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.5)_0%,rgba(17,17,17,0.12)_28%,rgba(17,17,17,0.45)_50%,rgba(17,17,17,0.88)_100%)]" />
      </div>

      {/* Static slate: a frozen timecode (no running counter or recording dot) and the pause control */}
      <div className="absolute right-[clamp(1.25rem,4vw,3.5rem)] top-24 z-10 flex items-center gap-3 md:top-28">
        <span className="type-meta font-display tabular-nums text-white/60" aria-hidden>
          00:00:18:06
        </span>
        {showVideo ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause background video" : "Play background video"}
            aria-pressed={!playing}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white"
          >
            {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
          </button>
        ) : null}
      </div>
    </>
  );
}
