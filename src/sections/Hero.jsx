import React from "react";
import Button from "../components/Button";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-end justify-between text-white overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      <div
        className="relative z-10 px-5 md:px-8 lg:px-[7.813vw] md:py-8 lg:py-[3.906vw] 
        flex flex-col md:flex-row items-center justify-between w-full gap-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(13, 31, 45, 0.00) 3.78%, var(--Deep-Marine-Blue, #0D1F2D) 25.95%)",
        }}
      >
        {/* Left Side */}
        <div className="md:w-full flex flex-col gap-6">
          <p className="hero-top-text">The Science That Lets You See</p>
          <h1 className="h1-text">
            Restore Your Vision <br /> Reclaim Your Life
          </h1>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 flex flex-col">
          <h3 className="hero-paragraph-bold md:w-[390px] lg:w-[27.135vw]">
            Clarida’s Zebrafish-Inspired Eye Therapy
          </h3>
          <p className="hero-paragraph-normal lg:w-[27.135vw]">
            Marine Biology Meets Nutritional Science to Regenerate the Macula—
            For Those Living With Vision Loss, Including AMD.
          </p>
          <Button
          width="w-[295px] md:w-[250px] lg:w-[15.365vw]"
          height="h-[56px] md:h-[45px] lg:h-[2.917vw]"
          extra="gap-2 mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] hidden md:flex"
        >
          Join The Vision Revolution
          <img src="/arrowIcon.svg" alt="Clarida Text" className="rotate-270" />
        </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
