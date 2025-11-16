import React from "react";
import { motion } from "framer-motion";

export const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3, // delay between children
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const EntranceAnimation = ({ children, className = "", style = {} }) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // animate when 30% in view, only once
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
};

export default EntranceAnimation;
