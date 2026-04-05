import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import AppNav from "@/components/AppNav";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Favorites from "./pages/Favorites";
import SwipeHistory from "./pages/SwipeHistory";
import Preferences from "./pages/Preferences";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-body">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-body">Loading...</div>;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <AppNav />
    <div className="pt-14 pb-16">{children}</div>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SessionProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><AuthenticatedLayout><Index /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><AuthenticatedLayout><Favorites /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><AuthenticatedLayout><SwipeHistory /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><AuthenticatedLayout><Preferences /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
