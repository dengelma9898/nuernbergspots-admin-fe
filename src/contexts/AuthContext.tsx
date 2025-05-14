import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserId: () => string | null;
  getToken: () => Promise<string | null>;
  getUserProfile: () => Promise<{ name: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setToken(token);
  };

  const logout = async () => {
    await signOut(auth);
    setToken(null);
  };

  const getUserId = () => {
    return user?.uid || null;
  };

  const getToken = async () => {
    if (user) {
      const newToken = await user.getIdToken(true);
      setToken(newToken);
      return newToken;
    }
    return null;
  };

  const getUserProfile = async () => {
    const currentToken = await getToken();
    if (!currentToken) throw new Error('Nicht authentifiziert');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Profil konnte nicht geladen werden');
    }

    return response.json();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      token, 
      isAuthenticated: !!user,
      isLoading: loading,
      login, 
      logout, 
      getUserId, 
      getToken,
      getUserProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 