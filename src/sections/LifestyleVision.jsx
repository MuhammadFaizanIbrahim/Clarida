import React, { useLayoutEffect, useRef } from "react";
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
  return `/frames/LifestyleVision/frame_${index}.webp`;
});

const LifestyleVision = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
      img.src = framePaths[0];

      const maxBlur = 14;

      // 🔹 IMPORTANT: start in the same state as progress = 0
      gsap.set(text, {
        opacity: 0.1,
        filter: `blur(${maxBlur}px)`,
      });

      var scrollDistance;
      if(isMobile){
       scrollDistance = window.innerHeight * 1;
      }
      else{
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

          // ----- FRAME SCRUB -----
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * (TOTAL_FRAMES - 1))
          );
          const nextSrc = framePaths[frameIndex];
          if (img.src !== window.location.origin + nextSrc) {
            img.src = nextSrc;
          }

          const FADE_END = 0.65;

          let finalT = 0;
          if (progress <= FADE_END) {
            finalT = progress / FADE_END; // 0 → 1
          } else {
            finalT = 1;
          }

          const blur = maxBlur * (1 - finalT);     // 14 → 0
          const opacity = 0.1 + 0.9 * finalT;      // 0.1 → 1

          gsap.set(text, {
            opacity,
            filter: `blur(${blur}px)`,
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end justify-between text-white overflow-hidden"
    >
      <img
        ref={imgRef}
        src={framePaths[0]} // initial fallback
        alt="The Clarida Difference"
        className="absolute h-full w-full object-cover"
      />

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
           Clarida Isn’t Just About<span className="h2-text-bold"><br /> Vision. </span>
           It’s About <span className="h2-text-bold">Life</span>
          </h1>

          {!isMobile && (
            <Button
              width="w-[235px] md:w-[250px] lg:w-[16.302vw]"
              height="h-[48px] md:h-[48px] lg:h-[2.917vw]"
              extra="gap-2 mt-5 md:mt-2 lg:mt-0 2xl:mt-2 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
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
