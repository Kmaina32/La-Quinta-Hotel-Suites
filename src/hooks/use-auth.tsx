
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/logo';
import type { UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean; // Kept for general "is logged in as admin-level" checks
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

// This function runs only on the client and avoids flicker.
const getInitialAdminAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('la-quita-admin-auth') === 'true';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(getInitialAdminAuth);
  // Default role to 'owner' if we are already logged in as admin via password
  const [role, setRole] = useState<UserRole | null>(getInitialAdminAuth() ? 'owner' : null);

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
            // If we have a Firebase user but no role, check if we are locally authorized
            if (!getInitialAdminAuth()) {
              setRole(null);
              setIsAdmin(false);
              sessionStorage.removeItem('la-quita-admin-auth');
            }
          }
        } catch (error) {
          console.error("Error fetching user claims:", error);
          if (!getInitialAdminAuth()) {
            setRole(null);
            setIsAdmin(false);
          }
        }
      } else {
        // If firebase user logs out, we should only clear admin if it was tied to firebase
        // But here we rely on onAuthStateChanged for everything usually. 
        // For the password bypass, we might want to keep it? 
        // The current logic clears it. We'll stick to that to be safe, 
        // BUT if we are "loading" we might want to preserve local auth.
        // Actually, let's keep the existing logic: if firebase says no user, 
        // and we aren't explicitly in "local override" mode that survives firebase...
        // The original code cleared it. Let's keep it cleared EXCEPT if we want password to persist.
        // But wait, getInitialAdminAuth only checks sessionStorage. 

        // If we allow password auth to coexist with 'no firebase user', we should respect sessionStorage
        if (getInitialAdminAuth()) {
          setRole('owner');
          setIsAdmin(true);
        } else {
          setRole(null);
          setIsAdmin(false);
          sessionStorage.removeItem('la-quita-admin-auth');
        }
      }
      setLoading(false);
    });

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'la-quita-admin-auth') {
        const isAuth = event.newValue === 'true';
        setIsAdmin(isAuth);
        setRole(isAuth ? 'owner' : null);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loginAdmin = useCallback(() => {
    // This function is now mostly a placeholder for the legacy password login.
    // The onAuthStateChanged listener is the source of truth.
    // We can set it here optimistically.
    sessionStorage.setItem('la-quita-admin-auth', 'true');
    setIsAdmin(true);
    setRole('owner');
    // Force a token refresh on next page load or action
    auth.currentUser?.getIdToken(true);
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem('la-quita-admin-auth');
    setIsAdmin(false);
    setRole(null);
    auth.signOut(); // Also sign out from Firebase
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
