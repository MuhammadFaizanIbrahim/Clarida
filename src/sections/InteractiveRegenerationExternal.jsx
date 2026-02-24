// src/sections/InteractiveRegenerationExternal.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useMotionValueEvent } from "framer-motion";
import Button from "../components/Button.jsx";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

const TOTAL_FRAMES = 625;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/InteractiveRegenerationFull/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const STEP_KEY_FRAMES = [40, 160, 243, 330, 438, 535];

const storySteps = [
  { text: "The zebrafish contains one of biology's deepest secrets:" },
  { text: "How to regrow its own retina." },
  { text: "When a zebrafish's retina is damaged" },
  {
    text: "a unique cell (Müller glia) awakens and begins rebuilding",
  },
  { text: "The zebrafish's healing isn't random, it's regeneration." },
  {
    text: "Clarida isn't just a product, it's a regenerative rhythm.",
    showButton: true,
  },
];

export default function InteractiveRegenerationExternal({ progress, active }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRefs = useRef([]);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [isAudioOn, setIsAudioOn] = useState(false);

  const lastPaintedIndexRef = useRef(-1);
  const lastRequestedIndexRef = useRef(-1);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.__claridaAudioOn === "boolean"
    ) {
      setIsAudioOn(window.__claridaAudioOn);
    }
  }, []);

  useEffect(() => {
    const handleAudioToggle = (e) => {
      const { isOn } = e.detail || {};
      const next = !!isOn;
      if (typeof window !== "undefined") window.__claridaAudioOn = next;
      setIsAudioOn(next);
    };
    window.addEventListener("clarida-audio-toggle", handleAudioToggle);
    return () =>
      window.removeEventListener("clarida-audio-toggle", handleAudioToggle);
  }, []);

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeTo = (audio, targetVolume, durationMs) => {
    if (!audio) return;

    clearFadeInterval();

    const startVolume =
      typeof audio.volume === "number"
        ? audio.volume
        : targetVolume > 0
        ? 0
        : 1;

    const totalSteps = Math.max(Math.round(durationMs / 50), 1);
    let step = 0;
    const diff = targetVolume - startVolume;

    if (targetVolume > 0 && audio.paused) {
      audio.loop = true;
      audio.play().catch(() => {});
    }

    fadeIntervalRef.current = setInterval(() => {
      step += 1;
      const t = Math.min(step / totalSteps, 1);
      audio.volume = Math.min(Math.max(startVolume + diff * t, 0), 1);

      if (t >= 1) {
        clearFadeInterval();
        if (targetVolume === 0) {
          audio.pause();
          audio.volume = 1;
        }
      }
    }, 50);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = !!active && !!isAudioOn;
    if (shouldPlay) fadeTo(audio, 1, 600);
    else fadeTo(audio, 0, 800);
  }, [active, isAudioOn]);

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

  useEffect(() => {
    let cancelled = false;
    preloadedFramesRef.current = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!cancelled) preloadedFramesRef.current[i] = img;
      };
      img.onerror = () => {
        if (!cancelled) preloadedFramesRef.current[i] = null;
      };
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const drawFrame = (desiredIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return null;

    const frames = preloadedFramesRef.current;
    const w = logicalWidthRef.current || canvas.clientWidth;
    const h = logicalHeightRef.current || canvas.clientHeight;
    if (!w || !h || !frames?.length) return null;

    const SEARCH_RADIUS = 28;
    let pick = -1;

    if (frames[desiredIndex]) {
      pick = desiredIndex;
    } else {
      const prevReq = lastRequestedIndexRef.current;
      const goingForward = desiredIndex >= prevReq;

      for (let d = 1; d <= SEARCH_RADIUS; d++) {
        const a = desiredIndex - d;
        const b = desiredIndex + d;

        const first = goingForward ? b : a;
        const second = goingForward ? a : b;

        if (first >= 0 && first < TOTAL_FRAMES && frames[first]) {
          pick = first;
          break;
        }
        if (second >= 0 && second < TOTAL_FRAMES && frames[second]) {
          pick = second;
          break;
        }
      }
    }

    if (pick < 0) return null;

    const img = frames[pick];
    if (!img) return null;

    ctx2d.clearRect(0, 0, w, h);

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

    lastPaintedIndexRef.current = pick;
    return pick;
  };

  const renderFromProgress = (pRaw, forceDraw = false) => {
    const p = clamp01(pRaw);
    const lastIndex = TOTAL_FRAMES - 1;
    const frameIndex = Math.min(lastIndex, Math.floor(p * lastIndex));

    const sec = sectionRef.current;
    if (sec) {
      sec.style.backgroundImage = `url(${framePaths[frameIndex]})`;
    }

    lastRequestedIndexRef.current = frameIndex;

    if (forceDraw || frameIndex !== lastFrameIndexRef.current) {
      const painted = drawFrame(frameIndex);
      if (painted !== null) {
        lastFrameIndexRef.current = painted;
        if (sec) sec.style.backgroundImage = `url(${framePaths[painted]})`;
      }
    }

    const STEP_TIMINGS = [
      { enter: 40, pause: 35, exit: 40 },
      { enter: 40, pause: 46, exit: 40 },
      { enter: 40, pause: 46, exit: 40 },
      { enter: 40, pause: 67, exit: 45 },
      { enter: 40, pause: 46, exit: 60 },
      { enter: 40, pause: 60, exit: 40 },
    ];

    const START_Y = 180;
    const PAUSE_Y = 80;
    const EXIT_Y = -25;

    storySteps.forEach((_, idx) => {
      const textEl = textRefs.current[idx];
      if (!textEl) return;

      const kf = STEP_KEY_FRAMES[idx];
      const { enter, pause, exit } = STEP_TIMINGS[idx];

      const enterStart = kf - enter;
      const pauseStart = kf;
      const pauseEnd = pauseStart + pause;
      const exitEnd = pauseEnd + exit;

      let opacity = 0;
      let y = START_Y;

      if (frameIndex >= enterStart && frameIndex <= exitEnd) {
        const totalDuration = exitEnd - enterStart;
        const progressT = clamp01((frameIndex - enterStart) / totalDuration);

        const fadeInEnd = 0.15;
        const fadeOutStart = 0.8;

        if (progressT < fadeInEnd) {
          opacity = progressT / fadeInEnd;
        } else if (progressT > fadeOutStart) {
          opacity = 1 - (progressT - fadeOutStart) / (1 - fadeOutStart);
        } else {
          opacity = 1;
        }

        // --- FAST → SLOW → ACCELERATE (Fully Smooth) ---

        // 1️⃣ Base acceleration for fast entry
        let curvedT = Math.pow(progressT, 0.5);
        // smaller = faster bottom (0.7 = very fast, 0.8 = moderate)

        // 2️⃣ Create smooth slow zone in middle using Gaussian curve
        const slowStrength = 0.95; // how slow the middle becomes
        const slowWidth = 0.22; // width of slow zone (smaller = tighter)

        // Gaussian bell curve centered at 0.5
        const gaussian = Math.exp(
          -Math.pow(progressT - 0.5, 2) / (2 * slowWidth * slowWidth)
        );

        // Compress movement in middle smoothly
        curvedT = curvedT - gaussian * slowStrength * 0.26;
        // 3️⃣ After middle, add natural acceleration boost
        const accelStart = 0.55; // when acceleration begins
        if (progressT > accelStart) {
          const accelT = (progressT - accelStart) / (1 - accelStart);
          curvedT += Math.pow(accelT, 1.4) * 0.08;
        }

        // Clamp to keep safe
        curvedT = clamp01(curvedT);

        y = START_Y + (EXIT_Y - START_Y) * curvedT;
      } else if (frameIndex > exitEnd) {
        opacity = 0;
        y = EXIT_Y;
      }

      gsap.set(textEl, { opacity, y });
    });
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      logicalWidthRef.current = width;
      logicalHeightRef.current = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const current = clamp01(progress?.get?.() ?? 0);
      renderFromProgress(current, true);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  useMotionValueEvent(progress, "change", (pRaw) => {
    renderFromProgress(pRaw, false);
  });

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
      <canvas ref={canvasRef} className="h-full w-full block" />

      <audio
        ref={audioRef}
        src="/audios/interactiveRegeneration.mp3"
        preload="auto"
        loop
      />

      <div className="absolute inset-0 bg-black/30 md:bg-black/35 lg:bg-black/40 pointer-events-none" />

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
            <Button extra="gap-2 lg:gap-3 lg:py-[10px] lg:px-[18px] flex">
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
    </section>
  );
}
