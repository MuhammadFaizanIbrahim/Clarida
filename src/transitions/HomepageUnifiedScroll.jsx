import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";

import Hero from "../sections/Hero";
import InteractiveRegeneration from "../sections/InteractiveRegeneration";
import Testimonials from "../sections/Testimonials";
import ClaridaDifference from "../sections/ClaridaDifference";
import CurveDivider from "../components/CurveDivider";

export default function HomepageUnifiedScroll() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // 0 → 1 across the whole combined block
  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // ---- Robust fixed-pin (same pattern you already use) ----
  const [pinMode, setPinMode] = useState("before"); // "before" | "pinned" | "after"
  const [range, setRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = el.offsetHeight;
      const vh = window.innerHeight;

      setRange({ start: top, end: top + height - vh });
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);

    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  useEffect(() => {
    const { start, end } = range;
    if (!start && !end) return;

    const unsub = scrollY.on("change", (y) => {
      if (y < start) setPinMode("before");
      else if (y >= end) setPinMode("after");
      else setPinMode("pinned");
    });

    return () => unsub();
  }, [scrollY, range]);

  const viewportStyle =
    pinMode === "pinned"
      ? { position: "fixed", top: 0, left: 0, width: "100%", height: "100vh" }
      : pinMode === "after"
      ? { position: "absolute", left: 0, bottom: 0, width: "100%", height: "100vh" }
      : { position: "absolute", top: 0, left: 0, width: "100%", height: "100vh" };

  // ------------------------------------------------------------------
  // Timeline windows (0..1). Adjust these to tune where transitions happen.
  // ------------------------------------------------------------------
  // 1) Hero -> Interactive
  const A1 = 0.02;
  const A2 = 0.08;

  // 2) Interactive -> Testimonials  (THIS is the "between the two classes" transition)
  const B1 = 0.52;
  const B2 = 0.60;

  // 3) Testimonials -> ClaridaDifference
  const C1 = 0.72;
  const C2 = 0.80;

  // Helpers for “scrub progress” of each transition
  const tHeroToInteractive = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [A1, A2], [0, 1], { clamp: true });

  const tInteractiveToTestimonials = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [B1, B2], [0, 1], { clamp: true });

  const tTestimonialsToDifference = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [C1, C2], [0, 1], { clamp: true });

  // ---------------- Opacity maps (single-instance layers) ----------------
  // Hero: visible, then fades out during A
  const heroOpacity = prefersReducedMotion
    ? 1
    : useTransform(tHeroToInteractive, [0, 0.6, 1], [1, 0.2, 0]);

  // Interactive: fades in during A, stays, then fades out during B
  const interactiveOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [0, A1, A2, B1, B2, 1],
        [0, 0, 1, 1, 0, 0],
        { clamp: true }
      );

  // Testimonials: fades in during B, stays, then fades out during C
  const testimonialsOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [0, B1, B2, C1, C2, 1],
        [0, 0, 1, 1, 0, 0],
        { clamp: true }
      );

  // Difference: fades in during C and stays
  const differenceOpacity = prefersReducedMotion
    ? 1
    : useTransform(scrollYProgress, [0, C1, C2, 1], [0, 0, 1, 1], {
        clamp: true,
      });

  // ---------------- Arc animation during each transition ----------------
  // We “show” the arc only around A, B, C. Between them opacity is 0, so Y jumps are invisible.
  const arcOpacity = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [
          // A fade-in/out
          A1, A1 + 0.01, A2 - 0.01, A2,
          // gap
          B1 - 0.02,
          // B fade-in/out
          B1, B1 + 0.01, B2 - 0.01, B2,
          // gap
          C1 - 0.02,
          // C fade-in/out
          C1, C1 + 0.01, C2 - 0.01, C2,
          // end
          1,
        ],
        [
          0, 1, 1, 0,
          0,
          0, 1, 1, 0,
          0,
          0, 1, 1, 0,
          0,
        ],
        { clamp: true }
      );

  const arcY = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [
          // A: move 750 -> -550
          A1, A2,
          // hide period baseline
          B1 - 0.02,
          // B: move 750 -> -550
          B1, B2,
          // hide baseline
          C1 - 0.02,
          // C: move 750 -> -550
          C1, C2,
          // rest
          1,
        ],
        [
          750, -550,
          750,
          750, -550,
          750,
          750, -550,
          750,
        ],
        { clamp: true }
      );

  // ---------------- Pointer-events handoff ----------------
  const [activeLayer, setActiveLayer] = useState("hero"); // hero | interactive | testimonials | difference
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // choose which layer should receive input
    if (p < A2) setActiveLayer("hero");
    else if (p < B2) setActiveLayer("interactive");
    else if (p < C2) setActiveLayer("testimonials");
    else setActiveLayer("difference");
  });

  return (
    // Pick a total scroll length for the whole experience.
    // If you want more time inside InteractiveRegeneration, increase this height.
    <section ref={sectionRef} className="relative h-[900vh] isolate bg-black">
      <div style={viewportStyle} className="overflow-hidden bg-black">
        {/* Difference (bottom-most) */}
        <motion.div
          style={{
            opacity: differenceOpacity,
            pointerEvents: activeLayer === "difference" ? "auto" : "none",
          }}
          className="absolute inset-0 z-10"
        >
          <ClaridaDifference />
        </motion.div>

        {/* Testimonials */}
        <motion.div
          style={{
            opacity: testimonialsOpacity,
            pointerEvents: activeLayer === "testimonials" ? "auto" : "none",
          }}
          className="absolute inset-0 z-20"
        >
          <Testimonials />
        </motion.div>

        {/* InteractiveRegeneration */}
        <motion.div
          style={{
            opacity: interactiveOpacity,
            pointerEvents: activeLayer === "interactive" ? "auto" : "none",
          }}
          className="absolute inset-0 z-30"
        >
          <InteractiveRegeneration />
        </motion.div>

        {/* Hero (top-most early) */}
        <motion.div
          style={{
            opacity: heroOpacity,
            pointerEvents: activeLayer === "hero" ? "auto" : "none",
          }}
          className="absolute inset-0 z-40"
        >
          <Hero />
        </motion.div>

        {/* Arc */}
        <motion.div
          style={{ opacity: arcOpacity, y: arcY }}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-5vh] w-screen z-50"
        >
          <CurveDivider />
        </motion.div>
      </div>
    </section>
  );
}
