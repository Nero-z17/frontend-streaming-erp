import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AccountProfileModal = ({ account, onClose, onUpdate }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États de l'interface
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  // Formulaire d'ajout
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounts/${account.id_acct}/profiles`);
      setProfiles(res.data);
    } catch (err) {
      console.error("Erreur chargement profils:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [account.id_acct]);

  // AJOUTER
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/accounts/${account.id_acct}/profiles`, {
        name_profil: name,
        pin_code_profil: pin || null
      });
      setName('');
      setPin('');
      setShowAddForm(false);
      fetchProfiles();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Erreur lors de l'ajout du profil");
    }
  };

  // MODIFIER
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/accounts/profiles/${editingProfile.id_profil}`, {
        name_profil: editingProfile.name_profil,
        pin_code_profil: editingProfile.pin_code_profil || null
      });
      setEditingProfile(null);
      fetchProfiles();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  };

  // SUPPRIMER
  const handleDelete = async (id_profil) => {
    if (window.confirm("Supprimer définitivement ce profil ? Les abonnements liés risquent d'être impactés.")) {
      try {
        await api.delete(`/accounts/profiles/${id_profil}`);
        fetchProfiles();
        if (onUpdate) onUpdate();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

return (
    <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 md:p-4">
      {/* Fenêtre collée en bas sur mobile (h-[90vh]), centrée sur PC */}
      <div className="bg-white dark:bg-gray-800 w-full md:max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestion des profils</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{account.platform_acct} - {account.email_acct}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black dark:hover:text-white text-3xl transition">&times;</button>
        </div>

        {/* AJOUT DU pb-24 ICI POUR SAUVER LE BOUTON DE LA BOTTOM NAV */}
        <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto pb-24">

          {/* LISTE DES PROFILS */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Écrans disponibles</h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              >
                {showAddForm ? "Annuler l'ajout" : "+ Nouveau Profil"}
              </button>
            </div>

            {loading ? <div className="animate-pulse text-gray-400">Chargement...</div> : (
              <div className="space-y-3">
                {profiles.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl text-center text-gray-500 dark:text-gray-400 italic">Aucun profil configuré.</div>
                ) : (
                  profiles.map(prof => {
                    // MODE ÉDITION
                    if (editingProfile && editingProfile.id_profil === prof.id_profil) {
                      return (
                        <form key={prof.id_profil} onSubmit={handleUpdateSubmit} className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 p-4 rounded-xl flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nom du profil</label>
                            <input type="text" required value={editingProfile.name_profil} onChange={(e) => setEditingProfile({...editingProfile, name_profil: e.target.value})} className="w-full p-2 border rounded-lg text-sm outline-none" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Code PIN</label>
                            <input type="text" value={editingProfile.pin_code_profil || ''} onChange={(e) => setEditingProfile({...editingProfile, pin_code_profil: e.target.value})} className="w-full p-2 border rounded-lg text-sm outline-none font-mono" placeholder="Ex: 1234" />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="bg-orange-50 dark:bg-orange-900/300 text-white px-4 py-2 rounded-lg text-sm font-bold">OK</button>
                            <button type="button" onClick={() => setEditingProfile(null)} className="bg-gray-300 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-bold">X</button>
                          </div>
                        </form>
                      );
                    }

                      // MODE AFFICHAGE NORMAL
                      const clientCount = prof._count?.Subscriptions || prof.Subscriptions?.length || 0;

                      return (
                        <div key={prof.id_profil} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 hover:border-gray-300 dark:border-gray-600 transition">
                          
                          {/* Section Gauche (Nom & PIN) */}
                          <div className="flex items-center gap-3 sm:flex-1">
                            <span className="font-bold text-gray-900 dark:text-white truncate">{prof.name_profil}</span>
                            {prof.pin_code_profil && (
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-mono font-medium shrink-0">
                                PIN: {prof.pin_code_profil}
                              </span>
                            )}
                          </div>

                          {/* Section Milieu & Droite (Adaptative Mobile/PC) */}
                          <div className="flex items-center justify-between sm:flex-1 sm:justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-3 sm:border-0 sm:pt-0">
                            
                            {/* Section Milieu (Badge Compteur) */}
                            <div className="flex sm:justify-center sm:flex-1">
                              <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-2.5 py-1 rounded-md text-xs font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                                  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                                </svg>
                                {clientCount} client{clientCount !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Section Droite (Boutons Actions) */}
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => setEditingProfile(prof)} className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-bold px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition">
                                Modifier
                              </button>
                              <button onClick={() => handleDelete(prof.id_profil)} className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition">
                                Supprimer
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                  })
                )}
              </div>
            )}
          </section>

          {/* FORMULAIRE D'AJOUT (Caché par défaut) */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner mt-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 border-b pb-2">Ajouter un écran</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nom (Ex: Écran 1) *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg text-sm outline-none bg-white dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Code PIN (Optionnel)</label>
                  <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-2 border rounded-lg text-sm outline-none bg-white dark:bg-gray-800 font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition shadow-sm">
                Enregistrer le profil
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountProfileModal;