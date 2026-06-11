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
        <h1 className="font-bold text-xl text-gray-200 dark:text-white">Nero ERP</h1>
        
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
            className="p-2 text-white dark:text-gray-200 focus:outline-none flex items-center justify-center"
          >
            {/* Vrai icône Paramètres SVG à la place de l'émoji */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.304.233-.463.607-.442.991.004.079.006.158.006.237 0 .079-.002.158-.006.237-.021.384.138.758.442.991l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.304-.233.463-.607.442-.991a6.5 6.5 0 0 1-.006-.237c0-.079.002-.158.006-.237.021-.384-.138-.758-.442-.991l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124c.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          
          {/* Menu déroulant */}
          {isMenuOpen && (
            <div className="absolute top-16 right-4 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                
                {/* Lien Paramètres */}
                <Link 
                  to="/settings" 
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2.5 text-gray-500 dark:text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.304.233-.463.607-.442.991.004.079.006.158.006.237 0 .079-.002.158-.006.237-.021.384.138.758.442.991l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.304-.233.463-.607.442-.991a6.5 6.5 0 0 1-.006-.237c0-.079.002-.158.006-.237.021-.384-.138-.758-.442-.991l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124c.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  <span>Paramètres</span>
                </Link>

                {/* Séparateur élégant */}
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                {/* Bouton Déconnexion */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H21" />
                  </svg>
                  <span>Déconnexion</span>
                </button>
            </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;