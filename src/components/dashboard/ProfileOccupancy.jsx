import React from 'react';

const ProfileOccupancy = ({ platform, used, total }) => {
  
  // NOUVELLE LOGIQUE : Si le total est null (ce qu'on a fait dans le hook), 
  // on affiche le design basé sur le nombre de clients avec abonnement en cours.
  if (total === null || total === undefined) {
    return (
      <div className="mb-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700 dark:border-gray-700 transition hover:bg-white dark:hover:bg-gray-800 dark:bg-gray-700">
        <div className="flex items-center gap-3">
          {/* Petit indicateur visuel : Vert s'il y a des clients, Gris si c'est à 0 */}
          <div className={`w-2.5 h-2.5 rounded-full ${used > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{platform}</span>
        </div>
        <span className="text-sm font-bold text-blue-700 md:text-20 bg-blue-100 px-3 py-1.5 rounded-full shadow-sm">
          {used} client(s)
        </span>
      </div>
    );
  }

  // ANCIENNE LOGIQUE : Je la laisse ici au cas où tu réparerais tes requêtes 
  // de profils/comptes dans le futur et que tu remettrais le calcul du total !
  const percentage = total === 0 ? 0 : Math.round((used / total) * 100);
  let colorClass = "bg-green-500";
  if (percentage > 75) colorClass = "bg-orange-50 dark:bg-orange-900/300";
  if (percentage >= 100) colorClass = "bg-red-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{platform}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{used} / {total} profils ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfileOccupancy;