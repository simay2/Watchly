import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page9Props {
  value: string | null;
  onChange: (v: string) => void;
}

const surprises = [
  { label: "Popular", emoji: "🔥", color: "coral" },
  { label: "Hidden gems", emoji: "💎", color: "lavender" },
  { label: "New", emoji: "✨", color: "mint" },
  { label: "Perfect for me", emoji: "🎯", color: "sunshine" },
];

const Page9Surprise = ({ value, onChange }: Page9Props) => {
  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        Surprise me! 🎁
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        What kind of recommendations?
      </p>
      <div className="grid grid-cols-2 gap-4">
        {surprises.map((s) => (
          <StickerButton
            key={s.label}
            label={s.label}
            emoji={s.emoji}
            color={s.color}
            selected={value === s.label}
            onClick={() => onChange(s.label)}
            className="text-lg py-6 flex-col [&>span]:mr-0 [&>span]:mb-2 [&>span]:text-3xl"
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page9Surprise;
