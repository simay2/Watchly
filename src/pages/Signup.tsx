import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TURNSTILE_SITE_KEY = "0x4AAAAAAC0EthQ5ukk6osjV";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (turnstileRef.current && (window as any).turnstile) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(null),
          theme: "light",
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;
    if (!captchaToken) {
      toast({ title: "Verification required", description: "Please verify you are human.", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, username: username.trim() });

      if (profileError) {
        setLoading(false);
        toast({
          title: "Profile creation failed",
          description: profileError.message.includes("unique")
            ? "That username is already taken. Please choose another."
            : profileError.message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(false);
    toast({ title: "Welcome! 🎬", description: "Your movie diary is ready." });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-handwritten text-foreground">Start Your Diary 📖</h1>
          <p className="text-muted-foreground font-body mt-2">Create your movie diary account</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-sm font-body font-semibold text-foreground mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="moviebuff42"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-semibold text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-semibold text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <div ref={turnstileRef} className="flex justify-center" />
              {!captchaToken && (
                <p className="text-xs text-muted-foreground text-center mt-2">Please verify you are human</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-body font-bold text-lg shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={20} />
              {loading ? "Creating diary..." : "Create My Diary"}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-6 font-body text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In 🔑
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
