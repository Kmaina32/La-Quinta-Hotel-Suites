
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/logo';
import type { UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean; 
  role: UserRole | null;
  loginAdmin: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  role: null,
  loginAdmin: () => { },
  logoutAdmin: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true); // Force refresh
          const userRole = idTokenResult.claims.role as UserRole | undefined;

          if (userRole && ['owner', 'admin', 'manager'].includes(userRole)) {
            setRole(userRole);
            setIsAdmin(true);
            sessionStorage.setItem('la-quita-admin-auth', 'true');
          } else {
            // Check for password-based auth
            const sessionAuth = sessionStorage.getItem('la-quita-admin-auth') === 'true';
            if (sessionAuth) {
                setRole('owner');
                setIsAdmin(true);
            } else {
                setRole(null);
                setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error("Error fetching user claims:", error);
           const sessionAuth = sessionStorage.getItem('la-quita-admin-auth') === 'true';
            if (sessionAuth) {
                setRole('owner');
                setIsAdmin(true);
            } else {
                setRole(null);
                setIsAdmin(false);
            }
        }
      } else {
        // No Firebase user, check for session-based admin login
        const sessionAuth = sessionStorage.getItem('la-quita-admin-auth') === 'true';
        if (sessionAuth) {
            setRole('owner');
            setIsAdmin(true);
        } else {
            setRole(null);
            setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'la-quita-admin-auth') {
        const isAuth = event.newValue === 'true';
        setIsAdmin(isAuth);
        // Only set role if there's no Firebase user with a role
        if (!auth.currentUser) {
            setRole(isAuth ? 'owner' : null);
        }
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
    setRole('owner');
    // Force a token refresh on next page load or action if a user exists
    if(auth.currentUser) auth.currentUser.getIdToken(true);
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem('la-quita-admin-auth');
    setIsAdmin(false);
    setRole(null);
    if(auth.currentUser) signOut(auth); // Also sign out from Firebase
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

  return <AuthContext.Provider value={{ user, loading, isAdmin, role, loginAdmin, logoutAdmin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
