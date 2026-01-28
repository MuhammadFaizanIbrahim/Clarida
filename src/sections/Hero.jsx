import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { useMediaQuery } from "react-responsive";
import { motion, useTransform, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  itemVariants,
  containerVariants,
} from "../components/EntranceAnimation";

const Hero = ({ active = true, exitT }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const location = useLocation();

  const sectionRef = useRef(null);
  const audioRef = useRef(null);

  // for smooth fade using setInterval
  const fadeIntervalRef = useRef(null);

  const [isInView, setIsInView] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  // 🔹 NEW: lazy-load media state
  const [videoSrc, setVideoSrc] = useState(null);
  const [posterSrc, setPosterSrc] = useState(null);

  // keep latest values to avoid stale closures
  const isInViewRef = useRef(false);
  const isAudioOnRef = useRef(false);
  const activeRef = useRef(active);

  // keep latest active in ref
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // ✅ pinned/stacked pages: force audio off immediately when this section becomes inactive
  useEffect(() => {
    if (!active) {
      isInViewRef.current = false;
      setIsInView(false);
    }
  }, [active]);

  // ------------- FADE HELPER (single source of truth) -------------

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeTo = (audio, targetVolume, durationMs) => {
    if (!audio) return;

    clearFadeInterval();

    // immediate stop if turning fully off and it's already paused
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
    const totalSteps = Math.max(Math.round(durationMs / 50), 1); // ~20 FPS
    let step = 0;
    const volumeDiff = targetVolume - startVolume;

    // if fading IN, ensure playback starts
    if (targetVolume > 0 && audio.paused) {
      audio.loop = true;
      audio.play().catch(() => {
        // autoplay blocked – nothing to do
      });
    }

    // if duration is 0, just jump
    if (durationMs <= 0) {
      audio.volume = targetVolume;
      if (targetVolume === 0) {
        audio.pause();
        audio.volume = 1;
      }
      return;
    }

    fadeIntervalRef.current = setInterval(() => {
      // ✅ include active in abort condition
      const shouldPlayNow =
        activeRef.current && isInViewRef.current && isAudioOnRef.current;

      if (targetVolume > 0 && !shouldPlayNow) {
        // we were fading in but conditions invalid now
        clearFadeInterval();
        audio.pause();
        audio.volume = 1;
        return;
      }

      step += 1;
      const t = Math.min(step / totalSteps, 1); // 0 → 1
      const nextVolume = startVolume + volumeDiff * t;
      audio.volume = Math.min(Math.max(nextVolume, 0), 1);

      if (t >= 1) {
        clearFadeInterval();
        if (targetVolume === 0) {
          audio.pause();
          audio.volume = 1; // reset for next time
        }
      }
    }, 50);
  };

  // ------------- INITIAL SYNC WITH GLOBAL AUDIO FLAG -------------

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

  // ------------- SCROLL VISIBILITY (center-based) -------------

  useEffect(() => {
    const handleScroll = () => {
      // ✅ if inactive, treat as not in view
      if (!active) {
        if (isInViewRef.current) {
          isInViewRef.current = false;
          setIsInView(false);
        }
        return;
      }

      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      const center = rect.top + rect.height / 2;
      const inView = center > vh * 0.15 && center < vh * 0.85;

      setIsInView(inView);
      isInViewRef.current = inView;
    };

    handleScroll(); // initial
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [active]);

  // ------------- LAZY-LOAD BACKGROUND VIDEO & POSTER -------------

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // only set once
            setVideoSrc("/videos/hero-bg.webm");
            setPosterSrc("/images/hero.jpg");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // ------------- HANDLE GLOBAL AUDIO TOGGLE EVENTS -------------

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

  // ------------- SINGLE SOURCE OF TRUTH FOR PLAY/PAUSE -------------

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ✅ include active
    const shouldPlay = active && isInView && isAudioOn;

    isInViewRef.current = isInView;
    isAudioOnRef.current = isAudioOn;
    activeRef.current = active;

    if (shouldPlay) {
      fadeTo(audio, 1, 600);
    } else {
      fadeTo(audio, 0, 800);
    }
  }, [active, isInView, isAudioOn]);

  // ------------- CLEANUP ON UNMOUNT -------------

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

  const reducedMotion = useReducedMotion();

  // TEXT (closer layer = moves more)
  const textExitY =
    !exitT || reducedMotion ? 0 : useTransform(exitT, [0, 1], [0, -180]);

  const textExitScale =
    !exitT || reducedMotion ? 1 : useTransform(exitT, [0, 1], [1, 1.07]);

  const textExitOpacity =
    !exitT || reducedMotion
      ? 1
      : useTransform(exitT, [0, 0.1, 1], [1, 0.28, 0]);

  // BACKGROUND (far layer = moves less)
  const bgExitY =
    !exitT || reducedMotion ? 0 : useTransform(exitT, [0, 1], [0, -45]);

  const bgExitOpacity =
    !exitT || reducedMotion ? 1 : useTransform(exitT, [0, 1], [1, 0]);

  const bgExitScale =
    !exitT || reducedMotion ? 1 : useTransform(exitT, [0, 1], [1.02, 1.06]);

  const bgExitBlur =
    !exitT || reducedMotion
      ? "blur(0px)"
      : useTransform(exitT, [0, 1], ["blur(0px)", "blur(2px)"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end justify-between text-white overflow-hidden"
    >
      {/* Background Video */}
      <motion.video
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          y: bgExitY,
          opacity: bgExitOpacity,
          scale: bgExitScale,
          filter: bgExitBlur,
        }}
        src={videoSrc || undefined}
        poster={posterSrc || undefined}
        autoPlay={!!videoSrc}
        loop
        muted
        playsInline
        preload="none"
      />

      {/* 🔊 HERO AUDIO */}
      <audio ref={audioRef} src="/audios/hero.mp3" preload="auto" loop />

      {/* MAIN ANIMATED WRAPPER */}
      <motion.div
  key={location.pathname}
  className="relative z-10 px-5 md:px-8 lg:px-[7.813vw] py-12 md:py-8 lg:py-[3.906vw]
  flex flex-col md:flex-row items-center justify-center md:justify-between w-full gap-2 md:gap-10 text-center md:text-left"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {/* ✅ gradient layer (does NOT move) */}
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      background: `linear-gradient(180deg, rgba(13,31,45,0) 3.78%, var(--color-bg) ${
        isMobile ? "65%" : "25.95%"
      })`,
    }}
  />

  {/* ✅ content layer (moves) */}
  <motion.div
    className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 md:gap-10 text-center md:text-left"
    style={{
      y: textExitY,
      opacity: textExitOpacity,
      scale: textExitScale,
    }}
  >
        {/* LEFT */}
        <motion.div
          className="w-full flex flex-col gap-3 md:gap-6"
          variants={containerVariants}
        >
          <motion.p className="hero-top-text" variants={itemVariants}>
            The Science That Lets You See
          </motion.p>

          <motion.h1 className="h1-text" variants={itemVariants}>
            <span className="font-bold italic md:font-medium md:not-italic">
              Restore{" "}
            </span>
            Your Vision <br /> Reclaim Your
            <span className="font-bold italic md:font-medium md:not-italic">
              {" "}
              Life
            </span>
          </motion.h1>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className="md:w-1/2 flex flex-col items-center md:items-start"
          variants={containerVariants}
        >
          <motion.h3
            className={`${
              isMobile ? "hero-paragraph-normal" : "hero-paragraph-bold"
            } md:w-[390px] lg:w-[27.135vw] text-center md:text-left`}
            variants={itemVariants}
          >
            Clarida’s Zebrafish-Inspired Eye Therapy
          </motion.h3>

          <motion.p
            className="hero-paragraph-normal w-[350px] md:w-[390px] lg:w-[27.135vw] text-center md:text-left"
            variants={itemVariants}
          >
            Marine Biology Meets Nutritional Science to Regenerate the Macula—
            For Those Living With Vision Loss, Including AMD.
          </motion.p>

          <motion.div
            variants={itemVariants}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <Button
              extra="gap-2 mt-5 lg:mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("clarida-jump-footer"));
              }}
            >
              Join The Vision Revolution
              <img src="icons/arrowIcon.svg" className="rotate-270" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
