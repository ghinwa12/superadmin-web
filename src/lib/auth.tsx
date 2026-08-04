import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

type AuthState = {
  session: Session | null;
  loading: boolean;
  isSuperadmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRole = useCallback(async (userId: string | undefined) => {
    if (!userId || !supabaseConfigured) {
      setIsSuperadmin(false);
      return;
    }

    const { data, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (roleError) {
      setError(roleError.message);
      setIsSuperadmin(false);
      return;
    }

    setIsSuperadmin(data?.role === "superadmin");
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      refreshRole(data.session?.user.id).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void refreshRole(next?.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [refreshRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!supabaseConfigured) {
      throw new Error("Supabase is not configured. Add .env from .env.example.");
    }

    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signError) throw signError;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (profile?.role !== "superadmin") {
      await supabase.auth.signOut();
      throw new Error("This account is not a superadmin.");
    }

    setIsSuperadmin(true);
  }, []);

  const signOut = useCallback(async () => {
    if (supabaseConfigured) await supabase.auth.signOut();
    setIsSuperadmin(false);
  }, []);

  const value = useMemo(
    () => ({ session, loading, isSuperadmin, error, signIn, signOut }),
    [session, loading, isSuperadmin, error, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
