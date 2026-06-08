import React from 'react';

const ClientRow = ({ client, sub, statusAbo, onOpenDetails, onEdit, onDelete }) => {
  const cleanNumber = client.whatsapp_number_clt.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber}`;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition border-b border-gray-100 dark:border-gray-700 last:border-0">
      
      {sub && (
        <td className="px-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 text-left align-middle">
          {sub.Profiles?.name_profil}
        </td>
      )}
      
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white text-left align-middle">
        {client.name_clt}
      </td>
      
      <td className="px-4 py-4 text-left align-middle">
        <a 
          href={waUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-green-600 font-medium hover:text-green-800 hover:underline flex items-center gap-1 w-max"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
          {client.whatsapp_number_clt}
        </a>
      </td>

      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w- text-left align-middle">
        {client.note_clt || "—"}
      </td>
      
      {sub && (
        <td className="px-4 py-4 text-left align-middle">
          {statusAbo === 'En cours' ? (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-bold">En cours</span>
          ) : statusAbo === 'Terminé' ? (
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs font-bold">Terminé</span>
          ) : (
            <span className="text-gray-400 text-xs font-bold">—</span>
          )}
        </td>
      )}
      
      {/* CORRECTION CRUCIALE ICI : La classe flex a été retirée du <td> et mise dans une <div> */}
      <td className="px-4 py-4 align-middle">
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => onOpenDetails(client)}
            className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
          >
            Détails
          </button>
          <button 
            onClick={() => onEdit(client)}
            className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition"
          >
            Éditer
          </button>
          <button 
            onClick={() => {
              if(window.confirm(`Supprimer définitivement ${client.name_clt} ?`)) onDelete(client.id_clt);
            }}
            className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ClientRow;