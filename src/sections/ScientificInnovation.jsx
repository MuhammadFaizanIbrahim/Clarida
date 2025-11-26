import React from "react";
import Button from "../components/Button";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import EntranceAnimation, {
  itemVariants,
  containerVariants,
} from "../components/EntranceAnimation";

const ScientificInnovation = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 }); // same as Tailwind's 'md' breakpoint

  return (
    <section className="relative h-screen flex items-end justify-between text-white overflow-hidden">
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

      <div className="absolute inset-0 bg-black/15 pointer-events-none z-10" />

      <EntranceAnimation
        className="relative z-10 px-5 md:px-8 lg:px-20 py-12 md:py-8 lg:py-[3.906vw] 
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
            className="hero-paragraph-normal w-[350px] md:w-[390px] lg:w-[780px] text-center md:text-left"
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
              width="w-[235px] md:w-[220px] lg:w-[14.365vw]"
              height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
              extra="gap-2 mt-5 lg:mt-6 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
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
