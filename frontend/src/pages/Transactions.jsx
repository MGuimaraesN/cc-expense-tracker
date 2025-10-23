import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import { fmtCurrency, fmtDate } from '../utils/format'

export default function Transactions() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [count, setCount] = useState(0)
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ startDate: '', endDate: '', cardId: '', categoryId: '' })
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), amount: 0, description: '', cardId:'', categoryId:'', installments:1, installmentIndex:1 })
  const [splits, setSplits] = useState([]);
  const [isSplit, setIsSplit] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importReport, setImportReport] = useState(null);

  const load = async () => {
    const params = { page, pageSize, ...filters }
    const { data } = await api.get('/transactions', { params })
    setItems(data.items)
    setCount(data.total)
    setTotal(data.items.reduce((s,t)=> s + t.amount, 0))
  }
  const loadMeta = async () => {
    const [cs, cats] = await Promise.all([api.get('/cards'), api.get('/categories')])
    setCards(cs.data); setCategories(cats.data)
  }
  useEffect(() => { loadMeta() }, [])
  useEffect(() => { load() }, [page, pageSize, filters])

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.cardId === '') delete payload.cardId;
    else payload.cardId = Number(payload.cardId);

    if (isSplit) {
      if (splits.length === 0) {
        alert('Adicione pelo menos uma divisão');
        return;
      }
      const totalAmount = splits.reduce((sum, split) => sum + Number(split.amount), 0);
      if (totalAmount !== Number(form.amount)) {
        alert('A soma das divisões deve ser igual ao valor total');
        return;
      }
      payload.splits = splits;
    } else {
        if (payload.categoryId === '') delete payload.categoryId;
        else payload.categoryId = Number(payload.categoryId);
    }

    payload.amount = Number(payload.amount);
    await api.post('/transactions', payload);
    setForm({ ...form, amount: 0, description: '' });
    setSplits([]);
    setIsSplit(false);
    await load();
  };

  const uploadReceipt = async (id, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      await api.post(`/transactions/${id}/upload-receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      load();
    } catch (error) {
      console.error('Error uploading receipt:', error);
    }
  };

  const del = async (id) => {
    if (confirm('Excluir transação?')) {
      await api.delete(`/transactions/${id}`)
      await load()
    }
  }

  const openImportModal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').slice(0, 5);
      setImportPreview(lines);
    };
    reader.readAsText(file);

    setImportModalOpen(true);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!importFile) return;

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const { data } = await api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportReport(data);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportReport({ successes: 0, errors: [{ line: 'N/A', error: 'An unexpected error occurred.' }] });
    } finally {
        setImportModalOpen(false);
        load();
    }
  };

  const exportCsv = () => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/reports/monthly`)
    const d = new Date(form.date)
    url.searchParams.set('month', d.getMonth()+1)
    url.searchParams.set('year', d.getFullYear())
    url.searchParams.set('format', 'csv')
    window.open(url.toString(), '_blank')
  }

  const exportPdf = () => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/reports/monthly`)
    const d = new Date(form.date)
    url.searchParams.set('month', d.getMonth()+1)
    url.searchParams.set('year', d.getFullYear())
    url.searchParams.set('format', 'pdf')
    window.open(url.toString(), '_blank')
  }

  return (
    <div className="space-y-4">
      <Card title="Nova Transação">
        <form onSubmit={submit} className="grid md:grid-cols-7 gap-2">
          <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input placeholder="Descrição" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <select value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.cardId} onChange={e=>setForm({...form, cardId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Cartão</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" min="1" value={form.installments} onChange={e=>setForm({...form, installments:Number(e.target.value)})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" title="Parcelas" />
          <input type="number" min="1" value={form.installmentIndex} onChange={e=>setForm({...form, installmentIndex:Number(e.target.value)})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" title="Parcela atual" />

          {isSplit && (
            <div className="md:col-span-7 space-y-2">
              {splits.map((split, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={split.amount}
                    onChange={(e) => {
                      const newSplits = [...splits];
                      newSplits[index].amount = e.target.value;
                      setSplits(newSplits);
                    }}
                    className="bg-white/5 border border-white/10 text-white rounded px-2 py-1"
                  />
                  <select
                    value={split.categoryId}
                    onChange={(e) => {
                      const newSplits = [...splits];
                      newSplits[index].categoryId = e.target.value;
                      setSplits(newSplits);
                    }}
                    className="bg-white/5 border border-white/10 text-white rounded px-2 py-1"
                  >
                    <option value="">Categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => {
                      const newSplits = splits.filter((_, i) => i !== index);
                      setSplits(newSplits);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => setSplits([...splits, { amount: '', categoryId: '' }])}
              >
                Adicionar Divisão
              </Button>
            </div>
          )}

          <div className="md:col-span-7">
            <Button>Adicionar</Button>
            <Button
                type="button"
                onClick={() => setIsSplit(!isSplit)}
                className="ml-2 bg-slate-600 hover:bg-slate-700"
            >
                {isSplit ? 'Cancelar Divisão' : 'Dividir Transação'}
            </Button>
            <label className="ml-3 cursor-pointer">
              <span className="px-3 py-2 rounded bg-slate-600 hover:bg-slate-700 text-white text-sm">Importar CSV</span>
              <input type="file" className="hidden" accept=".csv" onChange={openImportModal} />
            </label>
            <Button className="ml-2 bg-slate-600 hover:bg-slate-700" type="button" onClick={exportCsv}>Exportar CSV</Button>
            <Button className="ml-2 bg-slate-600 hover:bg-slate-700" type="button" onClick={exportPdf}>Exportar PDF</Button>
          </div>
        </form>
      </Card>

      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Pré-visualização do CSV</h2>
            <div className="bg-slate-900 p-4 rounded-md mb-4 whitespace-pre-wrap font-mono text-sm">
              {importPreview.join('\n')}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setImportModalOpen(false)} className="bg-slate-600 hover:bg-slate-700 mr-2">
                Cancelar
              </Button>
              <Button onClick={handleImport}>Confirmar Importação</Button>
            </div>
          </div>
        </div>
      )}

      {importReport && (
        <Card title="Relatório de Importação">
          <p>Sucessos: {importReport.successes}</p>
          {importReport.errors.length > 0 && (
            <div>
              <p>Erros:</p>
              <ul className="list-disc list-inside text-red-400">
                {importReport.errors.map((err, index) => (
                  <li key={index}>Linha {err.line}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={() => setImportReport(null)} className="mt-4">Fechar</Button>
        </Card>
      )}

      <Card title="Filtros">
        <div className="grid md:grid-cols-6 gap-2">
          <input type="date" value={filters.startDate} onChange={e=>setFilters({...filters, startDate:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input type="date" value={filters.endDate} onChange={e=>setFilters({...filters, endDate:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <select value={filters.categoryId} onChange={e=>setFilters({...filters, categoryId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.cardId} onChange={e=>setFilters({...filters, cardId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Cartão</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/página</option>)}
          </select>
          <div className="text-right text-white/70 self-center">Total na página: {fmtCurrency(total)}</div>
        </div>
      </Card>

      <Card title="Transações">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Cartão</th><th className="text-right">Valor</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id} className="border-t border-white/10">
                <td>{fmtDate(t.date)}</td>
                <td>{t.description}</td>
                <td>{t.categoryName || '-'}</td>
                <td>{t.cardName || '-'}</td>
                <td className="text-right">{fmtCurrency(t.amount)}</td>
                <td className="text-right">
                    <label className="cursor-pointer">
                        <span className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs">Anexar</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => uploadReceipt(t.id, e.target.files[0])}
                        />
                    </label>
                  <Button className="bg-red-600 hover:bg-red-700 ml-2" onClick={()=>del(t.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-3 text-white/70">
          <div>Mostrando {items.length} de {count}</div>
          <div className="flex gap-2">
            <Button className="bg-slate-600 hover:bg-slate-700" onClick={()=>setPage(p=>Math.max(1, p-1))}>Anterior</Button>
            <div>Página {page}</div>
            <Button className="bg-slate-600 hover:bg-slate-700" onClick={()=>setPage(p=>p+1)}>Próxima</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
