// GlobalCommunityImpactFrames.jsx
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisSmoothScroll } from "../components/LenisSmoothScroll.jsx";
import Button from "../components/Button.jsx";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 75;

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const index = String(i + 1).padStart(5, "0");
  return `/frames/GlobalCommunityImpactNew/frame_${index}.webp`;
});

const FIRST_FRAME_SRC = framePaths[0];

const GlobalCommunityImpact = () => {
  useLenisSmoothScroll();

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [isOpen, setIsOpen] = useState(false); // accordion state

  // caches for frames + last frame index
  const preloadedFramesRef = useRef([]); // Image | null[]
  const lastFrameIndexRef = useRef(-1);

  const logicalWidthRef = useRef(0);
  const logicalHeightRef = useRef(0);

  // 🔹 PRELOAD FRAMES INCREMENTALLY (same pattern as other sections)
  useEffect(() => {
    let isCancelled = false;

    preloadedFramesRef.current = new Array(TOTAL_FRAMES).fill(null);

    framePaths.forEach((src, index) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        preloadedFramesRef.current[index] = img;
      };

      img.onerror = () => {
        if (isCancelled) return;
        preloadedFramesRef.current[index] = null;
      };
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // 🔹 DRAW FIRST FRAME ASAP TO AVOID BLANK FLASH
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const img = new Image();
    img.src = FIRST_FRAME_SRC;

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = section.getBoundingClientRect();

      logicalWidthRef.current = rect.width;
      logicalHeightRef.current = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgAspect = imgW / imgH;
      const canvasAspect = rect.width / rect.height;

      let drawW, drawH, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        // image wider → match height, crop sides
        drawH = rect.height;
        drawW = drawH * imgAspect;
        offsetX = (rect.width - drawW) / 2;
        offsetY = 0;
      } else {
        // taller/narrower → match width, crop top/bottom
        drawW = rect.width;
        drawH = drawW / imgAspect;
        offsetX = 0;
        offsetY = (rect.height - drawH) / 2;
      }

      ctx2d.clearRect(0, 0, rect.width, rect.height);
      ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const text = textRef.current;
    if (!section || !canvas || !text) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      logicalWidthRef.current = rect.width;
      logicalHeightRef.current = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // redraw last frame on resize
      const lastIndex =
        lastFrameIndexRef.current >= 0 ? lastFrameIndexRef.current : 0;
      drawFrame(lastIndex);
    };

    const drawFrame = (frameIndex) => {
      const frames = preloadedFramesRef.current;
      const w = logicalWidthRef.current || canvas.clientWidth;
      const h = logicalHeightRef.current || canvas.clientHeight;
      if (!w || !h || !frames || !frames.length) return;

      let img = frames[frameIndex];

      // nearest-loaded fallback if not yet loaded
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
        // image wider → fit height
        drawH = h;
        drawW = drawH * imgAspect;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
      } else {
        // image taller → fit width
        drawW = w;
        drawH = drawW / imgAspect;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
      }

      ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (prefersReducedMotion) {
      // text fully visible, no scrub; first frame already drawn
      gsap.set(text, { opacity: 1, filter: "blur(0px)" });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    let ctx = gsap.context(() => {
      let scrollDistance;
      if (isMobile) {
        scrollDistance = window.innerHeight * 1;
      } else {
        scrollDistance = window.innerHeight * 1.5;
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + scrollDistance,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // ----- FRAME SCRUB (canvas, optimized) -----
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * (TOTAL_FRAMES - 1))
          );

          if (frameIndex !== lastFrameIndexRef.current) {
            lastFrameIndexRef.current = frameIndex;
            drawFrame(frameIndex);
          }

          const FADE_END = 0.65;

          let finalT = 0;
          if (progress <= FADE_END) {
            finalT = progress / FADE_END;
          } else {
            finalT = 1;
          }

          const maxBlur = 14;
          const blur = maxBlur * (1 - finalT);
          const opacity = 0.1 + 0.9 * finalT;

          gsap.set(text, {
            opacity,
            filter: `blur(${blur}px)`,
          });
        },
      });
    }, section);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ctx.revert();
    };
  }, [isMobile]); // ⬅️ still depends on isMobile like before

  return (
    <section ref={sectionRef} className="relative h-screen w-screen">
      {/* FRAME BACKGROUND via CANVAS */}
      <canvas ref={canvasRef} className="h-full w-full block" />

      {/* TEXT + ACCORDION OVERLAY */}
      <div
        ref={textRef}
        className="absolute left-0 md:-left-40 lg:left-30 2xl:left-40 top-0 h-full flex flex-col gap-2 md:gap-8 justify-center items-center text-center w-full lg:w-[46%] z-20"
        style={{
          opacity: 0,
          filter: "blur(14px)",
          transition: "opacity 0.15s linear, filter 0.15s linear",
        }}
      >
        {/* Heading */}
        <h2 className="h2-text w-[400px] md:w-[600px] lg:w-[700px] 2xl:w-[950px]">
          One World. One <span className="h2-text-bold">Vision.</span>
        </h2>

        {/* Paragraph */}
        <p className="section-4-paragraph-text w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px] md:mt-3">
          From New York to Nairobi, Sydney to São Paulo—millions are waiting to
          reclaim their clarity.
        </p>

        {/* Arrow Icon */}
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

        {/* Accordion + Button group */}
        <div className="w-[350px] md:w-[600px] lg:w-[700px] 2xl:w-[950px] flex flex-col items-center">
          {/* Accordion Content */}
          <div
            className="
              w-full overflow-hidden
              transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
            "
            style={{ maxHeight: isOpen ? "320px" : "0px" }}
          >
            <div
              className={`
                transition-opacity duration-300
                text-center
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

          {/* CTA Button */}
          <Button
            width="w-[250px] md:w-[220px] lg:w-[15vw]"
            height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
            extra="gap-2 mt-5 lg:mt-10 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
            onClick={() => setIsOpen((prev) => !prev)}
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
};

export default GlobalCommunityImpact;
