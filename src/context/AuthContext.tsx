import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Admin } from '../types/api';

interface AuthContextType {
  token: string | null;
  admin: Admin | null;
  login: (token: string, admin: Admin) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('adminToken');
      const storedAdmin = await AsyncStorage.getItem('adminData');
      if (storedToken && storedAdmin) {
        setToken(storedToken);
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newAdmin: Admin) => {
    await AsyncStorage.setItem('adminToken', newToken);
    await AsyncStorage.setItem('adminData', JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('adminToken');
    await AsyncStorage.removeItem('adminData');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
