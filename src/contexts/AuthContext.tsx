import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserId: () => string | null;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      token, 
      isAuthenticated: !!user,
      login, 
      logout, 
      getUserId, 
      getToken 
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