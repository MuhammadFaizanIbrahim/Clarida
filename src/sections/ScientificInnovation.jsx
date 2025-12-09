import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import EntranceAnimation, {
  itemVariants,
  containerVariants,
} from "../components/EntranceAnimation";

const ScientificInnovation = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 }); // same as Tailwind's 'md' breakpoint

  // 🔊 AUDIO + VISIBILITY STATE
  const sectionRef = useRef(null);
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
    const totalSteps = Math.max(Math.round(durationMs / 50), 1);
    let step = 0;
    const volumeDiff = targetVolume - startVolume;

    if (targetVolume > 0 && audio.paused) {
      audio.loop = true;
      audio.play().catch(() => {
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

      // if during fade we moved out of view or audio turned off, stop
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

  // ---------- SINGLE SOURCE OF TRUTH FOR PLAY / PAUSE ----------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    isInViewRef.current = isInView;
    isAudioOnRef.current = isAudioOn;

    const shouldPlay = isInView && isAudioOn;

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

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end justify-between text-white overflow-hidden"
    >
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/scientific.webm"
        poster="scientific-bg.jpg"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      {/* 🔊 SECTION AUDIO */}
      <audio
        ref={audioRef}
        src="/audios/scientific.mp3" // <-- put your actual audio file here
        preload="auto"
        loop
      />

      <div className="absolute inset-0 bg-black/15 pointer-events-none z-10" />

      <EntranceAnimation
        className="relative z-10 px-5 md:px-8 lg:px-12 2xl:px-20 py-12 md:py-8 lg:py-[3.906vw] 
        flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between w-full gap-2 text-center md:text-left"
        style={{
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.00) 25%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.40) 100%) ${
            isMobile ? "65%" : "25.95%"
          })`,
        }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side */}
        <motion.div
          className="w-full flex flex-col gap-3 md:gap-6"
          variants={containerVariants}
        >
          <motion.h1 className="h2-text" variants={itemVariants}>
            Science That <span className="h2-text-bold">Restores</span>
          </motion.h1>
        </motion.div>

        {/* Right Side */}
        <EntranceAnimation
          className="md:w-1/2 flex flex-col items-center md:items-start"
          variants={containerVariants}
        >
          <motion.p
            className="hero-paragraph-normal w-[350px] md:w-[400px] lg:w-[40.625vw] text-center md:text-left"
            variants={itemVariants}
          >
            Clarida is built on decades of regenerative science — and the data
            behind this field is remarkable.
          </motion.p>
          <motion.div
            variants={itemVariants}
            transition={{ duration: 1, delay: 1.2 }} // delay in seconds
          >
            <Button
              extra="gap-2 mt-5 lg:mt-3 2xl:mt-6 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
            >
              View Scientific Proof
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          </motion.div>
        </EntranceAnimation>
      </EntranceAnimation>
    </section>
  );
};

export default ScientificInnovation;
