import { useState, useEffect } from 'react';
import api from '../services/api';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    currentMonth: { revenue: 0, expenses: 0, profit: 0 },
    evolution: [],
    globalRevenue: 0,
    globalExpenses: 0,
    globalProfit: 0,
    activeClientsCount: 0
  }); 
  const [expiringSubs, setExpiringSubs] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current'); 

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const summaryRes = await api.get('/dashboard/monthly'); 
      const [subsRes, accountsRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/accounts') 
      ]);

      const subscriptions = subsRes.data || [];
      const accounts = accountsRes.data || []; // On exploite enfin cette donnée !

      // --- 1. SÉCURISATION ET ENRICHISSEMENT DES STATS FINANCIÈRES ---
      // On copie l'historique du backend pour pouvoir y ajouter le prix des comptes
      let evolutionData = Array.isArray(summaryRes.data) 
        ? JSON.parse(JSON.stringify(summaryRes.data)) 
        : JSON.parse(JSON.stringify(summaryRes.data?.evolution || []));

      // NOUVEAU : INJECTION DES DÉPENSES DES COMPTES (Achat fournisseurs)
      accounts.forEach(acc => {
        if (acc.renewal_date_acct && acc.purchase_price_acct) {
          // On recule d'un mois par rapport à la date de renouvellement pour cibler le mois exact de l'achat
          const rDate = new Date(acc.renewal_date_acct);
          rDate.setMonth(rDate.getMonth() - 1);
          const monthKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`;

          let monthData = evolutionData.find(m => m.name === monthKey);
          
          if (monthData) {
            // Le mois existe : on ajoute le coût du compte aux dépenses et on ajuste le bénéfice net
            monthData.expenses += Number(acc.purchase_price_acct);
            monthData.profit = monthData.revenue - monthData.expenses;
          } else {
            // Le mois n'existe pas encore dans les données, on le crée
            evolutionData.push({
              name: monthKey,
              revenue: 0,
              expenses: Number(acc.purchase_price_acct),
              profit: -Number(acc.purchase_price_acct)
            });
          }
        }
      });

      // On s'assure que le graphique reste bien trié chronologiquement
      evolutionData.sort((a, b) => a.name.localeCompare(b.name));

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      // On recalcule le mois en cours APRES avoir ajouté le prix des comptes
      const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // On cherche précisément le mois actuel. S'il n'y a ni vente ni dépense ce mois-ci, 
      // on renvoie un mois vide pour ne pas afficher accidentellement un mois du futur !
      const currentMonthData = evolutionData.find(m => m.name === currentMonthKey)
        || { name: currentMonthKey, revenue: 0, expenses: 0, profit: 0 };


      // On recalcule les totaux globaux avec ces NOUVELLES données (Dépenses backend + Comptes)
      const globalRevenue = evolutionData.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
      const globalExpenses = evolutionData.reduce((acc, curr) => acc + (Number(curr.expenses) || 0), 0);
      const globalProfit = evolutionData.reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);


      // --- 2. DÉFINIR UN ABONNEMENT "EN COURS" (ACTIF) ---
      // On filtre pour ne garder QUE les abonnements qui ne sont pas encore expirés
      const activeSubscriptions = subscriptions.filter(sub => {
        if (!sub.end_date_subs) return false;
        const endDate = new Date(sub.end_date_subs);
        endDate.setHours(0, 0, 0, 0); 
        return endDate >= today;
      });
      // --- 3. VRAI CALCUL DES CLIENTS ACTIFS ---
      // On extrait les clients uniques qui ont au moins 1 abonnement en cours
      const uniqueClients = new Set(
        activeSubscriptions.map(sub => sub.Clients?.id_clt || sub.Clients?.name_clt).filter(Boolean)
      );
      // On FORCE l'utilisation de ce calcul pour écraser le fameux "2" du backend
      const computedActiveClients = uniqueClients.size;

      // --- 4. STATS SUR LE NOMBRE DE CLIENTS PAR PLATEFORME ---
      const platforms = ['NETFLIX', 'PRIME', 'CRUNCHYROLL'];
      const occData = platforms.map(plat => {
        // On compte combien d'abonnements actifs correspondent à cette plateforme
        const platformActiveSubs = activeSubscriptions.filter(sub => {
          // On vérifie tous les chemins possibles où la plateforme a pu être renseignée
          const platformName = sub.Profiles?.Accounts?.platform_acct || sub.Accounts?.platform_acct || sub.platform_acct || 'INCONNU';
          return platformName === plat;
        });

        return { 
          platform: plat, 
          used: platformActiveSubs.length, // Nombre de clients avec abonnement en cours
          total: null // On met le total à null car on ne gère plus la capacité des profils
        };
      });

      // --- 5. FILTRAGE DES ABONNEMENTS EXPIRANTS (Sous 7 jours) ---
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const expiring = activeSubscriptions.filter(sub => {
        const endDate = new Date(sub.end_date_subs);
        endDate.setHours(0, 0, 0, 0); 
        return endDate >= today && endDate <= nextWeek;
      });

      // --- SAUVEGARDE FINALE ---
      setStats({
        currentMonth: currentMonthData,
        evolution: evolutionData,
        globalRevenue,
        globalExpenses,
        globalProfit,
        activeClientsCount: computedActiveClients // Le vrai chiffre est injecté ici !
      }); 
      
      setExpiringSubs(expiring);
      setOccupancy(occData);
      setError(null);

    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { 
    stats, 
    expiringSubs, 
    occupancy, 
    loading, 
    error, 
    selectedPeriod, 
    setSelectedPeriod 
  };
};