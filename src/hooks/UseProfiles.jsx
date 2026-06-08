// src/hooks/useProfiles.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useProfiles = (accountId) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfiles = async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      // Appel à ta route : GET /api/accounts/:id/profiles
      const res = await api.get(`/accounts/${accountId}/profiles`);
      setProfiles(res.data);
      setError(null);
    } catch (err) {
      setError("Erreur de chargement des profils");
    } finally {
      setLoading(false);
    }
  };

  const addProfile = async (profileData) => {
    try {
      // Appel à ta route : POST /api/profiles
      const res = await api.post('/profiles', profileData);
      setProfiles((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Erreur lors de l'ajout du profil" };
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [accountId]);

  return { profiles, loading, error, addProfile };
};