import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page7Props {
  value: string | null;
  onChange: (v: string) => void;
}

const times = [
  { label: "30 minutes", emoji: "⏱️", color: "mint" },
  { label: "1–2 hours", emoji: "🕐", color: "lavender" },
  { label: "Binge mode", emoji: "🍿", color: "coral" },
];

const Page7Time = ({ value, onChange }: Page7Props) => {
  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        How much time do you have? ⏰
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        No judgment here!
      </p>
      <div className="flex flex-col gap-4 items-center">
        {times.map((t) => (
          <StickerButton
            key={t.label}
            label={t.label}
            emoji={t.emoji}
            color={t.color}
            selected={value === t.label}
            onClick={() => onChange(t.label)}
            className="w-full max-w-xs text-lg py-5"
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page7Time;
