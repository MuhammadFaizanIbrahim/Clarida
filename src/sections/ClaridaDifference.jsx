// ClaridaDifferenceFrames.jsx
import React, { useLayoutEffect, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

// adjust if you change frame count
const TOTAL_FRAMES = 31;

// build frame paths: frame_00001.webp ... frame_00031.webp
const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/ClaridaDifferenceNew/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const ClaridaDifference = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // cache preloaded images + last frame index
  const preloadedFramesRef = useRef([]); // array of Image | null
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // 🔹 preload all frames once
  useEffect(() => {
    let isCancelled = false;
    const frames = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        frames[index] = img;
      };

      img.onerror = () => {
        if (isCancelled) return;
        frames[index] = null;
      };
    });

    preloadedFramesRef.current = frames;

    return () => {
      isCancelled = true;
    };
  }, []);

  // 🔹 draw first frame ASAP on canvas
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const img = new Image();
    img.src = FIRST_FRAME_SRC;

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = section.getBoundingClientRect();

      logicalWidthRef.current = rect.width;
      logicalHeightRef.current = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // cover math (no stretching)
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgAspect = imgW / imgH;
      const canvasAspect = rect.width / rect.height;

      let drawW, drawH, offsetX, offsetY;
      if (imgAspect > canvasAspect) {
        // image wider → fit height, crop sides
        drawH = rect.height;
        drawW = drawH * imgAspect;
        offsetX = (rect.width - drawW) / 2;
        offsetY = 0;
      } else {
        // image taller/narrower → fit width, crop top/bottom
        drawW = rect.width;
        drawH = drawW / imgAspect;
        offsetX = 0;
        offsetY = (rect.height - drawH) / 2;
      }

      ctx2d.clearRect(0, 0, rect.width, rect.height);
      ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const text = textRef.current;
    if (!section || !canvas || !text) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // helper to resize canvas + keep aspect logic
    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      logicalWidthRef.current = rect.width;
      logicalHeightRef.current = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // redraw last shown frame (or first) on resize
      const lastIndex =
        lastFrameIndexRef.current >= 0 ? lastFrameIndexRef.current : 0;
      drawFrame(lastIndex);
    };

    const drawFrame = (frameIndex) => {
      const frames = preloadedFramesRef.current;
      const w = logicalWidthRef.current || canvas.clientWidth;
      const h = logicalHeightRef.current || canvas.clientHeight;
      if (!w || !h || !frames || !frames.length) return;

      let img = frames[frameIndex];

      // if frame not loaded yet, try nearest loaded
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

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (prefersReducedMotion) {
      // show first frame (already drawn) + readable text
      gsap.set(text, { opacity: 1, filter: "blur(0px)" });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    let ctx = gsap.context(() => {
      let scrollDistance;
      if (isMobile) {
        scrollDistance = window.innerHeight * 1;
      } else {
        scrollDistance = window.innerHeight * 1.5;
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + scrollDistance,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress; // 0 → 1

          // ----- FRAME SCRUB (canvas) -----
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * (TOTAL_FRAMES - 1))
          );

          if (frameIndex !== lastFrameIndexRef.current) {
            lastFrameIndexRef.current = frameIndex;
            drawFrame(frameIndex);
          }

          // ----- TEXT BLUR / OPACITY -----
          const FADE_END = 0.65; // text becomes sharp at 65% scroll

          let finalT = 0;
          if (progress <= FADE_END) {
            finalT = progress / FADE_END; // 0 → 1
          } else {
            finalT = 1; // stay at 1 afterwards
          }

          const maxBlur = 14; // px – how blurry at the very start
          const blur = maxBlur * (1 - finalT); // 14 → 0
          const opacity = 0.1 + 0.9 * finalT; // 0.1 → 1 and stays 1

          gsap.set(text, {
            opacity,
            filter: `blur(${blur}px)`,
          });
        },
      });
    }, section);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
    >
      {/* FRAME BACKGROUND via CANVAS */}
      <canvas ref={canvasRef} className="h-full w-full block" />

      <div className="absolute inset-0 bg-black/35 md:bg-black/40 lg:bg-black/45 pointer-events-none z-10" />

      {/* TEXT + BUTTON OVERLAY */}
      <div
        ref={textRef}
        className="
          absolute inset-0 
          flex flex-col items-center justify-center
          text-center px-6 gap-3 md:gap-8 z-20
        "
        style={{
          opacity: 0,
          filter: "blur(14px)",
          transition: "opacity 0.15s linear, filter 0.15s linear",
        }}
      >
        {/* Main Heading */}
        <h2 className="h2-text md:w-[800px] lg:w-[63.542vw]">
          The Clarida Difference:
          <br />
          <span className="mt-5 md:mt-3 inline-block">
            Precision-Timed{" "}
            <span className="h2-text-bold">Vision Recovery</span>
          </span>
        </h2>

        {/* Button */}
        <Button
          width="w-[200px] md:w-[200px] lg:w-[12.365vw]"
          height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
          extra="gap-2 mt-5 lg:mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
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
};

export default ClaridaDifference;
