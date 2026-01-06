// src/sections/ActivationTimelineExternal.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useMotionValue, useMotionValueEvent } from "framer-motion";

const timelineSteps = [
  {
    doseLabel: "Dose One:",
    title: "Morning",
    subtitle: "Activation",
    description: "Signals the start of the day, awakening energy and focus.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseOne.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, #C49842 0%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    doseLabel: "Dose Two:",
    title: "Mid-Morning",
    subtitle: "Clarity",
    description: "Supports sharper contrast and visual comfort as light exposure increases.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseTwo.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Logo-Blue, #39D5DE) 0%, var(--Golden-Amber-Light, #FFD684) 75%)",
  },
  {
    doseLabel: "Dose Three:",
    title: "Midday Energy",
    subtitle: "Alignment",
    description: "Keeps the rhythm balanced at peak activity hours.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseThree.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Logo-Blue, #39D5DE) 29.81%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    doseLabel: "Dose Four:",
    title: "Afternoon",
    subtitle: "Renewal",
    description: "Reinforces cellular repair and sustained clarity before evening fatigue sets in.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseFour.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Golden-Amber-Light, #FFD684) 0%, var(--Ocular-Rose-Gold, #D8A6A1) 75.48%, var(--Logo-Blue, #39D5DE) 100%)",
  },
  {
    doseLabel: "Dose Five:",
    title: "Evening",
    subtitle: "Balance",
    description: "Prepares the body and eyes for transition into rest, maintaining smooth vision.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseFive.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 50.48%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    doseLabel: "Dose Six:",
    title: "Night",
    subtitle: "Repair",
    description: "Anchors the regenerative cycle overnight.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseSix.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 67.79%, #05533F 100%)",
  },
];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMotionValue = (v) => v && typeof v === "object" && typeof v.get === "function";

// ----------------- ✅ REGENERATION-STYLE MAGNET + SLOWDOWN (same behavior) -----------------
const MAGNET_STRENGTH = 0.985;     // closer to 1 = stronger pull, but smooth
const MAGNET_RADIUS_FRAC = 1.25;   // influence extends beyond one segment
const MAGNET_POWER = 5.4;          // higher = more concentrated near center

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
const SMOOTH_TIME = 0.22; // seconds (higher = smoother, floatier)
const MAX_SPEED = 1.1;    // progress per second (prevents skipping without "push")

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ✅ smooth slowdown zone around each step center (no sticky / no push)
const CENTER_SLOW_RADIUS_FRAC = 0.42; // wider zone = earlier slowdown
const CENTER_SLOW_POWER = 1.25;       // softer curve (critical)

// 🔒 Center dwell / exit resistance
const CENTER_HOLD_RADIUS_FRAC = 0.14; // tight zone around center
const CENTER_EXIT_RESISTANCE = 0.72;  // lower = harder to leave (0.6–0.8)

const centerSlow = (p, stepsLen) => {
  const maxIndex = Math.max(stepsLen - 1, 1);
  const seg = 1 / maxIndex;
  const radius = seg * CENTER_SLOW_RADIUS_FRAC;

  const idxFloat = p * maxIndex;
  const nearest = Math.round(idxFloat);
  const center = nearest / maxIndex;

  const d = Math.abs(p - center);
  if (d >= radius) return 0;

  const t = 1 - d / radius;
  return easeInOutCubic(Math.pow(t, CENTER_SLOW_POWER));
};

const centerHoldResistance = (p, target, stepsLen) => {
  const maxIndex = Math.max(stepsLen - 1, 1);
  const seg = 1 / maxIndex;
  const radius = seg * CENTER_HOLD_RADIUS_FRAC;

  const idxFloat = p * maxIndex;
  const nearest = Math.round(idxFloat);
  const center = nearest / maxIndex;

  const d = p - center;
  const ad = Math.abs(d);

  // outside hold zone → no resistance
  if (ad >= radius) return target;

  // how deep inside the hold zone (0 edge → 1 center)
  const t = 1 - ad / radius;

  // apply resistance ONLY when trying to leave center
  const leaving =
    Math.sign(target - p) === Math.sign(d) && Math.abs(target - p) > 0.00001;

  if (!leaving) return target;

  // smooth resistance curve
  const resistance = Math.pow(t, 2.2);

  return p + (target - p) * (1 - resistance * (1 - CENTER_EXIT_RESISTANCE));
};
// -----------------------------------------------------------------------------------------

