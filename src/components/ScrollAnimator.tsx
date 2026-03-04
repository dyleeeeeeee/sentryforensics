"use client";

import { useEffect } from "react";

export function ScrollAnimator() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".scroll-animate"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add("visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
