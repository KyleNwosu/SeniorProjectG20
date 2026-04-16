import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const AUTH_USERS_KEY = "robocontrol_auth_users";
const AUTH_SESSION_KEY = "robocontrol_auth_session";

type StoredUser = {
  fullName: string;
  email: string;
  password: string;
};

type SessionUser = {
  fullName: string;
  email: string;
};

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  signUp: (input: SignUpInput) => { ok: boolean; error?: string };
  signIn: (input: SignInInput) => { ok: boolean; error?: string };
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const readUsers = (): StoredUser[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(AUTH_USERS_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  }
};

const readSession = (): SessionUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(AUTH_SESSION_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as SessionUser;
  } catch {
    return null;
  }
};

const saveSession = (user: SessionUser | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(readSession());
  }, []);

  const signUp = useCallback((input: SignUpInput) => {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!fullName || !email || !password) {
      return { ok: false, error: "All fields are required." };
    }

    const users = readUsers();
    const existingUser = users.find((entry) => entry.email === email);
    if (existingUser) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const nextUsers: StoredUser[] = [...users, { fullName, email, password }];
    saveUsers(nextUsers);

    const sessionUser: SessionUser = { fullName, email };
    setUser(sessionUser);
    saveSession(sessionUser);

    return { ok: true };
  }, []);

  const signIn = useCallback((input: SignInInput) => {
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!email || !password) {
      return { ok: false, error: "Email and password are required." };
    }

    const users = readUsers();
    const foundUser = users.find((entry) => entry.email === email && entry.password === password);
    if (!foundUser) {
      return { ok: false, error: "Invalid email or password." };
    }

    const sessionUser: SessionUser = { fullName: foundUser.fullName, email: foundUser.email };
    setUser(sessionUser);
    saveSession(sessionUser);

    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signUp,
      signIn,
      signOut,
    }),
    [user, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};
