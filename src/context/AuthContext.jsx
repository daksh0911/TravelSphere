import { useState, useEffect } from 'react';
import AuthContext from './authContextObject';
import { loginUser, registerUser, loginSocialUser } from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('travelsphere_active_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('travelsphere_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('travelsphere_active_user');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(credentials);
      if (res.success && res.user) {
        if (res.token) sessionStorage.setItem('travelsphere_session_token', res.token);
        setUser(res.user);
        return { success: true, message: res.message };
      } else {
        throw new Error(res.message || 'Login failed.');
      }
    } catch (err) {
      const errMsg = err.message || 'Login failed.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginSocialUser(provider);
      if (res.success && res.user) {
        if (res.token) sessionStorage.setItem('travelsphere_session_token', res.token);
        setUser(res.user);
        return { success: true, message: res.message, user: res.user };
      } else {
        throw new Error(res.message || 'Social login failed.');
      }
    } catch (err) {
      const errMsg = err.message || 'Social login failed.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(userData);
      if (res.success) {
        return { success: true, message: res.message, user: res.user };
      } else {
        throw new Error(res.message || 'Registration failed.');
      }
    } catch (err) {
      const errMsg = err.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('travelsphere_active_user');
    sessionStorage.removeItem('travelsphere_session_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      socialLogin,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

