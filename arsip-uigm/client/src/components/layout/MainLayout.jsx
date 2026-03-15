import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  // State untuk kontrol Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Header Component */}
      <Header isSidebarOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* --- BAGIAN UTAMA (MAIN) --- */}
      <main 
        className={`pt-20 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'pl-52' : 'pl-16'
        }`}
      >
        {/* Container Konten */}
        <div className="p-6 animate-fade-in-up">
           <Outlet />
        </div>
      </main>
    </div>
  );
}