import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";

gsap.registerPlugin(ScrollTrigger);

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 100;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/VisionaryGuarantee/frame_${index}.webp`;
});

// key frames where each step should peak
const STEP_KEY_FRAMES = [10, 25, 37, 50, 60, 70, 80, 99];
const FIRST_STORY_FRAME = STEP_KEY_FRAMES[0];

// ----------------- TEXT STEPS -----------------
// ----------------- TEXT STEPS -----------------
const storySteps = [
  {
    // “This isn’t about” / “supplements”
    content: (
      <>
        This isn’t about
        <br />
        <span className="section-5-text-bold">supplements</span>
      </>
    ),
  },
  {
    // “It’s about / Rhythm, Signals & biology / reawakened”
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
    // “A protocol timed to your body’s own / intelligence”
    content: (
      <>
        A protocol timed to your body’s own
        <br />
        <span className="section-5-text-bold">intelligence</span>
      </>
    ),
  },
  {
    // “Rooted in circadian and / regenerative science”
    content: (
      <>
        Rooted in circadian and
        <span className="section-5-text-bold"> regenerative</span><br /> science
      </>
    ),
  },
  {
    // “And backed by a / promise”
    content: (
      <>
        And backed by a
        <br />
        <span className="section-5-text-bold">promise</span>
      </>
    ),
  },
  {
    // If you don’t feel the shift…
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
  {
    // “Because real vision isn’t just what you see”
    content: <>Because real vision isn’t just what you see</>,
  },
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

const VisionaryGuarantee = () => {
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

      storySteps.forEach((_, i) => {
        const el = textRefs.current[i];
        if (!el) return;
        gsap.set(el, { opacity: i === storySteps.length - 1 ? 1 : 0, y: 0 });
      });

      gsap.set(timeBar, { opacity: 0 });
      return;
    }

    let ctx = gsap.context(() => {
      img.src = framePaths[0];

      const lastFrameIndex = TOTAL_FRAMES - 1;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const segmentShift = vw; // how much to move timeBar so the next tick centers

      // initial state: bar off-screen right + invisible
      gsap.set(timeBar, { x: vw, opacity: 0 });

      // 🔹 FIX: use a fixed scroll distance (e.g. 6 viewheights) instead of scrollWidth
      const totalScroll = vh * 4;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + totalScroll,
        scrub: true, // tight lock to scroll
        pin: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress; // 0 → 1

          // ----- FRAME SCRUB -----
          const frameIndex = Math.min(
            lastFrameIndex,
            Math.floor(progress * lastFrameIndex)
          );
          const nextSrc = framePaths[frameIndex];
          if (img.src !== window.location.origin + nextSrc) {
            img.src = nextSrc;
          }

          // ----- TIMELINE SLIDING IN FROM RIGHT -----
          let barX;
          const lastKeyFrame = STEP_KEY_FRAMES[STEP_KEY_FRAMES.length - 1];

          if (frameIndex < FIRST_STORY_FRAME) {
            // slide in from off-screen right → center by FIRST_STORY_FRAME
            const t = frameIndex / FIRST_STORY_FRAME; // 0 → 1
            barX = gsap.utils.interpolate(vw, 0, t); // x: vw → 0
          } else if (frameIndex >= lastKeyFrame) {
            // clamp to last tick centered
            barX = -segmentShift * (STEP_KEY_FRAMES.length - 1);
          } else {
            // between keyframes, move bar left step-by-step
            let segIndex = 0;
            for (let i = 0; i < STEP_KEY_FRAMES.length - 1; i++) {
              if (
                frameIndex >= STEP_KEY_FRAMES[i] &&
                frameIndex < STEP_KEY_FRAMES[i + 1]
              ) {
                segIndex = i;
                break;
              }
            }

            const startFrame = STEP_KEY_FRAMES[segIndex];
            const endFrame = STEP_KEY_FRAMES[segIndex + 1];
            const localT =
              (frameIndex - startFrame) / (endFrame - startFrame || 1);

            const startX = -segmentShift * segIndex;
            const endX = -segmentShift * (segIndex + 1);
            barX = gsap.utils.interpolate(startX, endX, localT);
          }

          // fade in the whole timeline only near FIRST_STORY_FRAME
          let barOpacity = 0;
          const FADE_IN_START = FIRST_STORY_FRAME - 5;
          const FADE_IN_END = FIRST_STORY_FRAME + 5;

          if (frameIndex <= FADE_IN_START) {
            barOpacity = 0;
          } else if (frameIndex >= FADE_IN_END) {
            barOpacity = 1;
          } else {
            const t =
              (frameIndex - FADE_IN_START) / (FADE_IN_END - FADE_IN_START || 1);
            barOpacity = t;
          }

          gsap.set(timeBar, {
            x: barX,
            opacity: barOpacity,
            willChange: "transform, opacity",
          });

          // ----- TEXT + TICK FOCUS (ONLY ONE ACTIVE AT A TIME) -----
          const fadeFrames = 8; // smaller = snappier
          const maxY = 16; // px movement for text

          // 1) find closest keyframe to current frame
          let activeIndex = 0;
          let minDistance = Infinity;
          STEP_KEY_FRAMES.forEach((kf, i) => {
            const d = Math.abs(frameIndex - kf);
            if (d < minDistance) {
              minDistance = d;
              activeIndex = i;
            }
          });

          // 2) apply opacity only to that active index
          storySteps.forEach((_, i) => {
            const textEl = textRefs.current[i];
            const tickEl = tickRefs.current[i];
            if (!textEl || !tickEl) return;

            const kf = STEP_KEY_FRAMES[i];
            const distance = Math.abs(frameIndex - kf);

            let opacity = 0;
            if (i === activeIndex && distance <= fadeFrames) {
              opacity = 1 - distance / fadeFrames; // fade in → 1 → fade out
            }

            const y = maxY * (1 - opacity); // move from slightly down → center → down

            gsap.set(textEl, { opacity, y, willChange: "transform, opacity" });

            // ticks: always visible, but only active one scales
            gsap.set(tickEl, {
              opacity: 1,
              scale: i === activeIndex ? 1.1 : 1,
              willChange: "transform",
            });
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // TIMELINE GEOMETRY – same style as RegenerationTimeline but no labels
  const tickCount = storySteps.length;
  const tickSpacingVW = 100;
  const timeBarWidthVW = tickCount * tickSpacingVW;
  const timeBarWidthVWTablet = timeBarWidthVW;
  const timeBarWidthVWMobile = timeBarWidthVW;

  const getTickLeft = (index) => {
    const w = window.innerWidth;

    if (w < 480) {
      // small mobile
      return `calc(65vw + ${index * tickSpacingVW}vw)`;
    }
    if (w < 768) {
      // normal mobile
      return `calc(42.5vw + ${index * tickSpacingVW}vw)`;
    }
    if (w < 1024) {
      // tablet
      return `calc(55.8vw + ${index * tickSpacingVW}vw)`;
    }

    // desktop
    return `calc(54.2vw + ${index * tickSpacingVW}vw)`;
  };

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
        className="h-full w-full object-cover lg:object-fill"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* TEXT OVERLAYS – one per step, controlled by GSAP */}
      {storySteps.map((step, index) => (
        <div
          key={index}
          ref={(el) => (textRefs.current[index] = el)}
          className="absolute inset-0 flex flex-col items-center text-center justify-center px-6 gap-6"
          style={{
            opacity: 0,
            transform: "translateY(0px)",
          }}
        >
          <p className="section-5-text">{step.content}</p>
        </div>
      ))}

      {/* BOTTOM TIMELINE – ticks only, no timestamps */}
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
          {/* base line */}
          <div
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[45.73vw] bg-(--color-text)"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          {/* ticks – one per story step */}
          {storySteps.map((item, index) => (
            <div
              key={index}
              ref={(el) => (tickRefs.current[index] = el)}
              className="absolute flex flex-col items-center top-[34%] md:top-[26%] lg:top-[25%]"
              style={{
                left: getTickLeft(index),
                transform: "translateY(-50%)",
                opacity: 1,
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

export default VisionaryGuarantee;
