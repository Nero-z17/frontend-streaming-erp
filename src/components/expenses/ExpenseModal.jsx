import React, { useState, useEffect } from 'react';

const ExpenseModal = ({ onClose, onAdd, onUpdate, expenseToEdit }) => {
  const [formData, setFormData] = useState({
    date_exp: new Date().toISOString().split('T')[0],
    category_exp: 'OTHER',
    amount_exp: '',
    description_exp: ''
  });

  // Si on est en mode édition, on pré-remplit les champs
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        date_exp: new Date(expenseToEdit.date_exp).toISOString().split('T')[0],
        category_exp: expenseToEdit.category_exp || 'OTHER',
        amount_exp: expenseToEdit.amount_exp || '',
        description_exp: expenseToEdit.description_exp || ''
          });
    }
  }, [expenseToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (expenseToEdit) {
      await onUpdate(expenseToEdit.id_exp, formData);
    } else {
      await onAdd(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* BOUTON DE FERMETURE (La petite croix en haut à droite) */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 transition font-bold text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {expenseToEdit ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date</label>
            <input type="date" required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date_exp} onChange={(e) => setFormData({...formData, date_exp: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Catégorie</label>
            <select className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-300" value={formData.category_exp} onChange={(e) => setFormData({...formData, category_exp: e.target.value})}>
              <option value="OTHER">Autre</option>
              <option value="FACEBOOK_ADS">Publicité (Ads)</option>
              <option value="INTERNET">Internet / Data</option>
              <option value="GRAPHIC_DESIGN">Design / Graphisme</option>
              <option value="MOBILE_MONEY_FEES">Frais Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Montant (FCFA)</label>
            <input type="number" required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.amount_exp} onChange={(e) => setFormData({...formData, amount_exp: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
            <textarea className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description_exp} onChange={(e) => setFormData({...formData, description_exp: e.target.value})} />
          </div>

          {/* GROUPE DE BOUTONS DE BAS DE PAGE */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg font-bold transition"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-sm"
            >
              {expenseToEdit ? 'Enregistrer' : 'Confirmer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseModal;