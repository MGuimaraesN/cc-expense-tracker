import React from 'react'
import Button from './Button'

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border dark:border-white/10 rounded w-[95%] max-w-lg p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-800 dark:text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-white/60 hover:text-gray-800 dark:hover:text-white">✕</button>
        </div>
        <div className="text-gray-600 dark:text-white/80">{children}</div>
      </div>
    </div>
  );
}
