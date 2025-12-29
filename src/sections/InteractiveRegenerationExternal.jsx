// src/sections/InteractiveRegenerationExternal.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useMotionValueEvent } from "framer-motion";
import Button from "../components/Button.jsx";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

const TOTAL_FRAMES = 360;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/InteractiveRegeneration/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

// key frames where each step should peak
const STEP_KEY_FRAMES = [80, 160, 230, 280, 330];
const FIRST_STORY_FRAME = STEP_KEY_FRAMES[0];

const storySteps = [
  { text: "The zebrafish contains one of biology's deepest secrets:" },
  { text: "How to regrow the retina itself." },
  { text: "When its retina is damaged, a special kind of cell—Müller glia—awakens." },
  { text: "The zebrafish's healing isn't random, it's regeneration." },
  { text: "Clarida isn't just a product—it's a regenerative rhythm.", showButton: true },
];

export default function InteractiveRegenerationExternal({ progress, active }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRefs = useRef([]);
  const timeBarRef = useRef(null);
  const tickRefs = useRef([]);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // audio
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [isAudioOn, setIsAudioOn] = useState(false);

  // viewport width for bar calculations
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const viewportWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      viewportWidthRef.current = w;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  // sync with global audio toggle
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.__claridaAudioOn === "boolean") {
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
    return () => window.removeEventListener("clarida-audio-toggle", handleAudioToggle);
  }, []);

  // fade helper
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
      typeof audio.volume === "number" ? audio.volume : targetVolume > 0 ? 0 : 1;
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

  // play/pause based on active + global toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = !!active && !!isAudioOn;
    if (shouldPlay) fadeTo(audio, 1, 600);
    else fadeTo(audio, 0, 800);

    return () => {};
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

  // preload frames
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

  // draw function
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const frames = preloadedFramesRef.current;
    const w = logicalWidthRef.current || canvas.clientWidth;
    const h = logicalHeightRef.current || canvas.clientHeight;
    if (!w || !h || !frames?.length) return;

    let img = frames[frameIndex];
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

    // cover math
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
  };

  // canvas sizing (viewport-based)
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

      const idx = lastFrameIndexRef.current >= 0 ? lastFrameIndexRef.current : 0;
      drawFrame(idx);

      // timebar starts offscreen right
      const timeBar = timeBarRef.current;
      if (timeBar) gsap.set(timeBar, { x: viewportWidthRef.current, opacity: 0 });
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  // drive everything from external progress
  useMotionValueEvent(progress, "change", (pRaw) => {
    const p = clamp01(pRaw);

    const lastIndex = TOTAL_FRAMES - 1;
    const frameIndex = Math.min(lastIndex, Math.floor(p * lastIndex));

    if (frameIndex !== lastFrameIndexRef.current) {
      lastFrameIndexRef.current = frameIndex;
      drawFrame(frameIndex);
    }

    // ---- timebar + text steps ----
    const timeBar = timeBarRef.current;
    const vw = viewportWidthRef.current;
    const segmentShift = vw;

    if (timeBar) {
      const lastKeyFrame = STEP_KEY_FRAMES[STEP_KEY_FRAMES.length - 1];

      let barX;
      if (frameIndex < FIRST_STORY_FRAME) {
        const t = frameIndex / FIRST_STORY_FRAME;
        barX = lerp(vw, 0, clamp01(t));
      } else if (frameIndex >= lastKeyFrame) {
        barX = -segmentShift * (STEP_KEY_FRAMES.length - 1);
      } else {
        let segIndex = 0;
        for (let i = 0; i < STEP_KEY_FRAMES.length - 1; i++) {
          if (frameIndex >= STEP_KEY_FRAMES[i] && frameIndex < STEP_KEY_FRAMES[i + 1]) {
            segIndex = i;
            break;
          }
        }
        const startFrame = STEP_KEY_FRAMES[segIndex];
        const endFrame = STEP_KEY_FRAMES[segIndex + 1];
        const localT = (frameIndex - startFrame) / (endFrame - startFrame || 1);

        const startX = -segmentShift * segIndex;
        const endX = -segmentShift * (segIndex + 1);
        barX = lerp(startX, endX, clamp01(localT));
      }

      // fade-in of the bar
      const FADE_IN_START = FIRST_STORY_FRAME - 15;
      const FADE_IN_END = FIRST_STORY_FRAME + 5;

      let barOpacity = 0;
      if (frameIndex <= FADE_IN_START) barOpacity = 0;
      else if (frameIndex >= FADE_IN_END) barOpacity = 1;
      else barOpacity = (frameIndex - FADE_IN_START) / (FADE_IN_END - FADE_IN_START || 1);

      gsap.set(timeBar, { x: barX, opacity: barOpacity });
    }

    const fadeFrames = 20;
    const maxY = 16;

    storySteps.forEach((_, idx) => {
      const textEl = textRefs.current[idx];
      const tickEl = tickRefs.current[idx];
      if (!textEl || !tickEl) return;

      const kf = STEP_KEY_FRAMES[idx];
      const distance = Math.abs(frameIndex - kf);

      let opacity = 0;
      if (distance <= fadeFrames) opacity = 1 - distance / fadeFrames;

      const y = maxY * (1 - opacity);

      gsap.set(textEl, { opacity, y });
      gsap.set(tickEl, { opacity: 1, scale: opacity > 0.7 ? 1.1 : 1 });
    });
  });

  // tick geometry
  const tickCount = storySteps.length;
  const timeBarWidthVW = tickCount * 100;

  const getTickLeft = (index) => {
    const w = viewportWidth;
    const trackWidthVW = timeBarWidthVW;
    let lineStartVW;
    let lineEndVW;

    if (w < 768) {
      const lineLeftPx = 16 * 16; // 16rem
      const lineRightVW = 34.5;
      lineStartVW = (lineLeftPx / w) * 100;
      lineEndVW = trackWidthVW - lineRightVW;
    } else if (w < 1024) {
      lineStartVW = 55.87;
      lineEndVW = trackWidthVW - 44.1;
    } else if (w < 1536) {
      lineStartVW = 56.2;
      lineEndVW = trackWidthVW - 44.1;
    } else {
      lineStartVW = 54.2;
      lineEndVW = trackWidthVW - 45.73;
    }

    const span = lineEndVW - lineStartVW;
    const step = span / (tickCount - 1);
    const pos = lineStartVW + index * step;
    return `${pos}vw`;
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify_center"
      style={{
        backgroundImage: `url(${FIRST_FRAME_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full block" />

      <audio ref={audioRef} src="/audios/interactiveRegeneration.mp3" preload="auto" loop />

      <div className="absolute inset-0 bg-black/30 md:bg_black/35 lg:bg-black/40 pointer-events-none" />

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
              <img src="icons/arrowIcon.svg" alt="Watch explainer" className="rotate-270" />
            </Button>
          )}
        </div>
      ))}

      <div
        ref={timeBarRef}
        className="pointer-events-none absolute bottom-8 md:bottom-10 lg:bottom-6 2xl:bottom-14 -left-17 md:-left-17 lg:-left-21 z-20"
        style={{ width: `${timeBarWidthVW}vw` }}
      >
        <div className="relative h-[60px]">
          <div
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[56.2vw] 2xl:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] 2xl:right-[45.73vw] bg-(--color-text)"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />

          {storySteps.map((_, index) => (
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
}
