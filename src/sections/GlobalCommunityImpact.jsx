// ClaridaDifferenceFrames.jsx
import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 150;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/GlobalCommunityImpact/frame_${index}.webp`;
});

const GlobalCommunityImpact = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false); // accordion state

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

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=2200",
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;

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
  }, []);

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
        className="absolute left-0 md:-left-40 lg:left-40 top-0 h-full flex flex-col gap-2 md:gap-8 justify-center items-center text-center w-full lg:w-[46%] z-20"
        style={{
          opacity: 0,
          filter: "blur(14px)",
          transition: "opacity 0.15s linear, filter 0.15s linear",
        }}
      >
        {/* Heading */}
        <h2 className="h2-text w-[400px] md:w-[600px] lg:w-[950px]">
          One World. One <span className="h2-text-bold">Vision.</span>
        </h2>

        {/* Paragraph */}
        <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[950px] md:mt-3">
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
        <div className="w-[350px] md:w-[600px] lg:w-[950px] flex flex-col items-center">
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
              <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[950px]">
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
