"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id?: string;
  name: string;
  email?: string;
}

interface SessionContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (user: User) => void;
  signOut: () => void | Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchSession(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const u = await fetchSession();
    setUser(u);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSession().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((u: User) => {
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: () => {},
      signOut: async () => {},
      refreshSession: async () => {},
    };
  }
  return context;
}
