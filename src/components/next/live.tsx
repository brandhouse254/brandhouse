"use client";

import { useEffect, useRef } from "react";

/** Running SMPTE-style timecode (25 fps). Writes straight to the DOM, so it never re-renders React. */
export function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now() - 18_240; // starts at 00:00:18:06
    let raf = 0;
    let lastFrame = -1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = (now: number) => {
      const total = Math.floor(((now - start) / 1000) * 25);
      if (total !== lastFrame && ref.current) {
        lastFrame = total;
        const f = total % 25;
        const s = Math.floor(total / 25);
        ref.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span ref={ref} className={className}>
      00:00:18:06
    </span>
  );
}

/** Local time at the studio in Nairobi, updated every few seconds. */
export function NairobiTime({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
    const set = () => {
      if (ref.current) ref.current.textContent = fmt.format(new Date());
    };
    set();
    const id = window.setInterval(set, 10_000);
    return () => window.clearInterval(id);
  }, []);
  return <span ref={ref} className={className} suppressHydrationWarning>--:--</span>;
}
