const { format } = require('@fast-csv/format');

async function buildMonthlyReportCsv(res, period, transactions) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio_${period.start}_a_${period.end}.csv"`);

  const csvStream = format({ headers: true });
  csvStream.pipe(res);
  transactions.forEach(t => {
    csvStream.write({
      date: new Date(t.date).toISOString().slice(0,10),
      description: t.description || '',
      category: t.categoryName || '',
      card: t.cardName || '',
      amount: t.amount
    });
  });
  csvStream.end();
}

module.exports = { buildMonthlyReportCsv };
