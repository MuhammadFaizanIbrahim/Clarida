// src/sections/LifestyleVisionExternal.jsx
import React, { useLayoutEffect, useRef, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import Button from "../components/Button.jsx";
import { useMediaQuery } from "react-responsive";
import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 61;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/LifestyleVision/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const isMotionValue = (v) =>
  v && typeof v === "object" && typeof v.get === "function";

export default function LifestyleVisionExternal({
  progress = 0,
  active = true,
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const prefersReducedMotion = useReducedMotion();

  // caches for performance
  const preloadedFramesRef = useRef(Array(TOTAL_FRAMES).fill(null));
  const lastDrawnIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // progress can be MotionValue or number
  const fallback = useMotionValue(0);
  const mv = useMemo(
    () => (isMotionValue(progress) ? progress : fallback),
    [progress, fallback]
  );

  useEffect(() => {
    if (!isMotionValue(progress))
      fallback.set(typeof progress === "number" ? progress : 0);
  }, [progress, fallback]);

  // ✅ entry delay / rebase (same pattern as your other externals)
  const activeStartRef = useRef(0);
  const ENTRY_REBASE_MAX = 0.22; // delay start when entering from above
  const ENTRY_FROM_BELOW_MIN = 0.75; // don't rebase when re-entering from below

  // ✅ flutter fix: smooth scrub loop
  const targetPRef = useRef(0);
  const smoothPRef = useRef(0);
  const rafRef = useRef(0);

  // preload frames once (same behavior)
  useEffect(() => {
    let cancelled = false;
    const frames = Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.decoding = "async";

      img.onload = () => {
        if (!cancelled) frames[index] = img;
      };
      img.onerror = () => {
        if (!cancelled) frames[index] = null;
      };
    });

    preloadedFramesRef.current = frames;

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ safe-draw + priority loader (prevents "first frames then jump" on fast re-entry)
  const lastRequestedIndexRef = useRef(-1);
  const lastPaintedIndexRef = useRef(-1);

  const PRIORITY_RADIUS = 18; // for 61 frames
  const PRIORITY_CONCURRENCY = 6;

  const priorityTokenRef = useRef(0);
  const priorityQueueRef = useRef([]);
  const priorityInFlightRef = useRef(0);
  const priorityLoadingSetRef = useRef(new Set());

  const requestPriorityAround = (centerIndex) => {
    const frames = preloadedFramesRef.current;
    if (!frames || !frames.length) return;

    const token = ++priorityTokenRef.current;
    priorityQueueRef.current = [];

    const R = PRIORITY_RADIUS;

    const order = [];
    order.push(centerIndex);
    for (let d = 1; d <= R; d++) {
      const a = centerIndex + d;
      const b = centerIndex - d;
      if (a >= 0 && a < TOTAL_FRAMES) order.push(a);
      if (b >= 0 && b < TOTAL_FRAMES) order.push(b);
    }

    for (const idx of order) {
      if (frames[idx]) continue;
      if (priorityLoadingSetRef.current.has(idx)) continue;
      priorityQueueRef.current.push(idx);
    }

    const pump = () => {
      if (priorityTokenRef.current !== token) return;

      while (
        priorityInFlightRef.current < PRIORITY_CONCURRENCY &&
        priorityQueueRef.current.length
      ) {
        const idx = priorityQueueRef.current.shift();
        if (idx == null) continue;

        if (frames[idx]) continue;
        if (priorityLoadingSetRef.current.has(idx)) continue;

        priorityLoadingSetRef.current.add(idx);
        priorityInFlightRef.current += 1;

        const img = new Image();
        try {
          img.fetchPriority = "high";
        } catch (_) {}
        img.decoding = "async";
        img.src = framePaths[idx];

        img.onload = () => {
          frames[idx] = img;
          priorityLoadingSetRef.current.delete(idx);
          priorityInFlightRef.current -= 1;
          pump();
        };

        img.onerror = () => {
          frames[idx] = frames[idx] || null;
          priorityLoadingSetRef.current.delete(idx);
          priorityInFlightRef.current -= 1;
          pump();
        };
      }
    };

    pump();
  };

  const drawFrame = (desiredIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return null;

    const frames = preloadedFramesRef.current;
    const w = logicalWidthRef.current || window.innerWidth;
    const h = logicalHeightRef.current || window.innerHeight;
    if (!w || !h) return null;

    const isReady = (img) => img && img.complete && img.naturalWidth > 0;

    // ✅ nearby-only fallback (never jump back to early "starting" frames)
    const SEARCH_RADIUS = 10;

    let pick = -1;
    if (isReady(frames[desiredIndex])) {
      pick = desiredIndex;
    } else {
      const prevReq = lastRequestedIndexRef.current;
      const goingForward = desiredIndex >= prevReq;

      for (let d = 1; d <= SEARCH_RADIUS; d++) {
        const a = desiredIndex - d;
        const b = desiredIndex + d;

        const first = goingForward ? b : a;
        const second = goingForward ? a : b;

        if (first >= 0 && first < TOTAL_FRAMES && isReady(frames[first])) {
          pick = first;
          break;
        }
        if (second >= 0 && second < TOTAL_FRAMES && isReady(frames[second])) {
          pick = second;
          break;
        }
      }
    }

    // nothing near desired loaded yet -> keep current canvas (no flash)
    if (pick < 0) return null;

    // avoid redundant redraws
    if (pick === lastDrawnIndexRef.current) return pick;
    lastDrawnIndexRef.current = pick;
    lastPaintedIndexRef.current = pick;

    const img = frames[pick];
    if (!isReady(img)) return null;

    ctx2d.clearRect(0, 0, w, h);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const imgAspect = imgW / imgH;
    const canvasAspect = w / h;

    let drawW, drawH, offsetX, offsetY;
    if (imgAspect > canvasAspect) {
      drawH = h;
      drawW = drawH * imgAspect;
      offsetX = (w - drawW) / 2;
      offsetY = 0;
    } else {
      drawW = w;
      drawH = drawW / imgAspect;
      offsetX = 0;
      offsetY = (h - drawH) / 2;
    }

    ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
    return pick;
  };

  const setTextState = (p) => {
    const text = textRef.current;
    if (!text) return;

    if (prefersReducedMotion) {
      gsap.set(text, { opacity: 1, filter: "blur(0px)" });
      return;
    }

    const maxBlur = 14;
    const FADE_END = 0.35;

    let finalT = 0;
    if (p <= FADE_END) finalT = p / FADE_END;
    else finalT = 1;

    const blur = maxBlur * (1 - finalT);
    const opacity = 0.1 + 0.9 * finalT;

    gsap.set(text, {
      opacity,
      filter: `blur(${blur}px)`,
      willChange: "transform, opacity, filter",
    });
  };

  const rebaseProgress = (pIncoming) => {
    const startAt = activeStartRef.current || 0;
    const denom = 1 - startAt;
    return denom <= 0.00001 ? 0 : clamp01((pIncoming - startAt) / denom);
  };

  // ✅ draw CURRENT frame ASAP to avoid "first frame flash" on remount/re-entry
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    logicalWidthRef.current = width;
    logicalHeightRef.current = height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

    const current = clamp01(mv.get?.() ?? 0);
    const p = rebaseProgress(current);
    smoothPRef.current = p;
    targetPRef.current = p;

    const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * (TOTAL_FRAMES - 1)));
    lastRequestedIndexRef.current = idx;
    requestPriorityAround(idx);

    // try draw from preloaded if possible; otherwise paint the correct frame src directly
    const painted = drawFrame(idx);
    if (painted === null) {
      const img = new Image();
      img.src = framePaths[idx] || FIRST_FRAME_SRC;
      img.onload = () => {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgAspect = imgW / imgH;
        const canvasAspect = width / height;

        let drawW, drawH, offsetX, offsetY;
        if (imgAspect > canvasAspect) {
          drawH = height;
          drawW = drawH * imgAspect;
          offsetX = (width - drawW) / 2;
          offsetY = 0;
        } else {
          drawW = width;
          drawH = drawW / imgAspect;
          offsetX = 0;
          offsetY = (height - drawH) / 2;
        }

        ctx2d.clearRect(0, 0, width, height);
        ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);

        lastDrawnIndexRef.current = idx;
        lastPaintedIndexRef.current = idx;
      };
    }

    // keep text starting state as you had (blurred at start)
    setTextState(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resize canvas to viewport
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      logicalWidthRef.current = width;
      logicalHeightRef.current = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ✅ redraw current (not forced to 0)
      const p = smoothPRef.current;
      const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * (TOTAL_FRAMES - 1)));
      lastRequestedIndexRef.current = idx;
      requestPriorityAround(idx);
      drawFrame(idx);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on activate: decide whether to rebase/reset or not
  useEffect(() => {
    if (!active) return;

    const current = clamp01(mv.get?.() ?? 0);
    const enteringFromBelow = current >= ENTRY_FROM_BELOW_MIN;

    if (enteringFromBelow) {
      activeStartRef.current = 0;
    } else if (current <= ENTRY_REBASE_MAX) {
      activeStartRef.current = current;
      // reset text to start-state (matches original initial)
      setTextState(0);
      targetPRef.current = 0;
      smoothPRef.current = 0;
      lastRequestedIndexRef.current = 0;
      requestPriorityAround(0);
      drawFrame(0);
      lastDrawnIndexRef.current = 0;
    } else {
      activeStartRef.current = 0;
    }

    const p = rebaseProgress(current);
    targetPRef.current = p;

    // ✅ KEY FIX: when re-entering from below (or not rebasing), sync immediately to current progress
    if (enteringFromBelow || current > ENTRY_REBASE_MAX) {
      smoothPRef.current = p;
      const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * (TOTAL_FRAMES - 1)));
      lastRequestedIndexRef.current = idx;
      requestPriorityAround(idx);
      drawFrame(idx);
      // keep your “start blurred” behavior without forcing frame 0
      setTextState(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // keep target updated from parent progress
  useMotionValueEvent(mv, "change", (v) => {
    if (!active) return;
    const p = rebaseProgress(clamp01(v));
    targetPRef.current = p;

    // keep priority loader focused (helps fast scroll)
    const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * (TOTAL_FRAMES - 1)));
    lastRequestedIndexRef.current = idx;
    requestPriorityAround(idx);
  });

  // ✅ RAF loop: smooth progress → stable frames (fixes “flutter”)
  useEffect(() => {
    if (!active) return;

    if (prefersReducedMotion) {
      // reduced motion: keep first frame + readable text
      targetPRef.current = 0;
      smoothPRef.current = 0;
      lastRequestedIndexRef.current = 0;
      requestPriorityAround(0);
      drawFrame(0);
      setTextState(0);
      return;
    }

    const tick = () => {
      const target = targetPRef.current;
      let smooth = smoothPRef.current;

      // smoothing factor: higher = snappier, lower = smoother
      smooth = lerp(smooth, target, 0.18);

      // snap very close values to stop micro-jitter
      if (Math.abs(target - smooth) < 0.0008) smooth = target;

      smoothPRef.current = smooth;

      const idx = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(smooth * (TOTAL_FRAMES - 1))
      );

      lastRequestedIndexRef.current = idx;
      requestPriorityAround(idx);

      drawFrame(idx);
      setTextState(smooth);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end justify-between text-white overflow-hidden"
      style={{
        backgroundImage: `url(${FIRST_FRAME_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* FRAME BACKGROUND via CANVAS */}
      <canvas className="absolute h-full w-full" ref={canvasRef} />

      <div className="absolute inset-0 bg-black/25 pointer-events-none z-10" />

      <div
        ref={textRef}
        className="relative z-10 px-5 md:px-8 lg:px-12 2xl:px-20 py-8 md:py-5 lg:py-[2vw]
        flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between w-full gap-2 text-center md:text-left"
        style={{
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.00) 25%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.40) 100%) ${
            isMobile ? "65%" : "25.95%"
          })`,
          // ✅ prevents first-paint flash (blurred from the very start)
          opacity: prefersReducedMotion ? 1 : 0.1,
          filter: prefersReducedMotion ? "blur(0px)" : "blur(14px)",
        }}
      >
        {/* Left Side */}
        <div className="w-[362px] md:w-full flex flex-col gap-3 md:gap-6 items-center md:items-start">
          <h1 className="h2-text text-left">
            Clarida Isn’t Just About
            <span className="h2-text-bold">
              <br /> Vision.{" "}
            </span>
            It’s About <span className="h2-text-bold">Life</span>
          </h1>

          {!isMobile && (
            <Button
              extra="gap-2 mt-5 md:mt-2 lg:mt-0 2xl:mt-2 lg:gap-4 lg:py-3 lg:px-5 flex"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("clarida-jump-footer"));
              }}
            >
              Start Your Clarida Story Today
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          )}
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start">
          <p className="hero-paragraph-normal w-[350px] md:w-[400px] lg:w-[40.625vw] text-center md:text-left">
            Because when vision returns, life itself comes back into focus.
            Clarida gives you more than sight — it gives you back the freedom to
            read, connect, and rediscover the world you love. Every day becomes
            richer when you see it clearly, because the gift of sight is really
            the gift of life.
          </p>

          {isMobile && (
            <Button
              width="w-[293px] md:w-[220px] lg:w-[16.302vw]"
              height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
              extra="gap-2 mt-5 lg:mt-2 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
            >
              Start Your Clarida Story Today
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
