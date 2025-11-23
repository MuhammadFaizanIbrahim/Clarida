// RegeneratonTimeline.jsx
import React, { useLayoutEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "react-responsive";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx"; // adjust path

gsap.registerPlugin(ScrollTrigger);

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

const RegenerationTimeline = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const timeBarRef = useRef(null);

  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(0);
  const bgRefs = useRef([]);
  const cardRefs = useRef([]); // 🔥 used for text fade

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const baseSteps = timelineSteps;
  const baseStepsCount = baseSteps.length;

  const displaySteps = useMemo(() => {
    if (!isMobile) {
      return baseSteps.map((step, idx) => ({
        ...step,
        baseIndex: idx,
      }));
    }

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
  }, [isMobile]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const timeBar = timeBarRef.current;
    if (!section || !track || !timeBar) return;

    const totalScroll = track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      gsap.to([track, timeBar], {
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
            // ------- background gradient cross-fade (same as before) -------
            const maxIndex = timelineSteps.length - 1;
            const indexFloat = self.progress * maxIndex;
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

            // ------- NEW: fade cards based on viewport position -------
            const trackX = gsap.getProperty(track, "x"); // current horizontal shift in px
            const vw = window.innerWidth;
            const centerX = vw / 2;

            // inner zone around center where card stays fully visible
            const innerZone = 0.2; // 20% of half-width = central 40% of screen

            cardRefs.current.forEach((el, idx) => {
              if (!el) return;

              // card center in viewport coordinates
              const cardCenter =
                idx * vw + centerX + trackX; // because each card is 100vw wide

              const distanceFromCenter = Math.abs(cardCenter - centerX);
              const normalized = distanceFromCenter / centerX; // 0 at center, 1 at edges, >1 offscreen

              let opacity;
              if (normalized <= innerZone) {
                // fully visible in the central band
                opacity = 1;
              } else if (normalized >= 1) {
                // completely outside viewport
                opacity = 0;
              } else {
                // fade from 1 → 0 between innerZone and the edges
                const localT = (normalized - innerZone) / (1 - innerZone);
                opacity = 1 - localT;
              }

              gsap.set(el, { opacity });
            });
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [displaySteps.length]);

  const stepsCount = displaySteps.length;
  const trackWidthVW = stepsCount * 100;
  const tickCount = baseStepsCount - 3;
  const tickSpacingVW = 100;

  const timeBarWidthVW = tickCount * tickSpacingVW;
  const timeBarWidthVWTablet = tickCount * tickSpacingVW;
  const timeBarWidthVWMobile = tickCount * tickSpacingVW;

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

      {/* TOP TIME LINE – only for first tickCount steps */}
      <div
        ref={timeBarRef}
        className="
        pointer-events-none absolute top-15 md:top-10 -left-17 md:-left-17 lg:-left-21 z-10 
        w-(--timebar-width-mobile)
        sm:w-(--timebar-width-tablet)
        lg:w-(--timebar-width-desktop)"
        style={{
          "--timebar-width-mobile": `${timeBarWidthVWMobile}vw`,
          "--timebar-width-tablet": `${timeBarWidthVWTablet}vw`,
          "--timebar-width-desktop": `${timeBarWidthVW}vw`,
        }}
      >
        <div className="relative h-[70px]">
          {/* continuous line */}
          <div
            className="absolute h-px left-64 md:left-[55.87vw] lg:left-[54.2vw] right-[34.5vw] md:right-[44.1vw] lg:right-[46vw] bg-(--color-text)"
            style={{
              top: "0%",
              transform: "translateY(-50%)",
            }}
          />

          {/* ticks + labels for first (stepsCount - 3) items */}
          {timelineSteps.slice(0, tickCount).map((item, index) => (
            <div
              key={index}
              className="absolute flex flex-col items-center top-[55.5%] md:top-[65%] lg:top-[70%]"
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
              isMobile && isClaridaBase && item.mobileSplitPart === "biology";
            const isMobileListens =
              isMobile && isClaridaBase && item.mobileSplitPart === "listens";

            return (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="shrink-0 w-screen flex flex-col items-center justify-center text-center px-8"
                style={{
                  opacity: index === 0 ? 1 : 0, // starting state
                  transition: "opacity 0.2s linear",
                }}
              >
                {/* hide clock for last 3 (based on baseIndex) */}
                {!isLastThree && (
                  <img
                    src={item.clockIcon}
                    alt={item.time}
                    className="w-10 h-10 mb-7 md:mb-4 opacity-90"
                  />
                )}

                {/* heading */}
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

      {/* Scroll Indicator */}
      <div className="ScrollText absolute flex flex-col items-center bottom-10">
        <img
          src="icons/arrowIcon.svg"
          alt="Scroll"
          className="border-2 border-white rounded-full p-3 h-10 w-10 cursor-pointer"
        />
        Scroll
      </div>
    </section>
  );
};

export default RegenerationTimeline;
