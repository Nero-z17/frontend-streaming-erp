import { useState, useEffect } from 'react';
import api from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger la liste des clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
      setClients(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter un client
  const addClient = async (clientData) => {
    try {
      const res = await api.post('/clients', clientData);
      // On ajoute instantanément le nouveau client en haut de la liste locale
      setClients((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Erreur lors de l'ajout" };
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, error, refreshClients: fetchClients, addClient };
};