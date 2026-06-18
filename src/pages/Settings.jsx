import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import * as XLSX from 'xlsx';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

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
      setIsExporting(true);
      const data = await fetchAllData();
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Backup_Nero_ERP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Erreur lors de l'exportation JSON");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const data = await fetchAllData();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // --- 1. ABONNEMENTS ---
      let subsData = data.subscriptions.map(s => {
        const endDate = new Date(s.end_date_subs);
        const startDate = new Date(s.start_date_subs);
        
        let statutAbo = "En cours";
        if (endDate < today) statutAbo = "Terminé";
        else if (startDate > today) statutAbo = "À venir";

        const resteAPayer = s.agreed_price_subs - s.amount_paid_subs;
        const platformName = s.Profiles?.Accounts?.platform_acct || 'INCONNU';
        const accountEmail = s.Profiles?.Accounts?.email_acct || 'INCONNU';

        return {
          'Plateforme': platformName,
          'Compte Parent': accountEmail, 
          'Écran': s.Profiles?.name_profil || '-',
          'Client': s.Clients?.name_clt || 'Inconnu',
          'Statut Abonnement': statutAbo,
          'Date Début': startDate.toLocaleDateString('fr-FR'),
          'Date Fin': endDate.toLocaleDateString('fr-FR'),
          'Prix Vendu (FCFA)': s.agreed_price_subs,
          'Montant Payé (FCFA)': s.amount_paid_subs,
          'Reste à Payer': resteAPayer > 0 ? resteAPayer : 0,
          'Statut Paiement': s.payment_status_subs === 'PAID' ? 'Payé' : s.payment_status_subs === 'PARTIAL' ? 'Partiel' : 'Impayé',
        };
      });

      subsData.sort((a, b) => {
        if (a['Plateforme'] !== b['Plateforme']) return a['Plateforme'].localeCompare(b['Plateforme']);
        return a['Compte Parent'].localeCompare(b['Compte Parent']);
      });

      // --- 2. COMPTES FOURNISSEURS ---
      let accountsData = data.accounts.map(a => ({
        'Plateforme': a.platform_acct,
        'Email': a.email_acct,
        'Mot de passe': a.password_acct,
        'Mot de passe Gmail': a.mdp_gmail_acct || '-', 
        'Carte Visa': a.visa_acct || '-',           
        'Prix d\'achat (FCFA)': a.purchase_price_acct,
        'Renouvellement': new Date(a.renewal_date_acct).toLocaleDateString('fr-FR')
      }));
      
      accountsData.sort((a, b) => a['Plateforme'].localeCompare(b['Plateforme']));

      // --- 3. DÉPENSES ---
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

      // --- 4. CLIENTS ---
      let clientsData = data.clients.map(c => ({
        'Nom / Pseudo': c.name_clt,
        'WhatsApp': c.whatsapp_number_clt,
        'Note': c.note_clt || '-',
        'Date Création': new Date(c.created_date_clt).toLocaleDateString('fr-FR')
      }));
      clientsData.sort((a, b) => a['Nom / Pseudo'].localeCompare(b['Nom / Pseudo']));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subsData), "Tous les Abonnements");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(accountsData), "Comptes Fournisseurs");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), "Dépenses");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientsData), "Annuaire Clients");

      XLSX.writeFile(wb, `Rapport_Gestion_Nero_ERP_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`);

    } catch (error) {
      alert("Erreur lors de la génération du fichier Excel");
      console.error(error);
    } finally {
      setIsExporting(false);
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
          Téléchargez l'intégralité de votre base de données. Le format Excel intègre tout votre historique classé par statut. Le format JSON sert de sauvegarde systeme.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <span className="text-xl">📊</span>
            {isExporting ? 'Génération...' : 'Exporter en Excel'}
          </button>
          
          <button 
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex-1 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm border border-gray-700"
          >
            <span className="text-xl">💾</span>
            {isExporting ? 'Sauvegarde...' : 'Sauvegarde JSON'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;