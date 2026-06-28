"use client";

import { useEffect } from "react";

/** Mounted once in the layout. Reveals any [data-reveal] element when it
 *  scrolls into view — including nodes added on client-side navigation. */
export default function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !("IntersectionObserver" in window)) {
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const observeAll = (root: ParentNode) =>
      root.querySelectorAll?.("[data-reveal]:not(.is-visible)").forEach((el) => {
        // already on screen at mount → reveal next frame (covers hero)
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          requestAnimationFrame(() => el.classList.add("is-visible"));
        } else {
          io.observe(el);
        }
      });

    observeAll(document);

    // catch nodes added during client-side navigation
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) observeAll(n as Element);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
