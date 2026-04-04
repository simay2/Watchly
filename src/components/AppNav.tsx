import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { LogOut, Film, Heart, Clock, User, Settings } from "lucide-react";

const links = [
  { to: "/", icon: Film, label: "Discover" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/preferences", icon: Settings, label: "Prefs" },
];

const AppNav = () => {
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* Top bar with username + logout */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-sm border-b border-border">
        <span className="font-handwritten text-lg text-foreground">My Movie Diary ✨</span>
        <div className="flex items-center gap-2">
          {profile && (
            <div className="flex items-center gap-1.5 text-sm font-body font-semibold text-foreground">
              <User size={14} className="text-primary" />
              {profile.username}
            </div>
          )}
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-card/95 backdrop-blur-sm border-t border-border px-2 py-2 safe-area-bottom">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors font-body text-xs ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default AppNav;
