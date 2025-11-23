// InteractiveRegenerationFrames.jsx
import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";

gsap.registerPlugin(ScrollTrigger);

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 447;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/InteractiveRegenerationSectionVideoFrames/frame_${index}.webp`;
});

// ----------------- TEXT STEPS + TIMELINE LABELS -----------------
const storySteps = [
  {
    text: "The zebrafish contains one of biology's deepest secrets:",
  },
  {
    text: "How to regrow the retina itself.",
  },
  {
    text: "When its retina is damaged, a special kind of cell—Müller glia—awakens.",
  },
  {
    text: "The zebrafish's healing isn't random, it's regeneration.",
  },
  {
    text: "Clarida isn't just a product—it's a regenerative rhythm.",
    showButton: true,
  },
];

const InteractiveRegeneration = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const textRefs = useRef([]); // one ref per text step
  const timeBarRef = useRef(null);
  const tickRefs = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const timeBar = timeBarRef.current;
    if (!section || !img || !timeBar) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      img.src = framePaths[0];

      // only final text visible if reduced motion
      storySteps.forEach((_, i) => {
        const el = textRefs.current[i];
        if (!el) return;
        gsap.set(el, { opacity: i === storySteps.length - 1 ? 1 : 0 });
      });

      return;
    }

    let ctx = gsap.context(() => {
      img.src = framePaths[0];

      // width-based scroll distance, like RegenerationTimeline
      const totalScroll = timeBar.scrollWidth - window.innerWidth;

      gsap.to(timeBar, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=9000",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
          
            // ----- FRAME SCRUB -----
            const frameIndex = Math.min(
              TOTAL_FRAMES - 1,
              Math.floor(progress * (TOTAL_FRAMES - 1))
            );
            const nextSrc = framePaths[frameIndex];
            if (img.src !== window.location.origin + nextSrc) {
              img.src = nextSrc;
            }
          
            // ----- TEXT FADE BASED ON TICK CENTER -----
            const barX = gsap.getProperty(timeBar, "x"); 
            const vw = window.innerWidth;
            const centerX = vw / 2;
          
            tickRefs.current.forEach((tickEl, index) => {
              const textEl = textRefs.current[index];
              if (!tickEl || !textEl) return;
          
              // tick center position in viewport
              const tickRect = tickEl.getBoundingClientRect();
              const tickCenter = tickRect.left + tickRect.width / 2;
          
              const distance = Math.abs(tickCenter - centerX);
              const normalized = distance / centerX; // 0 = perfect center, 1 = edge
          
              let opacity = 0;
              if (normalized <= 0.25) {
                opacity = 1; // fully visible when near center
              } else if (normalized >= 0.9) {
                opacity = 0; // fully gone
              } else {
                opacity = 1 - (normalized - 0.25) / (0.9 - 0.25); // smooth fade
              }
          
              gsap.set(textEl, { opacity });
              gsap.set(tickEl, { opacity: opacity > 0.7 ? 1 : 0.4, scale: opacity > 0.7 ? 1.1 : 1 });
            });
          }
          
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // TIMELINE GEOMETRY – match RegenerationTimeline
  const tickCount = storySteps.length;
  const tickSpacingVW = 100;
  const timeBarWidthVW = tickCount * tickSpacingVW;
  const timeBarWidthVWTablet = timeBarWidthVW;
  const timeBarWidthVWMobile = timeBarWidthVW;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
    >
      {/* FRAME BACKGROUND */}
      <img
        ref={imgRef}
        src={framePaths[0]}
        alt="Zebrafish regeneration sequence"
        className="h-full w-full"
      />

      {/* Slight dark overlay to help text readability */}
      <div className="absolute inset-0 bg-black/30 md:bg-black/35 lg:bg-black/40 pointer-events-none" />

      {/* TEXT OVERLAYS – stacked, controlled by opacity */}
      {storySteps.map((step, index) => (
        <div
          key={index}
          ref={(el) => (textRefs.current[index] = el)}
          className="absolute inset-0 flex flex-col items-center top-[70%] text-center px-6 gap-6"
          style={{
            opacity: 0,
            transition: "opacity 0.15s linear",
          }}
        >
          <p className="h3-text">
            {step.text}
          </p>

          {step.showButton && (
            <Button
              width="w-[220px] md:w-[220px] lg:w-[13vw]"
              height="h-[48px] md:h-[46px] lg:h-[2.9vw]"
              extra="gap-2 mt-4 lg:mt-6 lg:gap-3 lg:py-[10px] lg:px-[18px] flex"
            >
              Watch Full Explainer
              <img
                src="icons/arrowIcon.svg"
                alt="Watch explainer"
                className="rotate-270"
              />
            </Button>
          )}
        </div>
      ))}

      {/* BOTTOM TIMELINE – same layout behavior as RegenerationTimeline */}
      <div
        ref={timeBarRef}
        className="
          pointer-events-none absolute bottom-8 md:bottom-10 lg:bottom-14
          -left-17 md:-left-17 lg:-left-21 z-20
          w-(--timebar-width-mobile)
          sm:w-(--timebar-width-tablet)
          lg:w-(--timebar-width-desktop)
        "
        style={{
          "--timebar-width-mobile": `${timeBarWidthVWMobile}vw`,
          "--timebar-width-tablet": `${timeBarWidthVWTablet}vw`,
          "--timebar-width-desktop": `${timeBarWidthVW}vw`,
        }}
      >
        <div className="relative h-[60px]">
          {/* base line (same offsets as Regeneration, just vertically centered here) */}
          <div
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[120.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[46vw] bg-(--color-text)"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          {/* ticks + labels */}
          {storySteps.map((item, index) => (
            <div
              key={index}
              ref={(el) => (tickRefs.current[index] = el)}
              className="absolute flex flex-col items-center"
              style={{
                top: "25%",
                left: `calc(120.2vw + ${index * tickSpacingVW}vw)`,
                transform: "translateY(-50%)",
                opacity: index === 0 ? 1 : 0.4,
                transition: "opacity 0.15s linear",
              }}
            >
              <div className="h-6 md:h-8 w-px bg-(--color-text) mb-1" />        
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveRegeneration;
