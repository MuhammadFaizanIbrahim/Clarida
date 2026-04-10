import React, { useEffect, useMemo, useRef } from "react";
import Button from "../components/Button.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { useMediaQuery } from "react-responsive";
import { gsap } from "gsap";
import { useMotionValue, useMotionValueEvent } from "framer-motion";

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMotionValue = (v) =>
  v && typeof v === "object" && typeof v.get === "function";

const Footer = ({ progress = 0, active = true }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const animRef = useRef(null);
  const didIntroRef = useRef(false);
  const lastPRef = useRef(0);

  const fallback = useMotionValue(0);
  const mv = useMemo(
    () => (isMotionValue(progress) ? progress : fallback),
    [progress, fallback]
  );

  useEffect(() => {
    if (!isMotionValue(progress))
      fallback.set(typeof progress === "number" ? progress : 0);
  }, [progress, fallback]);

  const INTRO_Y = 400;
  const INTRO_SCALE = 0.8;
  const INTRO_DURATION = 3.2;

  const runIntro = () => {
    const el = animRef.current;
    if (!el) return;

    gsap.killTweensOf(el);

    gsap.set(el, {
      y: INTRO_Y,
      opacity: 0,
      scale: INTRO_SCALE,
      transformOrigin: "center center",
      willChange: "transform, opacity",
    });

    gsap.to(el, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: INTRO_DURATION,
      ease: "power3.out",
      overwrite: true,
      clearProps: "willChange",
    });
  };

  useEffect(() => {
    const el = animRef.current;
    if (!active) {
      didIntroRef.current = false;
      lastPRef.current = 0;
      if (el) gsap.set(el, { y: 0, opacity: 1 });
    }
  }, [active]);

  const apply = (pRaw) => {
    if (!active) return;

    const p = clamp01(pRaw);
    const prevP = lastPRef.current;
    lastPRef.current = p;

    const THRESH = 0.002;

    if (p <= THRESH) {
      didIntroRef.current = false;
    }

    if (!didIntroRef.current && prevP <= THRESH && p > THRESH) {
      didIntroRef.current = true;
      runIntro();
    }
  };

  useMotionValueEvent(mv, "change", (v) => apply(v));

  return (
    <section className="relative h-screen bg-cover bg-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/footer.webm"
        poster="/images/footer.jpg"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/10 z-10 flex flex-col justify-between
        py-8 px-4 
        sm:py-10 sm:px-6
        md:py-8 md:px-18 
        lg:py-10 lg:px-40 
        2xl:px-[260px] 
        gap-5 md:gap-10
        overflow-y-auto"
      >
        {/* Animated wrapper */}
        <div
          ref={animRef}
          className="flex h-full flex-col justify-between gap-4 sm:gap-5 md:gap-10"
        >
          {/* Heading */}
          <div className="flex flex-col lg:flex-row items-center gap-0 w-full">
            <h2 className="h2-text text-center">
              You're Not <span className="h2-text-bold">Waiting.</span>
              You're <span className="h2-text-bold">Awakening.</span>
            </h2>
          </div>

          {/* Contact Form */}
          <form
            className="
              space-y-3
              sm:space-y-4
              md:space-y-8 
              lg:space-y-6 
              2xl:space-y-8 
              w-full
              max-w-[350px]
              sm:max-w-[440px]
              md:max-w-[800px] 
              lg:max-w-[780px] 
              2xl:max-w-[950px] 
              mx-auto text-center"
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Form submitted");
            }}
          >
            {/* Name and Email — stacked on mobile */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-6 lg:gap-0.5 2xl:gap-6">
              <input
                type="text"
                placeholder="Your name*"
                className="footer-small-text py-2 w-full px-4 md:px-[26px] bg-transparent 
                  h-11 sm:h-12 md:h-14 lg:h-[2.917vw]
                  border border-[rgba(255,255,255,0.50)] rounded-lg focus:outline-none backdrop-blur-[5px]"
              />
              <input
                type="email"
                placeholder="Your email address*"
                className="footer-small-text py-2 w-full px-4 md:px-[26px] bg-transparent 
                  h-11 sm:h-12 md:h-14 lg:h-[2.917vw]
                  border border-[rgba(255,255,255,0.50)] rounded-lg focus:outline-none backdrop-blur-[5px]"
              />
            </div>

            {/* Label + Dropdown */}
            <div className="flex flex-col md:flex-row md:justify-between lg:justify-center 2xl:justify-between items-start md:items-center gap-2 md:gap-4 lg:gap-0 2xl:gap-4 w-full">
              <label className="footer-small-text-bold text-left w-full md:w-[400px] lg:w-[450px] 2xl:w-[460px]">
                Why are you contacting Clarida? Please choose from the list
              </label>
              <div className="w-full md:w-[300px] lg:w-[450px] xl:w-[420px] 2xl:w-[460px]">
                <CustomSelect />
              </div>
            </div>

            {/* Inquiry Text Area */}
            <textarea
              placeholder="Your inquiry"
              rows="4"
              className="footer-small-text py-3 w-full px-4 md:px-[26px] 
                h-[80px] sm:h-[100px] md:h-[220px] lg:h-[11.458vw] 
                bg-transparent border border-[rgba(255,255,255,0.50)] rounded-lg 
                focus:outline-none backdrop-blur-[5px] resize-none"
            ></textarea>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button type="submit" extra="gap-3 md:gap-4 flex">
                {isMobile ? "Send" : "Send Inquiry"}
                <img
                  src="icons/arrowIcon.svg"
                  alt="Clarida Text"
                  className="rotate-270"
                />
              </Button>
            </div>
          </form>

          {/* Footer Bar */}
          <div
            className="
              w-full flex flex-col md:flex-row 
              items-center md:items-end lg:items-center 2xl:items-end 
              justify-center md:justify-between
              h-auto md:h-40 lg:h-20 2xl:h-40 
              px-4 py-4
              sm:px-6 sm:py-5
              md:px-10 md:py-10 
              bg-transparent border border-[rgba(255,255,255,0.50)] rounded-lg 
              backdrop-blur-[5px] gap-4 md:gap-0"
          >
            {/* Logo — centered on mobile */}
            <div className="flex flex-col items-center order-1 md:order-2">
              <div className="flex items-center gap-2 md:gap-0">
                <img
                  src="images/logoIconFooter.png"
                  alt="Clarida Logo"
                  className="w-8 h-9 sm:w-9 sm:h-10 md:w-[54px] md:h-[54px] lg:w-[2.813vw] lg:h-[3.125vw]"
                />
                <img
                  src="images/logoText.svg"
                  alt="Clarida Text"
                  className="w-[90px] h-4 sm:w-[100px] lg:w-[7.813vw] lg:h-[1.302vw]"
                />
              </div>
              <p className="footer-small-text md:mt-2 lg:mt-0 2xl:mt-2 hidden md:block">
                Clarida &copy; 2025
              </p>
            </div>

            {/* Privacy + Terms */}
            <div className="footer-small-text flex gap-8 sm:gap-10 md:gap-4 order-2 md:order-1 md:w-[300px]">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-5 sm:gap-6 justify-center order-3 md:w-[300px] md:justify-end">
              <a href="https://facebook.com">
                <img src="icons/facebook.svg" alt="Facebook" />
              </a>
              <a href="https://linkedin.com">
                <img src="icons/linkedin.svg" alt="LinkedIn" />
              </a>
              <a href="https://twitter.com">
                <img src="icons/twitter.svg" alt="Twitter" />
              </a>
              <a href="https://instagram.com">
                <img src="icons/instagram.svg" alt="Instagram" />
              </a>
              <a href="https://youtube.com">
                <img src="icons/youtube.svg" alt="Youtube" />
              </a>
            </div>

            {/* Copyright — mobile only */}
            <p className="footer-small-text order-4 block md:hidden">
              Clarida &copy; 2025
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
