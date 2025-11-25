import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { User } from '@prisma/client';

interface TransactionData {
  date: Date;
  description: string | null;
  categoryName: string | null;
  cardName: string | null;
  amount: number;
}

interface Period {
  start: string;
  end: string;
}

interface Summary {
  total: number;
  byCategory: { name: string; amount: number }[];
  byCard: { name: string; amount: number }[];
}

export const buildMonthlyReportPdf = (
  res: Response,
  user: User,
  period: Period,
  transactions: TransactionData[],
  summary: Summary
): void => {
  const doc = new PDFDocument({
    margin: 40,
    bufferPages: true,
  });

  // Header
  doc.on('pageAdded', () => {
    doc.fontSize(10).text('Relatório Mensal de Gastos', { align: 'center' });
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio_${period.start}_a_${period.end}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text('Relatório de Gastos', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Usuário: ${user.name} (${user.email})`);
  doc.text(`Período: de ${period.start} a ${period.end}`);
  doc.text(`Gerado em: ${new Date().toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text('Resumo', { underline: true });
  doc.fontSize(12).text(`Total do mês: R$ ${summary.total.toFixed(2)}`);
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
    doc.text(new Date(t.date).toISOString().slice(0, 10), col[0]);
    doc.text(t.description || '-', col[1]);
    doc.text(catCard, col[2]);
    doc.text(t.amount.toFixed(2), col[3], { align: 'right' });
  });

  // Footer
  const range = doc.bufferedPageRange();
  for (let i = range.start; i <= range.count - 1; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).text(`Página ${i + 1} de ${range.count}`, 40, doc.page.height - 30, { align: 'center' });
  }

  doc.end();
};
