const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

const pieChartSize = 250;
const barChartWidth = 400;
const barChartHeight = 200;

const pieChartRenderer = new ChartJSNodeCanvas({ width: pieChartSize, height: pieChartSize, backgroundColour: 'white' });
const barChartRenderer = new ChartJSNodeCanvas({ width: barChartWidth, height: barChartHeight, backgroundColour: 'white' });

async function generateChart(type, config) {
  const image = type === 'pie'
    ? await pieChartRenderer.renderToBuffer(config)
    : await barChartRenderer.renderToBuffer(config);
  return image;
}

async function buildMonthlyReportPdf(res, user, period, transactions, summary) {
  const doc = new PDFDocument({
    margin: 40,
    bufferPages: true,
  });

  // Header
  doc.on('pageAdded', () => {
    doc.fontSize(10).text('Relatório Mensal de Gastos', { align: 'center' });
  });

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

  const categoryChartConfig = {
    type: 'pie',
    data: {
      labels: summary.byCategory.map(c => c.name),
      datasets: [{
        data: summary.byCategory.map(c => c.amount),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      }],
    },
    options: {
      animation: false,
    }
  };
  const categoryChartImage = await generateChart('pie', categoryChartConfig);
  doc.image(categoryChartImage, { width: pieChartSize, align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('Gastos por Cartão', { underline: true });

  const cardChartConfig = {
    type: 'bar',
    data: {
      labels: summary.byCard.map(c => c.name),
      datasets: [{
        label: 'Gasto',
        data: summary.byCard.map(c => c.amount),
        backgroundColor: '#36A2EB',
      }],
    },
    options: {
      animation: false,
    }
  };
  const cardChartImage = await generateChart('bar', cardChartConfig);
  doc.image(cardChartImage, { width: barChartWidth, align: 'center' });
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

  // Footer
  const range = doc.bufferedPageRange();
  for (let i = range.start; i <= range.count - 1; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).text(`Página ${i + 1} de ${range.count}`, 40, doc.page.height - 30, { align: 'center' });
  }

  doc.end();
}

module.exports = { buildMonthlyReportPdf };
