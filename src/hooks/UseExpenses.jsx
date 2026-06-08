import { useState, useEffect } from 'react';
import api from '../services/api';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses'); 
      setExpenses(res.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des dépenses");
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const res = await api.post('/expenses', expenseData);
      setExpenses((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Erreur lors de l'ajout" };
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const res = await api.put(`/expenses/${id}`, expenseData);
      setExpenses((prev) => prev.map(exp => exp.id_exp === id ? res.data : exp));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Erreur lors de la modification" };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter(exp => exp.id_exp !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Erreur lors de la suppression" };
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refreshExpenses: fetchExpenses };
};