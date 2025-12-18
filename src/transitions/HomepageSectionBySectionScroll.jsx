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

import RegenerationTimelineExternal from "../sections/RegenerationTimelineExternal";
import ActivationTimelineExternal from "../sections/ActivationTimelineExternal";
import VisionaryGuaranteeExternal from "../sections/VisionaryGuaranteeExternal";
import GlobalCommunityImpactExternal from "../sections/GlobalCommunityImpactExternal";
import Footer from "../sections/Footer";

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
      HERO_HOLD: 25,
      HERO_TO_INTER: 75,

      INTER_HOLD: 420,
      INTER_TO_TEST: 75,

      TEST_HOLD: 25,
      TEST_TO_DIFF: 75,

      DIFF_HOLD: 220,
      DIFF_TO_REGEN: 75,

      REGEN_HOLD: 460,
      REGEN_TO_ACT: 75,

      ACT_HOLD: 340,
      ACT_TO_GUAR: 75,

      GUAR_HOLD: 340,
      GUAR_TO_IMPACT: 75,

      IMPACT_HOLD: 240,
      IMPACT_TO_FOOTER: 75,

      FOOTER_HOLD: 100,
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
    VH.DIFF_HOLD +
    VH.DIFF_TO_REGEN +
    VH.REGEN_HOLD +
    VH.REGEN_TO_ACT +
    VH.ACT_HOLD +
    VH.ACT_TO_GUAR +
    VH.GUAR_HOLD +
    VH.GUAR_TO_IMPACT +
    VH.IMPACT_HOLD +
    VH.IMPACT_TO_FOOTER +
    VH.FOOTER_HOLD;

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

    const DIFF_TO_REGEN = seg(VH.DIFF_TO_REGEN);
    const REGEN_HOLD = seg(VH.REGEN_HOLD);
    const REGEN_TO_ACT = seg(VH.REGEN_TO_ACT);
    const ACT_HOLD = seg(VH.ACT_HOLD);
    const ACT_TO_GUAR = seg(VH.ACT_TO_GUAR);
    const GUAR_HOLD = seg(VH.GUAR_HOLD);
    const GUAR_TO_IMPACT = seg(VH.GUAR_TO_IMPACT);
    const IMPACT_HOLD = seg(VH.IMPACT_HOLD);
    const IMPACT_TO_FOOTER = seg(VH.IMPACT_TO_FOOTER);
    const FOOTER_HOLD = seg(VH.FOOTER_HOLD);

    return {
      HERO_HOLD,
      HERO_TO_INTER,
      INTER_HOLD,
      INTER_TO_TEST,
      TEST_HOLD,
      TEST_TO_DIFF,
      DIFF_HOLD,
      DIFF_TO_REGEN,
      REGEN_HOLD,
      REGEN_TO_ACT,
      ACT_HOLD,
      ACT_TO_GUAR,
      GUAR_HOLD,
      GUAR_TO_IMPACT,
      IMPACT_HOLD,
      IMPACT_TO_FOOTER,
      FOOTER_HOLD,
    };
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

  const diffToRegenT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.DIFF_TO_REGEN.start, bounds.DIFF_TO_REGEN.end], [0, 1], { clamp: true });

  const regenToActT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.REGEN_TO_ACT.start, bounds.REGEN_TO_ACT.end], [0, 1], { clamp: true });

  const actToGuarT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.ACT_TO_GUAR.start, bounds.ACT_TO_GUAR.end], [0, 1], { clamp: true });

  const guarToImpactT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.GUAR_TO_IMPACT.start, bounds.GUAR_TO_IMPACT.end], [0, 1], { clamp: true });

  const impactToFooterT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.IMPACT_TO_FOOTER.start, bounds.IMPACT_TO_FOOTER.end], [0, 1], { clamp: true });

  // progress for scrubbed sections
  const interProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.HERO_TO_INTER.start, bounds.INTER_HOLD.end], [0, 1], { clamp: true });

  const diffProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.TEST_TO_DIFF.start, bounds.DIFF_HOLD.end], [0, 1], { clamp: true });

  const regenProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.DIFF_TO_REGEN.start, bounds.REGEN_HOLD.end], [0, 1], { clamp: true });

  const actProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.REGEN_TO_ACT.start, bounds.ACT_HOLD.end], [0, 1], { clamp: true });

  const guarProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.ACT_TO_GUAR.start, bounds.GUAR_HOLD.end], [0, 1], { clamp: true });

  const impactProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.GUAR_TO_IMPACT.start, bounds.IMPACT_HOLD.end], [0, 1], { clamp: true });

  // opacity envelopes
  const heroOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.HERO_HOLD.start, bounds.HERO_HOLD.end, bounds.HERO_TO_INTER.end], [1, 1, 0], { clamp: true });

  const interOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.HERO_TO_INTER.start, bounds.HERO_TO_INTER.end, bounds.INTER_HOLD.end, bounds.INTER_TO_TEST.end], [0, 1, 1, 0], { clamp: true });

  const testOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.INTER_TO_TEST.start, bounds.INTER_TO_TEST.end, bounds.TEST_HOLD.end, bounds.TEST_TO_DIFF.end], [0, 1, 1, 0], { clamp: true });

  const diffOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.TEST_TO_DIFF.start, bounds.TEST_TO_DIFF.end, bounds.DIFF_HOLD.end, bounds.DIFF_TO_REGEN.end], [0, 1, 1, 0], { clamp: true });

  const regenOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.DIFF_TO_REGEN.start, bounds.DIFF_TO_REGEN.end, bounds.REGEN_HOLD.end, bounds.REGEN_TO_ACT.end], [0, 1, 1, 0], { clamp: true });

  const actOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.REGEN_TO_ACT.start, bounds.REGEN_TO_ACT.end, bounds.ACT_HOLD.end, bounds.ACT_TO_GUAR.end], [0, 1, 1, 0], { clamp: true });

  const guarOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.ACT_TO_GUAR.start, bounds.ACT_TO_GUAR.end, bounds.GUAR_HOLD.end, bounds.GUAR_TO_IMPACT.end], [0, 1, 1, 0], { clamp: true });

  const impactOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.GUAR_TO_IMPACT.start, bounds.GUAR_TO_IMPACT.end, bounds.IMPACT_HOLD.end, bounds.IMPACT_TO_FOOTER.end], [0, 1, 1, 0], { clamp: true });

  const footerOpacity = prefersReducedMotion ? 1 :
    useTransform(scrollYProgress, [bounds.IMPACT_TO_FOOTER.start, bounds.IMPACT_TO_FOOTER.end, bounds.FOOTER_HOLD.end], [0, 1, 1], { clamp: true });

  // pointer events
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < bounds.HERO_TO_INTER.end) setActiveIndex(0);
    else if (p < bounds.INTER_TO_TEST.end) setActiveIndex(1);
    else if (p < bounds.TEST_TO_DIFF.end) setActiveIndex(2);
    else if (p < bounds.DIFF_TO_REGEN.end) setActiveIndex(3);
    else if (p < bounds.REGEN_TO_ACT.end) setActiveIndex(4);
    else if (p < bounds.ACT_TO_GUAR.end) setActiveIndex(5);
    else if (p < bounds.GUAR_TO_IMPACT.end) setActiveIndex(6);
    else if (p < bounds.IMPACT_TO_FOOTER.end) setActiveIndex(7);
    else setActiveIndex(8);
  });

  return (
    <section ref={sectionRef} className="relative isolate bg-black" style={{ height: `${TOTAL_VH}vh` }}>
      <div style={viewportStyle} className="overflow-hidden bg-black">

        <motion.div style={{ opacity: heroOpacity, pointerEvents: activeIndex === 0 ? "auto" : "none" }} className="absolute inset-0 z-10">
          <Hero />
        </motion.div>

        <motion.div style={{ opacity: interOpacity, pointerEvents: activeIndex === 1 ? "auto" : "none" }} className="absolute inset-0 z-20">
          <InteractiveRegenerationExternal progress={interProgress} active={activeIndex === 1} />
        </motion.div>

        <motion.div style={{ opacity: testOpacity, pointerEvents: activeIndex === 2 ? "auto" : "none" }} className="absolute inset-0 z-30">
          <Testimonials />
        </motion.div>

        <motion.div style={{ opacity: diffOpacity, pointerEvents: activeIndex === 3 ? "auto" : "none" }} className="absolute inset-0 z-40">
          <ClaridaDifferenceExternal progress={diffProgress} />
        </motion.div>

        <motion.div style={{ opacity: regenOpacity, pointerEvents: activeIndex === 4 ? "auto" : "none" }} className="absolute inset-0 z-[45]">
          <RegenerationTimelineExternal progress={regenProgress} active={activeIndex === 4} />
        </motion.div>

        <motion.div style={{ opacity: actOpacity, pointerEvents: activeIndex === 5 ? "auto" : "none" }} className="absolute inset-0 z-[46]">
        <ActivationTimelineExternal progress={actProgress} active={activeIndex === 5} />
        </motion.div>

        <motion.div style={{ opacity: guarOpacity, pointerEvents: activeIndex === 6 ? "auto" : "none" }} className="absolute inset-0 z-[47]">
          <VisionaryGuaranteeExternal progress={guarProgress} />
        </motion.div>

        <motion.div style={{ opacity: impactOpacity, pointerEvents: activeIndex === 7 ? "auto" : "none" }} className="absolute inset-0 z-[48]">
          <GlobalCommunityImpactExternal progress={impactProgress} />
        </motion.div>

        <motion.div style={{ opacity: footerOpacity, pointerEvents: activeIndex === 8 ? "auto" : "none" }} className="absolute inset-0 z-[49]">
          <Footer />
        </motion.div>

        <TransitionArc t={heroToInterT} />
        <TransitionArc t={interToTestT} />
        <TransitionArc t={testToDiffT} />
        <TransitionArc t={diffToRegenT} />
        <TransitionArc t={regenToActT} />
        <TransitionArc t={actToGuarT} />
        <TransitionArc t={guarToImpactT} />
        <TransitionArc t={impactToFooterT} />

      </div>
    </section>
  );
}
