// src/sections/ClaridaDifferenceExternal.jsx
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useMotionValueEvent } from "framer-motion";
import Button from "../components/Button.jsx";

// adjust if you change frame count
const TOTAL_FRAMES = 61;

// build frame paths
const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/ClaridaDifference/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export default function ClaridaDifferenceExternal({ progress }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // ✅ Safe draw support refs (prevents flashing to early frames)
  const lastPaintedIndexRef = useRef(-1);
  const lastRequestedIndexRef = useRef(-1);

  // ✅ Micro priority loader (prevents "early frames" flashing on fast scroll)
  const PRIORITY_RADIUS = 18; // smaller set for 61 frames
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

    // near-to-far ordering
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

  // preload once (same as before)
  useEffect(() => {
    let cancelled = false;
    const frames = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (cancelled) return;
        frames[index] = img;
      };
      img.onerror = () => {
        if (cancelled) return;
        frames[index] = null;
      };
    });

    preloadedFramesRef.current = frames;
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ smarter draw that never falls back to far "starting frames"
  const drawFrame = (desiredIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return null;

    const frames = preloadedFramesRef.current;
    const w = logicalWidthRef.current || canvas.clientWidth;
    const h = logicalHeightRef.current || canvas.clientHeight;
    if (!w || !h || !frames?.length) return null;

    const SEARCH_RADIUS = 10; // small; prevents jumping to early frames

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

    // nothing near desired is loaded -> keep current canvas
    if (pick < 0) return null;

    const img = frames[pick];
    if (!img) return null;

    ctx2d.clearRect(0, 0, w, h);

    // cover math (unchanged)
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

  // ✅ hard sync renderer (prevents any flashes + supports fast re-entry)
  const renderFromProgress = (pRaw, forceDraw = false) => {
    const p = clamp01(pRaw);

    const lastIndex = TOTAL_FRAMES - 1;
    const frameIndex = Math.min(lastIndex, Math.floor(p * lastIndex));

    // priority load nearby frames
    requestPriorityAround(frameIndex);

    // keep section poster synced too (prevents any mount/re-enter flash)
    const sec = sectionRef.current;
    if (sec) {
      sec.style.backgroundImage = `url(${framePaths[frameIndex]})`;
      sec.style.backgroundSize = "cover";
      sec.style.backgroundPosition = "center";
    }

    lastRequestedIndexRef.current = frameIndex;

    if (forceDraw || frameIndex !== lastFrameIndexRef.current) {
      const painted = drawFrame(frameIndex);
      if (painted !== null) {
        lastFrameIndexRef.current = painted;
        if (sec) sec.style.backgroundImage = `url(${framePaths[painted]})`;
      }
    }

    // blur/opacity logic (unchanged)
    const text = textRef.current;
    if (!text) return;

    const FADE_END = 0.4;
    const finalT = p <= FADE_END ? p / FADE_END : 1;

    const maxBlur = 14;
    const blur = maxBlur * (1 - finalT);
    const opacity = 0.1 + 0.9 * finalT;

    text.style.opacity = String(opacity);
    text.style.filter = `blur(${blur}px)`;
  };

  // size canvas to viewport (works inside pinned master)
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

      // ✅ draw correct current progress frame (not forcing frame 0)
      const current = clamp01(progress?.get?.() ?? 0);
      renderFromProgress(current, true);
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

  // ✅ initial mount sync (prevents any first-frame flash)
  useLayoutEffect(() => {
    const current = clamp01(progress?.get?.() ?? 0);
    renderFromProgress(current, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drive frames + blur from external progress
  useMotionValueEvent(progress, "change", (p) => {
    renderFromProgress(p, false);
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url(${FIRST_FRAME_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full block" />

      <div className="absolute inset-0 bg-black/35 md:bg-black/40 lg:bg-black/45 pointer-events-none z-10" />

      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3 md:gap-8 z-20"
        style={{
          opacity: 0,
          filter: "blur(14px)",
          transition: "opacity 0.15s linear, filter 0.15s linear",
        }}
      >
        <h2 className="h2-text md:w-[800px] lg:w-[63.542vw]">
          The Clarida Difference:
          <br />
          <span className="mt-5 md:mt-3 inline-block">
            Precision-Timed{" "}
            <span className="h2-text-bold">Vision Recovery</span>
          </span>
        </h2>

        <Button
          extra="gap-2 mt-5 lg:mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("clarida-jump-footer"));
          }}
        >
          Begin Your Journey
          <img
            src="icons/arrowIcon.svg"
            alt="Clarida Text"
            className="rotate-270"
          />
        </Button>
      </div>
    </section>
  );
}
