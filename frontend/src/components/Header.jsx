import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';

export default function Header({ title }) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white shadow-sm p-4 rounded-lg mb-6">
      <h1 className="text-2xl font-bold text-text-primary">{title || 'Dashboard'}</h1>

      <div className="flex items-center gap-6">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-64 pl-12 pr-4 py-2 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Ícones de Ação e Perfil */}
        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-primary">
            <FaBell size={20} />
          </button>
          <button className="text-text-secondary hover:text-primary">
            <FaCog size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300">
              {/* Placeholder para a imagem do usuário */}
            </div>
            <span className="font-semibold text-text-primary">{user?.name || 'Usuário'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
