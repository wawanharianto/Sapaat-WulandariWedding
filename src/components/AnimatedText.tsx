import React from 'react';
import { motion, Variants } from 'motion/react';

const textContainer: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
  }),
};

const textChild: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120,
    },
  },
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    filter: "blur(8px)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120,
    },
  },
};

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const AnimatedText = ({ text, className, delay = 0 }: AnimatedTextProps) => {
  const words = text.split(" ");
  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={textContainer}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          variants={textChild}
          style={{ marginRight: "0.25em" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default React.memo(AnimatedText);
