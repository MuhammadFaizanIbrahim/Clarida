// InteractiveRegenerationFrames.jsx
import React, { useLayoutEffect, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";

gsap.registerPlugin(ScrollTrigger);

// ----------------- FRAME SETUP -----------------
const TOTAL_FRAMES = 360;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/InteractiveRegeneration/frame_${index}.webp`;
});

// key frames where each step should peak
const STEP_KEY_FRAMES = [80, 160, 230, 280, 330];
const FIRST_STORY_FRAME = STEP_KEY_FRAMES[0];

// ----------------- TEXT STEPS -----------------
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

  // ---------- AUDIO STATE / REFS ----------
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [isInView, setIsInView] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  const isInViewRef = useRef(false);
  const isAudioOnRef = useRef(false);

  // ---------- FADE HELPER (same pattern as Hero) ----------
  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeTo = (audio, targetVolume, durationMs) => {
    if (!audio) return;

    clearFadeInterval();

    if (targetVolume === 0 && audio.paused) {
      audio.volume = 1;
      return;
    }

    const startVolume =
      typeof audio.volume === "number" ? audio.volume : targetVolume > 0 ? 0 : 1;
    const totalSteps = Math.max(Math.round(durationMs / 50), 1); // ~20 FPS
    let step = 0;
    const volumeDiff = targetVolume - startVolume;

    // if fading IN, ensure playback starts
    if (targetVolume > 0 && audio.paused) {
      audio.loop = true;
      audio
        .play()
        .catch(() => {
          // autoplay blocked – ignore
        });
    }

    // instant jump
    if (durationMs <= 0) {
      audio.volume = targetVolume;
      if (targetVolume === 0) {
        audio.pause();
        audio.volume = 1;
      }
      return;
    }

    fadeIntervalRef.current = setInterval(() => {
      const shouldPlayNow = isInViewRef.current && isAudioOnRef.current;

      // if we were fading in but conditions are no longer valid
      if (targetVolume > 0 && !shouldPlayNow) {
        clearFadeInterval();
        audio.pause();
        audio.volume = 1;
        return;
      }

      step += 1;
      const t = Math.min(step / totalSteps, 1);
      const nextVolume = startVolume + volumeDiff * t;
      audio.volume = Math.min(Math.max(nextVolume, 0), 1);

      if (t >= 1) {
        clearFadeInterval();
        if (targetVolume === 0) {
          audio.pause();
          audio.volume = 1;
        }
      }
    }, 50);
  };

  // ---------- INITIAL SYNC WITH GLOBAL AUDIO FLAG ----------
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.__claridaAudioOn === "boolean"
    ) {
      const globalOn = window.__claridaAudioOn;
      setIsAudioOn(globalOn);
      isAudioOnRef.current = globalOn;
    }
  }, []);

  // ---------- SCROLL VISIBILITY (center-based like Hero) ----------
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      const center = rect.top + rect.height / 2;
      const inView = center > vh * 0.15 && center < vh * 0.85;

      setIsInView(inView);
      isInViewRef.current = inView;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // ---------- LISTEN TO GLOBAL HEADER AUDIO TOGGLE ----------
  useEffect(() => {
    const handleAudioToggle = (e) => {
      const { isOn } = e.detail || {};
      const nextState = !!isOn;

      if (typeof window !== "undefined") {
        window.__claridaAudioOn = nextState;
      }

      setIsAudioOn(nextState);
      isAudioOnRef.current = nextState;
    };

    window.addEventListener("clarida-audio-toggle", handleAudioToggle);
    return () => {
      window.removeEventListener("clarida-audio-toggle", handleAudioToggle);
    };
  }, []);

  // ---------- SINGLE SOURCE OF TRUTH FOR PLAY / PAUSE ----------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = isInView && isAudioOn;
    isInViewRef.current = isInView;
    isAudioOnRef.current = isAudioOn;

    if (shouldPlay) {
      fadeTo(audio, 1, 600); // fade in
    } else {
      fadeTo(audio, 0, 800); // smooth fade out
    }
  }, [isInView, isAudioOn]);

  // ---------- CLEANUP ON UNMOUNT ----------
  useEffect(() => {
    return () => {
      clearFadeInterval();
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.volume = 1;
      }
    };
  }, []);

  // ----------------- GSAP FRAMES / TIMELINE -----------------
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const timeBar = timeBarRef.current;
    const totalScroll = timeBar?.scrollWidth - window.innerWidth;

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
      const segmentShift = vw; // how much to move timeBar so the next tick centers

      // 🔹 initial state: bar off-screen right + invisible
      gsap.set(timeBar, { x: vw, opacity: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + totalScroll,
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
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
          const lastKeyFrame =
            STEP_KEY_FRAMES[STEP_KEY_FRAMES.length - 1];

          if (frameIndex < FIRST_STORY_FRAME) {
            // slide in from off-screen right → center BY frame 80
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

          // 🔹 fade in the whole timeline only near frame 80
          let barOpacity = 0;
          const FADE_IN_START = FIRST_STORY_FRAME - 15; // start fading a bit before 80
          const FADE_IN_END = FIRST_STORY_FRAME + 5; // fully visible shortly after 80

          if (frameIndex <= FADE_IN_START) {
            barOpacity = 0;
          } else if (frameIndex >= FADE_IN_END) {
            barOpacity = 1;
          } else {
            const t =
              (frameIndex - FADE_IN_START) /
              (FADE_IN_END - FADE_IN_START || 1);
            barOpacity = t;
          }

          gsap.set(timeBar, {
            x: barX,
            opacity: barOpacity,
          });

          // ----- TEXT + TICK FOCUS AT SPECIFIC FRAMES -----
          const fadeFrames = 20; // width of fade around each key frame
          const maxY = 16; // px movement for text

          storySteps.forEach((_, i) => {
            const textEl = textRefs.current[i];
            const tickEl = tickRefs.current[i];
            if (!textEl || !tickEl) return;

            const kf = STEP_KEY_FRAMES[i];
            const distance = Math.abs(frameIndex - kf);

            let opacity = 0;
            if (distance <= fadeFrames) {
              opacity = 1 - distance / fadeFrames;
            }

            const y = maxY * (1 - opacity); // 16 → 0 → 16

            gsap.set(textEl, { opacity, y });

            // ticks: no fade, just scale highlight
            gsap.set(tickEl, {
              opacity: 1,
              scale: opacity > 0.7 ? 1.1 : 1,
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
    if (w < 1500) {
      // tablet
      return `calc(56.15vw + ${index * tickSpacingVW}vw)`;
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
        className="h-full w-full object-cover md:object-fill"
      />

      {/* 🔊 SECTION AUDIO (change the src to your actual file) */}
      <audio
        ref={audioRef}
        src="/audios/interactiveRegeneration.mp3"
        preload="auto"
        loop
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 md:bg-black/35 lg:bg-black/40 pointer-events-none" />

      {/* TEXT OVERLAYS – one per step, controlled by GSAP */}
      {storySteps.map((step, index) => (
        <div
          key={index}
          ref={(el) => (textRefs.current[index] = el)}
          className="absolute inset-0 flex flex-col items-center top-[67%] md:top-[70%] lg:top-[67%] 2xl:top-[70%] text-center px-6 gap-6 lg:gap-0 2xl:gap-6"
          style={{
            opacity: 0,
            transform: "translateY(0px)",
            transition: "opacity 0.15s linear, transform 0.15s linear",
          }}
        >
          <p className="h3-text">{step.text}</p>

          {step.showButton && (
            <Button
              width="w-[220px] md:w-[220px] lg:w-[15em]"
              height="h-[48px] md:h-[46px] lg:h-[2.9vw]"
              extra="gap-2 lg:gap-3 lg:py-[10px] lg:px-[18px] flex"
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

      {/* BOTTOM TIMELINE – ticks only, no timestamps */}
      <div
        ref={timeBarRef}
        className="
          pointer-events-none absolute bottom-8 md:bottom-10 lg:bottom-6 2xl:bottom-14
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
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[56.2vw] 2xl:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[43.73vw] 2xl:right-[45.73vw] bg-(--color-text)"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          {/* ticks – first tick is at 50vw, others every 100vw to the right */}
          {storySteps.map((item, index) => (
            <div
              key={index}
              ref={(el) => (tickRefs.current[index] = el)}
              className="absolute flex flex-col items-center top-[34%] md:top-[26%] lg:top-[25%]"
              style={{
                left: getTickLeft(index),
                transform: "translateY(-50%)",
                opacity: 1,
                transition: "transform 0.15s linear",
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
