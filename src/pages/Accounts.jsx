import React, { useState } from 'react';
import { useAccounts } from '../hooks/UseAccounts'; 
import AccountProfileModal from '../components/accounts/AccountProfileModal';
import api from '../services/api';
import logoN from '../assets/netflix.webp'; 
import logoP from '../assets/prime.avif';
import logoC from '../assets/crunchyrool.png';

const Accounts = () => {
  const { accounts, loading, error, addAccount, fetchProfilesForAccount } = useAccounts();
  
  const [showAddModal, setShowAddModal] = useState(false); 
  const [selectedAccount, setSelectedAccount] = useState(null); 
  const [editingAccount, setEditingAccount] = useState(null); 
  
  // MODIFIÉ : renewal_date_acct devient start_date_acct
  const [formData, setFormData] = useState({
    platform_acct: 'NETFLIX', email_acct: '', password_acct: '', purchase_price_acct: '', start_date_acct: '', mdp_gmail_acct: '', visa_acct: ''
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🧠 FONCTION CHIRURGICALE : Calcule le prochain renouvellement dynamique
  const calculateNextRenewal = (startDateString) => {
    if (!startDateString) return "—";
    const start = new Date(startDateString);
    const today = new Date();
    
    // On projette le jour de départ dans le mois et l'année en cours
    let nextRenewal = new Date(today.getFullYear(), today.getMonth(), start.getDate());
    
    // On retire l'heure de 'today' pour comparer équitablement les jours
    today.setHours(0, 0, 0, 0);

    // Si le jour de renouvellement est déjà passé ce mois-ci, on passe au mois suivant
    if (nextRenewal < today) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
    
    return nextRenewal.toLocaleDateString('fr-FR');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const result = await addAccount(formData);
    if (result.success) {
      setFormData({ platform_acct: 'NETFLIX', email_acct: '', password_acct: '', purchase_price_acct: '', start_date_acct: '', mdp_gmail_acct: '', visa_acct: ''});
      setShowAddModal(false); 
      window.location.reload(); 
    } else { setFormError(result.error); }
  };

  const handleDeleteAccount = async (id_acct) => {
    if (window.confirm("ATTENTION : Supprimer ce compte effacera également tous les profils et abonnements liés. Continuer ?")) {
      try {
        await api.delete(`/accounts/${id_acct}`);
        window.location.reload();
      } catch (err) {
        alert("Erreur lors de la suppression du compte.");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/accounts/${editingAccount.id_acct}`, {
        platform_acct: editingAccount.platform_acct,
        email_acct: editingAccount.email_acct,
        password_acct: editingAccount.password_acct,
        purchase_price_acct: editingAccount.purchase_price_acct,
        start_date_acct: editingAccount.start_date_acct, // MODIFIÉ ICI
        mdp_gmail_acct: editingAccount.mdp_gmail_acct,
        visa_acct: editingAccount.visa_acct
      });
      setEditingAccount(null);
      window.location.reload();
    } catch (err) {
      alert("Erreur lors de la modification du compte.");
    }
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    const platform = account.platform_acct;
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push(account);
    return acc;
  }, {});

  const platformColors = {
    'NETFLIX': 'bg-red-100 text-red-700 border-red-200',
    'PRIME': 'bg-blue-100 text-blue-700 border-blue-200',
    'CRUNCHYROLL': 'bg-orange-100 text-orange-700 border-orange-200'
  };

  const platformLogos = {
    'NETFLIX': logoN, 
    'PRIME': logoP,
    'CRUNCHYROLL': logoC
  };

  return (
    <div className="p-4 md:p-6 space-y-6 relative">
      <div className="flex justify-between items-center shadow-sm border-3 border-blue-500 dark:bg-gray-800 p-4 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Comptes Fournisseurs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Organisés par plateforme</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="hidden md:block bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg font-bold transition shadow-sm">
          + Ajouter un compte
        </button>
      </div>

      <button onClick={() => setShowAddModal(true)} className="md:hidden fixed bottom-24 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition z-40">
        <span className="text-3xl font-light mb-1">+</span>
      </button>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 animate-pulse text-center py-10">Chargement de vos comptes...</div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 bg-red-50 p-4 rounded-xl">{error}</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center text-gray-400 border border-gray-100 dark:border-gray-700">Aucun compte parent enregistré.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAccounts).map(([platform, platformAccounts]) => (
            <div key={platform} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              
              <div className="bg-blue-500 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                {platformLogos[platform] && <img src={platformLogos[platform]} alt={platform} className="w-8 h-8 md:w-12 md:h-12 object-contain" />}
                <h2 className="text-base md:text-lg font-bold text-gray-100 uppercase tracking-wider">{platform}</h2>
                <span className={`ml-auto px-2.5 py-1 rounded-md text-xs font-bold border ${platformColors[platform] || 'bg-gray-100 dark:bg-gray-700'}`}>
                  {platformAccounts.length} compte(s)
                </span>
              </div>
              
              {/* VUE DESKTOP */}
              <div className="hidden md:block">
                <table className="w-full text-left table-fixed border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-4 font-medium w-[25%] text-left align-middle">Email & Sécurité</th>
                      <th className="px-4 py-4 font-medium w-[15%] text-left align-middle">Mot de passe</th>
                      <th className="px-4 py-4 font-medium w-[20%] text-left align-middle">Renouvellement Auto</th>
                      <th className="px-4 py-4 font-medium w-[15%] text-left align-middle">Prix d'achat</th>
                      <th className="px-4 py-4 font-medium w-[25%] text-right align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {platformAccounts.map((acc) => (
                      <tr key={acc.id_acct} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition">
                        <td className="px-4 py-4 align-middle">
                          <div className="font-bold text-gray-900 dark:text-white truncate mb-1">{acc.email_acct}</div>
                          <div className="flex gap-1.5">
                            {acc.mdp_gmail_acct && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono">📧 {acc.mdp_gmail_acct}</span>}
                            {acc.visa_acct && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">💳 {acc.visa_acct}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-mono text-gray-500 dark:text-gray-400 text-left align-middle truncate">{acc.password_acct}</td>
                        <td className="px-4 py-4 text-sm text-left align-middle">
                          <div className="font-bold text-blue-600 dark:text-blue-400">
                            {calculateNextRenewal(acc.start_date_acct)}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Créé le {new Date(acc.start_date_acct).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-200 text-left align-middle">{acc.purchase_price_acct} FCFA</td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedAccount(acc)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition">Profils</button>
                            <button onClick={() => setEditingAccount({...acc, start_date_acct: new Date(acc.start_date_acct).toISOString().split('T')[0]})} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition">Éditer</button>
                            <button onClick={() => handleDeleteAccount(acc.id_acct)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* VUE MOBILE */}
              <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/20">
                {platformAccounts.map((acc) => (
                  <div key={acc.id_acct} className="bg-white shadow-sm border-3 border-blue-500 dark:bg-gray-800 p-4 rounded-xl dark:border-gray-700 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100 break-all">{acc.email_acct}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded whitespace-nowrap">{acc.purchase_price_acct} FCFA</span>
                    </div>
                    <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">MDP: {acc.password_acct}</div>
                    
                    {/* Bloc Date Intelligent Mobile */}
                    <div className="bg-blue-50/50 dark:bg-gray-900 p-2.5 rounded-lg border border-blue-100 dark:border-gray-700 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Renouvellement :</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{calculateNextRenewal(acc.start_date_acct)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Date de début :</span>
                        <span className="text-gray-500">{new Date(acc.start_date_acct).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1 pt-2 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Gmail:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{acc.mdp_gmail_acct || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Carte:</span>
                        <span className="font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{acc.visa_acct || "—"}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => setSelectedAccount(acc)} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-2 rounded-lg text-xs font-bold transition">Profils</button>
                      <button onClick={() => setEditingAccount({...acc, start_date_acct: new Date(acc.start_date_acct).toISOString().split('T')[0]})} className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 py-2 rounded-lg text-xs font-bold transition">Éditer</button>
                      <button onClick={() => handleDeleteAccount(acc.id_acct)} className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 py-2 rounded-lg text-xs font-bold transition">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
      
      {/* MODALE D'AJOUT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ajouter un compte</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">{formError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Plateforme</label>
                  <select name="platform_acct" value={formData.platform_acct} onChange={handleChange} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none">
                    <option value="NETFLIX">Netflix</option>
                    <option value="PRIME">Prime Video</option>
                    <option value="CRUNCHYROLL">Crunchyroll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Prix d'achat (FCFA)</label>
                  <input type="number" required name="purchase_price_acct" value={formData.purchase_price_acct} onChange={handleChange} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" required name="email_acct" value={formData.email_acct} onChange={handleChange} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mot de passe</label>
                  <input type="text" required name="password_acct" value={formData.password_acct} onChange={handleChange} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none font-mono"/>
                </div>
                <div>
                  {/* MODIFIÉ ICI */}
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Date de début</label>
                  <input type="date" required name="start_date_acct" value={formData.start_date_acct} onChange={handleChange} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mdp Gmail (Optionnel)</label>
                  <input type="text" name="mdp_gmail_acct" value={formData.mdp_gmail_acct} onChange={handleChange} placeholder="Ex: Gmail123" className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none font-mono text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Carte bancaire (Optionnel)</label>
                  <input type="text" name="visa_acct" value={formData.visa_acct} onChange={handleChange} placeholder="Ex: 4500...1234" className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none font-mono text-sm"/>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold mt-4 transition">Enregistrer</button>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP : MODIFICATION DU COMPTE */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Modifier le compte</h3>
              <button onClick={() => setEditingAccount(null)} className="text-gray-400 hover:text-black text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Plateforme *</label>
                  <select required value={editingAccount.platform_acct} onChange={(e) => setEditingAccount({...editingAccount, platform_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none">
                    <option value="NETFLIX">Netflix</option>
                    <option value="PRIME">Prime Video</option>
                    <option value="CRUNCHYROLL">Crunchyroll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Prix d'achat</label>
                  <input type="number" required value={editingAccount.purchase_price_acct} onChange={(e) => setEditingAccount({...editingAccount, purchase_price_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" required value={editingAccount.email_acct} onChange={(e) => setEditingAccount({...editingAccount, email_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mot de passe *</label>
                  <input type="text" required value={editingAccount.password_acct} onChange={(e) => setEditingAccount({...editingAccount, password_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none font-mono"/>
                </div>
                <div>
                  {/* MODIFIÉ ICI */}
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Date de début *</label>
                  <input type="date" required value={editingAccount.start_date_acct} onChange={(e) => setEditingAccount({...editingAccount, start_date_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mdp Gmail</label>
                  <input type="text" value={editingAccount.mdp_gmail_acct || ''} onChange={(e) => setEditingAccount({...editingAccount, mdp_gmail_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none font-mono text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Carte bancaire</label>
                  <input type="text" value={editingAccount.visa_acct || ''} onChange={(e) => setEditingAccount({...editingAccount, visa_acct: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-2 outline-none font-mono text-sm"/>
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-bold transition">
                Sauvegarder les modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP : GESTION DES PROFILS */}
      {selectedAccount && (
        <AccountProfileModal 
          account={selectedAccount} 
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
};

export default Accounts;
