import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt, FaExchangeAlt, FaCreditCard, FaTags, FaChartPie,
  FaHistory, FaCog, FaUserShield, FaWallet, FaTimes
} from 'react-icons/fa';

const NavItem = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-gray-700 hover:text-white'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{children}</span>
  </NavLink>
);

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();

  return (
    <>
      <aside
        className={`fixed lg:relative inset-y-0 left-0 bg-sidebar text-white flex flex-col p-4 w-64
                   transform transition-transform duration-300 ease-in-out z-40
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 mb-8">
          <div className="flex items-center gap-3">
            <FaWallet size={32} className="text-primary" />
            <h1 className="text-xl font-bold">Controle de Gastos</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-text-secondary">
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem to="/app" icon={FaTachometerAlt}>Dashboard</NavItem>
          <NavItem to="/app/transactions" icon={FaExchangeAlt}>Transações</NavItem>
          <NavItem to="/app/cards" icon={FaCreditCard}>Cartões</NavItem>
          <NavItem to="/app/categories" icon={FaTags}>Categorias</NavItem>
          <NavItem to="/app/budgets" icon={FaChartPie}>Orçamentos</NavItem>
          <NavItem to="/app/recurring-transactions" icon={FaHistory}>Recorrentes</NavItem>
          <NavItem to="/app/settings" icon={FaCog}>Configurações</NavItem>
          {user?.role === 'ADMIN' && (
            <NavItem to="/app/admin" icon={FaUserShield}>Admin</NavItem>
          )}
        </nav>
      </aside>
      {/* Overlay para fechar a sidebar em telas pequenas */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
