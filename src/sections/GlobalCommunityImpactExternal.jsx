import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { useMotionValue, useMotionValueEvent } from "framer-motion";
import Button from "../components/Button.jsx";

const TOTAL_FRAMES = 120;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/GlobalCommunityImpactFull/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMotionValue = (v) =>
  v && typeof v === "object" && typeof v.get === "function";

export default function GlobalCommunityImpactExternal({
  progress = 0,
  active = true,
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  const contentRef = useRef(null);

  // ✅ replay control (works even if active stays true)
  const didIntroRef = useRef(false);
  const lastPRef = useRef(0);

  const [isOpen, setIsOpen] = useState(false);

  const preloadedFramesRef = useRef([]);
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  const fallback = useMotionValue(0);
  const mv = useMemo(
    () => (isMotionValue(progress) ? progress : fallback),
    [progress, fallback]
  );

  useEffect(() => {
    if (!isMotionValue(progress))
      fallback.set(typeof progress === "number" ? progress : 0);
  }, [progress, fallback]);

  // preload frames incrementally
  useEffect(() => {
    let cancelled = false;
    preloadedFramesRef.current = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        if (!cancelled) preloadedFramesRef.current[index] = img;
      };
      img.onerror = () => {
        if (!cancelled) preloadedFramesRef.current[index] = null;
      };
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

    // nearest-loaded fallback
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

  // draw first frame ASAP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const img = new Image();
    img.src = FIRST_FRAME_SRC;

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      logicalWidthRef.current = width;
      logicalHeightRef.current = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // cover
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgAspect = imgW / imgH;
      const canvasAspect = width / height;

      let drawW, drawH, offsetX, offsetY;
      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = drawH * imgAspect;
        offsetX = (width - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = width;
        drawH = drawW / imgAspect;
        offsetX = 0;
        offsetY = (height - drawH) / 2;
      }

      ctx2d.clearRect(0, 0, width, height);
      ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
    };
  }, []);

  // resize to viewport
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

      const idx =
        lastFrameIndexRef.current >= 0 ? lastFrameIndexRef.current : 0;
      drawFrame(idx);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ slower + smoother entrance
  const INTRO_Y = 800; // starts slightly lower
  const INTRO_DURATION = 5; // slower animation

  const runIntro = () => {
    const el = contentRef.current;
    if (!el) return;

    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { y: INTRO_Y, opacity: 0, willChange: "transform, opacity" },
      {
        y: 0,
        opacity: 1,
        duration: INTRO_DURATION,
        delay: 0.4,           // ← adjust this (0.3–0.6 feels premium)
        ease: "expo.out",
        overwrite: true,
        clearProps: "willChange",
      }
    );
  };

  // reset when inactive so it can replay
  useEffect(() => {
    const el = contentRef.current;
    if (!active) {
      didIntroRef.current = false;
      lastPRef.current = 0;
      if (el) gsap.set(el, { y: INTRO_Y, opacity: 0 });
    }
  }, [active]);

  const apply = (pRaw) => {
    if (!active) return;

    const p = clamp01(pRaw);

    // ✅ Replay logic: whenever progress goes back near 0 and starts again
    const prevP = lastPRef.current;
    lastPRef.current = p;

    const el = contentRef.current;
    const THRESH = 0.002;

    // when we're effectively at the start, reset state so next entry replays
    if (p <= THRESH) {
      didIntroRef.current = false;
      if (el) gsap.set(el, { y: INTRO_Y, opacity: 0 });
    }

    // trigger exactly when we begin moving off the start
    if (!didIntroRef.current && prevP <= THRESH && p > THRESH) {
      didIntroRef.current = true;
      runIntro();
    }

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(p * (TOTAL_FRAMES - 1))
    );

    if (frameIndex !== lastFrameIndexRef.current) {
      lastFrameIndexRef.current = frameIndex;
      drawFrame(frameIndex);
    }

    // text blur/opacity reveal (same logic as original)
    const text = textRef.current;
    if (!text) return;

    const FADE_END = 0.65;
    const finalT = p <= FADE_END ? p / FADE_END : 1;

    const maxBlur = 14;
    const blur = maxBlur * (1 - finalT);
    const opacity = 0.1 + 0.9 * finalT;

    gsap.set(text, { opacity, filter: `blur(${blur}px)` });
  };

  useMotionValueEvent(mv, "change", (v) => apply(v));

  return (
    <section ref={sectionRef} className="relative h-screen w-screen">
      <canvas ref={canvasRef} className="h-full w-full block" />

      <div
        ref={contentRef}
        // ref={textRef}
        className="absolute left-0 md:-left-40 lg:left-30 2xl:left-40 top-0 h-full flex flex-col gap-2 md:gap-8 justify-center items-center text-center w-full lg:w-[46%] z-20"
      >
        <h2 className="h2-text w-[400px] md:w-[600px] lg:w-[700px] 2xl:w-[950px]">
          One World. One <span className="h2-text-bold">Vision.</span>
        </h2>

        <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px] md:mt-3">
          From New York to Nairobi, Sydney to São Paulo—millions are waiting to
          reclaim their clarity.
        </p>

        <img
          src="icons/arrowIcon.svg"
          alt="Toggle Clarida details"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            border border-white rounded-full
            w-6 h-6 lg:w-[25px] lg:h-[25px] mt-5 md:mt-0
            p-[5px]
            hover:bg-[rgba(255,255,255,0.25)]
            cursor-pointer transition-transform duration-300
            ${isOpen ? "rotate-180" : ""}
          `}
        />

        <div className="w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px] flex flex-col items-center">
          <div
            className="w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
            style={{ maxHeight: isOpen ? "320px" : "0px" }}
          >
            <div
              className={`
                transition-opacity duration-300 text-center
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px]">
                Clarida is more than a product or protocol. It’s a movement of
                individuals who refuse to accept vision loss as their final
                story. Together, we are building a future where clarity returns,
                independence is restored, and hope is shared across every
                horizon.
              </p>
            </div>
          </div>

          <Button
            extra="gap-2 mt-5 lg:mt-10 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("clarida-jump-footer"));
            }}
          >
            Join The Clarida Network
            <img
              src="icons/arrowIcon.svg"
              alt="Clarida Text"
              className="rotate-270"
            />
          </Button>
        </div>
      </div>
    </section>
  );
}
