import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  roleLoading: boolean;
  roleSettled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: { full_name: string; phone: string },
  ) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  updateProfile: (updates: {
    full_name?: string;
    phone?: string;
  }) => Promise<{ error: string | null }>;
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
  const lastCheckedUidRef = useRef<string | null>(null);

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
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isCheckingRef = useRef(false);

  const checkAdmin = async (uid: string, email?: string) => {
    if (!mountedRef.current || isCheckingRef.current) return;

    // If we've already checked this specific UID successfully, don't re-check immediately
    if (roleSettled && lastCheckedUidRef.current === uid && !isAdmin && Date.now() % 5000 !== 0) {
      return;
    }

    // Global Throttle Check
    const throttleUntil = (window as any)._supabaseThrottleUntil || 0;
    if (Date.now() < throttleUntil) {
      console.warn("[Auth] Silence active. Skipping role check.");
      return;
    }

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
        const isServerDown =
          error.message.includes("503") ||
          error.message.includes("cache") ||
          error.message.includes("client error");
        console.error("[Auth] Role check error:", error.message);

        if (isServerDown) {
          (window as any)._supabaseThrottleUntil = Date.now() + 30000;
          // IMPORTANT: If server is down, do NOT continue to auto-bootstrap.
          // Just bail and let the fallback handle it.
          throw new Error("Server overloaded");
        }
      }

      let isDbAdmin = !!data;

      // Special handling for christfitz@gmail.com to ensure they get DB rights automatically
      if (email === "christfitz@gmail.com" && !isDbAdmin) {
        console.log("[Auth] Attempting auto-bootstrap for christfitz@gmail.com");
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
        const finalStatus = isDbAdmin || email === "christfitz@gmail.com";
        console.log("[Auth] Admin status:", finalStatus, "(DB:", isDbAdmin, ")");
        setIsAdmin(finalStatus);

        try {
          localStorage.setItem("cf_is_admin", finalStatus.toString());
          localStorage.setItem("cf_role_settled", "true");
        } catch (e) {
          console.error("[Auth] Cache error:", e);
        }
      }
    } catch (err: any) {
      if (err.message !== "Server overloaded") {
        console.error("[Auth] Role check exception:", err);
      }
      if (mountedRef.current) {
        // Fallback for the master admin email even if DB is down
        setIsAdmin(email === "christfitz@gmail.com");
      }
    } finally {
      isCheckingRef.current = false;
      if (mountedRef.current) {
        setRoleLoading(false);
        setRoleSettled(true);
        lastCheckedUidRef.current = uid;
      }
    }
  };

  const loading = authLoading;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (!mountedRef.current) return;

      if (event === "SIGNED_IN") {
        // Only reset roleSettled if it's a NEW user (prevents re-login loops for same user)
        // Skip reset entirely for the master admin to ensure instant login
        if (
          sess?.user?.id &&
          sess.user.id !== lastCheckedUidRef.current &&
          sess.user.email !== "christfitz@gmail.com"
        ) {
          setRoleSettled(false);
        }
      }

      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        checkAdmin(sess.user.id, sess.user.email);
      } else {
        setIsAdmin(false);
        setRoleSettled(true);
        lastCheckedUidRef.current = null;
        localStorage.removeItem("cf_is_admin");
        localStorage.removeItem("cf_role_settled");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (!mountedRef.current) return;
      setSession(sess);
      setUser(sess?.user ?? null);

      if (sess?.user) {
        // Always resolve authLoading immediately once session is known.
        // roleLoading tracks the async role check separately.
        checkAdmin(sess.user.id, sess.user.email);
        setAuthLoading(false);
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (data?.user && data.user.email === "christfitz@gmail.com") {
      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      setRoleSettled(true);
      try {
        localStorage.setItem("cf_is_admin", "true");
        localStorage.setItem("cf_role_settled", "true");
      } catch (e) {}
    }

    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { full_name: string; phone: string },
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        data: metadata,
      },
    });
    if (error) return { error: error.message };
    // If no session returned, email confirmation is required
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  };

  const updateProfile = async (updates: { full_name?: string; phone?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setRoleSettled(true);
    localStorage.removeItem("cf_is_admin");
    localStorage.removeItem("cf_role_settled");
    try {
      await supabase.auth.signOut();
    } catch (e) {}
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

  console.log("[Auth] State:", {
    authLoading,
    roleLoading,
    roleSettled,
    user: user?.email,
    isAdmin,
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        roleLoading,
        roleSettled,
        signIn,
        signUp,
        updateProfile,
        signOut,
        bootstrapAdmin,
        refreshRole,
      }}
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
