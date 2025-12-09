import React, { useLayoutEffect, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 61;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/LifestyleVision/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const LifestyleVision = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // caches for performance
  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // 🔹 preload all frames once (same behavior as before)
  useEffect(() => {
    const images = framePaths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    preloadedFramesRef.current = images;
  }, []);

  // 🔹 draw first frame ASAP to avoid blank flash
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

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgAspect = imgW / imgH;
      const canvasAspect = rect.width / rect.height;

      let drawW, drawH, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        // image wider → match height, crop sides
        drawH = rect.height;
        drawW = drawH * imgAspect;
        offsetX = (rect.width - drawW) / 2;
        offsetY = 0;
      } else {
        // taller/narrower → match width, crop top/bottom
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

    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      logicalWidthRef.current = rect.width;
      logicalHeightRef.current = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // redraw last frame on resize
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

      // if exact not ready, grab nearest loaded
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

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgAspect = imgW / imgH;
      const canvasAspect = w / h;

      let drawW, drawH, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        // image wider → fit height
        drawH = h;
        drawW = drawH * imgAspect;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
      } else {
        // image taller → fit width
        drawW = w;
        drawH = drawW / imgAspect;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
      }

      ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const maxBlur = 14;

    if (prefersReducedMotion) {
      // same reduced-motion behavior: just show first frame + readable text
      gsap.set(text, { opacity: 1, filter: "blur(0px)" });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    let ctx = gsap.context(() => {
      // start text in the same state as progress = 0
      gsap.set(text, {
        opacity: 0.1,
        filter: `blur(${maxBlur}px)`,
      });

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

          // ----- FRAME SCRUB via CANVAS -----
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * (TOTAL_FRAMES - 1))
          );

          if (frameIndex !== lastFrameIndexRef.current) {
            lastFrameIndexRef.current = frameIndex;
            drawFrame(frameIndex);
          }

          const FADE_END = 0.65;

          let finalT = 0;
          if (progress <= FADE_END) {
            finalT = progress / FADE_END; // 0 → 1
          } else {
            finalT = 1;
          }

          const blur = maxBlur * (1 - finalT); // 14 → 0
          const opacity = 0.1 + 0.9 * finalT; // 0.1 → 1

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
      className="relative h-screen flex items-end justify-between text-white overflow-hidden"
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
};

export default LifestyleVision;
