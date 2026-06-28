"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a numeric value up when it scrolls into view, preserving any
 *  non-digit prefix/suffix (e.g. "150 000+", "96%"). */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const digits = value.replace(/[^\d]/g, "");
  const target = parseInt(digits || "0", 10);
  const [n, setN] = useState(0);
  const done = useRef(false);

  // split into prefix / suffix around the numeric block
  const matchIndex = value.search(/\d/);
  const prefix = matchIndex >= 0 ? value.slice(0, matchIndex) : "";
  const suffixIndex = value.search(/\d(?=[^\d]*$)/);
  const suffix =
    suffixIndex >= 0 ? value.slice(suffixIndex + 1) : matchIndex < 0 ? value : "";

  useEffect(() => {
    const el = ref.current;
    if (!el || !target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setN(target);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        const dur = 1300;
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setN(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const formatted =
    target >= 1000 ? new Intl.NumberFormat("fr-FR").format(n) : String(n);

  return (
    <span ref={ref}>
      {prefix}
      {target ? formatted : value}
      {target ? suffix : ""}
    </span>
  );
}
