import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SessionState {
  sessionCompanion: string | null;
  sessionMood: string | null;
  completed: boolean;
}

interface SessionContextType extends SessionState {
  setSessionCompanion: (v: string) => void;
  setSessionMood: (v: string) => void;
  completeSession: () => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SessionState>({
    sessionCompanion: null,
    sessionMood: null,
    completed: false,
  });

  const setSessionCompanion = useCallback((v: string) => {
    setState((s) => ({ ...s, sessionCompanion: v }));
  }, []);

  const setSessionMood = useCallback((v: string) => {
    setState((s) => ({ ...s, sessionMood: v }));
  }, []);

  const completeSession = useCallback(() => {
    setState((s) => ({ ...s, completed: true }));
  }, []);

  const resetSession = useCallback(() => {
    setState({ sessionCompanion: null, sessionMood: null, completed: false });
  }, []);

  return (
    <SessionContext.Provider value={{ ...state, setSessionCompanion, setSessionMood, completeSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};
