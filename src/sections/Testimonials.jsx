import React, { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import EntranceAnimation, { itemVariants } from "../components/EntranceAnimation";

const testimonialsData = [
  {
    name: "Steve",
    image: "images/testimonialsBG/Steve.png",
    mob_image: "images/testimonialsBG/Steve-mob.png",
    quoteStart: "I felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "prisoner", bold: true },
    ],
    description:
      "Everything was a blur — people’s faces, the street signs, even my own reflection. And just three months after starting Clarida, I passed a vision test... and got my license back.",
    age: "68",
    ml: "[calc(5.5ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Carmen",
    image: "images/testimonialsBG/Carmen.png",
    mob_image: "images/testimonialsBG/Carmen-mob.png",
    quoteStart: "The first thing I saw",
    highlight: [
      { text: "was her", bold: false },
      { text: "smile", bold: true },
    ],
    description:
      "My granddaughter’s face came into focus. I burst into tears. Clarida didn’t just give me back my vision. It gave me back connection",
    age: "72",
    ml: "[calc(5.5ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Leon",
    image: "images/testimonialsBG/Leon.png",
    mob_image: "images/testimonialsBG/Leon-mob.png",
    quoteStart: "Quiet progress day",
    highlight: [
      { text: "after", bold: false },
      { text: "day", bold: true },
    ],
    description:
      "No surgery. No side effects. And then one morning… I could read the newspaper again. Clarida gave me a rhythm I could trust.",
    age: "74",
    ml: "[calc(8ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Theresa",
    image: "images/testimonialsBG/Theresa.png",
    mob_image: "images/testimonialsBG/Theresa-mob.png",
    quoteStart: "Autumn hit me",
    highlight: [
      { text: "like a", bold: false },
      { text: "painting", bold: true },
    ],
    description:
      "I didn’t realize how much I missed color until it came back. Clarida brought the world back—in full color.",
    age: "65",
    ml: "[calc(5ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "David",
    image: "images/testimonialsBG/David.png",
    mob_image: "images/testimonialsBG/David-mob.png",
    quoteStart: "I didn’t think it",
    highlight: [
      { text: "would", bold: false },
      { text: "work", bold: true },
    ],
    description:
      "But I followed the rhythm. Every capsule. Every day. By week nine, my night vision was back. And now I can drive at dusk again.",
    age: "70",
    ml: "[calc(6ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Mei",
    image: "images/testimonialsBG/Mei.png",
    mob_image: "images/testimonialsBG/Mei-mob.png",
    quoteStart: "I finished two books",
    highlight: [
      { text: "last", bold: false },
      { text: "week", bold: true },
    ],
    description:
      "I hadn’t read a book in three years. Now, I’m back to reading every night. Clarida gave me that back—and so much more.",
    age: "69",
    ml: "[calc(8ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Ester",
    video: "/videos/Ester.webm",
    image: "/bg-leon.jpg",
    quoteStart: "It felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "rebirth", bold: true },
    ],
    description:
      "Colors returned, lights softened, and I could finally read without strain. Clarida changed everything.",
    age: "61",
  },
  {
    name: "Adriana",
    video: "/videos/Adriana.webm",
    image: "/bg-leon.jpg",
    quoteStart: "It felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "rebirth", bold: true },
    ],
    description:
      "Colors returned, lights softened, and I could finally read without strain. Clarida changed everything.",
    age: "61",
  },
  {
    name: "Mariana",
    video: "/videos/Mariana.webm",
    image: "/bg-leon.jpg",
    quoteStart: "It felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "rebirth", bold: true },
    ],
    description:
      "Colors returned, lights softened, and I could finally read without strain. Clarida changed everything.",
    age: "61",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hideLeft, setHideLeft] = useState(false);
  const t = testimonialsData[active];
  const hasVideo = Boolean(t.video);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const extraIcon = "icons/videoIcon.svg";

  // 🔊 AUDIO / VIDEO CONTROL STATE
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [isInView, setIsInView] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  const isInViewRef = useRef(false);
  const isAudioOnRef = useRef(false);

  // ---------- FADE HELPER (same pattern as hero, but for video) ----------
  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeTo = (video, targetVolume, durationMs) => {
    if (!video) return;

    clearFadeInterval();

    if (targetVolume === 0 && video.paused) {
      video.volume = 1;
      video.muted = true;
      return;
    }

    const startVolume =
      typeof video.volume === "number"
        ? video.volume
        : targetVolume > 0
        ? 0
        : 1;
    const totalSteps = Math.max(Math.round(durationMs / 50), 1);
    let step = 0;
    const volumeDiff = targetVolume - startVolume;

    if (targetVolume > 0 && video.paused) {
      video.muted = false;
      video
        .play()
        .catch(() => {
          // autoplay blocked – ignore
        });
    }

    if (durationMs <= 0) {
      video.volume = targetVolume;
      if (targetVolume === 0) {
        video.pause();
        video.volume = 1;
        video.muted = true;
      }
      return;
    }

    fadeIntervalRef.current = setInterval(() => {
      const shouldPlayNow = isInViewRef.current && isAudioOnRef.current && hasVideo;

      // if during fade we moved out of view or audio turned off or no video, stop
      if (targetVolume > 0 && !shouldPlayNow) {
        clearFadeInterval();
        video.pause();
        video.volume = 1;
        video.muted = true;
        return;
      }

      step += 1;
      const t = Math.min(step / totalSteps, 1);
      const nextVolume = startVolume + volumeDiff * t;
      video.volume = Math.min(Math.max(nextVolume, 0), 1);

      if (t >= 1) {
        clearFadeInterval();
        if (targetVolume === 0) {
          video.pause();
          video.volume = 1;
          video.muted = true;
        }
      }
    }, 50);
  };

  // ---------- INITIAL SYNC WITH GLOBAL TOGGLE ----------
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

  // ---------- SCROLL VISIBILITY (CENTER-BASED) ----------
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

  // ---------- LISTEN FOR HEADER AUDIO TOGGLE ----------
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

  // ---------- SINGLE SOURCE OF TRUTH FOR VIDEO PLAY / PAUSE ----------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    isInViewRef.current = isInView;
    isAudioOnRef.current = isAudioOn;

    const shouldPlay = isInView && isAudioOn && hasVideo;

    if (shouldPlay) {
      video.muted = false;
      fadeTo(video, 1, 600);
    } else {
      fadeTo(video, 0, 800);
    }
  }, [isInView, isAudioOn, hasVideo, active]);

  // ---------- CLEANUP ON UNMOUNT ----------
  useEffect(() => {
    return () => {
      clearFadeInterval();
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.volume = 1;
        video.muted = true;
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full h-screen lg:h-full overflow-hidden flex flex-col-reverse md:flex-row 
    items-center justify-between px-8 py-15 md:px-20 md:py-20 lg:px-[7.813vw] lg:py-[6.5vw]"
      style={{
        backgroundImage: hasVideo
          ? "none"
          : `url(${isMobile ? t.mob_image : t.image})`,
      }}
    >
      <AnimatePresence mode="wait">
        {!hasVideo && (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full z-0 sm:bg-cover md:bg-cover lg:bg-auto"
            style={{
              backgroundImage: `url(${isMobile ? t.mob_image : t.image})`,
            }}
          />
        )}
      </AnimatePresence>

      {hasVideo && (
        <video
          ref={videoRef}
          src={t.video}
          autoPlay
          muted
          // loop
          playsInline
          onPlay={() => setHideLeft(true)} // hide when video starts
          onPause={() => setHideLeft(false)} // optional: show when video pauses
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* LEFT PANEL */}
      <div
        className={`relative z-10 w-[350px] md:w-[290px] lg:w-[350px] 2xl:w-[400px] bg-white/5 backdrop-blur-[5px]
        border border-white/50 rounded-lg px-[45px] py-5 md:p-[1.563vw]
        transition-opacity duration-500
        ${!isDesktop && "opacity-100"} ${
          isDesktop && hideLeft ? "opacity-0" : "opacity-100"
        }`}
        {...(isDesktop && {
          onMouseEnter: () => setHideLeft(false),
          onMouseLeave: () => hasVideo && setHideLeft(true),
        })}
      >
        <motion.h3
          className="section-3-small-heading text-center md:text-left"
          variants={itemVariants}
        >
          <motion.span className="md:inline-block">See What </motion.span>
          <motion.span className="md:inline-block md:ml-[calc(5.5ch)]">
            They See
          </motion.span>
        </motion.h3>

        {/* Mobile Dropdown */}
        <motion.div
          className="mt-6 relative md:hidden"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            variants={itemVariants}
            className="w-full h-[50px] flex justify-between items-center px-5 rounded-lg border border-white/50 bg-white/20 backdrop-blur-[5px] cursor-pointer text-left section-3-names-text-selected"
          >
            {testimonialsData[active].name}
            <img
              src="icons/arrowIcon.svg"
              alt="Arrow"
              className={`transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {dropdownOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-full rounded-lg border border-white/50 bg-(--color-bg) backdrop-blur-[5px] mt-2 flex flex-col z-20">
              {testimonialsData.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActive(index);
                    setDropdownOpen(false);
                  }}
                  className={`flex text-left px-4 cursor-pointer transition items-center gap-2 ${
                    active === index
                      ? "section-3-names-text-selected"
                      : "section-3-names-text-unselected"
                  }`}
                >
                  {item.name}

                  {index >= testimonialsData.length - 3 && (
                    <img
                      src={extraIcon}
                      alt="icon"
                      className="w-4 h-4 opacity-80"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Desktop Names List */}
        <motion.div
          className="hidden md:block mt-6 -space-y-2 lg:space-y-0.5"
          variants={itemVariants}
        >
          {testimonialsData.map((item, index) => (
            <motion.button
              key={item.name}
              variants={itemVariants}
              onClick={() => setActive(index)}
              className={`flex text-left text-base transition cursor-pointer items-center gap-2 ${
                active === index
                  ? "section-3-names-text-selected"
                  : "section-3-names-text-unselected"
              }`}
            >
              {item.name}

              {index >= testimonialsData.length - 3 && (
                <img src={extraIcon} alt="icon" className="w-6 h-6" />
              )}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <Button
            extra="gap-2 mt-5 lg:mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] whitespace-nowrap"
          >
            Join The Vision Revolution
            <img
              src="icons/arrowIcon.svg"
              alt="Clarida Text"
              className="rotate-270"
            />
          </Button>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <EntranceAnimation
        className={`relative md:z-10 w-[350px] md:w-[430px] lg:w-[33.125vw] mt-10 md:mt-20 lg:mt-45
       transition-opacity duration-500
       ${hasVideo ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.h2>
              <span className="-mt-20 md:-mt-[8.292vw] lg:-mt-[7.292vw] absolute quotationText">
                “
              </span>
              <motion.span className="block section-3-heading-text">
                {t.quoteStart}
              </motion.span>
              {t.highlight.map((word, i) => (
                <motion.span
                  key={i}
                  className={`${
                    word.bold
                      ? "section-3-heading-text-bold"
                      : "section-3-heading-text"
                  } ${i === 0 ? `ml-${isMobile ? t.mob_ml : t.ml}` : ""}`}
                >
                  {word.text}{" "}
                </motion.span>
              ))}
            </motion.h2>

            <motion.p className="sections-paragraph-text">
              {t.description}
            </motion.p>

            <motion.p className="NamesText">
              {t.name}, {t.age}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </EntranceAnimation>
    </section>
  );
};

export default Testimonials;
