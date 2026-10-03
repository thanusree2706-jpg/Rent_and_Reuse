import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  isFirebaseConfigured,
  type User,
} from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  studentName: string;
  studentEmail: string;
  loading: boolean;
  isConfigured: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStudentProfile: (newDisplayName: string) => Promise<void>;
  switchDemoAccount: (role: 'student' | 'lender') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback user storage when testing before custom Firebase API keys are added
const LOCAL_STORAGE_USER_KEY = 'rent_reuse_local_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = useMemo(() => isFirebaseConfigured(), []);

  useEffect(() => {
    // If real Firebase keys are configured, use onAuthStateChanged
    if (isConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Check local persisted student session for seamless preview experience
      try {
        const localSaved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (localSaved) {
          setCurrentUser(JSON.parse(localSaved));
        }
      } catch (e) {
        console.error('Error reading local user session', e);
      } finally {
        setLoading(false);
      }
    }
  }, [isConfigured]);

  const signup = async (email: string, password: string, name: string) => {
    if (isConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }
      // Re-trigger update to reflect new displayName immediately
      setCurrentUser({ ...userCredential.user, displayName: name.trim() });
    } else {
      // Offline / Developer Demo Auth simulation
      const mockUser: any = {
        uid: 'demo-student-' + Date.now(),
        email: email.trim(),
        displayName: name.trim() || email.split('@')[0],
      };
      setCurrentUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
    }
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (isConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
    } else {
      // Offline / Developer Demo Auth simulation
      let defaultName = cleanEmail.split('@')[0].replace('.', ' ');
      let uid = 'demo-student-' + Date.now();
      if (cleanEmail === 'rahul@rguktrkv.ac.in' || cleanEmail.includes('rahul')) {
        defaultName = 'Rahul Sharma';
        uid = 'lender-rahul-rgukt';
      } else if (cleanEmail === 'student@rguktrkv.ac.in' || cleanEmail.includes('ananya')) {
        defaultName = 'Ananya Sharma';
        uid = 'student-ananya-rgukt';
      }

      const mockUser: any = {
        uid,
        email: cleanEmail,
        displayName: defaultName,
      };
      setCurrentUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
    }
  };

  const switchDemoAccount = (role: 'student' | 'lender') => {
    if (role === 'student') {
      const studentUser: any = {
        uid: 'student-ananya-rgukt',
        email: 'student@rguktrkv.ac.in',
        displayName: 'Ananya Sharma',
      };
      setCurrentUser(studentUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(studentUser));
    } else {
      const lenderUser: any = {
        uid: 'lender-rahul-rgukt',
        email: 'rahul@rguktrkv.ac.in',
        displayName: 'Rahul Sharma',
      };
      setCurrentUser(lenderUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(lenderUser));
    }
  };

  const logout = async () => {
    if (isConfigured) {
      await signOut(auth);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setCurrentUser(null);
  };

  const updateStudentProfile = async (newDisplayName: string) => {
    const trimmed = newDisplayName.trim();
    if (!trimmed) return;
    if (isConfigured && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: trimmed,
      });
      setCurrentUser({ ...auth.currentUser, displayName: trimmed });
    } else if (currentUser) {
      const updated: any = { ...currentUser, displayName: trimmed };
      setCurrentUser(updated);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
  };

  const studentName = useMemo(() => {
    if (!currentUser) return '';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'Student';
  }, [currentUser]);

  const studentEmail = currentUser?.email || '';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentName,
        studentEmail,
        loading,
        isConfigured,
        signup,
        login,
        logout,
        updateStudentProfile,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
