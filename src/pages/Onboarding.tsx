import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgressIndicator from "@/components/lexicon/ProgressIndicator";
import Page1ViewerType from "@/components/lexicon/Page1ViewerType";
import Page2Genres from "@/components/lexicon/Page2Genres";
import Page3PickTitles from "@/components/lexicon/Page3PickTitles";
import Page4Dislikes from "@/components/lexicon/Page4Dislikes";
import Page5Mood from "@/components/lexicon/Page5Mood";
import Page6Companion from "@/components/lexicon/Page6Companion";
import Page7Time from "@/components/lexicon/Page7Time";
import Page8Ratings from "@/components/lexicon/Page8Ratings";
import Page9Surprise from "@/components/lexicon/Page9Surprise";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const TOTAL_PAGES = 9;

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const [viewerType, setViewerType] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [titleReactions, setTitleReactions] = useState<Record<string, string>>({});
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [companion, setCompanion] = useState<string | null>(null);
  const [companionContext, setCompanionContext] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [surprise, setSurprise] = useState<string | null>(null);

  const canGoNext = () => {
    switch (currentPage) {
      case 1: return !!viewerType;
      case 2: return genres.length > 0;
      case 3: return Object.keys(titleReactions).length > 0;
      case 4: return true;
      case 5: return !!mood;
      case 6: return !!companion && !!companionContext;
      case 7: return !!time;
      case 8: return Object.keys(ratings).length > 0;
      case 9: return !!surprise;
      default: return true;
    }
  };

  const savePreferences = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      // Save preferences
      const { error: prefError } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        viewer_type: viewerType,
        genres,
        dislikes,
        mood,
        companion,
        time,
        surprise,
        ratings,
        title_reactions: titleReactions,
      }, { onConflict: "user_id" });

      if (prefError) throw prefError;

      // Mark onboarding complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      toast({ title: "Welcome to your diary! 🎬", description: "Your preferences are saved." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (currentPage < TOTAL_PAGES && canGoNext()) {
      setCurrentPage((p) => p + 1);
    } else if (currentPage === TOTAL_PAGES && canGoNext()) {
      savePreferences();
    }
  };

  const goBack = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1: return <Page1ViewerType value={viewerType} onChange={setViewerType} />;
      case 2: return <Page2Genres selected={genres} onChange={setGenres} />;
      case 3: return <Page3PickTitles reactions={titleReactions} onChange={setTitleReactions} />;
      case 4: return <Page4Dislikes selected={dislikes} onChange={setDislikes} />;
      case 5: return <Page5Mood value={mood} onChange={setMood} />;
      case 6: return <Page6Companion value={companion} onChange={setCompanion} />;
      case 7: return <Page7Time value={time} onChange={setTime} />;
      case 8: return <Page8Ratings ratings={ratings} onChange={setRatings} />;
      case 9: return <Page9Surprise value={surprise} onChange={setSurprise} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="fixed top-4 left-4 text-2xl opacity-40 animate-float pointer-events-none">⭐</div>
      <div className="fixed top-12 right-6 text-xl opacity-30 animate-float pointer-events-none" style={{ animationDelay: "1s" }}>💖</div>
      <div className="fixed bottom-20 left-8 text-xl opacity-25 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>🎬</div>
      <div className="fixed bottom-32 right-4 text-2xl opacity-35 animate-float pointer-events-none" style={{ animationDelay: "0.5s" }}>✨</div>

      <div className="mb-6">
        <ProgressIndicator currentStep={currentPage} totalSteps={TOTAL_PAGES} />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} className="w-full">
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center max-w-lg mx-auto w-full mt-6 pb-4">
        <motion.button
          onClick={goBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center gap-1 px-5 py-3 rounded-full font-body font-semibold transition-all ${
            currentPage > 1 ? "bg-muted text-foreground hover:bg-muted/80" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={18} /> Back
        </motion.button>
        <motion.button
          onClick={goNext}
          disabled={saving}
          whileHover={{ scale: canGoNext() ? 1.08 : 1 }}
          whileTap={{ scale: canGoNext() ? 0.95 : 1 }}
          className={`flex items-center gap-1 px-8 py-3 rounded-full font-body font-bold text-lg shadow-soft transition-all ${
            canGoNext()
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          } disabled:opacity-50`}
        >
          {saving ? "Saving..." : currentPage === TOTAL_PAGES ? "Finish! ✨" : "Next"}
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
