// src/transitions/SecondPageSectionBySectionScroll.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

import CurveDivider from "../components/CurveDivider";

import ClaridaScrollStore from "../sections/ClaridaScrollStore";
import LifestyleVisionExternal from "../sections/LifestyleVisionExternal";
import Footer from "../sections/Footer";
import ScientificInnovationExternal from "../sections/ScientificInnovationExternal";

function TransitionArc({ t }) {
  const prefersReducedMotion = useReducedMotion();
  const arcY = prefersReducedMotion ? 0 : useTransform(t, [0, 1], [750, -550]);
  const arcOpacity = prefersReducedMotion
    ? 0
    : useTransform(t, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      // ✅ hard force no pointer capture (even if children try to re-enable)
      style={{ opacity: arcOpacity, y: arcY, pointerEvents: "none" }}
      className="
        absolute left-1/2 -translate-x-1/2
        bottom-[-5vh] md:bottom-[-6vh] lg:bottom-[-5vh]
        w-screen z-30
      "
      aria-hidden="true"
    >
      <CurveDivider />
    </motion.div>
  );
}

export default function SecondPageSectionBySectionScroll() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const VH = useMemo(
    () => ({
      SCI_HOLD: 25,
      SCI_TO_STORE: 75,

      STORE_HOLD: 45,
      STORE_TO_LIFE: 75,

      LIFE_HOLD: 290,
      LIFE_TO_FOOTER: 75,

      FOOTER_HOLD: 100,
    }),
    []
  );

  const TOTAL_VH =
    VH.SCI_HOLD +
    VH.SCI_TO_STORE +
    VH.STORE_HOLD +
    VH.STORE_TO_LIFE +
    VH.LIFE_HOLD +
    VH.LIFE_TO_FOOTER +
    VH.FOOTER_HOLD;

  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

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

  const bounds = useMemo(() => {
    let acc = 0;
    const toP = (vh) => vh / TOTAL_VH;
    const seg = (lenVh) => {
      const start = acc;
      acc += toP(lenVh);
      return { start, end: acc };
    };

    const SCI_HOLD = seg(VH.SCI_HOLD);
    const SCI_TO_STORE = seg(VH.SCI_TO_STORE);

    const STORE_HOLD = seg(VH.STORE_HOLD);
    const STORE_TO_LIFE = seg(VH.STORE_TO_LIFE);

    const LIFE_HOLD = seg(VH.LIFE_HOLD);
    const LIFE_TO_FOOTER = seg(VH.LIFE_TO_FOOTER);

    const FOOTER_HOLD = seg(VH.FOOTER_HOLD);

    return {
      SCI_HOLD,
      SCI_TO_STORE,
      STORE_HOLD,
      STORE_TO_LIFE,
      LIFE_HOLD,
      LIFE_TO_FOOTER,
      FOOTER_HOLD,
    };
  }, [TOTAL_VH, VH]);

  const sciToStoreT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.SCI_TO_STORE.start, bounds.SCI_TO_STORE.end], [0, 1], {
        clamp: true,
      });

  const storeToLifeT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.STORE_TO_LIFE.start, bounds.STORE_TO_LIFE.end], [0, 1], {
        clamp: true,
      });

  const lifeToFooterT = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.LIFE_TO_FOOTER.start, bounds.LIFE_TO_FOOTER.end], [0, 1], {
        clamp: true,
      });

  const lifeProgress = prefersReducedMotion
    ? 0
    : useTransform(scrollYProgress, [bounds.STORE_TO_LIFE.start, bounds.LIFE_HOLD.end], [0, 1], {
        clamp: true,
      });

  const sciOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.SCI_HOLD.start, bounds.SCI_HOLD.end, bounds.SCI_TO_STORE.end],
        [1, 1, 0],
        { clamp: true }
      );

  const storeOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.SCI_TO_STORE.start, bounds.SCI_TO_STORE.end, bounds.STORE_HOLD.end, bounds.STORE_TO_LIFE.end],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const lifeOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.STORE_TO_LIFE.start, bounds.STORE_TO_LIFE.end, bounds.LIFE_HOLD.end, bounds.LIFE_TO_FOOTER.end],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const footerOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.LIFE_TO_FOOTER.start, bounds.LIFE_TO_FOOTER.end, bounds.FOOTER_HOLD.end],
        [0, 1, 1],
        { clamp: true }
      );

  // ✅ FIX: switch actives using TRANSITION STARTS (not ENDS)
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < bounds.SCI_TO_STORE.start) setActiveIndex(0);
    else if (p < bounds.STORE_TO_LIFE.start) setActiveIndex(1);
    else if (p < bounds.LIFE_TO_FOOTER.start) setActiveIndex(2);
    else setActiveIndex(3);
  });

  return (
    <section ref={sectionRef} className="relative isolate bg-black" style={{ height: `${TOTAL_VH}vh` }}>
      <div style={viewportStyle} className="overflow-hidden bg-black">
        <motion.div
          style={{ opacity: sciOpacity, pointerEvents: activeIndex === 0 ? "auto" : "none" }}
          className="absolute inset-0 z-10"
        >
          <ScientificInnovationExternal active={activeIndex === 0} />
        </motion.div>

        <motion.div
          style={{ opacity: storeOpacity, pointerEvents: activeIndex === 1 ? "auto" : "none" }}
          className="absolute inset-0 z-20"
        >
          <ClaridaScrollStore active={activeIndex === 1} />
        </motion.div>

        <motion.div
          style={{ opacity: lifeOpacity, pointerEvents: activeIndex === 2 ? "auto" : "none" }}
          className="absolute inset-0 z-30"
        >
          <LifestyleVisionExternal progress={lifeProgress} active={activeIndex === 2} />
        </motion.div>

        {/* ✅ FIX: use inline zIndex (don’t rely on z-999) */}
        <motion.div
          style={{ opacity: footerOpacity, pointerEvents: activeIndex === 3 ? "auto" : "none", zIndex: 60 }}
          className="absolute inset-0"
        >
          <Footer />
        </motion.div>

        <TransitionArc t={sciToStoreT} />
        <TransitionArc t={storeToLifeT} />
        <TransitionArc t={lifeToFooterT} />
      </div>
    </section>
  );
}
