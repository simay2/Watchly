import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";
import { ChevronLeft } from "lucide-react";

interface Page6Props {
  value: string | null;
  context: string | null;
  onChange: (companion: string) => void;
  onContextChange: (context: string) => void;
}

const companions = [
  { label: "Alone", emoji: "🧘", color: "sky" },
  { label: "Partner", emoji: "💑", color: "coral" },
  { label: "Family", emoji: "👨‍👩‍👧‍👦", color: "mint" },
  { label: "Friends", emoji: "🎉", color: "sunshine" },
];

const subOptions: Record<string, { label: string; emoji: string; color: string }[]> = {
  Alone: [
    { label: "Comfort watch", emoji: "🧸", color: "peach" },
    { label: "Mind-bending", emoji: "🌀", color: "lavender" },
    { label: "Emotional night", emoji: "🥺", color: "coral" },
    { label: "Something intense", emoji: "🔥", color: "coral" },
    { label: "Easy background watch", emoji: "☕", color: "mint" },
  ],
  Partner: [
    { label: "Romantic", emoji: "💕", color: "coral" },
    { label: "Cute and cozy", emoji: "🥰", color: "peach" },
    { label: "Deep emotional", emoji: "💫", color: "lavender" },
    { label: "Fun date night", emoji: "🍿", color: "sunshine" },
    { label: "Intense chemistry", emoji: "🔥", color: "coral" },
    { label: "Not too cheesy", emoji: "😎", color: "sky" },
  ],
  Friends: [
    { label: "Funny night", emoji: "😂", color: "sunshine" },
    { label: "Horror night", emoji: "👻", color: "lavender" },
    { label: "Party vibe", emoji: "🎊", color: "coral" },
    { label: "Plot twist movie", emoji: "🤯", color: "sky" },
    { label: "Trashy but fun", emoji: "🍕", color: "peach" },
    { label: "Crowd-pleaser", emoji: "🙌", color: "mint" },
  ],
  Family: [
    { label: "Family friendly", emoji: "🏠", color: "mint" },
    { label: "Cozy and wholesome", emoji: "🤗", color: "peach" },
    { label: "Animation", emoji: "🎨", color: "sunshine" },
    { label: "Light comedy", emoji: "😄", color: "sky" },
    { label: "Adventure for all", emoji: "🗺️", color: "coral" },
    { label: "No awkward scenes", emoji: "🙈", color: "lavender" },
  ],
};

const Page6Companion = ({ value, context, onChange, onContextChange }: Page6Props) => {
  const [showSub, setShowSub] = useState(!!value && !!context);

  const handleCompanionSelect = (label: string) => {
    onChange(label);
    onContextChange(""); // reset context when changing companion
    setShowSub(true);
  };

  const handleBack = () => {
    setShowSub(false);
    onContextChange("");
  };

  const subs = value ? subOptions[value] || [] : [];

  return (
    <PageWrapper>
      <AnimatePresence mode="wait">
        {!showSub ? (
          <motion.div
            key="companions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
              Who are you watching with? 🛋️
            </h2>
            <p className="text-center text-muted-foreground mb-6 font-body">
              Pick your crew!
            </p>
            <div className="grid grid-cols-2 gap-4">
              {companions.map((c) => (
                <StickerButton
                  key={c.label}
                  label={c.label}
                  emoji={c.emoji}
                  color={c.color}
                  selected={value === c.label}
                  onClick={() => handleCompanionSelect(c.label)}
                  className="text-lg py-6 flex-col [&>span]:mr-0 [&>span]:mb-2 [&>span]:text-3xl"
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sub-options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 font-body transition-colors"
            >
              <ChevronLeft size={14} />
              Back to companions
            </button>
            <h2 className="text-2xl sm:text-3xl font-handwritten text-center mb-1">
              Watching {value === "Alone" ? "alone" : `with ${value?.toLowerCase()}`}… {companions.find(c => c.label === value)?.emoji}
            </h2>
            <p className="text-center text-muted-foreground mb-5 font-body text-sm">
              What's the vibe tonight?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {subs.map((s) => (
                <StickerButton
                  key={s.label}
                  label={s.label}
                  emoji={s.emoji}
                  color={s.color}
                  selected={context === s.label}
                  onClick={() => onContextChange(s.label)}
                  className="text-sm py-4 flex-col [&>span]:mr-0 [&>span]:mb-1 [&>span]:text-2xl"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Page6Companion;
