import { Variants } from 'motion/react';

export const premiumReveal: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

export const groomReveal: Variants = {
  hidden: { opacity: 0, x: -80, rotate: -8, scale: 0.8, filter: "blur(20px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotate: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 1.6, 
      ease: [0.22, 1, 0.36, 1],
      scale: { type: "spring", stiffness: 35, damping: 12 }
    }
  }
};

export const premiumRevealLeft: Variants = {
  hidden: { opacity: 0, x: -50, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

export const premiumRevealRight: Variants = {
  hidden: { opacity: 0, x: 50, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

export const brideReveal: Variants = {
  hidden: { opacity: 0, x: 80, rotate: 8, scale: 0.8, filter: "blur(20px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotate: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 1.6, 
      ease: [0.22, 1, 0.36, 1],
      scale: { type: "spring", stiffness: 35, damping: 12 }
    }
  }
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 30, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};
