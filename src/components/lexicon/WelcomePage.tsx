import { motion } from "framer-motion";
import notebookCover from "@/assets/notebook-cover.png";

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage = ({ onStart }: WelcomePageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center"
    >
      <motion.img
        src={notebookCover}
        alt="My Movie Diary"
        className="mb-8 drop-shadow-xl w-[320px] h-auto sm:w-[400px] md:w-[440px]"
        animate={{ rotate: [0, -2, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <h1 className="text-5xl sm:text-6xl font-handwritten text-foreground mb-3">
        My Movie Diary ✨
      </h1>
      <p className="text-lg text-muted-foreground font-body mb-8 max-w-sm">
        Tell us what you love, and we'll find the perfect watch for you!
      </p>
      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="bg-primary text-primary-foreground rounded-full px-10 py-4 text-xl font-bold font-body shadow-soft"
      >
        Open the notebook 📖
      </motion.button>
      <div className="mt-8 flex gap-3 text-2xl animate-float">
        <span>🎬</span>
        <span>🍿</span>
        <span>⭐</span>
        <span>💖</span>
        <span>🎭</span>
      </div>
    </motion.div>
  );
};

export default WelcomePage;
