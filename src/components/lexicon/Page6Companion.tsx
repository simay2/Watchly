import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page6Props {
  value: string | null;
  onChange: (v: string) => void;
}

const companions = [
  { label: "Alone", emoji: "🧘", color: "sky" },
  { label: "Partner", emoji: "💑", color: "coral" },
  { label: "Family", emoji: "👨‍👩‍👧‍👦", color: "mint" },
  { label: "Friends", emoji: "🎉", color: "sunshine" },
];

const Page6Companion = ({ value, onChange }: Page6Props) => {
  return (
    <PageWrapper>
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
            onClick={() => onChange(c.label)}
            className="text-lg py-6 flex-col [&>span]:mr-0 [&>span]:mb-2 [&>span]:text-3xl"
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page6Companion;
