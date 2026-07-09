"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase-browser";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    setSession(sessionData.session ?? null);
    setUser(sessionData.session?.user ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        signOut: handleSignOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
