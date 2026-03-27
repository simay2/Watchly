import PageWrapper from "./PageWrapper";
import StarRating from "./StarRating";

interface Page8Props {
  ratings: Record<string, number>;
  onChange: (ratings: Record<string, number>) => void;
}

const items = [
  { name: "The Dark Knight", emoji: "🦇" },
  { name: "Titanic", emoji: "🚢" },
  { name: "Toy Story", emoji: "🤠" },
  { name: "The Matrix", emoji: "💊" },
  { name: "Forrest Gump", emoji: "🏃" },
];

const Page8Ratings = ({ ratings, onChange }: Page8Props) => {
  const setRating = (name: string, rating: number) => {
    onChange({ ...ratings, [name]: rating });
  };

  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        Rate these ⭐
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        How much did you enjoy them?
      </p>
      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 bg-muted/50 rounded-2xl p-4 border border-border">
            <span className="text-2xl">{item.emoji}</span>
            <span className="flex-1 font-semibold font-body text-foreground text-sm">{item.name}</span>
            <StarRating
              rating={ratings[item.name] || 0}
              onRate={(r) => setRating(item.name, r)}
              size={24}
            />
          </div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page8Ratings;
