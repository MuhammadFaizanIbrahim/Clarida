// src/sections/VisionaryGuaranteeExternal.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useMotionValue, useMotionValueEvent } from "framer-motion";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMotionValue = (v) => v && typeof v === "object" && typeof v.get === "function";

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 100;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/VisionaryGuarantee/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

// key frames where each step should peak
const STEP_KEY_FRAMES = [10, 25, 37, 50, 60, 70, 80, 99];
const FIRST_STORY_FRAME = STEP_KEY_FRAMES[0];

// ----------------- TEXT STEPS -----------------
const storySteps = [
  {
    content: (
      <>
        This isn’t about
        <br />
        <span className="section-5-text-bold">supplements</span>
      </>
    ),
  },
  {
    content: (
      <>
        It’s about
        <br />
        Rhythm, Signals &amp; biology
        <br />
        <span className="section-5-text-bold">reawakened</span>
      </>
    ),
  },
  {
    content: (
      <>
        A protocol timed to your body’s own
        <br />
        <span className="section-5-text-bold">intelligence</span>
      </>
    ),
  },
  {
    content: (
      <>
        Rooted in circadian and
        <span className="section-5-text-bold"> regenerative</span>
        <br /> science
      </>
    ),
  },
  {
    content: (
      <>
        And backed by a
        <br />
        <span className="section-5-text-bold">promise</span>
      </>
    ),
  },
  {
    content: (
      <>
        If you don’t feel the shift
        <br />
        in <span className="section-5-text-bold">clarity</span>
        <br />
        in <span className="section-5-text-bold">comfort</span>
        <br />
        in <span className="section-5-text-bold">confidence</span>
        <br />
        you’ll get your money back
      </>
    ),
  },
  { content: <>Because real vision isn’t just what you see</> },
  {
    content: (
      <div className="mt-[-200px] md:mt-[-180px] lg:mt-[-260px]">
        It’s a rhythm you can trust
        <br />
        <br />
        <span className="section-5-text-bold">Or your money back</span>
      </div>
    ),
  },
];

