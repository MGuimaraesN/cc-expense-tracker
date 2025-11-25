import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seed...');

  // Limpeza completa para garantir um estado limpo
  await prisma.transaction.deleteMany({});
  await prisma.splitTransaction.deleteMany({});
  await prisma.recurringTransaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Banco de dados limpo.');

  const passwordHash = await bcrypt.hash('secret123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Usuário Padrão',
      email: 'user@example.com',
      passwordHash,
    },
  });

  console.log('Usuário criado:', user.email);

  const alimentacao = await prisma.category.create({
    data: { userId: user.id, name: 'Alimentação', type: TransactionType.EXPENSE },
  });

  const transporte = await prisma.category.create({
    data: { userId: user.id, name: 'Transporte', type: TransactionType.EXPENSE },
  });

  const lazer = await prisma.category.create({
    data: { userId: user.id, name: 'Lazer', type: TransactionType.EXPENSE },
  });

  const salario = await prisma.category.create({
    data: { userId: user.id, name: 'Salário', type: TransactionType.INCOME },
  });

  console.log('Categorias criadas.');

  const [nubank, visa] = await Promise.all([
    prisma.card.create({ data: { userId: user.id, name: 'Nubank', limit: 5000, closeDay: 5, dueDay: 15 } }),
    prisma.card.create({ data: { userId: user.id, name: 'Visa Gold', limit: 8000, closeDay: 10, dueDay: 20 } }),
  ]);

  console.log('Cartões criados.');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Helper to create dates in the current month
  const mkCurrent = (d: number) => new Date(currentYear, currentMonth, d);

  // Helper to create dates in the previous month
  const mkPrevious = (d: number) => new Date(currentYear, currentMonth - 1, d);

  await prisma.transaction.createMany({
    data: [
      // Current Month Transactions
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: alimentacao.id, date: mkCurrent(2), amount: 120.50, description: 'Supermercado' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: transporte.id, date: mkCurrent(3), amount: 45.90, description: 'Uber' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: visa.id, categoryId: lazer.id, date: mkCurrent(5), amount: 80.00, description: 'Cinema' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: visa.id, categoryId: alimentacao.id, date: mkCurrent(10), amount: 60.00, description: 'Almoço' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: transporte.id, date: mkCurrent(12), amount: 30.00, description: 'Combustível' },
      { userId: user.id, type: TransactionType.INCOME, categoryId: salario.id, date: mkCurrent(1), amount: 5000, description: 'Salário Mensal' },

      // Previous Month Transactions
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: alimentacao.id, date: mkPrevious(15), amount: 150.75, description: 'Compras do mês' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: visa.id, categoryId: lazer.id, date: mkPrevious(20), amount: 250.00, description: 'Show' },
      { userId: user.id, type: TransactionType.INCOME, categoryId: salario.id, date: mkPrevious(1), amount: 5000, description: 'Salário Mensal' },
    ]
  });

  console.log('Transações criadas.');

  const budgets = [
    { userId: user.id, categoryId: alimentacao.id, month: currentMonth + 1, year: currentYear, amount: 600 },
    { userId: user.id, categoryId: transporte.id, month: currentMonth + 1, year: currentYear, amount: 300 },
    { userId: user.id, categoryId: lazer.id, month: currentMonth + 1, year: currentYear, amount: 200 },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: budget,
    });
  }

  console.log('Orçamentos criados.');
  console.log('Seed concluído. User: user@example.com / secret123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
