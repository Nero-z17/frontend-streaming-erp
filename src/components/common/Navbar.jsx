import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // On récupère la position actuelle

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fonction utilitaire pour savoir si un lien est actif
  const isActive = (path) => location.pathname === path;

  // Classes communes pour les liens
  const linkBaseClass = "px-3 py-1.5 rounded-full transition-all duration-300 font-medium";
  const activeClass = "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm";
  const inactiveClass = "text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-500 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-xl text-gray-200 dark:text-white">Streaming ERP</h1>
        
        {/* Navigation Desktop - Hidden sur mobile */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className={`${linkBaseClass} ${isActive('/') ? activeClass : inactiveClass}`}>Dashboard</Link>
          <Link to="/clients" className={`${linkBaseClass} ${isActive('/clients') ? activeClass : inactiveClass}`}>Clients</Link>
          <Link to="/accounts" className={`${linkBaseClass} ${isActive('/accounts') ? activeClass : inactiveClass}`}>Account</Link>
          <Link to="/expenses" className={`${linkBaseClass} ${isActive('/expenses') ? activeClass : inactiveClass}`}>Expenses</Link>
          <Link to="/settings" className={`${linkBaseClass} ${isActive('/settings') ? activeClass : inactiveClass}`}>Settings</Link>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" /> {/* Séparateur */}

          <button 
            onClick={handleLogout} 
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-lg"
          >
            Déconnexion
          </button>
        </div>
        
        {/* Menu Mobile - Uniquement sur mobile */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700"
          >
            {/* Icône Menu (Hamburger ou Profil) */}
            ⚙️
          </button>
          
          {/* Menu déroulant */}
          {isMenuOpen && (
            <div className="absolute top-16 right-4 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                
                {/* Lien Paramètres */}
                <Link 
                to="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
                >
                ⚙️ Paramètres
                </Link>

                {/* Séparateur élégant */}
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                {/* Bouton Déconnexion */}
                <button 
                onClick={handleLogout} 
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 font-medium"
                >
                🚪 Déconnexion
                </button>
            </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;