export default function VisionaryGuaranteeExternal({ progress = 0, active = true }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRefs = useRef([]);
  const timeBarRef = useRef(null);
  const tickRefs = useRef([]);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const viewportWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const fallback = useMotionValue(0);
  const mv = useMemo(() => (isMotionValue(progress) ? progress : fallback), [progress, fallback]);

  useEffect(() => {
    if (!isMotionValue(progress)) fallback.set(typeof progress === "number" ? progress : 0);
  }, [progress, fallback]);

  // ✅ ONLY NEW CHANGE: delay scrub at section entry (dead-zone)
  const ENTRY_DELAY = 0.12; // increase to delay more, decrease to delay less
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
    const desiredIndex = Math.min(lastFrameIndex, Math.floor(mappedNow * lastFrameIndex));

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
    const timeBar = timeBarRef.current;
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

      setViewportWidth(width);
      viewportWidthRef.current = width;

      const currentP = clamp01(mv.get?.() ?? 0);
      // ✅ sync to current progress instead of forcing frame 0
      apply(currentP, true);

      if (timeBar) gsap.set(timeBar, { x: width, opacity: 0 });
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

    const timeBar = timeBarRef.current;
    const vw = viewportWidthRef.current || window.innerWidth;
    const segmentShift = vw;

    // timeline bar X based on keyframes (same logic as original)
    if (timeBar) {
      let barX;
      const lastKeyFrame = STEP_KEY_FRAMES[STEP_KEY_FRAMES.length - 1];

      if (frameIndex < FIRST_STORY_FRAME) {
        const t = frameIndex / FIRST_STORY_FRAME;
        barX = lerp(vw, 0, clamp01(t));
      } else if (frameIndex >= lastKeyFrame) {
        barX = -segmentShift * (STEP_KEY_FRAMES.length - 1);
      } else {
        let segIndex = 0;
        for (let i = 0; i < STEP_KEY_FRAMES.length - 1; i++) {
          if (frameIndex >= STEP_KEY_FRAMES[i] && frameIndex < STEP_KEY_FRAMES[i + 1]) {
            segIndex = i;
            break;
          }
        }
        const startFrame = STEP_KEY_FRAMES[segIndex];
        const endFrame = STEP_KEY_FRAMES[segIndex + 1];
        const localT = (frameIndex - startFrame) / (endFrame - startFrame || 1);

        const startX = -segmentShift * segIndex;
        const endX = -segmentShift * (segIndex + 1);
        barX = lerp(startX, endX, clamp01(localT));
      }

      let barOpacity = 0;
      const FADE_IN_START = FIRST_STORY_FRAME - 5;
      const FADE_IN_END = FIRST_STORY_FRAME + 5;

      if (frameIndex <= FADE_IN_START) barOpacity = 0;
      else if (frameIndex >= FADE_IN_END) barOpacity = 1;
      else barOpacity = (frameIndex - FADE_IN_START) / (FADE_IN_END - FADE_IN_START || 1);

      gsap.set(timeBar, { x: barX, opacity: barOpacity, willChange: "transform, opacity" });
    }

    // active text selection (closest keyframe)
    let activeIndex = 0;
    let minD = Infinity;
    STEP_KEY_FRAMES.forEach((kf, i) => {
      const d = Math.abs(frameIndex - kf);
      if (d < minD) {
        minD = d;
        activeIndex = i;
      }
    });

    const fadeFrames = 8;
    const maxY = 16;

    storySteps.forEach((_, i) => {
      const textEl = textRefs.current[i];
      const tickEl = tickRefs.current[i];
      if (!textEl || !tickEl) return;

      const kf = STEP_KEY_FRAMES[i];
      const distance = Math.abs(frameIndex - kf);

      let opacity = 0;
      if (i === activeIndex && distance <= fadeFrames) opacity = 1 - distance / fadeFrames;

      const y = maxY * (1 - opacity);

      gsap.set(textEl, { opacity, y, willChange: "transform, opacity" });
      gsap.set(tickEl, { opacity: 1, scale: i === activeIndex ? 1.1 : 1, willChange: "transform" });
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

  // ---- timeline geometry (same as original, but responsive re-render) ----
  const tickCount = storySteps.length;
  const tickSpacingVW = 100;
  const timeBarWidthVW = tickCount * tickSpacingVW;

  const getTickLeft = (index) => {
    const w = viewportWidth;

    if (w < 480) return `calc(65vw + ${index * tickSpacingVW}vw)`;
    if (w < 768) return `calc(42.5vw + ${index * tickSpacingVW}vw)`;
    if (w < 1024) return `calc(55.8vw + ${index * tickSpacingVW}vw)`;
    if (w < 1500) return `calc(55.7vw + ${index * tickSpacingVW}vw)`;
    return `calc(54.2vw + ${index * tickSpacingVW}vw)`;
  };

  return (
    <section ref={sectionRef} className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="h-full w-full block" />

      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {storySteps.map((step, index) => (
        <div
          key={index}
          ref={(el) => (textRefs.current[index] = el)}
          className="absolute inset-0 flex flex-col items-center text-center justify-center px-6 gap-6"
          style={{ opacity: 0, transform: "translateY(0px)" }}
        >
          <p className="section-5-text">{step.content}</p>
        </div>
      ))}

      <div
        ref={timeBarRef}
        className="
          pointer-events-none absolute bottom-8 md:bottom-10 lg:bottom-4 2xl:bottom-8
          -left-17 md:-left-17 lg:-left-21 z-20
        "
        style={{ width: `${timeBarWidthVW}vw` }}
      >
        <div className="relative h-[60px]">
          <div
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[55.8vw] 2xl:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[44.2vw] 2xl:right-[45.73vw] bg-(--color-text)"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />

          {storySteps.map((_, index) => (
            <div
              key={index}
              ref={(el) => (tickRefs.current[index] = el)}
              className="absolute flex flex-col items-center top-[34%] md:top-[26%] lg:top-[25%]"
              style={{ left: getTickLeft(index), transform: "translateY(-50%)", opacity: 1 }}
            >
              <div className="h-6 md:h-8 w-px bg-(--color-text) mb-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
