import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiGet, apiSend } from "./lib/api";

export interface Customer {
  userId?: number;
  id?: number;
  email: string;
  name?: string | null;
  phone?: string | null;
}

interface AuthCtx {
  user: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await apiGet<Customer>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiSend<Customer>("/api/auth/login", "POST", { email, password });
    setUser(u);
  }, []);

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      const u = await apiSend<Customer>("/api/auth/register", "POST", { name, email, phone, password });
      setUser(u);
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiSend("/api/auth/logout", "POST");
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
