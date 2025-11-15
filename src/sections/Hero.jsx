import React from "react";
import Button from "../components/Button";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 }); // same as Tailwind's 'md' breakpoint

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3, // delay between each child
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  return (
    <section className="relative h-screen flex items-end justify-between text-white overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-bg.mp4"
        poster="hero-bg.png"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      <motion.div
        className="relative z-10 px-5 md:px-8 lg:px-[7.813vw] py-12 md:py-8 lg:py-[3.906vw] 
        flex flex-col md:flex-row items-center justify-center md:justify-between w-full gap-2 md:gap-10 text-center md:text-left"
        style={{
          background: `linear-gradient(180deg, rgba(13,31,45,0) 3.78%, var(--color-bg) ${
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

        {/* Right Side */}
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
            transition={{ duration: 1, delay: 1.2 }} // delay in seconds
          >
            <Button
              width="w-[263px] md:w-[250px] lg:w-[15.365vw]"
              height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
              extra="gap-2 mt-5 lg:mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
            >
              Join The Vision Revolution
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
