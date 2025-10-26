import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FaBars } from 'react-icons/fa';

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = "Dashboard"; // Pode ser dinâmico no futuro

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          <Header title={pageTitle} />
          {/* Botão para abrir a sidebar em telas pequenas */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-6 left-6 z-50 text-text-primary"
          >
            <FaBars size={24} />
          </button>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
