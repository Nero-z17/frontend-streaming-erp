import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import * as XLSX from 'xlsx';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Séparation stricte des états pour des boutons indépendants
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);

  // Récupération classique : le backend filtre déjà pour l'admin connecté
  const fetchAllData = async () => {
    const [clientsRes, accountsRes, expensesRes, subsRes] = await Promise.all([
      api.get('/clients'),
      api.get('/accounts'),
      api.get('/expenses'),
      api.get('/subscriptions')
    ]);

    return {
      clients: clientsRes.data,
      accounts: accountsRes.data,
      expenses: expensesRes.data,
      subscriptions: subsRes.data
    };
  };

  const handleExportJSON = async () => {
    try {
      setIsExportingJSON(true);
      const data = await fetchAllData(); 
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      // On peut ajouter l'heure pour différencier facilement les fichiers
      link.download = `Backup_Nero_ERP_Admin_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Erreur lors de l'exportation JSON");
      console.error(error);
    } finally {
      setIsExportingJSON(false);
    }
  };

    const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const data = await fetchAllData();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // --- FONCTION DE CLASSEMENT PLATEFORME ---
      const getPlatformRank = (platform) => {
        const p = (platform || '').toUpperCase();
        if (p.includes('CRUNCHYROLL')) return 1;
        if (p.includes('PRIME')) return 2;
        if (p.includes('NETFLIX')) return 3;
        return 4; // Autres plateformes à la fin
      };

      // --- FONCTION DE CLASSEMENT STATUT ABONNEMENT ---
      const getStatusRank = (status) => {
        if (status === 'En cours') return 1;
        if (status === 'À venir') return 2;
        if (status === 'Terminé') return 3;
        return 4;
      };

      // ==========================================
      // 1. ABONNEMENTS (Subscription)
      // ==========================================
      let subsDataRaw = data.subscriptions.map(s => {
        // Sécurisation (selon que Prisma renvoie les includes avec majuscule ou minuscule)
        const client = s.client || s.Clients || {};
        const profile = s.profile || s.Profiles || {};
        const account = profile.account || profile.Accounts || {};

        const endDate = new Date(s.end_date_subs);
        const startDate = new Date(s.start_date_subs);
        
        let statutAbo = "En cours";
        if (endDate < today) statutAbo = "Terminé";
        else if (startDate > today) statutAbo = "À venir";

        const resteAPayer = s.agreed_price_subs - s.amount_paid_subs;
        const platformName = account.platform_acct || 'INCONNU';
        const accountEmail = account.email_acct || 'INCONNU';

        return {
          _rawEndDate: endDate.getTime(), // Donnée invisible pour un tri parfait
          _rawClientName: client.name_clt || 'Inconnu',
          
          'Plateforme': platformName,
          'Compte Parent': accountEmail, 
          'Écran': profile.name_profil || '-',
          'Mot de passe profil': profile.pin_code_profil || '-', 
          'Client': client.name_clt || 'Inconnu',
          'Numéro du client': client.whatsapp_number_clt || '-', 
          'Date de création client': client.created_date_clt ? new Date(client.created_date_clt).toLocaleDateString('fr-FR') : '-', 
          'Statut Abonnement': statutAbo,
          'Date Début': !isNaN(startDate) ? startDate.toLocaleDateString('fr-FR') : '-',
          'Date Fin': !isNaN(endDate) ? endDate.toLocaleDateString('fr-FR') : '-',
          'Prix Vendu (FCFA)': s.agreed_price_subs,
          'Montant Payé (FCFA)': s.amount_paid_subs,
          'Reste à Payer': resteAPayer > 0 ? resteAPayer : 0,
          'Statut Paiement': s.payment_status_subs === 'PAID' ? 'Payé' : s.payment_status_subs === 'PARTIAL' ? 'Partiel' : 'Impayé',
        };
      });

      // Tri multicritères absolu (Plateforme > Compte > Statut > Écran > Date Fin > Client)
      subsDataRaw.sort((a, b) => {
        const rankA = getPlatformRank(a['Plateforme']);
        const rankB = getPlatformRank(b['Plateforme']);
        if (rankA !== rankB) return rankA - rankB;

        const emailCmp = a['Compte Parent'].localeCompare(b['Compte Parent']);
        if (emailCmp !== 0) return emailCmp;

        const statA = getStatusRank(a['Statut Abonnement']);
        const statB = getStatusRank(b['Statut Abonnement']);
        if (statA !== statB) return statA - statB;

        const profCmp = a['Écran'].localeCompare(b['Écran']);
        if (profCmp !== 0) return profCmp;

        if (a._rawEndDate !== b._rawEndDate) return a._rawEndDate - b._rawEndDate;

        return a._rawClientName.localeCompare(b._rawClientName);
      });

      // Nettoyage des clés privées (_raw) avant export Excel
      let subsData = subsDataRaw.map(item => {
        const { _rawEndDate, _rawClientName, ...rest } = item;
        return rest;
      });


      // ==========================================
      // 2. COMPTES FOURNISSEURS
      // ==========================================
      let accountsDataRaw = data.accounts.map(a => {
        // CORRECTION "Invalid Date" : Calcul automatique du prochain renouvellement
        let renewalDateObj = new Date(a.start_date_acct);
        if (!isNaN(renewalDateObj.getTime())) {
          while (renewalDateObj < today) {
            renewalDateObj.setMonth(renewalDateObj.getMonth() + 1); // Ajoute un mois jusqu'au cycle actuel
          }
        }

        return {
          _rawPlatformRank: getPlatformRank(a.platform_acct),
          _rawRenewal: renewalDateObj.getTime() || 0,
          
          'Plateforme': a.platform_acct,
          'Email': a.email_acct,
          'Mot de passe': a.password_acct,
          'Mot de passe Gmail': a.mdp_gmail_acct || '-', 
          'Carte Visa': a.visa_acct || '-',           
          'Prix d\'achat (FCFA)': a.purchase_price_acct,
          'Renouvellement': !isNaN(renewalDateObj.getTime()) ? renewalDateObj.toLocaleDateString('fr-FR') : '-'
        };
      });
      
      // Tri: Plateforme (Crunchyroll > Prime > Netflix) puis Date de renouvellement
      accountsDataRaw.sort((a, b) => {
        if (a._rawPlatformRank !== b._rawPlatformRank) return a._rawPlatformRank - b._rawPlatformRank;
        return a._rawRenewal - b._rawRenewal;
      });

      let accountsData = accountsDataRaw.map(item => {
        const { _rawPlatformRank, _rawRenewal, ...rest } = item;
        return rest;
      });


      // ==========================================
      // 3. DÉPENSES
      // ==========================================
      // Le tri avec (Date A - Date B) classe mathématiquement par Mois PUIS par jour exact
      let sortedExpenses = [...data.expenses].sort((a, b) => new Date(a.date_exp) - new Date(b.date_exp));
      
      let expensesData = sortedExpenses.map(e => {
        const date = new Date(e.date_exp);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const formattedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1); 

        return {
          'Mois': formattedMonth, 
          'Date Exacte': date.toLocaleDateString('fr-FR'),
          'Catégorie': e.category_exp,
          'Description': e.description_exp || '-',
          'Montant (FCFA)': e.amount_exp
        };
      });


      // ==========================================
      // GÉNÉRATION EXCEL FINALE
      // ==========================================
      const wb = XLSX.utils.book_new();
      
      // Ajout des feuilles (Annuaire client supprimé)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subsData), "Subscription");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(accountsData), "Comptes Fournisseurs");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), "Dépenses");

      XLSX.writeFile(wb, `Rapport_Gestion_Nero_ERP_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`);

    } catch (error) {
      alert("Erreur lors de la génération du fichier Excel");
      console.error(error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-24 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm border-3 border-blue-500 bg-white dark:bg-gray-800 p-4 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paramètres</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez vos préférences et vos données</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
          Interface et Affichage
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <span className="block font-medium text-gray-700 dark:text-gray-200">Mode Sombre</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Activer l'ambiance cinéma sur l'application</span>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 cursor-pointer ${
              theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="bg-white dark:bg-gray-800 w-5 h-5 rounded-full shadow-md transform duration-300" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          Exportation & Sauvegarde
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Téléchargez vos données personnelles. Le format Excel intègre tout votre historique classé par statut. Le format JSON sert de sauvegarde système de votre compte.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportExcel}
            disabled={isExportingExcel || isExportingJSON}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <span className="text-xl">📊</span>
            {isExportingExcel ? 'Génération...' : 'Exporter en Excel'}
          </button>
          
          <button 
            onClick={handleExportJSON}
            disabled={isExportingJSON || isExportingExcel}
            className="flex-1 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm border border-gray-700"
          >
            <span className="text-xl">💾</span>
            {isExportingJSON ? 'Sauvegarde...' : 'Sauvegarde JSON'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
