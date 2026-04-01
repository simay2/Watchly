import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

const UserMenu = () => {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-card">
        <User size={16} className="text-primary" />
        <span className="font-body font-semibold text-sm text-foreground">
          {profile.username}
        </span>
      </div>
      <motion.button
        onClick={signOut}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-card/90 backdrop-blur-sm border border-border rounded-full p-2 shadow-card text-muted-foreground hover:text-destructive transition-colors"
        title="Sign out"
      >
        <LogOut size={16} />
      </motion.button>
    </div>
  );
};

export default UserMenu;
