import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // API Timing Interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      config.metadata = { startTime: new Date() };
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        const duration = new Date() - response.config.metadata.startTime;
        console.log(`%c[API SUCCESS] %c${response.config.method.toUpperCase()} %c${response.config.url} %c${duration}ms`, 
          'color: #2ECC71; font-weight: bold;', 
          'color: #F1C40F;', 
          'color: #3498DB;', 
          'color: #E67E22; font-weight: bold;'
        );
        return response;
      },
      (error) => {
          const duration = new Date() - error.config.metadata.startTime;
          const status = error.response ? error.response.status : 'NETWORK_ERROR';
          console.log(`%c[API FAILED] %c${error.config.method.toUpperCase()} %c${error.config.url} %c${status} %c${duration}ms`, 
            'color: #E74C3C; font-weight: bold;', 
            'color: #F1C40F;', 
            'color: #3498DB;', 
            'color: #E74C3C; font-weight: bold;',
            'color: #E74C3C; font-weight: bold;'
          );
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (jwtToken, userData) => {
    try {
      await AsyncStorage.setItem('token', jwtToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
