// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Le nouveau state magique qui empêche le renvoi vers /login au rafraîchissement
  const [loadingAuth, setLoadingAuth] = useState(true); 

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoadingAuth(false);
        return; // Pas de token, on arrête de chercher
      }

      try {
        // Le token existe, on demande au backend s'il est toujours valide
        await api.get('/auth/verify'); 
        setUser(true); // C'est bon, on reconnecte l'utilisateur
      } catch (error) {
        // Le token est expiré ou bidon
        console.error("Session expirée");
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        // Quoi qu'il arrive, on a fini de charger
        setLoadingAuth(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    // On n'oublie pas d'exporter loadingAuth pour que App.jsx puisse l'utiliser
    <AuthContext.Provider value={{ user, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};