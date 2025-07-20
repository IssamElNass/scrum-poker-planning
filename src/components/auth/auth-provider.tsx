"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  id: Id<"users">;
  name: string;
  roomId: Id<"rooms">;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("poker-user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Save user to localStorage
    if (user) {
      localStorage.setItem("poker-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("poker-user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};