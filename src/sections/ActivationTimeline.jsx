// ActivationTimeline.jsx (updated)
import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";

gsap.registerPlugin(ScrollTrigger);

// 7 doses, content styled like the screenshots
const timelineSteps = [
  {
    doseLabel: "Dose One:",
    title: "Morning",
    subtitle: "Activation",
    description:
      "Signals the start of the day, awakening energy and focus.",
    pill_Image: "/images/pill.png",
    orbitIcon: "/icons/DoseOne.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, #C49842 0%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    doseLabel: "Dose Two:",
    title: "Mid-Morning",
    subtitle: "Clarity",
    description:
      "Supports sharper contrast and visual comfort as light exposure increases.",
      pill_Image: "/images/pill.png",
      orbitIcon: "/icons/DoseTwo.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Logo-Blue, #39D5DE) 0%, var(--Golden-Amber-Light, #FFD684) 75%)",
  },
  {
    doseLabel: "Dose Three:",
    title: "Midday Energy",
    subtitle: "Alignment",
    description:
      "Keeps the rhythm balanced at peak activity hours.",
      pill_Image: "/images/pill.png",
      orbitIcon: "/icons/DoseThree.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Logo-Blue, #39D5DE) 29.81%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    doseLabel: "Dose Four:",
    title: "Afternoon",
    subtitle: "Renewal",
    description:
      "Reinforces cellular repair and sustained clarity before evening fatigue sets in.",
      pill_Image: "/images/pill.png",
      orbitIcon: "/icons/DoseFour.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Golden-Amber-Light, #FFD684) 0%, var(--Ocular-Rose-Gold, #D8A6A1) 75.48%, var(--Logo-Blue, #39D5DE) 100%)",
  },
  {
    doseLabel: "Dose Five:",
    title: "Evening",
    subtitle: "Balance",
    description:
      "Prepares the body and eyes for transition into rest, maintaining smooth vision.",
      pill_Image: "/images/pill.png",
      orbitIcon: "/icons/DoseFive.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 50.48%, var(--Golden-Amber-Light, #FFD684) 100%)",
  },
  {
    doseLabel: "Dose Six:",
    title: "Night",
    subtitle: "Repair",
    description:
      "Anchors the regenerative cycle overnight.",
      pill_Image: "/images/pill.png",
      orbitIcon: "/icons/DoseSix.svg",
    gradient:
      "radial-gradient(101.85% 101.85% at 50% 100%, var(--Midnight-Teal, #12343B) 67.79%, #05533F 100%)",
  },
];

const ActivationTimeline = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(0);
  const bgRefs = useRef([]);
  const cardRefs = useRef([]); // for text fade
  const circleRef = useRef(null);
  const markerRefs = useRef([]); // markers/icons around the circle

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=" + totalScroll,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const maxIndex = timelineSteps.length - 1;
            const indexFloat = self.progress * maxIndex;
            const baseIndex = Math.floor(indexFloat);
            const t = indexFloat - baseIndex;

            // ---------- gradient cross-fade (unchanged) ----------
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

            // ---------- card fade in/out based on viewport ----------
            const trackX = gsap.getProperty(track, "x");
            const vw = window.innerWidth;
            const centerX = vw / 2;
            const innerZone = 0.2; // central 40% is fully visible

            cardRefs.current.forEach((el, idx) => {
              if (!el) return;
              const cardCenter = idx * vw + centerX + trackX;
              const distanceFromCenter = Math.abs(cardCenter - centerX);
              const normalized = distanceFromCenter / centerX;

              let opacity;
              if (normalized <= innerZone) {
                opacity = 1;
              } else if (normalized >= 1) {
                opacity = 0;
              } else {
                const localT = (normalized - innerZone) / (1 - innerZone);
                opacity = 1 - localT;
              }

              gsap.set(el, { opacity });
            });

            // ---------- rotating circle at bottom ----------
            const anglePerStep = 360 / timelineSteps.length;
            const rotation = -indexFloat * anglePerStep;

            if (circleRef.current) {
              gsap.set(circleRef.current, { rotate: rotation });
            }

            const activeIndex = Math.round(indexFloat);
            const stepsN = timelineSteps.length;

            markerRefs.current.forEach((el, i) => {
              if (!el) return;
              let dist = Math.abs(i - activeIndex);
              if (dist > stepsN / 2) dist = stepsN - dist; // wrap

              // center = 1, neighbors ~0.4, others ~0.15
              let opacity = 0.15;
              if (dist === 0) opacity = 1;
              else if (dist <= 1) opacity = 0.4;

              gsap.set(el, { opacity });
            });
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const stepsCount = timelineSteps.length;
  const trackWidthVW = stepsCount * 100;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#000" }}
    >
      {/* GRADIENT LAYERS */}
      <div className="absolute inset-0 -z-10">
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

      {/* HORIZONTAL CARDS TRACK */}
      <div className="h-full w-full flex items-center">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${trackWidthVW}vw` }}
        >
          {timelineSteps.map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="shrink-0 w-screen flex flex-col items-center justify-center text-center px-8"
              style={{
                opacity: index === 0 ? 1 : 0,
                transition: "opacity 0.2s linear",
              }}
            >
              {/* capsule / icon above text (reuse pill_Image asset path) */}
              {item.pill_Image && (
                <img
                  src={item.pill_Image}
                  alt={item.doseLabel || item.title}
                  className="w-[60px] h-[60px] md:w-20 md:h-20 lg:w-13 lg:h-13 2xl:w-20 2xl:h-20 mb-4 md:mb-6 lg:mb-3 2xl:mb-6 opacity-90"
                />
              )}

              {/* NEW: dose label above heading */}
              {item.doseLabel && (
                <p className="section-4-light-text mb-5">{item.doseLabel}</p>
              )}

              {/* heading (unchanged typography classes) */}
              <h2 className="h2-text">
                {item.title}{" "}
                {item.subtitle && (
                  <span className="h2-text-bold">{item.subtitle}</span>
                )}
              </h2>

              {/* description */}
              {item.description && (
                <p className="section-4-paragraph-text w-[400px] md:w-[700px] lg:w-[52.083vw] px-4 md:px-0 mt-4">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROTATING CIRCLE */}
      <div className="pointer-events-none absolute -bottom-[21vh] md:-bottom-[30vh] lg:-bottom-[25vh] xl:-bottom-[28vh] 2xl:-bottom-[34vh] left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div
          ref={circleRef}
          className="relative w-[300px] md:w-[430px] lg:w-[380px] xl:w-[400px] 2xl:w-[500px]
          aspect-square rounded-full border border-white/25"
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
    </section>
  );
};

export default ActivationTimeline;
