import React from 'react';

const MenuItem = ({ icon: Icon, title, isActive }) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'bg-card hover:bg-gray-100'
      }`}
    >
      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-purple-100'}`}>
        <Icon size={20} className={isActive ? 'text-white' : 'text-primary'} />
      </div>
      <span className={`font-semibold ${isActive ? 'text-white' : 'text-text-primary'}`}>{title}</span>
    </div>
  );
};

export default MenuItem;
