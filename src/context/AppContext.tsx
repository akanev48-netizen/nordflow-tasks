import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import * as api from '../api';

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  refresh: () => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.initializeData();
    const uid = api.getCurrentUserId();
    if (uid) {
      const u = api.getUser(uid);
      if (u) { setUser(u); setThemeState(u.theme); }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = useCallback((email: string, password: string): string | null => {
    const u = api.login(email, password);
    if (!u) return 'Неверный email или пароль';
    setUser(u);
    setThemeState(u.theme);
    return null;
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(() => {
    if (user) {
      const u = api.getUser(user.id);
      if (u) { setUser(u); setThemeState(u.theme); }
    }
  }, [user]);

  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
    if (user) api.updateUser(user.id, { theme: t });
  }, [user]);

  return (
    <AppContext.Provider value={{ user, loading, login, logout, refresh, theme, setTheme, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
