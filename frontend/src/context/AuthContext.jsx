import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Always go to login page first on load / reload
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear any persistent tokens so the app always lands on login page first
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      sessionStorage.removeItem('jwt_token');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const receivedToken = data.token;
      sessionStorage.setItem('jwt_token', receivedToken);
      setToken(receivedToken);

      // Extract user from payload
      let parsedUser = { email, name: email.split('@')[0] };
      try {
        const payload = JSON.parse(atob(receivedToken.split('.')[1]));
        parsedUser.email = payload.sub || email;
      } catch (e) {
        // Fallback
      }

      // Check if we have registered name cached
      const cached = localStorage.getItem('user_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.email === email && parsed.name) {
            parsedUser.name = parsed.name;
          }
        } catch (e) {}
      }

      setUser(parsedUser);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Invalid credentials. Please verify your email and password.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, mobileNumber) => {
    setLoading(true);
    try {
      const userRes = await authApi.register({ name, email, password, mobileNumber });
      // Cache registered profile
      localStorage.setItem('user_data', JSON.stringify(userRes));
      // Automatically login after register
      return await login(email, password);
    } catch (error) {
      const data = error.response?.data;
      let message = 'Registration failed. Please check your inputs.';
      if (data) {
        if (data.message) {
          message = data.message;
        } else if (typeof data === 'object') {
          // Validation error map e.g. { email: "Invalid email", password: "..." }
          message = Object.values(data).join('; ');
        }
      }
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
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
