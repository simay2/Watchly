import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  enter: {
    rotateY: 90,
    opacity: 0,
    scale: 0.95,
  },
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    scale: 0.95,
  },
};

const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`w-full max-w-lg mx-auto ${className}`}
      style={{ perspective: 1200 }}
    >
      <div className="bg-card rounded-3xl shadow-soft p-6 sm:p-8 notebook-page relative overflow-hidden">
        {/* Notebook margin line */}
        <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-coral/20" />
        {/* Page curl */}
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-muted to-transparent rounded-tl-xl" />
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
};

export default PageWrapper;
