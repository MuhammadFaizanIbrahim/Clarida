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

export default function ClaridaDifferenceExternal({ progress }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // preload once
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

  // draw helper
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const frames = preloadedFramesRef.current;
    const w = logicalWidthRef.current || canvas.clientWidth;
    const h = logicalHeightRef.current || canvas.clientHeight;
    if (!w || !h || !frames?.length) return;

    let img = frames[frameIndex];

    // nearest loaded fallback
    if (!img) {
      for (let i = frameIndex - 1; i >= 0; i--) {
        if (frames[i]) {
          img = frames[i];
          break;
        }
      }
      if (!img) {
        for (let i = frameIndex + 1; i < frames.length; i++) {
          if (frames[i]) {
            img = frames[i];
            break;
          }
        }
      }
    }
    if (!img) return;

    ctx2d.clearRect(0, 0, w, h);

    // cover math
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

      const current =
        lastFrameIndexRef.current >= 0 ? lastFrameIndexRef.current : 0;
      drawFrame(current);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  // drive frames + blur from external progress
  useMotionValueEvent(progress, "change", (p) => {
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(p * (TOTAL_FRAMES - 1))
    );
    if (frameIndex !== lastFrameIndexRef.current) {
      lastFrameIndexRef.current = frameIndex;
      drawFrame(frameIndex);
    }

    // same blur/opacity idea as your ScrollTrigger version
    const text = textRef.current;
    if (!text) return;

    const FADE_END = 0.65;
    const finalT = p <= FADE_END ? p / FADE_END : 1;

    const maxBlur = 14;
    const blur = maxBlur * (1 - finalT);
    const opacity = 0.1 + 0.9 * finalT;

    text.style.opacity = String(opacity);
    text.style.filter = `blur(${blur}px)`;
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
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
