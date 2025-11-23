// useLenisSmoothScroll.jsx
import { useLayoutEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useLenisSmoothScroll() {
  useLayoutEffect(() => {
    // create Lenis instance
    const lenis = new Lenis({
      duration: 1.2,      // overall smoothness (higher = smoother / slower)
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.1,          // interpolation factor; lower = more easing
      wheelMultiplier: 0.9,
    });

    // update ScrollTrigger on Lenis scroll
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // drive Lenis with requestAnimationFrame
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}
