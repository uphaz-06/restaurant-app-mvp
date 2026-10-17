import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const [token, storedUser] = await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userData"),
        ]);
        if (active && token && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          if (parsedUser._id && parsedUser.role) {
            setUser(parsedUser);
          } else {
            throw new Error("Saved user data is incomplete");
          }
        } else if (token || storedUser) {
          await Promise.all([
            AsyncStorage.removeItem("userToken"),
            AsyncStorage.removeItem("userData"),
          ]);
        }
      } catch (error) {
        console.error("Could not restore saved session:", error);
        await Promise.all([
          AsyncStorage.removeItem("userToken"),
          AsyncStorage.removeItem("userData"),
        ]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiClient("/auth/login", "POST", { email, password });
    const { token, user: nextUser } = data as LoginResponse;
    await Promise.all([
      AsyncStorage.setItem("userToken", token),
      AsyncStorage.setItem("userData", JSON.stringify(nextUser)),
    ]);
    setUser(nextUser);
  };

  const register = async (name: string, email: string, password: string) => {
    await apiClient("/auth/register", "POST", { name, email, password });
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem("userToken"),
      AsyncStorage.removeItem("userData"),
    ]);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
