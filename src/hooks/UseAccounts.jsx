// src/hooks/useAccounts.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts');
      setAccounts(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de chargement des comptes");
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData) => {
    try {
      const res = await api.post('/accounts', accountData);
      setAccounts((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Erreur lors de l'ajout" };
    }
  };

  // --- ACTIONS PROFILS INTEGRÉES ---
  const fetchProfilesForAccount = async (accountId) => {
    try {
      const res = await api.get(`/accounts/${accountId}/profiles`);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de la récupération des profils", err);
      return [];
    }
  };

const addProfileToAccount = async (profileData) => {
    try {
      // On utilise l'id_acct présent dans profileData pour construire la bonne URL
      // L'URL doit correspondre à la route backend : /api/accounts/:id/profiles
      const res = await api.post(`/accounts/${profileData.id_acct}/profiles`, profileData);
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Détails de l'erreur :", err);
      return { success: false, error: "Erreur lors de l'ajout du profil" };
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { 
    accounts, 
    loading, 
    error, 
    refreshAccounts: fetchAccounts, 
    addAccount,
    fetchProfilesForAccount,
    addProfileToAccount
  };
};