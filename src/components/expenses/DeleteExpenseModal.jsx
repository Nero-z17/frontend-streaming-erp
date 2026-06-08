import React from 'react';

const DeleteExpenseModal = ({ onClose, onDelete, expenseToDelete }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 font-bold text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2 text-red-600">Supprimer la dépense ?</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          Êtes-vous sûr de vouloir supprimer cette dépense de{' '}
          <span className="font-bold text-gray-900 dark:text-gray-50 dark:text-white">{parseFloat(expenseToDelete?.amount_exp).toLocaleString()} FCFA</span> ({expenseToDelete?.category_exp}) ? Cette action est définitive.
        </p>

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-bold transition"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={async () => {
              await onDelete(expenseToDelete.id_exp);
              onClose();
            }} 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition shadow-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;