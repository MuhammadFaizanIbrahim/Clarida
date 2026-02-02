// src/transitions/SecondPageSectionBySectionScroll.jsx
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

import CurveDivider from "../components/CurveDivider";
import { useLocation } from "react-router-dom";


// ✅ Lazy-load heavy sections so they don't load until needed
const ClaridaScrollStore = lazy(() => import("../sections/ClaridaScrollStore"));
const LifestyleVisionExternal = lazy(() =>
  import("../sections/LifestyleVisionExternal")
);
const Footer = lazy(() => import("../sections/Footer"));

// ✅ FIX: DO NOT lazy-load the first visible section (prevents initial black screen)
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
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();

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
    : useTransform(
        scrollYProgress,
        [bounds.SCI_TO_STORE.start, bounds.SCI_TO_STORE.end],
        [0, 1],
        { clamp: true }
      );

  const storeToLifeT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.STORE_TO_LIFE.start, bounds.STORE_TO_LIFE.end],
        [0, 1],
        { clamp: true }
      );

  const lifeToFooterT = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.LIFE_TO_FOOTER.start, bounds.LIFE_TO_FOOTER.end],
        [0, 1],
        { clamp: true }
      );

  const lifeProgress = prefersReducedMotion
    ? 0
    : useTransform(
        scrollYProgress,
        [bounds.STORE_TO_LIFE.start, bounds.LIFE_HOLD.end],
        [0, 1],
        { clamp: true }
      );

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
        [
          bounds.SCI_TO_STORE.start,
          bounds.SCI_TO_STORE.end,
          bounds.STORE_HOLD.end,
          bounds.STORE_TO_LIFE.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const lifeOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.STORE_TO_LIFE.start,
          bounds.STORE_TO_LIFE.end,
          bounds.LIFE_HOLD.end,
          bounds.LIFE_TO_FOOTER.end,
        ],
        [0, 1, 1, 0],
        { clamp: true }
      );

  const footerOpacity = prefersReducedMotion
    ? 1
    : useTransform(
        scrollYProgress,
        [
          bounds.LIFE_TO_FOOTER.start,
          bounds.LIFE_TO_FOOTER.end,
          bounds.FOOTER_HOLD.end,
        ],
        [0, 1, 1],
        { clamp: true }
      );

  // ✅ Keep exactly 2 mounted based on progress region (no direction needed)
  const [renderPair, setRenderPair] = useState([0, 1]);
  const renderPairRef = useRef([0, 1]);

  // ✅ NEW: mounted set (once mounted, never unmount)
  const mountedSetRef = useRef(new Set([0, 1]));
  const [mountedVersion, setMountedVersion] = useState(0);

  const ensureMounted = (pair) => {
    let changed = false;
    for (const i of pair) {
      if (!mountedSetRef.current.has(i)) {
        mountedSetRef.current.add(i);
        changed = true;
      }
    }
    if (changed) setMountedVersion((v) => v + 1);
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
      const lastPair = [2, 3];
      renderPairRef.current = lastPair;
      setRenderPair(lastPair);

      // ✅ also ensure they're permanently mounted
      ensureMounted(lastPair);

      // Start a tiny bit BEFORE the transition (still on Life),
      // then animate to a bit AFTER the transition (inside Footer hold).
      const eps = 0.001;

      const pStart = Math.max(0, bounds.LIFE_TO_FOOTER.start - eps);
      const pEnd = Math.min(1, bounds.LIFE_TO_FOOTER.end + 0.14); // go INTO footer hold

      const yStart = start + pStart * dist;
      const yEnd = Math.min(end - 2, start + pEnd * dist);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, bounds]);

  useEffect(() => {
    // Only act when we explicitly request the Store section
    if (location.hash !== "#store") return;
  
    const { start, end } = range;
    if (!start && !end) return;
  
    const dist = end - start;
  
    // Force the pair that includes Store so the lazy import starts immediately
    jumpingRef.current = true;
  
    const storePair = [0, 1]; // SCI + STORE (safe pair to show)
    renderPairRef.current = storePair;
    setRenderPair(storePair);
    ensureMounted(storePair);
  
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
  
    // Target: just inside STORE_HOLD (so you land fully in the Store section)
    const pTarget = Math.min(1, bounds.STORE_HOLD.start + 0.04);
    const yTarget = start + pTarget * dist;
  
    // Give Suspense a moment to mount the lazy component (reduces black flash)
    const t = setTimeout(() => {
      scrollToY(yTarget, { duration: 1.0 });
  
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
      jumpTimeoutRef.current = setTimeout(() => {
        jumpingRef.current = false;
      }, 1200);
    }, 80);
  
    return () => clearTimeout(t);
  }, [location.hash, range, bounds]);
  

  // ✅ FIX: switch actives using TRANSITION STARTS (not ENDS)
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < bounds.SCI_TO_STORE.start) setActiveIndex(0);
    else if (p < bounds.STORE_TO_LIFE.start) setActiveIndex(1);
    else if (p < bounds.LIFE_TO_FOOTER.start) setActiveIndex(2);
    else setActiveIndex(3);

    // ✅ during jump: do NOT overwrite forced lastPair
    if (jumpingRef.current) return;

    let nextPair;
    if (p < bounds.SCI_TO_STORE.end) nextPair = [0, 1];
    else if (p < bounds.STORE_TO_LIFE.end) nextPair = [1, 2];
    else if (p < bounds.LIFE_TO_FOOTER.end) nextPair = [2, 3];
    else nextPair = [3, 2];

    const prevPair = renderPairRef.current;
    if (prevPair[0] !== nextPair[0] || prevPair[1] !== nextPair[1]) {
      renderPairRef.current = nextPair;
      setRenderPair(nextPair);

      // ✅ NEW: once a section is mounted, never unmount it
      ensureMounted(nextPair);
    }
  });

  // ✅ NEW: initial ensure (keeps current behavior: only first pair mounted at load)
  useEffect(() => {
    ensureMounted(renderPairRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ NEW: render if ever mounted (ignores renderPair for unmounting)
  const shouldRender = (i) => {
    // `mountedVersion` forces re-render when set grows (no other behavior change)
    void mountedVersion;
    return mountedSetRef.current.has(i);
  };

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
              opacity: sciOpacity,
              pointerEvents: activeIndex === 0 ? "auto" : "none",
            }}
            className="absolute inset-0 z-10"
          >
            <ScientificInnovationExternal active={activeIndex === 0} />
          </motion.div>
        )}

        {shouldRender(1) && (
          <motion.div
            style={{
              opacity: storeOpacity,
              pointerEvents: activeIndex === 1 ? "auto" : "none",
            }}
            className="absolute inset-0 z-20"
          >
            <Suspense fallback={null}>
              <ClaridaScrollStore active={activeIndex === 1} />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(2) && (
          <motion.div
            style={{
              opacity: lifeOpacity,
              pointerEvents: activeIndex === 2 ? "auto" : "none",
            }}
            className="absolute inset-0 z-30"
          >
            <Suspense fallback={null}>
              <LifestyleVisionExternal
                progress={lifeProgress}
                active={activeIndex === 2}
              />
            </Suspense>
          </motion.div>
        )}

        {shouldRender(3) && (
          <motion.div
            style={{
              opacity: footerOpacity,
              pointerEvents: activeIndex === 3 ? "auto" : "none",
              zIndex: 60,
            }}
            className="absolute inset-0"
          >
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </motion.div>
        )}

        <TransitionArc t={sciToStoreT} />
        <TransitionArc t={storeToLifeT} />
        <TransitionArc t={lifeToFooterT} />
      </div>
    </section>
  );
}
