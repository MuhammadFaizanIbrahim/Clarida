import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";

import Testimonials from "../sections/Testimonials";
import ClaridaDifference from "../sections/ClaridaDifference";
import CurveDivider from "../components/CurveDivider";

export default function TestimonialsClaridaDifferenceScroll() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // 0 → 1 across the whole block height
  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // ---- Robust "sticky" via fixed pinning ----
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

  // ---- Transition scrub window (t = 0 -> 1) ----
  // Tune these like you did before.
  const TRANSITION_START = 0.02;
  const TRANSITION_END = 0.08;

  const t = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [0, 1], {
        clamp: true,
      });

  // pointer-events handoff
  const [currentSide, setCurrentSide] = useState(0); // 0=testimonials, 1=difference
  useMotionValueEvent(t, "change", (v) => {
    setCurrentSide(v < 0.5 ? 0 : 1);
  });

  const isTestimonialsActive = currentSide === 0;

  // Testimonials fades out
  const testimonialsOpacity = prefersReducedMotion
    ? 1
    : useTransform(t, [0, 0.6, 1], [1, 0.2, 0]);

  // ClaridaDifference fades in
  const differenceOpacity = prefersReducedMotion
    ? 1
    : useTransform(t, [0, 0.35, 1], [0, 0, 1]);

  // Arc motion
  const arcY = prefersReducedMotion ? 0 : useTransform(t, [0, 1], [750, -550]);
  const arcOpacity = prefersReducedMotion
    ? 0
    : useTransform(t, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[250vh]">
      <div style={viewportStyle} className="overflow-hidden">
        {/* BOTTOM LAYER: ClaridaDifference */}
        <motion.div
          style={{
            opacity: differenceOpacity,
            pointerEvents: isTestimonialsActive ? "none" : "auto",
          }}
          className="absolute inset-0 z-10"
        >
          <ClaridaDifference />
        </motion.div>

        {/* TOP LAYER: Testimonials */}
        <motion.div
          style={{
            opacity: testimonialsOpacity,
            pointerEvents: isTestimonialsActive ? "auto" : "none",
          }}
          className="absolute inset-0 z-20"
        >
          <Testimonials />
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
