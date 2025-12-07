'use client';

import { motion, Transition, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// ============================================
// ANIMATIE CONFIGURATIE
// ============================================
const transitionConfig: Transition = {
  type: 'tween',
  duration: 0.25,
  ease: 'easeOut',
};

// Fade only - voorkomt blauwe flicker bij page transitions
const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeVariants}
      transition={transitionConfig}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
