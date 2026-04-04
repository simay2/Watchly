import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Recommendations from "./Recommendations";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Recommendations />;
};

export default Index;
