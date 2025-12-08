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

const FIRST_FRAME_SRC = framePaths[0];

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
  const canvasRef = useRef(null);
  const textRefs = useRef([]); // one ref per text step
  const timeBarRef = useRef(null);
  const tickRefs = useRef([]);

  const preloadedFramesRef = useRef([]); // array of Image | null
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // ---------- AUDIO STATE / REFS ----------
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [isInView, setIsInView] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  const isInViewRef = useRef(false);
  const isAudioOnRef = useRef(false);

  // ---------- FADE HELPER ----------
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
    const totalSteps = Math.max(Math.round(durationMs / 50), 1); // ~20 steps/sec
    let step = 0;
    const volumeDiff = targetVolume - startVolume;

    if (targetVolume > 0 && audio.paused) {
      audio.loop = true;
      audio
        .play()
        .catch(() => {
          // autoplay blocked – ignore
        });
    }

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

  // ---------- PRELOAD FRAMES *INCREMENTALLY* ----------
  useEffect(() => {
    let isCancelled = false;

    // reserve array
    preloadedFramesRef.current = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        preloadedFramesRef.current[index] = img;
      };

      img.onerror = () => {
        if (isCancelled) return;
        preloadedFramesRef.current[index] = null;
      };
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // ---------- DRAW FIRST FRAME ASAP ----------
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

      ctx2d.clearRect(0, 0, rect.width, rect.height);
      ctx2d.drawImage(img, 0, 0, rect.width, rect.height);
    };
  }, []);

  // ---------- INITIAL SYNC WITH GLOBAL AUDIO ----------
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

  // ---------- VISIBILITY ----------
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
      fadeTo(audio, 1, 600);
    } else {
      fadeTo(audio, 0, 800);
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

  // ----------------- GSAP FRAMES / TIMELINE (CANVAS) -----------------
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const timeBar = timeBarRef.current;
    if (!section || !canvas || !timeBar) return;

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
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawFrame = (frameIndex) => {
      const frames = preloadedFramesRef.current;
      const w = logicalWidthRef.current || canvas.clientWidth;
      const h = logicalHeightRef.current || canvas.clientHeight;
      if (!w || !h || !frames || !frames.length) return;

      // Prefer exact frame
      let img = frames[frameIndex];

      // If exact frame not loaded yet, find nearest loaded frame
      if (!img) {
        // search backwards
        for (let i = frameIndex - 1; i >= 0; i--) {
          if (frames[i]) {
            img = frames[i];
            break;
          }
        }
        // or forwards
        if (!img) {
          for (let i = frameIndex + 1; i < frames.length; i++) {
            if (frames[i]) {
              img = frames[i];
              break;
            }
          }
        }
      }

      // If still nothing is loaded yet, do nothing (first frame already drawn separately)
      if (!img) return;

      ctx2d.clearRect(0, 0, w, h);
      ctx2d.drawImage(img, 0, 0, w, h);
    };

    if (prefersReducedMotion) {
      // Just show last text, hide timeline; image is already on first frame
      storySteps.forEach((_, i) => {
        const el = textRefs.current[i];
        if (!el) return;
        gsap.set(el, { opacity: i === storySteps.length - 1 ? 1 : 0, y: 0 });
      });

      gsap.set(timeBar, { opacity: 0 });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    const lastFrameIndex = TOTAL_FRAMES - 1;
    const vw = window.innerWidth;
    const segmentShift = vw;

    gsap.set(timeBar, {
      x: vw,
      opacity: 0,
      willChange: "transform, opacity",
    });

    const totalScroll = window.innerHeight * 4; // fixed scroll distance

    const gsapCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + totalScroll,
        scrub: 0.2, // slightly smoothed
        pin: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress; // 0 → 1

          // ----- FRAME SCRUB -----
          const rawIndex = progress * lastFrameIndex;
          const frameIndex = Math.min(
            lastFrameIndex,
            Math.floor(rawIndex)
          );

          if (frameIndex !== lastFrameIndexRef.current) {
            lastFrameIndexRef.current = frameIndex;
            drawFrame(frameIndex);
          }

          // ----- TIMELINE SLIDING IN FROM RIGHT -----
          let barX;
          const lastKeyFrame = STEP_KEY_FRAMES[STEP_KEY_FRAMES.length - 1];

          if (frameIndex < FIRST_STORY_FRAME) {
            const t = frameIndex / FIRST_STORY_FRAME;
            barX = gsap.utils.interpolate(vw, 0, t);
          } else if (frameIndex >= lastKeyFrame) {
            barX = -segmentShift * (STEP_KEY_FRAMES.length - 1);
          } else {
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

          let barOpacity = 0;
          const FADE_IN_START = FIRST_STORY_FRAME - 15;
          const FADE_IN_END = FIRST_STORY_FRAME + 5;

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

          // ----- TEXT + TICK FOCUS -----
          const fadeFrames = 20;
          const maxY = 16;

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

            const y = maxY * (1 - opacity);

            gsap.set(textEl, { opacity, y });

            gsap.set(tickEl, {
              opacity: 1,
              scale: opacity > 0.7 ? 1.1 : 1,
            });
          });
        },
      });
    }, section);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      gsapCtx.revert();
    };
  }, []);

  // TIMELINE GEOMETRY – same style as before
  const tickCount = storySteps.length;
  const tickSpacingVW = 100;
  const timeBarWidthVW = tickCount * tickSpacingVW;
  const timeBarWidthVWTablet = timeBarWidthVW;
  const timeBarWidthVWMobile = timeBarWidthVW;

  const getTickLeft = (index) => {
    const w = window.innerWidth;

    if (w < 480) {
      return `calc(65vw + ${index * tickSpacingVW}vw)`;
    }
    if (w < 768) {
      return `calc(42.5vw + ${index * tickSpacingVW}vw)`;
    }
    if (w < 1024) {
      return `calc(55.8vw + ${index * tickSpacingVW}vw)`;
    }
    if (w < 1500) {
      return `calc(56.15vw + ${index * tickSpacingVW}vw)`;
    }
    return `calc(54.2vw + ${index * tickSpacingVW}vw)`;
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url(${FIRST_FRAME_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* FRAME BACKGROUND: CANVAS */}
      <canvas ref={canvasRef} className="h-full w-full block" />

      {/* 🔊 SECTION AUDIO */}
      <audio
        ref={audioRef}
        src="/audios/interactiveRegeneration.mp3"
        preload="auto"
        loop
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 md:bg-black/35 lg:bg-black/40 pointer-events-none" />

      {/* TEXT OVERLAYS */}
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

      {/* BOTTOM TIMELINE */}
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
          <div
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[56.2vw] 2xl:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[43.73vw] 2xl:right-[45.73vw] bg-(--color-text)"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

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
