// ClaridaDifferenceFrames.jsx
import React, { useLayoutEffect, useRef, useState, useEffect } from "react"; // ⬅️ added useEffect
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 75;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/GlobalCommunityImpactNew/frame_${index}.webp`;
});

const GlobalCommunityImpact = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [isOpen, setIsOpen] = useState(false); // accordion state

  // 🔹 NEW: cache for preloaded frames + last frame index
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
      img.src = framePaths[0];
      gsap.set(text, { opacity: 1, filter: "blur(0px)" });
      return;
    }

    let ctx = gsap.context(() => {
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
          const progress = self.progress;

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

          const FADE_END = 0.65;

          let finalT = 0;
          if (progress <= FADE_END) {
            finalT = progress / FADE_END;
          } else {
            finalT = 1;
          }

          const maxBlur = 14;
          const blur = maxBlur * (1 - finalT);
          const opacity = 0.1 + 0.9 * finalT;

          gsap.set(text, {
            opacity,
            filter: `blur(${blur}px)`,
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile]); // ⬅️ depend on isMobile like before

  return (
    <section ref={sectionRef} className="relative h-screen w-screen">
      {/* FRAME IMAGE */}
      <img
        ref={imgRef}
        src={framePaths[0]}
        alt="Global Clarida Community"
        className="h-full w-full object-cover"
      />

      {/* TEXT + ACCORDION OVERLAY */}
      <div
        ref={textRef}
        className="absolute left-0 md:-left-40 lg:left-30 2xl:left-40 top-0 h-full flex flex-col gap-2 md:gap-8 justify-center items-center text-center w-full lg:w-[46%] z-20"
        style={{
          opacity: 0,
          filter: "blur(14px)",
          transition: "opacity 0.15s linear, filter 0.15s linear",
        }}
      >
        {/* Heading */}
        <h2 className="h2-text w-[400px] md:w-[600px] lg:w-[700px] 2xl:w-[950px]">
          One World. One <span className="h2-text-bold">Vision.</span>
        </h2>

        {/* Paragraph */}
        <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px] md:mt-3">
          From New York to Nairobi, Sydney to São Paulo—millions are waiting to
          reclaim their clarity.
        </p>

        {/* Arrow Icon */}
        <img
          src="icons/arrowIcon.svg"
          alt="Toggle Clarida details"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            border border-white rounded-full
            w-6 h-6 lg:w-[25px] lg:h-[25px] mt-5 md:mt-0
            p-[5px]
            hover:bg-[rgba(255,255,255,0.25)]
            cursor-pointer transition-transform duration-300
            ${isOpen ? "rotate-180" : ""}
          `}
        />

        {/* Accordion + Button group */}
        <div className="w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px] flex flex-col items-center">
          {/* Accordion Content */}
          <div
            className="
              w-full overflow-hidden
              transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
            "
            style={{ maxHeight: isOpen ? "320px" : "0px" }}
          >
            <div
              className={`
                transition-opacity duration-300
                text-center
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px]">
                Clarida is more than a product or protocol. It’s a movement of
                individuals who refuse to accept vision loss as their final
                story. Together, we are building a future where clarity returns,
                independence is restored, and hope is shared across every
                horizon.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            width="w-[250px] md:w-[220px] lg:w-[15vw]"
            height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
            extra="gap-2 mt-5 lg:mt-10 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Join The Clarida Network
            <img
              src="icons/arrowIcon.svg"
              alt="Clarida Text"
              className="rotate-270"
            />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GlobalCommunityImpact;
