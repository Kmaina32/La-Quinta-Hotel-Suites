
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/logo';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isAdmin: false,
  loginAdmin: () => {},
  logoutAdmin: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Regular user auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    
    // Admin auth state from sessionStorage on initial load
    if (typeof window !== 'undefined') {
        const adminAuth = sessionStorage.getItem('la-quita-admin-auth') === 'true';
        setIsAdmin(adminAuth);
    }

    // Listen for storage changes to sync across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'la-quita-admin-auth') {
        setIsAdmin(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loginAdmin = useCallback(() => {
    sessionStorage.setItem('la-quita-admin-auth', 'true');
    setIsAdmin(true);
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem('la-quita-admin-auth');
    setIsAdmin(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
            <p className="text-muted-foreground">Preparing Your Escape...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading, isAdmin, loginAdmin, logoutAdmin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
