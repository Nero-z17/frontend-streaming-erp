// src/components/clients/ClientCard.jsx
import React from 'react';

const ClientCard = ({ client, sub, statusAbo, onOpenDetails, onEdit, onDelete }) => {
  const cleanNumber = client.whatsapp_number_clt.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl dark:border-gray-700 flex flex-col gap-3 shadow-sm border-3 border-blue-500">
      {/* En-tête : Nom et Statut */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg">{client.name_clt}</h3>
          {sub && (
             <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
               Écran : {sub.Profiles?.name_profil}
             </p>
          )}
        </div>
        {sub && (
          statusAbo === 'En cours' ? (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-md text-xs font-bold">En cours</span>
          ) : statusAbo === 'Terminé' ? (
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-md text-xs font-bold">Terminé</span>
          ) : null
        )}
      </div>

      {/* Informations de contact */}
      <div>
        <a href={waUrl} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-300 font-medium hover:text-green-600 flex items-center gap-2 text-sm w-max">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
          {client.whatsapp_number_clt}
        </a>
        {client.note_clt && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-700 italic truncate">
            {client.note_clt}
          </p>
        )}
      </div>

      {/* Actions (Optimisées pour le pouce) */}
      <div className="grid grid-cols-3 gap-2 mt-2 border-t border-gray-100 dark:border-gray-700 pt-3">
        <button onClick={() => onOpenDetails(client)} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-2 rounded-lg text-xs font-bold transition">
          Détails
        </button>
        <button onClick={() => onEdit(client)} className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 py-2 rounded-lg text-xs font-bold transition">
          Éditer
        </button>
        <button onClick={() => { if(window.confirm(`Supprimer ${client.name_clt} ?`)) onDelete(client.id_clt); }} className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 py-2 rounded-lg text-xs font-bold transition">
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default ClientCard;