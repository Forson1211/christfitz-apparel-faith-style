import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  roleSettled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata: { full_name: string; phone: string }) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  updateProfile: (updates: { full_name?: string; phone?: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  bootstrapAdmin: () => Promise<boolean>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem("cf_is_admin") === "true";
    } catch {
      return false;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const mountedRef = useRef(true);

  // roleSettled is true once we've finished checking for the admin role
  const [roleSettled, setRoleSettled] = useState(() => {
    try {
      return localStorage.getItem("cf_role_settled") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const checkAdmin = async (uid: string, email?: string) => {
    if (!mountedRef.current) return;
    console.log("[Auth] Checking admin role for:", uid, email);
    
    setRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      
      if (error) {
        console.error("[Auth] Role check error:", error);
      }
      
      let isDbAdmin = !!data;

      // Special handling for admin@gmail.com to ensure they get DB rights automatically
      if (email === "admin@gmail.com" && !isDbAdmin) {
        console.log("[Auth] Attempting auto-bootstrap for admin@gmail.com");
        try {
          const { data: bData } = await supabase.rpc("bootstrap_first_admin");
          if (bData === true) {
            console.log("[Auth] Auto-bootstrap successful");
            isDbAdmin = true;
          }
        } catch (bErr) {
          console.error("[Auth] Auto-bootstrap failed:", bErr);
        }
      }

      if (mountedRef.current) {
        const finalStatus = isDbAdmin || email === "admin@gmail.com";
        console.log("[Auth] Admin status:", finalStatus, "(DB:", isDbAdmin, ")");
        setIsAdmin(finalStatus);
        
        try {
          localStorage.setItem("cf_is_admin", finalStatus.toString());
          localStorage.setItem("cf_role_settled", "true");
        } catch (e) {
          console.error("[Auth] Cache error:", e);
        }
      }
    } catch (err) {
      console.error("[Auth] Role check exception:", err);
      if (mountedRef.current) {
        setIsAdmin(email === "admin@gmail.com");
      }
    } finally {
      if (mountedRef.current) {
        setRoleLoading(false);
        setRoleSettled(true);
      }
    }
  };

  const loading = authLoading;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mountedRef.current) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        checkAdmin(sess.user.id, sess.user.email);
      } else {
        setIsAdmin(false);
        setRoleSettled(true);
        localStorage.removeItem("cf_is_admin");
        localStorage.removeItem("cf_role_settled");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (!mountedRef.current) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      
      if (sess?.user) {
        // Start role check in background
        checkAdmin(sess.user.id, sess.user.email);
        
        // If we already have a cached role, we can stop loading immediately
        // Otherwise we wait for the first check to settle
        if (roleSettled) {
          setAuthLoading(false);
        } else {
          // Fallback to settle loading once check finishes
          // (This only happens on very first login or if cache cleared)
          checkAdmin(sess.user.id, sess.user.email).finally(() => {
            if (mountedRef.current) setAuthLoading(false);
          });
        }
      } else {
        setAuthLoading(false);
        setRoleSettled(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    let email = identifier;
    
    // If identifier doesn't look like an email, try looking it up by name in profiles
    if (!identifier.includes("@")) {
      const { data, error: lookupError } = await (supabase as any)
        .from("profiles")
        .select("email")
        .eq("full_name", identifier)
        .maybeSingle();
        
      if (data?.email) {
        email = data.email;
      } else if (lookupError) {
        console.error("Name lookup failed:", lookupError);
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, metadata: { full_name: string; phone: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        data: metadata
      },
    });
    if (error) return { error: error.message };
    // If no session returned, email confirmation is required
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  };

  const updateProfile = async (updates: { full_name?: string; phone?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const bootstrapAdmin = async () => {
    const { data, error } = await supabase.rpc("bootstrap_first_admin");
    if (error) return false;
    if (data === true && user) {
      await checkAdmin(user.id, user.email);
      return true;
    }
    return false;
  };

  const refreshRole = async () => {
    if (user) await checkAdmin(user.id, user.email);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, loading, roleSettled, signIn, signUp, updateProfile, signOut, bootstrapAdmin, refreshRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
