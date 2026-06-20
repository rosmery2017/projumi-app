import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState({
    user: null,
    token: null,
    endpoint: null,
    raw: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('jwt_token'),
          AsyncStorage.getItem('user_data'),
        ]);

        setSession({
          user: storedUser ? JSON.parse(storedUser) : null,
          token: storedToken || null,
          endpoint: null,
          raw: null,
        });
      } catch (error) {
        console.log('No se pudo restaurar la sesión:', error?.message);
      } finally {
        setIsReady(true);
      }
    };

    hydrateSession();
  }, []);

  const signIn = (nextSession) => {
    setSession({
      user: nextSession?.user ?? null,
      token: nextSession?.token ?? null,
      endpoint: nextSession?.endpoint ?? null,
      raw: nextSession?.raw ?? null,
    });
  };

  const signOut = () => {
    AsyncStorage.removeItem('jwt_token').catch(() => {});
    AsyncStorage.removeItem('user_data').catch(() => {});
    setSession({
      user: null,
      token: null,
      endpoint: null,
      raw: null,
    });
  };

  const value = {
    user: session.user,
    token: session.token,
    endpoint: session.endpoint,
    raw: session.raw,
    isReady,
    isAuthenticated: Boolean(session.user || session.token),
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
