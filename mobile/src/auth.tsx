/**
 * Auth context for the UI layer. Tracks login AND activation state. The backend
 * (/accounts/driver/me/) is the source of truth for activation — we re-check it
 * on launch and after login, never trusting local flags for authorization.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  activate as apiActivate,
  fetchDriverContext,
  DriverContext,
} from "./api";
import { clearTokens, getAccessToken, getUser, StoredUser } from "./storage";
import { reconcileTracking, stopTracking } from "./location/tracker";
import { setOnDuty } from "./storage";

type AuthState = {
  user: StoredUser | null;
  ctx: DriverContext | null;
  activated: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  activate: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [ctx, setCtx] = useState<DriverContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on launch, then re-verify activation with the backend.
  useEffect(() => {
    (async () => {
      try {
        // Crash-loop recovery: never let a stale/invalid background task from a
        // previous (broken) install keep running before we know it's valid.
        // Never throws — startup must not be able to crash.
        await reconcileTracking();

        const token = await getAccessToken();
        if (!token) return;
        const stored = await getUser();
        setUser(stored);
        try {
          setCtx(await fetchDriverContext());
        } catch {
          // token invalid/expired and refresh failed -> treat as logged out
          await clearTokens();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ctx,
      activated: !!ctx?.activated,
      loading,
      signIn: async (username, password) => {
        const u = await apiLogin(username, password);
        setUser(u);
        setCtx(await fetchDriverContext());
      },
      register: async (username, email, password) => {
        const res = await apiRegister(username, email, password);
        setUser(res.user);
        setCtx({ activated: res.activated, driver: res.driver, company: res.company });
      },
      activate: async (code) => {
        const next = await apiActivate(code);
        setCtx(next);
      },
      signOut: async () => {
        await stopTracking();
        await setOnDuty(false);
        await clearTokens();
        setUser(null);
        setCtx(null);
      },
    }),
    [user, ctx, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
