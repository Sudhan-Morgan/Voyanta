import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in localStorage
    const savedUser = localStorage.getItem('voyanta_user') || localStorage.getItem('travelmate_user');
    const token = localStorage.getItem('voyanta_token') || localStorage.getItem('travelmate_token');

    if (savedUser && token && token !== 'undefined' && token !== 'null') {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Verify with backend
        authService.getMe()
          .then((res) => {
            if (res.user) {
              setUser(res.user);
              localStorage.setItem('voyanta_user', JSON.stringify(res.user));
            }
          })
          .catch((err) => {
            console.warn('Backend session verification note:', err);
            // Only clear session if token is explicitly invalid or expired
            if (err?.response?.status === 401) {
              authService.logout();
              setUser(null);
            }
          })
          .finally(() => setLoading(false));
      } catch (err) {
        authService.logout();
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    // Listen for unauthorized/expired session events from api interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    setUser(data.user);
    return data;
  };

  const addFavoritePlace = async (placeData) => {
    const data = await authService.addFavoritePlace(placeData);
    setUser(data.user);
    return data;
  };

  const removeFavoritePlace = async (placeId) => {
    const data = await authService.removeFavoritePlace(placeId);
    setUser(data.user);
    return data;
  };

  const sendRegisterOtp = async (data) => {
    return await authService.sendRegisterOtp(data);
  };

  const verifyRegisterOtp = async (data) => {
    return await authService.verifyRegisterOtp(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: Boolean(
          user &&
          (localStorage.getItem('voyanta_token') || localStorage.getItem('travelmate_token')) &&
          (localStorage.getItem('voyanta_token') || localStorage.getItem('travelmate_token')) !== 'undefined'
        ),
        loading,
        login,
        register,
        sendRegisterOtp,
        verifyRegisterOtp,
        logout,
        updateProfile,
        addFavoritePlace,
        removeFavoritePlace
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
