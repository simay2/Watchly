import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page1Props {
  value: string | null;
  onChange: (v: string) => void;
}

const options = [
  { label: "Movies only", emoji: "🎬", color: "coral" },
  { label: "TV Series only", emoji: "📺", color: "lavender" },
  { label: "Both!", emoji: "🤩", color: "mint" },
];

const Page1ViewerType = ({ value, onChange }: Page1Props) => {
  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        What kind of viewer are you? 🎥
      </h2>
      <p className="text-center text-muted-foreground mb-8 font-body">Pick one!</p>
      <div className="flex flex-col gap-4 items-center">
        {options.map((opt) => (
          <StickerButton
            key={opt.label}
            label={opt.label}
            emoji={opt.emoji}
            color={opt.color}
            selected={value === opt.label}
            onClick={() => onChange(opt.label)}
            className="w-full max-w-xs text-lg"
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page1ViewerType;
