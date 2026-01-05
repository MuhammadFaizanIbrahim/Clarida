// src/transitions/HomepageSectionBySectionScroll.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";

import Hero from "../sections/Hero";
import CurveDivider from "../components/CurveDivider";

// ✅ Lazy-load heavy sections so they don't load until needed
const Testimonials = lazy(() => import("../sections/Testimonials"));

const InteractiveRegenerationExternal = lazy(() =>
  import("../sections/InteractiveRegenerationExternal")
);
const ClaridaDifferenceExternal = lazy(() =>
  import("../sections/ClaridaDifferenceExternal")
);

const RegenerationTimelineExternal = lazy(() =>
  import("../sections/RegenerationTimelineExternal")
);
const ActivationTimelineExternal = lazy(() =>
  import("../sections/ActivationTimelineExternal")
);
const VisionaryGuaranteeExternal = lazy(() =>
  import("../sections/VisionaryGuaranteeExternal")
);
const GlobalCommunityImpactExternal = lazy(() =>
  import("../sections/GlobalCommunityImpactExternal")
);
const Footer = lazy(() => import("../sections/Footer"));

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
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // 🔧 lengths (vh)
  const VH = useMemo(
    () => ({
      HERO_HOLD: 25,
      HERO_TO_INTER: 75,

      INTER_HOLD: 550,
      INTER_TO_TEST: 75,

      TEST_HOLD: 45,
      TEST_TO_DIFF: 75,

      DIFF_HOLD: 220,
      DIFF_TO_REGEN: 75,

      REGEN_HOLD: 1250,
      REGEN_TO_ACT: 75,

      ACT_HOLD: 420,
      ACT_TO_GUAR: 75,

      GUAR_HOLD: 570,
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
      ? {
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "100vh",
        }
      : {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
        };

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
    : useTransform(
        scrollYProgress,
        [bounds.HERO_TO_INTER.start, bounds.HERO_TO_INTER.end],
        [0, 1],
        { clamp: true }
      );

  const interToTestT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.INTER_TO_TEST.start, bounds.INTER_TO_TEST.end],
        [0, 1],
        { clamp: true }
      );

  const testToDiffT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.TEST_TO_DIFF.start, bounds.TEST_TO_DIFF.end],
        [0, 1],
        { clamp: true }
      );

  const diffToRegenT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.DIFF_TO_REGEN.start, bounds.DIFF_TO_REGEN.end],
        [0, 1],
        { clamp: true }
      );

  const regenToActT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.REGEN_TO_ACT.start, bounds.REGEN_TO_ACT.end],
        [0, 1],
        { clamp: true }
      );

  const actToGuarT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.ACT_TO_GUAR.start, bounds.ACT_TO_GUAR.end],
        [0, 1],
        { clamp: true }
      );

  const guarToImpactT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.GUAR_TO_IMPACT.start, bounds.GUAR_TO_IMPACT.end],
        [0, 1],
        { clamp: true }
      );

  const impactToFooterT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.IMPACT_TO_FOOTER.start, bounds.IMPACT_TO_FOOTER.end],
        [0, 1],
        { clamp: true }
      );

  // progress for scrubbed sections
  const interProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.HERO_TO_INTER.start, bounds.INTER_HOLD.end],
        [0, 1],
        { clamp: true }
      );

  const diffProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.TEST_TO_DIFF.start, bounds.DIFF_HOLD.end],
        [0, 1],
        { clamp: true }
      );

  const regenProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.DIFF_TO_REGEN.start, bounds.REGEN_HOLD.end],
        [0, 1],
        { clamp: true }
      );

  const actProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.REGEN_TO_ACT.start, bounds.ACT_HOLD.end],
        [0, 1],
        { clamp: true }
      );

  const guarProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.ACT_TO_GUAR.start, bounds.GUAR_HOLD.end],
        [0, 1],
        { clamp: true }
      );

  const impactProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.GUAR_TO_IMPACT.start, bounds.IMPACT_HOLD.end],
        [0, 1],
        { clamp: true }
      );

  // opacity envelopes
  const heroOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [bounds.HERO_HOLD.start, bounds.HERO_HOLD.end, bounds.HERO_TO_INTER.end],
        [1, 1, 0],
        { clamp: true }
      );

  const interOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.HERO_TO_INTER.start,
          bounds.HERO_TO_INTER.end,
          bounds.INTER_HOLD.end,
          bounds.INTER_TO_TEST.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const testOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.INTER_TO_TEST.start,
          bounds.INTER_TO_TEST.end,
          bounds.TEST_HOLD.end,
          bounds.TEST_TO_DIFF.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const diffOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.TEST_TO_DIFF.start,
          bounds.TEST_TO_DIFF.end,
          bounds.DIFF_HOLD.end,
          bounds.DIFF_TO_REGEN.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const regenOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.DIFF_TO_REGEN.start,
          bounds.DIFF_TO_REGEN.end,
          bounds.REGEN_HOLD.end,
          bounds.REGEN_TO_ACT.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const actOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.REGEN_TO_ACT.start,
          bounds.REGEN_TO_ACT.end,
          bounds.ACT_HOLD.end,
          bounds.ACT_TO_GUAR.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const guarOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.ACT_TO_GUAR.start,
          bounds.ACT_TO_GUAR.end,
          bounds.GUAR_HOLD.end,
          bounds.GUAR_TO_IMPACT.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const impactOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.GUAR_TO_IMPACT.start,
          bounds.GUAR_TO_IMPACT.end,
          bounds.IMPACT_HOLD.end,
          bounds.IMPACT_TO_FOOTER.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const footerOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.IMPACT_TO_FOOTER.start,
          bounds.IMPACT_TO_FOOTER.end,
          bounds.FOOTER_HOLD.end,
        ],
        [0, 1, 1],
        { clamp: true }
      );

  // ✅ Keep exactly 2 mounted based on progress region (no direction needed)
  const [renderPair, setRenderPair] = useState([0, 1]);
  const renderPairRef = useRef([0, 1]);

  // ✅ NEW: keep already-mounted sections mounted forever
  const [mountedSet, setMountedSet] = useState(() => new Set([0, 1]));
  const mountedSetRef = useRef(new Set([0, 1]));
  const addMounted = (a, b) => {
    setMountedSet((prev) => {
      const next = new Set(prev);
      next.add(a);
      next.add(b);
      mountedSetRef.current = next;
      return next;
    });
  };

  // ✅ NEW: jump-to-footer lock (prevents renderPair from changing during the jump animation)
  const jumpingRef = useRef(false);
  const jumpTimeoutRef = useRef(null);

  // ✅ NEW: listen for header button event, jump to last transition and play arc into footer
  useEffect(() => {
    const scrollToY = (y, opts) => {
      if (window.lenis && typeof window.lenis.scrollTo === "function") {
        window.lenis.scrollTo(y, opts);
      } else {
        window.scrollTo({
          top: y,
          left: 0,
          behavior: opts?.immediate ? "auto" : "smooth",
        });
      }
    };

    const onJumpFooter = () => {
      const { start, end } = range;
      if (!start && !end) return;

      const dist = end - start;

      // force last pair mounted so we don't flash other sections
      jumpingRef.current = true;
      const lastPair = [7, 8];
      renderPairRef.current = lastPair;
      setRenderPair(lastPair);

      // ✅ NEW: also keep them mounted permanently
      addMounted(7, 8);

      // ✅ IMPORTANT:
      // Start a tiny bit BEFORE the transition (still on Impact),
      // then animate to a bit AFTER the transition (inside Footer hold).
      const eps = 0.001; // small normalized offset to avoid boundary equality issues

      const pStart = Math.max(0, bounds.IMPACT_TO_FOOTER.start - eps);
      const pEnd = Math.min(1, bounds.IMPACT_TO_FOOTER.end + 0.06); // go INTO footer hold

      const yStart = start + pStart * dist;
      const yEnd = Math.min(end - 2, start + pEnd * dist); // clamp inside range

      scrollToY(yStart, { immediate: true });

      requestAnimationFrame(() => {
        scrollToY(yEnd, { duration: 1.2 });

        if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
        jumpTimeoutRef.current = setTimeout(() => {
          jumpingRef.current = false;
        }, 1600);
      });
    };

    window.addEventListener("clarida-jump-footer", onJumpFooter);
    return () => {
      window.removeEventListener("clarida-jump-footer", onJumpFooter);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
  }, [range, bounds]);

  // pointer events
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // ✅ FIX: switch actives using TRANSITION STARTS (not ENDS)
    if (p < bounds.HERO_TO_INTER.start) setActiveIndex(0);
    else if (p < bounds.INTER_TO_TEST.start) setActiveIndex(1);
    else if (p < bounds.TEST_TO_DIFF.start) setActiveIndex(2);
    else if (p < bounds.DIFF_TO_REGEN.start) setActiveIndex(3);
    else if (p < bounds.REGEN_TO_ACT.start) setActiveIndex(4);
    else if (p < bounds.ACT_TO_GUAR.start) setActiveIndex(5);
    else if (p < bounds.GUAR_TO_IMPACT.start) setActiveIndex(6);
    else if (p < bounds.IMPACT_TO_FOOTER.start) setActiveIndex(7);
    else setActiveIndex(8);

    // ✅ during jump: do NOT overwrite forced lastPair
    if (jumpingRef.current) return;

    let nextPair;
    if (p < bounds.HERO_TO_INTER.end) nextPair = [0, 1];
    else if (p < bounds.INTER_TO_TEST.end) nextPair = [1, 2];
    else if (p < bounds.TEST_TO_DIFF.end) nextPair = [2, 3];
    else if (p < bounds.DIFF_TO_REGEN.end) nextPair = [3, 4];
    else if (p < bounds.REGEN_TO_ACT.end) nextPair = [4, 5];
    else if (p < bounds.ACT_TO_GUAR.end) nextPair = [5, 6];
    else if (p < bounds.GUAR_TO_IMPACT.end) nextPair = [6, 7];
    else if (p < bounds.IMPACT_TO_FOOTER.end) nextPair = [7, 8];
    else nextPair = [8, 7];

    // ✅ NEW: once a section is mounted, never unmount it
    addMounted(nextPair[0], nextPair[1]);

    const prevPair = renderPairRef.current;
    if (prevPair[0] !== nextPair[0] || prevPair[1] !== nextPair[1]) {
      renderPairRef.current = nextPair;
      setRenderPair(nextPair);
    }
  });

  // ✅ NEW: render if it has ever been mounted
  const shouldRender = (i) => mountedSet.has(i);

  return (
    <section
      ref={sectionRef}
      className="relative isolate bg-black"
      style={{ height: `${TOTAL_VH}vh` }}
    >
      <div style={viewportStyle} className="overflow-hidden bg-black">
        {shouldRender(0) && (
          <motion.div
            style={{
              opacity: heroOpacity,
              pointerEvents: activeIndex === 0 ? "auto" : "none",
            }}
            className="absolute inset-0 z-10"
          >
            <Hero active={activeIndex === 0} />
          </motion.div>
        )}

        {shouldRender(1) && (
          <motion.div
            style={{
              opacity: interOpacity,
              pointerEvents: activeIndex === 1 ? "auto" : "none",
            }}
            className="absolute inset-0 z-20"
          >
            <Suspense fallback={null}>
              <InteractiveRegenerationExternal
                progress={interProgress}
                active={activeIndex === 1}
              />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(2) && (
          <motion.div
            style={{
              opacity: testOpacity,
              pointerEvents: activeIndex === 2 ? "auto" : "none",
            }}
            className="absolute inset-0 z-30"
          >
            <Suspense fallback={null}>
              <Testimonials />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(3) && (
          <motion.div
            style={{
              opacity: diffOpacity,
              pointerEvents: activeIndex === 3 ? "auto" : "none",
            }}
            className="absolute inset-0 z-40"
          >
            <Suspense fallback={null}>
              <ClaridaDifferenceExternal progress={diffProgress} />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(4) && (
          <motion.div
            style={{
              opacity: regenOpacity,
              pointerEvents: activeIndex === 4 ? "auto" : "none",
            }}
            className="absolute inset-0 z-[45]"
          >
            <Suspense fallback={null}>
              <RegenerationTimelineExternal
                progress={regenProgress}
                active={activeIndex === 4}
              />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(5) && (
          <motion.div
            style={{
              opacity: actOpacity,
              pointerEvents: activeIndex === 5 ? "auto" : "none",
            }}
            className="absolute inset-0 z-[46]"
          >
            <Suspense fallback={null}>
              <ActivationTimelineExternal
                progress={actProgress}
                active={activeIndex === 5}
              />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(6) && (
          <motion.div
            style={{
              opacity: guarOpacity,
              pointerEvents: activeIndex === 6 ? "auto" : "none",
            }}
            className="absolute inset-0 z-[47]"
          >
            <Suspense fallback={null}>
              <VisionaryGuaranteeExternal progress={guarProgress} />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(7) && (
          <motion.div
            style={{
              opacity: impactOpacity,
              pointerEvents: activeIndex === 7 ? "auto" : "none",
            }}
            className="absolute inset-0 z-[48]"
          >
            <Suspense fallback={null}>
              <GlobalCommunityImpactExternal progress={impactProgress} />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(8) && (
          <motion.div
            style={{
              opacity: footerOpacity,
              pointerEvents: activeIndex === 8 ? "auto" : "none",
            }}
            className="absolute inset-0 z-[49]"
          >
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </motion.div>
        )}

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
