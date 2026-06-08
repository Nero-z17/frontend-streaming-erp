// src/components/common/BottomNav.jsx
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  const links = [
    { name: 'Dash', path: '/', icon: '📊' },
    { name: 'Clients', path: '/clients', icon: '👥' },
    { name: 'Comptes', path: '/accounts', icon: '🔑' },
    { name: 'Expenses', path: '/expenses', icon: '💰' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50 h-16 flex justify-around items-center">
      {links.map((link) => (
        <Link 
          key={link.path} 
          to={link.path}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive(link.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{link.icon}</span>
          <span className="text-[10px] font-medium">{link.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;