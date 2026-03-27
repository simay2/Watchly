import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickerButtonProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  color?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  coral: "bg-coral/20 border-coral hover:bg-coral/30",
  lavender: "bg-lavender/20 border-lavender hover:bg-lavender/30",
  mint: "bg-mint/20 border-mint hover:bg-mint/30",
  peach: "bg-peach/20 border-peach hover:bg-peach/30",
  sky: "bg-sky/20 border-sky hover:bg-sky/30",
  sunshine: "bg-sunshine/20 border-sunshine hover:bg-sunshine/30",
  blush: "bg-blush/20 border-blush hover:bg-blush/30",
  default: "bg-card border-border hover:bg-muted",
};

const selectedColorMap: Record<string, string> = {
  coral: "bg-coral/40 border-coral ring-2 ring-coral/50",
  lavender: "bg-lavender/40 border-lavender ring-2 ring-lavender/50",
  mint: "bg-mint/40 border-mint ring-2 ring-mint/50",
  peach: "bg-peach/40 border-peach ring-2 ring-peach/50",
  sky: "bg-sky/40 border-sky ring-2 ring-sky/50",
  sunshine: "bg-sunshine/40 border-sunshine ring-2 ring-sunshine/50",
  blush: "bg-blush/40 border-blush ring-2 ring-blush/50",
  default: "bg-primary/15 border-primary ring-2 ring-primary/30",
};

const StickerButton = ({ label, emoji, selected, onClick, color = "default", className }: StickerButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.05, rotate: Math.random() > 0.5 ? 2 : -2 }}
      className={cn(
        "sticker border-2 rounded-2xl px-5 py-3 font-body font-semibold text-foreground transition-all duration-200 ring-offset-background",
        selected ? selectedColorMap[color] : colorMap[color],
        selected && "shadow-soft",
        className
      )}
    >
      {emoji && <span className="mr-2 text-lg">{emoji}</span>}
      {label}
    </motion.button>
  );
};

export default StickerButton;
