import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ClientDetailModal = ({ client, onClose, onUpdate }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [accounts, setAccounts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [editingSub, setEditingSub] = useState(null);
  
  // États pour l'affichage
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false); // NOUVEAU : Gère l'affichage du formulaire

  const [formData, setFormData] = useState({
    id_profil: '',
    duration_months_subs: '1',
    agreed_price_subs: '',
    amount_paid_subs: '',
    start_date_subs: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [client.id_clt]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subRes = await api.get('/subscriptions');
      const clientSubs = subRes.data.filter(s => s.id_clt === client.id_clt);
      setSubscriptions(clientSubs);

      const accRes = await api.get('/accounts');
      setAccounts(accRes.data);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
    setFormData({ ...formData, id_profil: '' }); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions', { ...formData, id_clt: client.id_clt });
      fetchData(); 
      
      setFormData({
        id_profil: '', duration_months_subs: '1', agreed_price_subs: '', amount_paid_subs: '', start_date_subs: new Date().toISOString().split('T')[0]
      });
      setSelectedAccountId('');
      setShowAddForm(false); // On referme le formulaire après succès
      
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Erreur lors de la création de l'abonnement");
    }
  };

  // --- NOUVELLES ACTIONS SUR LES ABONNEMENTS ---

  const handleDeleteSub = async (id_subs) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?")) {
      try {
        await api.delete(`/subscriptions/${id_subs}`);
        fetchData();
        if (onUpdate) onUpdate();
      } catch (error) {
        alert("Erreur lors de la suppression de l'abonnement.");
      }
    }
  };

  const handleCompletePayment = async (sub) => {
    const resteAPayer = sub.agreed_price_subs - sub.amount_paid_subs;
    if (window.confirm(`Le reste à payer est de ${resteAPayer} FCFA. Confirmer la réception de ce montant ?`)) {
      try {
        // Appelle la route PUT qu'on avait créée dans subscriptions.js
        await api.put(`/subscriptions/${sub.id_subs}/payment`, { added_amount: resteAPayer });
        fetchData();
        if (onUpdate) onUpdate();
      } catch (error) {
        alert("Erreur lors de la mise à jour du paiement.");
      }
    }
  };


  const handleUpdateSubSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/subscriptions/${editingSub.id_subs}`, {
        duration_months_subs: editingSub.duration_months_subs,
        agreed_price_subs: editingSub.agreed_price_subs,
        amount_paid_subs: editingSub.amount_paid_subs,
        start_date_subs: editingSub.start_date_subs
      });
      setEditingSub(null); // On ferme le mode édition
      fetchData(); // On rafraîchit la liste
      if (onUpdate) onUpdate();
    } catch (error) {
      alert("Erreur lors de la modification de l'abonnement");
    }
  };

  const selectedAccount = accounts.find(acc => acc.id_acct === selectedAccountId) || null;
  const availableProfiles = selectedAccount ? selectedAccount.Profiles : [];

return (
    // Suppression du padding sur mobile (p-0) pour que la fenêtre prenne tout l'écran comme une vraie app, et p-4 sur PC
    <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 md:p-4">
      {/* Modification clé ici : h-[90vh] sur mobile avec coins arrondis en haut, et max-h-[90vh] sur PC */}
      <div className="bg-white dark:bg-gray-800 w-full md:max-w-3xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-2xl md:rounded-2xl overflow-y-auto shadow-2xl animate-slideUp md:animate-fadeIn flex flex-col">
        
        {/* Le header devient "sticky" pour que le bouton Fermer soit toujours visible quand on scroll les abonnements */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-20 shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{client.name_clt}</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{client.whatsapp_number_clt}</p>
          </div>
          {/* Zone de clic agrandie pour le mobile (p-2) */}
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl leading-none transition">
            &times;
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto pb-24">
          {/* Section Historique ... */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Abonnements souscrits</h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              >
                {showAddForm ? "Annuler l'ajout" : "+ Nouvel Abonnement"}
              </button>
            </div>

            {loading ? <div className="animate-pulse text-gray-400">Chargement...</div> : (
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl text-center text-gray-500 dark:text-gray-400 italic">
                    Aucun abonnement pour le moment.
                  </div>
                ) : (
                subscriptions.map(sub => {
                    const resteAPayer = sub.agreed_price_subs - sub.amount_paid_subs;
                    
                    // SI ON EST EN MODE ÉDITION POUR CET ABONNEMENT : ON AFFICHE LE FORMULAIRE
                    if (editingSub && editingSub.id_subs === sub.id_subs) {
                      return (
                        <form key={sub.id_subs} onSubmit={handleUpdateSubSubmit} className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 shadow-sm p-4 rounded-xl flex flex-col gap-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-orange-800 dark:text-orange-200">Modification de l'abonnement</h4>
                            <button type="button" onClick={() => setEditingSub(null)} className="text-gray-500 dark:text-gray-400 hover:text-black text-sm font-bold">Annuler</button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Durée (mois)</label>
                              <input type="number" min="1" required className="w-full p-2 border rounded-lg text-sm outline-none" 
                                value={editingSub.duration_months_subs} 
                                onChange={(e) => setEditingSub({...editingSub, duration_months_subs: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date de début</label>
                              <input type="date" required className="w-full p-2 border rounded-lg text-sm outline-none" 
                                value={editingSub.start_date_subs} 
                                onChange={(e) => setEditingSub({...editingSub, start_date_subs: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Prix de vente</label>
                              <input type="number" required className="w-full p-2 border rounded-lg text-sm outline-none" 
                                value={editingSub.agreed_price_subs} 
                                onChange={(e) => setEditingSub({...editingSub, agreed_price_subs: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Montant payé</label>
                              <input type="number" required className="w-full p-2 border rounded-lg text-sm outline-none" 
                                value={editingSub.amount_paid_subs} 
                                onChange={(e) => setEditingSub({...editingSub, amount_paid_subs: e.target.value})} 
                              />
                            </div>
                          </div>
                          <button type="submit" className="w-full bg-orange-50 dark:bg-orange-900/300 hover:bg-orange-600 text-white py-2 rounded-lg font-bold transition mt-2">
                            Sauvegarder les modifications
                          </button>
                        </form>
                      );
                    }

                    // SINON, ON AFFICHE LA CARTE NORMALE DE L'ABONNEMENT
                    return (
                    <div key={sub.id_subs} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4 rounded-xl flex flex-col gap-3 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-50 dark:text-white text-lg">
                            {sub.Profiles?.Accounts?.platform_acct} <span className="text-gray-400 mx-1">|</span> <span className="text-blue-600">{sub.Profiles?.name_profil}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Valide du <span className="font-medium text-gray-700 dark:text-gray-200">{new Date(sub.start_date_subs).toLocaleDateString('fr-FR')}</span> au <span className="font-medium text-gray-700 dark:text-gray-200">{new Date(sub.end_date_subs).toLocaleDateString('fr-FR')}</span>
                          </p>
                        </div>
                        <div className="text-right">
                        {/* NOUVEAU : Conteneur flex pour aligner les badges côte à côte */}
                        <div className="flex justify-end gap-2 mb-1">
                            {/* NOUVEAU : Condition pour afficher "Terminé" si la date de fin est dépassée */}
                            {new Date(sub.end_date_subs) < new Date() && (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                Terminé
                            </span>
                            )}
                            
                            {/* ANCIEN BADGE (Intact, juste inséré dans le flex) */}
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block ${
                            sub.payment_status_subs === 'PAID' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 
                            sub.payment_status_subs === 'PARTIAL' ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                            }`}>
                            {sub.payment_status_subs === 'PAID' ? 'Payé' : sub.payment_status_subs === 'PARTIAL' ? 'Partiel' : 'Impayé'}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Prix : {sub.agreed_price_subs} FCFA</p>
                          {resteAPayer > 0 && <p className="text-xs font-bold text-red-500 dark:text-red-400 ">Reste : {resteAPayer} FCFA</p>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 dark:border-gray-700">
                        {resteAPayer > 0 && (
                          <button onClick={() => handleCompletePayment(sub)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold transition">
                            💸 Terminer paiement
                          </button>
                        )}
                        
                        {/* LE NOUVEAU BOUTON MODIFIER QUI ACTIVE LE FORMULAIRE */}
                        <button 
                          onClick={() => setEditingSub({
                            ...sub, 
                            start_date_subs: new Date(sub.start_date_subs).toISOString().split('T')[0] // Formate la date pour l'input type="date"
                          })} 
                          className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 px-3 py-1.5 rounded text-xs font-bold transition"
                        >
                          ✏️ Modifier
                        </button>
                        
                        <button onClick={() => handleDeleteSub(sub.id_subs)} className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold transition ml-auto">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  )})
                )}
              </div>
            )}
          </section>

          {/* Section Nouveau (Cachée par défaut) */}
          {showAddForm && (
            <section className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner mt-6 animate-fadeIn">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">Configurer l'abonnement</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">1. Compte Parent</label>
                  <select required className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-gray-800" value={selectedAccountId} onChange={handleAccountChange}>
                    <option value="">Sélectionnez un compte...</option>
                    {accounts.map(acc => (
                      <option key={acc.id_acct} value={acc.id_acct}>{acc.platform_acct} - {acc.email_acct}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">2. Profil / Écran</label>
                  <select required className="w-full border rounded-lg p-2 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:disabled:border-gray-700 transition-colors duration-300" value={formData.id_profil} onChange={(e) => setFormData({...formData, id_profil: e.target.value})} disabled={!selectedAccountId}>
                    <option value="">{selectedAccountId ? "Sélectionnez un profil..." : "Choisissez d'abord un compte"}</option>
                    {availableProfiles.map(p => (
                      <option key={p.id_profil} value={p.id_profil}>{p.name_profil} {p.pin_code_profil ? `(PIN: ${p.pin_code_profil})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Durée (mois)</label>
                  <input type="number" min="1" required className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.duration_months_subs} onChange={(e) => setFormData({...formData, duration_months_subs: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date de début</label>
                  <input type="date" required className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.start_date_subs} onChange={(e) => setFormData({...formData, start_date_subs: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prix de vente (FCFA)</label>
                  <input type="number" required placeholder="Ex: 3500" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.agreed_price_subs} onChange={(e) => setFormData({...formData, agreed_price_subs: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Montant payé (FCFA)</label>
                  <input type="number" required placeholder="Ex: 2000" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.amount_paid_subs} onChange={(e) => setFormData({...formData, amount_paid_subs: e.target.value})} />
                </div>

                <button type="submit" className="md:col-span-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-sm">
                  Valider l'abonnement
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;