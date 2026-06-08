import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseModal from '../components/expenses/ExpenseModal';
import DeleteExpenseModal from '../components/expenses/DeleteExpenseModal';

const Expenses = () => {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // 1. Calcul du grand Total Global
  const globalTotal = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount_exp), 0);

  // 2. Logique de regroupement des dépenses par Mois
  const getGroupedExpenses = () => {
    const groups = {};
    expenses.forEach((exp) => {
      const date = new Date(exp.date_exp);
      // Format de clé lisible en français : "Janvier 2026", "Février 2026", etc.
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const formattedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

      if (!groups[formattedMonth]) {
        groups[formattedMonth] = {
          monthName: formattedMonth,
          items: [],
          monthlyTotal: 0
        };
      }
      groups[formattedMonth].items.push(exp);
      groups[formattedMonth].monthlyTotal += parseFloat(exp.amount_exp);
    });
    return Object.values(groups); // Retourne un tableau de groupes
  };

  const groupedExpenses = getGroupedExpenses();

  if (loading) return <div className="p-6 text-center font-medium text-gray-500 dark:text-gray-400">Chargement des dépenses...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm border-3 border-blue-500 dark:bg-gray-800 p-4 rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dépenses</h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="hidden md:block bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg font-bold transition shadow-sm"
        >
          + Ajouter une depense
        </button>
      </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="md:hidden fixed bottom-24 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition z-40"
        >
        <span className="text-3xl font-light mb-1">+</span>
        </button>
      {/* Cadre Statistique : Total Global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm border-l-4 border-l-red-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Dépenses Global</p>
          <p className="text-2xl font-black text-red-600">{globalTotal.toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* Liste des dépenses groupées par mois */}
      <div className="space-y-6">
        {groupedExpenses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border text-gray-500 dark:text-gray-400">Aucune dépense enregistrée.</div>
        ) : (
          groupedExpenses.map((group) => (
            <div key={group.monthName} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
              
              {/* En-tête du groupe Mensuel avec son Total Propre */}
              <div className="bg-blue-500 dark:bg-gray-800 px-4 py-3 flex flex-wrap justify-between items-center border-b gap-2">
                <h2 className="text-lg font-bold text-gray-100 dark:text-gray-200">{group.monthName}</h2>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1.5 rounded-full shadow-xs">
                  Total du mois : {group.monthlyTotal.toLocaleString()} FCFA
                </span>
              </div>

              {/* Tableau du mois */}
              {/* vue bureau*/}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left table-fixed border-collapse min-w-[800px]">
                  <thead className="bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-4 font-bold w-[15%] text-left align-middle">Date</th>
                      <th className="px-4 py-4 font-bold w-[20%] text-left align-middle">Catégorie</th>
                      <th className="px-4 py-4 font-bold w-[30%] text-left align-middle">Description</th>
                      <th className="px-4 py-4 font-bold w-[15%] text-left align-middle">Montant</th>
                      <th className="px-4 py-4 font-bold w-[20%] text-right align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {group.items.map((exp) => (
                      <tr key={exp.id_exp} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition">
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 text-left align-middle">{new Date(exp.date_exp).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-4 text-left align-middle">
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-md text-xs font-bold">
                            {exp.category_exp}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 truncate text-left align-middle">{exp.description_exp || '-'}</td>
                        <td className="px-4 py-4 font-bold text-red-600 text-sm text-left align-middle">{parseFloat(exp.amount_exp).toLocaleString()} FCFA</td>
                        
                        {/* CORRECTION : On retire le flex du td et on le met dans une div */}
                        <td className="px-4 py-4 align-middle">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setExpenseToEdit(exp)} 
                              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 px-2.5 py-1.5 rounded-md font-medium text-xs transition"
                            >
                              Modifier
                            </button>
                            <button 
                              onClick={() => setExpenseToDelete(exp)} 
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 px-2.5 py-1.5 rounded-md font-medium text-xs transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* vue mobile */}
              <div className="md:hidden space-y-3">
                {group.items.map((exp) => (
                  <div key={exp.id_exp} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{exp.description_exp}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">{new Date(exp.date_exp).toLocaleDateString()} • {exp.category_exp}</p>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{parseFloat(exp.amount_exp).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => setExpenseToEdit(exp)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-1.5 rounded-lg text-xs font-bold">Modifier</button>
                      <button onClick={() => setExpenseToDelete(exp)} className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 py-1.5 rounded-lg text-xs font-bold">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Pop-up AJOUT */}
      {showAddModal && (
        <ExpenseModal onClose={() => setShowAddModal(false)} onAdd={addExpense} />
      )}

      {/* Pop-up MODIFICATION */}
      {expenseToEdit && (
        <ExpenseModal 
          expenseToEdit={expenseToEdit} 
          onClose={() => setExpenseToEdit(null)} 
          onUpdate={updateExpense} 
        />
      )}

      {/* Pop-up SUPPRESSION */}
      {expenseToDelete && (
        <DeleteExpenseModal 
          expenseToDelete={expenseToDelete} 
          onClose={() => setExpenseToDelete(null)} 
          onDelete={deleteExpense} 
        />
      )}
    </div>
  );
};

export default Expenses;