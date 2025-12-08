// ClaridaDifferenceFrames.jsx
import React, { useLayoutEffect, useRef, useEffect } from "react"; // ⬅️ added useEffect
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

// adjust if you change frame count
const TOTAL_FRAMES = 61;

// build frame paths: frame_00001.webp ... frame_00061.webp
const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/ClaridaDifference/frame_${index}.webp`;
});

const ClaridaDifference = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // 🔹 NEW: cache preloaded images + last frame index
  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  // 🔹 NEW: preload all frames once
  useEffect(() => {
    const images = framePaths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    preloadedFramesRef.current = images;
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const text = textRef.current;
    if (!section || !img || !text) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // No scroll scrub: just show first frame + readable text
      img.src = framePaths[0];
      gsap.set(text, { opacity: 1, filter: "blur(0px)" });
      return;
    }

    let ctx = gsap.context(() => {
      // ensure first frame is shown initially
      img.src = framePaths[0];

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

          // ----- FRAME SCRUB (optimized) -----
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * (TOTAL_FRAMES - 1))
          );

          if (frameIndex !== lastFrameIndexRef.current) {
            lastFrameIndexRef.current = frameIndex;

            const preloaded = preloadedFramesRef.current[frameIndex];
            const nextSrc = preloaded?.src || framePaths[frameIndex];

            if (img.src !== nextSrc) {
              img.src = nextSrc;
            }
          }

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

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
    >
      {/* FRAME IMAGE */}
      <img
        ref={imgRef}
        src={framePaths[0]} // initial fallback
        alt="The Clarida Difference"
        className="h-full w-full object-cover"
      />

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
