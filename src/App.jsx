import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Layout from './components/common/Layout'; // Ton layout

// Pages (Tu devras créer ces fichiers dans src/pages/)
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Accounts from './pages/Accounts';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';

// Dans src/App.jsx, trouve cette fonction et remplace-la :
const PrivateRoute = ({ children }) => {
  const { user, loadingAuth } = useContext(AuthContext);

  // Tant qu'on vérifie le token, on affiche un écran de chargement au lieu de rediriger
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-blue-600 font-semibold animate-pulse">
          Vérification de la session en cours...
        </div>
      </div>
    );
  }

  // Si on a fini de charger et qu'il n'y a pas de user, on jette dehors
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Toutes les routes ci-dessous utiliseront le Layout */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;