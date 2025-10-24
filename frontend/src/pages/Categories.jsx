import React, { useEffect, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Notification from '../components/Notification'

export default function Categories() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })

  const load = async () => {
    const { data } = await api.get('/categories')
    setItems(data)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/categories', { name })
      setName('')
      await load()
    } finally {
      setLoading(false)
    }
  }

  const update = async (it) => {
    const newName = prompt('Novo nome', it.name)
    if (!newName) return
    await api.put(`/categories/${it.id}`, { name: newName })
    await load()
  }

  const del = async (id) => {
    try {
      await api.delete(`/categories/${id}`)
      setNotification({ message: 'Categoria excluída com sucesso!', type: 'success' })
      await load()
    } catch (error) {
      setNotification({ message: 'Erro ao excluir categoria.', type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <Card title="Nova Categoria">
        <form onSubmit={add} className="flex gap-2">
          <input placeholder="Nome" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} />
          <Button disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar'}</Button>
        </form>
      </Card>

      <Card title="Minhas Categorias">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr><th className="text-left">Nome</th><th className="text-right"></th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t border-white/10">
                <td>{it.name}</td>
                <td className="text-right">
                  <Button className="bg-slate-600 hover:bg-slate-700 mr-2" onClick={()=>update(it)}>Renomear</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={()=>del(it.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
