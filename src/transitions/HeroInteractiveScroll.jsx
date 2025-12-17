// src/components/HeroInteractiveScroll.jsx
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
import CurveDivider from "../components/CurveDivider";

export default function HeroInteractiveScroll() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // 0 → 1 across the whole 500vh section
  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // ---- FIX 1: Robust "sticky" via fixed pinning (works even if sticky is broken by transforms) ----
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

      // pin from section top until section bottom has scrolled past one viewport
      const start = top;
      const end = top + height - vh;

      setRange({ start, end });
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

  // ---- FIX 2: Make transition happen "on time" by scrubbing from scroll (no threshold jump) ----
  // Adjust these two numbers to move the transition earlier/later inside the section.
  const TRANSITION_START = 0.02;
  const TRANSITION_END = 0.08;

  const t = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [0, 1], {
        clamp: true,
      });

  // pointer events handoff
  const [currentSide, setCurrentSide] = useState(0);
  useMotionValueEvent(t, "change", (v) => {
    setCurrentSide(v < 0.5 ? 0 : 1);
  });
  const heroInteractive = currentSide === 0;

  // Hero fades out
  const heroOpacity = prefersReducedMotion
    ? 1
    : useTransform(t, [0, 0.6, 1], [1, 0.2, 0]);

  // Interactive fades in
  const interactiveOpacity = prefersReducedMotion
    ? 1
    : useTransform(t, [0, 0.35, 1], [0, 0, 1]);

  // Arc motion
  const arcY = prefersReducedMotion ? 0 : useTransform(t, [0, 1], [750, -550]);
  const arcOpacity = prefersReducedMotion
    ? 0
    : useTransform(t, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[500vh]">
      {/* pinned viewport */}
      <div style={viewportStyle} className="overflow-hidden">
        {/* BOTTOM LAYER */}
        <motion.div style={{ opacity: interactiveOpacity }} className="absolute inset-0 z-10">
          <InteractiveRegeneration />
        </motion.div>

        {/* TOP LAYER */}
        <motion.div
          style={{
            opacity: heroOpacity,
            pointerEvents: heroInteractive ? "auto" : "none",
          }}
          className="absolute inset-0 z-20"
        >
          <Hero />
        </motion.div>

        {/* ARC */}
        <motion.div
          style={{ opacity: arcOpacity, y: arcY }}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-5vh] w-screen z-30"
        >
          <CurveDivider />
        </motion.div>
      </div>
    </section>
  );
}
