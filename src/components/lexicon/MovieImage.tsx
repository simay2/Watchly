import { useState } from "react";

interface MovieImageProps {
  src?: string | null;
  alt: string;
  emoji?: string;
  fallbackGradient?: string;
  className?: string;
  containerClassName?: string;
}

const defaultGradients = [
  "from-lavender/40 to-secondary/30",
  "from-coral/40 to-peach/30",
  "from-mint/40 to-sky/30",
  "from-sunshine/40 to-coral/30",
  "from-sky/40 to-lavender/30",
  "from-peach/40 to-sunshine/30",
];

const normalizeImageUrl = (url: string): string => {
  if (!url) return "";
  // Already a full URL
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // TMDB path (starts with /)
  if (url.startsWith("/")) return `https://image.tmdb.org/t/p/w500${url}`;
  // Bare filename
  return `https://image.tmdb.org/t/p/w500/${url}`;
};

const MovieImage = ({
  src,
  alt,
  emoji = "🎬",
  fallbackGradient,
  className = "w-full h-full object-cover",
  containerClassName,
}: MovieImageProps) => {
  const [failed, setFailed] = useState(false);
  const gradient = fallbackGradient || defaultGradients[Math.abs(alt.charCodeAt(0)) % defaultGradients.length];

  const normalizedSrc = src ? normalizeImageUrl(src) : "";
  const showImage = normalizedSrc && !failed;

  if (!showImage) {
    return (
      <div className={containerClassName || `w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center px-4 text-center gap-1`}>
        <span className="text-3xl">{emoji}</span>
        <span className="text-sm font-handwritten text-foreground/70 leading-tight line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
      draggable={false}
    />
  );
};

export default MovieImage;
