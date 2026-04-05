import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";

const companions = [
  { label: "Alone", emoji: "🧘" },
  { label: "Partner", emoji: "💕" },
  { label: "Friends", emoji: "🎉" },
  { label: "Family", emoji: "🏠" },
];

const moods = [
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Romantic", emoji: "💘" },
  { label: "Stressed", emoji: "😤" },
  { label: "Bored", emoji: "😴" },
  { label: "Excited", emoji: "🤩" },
  { label: "Want something light", emoji: "🌤️" },
  { label: "Want something intense", emoji: "🔥" },
];

const SessionFlow = () => {
  const [step, setStep] = useState(1);
  const { setSessionCompanion, setSessionMood, completeSession } = useSession();
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCompanionSelect = (label: string) => {
    setSelectedCompanion(label);
    setSessionCompanion(label);
    setTimeout(() => setStep(2), 300);
  };

  const handleMoodSelect = (label: string) => {
    setSessionMood(label);
    completeSession();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Decorative elements */}
      <div className="fixed top-6 left-6 text-2xl opacity-30 animate-float pointer-events-none">🎬</div>
      <div className="fixed top-10 right-8 text-xl opacity-25 animate-float pointer-events-none" style={{ animationDelay: "1s" }}>✨</div>
      <div className="fixed bottom-24 left-10 text-xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>📖</div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= step ? "w-10 bg-primary" : "w-6 bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md text-center"
          >
            <h2 className="text-3xl font-handwritten text-foreground mb-2">
              Who's watching tonight? 🍿
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-8">
              Quick vibe check before we start
            </p>
            <div className="grid grid-cols-2 gap-3">
              {companions.map((c) => (
                <motion.button
                  key={c.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCompanionSelect(c.label)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all font-body ${
                    selectedCompanion === c.label
                      ? "border-primary bg-primary/10 shadow-soft"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="font-semibold text-foreground">{c.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md text-center"
          >
            <h2 className="text-3xl font-handwritten text-foreground mb-2">
              How are you feeling? ✨
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-8">
              We'll match your mood perfectly
            </p>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((m) => (
                <motion.button
                  key={m.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(m.label)}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all font-body text-left"
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="font-semibold text-foreground text-sm">{m.label}</span>
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(1)}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
            >
              ← Back
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionFlow;
