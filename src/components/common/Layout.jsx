// src/components/common/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <div className='h-20 md:h-18'></div>
      {/* On ajoute pt-24 (padding-top) pour compenser la Navbar fixe */}
      <main className="pb-20 p-4 md:p-6"> 
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;