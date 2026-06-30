import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useClients } from '../hooks/UseClients';
import ClientDetailModal from '../components/clients/ClientDetailModal';
import ClientRow from '../components/clients/ClientRow';
import ClientCard from '../components/clients/ClientCard';
import logoN from '../assets/netflix.webp'; 
import logoP from '../assets/prime.avif';
import logoC from '../assets/crunchyrool.png';

const Clients = () => {
  const { clients, loading, error, refreshClients, addClient } = useClients();
  const [subscriptions, setSubscriptions] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions');
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Erreur subs", err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [clients]);

  const handleDeleteClient = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      refreshClients();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSubmitNewClient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addClient({ name_clt: name, whatsapp_number_clt: whatsapp, note_clt: note });
    setIsSubmitting(false);
    if (result.success) {
      setName(''); setWhatsapp(''); setNote('');
      setIsAddModalOpen(false);
    } else {
      alert(result.error);
    }
  };

  const handleUpdateClientSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clients/${editingClient.id_clt}`, {
        name_clt: editingClient.name_clt,
        whatsapp_number_clt: editingClient.whatsapp_number_clt,
        note_clt: editingClient.note_clt
      });
      setEditingClient(null); 
      refreshClients(); 
      fetchSubscriptions(); 
    } catch (error) {
      alert("Erreur lors de la modification du client");
    }
  };

  // --- FILTRAGE DE RECHERCHE OPTIMISÉ (Espaces ignorés pour les numéros) ---
  const lowerSearch = searchTerm.toLowerCase();
  const cleanSearchTerm = searchTerm.replace(/\s+/g, '').toLowerCase(); // Retire tous les espaces de la recherche
  
  const filteredSubs = subscriptions.filter(sub => {
    if(!searchTerm) return true;
    const clientName = (sub.Clients?.name_clt || '').toLowerCase();
    const clientPhone = (sub.Clients?.whatsapp_number_clt || '').replace(/\s+/g, ''); // Retire les espaces du numéro DB
    
    return clientName.includes(lowerSearch) || clientPhone.includes(cleanSearchTerm);
  });

  const filteredClientsWithoutSub = clients.filter(c => {
    if(!searchTerm) return true;
    const clientName = (c.name_clt || '').toLowerCase();
    const clientPhone = (c.whatsapp_number_clt || '').replace(/\s+/g, '');
    
    return clientName.includes(lowerSearch) || clientPhone.includes(cleanSearchTerm);
  });

  // --- NOUVELLE LOGIQUE DE GROUPEMENT : Plateforme -> Compte -> Profil ---
  const groupedData = {};
  const clientsWithoutSub = [...filteredClientsWithoutSub];

  filteredSubs.forEach(sub => {
    if (!sub.Profiles || !sub.Profiles.Accounts || !sub.Clients) return;
    const platform = sub.Profiles.Accounts.platform_acct;
    const accountEmail = sub.Profiles.Accounts.email_acct;
    const profileName = sub.Profiles.name_profil || "Profil Inconnu";
    
    // Initialisation des niveaux d'imbrication
    if (!groupedData[platform]) groupedData[platform] = {};
    if (!groupedData[platform][accountEmail]) groupedData[platform][accountEmail] = {};
    if (!groupedData[platform][accountEmail][profileName]) groupedData[platform][accountEmail][profileName] = [];
    
    // Ajout du client dans le bon profil
    groupedData[platform][accountEmail][profileName].push(sub);
    
    const index = clientsWithoutSub.findIndex(c => c.id_clt === sub.id_clt);
    if (index > -1) clientsWithoutSub.splice(index, 1);
  });

  const platformLogos = { 'NETFLIX': logoN, 'PRIME': logoP, 'CRUNCHYROLL': logoC };
  const getClientStatus = (clientId) => {
      const clientSubs = subscriptions.filter(s => s.id_clt === clientId);
      if (clientSubs.length === 0) return "Aucun";
      const hasOngoing = clientSubs.some(s => new Date(s.end_date_subs) >= new Date());
      return hasOngoing ? "En cours" : "Terminé";
  };

  return (
    <div className="p-4 md:p-6 space-y-6 relative">
      {/* Header et Recherche (Intacts selon ta demande) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-3 border-blue-500 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm hidden md:block">Organisés par plateformes, comptes et écrans</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Rechercher (nom, numéro)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <span className="absolute left-3 top-[11px] text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.603Z" />
              </svg>
            </span>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="hidden md:block bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg font-bold transition shadow-md whitespace-nowrap"
          >
            + Nouveau Client
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500 text-center py-10">Chargement...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center text-gray-400 border border-gray-100 dark:border-gray-700">
          Aucun client enregistré.
        </div>
      ) : (
        <div className="space-y-8">
          {/* NOUVEL AFFICHAGE IMBRIQUÉ */}
          {Object.entries(groupedData).map(([platform, accounts]) => (
            <div key={platform} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              
              {/* Niveau 1 : Plateforme */}
              <div className="bg-blue-500 dark:bg-gray-800 p-3 flex items-center gap-3 border-b border-blue-600 dark:border-gray-700">
                {platformLogos[platform] && <img src={platformLogos[platform]} alt={platform} className="w-8 h-8 md:w-12 md:h-12 object-contain" />}
                <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">{platform}</h2>
              </div>
              
              <div className="flex flex-col">
                {Object.entries(accounts).map(([accountEmail, profiles]) => (
                  <div key={accountEmail} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    
                    {/* Niveau 2 : Compte */}
                    <div className="bg-gray-100 dark:bg-gray-700/60 px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 shadow-inner">
                      <span className="text-gray-500 dark:text-gray-400 font-sans text-xs uppercase tracking-wider mr-2">Compte :</span>
                      <span className="font-bold">{accountEmail}</span>
                    </div>

                    {/* Niveau 3 : Profils (Écrans) */}
                    <div className="p-3 md:p-5 bg-gray-50/50 dark:bg-gray-900/30 space-y-6">
                      {Object.entries(profiles).map(([profileName, subs]) => (
                        <div key={profileName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                          
                          {/* En-tête du Profil */}
                          <div className="bg-indigo-50/80 dark:bg-indigo-900/20 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                              <span className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Écran : {profileName}</span>
                            </div>
                            <span className="bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[11px] font-bold">
                              {subs.length} client{subs.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* AFFICHAGE DESKTOP */}
                          <div className="hidden md:block">
                            <table className="w-full text-left table-fixed">
                              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                  <th className="px-4 py-3 font-medium w-[15%]">Écran</th>
                                  <th className="px-4 py-3 font-medium w-[20%]">Client</th>
                                  <th className="px-4 py-3 font-medium w-[20%]">WhatsApp</th>
                                  <th className="px-4 py-3 font-medium w-[15%]">Note</th>
                                  <th className="px-4 py-3 font-medium w-[15%]">Statut</th>
                                  <th className="px-4 py-3 text-right font-medium w-[15%]">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subs.map(sub => (
                                  <ClientRow 
                                    key={sub.id_subs} client={sub.Clients} sub={sub} statusAbo={getClientStatus(sub.Clients.id_clt)} 
                                    onOpenDetails={(c) => { setSelectedClient(c); setIsDetailModalOpen(true); }}
                                    onEdit={(c) => setEditingClient(c)} onDelete={handleDeleteClient}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* AFFICHAGE MOBILE */}
                          <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/20">
                            {subs.map(sub => (
                                <ClientCard 
                                  key={sub.id_subs} client={sub.Clients} sub={sub} statusAbo={getClientStatus(sub.Clients.id_clt)}
                                  onOpenDetails={(c) => { setSelectedClient(c); setIsDetailModalOpen(true); }}
                                  onEdit={(c) => setEditingClient(c)} onDelete={handleDeleteClient}
                                />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* SECTION "SANS ABONNEMENT" INTACTE */}
          {clientsWithoutSub.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 overflow-hidden">
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 border-b border-orange-100 dark:border-orange-900/50">
                <h2 className="text-base md:text-lg font-bold text-orange-800 dark:text-orange-200">En attente (Sans abonnement)</h2>
              </div>
              
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <tbody>
                    {clientsWithoutSub.map(client => (
                      <ClientRow key={client.id_clt} client={client} statusAbo="Aucun" onOpenDetails={(c) => { setSelectedClient(c); setIsDetailModalOpen(true); }} onEdit={(c) => setEditingClient(c)} onDelete={handleDeleteClient}/>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/20">
                 {clientsWithoutSub.map(client => (
                    <ClientCard key={client.id_clt} client={client} statusAbo="Aucun" onOpenDetails={(c) => { setSelectedClient(c); setIsDetailModalOpen(true); }} onEdit={(c) => setEditingClient(c)} onDelete={handleDeleteClient}/>
                 ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOUTON FLOTTANT MOBILE (FAB) */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="md:hidden fixed bottom-24 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition z-40"
      >
        <span className="text-3xl font-light mb-1">+</span>
      </button>

      {/* MODALS INTACTS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ajouter un client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmitNewClient} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nom / Pseudo *</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-3 outline-none dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">WhatsApp *</label><input type="text" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+237..." className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-3 outline-none dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Note privée</label><textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-3 h-20 outline-none resize-none dark:text-white" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-2">Créer le client</button>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={() => setIsDetailModalOpen(false)} onUpdate={() => { fetchSubscriptions(); refreshClients(); }} />
      )}

      {editingClient && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Modifier le client</h3>
              <button onClick={() => setEditingClient(null)} className="text-gray-400 hover:text-black dark:hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdateClientSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nom *</label><input type="text" required value={editingClient.name_clt} onChange={(e) => setEditingClient({...editingClient, name_clt: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-3 outline-none dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">WhatsApp *</label><input type="text" required value={editingClient.whatsapp_number_clt} onChange={(e) => setEditingClient({...editingClient, whatsapp_number_clt: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-3 outline-none dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Note</label><textarea value={editingClient.note_clt || ''} onChange={(e) => setEditingClient({...editingClient, note_clt: e.target.value})} className="w-full border dark:border-gray-600 bg-transparent rounded-lg p-3 h-20 outline-none resize-none dark:text-white" /></div>
              <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold mt-2">Sauvegarder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;

