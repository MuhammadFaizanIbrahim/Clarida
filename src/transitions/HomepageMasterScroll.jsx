import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";

import HeroInteractiveScroll from "../transitions/HeroInteractiveScroll";
import ClaridaDifferenceTestimonialsScroll from "../transitions/ClaridaDifferenceTestimonialsScroll";

import Testimonials from "../sections/Testimonials";
import CurveDivider from "../components/CurveDivider";

/**
 * Bridge between:
 * - end-look of HeroInteractiveScroll (InteractiveRegeneration last frame poster)
 * - start of next combined block (Testimonials)
 *
 * IMPORTANT: We do NOT mount HeroInteractiveScroll or ClaridaDifferenceTestimonialsScroll inside
 * the bridge (nested scroll sections break). This bridge is only a visual crossover.
 */
function HeroToClaridaBridge() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // ---- robust pin system (same as your working approach) ----
  const [pinMode, setPinMode] = useState("before");
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

  // ---- scrub window for the crossover ----
  const TRANSITION_START = 0.05;
  const TRANSITION_END = 0.35;

  const t = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [0, 1], {
        clamp: true,
      });

  const [isStartSide, setIsStartSide] = useState(true);
  useMotionValueEvent(t, "change", (v) => setIsStartSide(v < 0.5));

  const outOpacity = prefersReducedMotion
    ? 1
    : useTransform(t, [0, 0.6, 1], [1, 0.2, 0]);

  const inOpacity = prefersReducedMotion
    ? 1
    : useTransform(t, [0, 0.35, 1], [0, 0, 1]);

  const arcY = prefersReducedMotion ? 0 : useTransform(t, [0, 1], [750, -550]);
  const arcOpacity = prefersReducedMotion
    ? 0
    : useTransform(t, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[220vh] isolate bg-black">
      <div style={viewportStyle} className="overflow-hidden bg-black">
        {/* BOTTOM: next block begins with Testimonials */}
        <motion.div
          style={{
            opacity: inOpacity,
            pointerEvents: isStartSide ? "none" : "auto",
          }}
          className="absolute inset-0 z-10"
        >
          <Testimonials />
        </motion.div>

        {/* TOP: end-look of HeroInteractiveScroll (poster frame) */}
        <motion.div
          style={{
            opacity: outOpacity,
            pointerEvents: isStartSide ? "auto" : "none",
          }}
          className="absolute inset-0 z-20"
        >
          <div
            className="absolute inset-0"
            style={{
              // Change this if your last frame differs
              backgroundImage: "url(/frames/InteractiveRegeneration2/frame_00194.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
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

/**
 * ✅ This is the ONE component you will use in Homepage.
 */
export default function HomepageMasterScroll() {
  return (
    <>
      <HeroInteractiveScroll />
      <HeroToClaridaBridge />
      <ClaridaDifferenceTestimonialsScroll />
    </>
  );
}
