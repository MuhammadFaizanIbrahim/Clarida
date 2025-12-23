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

const MAGNET_STRENGTH = 0.45; // softer pull (no sticky)
const MAGNET_RADIUS_FRAC = 0.28; // smaller influence zone
const MAGNET_POWER = 2.2; // gentler curve

const magnetizeToCenters = (p, stepsLen) => {
  const maxIndex = Math.max(stepsLen - 1, 1);
  const seg = 1 / maxIndex;
  const radius = seg * MAGNET_RADIUS_FRAC;

  const idxFloat = p * maxIndex;
  const nearest = Math.round(idxFloat);
  const center = nearest / maxIndex;

  const d = p - center;
  const ad = Math.abs(d);
  if (ad >= radius) return p;

  const t = 1 - ad / radius; // 1 at center, 0 at edge
  const w = MAGNET_STRENGTH * Math.pow(t, MAGNET_POWER);

  return clamp01(center + d * (1 - w));
};

// ✅ NEW: stable lenis-like smoothing (no stick/push)
const SMOOTH_TIME = 0.16; // seconds (higher = smoother, floatier)
const MAX_SPEED = 0.95; // progress per second (prevents skipping without "push")

// ✅ NEW: smooth slowdown zone around each step center (no sticky / no push)
const CENTER_SLOW_RADIUS_FRAC = 0.18; // portion of each segment affected (0.18–0.28 good)
const CENTER_SLOW_STRENGTH = 0.8; // 0..1 (higher = more slowdown)
const CENTER_SLOW_POWER = 2.6; // curve softness (2–3 smooth)

const centerSlow = (p, stepsLen) => {
  const maxIndex = Math.max(stepsLen - 1, 1);
  const seg = 1 / maxIndex;
  const radius = seg * CENTER_SLOW_RADIUS_FRAC;

  const idxFloat = p * maxIndex;
  const nearest = Math.round(idxFloat);
  const center = nearest / maxIndex;

  const d = Math.abs(p - center);
  if (d >= radius) return 0;

  // 1 at center -> 0 at edge, smoothly
  const t = 1 - d / radius;
  return Math.pow(t, CENTER_SLOW_POWER);
};

export default function RegenerationTimelineExternal({
  progress = 0,
  active = true,
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const timeBarRef = useRef(null);

  const bgRefs = useRef([]);
  const cardRefs = useRef([]);

  const totalScrollRef = useRef(0);
  const lastPRef = useRef(0);

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
    const top = window.innerHeight * 4.5;
    window.scrollBy({ top, behavior: "smooth" });
  };

  // ✅ entry behavior
  const activeStartRef = useRef(0);
  const ENTRY_REBASE_MAX = 0.22;
  const ENTRY_FROM_BELOW_MIN = 0.75;

  // ✅ Hold at start/end
  const START_HOLD_P = 0.10;
  const END_HOLD_P = 0.10;

  // ✅ internal progress
  const smoothObjRef = useRef({ p: 0 });

  // ✅ target + RAF driver (Lenis style)
  const targetPRef = useRef(0);
  const rafRef = useRef(null);

  const renderAt = (p) => {
    const track = trackRef.current;
    const timeBar = timeBarRef.current;
    if (!track || !timeBar) return;

    const totalScroll = totalScrollRef.current;
    const x = -totalScroll * p;

    gsap.set(track, { x });
    gsap.set(timeBar, { x });

    const maxIndex = timelineSteps.length - 1;
    const indexFloat = p * maxIndex;
    const baseIndex = Math.floor(indexFloat);
    const t = indexFloat - baseIndex;

    bgRefs.current.forEach((el, idx) => {
      if (!el) return;
      let opacity = 0;
      if (idx === baseIndex) opacity = 1 - t;
      else if (idx === baseIndex + 1) opacity = t;
      gsap.set(el, { opacity });
    });

    const newStep = Math.round(indexFloat);
    const clampedStep = Math.min(Math.max(newStep, 0), maxIndex);
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

    return magnetizeToCenters(pHeld, timelineSteps.length);
  };

  const lastTimeRef = useRef(0);

  const startRaf = () => {
    if (rafRef.current) return;

    lastTimeRef.current = performance.now();

    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);

      // dt in seconds (clamped so tab switching doesn't jump)
      const dt = Math.min(
        Math.max((now - lastTimeRef.current) / 1000, 0),
        0.05
      );
      lastTimeRef.current = now;

      const current = smoothObjRef.current.p;
      const target = targetPRef.current;

      // ✅ slowdown amount based on proximity to center (0..1)
      const slow = centerSlow(current, timelineSteps.length);

      // ✅ slightly more “float” near center (gentle, not sticky)
      const smoothTime = SMOOTH_TIME * (1 + 0.75 * slow);

      // time-constant smoothing (frame-rate independent)
      const alpha = 1 - Math.exp(-dt / smoothTime);

      let next = current + (target - current) * alpha;

      // ✅ speed limit that smoothly reduces near center (readable dwell)
      const speedMul = 1 - CENTER_SLOW_STRENGTH * slow;
      const maxDelta = MAX_SPEED * speedMul * dt;

      const delta = next - current;
      if (Math.abs(delta) > maxDelta) {
        next = current + Math.sign(delta) * maxDelta;
      }

      next = clamp01(next);

      smoothObjRef.current.p = next;
      lastPRef.current = next;
      renderAt(next);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const stopRaf = () => {
    if (!rafRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  // ✅ hard sync (prevents flash)
  const syncVisual = (pRaw) => {
    const pFinal = computeHeldP(pRaw);
    smoothObjRef.current.p = pFinal;
    targetPRef.current = pFinal;
    lastPRef.current = pFinal;
    renderAt(pFinal);
  };

  const apply = (pRaw) => {
    if (!active) return;
    targetPRef.current = computeHeldP(pRaw);
    startRaf();
  };

  // ✅ on activate: decide whether to rebase or not
  useEffect(() => {
    if (!active) {
      stopRaf();
      return;
    }

    const current = clamp01(mv.get?.() ?? 0);
    const enteringFromBelow = current >= ENTRY_FROM_BELOW_MIN;

    if (enteringFromBelow) {
      activeStartRef.current = 0;
    } else if (current <= ENTRY_REBASE_MAX) {
      activeStartRef.current = current;
      // resetToStart behavior without changing visuals structure
      smoothObjRef.current.p = 0;
      targetPRef.current = 0;
      lastPRef.current = 0;
      stepIndexRef.current = 0;
      setStepIndex(0);
      renderAt(0);
    } else {
      activeStartRef.current = 0;
    }

    apply(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ----------------- layout: compute totalScroll -----------------
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

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySteps.length]);

  // ✅ INITIAL mount sync
  useLayoutEffect(() => {
    const current = clamp01(mv.get?.() ?? 0);
    syncVisual(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ keep visuals synced when inactive, lenis-smooth when active
  useMotionValueEvent(mv, "change", (v) => {
    if (active) apply(v);
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
