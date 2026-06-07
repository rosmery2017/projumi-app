import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState({
    user: null,
    token: null,
    endpoint: null,
    raw: null,
  });

  const signIn = (nextSession) => {
    setSession({
      user: nextSession?.user ?? null,
      token: nextSession?.token ?? null,
      endpoint: nextSession?.endpoint ?? null,
      raw: nextSession?.raw ?? null,
    });
  };

  const signOut = () => {
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
