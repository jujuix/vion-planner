import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();
const isDemoMode = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true';

const demoSession = {
  user: {
    id: 'demo-local-user',
    email: 'demo@localhost',
    user_metadata: {
      user_name: 'Demo Kullanıcı',
      selected_pages: ['ana', 'ders', 'is', 'spor', 'gunluk']
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(isDemoMode ? demoSession : null);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode) return undefined;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, displayName = '', selectedPages = []) => {
    const cleanName = (displayName || '').trim();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_name: cleanName, selected_pages: selectedPages }
      }
    });
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (isDemoMode) {
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, loading, isDemoMode, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);