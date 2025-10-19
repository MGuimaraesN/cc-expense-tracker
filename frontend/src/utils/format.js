export const fmtCurrency = (v) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtDate = (d) => new Date(d).toISOString().slice(0,10)
