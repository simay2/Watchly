import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page4Props {
  selected: string[];
  onChange: (v: string[]) => void;
}

const dislikes = [
  { label: "Slow movies", emoji: "🐌", color: "peach" },
  { label: "Sad endings", emoji: "😢", color: "sky" },
  { label: "Violence", emoji: "💥", color: "coral" },
  { label: "Confusing plots", emoji: "🤯", color: "lavender" },
  { label: "Horror", emoji: "😱", color: "blush" },
  { label: "Romance", emoji: "🙈", color: "sunshine" },
];

const Page4Dislikes = ({ selected, onChange }: Page4Props) => {
  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        No thanks 😅
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        What do you want to avoid?
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {dislikes.map((d) => (
          <StickerButton
            key={d.label}
            label={d.label}
            emoji={d.emoji}
            color={d.color}
            selected={selected.includes(d.label)}
            onClick={() => toggle(d.label)}
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page4Dislikes;
