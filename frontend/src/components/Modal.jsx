import React from 'react'
import Button from './Button'

export default function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded w-[95%] max-w-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="text-white/80">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button className="bg-slate-600 hover:bg-slate-700" onClick={onClose}>Cancelar</Button>
          {actions}
        </div>
      </div>
    </div>
  )
}
