import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

/**
 * Diagnostic helper to extract human-readable error messages from backend or network responses.
 */
function extractErrorMessage(error, operation) {
  const isRemote =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  // Network error or no response from server
  if (error?.code === 'ERR_NETWORK' || (!error?.response && error?.message?.includes('Network Error'))) {
    if (isRemote) {
      return 'Cannot reach backend server. The frontend is deployed on Vercel, but your Spring Boot backend is not hosted here. To test immediately, open http://localhost:5173 on your computer, or configure VITE_API_URL in Vercel to your deployed backend.';
    }
    return 'Cannot connect to backend server. Make sure your Spring Boot backend is running locally on port 8080.';
  }

  // HTML response returned (SPA rewrite triggered because backend endpoint does not exist)
  if (error?.message === 'HTML_RESPONSE') {
    if (isRemote) {
      return 'Backend API not found. On Vercel, API requests cannot reach your local backend. Please test locally on http://localhost:5173 or deploy the Spring Boot backend and set VITE_API_URL.';
    }
    return 'Received unexpected HTML page from server instead of API JSON response.';
  }

  if (error?.message === 'NO_TOKEN') {
    return 'Authentication failed: Server did not return a valid JWT token.';
  }

  const response = error?.response;
  if (!response) {
    return error?.message || `${operation === 'register' ? 'Registration' : 'Login'} failed. Please try again.`;
  }

  const { status, data } = response;

  // 404 Not Found or 405 Method Not Allowed
  if (status === 404 || status === 405) {
    if (isRemote) {
      return `Backend API endpoint not found (HTTP ${status}). The Vercel frontend cannot reach your backend. Set VITE_API_URL in Vercel settings or use http://localhost:5173.`;
    }
    return `Backend API route not found (HTTP ${status}). Please ensure Spring Boot is running and the endpoint is registered.`;
  }

  // If response body is HTML string (e.g. from Vercel fallback)
  if (typeof data === 'string') {
    if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
      if (isRemote) {
        return 'Backend API endpoint not found. The server returned HTML instead of JSON. Ensure your Spring Boot backend is deployed and connected.';
      }
      return 'Server returned HTML instead of JSON.';
    }
    if (data.trim()) {
      return data;
    }
  }

  // Structured response from Spring Boot GlobalExceptionHandler
  if (data && typeof data === 'object') {
    // 1. Explicit message from exception handler (e.g. EmailAlreadyExistsException or InvalidCredentialsException)
    if (data.message) {
      return data.message;
    }
    // 2. Spring validation field errors e.g. { name: "Name is required", email: "Invalid email format" }
    const fieldEntries = Object.entries(data).filter(([k]) => k !== 'timestamp' && k !== 'status' && k !== 'error');
    if (fieldEntries.length > 0) {
      return fieldEntries.map(([field, msg]) => `${field}: ${msg}`).join(' | ');
    }
    if (data.error) {
      return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
  }

  return operation === 'register'
    ? 'Registration failed. Please check your inputs.'
    : 'Invalid credentials. Please verify your email and password.';
}

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
      if (typeof data === 'string' && (data.includes('<!DOCTYPE html>') || data.includes('<html'))) {
        throw new Error('HTML_RESPONSE');
      }
      const receivedToken = data?.token;
      if (!receivedToken) {
        throw new Error('NO_TOKEN');
      }

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
      return { success: false, error: extractErrorMessage(error, 'login') };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, mobileNumber) => {
    setLoading(true);
    try {
      const userRes = await authApi.register({ name, email, password, mobileNumber });
      if (typeof userRes === 'string' && (userRes.includes('<!DOCTYPE html>') || userRes.includes('<html'))) {
        throw new Error('HTML_RESPONSE');
      }
      // Cache registered profile
      localStorage.setItem('user_data', JSON.stringify(userRes));
      // Automatically login after register
      return await login(email, password);
    } catch (error) {
      return { success: false, error: extractErrorMessage(error, 'register') };
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
