import { useEffect, useState } from "react";
import { Loader2, Save, Check } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ALL_GENRES = [
  "Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi",
  "Thriller", "Animation", "Documentary", "Fantasy", "Mystery", "Adventure",
];

const ALL_MOODS = [
  "😊 Feel-good", "😢 Emotional", "😱 Thrilling", "🤔 Mind-bending",
  "😂 Funny", "🌙 Chill", "💪 Motivating", "🎭 Dramatic",
];

const Preferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setGenres(data.genres || []);
        setMood(data.mood);
        setViewerType(data.viewer_type);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleGenre = (g: string) => {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_preferences")
      .update({ genres, mood, viewer_type: viewerType })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Preferences updated! ✨", description: "Your recommendations will reflect these changes." });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-lg font-handwritten text-muted-foreground">Loading preferences... ⚙️</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-24 max-w-lg mx-auto">
      <h2 className="text-3xl font-handwritten text-center mb-1">Update Preferences ⚙️</h2>
      <p className="text-center text-muted-foreground font-body text-sm mb-6">Tweak without redoing the full quiz</p>

      {/* Viewer type */}
      <div className="mb-6">
        <h3 className="text-lg font-handwritten text-foreground mb-3">I watch:</h3>
        <div className="flex flex-wrap gap-2">
          {["Movies only", "TV series only", "Both! 🎬📺"].map((type) => (
            <button
              key={type}
              onClick={() => setViewerType(type)}
              className={`sticker font-body ${viewerType === type ? "sticker-selected bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-foreground"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="mb-6">
        <h3 className="text-lg font-handwritten text-foreground mb-3">Favorite genres:</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`sticker font-body text-sm ${genres.includes(g) ? "sticker-selected bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-foreground"}`}
            >
              {genres.includes(g) && <Check size={14} className="mr-1" />}
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="mb-8">
        <h3 className="text-lg font-handwritten text-foreground mb-3">Current mood:</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`sticker font-body text-sm ${mood === m ? "sticker-selected bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-full bg-primary text-primary-foreground font-body font-bold text-lg shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save size={20} />
        {saving ? "Saving..." : "Save Changes"}
      </motion.button>
    </div>
  );
};

export default Preferences;
