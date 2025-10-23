const PDFDocument = require('pdfkit');

async function buildMonthlyReportPdf(res, user, period, transactions, summary) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio_${period.year}_${String(period.month).padStart(2, '0')}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text('Relatório Mensal de Gastos', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Usuário: ${user.name} (${user.email})`);
  doc.text(`Período: ${String(period.month).padStart(2, '0')}/${period.year}`);
  doc.text(`Gerado em: ${new Date().toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text('Resumo', { underline: true });
  doc.fontSize(12).text(`Total do mês: R$ ${summary.total.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(14).text('Gastos por Categoria', { underline: true });
  summary.byCategory.forEach(cat => {
    doc.fontSize(10).text(`${cat.name}: R$ ${cat.amount.toFixed(2)}`);
  });
  doc.moveDown();

  doc.fontSize(14).text('Gastos por Cartão', { underline: true });
  summary.byCard.forEach(card => {
    doc.fontSize(10).text(`${card.name}: R$ ${card.amount.toFixed(2)}`);
  });
  doc.moveDown();

  doc.fontSize(14).text('Transações', { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col = [40, 120, 320, 460];
  doc.fontSize(10).text('Data', col[0], tableTop);
  doc.text('Descrição', col[1], tableTop);
  doc.text('Categoria / Cartão', col[2], tableTop);
  doc.text('Valor (R$)', col[3], tableTop, { align: 'right' });
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();

  transactions.forEach((t) => {
    doc.moveDown(0.2);
    const catCard = `${t.categoryName || '-'} / ${t.cardName || '-'}`;
    doc.text(new Date(t.date).toISOString().slice(0,10), col[0]);
    doc.text(t.description || '-', col[1]);
    doc.text(catCard, col[2]);
    doc.text(t.amount.toFixed(2), col[3], undefined, { align: 'right' });
  });

  doc.end();
}

module.exports = { buildMonthlyReportPdf };
