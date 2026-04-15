import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@shared/schema";
import { queryClient } from "./queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; fullName: string; email: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { 
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 401) {
        // Utilisateur non authentifié - c'est normal pour les visiteurs
        setUser(null);
      } else {
        // Autres erreurs (réseau, serveur, etc.)
        console.error("Échec de la récupération de l'utilisateur:", await res.text());
        setUser(null);
      }
    } catch (error) {
      // Erreur réseau ou autre exception
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      if (!res.ok) {
        let errorMessage = "Échec de la connexion";
        try {
          const err = await res.text();
          errorMessage = err || errorMessage;
        } catch {
          // Ignorer l'erreur de parsing
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setUser(data);
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { username: string; password: string; fullName: string; email: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        let errorMessage = "Échec de l'inscription";
        try {
          const err = await res.text();
          errorMessage = err || errorMessage;
        } catch {
          // Ignorer l'erreur de parsing
        }
        throw new Error(errorMessage);
      }
      
      const userData = await res.json();
      setUser(userData);
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setUser(null);
      queryClient.clear();
      setIsLoading(false);
    }
  };

  const refetchUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}