export default function ActivationTimelineExternal({ progress = 0, active = true }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(0);

  const bgRefs = useRef([]);
  const cardRefs = useRef([]);
  const circleRef = useRef(null);
  const markerRefs = useRef([]);

  const totalScrollRef = useRef(0);
  const lastPRef = useRef(0);

  const fallback = useMotionValue(0);
  const mv = useMemo(() => (isMotionValue(progress) ? progress : fallback), [progress, fallback]);

  useEffect(() => {
    if (!isMotionValue(progress)) fallback.set(typeof progress === "number" ? progress : 0);
  }, [progress, fallback]);

  // ✅ entry behavior (same structure as your file)
  const activeStartRef = useRef(0);
  const ENTRY_REBASE_MAX = 0.35;
  const ENTRY_FROM_BELOW_MIN = 0.75;

  // ✅ Hold at start/end so arc transition can finish before timeline starts moving
  const START_HOLD_P = 0.20;
  const END_HOLD_P = 0.15;

  // ✅ internal progress
  const smoothObjRef = useRef({ p: 0 });

  // ✅ target + RAF driver (Lenis style) — same as Regeneration
  const targetPRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  const renderAt = (p) => {
    const track = trackRef.current;
    if (!track) return;

    const totalScroll = totalScrollRef.current;
    const x = -totalScroll * p;
    gsap.set(track, { x });

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

    // circle rotation
    const anglePerStep = 360 / timelineSteps.length;
    const rotation = -indexFloat * anglePerStep;
    if (circleRef.current) gsap.set(circleRef.current, { rotate: rotation });

    // marker opacity
    const activeIndex = Math.round(indexFloat);
    const stepsN = timelineSteps.length;

    markerRefs.current.forEach((el, i) => {
      if (!el) return;
      let dist = Math.abs(i - activeIndex);
      if (dist > stepsN / 2) dist = stepsN - dist;

      let opacity = 0.15;
      if (dist === 0) opacity = 1;
      else if (dist <= 1) opacity = 0.4;

      gsap.set(el, { opacity });
    });
  };

  // ✅ identical “held progress + magnet blend” logic as Regeneration
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

    const magnetized = magnetizeToCenters(pHeld, timelineSteps.length);

    // weaken magnet as slowdown increases + fade magnet in hold
    const slow = centerSlow(pHeld, timelineSteps.length);
    const holdFade = Math.min(slow * 1.4, 1);
    const blend = 0.75 * (1 - holdFade);

    return pHeld + (magnetized - pHeld) * blend;
  };

  const startRaf = () => {
    if (rafRef.current) return;

    lastTimeRef.current = performance.now();

    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);

      // dt in seconds (clamped so tab switching doesn't jump)
      const dt = Math.min(Math.max((now - lastTimeRef.current) / 1000, 0), 0.05);
      lastTimeRef.current = now;

      const current = smoothObjRef.current.p;
      const target = targetPRef.current;

      // slowdown based on proximity to center (0..1)
      const slow = centerSlow(current, timelineSteps.length);

      // inertia-based smoothing
      const smoothTime = SMOOTH_TIME * (1 + 2.4 * slow);
      const alpha = 1 - Math.exp(-dt / smoothTime);

      let next = current + (target - current) * alpha;

      // speed clamp (prevents skipping)
      const MIN_SPEED = 0.18;
      const maxDelta = MAX_SPEED * (MIN_SPEED + (1 - MIN_SPEED) * (1 - slow)) * dt;

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

  const resetToStart = () => {
    smoothObjRef.current.p = 0;
    targetPRef.current = 0;
    lastPRef.current = 0;

    stepIndexRef.current = 0;
    setStepIndex(0);
    renderAt(0);
  };

  // ✅ hard sync visuals even when NOT active (prevents "Dose One" flash)
  const syncVisual = (pRaw) => {
    const pFinal = computeHeldP(pRaw);
    smoothObjRef.current.p = pFinal;
    targetPRef.current = pFinal;
    lastPRef.current = pFinal;
    renderAt(pFinal);
  };

  const apply = (pRaw) => {
    if (!active) return;

    const held = computeHeldP(pRaw);
    const resisted = centerHoldResistance(
      smoothObjRef.current.p,
      held,
      timelineSteps.length
    );

    targetPRef.current = resisted;
    startRaf();
  };

  // ✅ on activate: choose rebase mode (same as your Activation logic, but RAF-based)
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
      resetToStart();
    } else {
      activeStartRef.current = 0;
    }

    apply(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const compute = () => {
      totalScrollRef.current = Math.max(track.scrollWidth - window.innerWidth, 0);
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
  }, []);

  // ✅ INITIAL mount sync (first paint aligns to real progress)
  useLayoutEffect(() => {
    const current = clamp01(mv.get?.() ?? 0);
    syncVisual(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ IMPORTANT: when inactive, keep visuals synced (no "Dose One" flash)
  useMotionValueEvent(mv, "change", (v) => {
    if (active) apply(v);
    else syncVisual(v);
  });

  const stepsCount = timelineSteps.length;
  const trackWidthVW = stepsCount * 100;

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-screen w-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#000" }}
    >
      {/* gradient layers */}
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

      <div className="relative z-10 w-full h-full">
        {/* horizontal cards track */}
        <div className="h-full w-full flex items-center">
          <div ref={trackRef} className="flex h-full" style={{ width: `${trackWidthVW}vw` }}>
            {timelineSteps.map((item, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="shrink-0 w-screen flex flex-col items-center justify-center text-center px-8"
                style={{ opacity: index === 0 ? 1 : 0, transition: "opacity 0.2s linear" }}
              >
                {item.pill_Image && (
                  <img
                    src={item.pill_Image}
                    alt={item.doseLabel || item.title}
                    className="w-[60px] h-[60px] md:w-20 md:h-20 lg:w-13 lg:h-13 2xl:w-20 2xl:h-20 mb-4 md:mb-6 lg:mb-3 2xl:mb-6 opacity-90"
                  />
                )}

                {item.doseLabel && <p className="section-4-light-text mb-5">{item.doseLabel}</p>}

                <h2 className="h2-text">
                  {item.title}{" "}
                  {item.subtitle && <span className="h2-text-bold">{item.subtitle}</span>}
                </h2>

                {item.description && (
                  <p className="section-4-paragraph-text w-[400px] md:w-[700px] lg:w-[52.083vw] px-4 md:px-0 mt-4">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* bottom rotating circle */}
        <div className="pointer-events-none absolute -bottom-[21vh] md:-bottom-[30vh] lg:-bottom-[25vh] xl:-bottom-[43vh] 2xl:-bottom-[34vh] left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div
            ref={circleRef}
            className="relative w-[300px] md:w-[430px] lg:w-[380px] xl:w-[400px] 2xl:w-[500px] aspect-square rounded-full border border-white/25"
          >
            {timelineSteps.map((step, index) => {
              const angle = (index / stepsCount) * 360;

              return (
                <div
                  key={index}
                  ref={(el) => (markerRefs.current[index] = el)}
                  className="absolute left-1/2 top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-46%)`,
                    opacity: index === 0 ? 1 : 0.15,
                  }}
                >
                  {step.orbitIcon && (
                    <img
                      src={step.orbitIcon}
                      alt={`Dose ${index + 1} icon`}
                      className="mb-8 md:mb-10 lg:mb-5 xl:mb-5 2xl:mb-10 h-10 w-10 md:h-15 md:w-15 lg:h-13 lg:w-13 2xl:h-20 2xl:w-20"
                    />
                  )}
                  <span className="section-4-circle-numbers-text mb-32 md:mb-45 lg:mb-40 xl:mb-45 2xl:mb-55">
                    {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
