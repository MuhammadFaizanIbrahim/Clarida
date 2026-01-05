// src/sections/RegenerationTimelineExternal.jsx
import React, {
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import { gsap } from "gsap";
import { useMediaQuery } from "react-responsive";
import { useMotionValue, useMotionValueEvent } from "framer-motion";

// ✅ USE LENIS (already in your project)
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";

// ----------------- DATA -----------------
const timelineSteps = [
  {
    time: "7:00 AM",
    title: "Wake",
    subtitle: "The Clock",
    description:
      "The day begins—and so does repair. Your first Clarida dose aligns with cortisol’s morning rise, jump-starting anti-inflammatory signals.The body becomes alert. So does your biology.",
    clockIcon: "/icons/7amClock.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, #C49842 0%, #FFD684 100%)",
  },
  {
    time: "10:00 AM",
    title: "Cellular",
    subtitle: "Rediness",
    description:
      "By late morning, cells are metabolically active and highly responsive. Your second dose delivers key nutrients—like Spirulina and Lutein—precisely when your retinal cells are most primed to uptake and respond to nutrient signaling.",
    clockIcon: "/icons/10amClock.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Logo-Blue, #39D5DE) 0%, var(--Golden-Amber-Light, #FFD684) 74.52%)",
  },
  {
    time: "12:00 PM",
    title: "Metabolic",
    subtitle: "Alignment",
    description:
      "As the immune system peaks in vigilance, Clarida shifts from activation to modulation. Dose three calms inflammation, supports blood flow, and helps maintain oxidative balance—preparing the ground for regeneration.",
    clockIcon: "/icons/12amClock.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Logo-Blue, #39D5DE) 29.81%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    time: "2:00 PM",
    title: "Neurogenic",
    subtitle: "Priming",
    description:
      "Light exposure and hormonal cues shift again. Now, your body begins priming Müller glia for potential reprogramming. Your fourth dose feeds that signal—without disruption.",
    clockIcon: "/icons/2pmClock.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Ocular-Rose-Gold, #D8A6A1) 0%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    time: "4:00 PM",
    title: "Evening",
    subtitle: "Reset",
    description:
      "As melatonin precursors rise and your system prepares for rest, Clarida delivers its fifth dose.Not for energy—but for repair, timed to circadian cues. Your biology listens differently now.",
    clockIcon: "/icons/4pmClock.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 0%, var(--Bioluminescent-Aqua, #3CD3AD) 100%)",
  },
  {
    time: "7:00 PM",
    title: "Night",
    subtitle: "Activation",
    description:
      "This is the window where regeneration peaks. Clarida’s final dose arrives just as the body enters deep circadian repair mode. Silent work begins—at the moment you rest.",
    clockIcon: "/icons/7amClock.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 39.9%, var(--Logo-Blue, #39D5DE) 100%)",
  },
  {
    time: "9:00 PM",
    title: "Clarida doesn’t override your biology –",
    subtitle: "It listens to it",
    description: "",
    clockIcon: "/icons/clock7.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 50%, var(--Logo-Blue, #39D5DE) 100%)",
  },
  {
    time: "11:00 PM",
    title: "Dose by Dose",
    subtitle: "Readiness",
    description: "",
    clockIcon: "/icons/clock8.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 50%, var(--Logo-Blue, #39D5DE) 100%)",
  },
  {
    time: "12:00 AM",
    title: "Rhythm by Rhythm",
    subtitle: "Readiness",
    description: "",
    clockIcon: "/icons/clock9.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 50%, var(--Logo-Blue, #39D5DE) 100%)",
  },
];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMotionValue = (v) =>
  v && typeof v === "object" && typeof v.get === "function";

// ✅ smoothing (used for “settle” / non-step updates)
const SMOOTH_DUR = 0.28; // was 0.18 (slightly slower settle = smoother)

// ✅ step-to-step slide duration (THIS is what you feel)
const STEP_ANIM_DUR = 0.9; // was 0.65 (longer = smoother)
const STEP_EASE = "power2.inOut"; // smoother leave + smoother arrival

// ✅ entry behavior
const ENTRY_REBASE_MAX = 0.32;
const ENTRY_FROM_BELOW_MIN = 0.75;

// ✅ Hold at start/end so arc transition can finish before timeline starts moving
const START_HOLD_P = 0.15;
const END_HOLD_P = 0.05;

// ✅ “double scroll” feel (hysteresis + cooldown)
const HYSTERESIS = 0.38; // was 0.52 (less travel needed to leave center)

// ✅ NEW: distance-based commit (prevents "too much scroll")
const COMMIT_BEYOND = 0.14; // 0.10–0.18 (smaller = easier to go next)

// ✅ intent ramp (still used, but now secondary)
const INTENT_GAIN = 10.0;
const INTENT_DECAY = 3.2;
const INTENT_START = 0.55; // head-start when user commits direction


const ARRIVAL_COOLDOWN_MS = 320;

export default function RegenerationTimelineExternal({
  progress = 0,
  active = true,
}) {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const timeBarRef = useRef(null);

  const bgRefs = useRef([]);
  const cardRefs = useRef([]);

  const totalScrollRef = useRef(0);

  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(0);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const baseSteps = timelineSteps;
  const baseStepsCount = baseSteps.length;

  const displaySteps = useMemo(() => {
    if (!isMobile)
      return baseSteps.map((step, idx) => ({ ...step, baseIndex: idx }));

    const result = [];
    baseSteps.forEach((step, idx) => {
      const isClaridaStep = idx === baseStepsCount - 3;
      if (!isClaridaStep) {
        result.push({ ...step, baseIndex: idx });
      } else {
        result.push({
          ...step,
          title: "Clarida doesn’t override your biology",
          subtitle: "",
          baseIndex: idx,
          mobileSplitPart: "biology",
        });
        result.push({
          ...step,
          title: "It listens to it",
          subtitle: "",
          baseIndex: idx,
          mobileSplitPart: "listens",
        });
      }
    });

    return result;
  }, [isMobile, baseSteps, baseStepsCount]);

  // ---- progress can be MotionValue or number
  const fallback = useMotionValue(0);
  const mv = useMemo(
    () => (isMotionValue(progress) ? progress : fallback),
    [progress, fallback]
  );

  useEffect(() => {
    if (!isMotionValue(progress)) {
      fallback.set(typeof progress === "number" ? progress : 0);
    }
  }, [progress, fallback]);

  const handleScrollToEnd = () => {
    window.dispatchEvent(new CustomEvent("clarida-regen-jump-end"));
  };

  const activeStartRef = useRef(0);

  const smoothObjRef = useRef({ p: 0 });
  const quickToRef = useRef(null);

  // ✅ step tween guard
  const moveRef = useRef({ active: false });

  const lockRef = useRef({
    idx: 0,
    cooldownUntil: 0,
  });

  // ✅ NEW: intent accumulator for ultra-smooth “leaving the center”
  const intentRef = useRef({
    dir: 0, // -1 / +1
    amt: 0, // 0..1
    lastNow: 0,
  });

  const renderAt = (p) => {
    const track = trackRef.current;
    const timeBar = timeBarRef.current;
    if (!track || !timeBar) return;

    const totalScroll = totalScrollRef.current;
    const x = -totalScroll * p;

    gsap.set(track, { x });
    gsap.set(timeBar, { x });

    const maxCardIndex = Math.max(displaySteps.length - 1, 1);
    const indexFloat = p * maxCardIndex;
    const cardA = Math.floor(indexFloat);
    const t = indexFloat - cardA;
    const cardB = Math.min(cardA + 1, maxCardIndex);

    const aBase = displaySteps[cardA]?.baseIndex ?? 0;
    const bBase = displaySteps[cardB]?.baseIndex ?? aBase;

    bgRefs.current.forEach((el, idx) => {
      if (!el) return;
      let opacity = 0;

      if (aBase === bBase) {
        opacity = idx === aBase ? 1 : 0;
      } else {
        if (idx === aBase) opacity = 1 - t;
        else if (idx === bBase) opacity = t;
      }

      gsap.set(el, { opacity });
    });

    const newStep = Math.round(indexFloat);
    const clampedStep = Math.min(Math.max(newStep, 0), maxCardIndex);

    if (clampedStep !== stepIndexRef.current) {
      stepIndexRef.current = clampedStep;
      setStepIndex(clampedStep);
    }

    const vw = window.innerWidth;
    const centerX = vw / 2;
    const innerZone = 0.2;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;

      const cardCenter = idx * vw + centerX + x;
      const distanceFromCenter = Math.abs(cardCenter - centerX);
      const normalized = distanceFromCenter / centerX;

      let opacity;
      if (normalized <= innerZone) opacity = 1;
      else if (normalized >= 1) opacity = 0;
      else {
        const localT = (normalized - innerZone) / (1 - innerZone);
        opacity = 1 - localT;
      }

      gsap.set(el, { opacity });
    });
  };

  const computeHeldP = (pRaw) => {
    const pIncoming = clamp01(pRaw);

    const startAt = activeStartRef.current || 0;
    const denom = 1 - startAt;
    const p = denom <= 0.00001 ? 0 : clamp01((pIncoming - startAt) / denom);

    const denomHold = 1 - START_HOLD_P - END_HOLD_P;
    let pHeld = p;

    if (denomHold > 0) {
      if (pHeld <= START_HOLD_P) pHeld = 0;
      else if (pHeld >= 1 - END_HOLD_P) pHeld = 1;
      else pHeld = (pHeld - START_HOLD_P) / denomHold;
    }

    return pHeld;
  };

  const setSmoothTarget = (pTarget) => {
    const clamped = clamp01(pTarget);
    if (quickToRef.current) quickToRef.current(clamped);
    else {
      smoothObjRef.current.p = clamped;
      renderAt(clamped);
    }
  };

  // ✅ smooth step-to-step tween (longer + nicer, smoother depart + arrive)
  const startStepTween = (pTarget) => {
    const clamped = clamp01(pTarget);

    moveRef.current.active = true;

    gsap.to(smoothObjRef.current, {
      p: clamped,
      duration: STEP_ANIM_DUR,
      ease: STEP_EASE,
      overwrite: true,
      onUpdate: () => renderAt(smoothObjRef.current.p),
      onComplete: () => {
        moveRef.current.active = false;
      },
    });
  };

  const syncVisual = (pRaw) => {
    const pHeld = computeHeldP(pRaw);
    smoothObjRef.current.p = pHeld;
    renderAt(pHeld);

    const maxIndex = Math.max(displaySteps.length - 1, 1);
    const idx = Math.min(Math.max(Math.round(pHeld * maxIndex), 0), maxIndex);
    lockRef.current.idx = idx;
    lockRef.current.cooldownUntil = 0;
    stepIndexRef.current = idx;
    setStepIndex(idx);

    // reset intent
    intentRef.current.dir = 0;
    intentRef.current.amt = 0;
    intentRef.current.lastNow = performance.now();
  };

  const applyLocked = (pRaw, now) => {
    // ✅ if a step tween is running, let it finish (prevents snapping/jitter)
    if (moveRef.current.active) return;

    const pHeld = computeHeldP(pRaw);
    const maxIndex = Math.max(displaySteps.length - 1, 1);

    const curIdx = lockRef.current.idx;
    const seg = 1 / maxIndex;

    const nextThresh = (curIdx + HYSTERESIS) * seg;
    const prevThresh = (curIdx - HYSTERESIS) * seg;

    // cooldown prevents rapid flipping
    if (now < lockRef.current.cooldownUntil) {
      const target = curIdx / maxIndex;
      // ✅ don't constantly overwrite unless we need to “finish” settling
      if (Math.abs(smoothObjRef.current.p - target) > 0.0008) {
        setSmoothTarget(target);
      }
      return;
    }

    // ✅ intent ramp (smooth leaving / prevents instant flip)
    const last = intentRef.current.lastNow || now;
    const dtS = Math.min(Math.max((now - last) / 1000, 0), 0.06);
    intentRef.current.lastNow = now;

    let desiredDir = 0;
    let beyond = 0;

    if (pHeld >= nextThresh && curIdx < maxIndex) {
      desiredDir = +1;
      beyond = pHeld - nextThresh;
    } else if (pHeld <= prevThresh && curIdx > 0) {
      desiredDir = -1;
      beyond = prevThresh - pHeld;
    }

    if (desiredDir === 0) {
      // decay back to 0 intent while staying centered
      intentRef.current.amt = Math.max(0, intentRef.current.amt - INTENT_DECAY * dtS);
      intentRef.current.dir = 0;

      setSmoothTarget(curIdx / maxIndex);
      return;
    }

    // if user changes direction, reset intent (feels smoother / less twitchy)
    if (intentRef.current.dir !== desiredDir) {
      intentRef.current.dir = desiredDir;
      intentRef.current.amt = INTENT_START; // ✅ instant “less scroll” feel
    }    

    // normalize how far beyond threshold (in "segment units")
const beyondNorm = seg > 0 ? beyond / seg : 0;

// ✅ 1) Distance-based commit (fixes “too much scroll” immediately)
if (beyondNorm >= COMMIT_BEYOND) {
  const nextIdx = curIdx + desiredDir;

  lockRef.current.idx = nextIdx;
  lockRef.current.cooldownUntil =
    now + ARRIVAL_COOLDOWN_MS + STEP_ANIM_DUR * 1000;

  stepIndexRef.current = nextIdx;
  setStepIndex(nextIdx);

  // reset intent after commit
  intentRef.current.amt = 0;
  intentRef.current.dir = 0;

  startStepTween(nextIdx / maxIndex);
  return;
}

// ✅ 2) Otherwise, still allow gentle “intent ramp”
intentRef.current.amt = Math.min(
  1,
  intentRef.current.amt + (0.35 + beyondNorm) * INTENT_GAIN * dtS
);

if (intentRef.current.amt >= 1) {
  const nextIdx = curIdx + desiredDir;

  lockRef.current.idx = nextIdx;
  lockRef.current.cooldownUntil =
    now + ARRIVAL_COOLDOWN_MS + STEP_ANIM_DUR * 1000;

  stepIndexRef.current = nextIdx;
  setStepIndex(nextIdx);

  intentRef.current.amt = 0;
  intentRef.current.dir = 0;

  startStepTween(nextIdx / maxIndex);
  return;
}


    // while building intent, keep gently pulled to current center
    setSmoothTarget(curIdx / maxIndex);
  };

  useEffect(() => {
    if (!active) return;

    const current = clamp01(mv.get?.() ?? 0);
    const enteringFromBelow = current >= ENTRY_FROM_BELOW_MIN;

    if (enteringFromBelow) {
      activeStartRef.current = 0;
    } else if (current <= ENTRY_REBASE_MAX) {
      activeStartRef.current = current;
      lockRef.current.idx = 0;
      lockRef.current.cooldownUntil = 0;

      moveRef.current.active = false;
      gsap.killTweensOf(smoothObjRef.current);

      setSmoothTarget(0);
      stepIndexRef.current = 0;
      setStepIndex(0);
      renderAt(0);
    } else {
      activeStartRef.current = 0;
    }

    const pHeld = computeHeldP(current);
    const maxIndex = Math.max(displaySteps.length - 1, 1);
    const idx = Math.min(Math.max(Math.round(pHeld * maxIndex), 0), maxIndex);

    lockRef.current.idx = idx;
    lockRef.current.cooldownUntil = performance.now() + 40;

    stepIndexRef.current = idx;
    setStepIndex(idx);

    moveRef.current.active = false;
    gsap.killTweensOf(smoothObjRef.current);

    // reset intent
    intentRef.current.dir = 0;
    intentRef.current.amt = 0;
    intentRef.current.lastNow = performance.now();

    // settle to current card smoothly
    setSmoothTarget(idx / maxIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, displaySteps.length]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const compute = () => {
      totalScrollRef.current = Math.max(
        track.scrollWidth - window.innerWidth,
        0
      );
      renderAt(smoothObjRef.current.p);
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);

    // keep quick “settle” (not used for the big step slide)
    quickToRef.current = gsap.quickTo(smoothObjRef.current, "p", {
      duration: SMOOTH_DUR,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => renderAt(smoothObjRef.current.p),
    });

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
      quickToRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySteps.length]);

  useLayoutEffect(() => {
    const current = clamp01(mv.get?.() ?? 0);
    syncVisual(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySteps.length]);

  useMotionValueEvent(mv, "change", (v) => {
    const now = performance.now();
    if (active) applyLocked(v, now);
    else syncVisual(v);
  });

  // ----------------- ✅ AUDIO (UNCHANGED) -----------------
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [isAudioOn, setIsAudioOn] = useState(false);
  const isAudioOnRef = useRef(false);
  const activeRef = useRef(active);

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
      typeof audio.volume === "number"
        ? audio.volume
        : targetVolume > 0
        ? 0
        : 1;

    const totalSteps = Math.max(Math.round(durationMs / 50), 1);
    let step = 0;
    const volumeDiff = targetVolume - startVolume;

    if (targetVolume > 0 && audio.paused) {
      audio.loop = true;
      audio.play().catch(() => {});
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
      const shouldPlayNow = activeRef.current && isAudioOnRef.current;

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

  useEffect(() => {
    const handleAudioToggle = (e) => {
      const { isOn } = e.detail || {};
      const nextState = !!isOn;

      if (typeof window !== "undefined") window.__claridaAudioOn = nextState;

      setIsAudioOn(nextState);
      isAudioOnRef.current = nextState;
    };

    window.addEventListener("clarida-audio-toggle", handleAudioToggle);
    return () =>
      window.removeEventListener("clarida-audio-toggle", handleAudioToggle);
  }, []);

  useEffect(() => {
    activeRef.current = active;
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = active && isAudioOn;
    isAudioOnRef.current = isAudioOn;

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
  // ----------------- ✅ END AUDIO -----------------

  const stepsCount = displaySteps.length;
  const trackWidthVW = stepsCount * 100;

  const tickCount = baseStepsCount - 3;
  const tickSpacingVW = 100;
  const timeBarWidthVW = tickCount * tickSpacingVW;

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-screen w-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#000" }}
    >
      {/* GRADIENT LAYERS */}
      <div className="absolute inset-0 z-0">
        {timelineSteps.map((step, index) => (
          <div
            key={index}
            ref={(el) => (bgRefs.current[index] = el)}
            className="absolute inset-0"
            style={{
              background: step.gradient,
              opacity: index === 0 ? 1 : 0,
              transition: "opacity 0.2s linear",
            }}
          />
        ))}
      </div>

      {/* 🔊 SECTION AUDIO */}
      <audio
        ref={audioRef}
        src="/audios/regenerationTimeline.mp3"
        preload="auto"
        loop
      />

      {/* CONTENT */}
      <div className="relative z-10 w-full h-full">
        {/* TOP TIME LINE */}
        <div
          ref={timeBarRef}
          className="
            pointer-events-none absolute top-15 md:top-10 -left-17 md:-left-17 lg:-left-14 2xl:-left-21 z-10
            w-(--timebar-width-desktop)
          "
          style={{
            "--timebar-width-desktop": `${timeBarWidthVW}vw`,
          }}
        >
          <div className="relative h-[70px]">
            <div
              className="absolute h-px left-64 md:left-[55.87vw] lg:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[45.85vw] 2xl:right-[46vw] bg-(--color-text)"
              style={{ top: "0%", transform: "translateY(-50%)" }}
            />
            {timelineSteps.slice(0, tickCount).map((item, index) => (
              <div
                key={index}
                className="absolute flex flex-col items-center top-[55.5%] md:top-[65%] lg:top-[61%] xl:top-[62%] 2xl:top-[70%]"
                style={{
                  left: `calc(50vw + ${index * tickSpacingVW}vw)`,
                  transform: "translateY(-50%)",
                }}
              >
                <div className="h-9 md:h-[50px] w-px bg-(--color-text) mb-2" />
                <span className="sections-light-text">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HORIZONTAL CARDS TRACK */}
        <div className="h-full w-full flex items-center">
          <div
            ref={trackRef}
            className="flex h-full"
            style={{ width: `${trackWidthVW}vw` }}
          >
            {displaySteps.map((item, index) => {
              const isLastThree = item.baseIndex >= baseStepsCount - 3;
              const isLastTwo = item.baseIndex >= baseStepsCount - 2;
              const isClaridaBase = item.baseIndex === baseStepsCount - 3;

              const isMobileBiology =
                isMobile &&
                isClaridaBase &&
                item.mobileSplitPart === "biology";
              const isMobileListens =
                isMobile &&
                isClaridaBase &&
                item.mobileSplitPart === "listens";

              return (
                <div
                  key={index}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className="shrink-0 w-screen flex flex-col items-center justify-center text-center px-8"
                  style={{
                    opacity: index === 0 ? 1 : 0,
                    transition: "opacity 0.2s linear",
                  }}
                >
                  {!isLastThree && (
                    <img
                      src={item.clockIcon}
                      alt={item.time}
                      className="w-10 h-10 mb-7 md:mb-4 opacity-90"
                    />
                  )}

                  <h2 className="h2-text">
                    {!isMobile && isClaridaBase ? (
                      <>
                        {item.title}
                        <br />
                        {baseSteps[baseStepsCount - 3].subtitle
                          .split(" ")
                          .map((word, i) => {
                            if (word.toLowerCase().includes("listens")) {
                              return (
                                <span key={i} className="font-bold h2-text-bold">
                                  {word}{" "}
                                </span>
                              );
                            }
                            return word + " ";
                          })}
                      </>
                    ) : isMobileBiology ? (
                      <>{item.title}</>
                    ) : isMobileListens ? (
                      <>
                        {item.title.split(" ").map((word, i) => {
                          if (word.toLowerCase().includes("listens")) {
                            return (
                              <span key={i} className="font-bold h2-text-bold">
                                {word}{" "}
                              </span>
                            );
                          }
                          return word + " ";
                        })}
                      </>
                    ) : (
                      <>
                        {item.title}
                        {!isLastTwo && item.subtitle && (
                          <>
                            {" "}
                            <span className="h2-text-bold">{item.subtitle}</span>
                          </>
                        )}
                      </>
                    )}
                  </h2>

                  {!isLastThree && item.description && (
                    <p className="section-4-paragraph-text w-[400px] md:w-[700px] lg:w-[52.083vw] px-4 md:px-0 mt-4">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {active && (
        <div className="ScrollText absolute flex flex-col items-center bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <img
            src="icons/arrowIcon.svg"
            alt="Scroll"
            className="border-2 border-white rounded-full p-3 h-10 w-10 cursor-pointer hover:bg-[rgba(255,255,255,0.25)]"
            onClick={handleScrollToEnd}
          />
          <span className="text-white mt-2">Scroll</span>
        </div>
      )}
    </section>
  );
}
