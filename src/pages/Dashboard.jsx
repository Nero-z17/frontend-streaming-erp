import React from 'react';
import { useDashboard } from '../hooks/UseDashboard';
import StatCard from '../components/dashboard/StatCard';
import ProfileOccupancy from '../components/dashboard/ProfileOccupancy';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { stats, expiringSubs, occupancy, loading, error, selectedPeriod, setSelectedPeriod } = useDashboard();

  const handleWhatsAppRelance = (client, platform, endDate) => {
    const cleanNumber = client.whatsapp_number_clt.replace(/\D/g, '');
    const dateFin = new Date(endDate).toLocaleDateString('fr-FR');
    const message = `Bonjour ${client.name_clt} 👋,\n\nSauf erreur de notre part, votre abonnement *${platform}* arrive à expiration le *${dateFin}*.\n\nSouhaitez-vous le renouveler pour éviter toute coupure ? 🍿`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400 animate-pulse">Chargement de votre tableau de bord...</div>;
  if (error) return <div className="p-6 text-red-500 dark:text-red-400  bg-red-50 rounded-xl">{error}</div>;

  // --- LOGIQUE DU SÉLECTEUR DE MOIS ---
  let displayedStats = { revenue: 0, expenses: 0, profit: 0 };
  let periodLabel = "";

  if (selectedPeriod === 'global') {
    displayedStats = { 
      revenue: stats?.globalRevenue || 0, 
      expenses: stats?.globalExpenses || 0, 
      profit: stats?.globalProfit || 0 
    };
    periodLabel = "Total Global";
  } else if (selectedPeriod === 'current') {
    displayedStats = stats?.currentMonth || { revenue: 0, expenses: 0, profit: 0 };
    periodLabel = "Mois en cours";
  } else {
    // On cherche le mois sélectionné dans l'historique (stats.evolution)
    displayedStats = stats?.evolution?.find(m => m.name === selectedPeriod) || { revenue: 0, expenses: 0, profit: 0 };
    periodLabel = `Mois : ${selectedPeriod}`;
  }

  return (
    <div className="p-6 space-y-8">
      
      {/* HEADER AVEC LE SÉLECTEUR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-3 border-blue-500 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Vue d'ensemble</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Vos performances financières et actions requises</p>
        </div>
        
        {/* LE SÉLECTEUR DE PÉRIODE */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Période :</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium cursor-pointer shadow-sm w-full md:w-48"
          >
            <option value="current">Mois en cours</option>
            <option value="global">Vue Globale (Depuis le début)</option>
            <optgroup label="Historique mensuel">
              {/* On génère les options dynamiquement à partir des mois où il y a eu de l'activité */}
              {stats?.evolution?.map((month) => (
                <option key={month.name} value={month.name}>{month.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* SECTION 1 : KPIs Financiers (Dynamiques selon le sélecteur) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Chiffre d'Affaires" 
          value={`${(displayedStats.revenue || 0).toLocaleString()} FCFA`} 
          subtext={periodLabel}
        />
        <StatCard 
          title="Dépenses"
          value={`${(displayedStats.expenses || 0).toLocaleString()} FCFA`} 
          subtext={periodLabel}
        />
        <StatCard 
          title="Bénéfice Net" 
          value={`${(displayedStats.profit || 0).toLocaleString()} FCFA`} 
          subtext={periodLabel}
        />
        <StatCard 
          title="Clients Actifs" 
          value={stats?.activeClientsCount || 0} 
          subtext="Au total" 
        />
      </div>

      {/* SECTION 2 : Graphique d'évolution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100  dark:border-gray-700">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-6">Évolution du Bénéfice Net</h2>
        <ResponsiveContainer width="99%" height={300}>
          <AreaChart data={stats?.evolution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}F`} />
            <Tooltip 
              formatter={(value) => [`${value} FCFA, 'Bénéfice'`]}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 3 & 4 : Taux d'occupation et Alertes (Identique à avant) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-6">Taux d'occupation</h2>
          {occupancy.length > 0 ? (
            occupancy.map(occ => (
              <ProfileOccupancy 
                key={occ.platform} 
                platform={occ.platform} 
                used={occ.used} 
                total={occ.total} 
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm italic">Aucune donnée d'occupation.</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-orange-100 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/20 flex justify-between items-center rounded-t-xl">
            {/* Titre responsive : on masque "sous 7 jours" sur mobile pour gagner de la place */}
            <h2 className="font-bold text-sm md:text-base text-orange-800 dark:text-orange-200">
              Abonnements expirant
              <span className="hidden md:inline"> sous 7 jours</span>
            </h2>
            
            {/* Badge compact */}
            <span className="bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
              {expiringSubs.length} urgence{expiringSubs.length > 1 ? 's' : ''}
            </span>
          </div>
          
          {expiringSubs.length > 0 ? (
            <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white dark:bg-gray-800 text-xs text-gray-400 uppercase border-b border-gray-100  dark:border-gray-700">
                  <tr>
                    <th className="p-4 font-medium">Client</th>
                    <th className="p-4 font-medium">Plateforme</th>
                    <th className="p-4 font-medium">Date de fin</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {expiringSubs.map(sub => {
                    const platformName = sub.Profiles?.Accounts?.platform_acct || 'Service';
                    return (
                      <tr key={sub.id_subs} className="hover:bg-orange-50 dark:hover:bg-orange-900/50 dark:bg-orange-900/30/50 transition">
                        <td className="p-4 font-medium text-gray-900 dark:text-gray-50 ">{sub.Clients?.name_clt || 'Inconnu'}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-bold">{platformName}</td>
                        <td className="p-4 text-sm text-red-500 dark:text-red-400  font-bold">
                          {new Date(sub.end_date_subs).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleWhatsAppRelance(sub.Clients, platformName, sub.end_date_subs)}
                            className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition"
                          >
                            📱 Relancer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="md:hidden space-y-3">
              {expiringSubs.map((sub, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{sub.Clients?.name_clt || 'Inconnu'}</p>
                    <p className="text-xs text-gray-500">{sub.Profiles?.Accounts?.platform_acct || 'Service'} • <span className="text-red-500 font-bold">{new Date(sub.end_date_subs).toLocaleDateString()}</span></p>
                  </div>
                    <button 
                      onClick={() => handleWhatsAppRelance(sub.Clients, sub.Profiles?.Accounts?.platform_acct, sub.end_date_subs)}
                      className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition"
                    >
                      📱 Relancer
                    </button>
                </div>
              ))}
            </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-400 italic">
              Aucun abonnement n'arrive à expiration dans les 7 prochains jours. Respirez !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;