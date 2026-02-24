// src/sections/VisionaryGuaranteeExternal.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { useMotionValue, useMotionValueEvent } from "framer-motion";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMotionValue = (v) =>
  v && typeof v === "object" && typeof v.get === "function";

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 313;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/VisionaryGuaranteeFull/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

// key frames where each step should peak
const STEP_KEY_FRAMES = [10, 90, 175];
const FIRST_STORY_FRAME = STEP_KEY_FRAMES[0];

// ----------------- TEXT STEPS -----------------
const storySteps = [
  {
    content: (
      <>
        This isn’t about supplements — it’s about rhythm, signals & biology
        reawakened, a protocol timed to your body’s own intelligence, rooted in
        circadian and regenerative science.
      </>
    ),
  },
  {
    content: (
      <>
        And backed by a promise — if you don’t feel the shift in clarity, in
        comfort, in confidence, you’ll get your money back.
      </>
    ),
  },
  {
    content: (
      <>
        Because real vision isn’t just what you see — it’s a rhythm you can
        trust, or your money back.
      </>
    ),
  },
];

export default function VisionaryGuaranteeExternal({
  progress = 0,
  active = true,
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRefs = useRef([]);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  const fallback = useMotionValue(0);
  const mv = useMemo(
    () => (isMotionValue(progress) ? progress : fallback),
    [progress, fallback]
  );

  useEffect(() => {
    if (!isMotionValue(progress))
      fallback.set(typeof progress === "number" ? progress : 0);
  }, [progress, fallback]);

  // ✅ ONLY NEW CHANGE: delay scrub at section entry (dead-zone)
  const ENTRY_DELAY = 0.04; // increase to delay more, decrease to delay less
  const mapWithEntryDelay = (pRaw) => {
    const p = clamp01(pRaw);
    if (p <= ENTRY_DELAY) return 0;
    return clamp01((p - ENTRY_DELAY) / (1 - ENTRY_DELAY));
  };

  // preload frames once
  useEffect(() => {
    let cancelled = false;
    const frames = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;

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

  // ✅ Safe draw support refs (prevents flashing to early frames on fast scroll)
  const lastRequestedIndexRef = useRef(-1);
  const lastPaintedIndexRef = useRef(-1);

  // ✅ Micro priority loader (loads near current index fast)
  const PRIORITY_RADIUS = 26; // good for 100 frames
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

  // ✅ safer draw that never falls back to far "starting frames"
  const drawFrame = (desiredIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return null;

    const frames = preloadedFramesRef.current;
    const w = logicalWidthRef.current || canvas.clientWidth;
    const h = logicalHeightRef.current || canvas.clientHeight;
    if (!w || !h || !frames?.length) return null;

    const SEARCH_RADIUS = 12; // keep small to avoid jumping back to very early frames

    let pick = -1;
    if (frames[desiredIndex]) {
      pick = desiredIndex;
    } else {
      const prevReq = lastRequestedIndexRef.current;
      const goingForward = desiredIndex >= prevReq;

      for (let d = 1; d <= SEARCH_RADIUS; d++) {
        const a = desiredIndex - d;
        const b = desiredIndex + d;

        const first = goingForward ? b : a;
        const second = goingForward ? a : b;

        if (first >= 0 && first < TOTAL_FRAMES && frames[first]) {
          pick = first;
          break;
        }
        if (second >= 0 && second < TOTAL_FRAMES && frames[second]) {
          pick = second;
          break;
        }
      }
    }

    // nothing near desired is loaded yet -> keep current canvas
    if (pick < 0) return null;

    const img = frames[pick];
    if (!img) return null;

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

    lastPaintedIndexRef.current = pick;
    return pick;
  };

  // ✅ draw CURRENT frame ASAP (prevents first-frame flash on re-mount)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    // use current progress instead of forcing FIRST_FRAME
    const rawNow = clamp01(mv.get?.() ?? 0);
    const mappedNow = mapWithEntryDelay(rawNow);

    const lastFrameIndex = TOTAL_FRAMES - 1;
    const desiredIndex = Math.min(
      lastFrameIndex,
      Math.floor(mappedNow * lastFrameIndex)
    );

    const img = new Image();
    img.src = framePaths[desiredIndex];

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      logicalWidthRef.current = width;
      logicalHeightRef.current = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // cover math (same as your original)
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

      // keep refs consistent
      lastFrameIndexRef.current = desiredIndex;
      lastRequestedIndexRef.current = desiredIndex;
      lastPaintedIndexRef.current = desiredIndex;

      // also sync section poster to avoid any flash
      const sec = sectionRef.current;
      if (sec) {
        sec.style.backgroundImage = `url(${framePaths[desiredIndex]})`;
        sec.style.backgroundSize = "cover";
        sec.style.backgroundPosition = "center";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resize canvas to viewport (parent is pinned)
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      logicalWidthRef.current = width;
      logicalHeightRef.current = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const currentP = clamp01(mv.get?.() ?? 0);
      // ✅ sync to current progress instead of forcing frame 0
      apply(currentP, true);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ smoothing refs (prevents jitter on scroll updates)
  const smoothYRef = useRef([]);
  const smoothORef = useRef([]);

  const apply = (pRaw, forceDraw = false) => {
    if (!active) return;

    // ✅ delayed progress mapping kept exactly as you have it
    const p = mapWithEntryDelay(pRaw);

    const lastFrameIndex = TOTAL_FRAMES - 1;
    const frameIndex = Math.min(lastFrameIndex, Math.floor(p * lastFrameIndex));

    // ✅ priority load around current target (fast scroll fix)
    requestPriorityAround(frameIndex);

    // ✅ keep section poster synced too (prevents any brief first-frame flash)
    const sec = sectionRef.current;
    if (sec) {
      sec.style.backgroundImage = `url(${framePaths[frameIndex]})`;
      sec.style.backgroundSize = "cover";
      sec.style.backgroundPosition = "center";
    }

    lastRequestedIndexRef.current = frameIndex;

    if (forceDraw || frameIndex !== lastFrameIndexRef.current) {
      const painted = drawFrame(frameIndex);

      // only update "last frame" when we actually paint something
      if (painted !== null) {
        lastFrameIndexRef.current = painted;
        if (sec) sec.style.backgroundImage = `url(${framePaths[painted]})`;
      }
    }

    // ----------------- TEXT EFFECT (Inter-Regen curve, NO HOLD, SMOOTH) -----------------
    // ✅ ONLY CHANGE HERE: increase exit durations so text stays on screen longer
    const STEP_TIMINGS = [
      { enter: 18, exit: 120 },
      { enter: 18, exit: 160 },
      { enter: 18, exit: 175 },
    ];

    const START_Y = 600;
    const EXIT_Y = -25;

    const TEXT_KEY_FRAMES = STEP_KEY_FRAMES;

    const curveTravel = (t) => {
      let x = clamp01(t);

      // fast early
      let curved = Math.pow(x, 0.5);

      // slow down around middle (gaussian “brake”)
      const slowStrength = 0.95;
      const slowWidth = 0.22;
      const gaussian = Math.exp(
        -Math.pow(x - 0.5, 2) / (2 * slowWidth * slowWidth)
      );
      curved = curved - gaussian * slowStrength * 0.26;

      // accelerate after mid
      const accelStart = 0.55;
      if (x > accelStart) {
        const accelT = (x - accelStart) / (1 - accelStart);
        curved += Math.pow(accelT, 1.4) * 0.08;
      }

      return clamp01(curved);
    };

    const SMOOTH_T = 0.22; // higher = faster response, lower = smoother glide

    storySteps.forEach((_, idx) => {
      const textEl = textRefs.current[idx];
      if (!textEl) return;

      const kf = TEXT_KEY_FRAMES[idx];
      const { enter, exit } = STEP_TIMINGS[idx];

      // Desired window
      let desiredStart = kf - enter;
      let desiredEnd = kf + exit;

      // ✅ Fix for first text: if the window starts before frame 0,
      // shift the entire window forward so animation begins at frame 0.
      if (desiredStart < 0) {
        const shift = -desiredStart;
        desiredStart = 0;
        desiredEnd = desiredEnd + shift;
      }

      let targetO = 0;
      let targetY = START_Y;

      if (frameIndex >= desiredStart && frameIndex <= desiredEnd) {
        const t = clamp01(
          (frameIndex - desiredStart) / (desiredEnd - desiredStart || 1)
        );
        const tt = curveTravel(t);

        // smooth fade in/out (no hold plateau)
        const fadeInEnd = 0.18;
        const fadeOutStart = 0.72;

        if (tt < fadeInEnd) targetO = tt / fadeInEnd;
        else if (tt > fadeOutStart)
          targetO = 1 - (tt - fadeOutStart) / (1 - fadeOutStart);
        else targetO = 1;

        targetY = START_Y + (EXIT_Y - START_Y) * tt;
      } else if (frameIndex > desiredEnd) {
        targetO = 0;
        targetY = EXIT_Y;
      } else {
        targetO = 0;
        targetY = START_Y;
      }

      // ✅ Smooth output (prevents jitter)
      const prevY =
        typeof smoothYRef.current[idx] === "number"
          ? smoothYRef.current[idx]
          : START_Y;
      const prevO =
        typeof smoothORef.current[idx] === "number"
          ? smoothORef.current[idx]
          : 0;

      const y = lerp(prevY, targetY, SMOOTH_T);
      const opacity = lerp(prevO, targetO, SMOOTH_T);

      smoothYRef.current[idx] = y;
      smoothORef.current[idx] = opacity;

      gsap.set(textEl, { opacity, y, willChange: "transform, opacity" });
    });
  };

  // ✅ hard sync on (re)enter so it never flashes early frames before mv updates
  useLayoutEffect(() => {
    if (!active) return;
    const current = clamp01(mv.get?.() ?? 0);
    apply(current, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ✅ initial mount sync
  useLayoutEffect(() => {
    const current = clamp01(mv.get?.() ?? 0);
    apply(current, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(mv, "change", (v) => apply(v));

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
    >
      <canvas ref={canvasRef} className="h-full w-full block" />

      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {storySteps.map((step, index) => (
        <div
        key={index}
        ref={(el) => (textRefs.current[index] = el)}
        className="absolute inset-0 items-center justify-center px-80"
        style={{ opacity: 0, transform: "translateY(0px)" }}
      >
        <p className="section-5-text text-center leading-[1.6]">
          {step.content}
        </p>
      </div>
      ))}
    </section>
  );
}
