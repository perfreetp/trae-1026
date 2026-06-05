import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="lg:ml-60">
        <Topbar />
        <main className="pt-16 min-h-screen">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-30 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}
