// src/transitions/HomepageSectionBySectionScroll.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

import Hero from "../sections/Hero";
import Testimonials from "../sections/Testimonials";
import CurveDivider from "../components/CurveDivider";

import InteractiveRegenerationExternal from "../sections/InteractiveRegenerationExternal";
import ClaridaDifferenceExternal from "../sections/ClaridaDifferenceExternal";

function TransitionArc({ t }) {
  const prefersReducedMotion = useReducedMotion();
  const arcY = prefersReducedMotion ? 0 : useTransform(t, [0, 1], [750, -550]);
  const arcOpacity = prefersReducedMotion
    ? 0
    : useTransform(t, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ opacity: arcOpacity, y: arcY }}
      className="
        pointer-events-none
        absolute left-1/2 -translate-x-1/2
        bottom-[-5vh] md:bottom-[-6vh] lg:bottom-[-5vh]
        w-screen z-50
      "
    >
      <CurveDivider />
    </motion.div>
  );
}

export default function HomepageSectionBySectionScroll() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // 🔧 lengths (vh)
  const VH = useMemo(
    () => ({
      HERO_HOLD: 140,
      HERO_TO_INTER: 90,

      INTER_HOLD: 420,
      INTER_TO_TEST: 90,

      TEST_HOLD: 170,
      TEST_TO_DIFF: 90,

      DIFF_HOLD: 220,
    }),
    []
  );

  const TOTAL_VH =
    VH.HERO_HOLD +
    VH.HERO_TO_INTER +
    VH.INTER_HOLD +
    VH.INTER_TO_TEST +
    VH.TEST_HOLD +
    VH.TEST_TO_DIFF +
    VH.DIFF_HOLD;

  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // fixed pin
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

  // bounds
  const bounds = useMemo(() => {
    let acc = 0;
    const toP = (vh) => vh / TOTAL_VH;
    const seg = (lenVh) => {
      const start = acc;
      acc += toP(lenVh);
      return { start, end: acc };
    };

    const HERO_HOLD = seg(VH.HERO_HOLD);
    const HERO_TO_INTER = seg(VH.HERO_TO_INTER);
    const INTER_HOLD = seg(VH.INTER_HOLD);
    const INTER_TO_TEST = seg(VH.INTER_TO_TEST);
    const TEST_HOLD = seg(VH.TEST_HOLD);
    const TEST_TO_DIFF = seg(VH.TEST_TO_DIFF);
    const DIFF_HOLD = seg(VH.DIFF_HOLD);

    return { HERO_HOLD, HERO_TO_INTER, INTER_HOLD, INTER_TO_TEST, TEST_HOLD, TEST_TO_DIFF, DIFF_HOLD };
  }, [TOTAL_VH, VH]);

  // transitions
  const heroToInterT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.HERO_TO_INTER.start, bounds.HERO_TO_INTER.end], [0, 1], { clamp: true });

  const interToTestT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.INTER_TO_TEST.start, bounds.INTER_TO_TEST.end], [0, 1], { clamp: true });

  const testToDiffT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.TEST_TO_DIFF.start, bounds.TEST_TO_DIFF.end], [0, 1], { clamp: true });

  // ✅ FIX: Interactive progress spans fade-in + hold (so it moves while appearing)
  const interProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.HERO_TO_INTER.start, bounds.INTER_HOLD.end], [0, 1], { clamp: true });

  // Difference progress can span fade-in + hold
  const diffProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.TEST_TO_DIFF.start, bounds.DIFF_HOLD.end], [0, 1], { clamp: true });

  // opacity envelopes
  const heroOpacity = prefersReducedMotion
    ? 1
    : useTransform(scrollYProgress, [bounds.HERO_HOLD.start, bounds.HERO_HOLD.end, bounds.HERO_TO_INTER.end], [1, 1, 0], {
        clamp: true,
      });

  const interOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.HERO_TO_INTER.start, bounds.HERO_TO_INTER.end, bounds.INTER_HOLD.end, bounds.INTER_TO_TEST.end],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const testOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.INTER_TO_TEST.start, bounds.INTER_TO_TEST.end, bounds.TEST_HOLD.end, bounds.TEST_TO_DIFF.end],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const diffOpacity = prefersReducedMotion
    ? 1
    : useTransform(scrollYProgress, [bounds.TEST_TO_DIFF.start, bounds.TEST_TO_DIFF.end, bounds.DIFF_HOLD.end], [0, 1, 1], {
        clamp: true,
      });

  // pointer events
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < bounds.HERO_TO_INTER.end) setActiveIndex(0);
    else if (p < bounds.INTER_TO_TEST.end) setActiveIndex(1);
    else if (p < bounds.TEST_TO_DIFF.end) setActiveIndex(2);
    else setActiveIndex(3);
  });

  return (
    <section ref={sectionRef} className="relative isolate bg-black" style={{ height: `${TOTAL_VH}vh` }}>
      <div style={viewportStyle} className="overflow-hidden bg-black">
        <motion.div
          style={{ opacity: heroOpacity, pointerEvents: activeIndex === 0 ? "auto" : "none" }}
          className="absolute inset-0 z-10"
        >
          <Hero />
        </motion.div>

        <motion.div
          style={{ opacity: interOpacity, pointerEvents: activeIndex === 1 ? "auto" : "none" }}
          className="absolute inset-0 z-20"
        >
          <InteractiveRegenerationExternal progress={interProgress} active={activeIndex === 1} />
        </motion.div>

        <motion.div
          style={{ opacity: testOpacity, pointerEvents: activeIndex === 2 ? "auto" : "none" }}
          className="absolute inset-0 z-30"
        >
          <Testimonials />
        </motion.div>

        <motion.div
          style={{ opacity: diffOpacity, pointerEvents: activeIndex === 3 ? "auto" : "none" }}
          className="absolute inset-0 z-40"
        >
          <ClaridaDifferenceExternal progress={diffProgress} />
        </motion.div>

        <TransitionArc t={heroToInterT} />
        <TransitionArc t={interToTestT} />
        <TransitionArc t={testToDiffT} />
      </div>
    </section>
  );
}
