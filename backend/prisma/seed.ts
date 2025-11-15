import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('secret123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Usuário Padrão',
      email: 'user@example.com',
      passwordHash,
    },
  });

  console.log('Usuário criado/encontrado:', user.email);

  const alimentacao = await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Alimentação' } },
    update: {},
    create: { userId: user.id, name: 'Alimentação', type: TransactionType.EXPENSE },
  });

  const transporte = await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Transporte' } },
    update: {},
    create: { userId: user.id, name: 'Transporte', type: TransactionType.EXPENSE },
  });

  const lazer = await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Lazer' } },
    update: {},
    create: { userId: user.id, name: 'Lazer', type: TransactionType.EXPENSE },
  });

  const salario = await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Salário' } },
    update: {},
    create: { userId: user.id, name: 'Salário', type: TransactionType.INCOME },
  });

  console.log('Categorias criadas/encontradas.');

  // Clean up old cards and transactions to ensure a fresh start
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.card.deleteMany({ where: { userId: user.id } });

  const [nubank, visa] = await Promise.all([
    prisma.card.create({ data: { userId: user.id, name: 'Nubank', limit: 5000, closeDay: 5, dueDay: 15 } }),
    prisma.card.create({ data: { userId: user.id, name: 'Visa Gold', limit: 8000, closeDay: 10, dueDay: 20 } }),
  ]);

  console.log('Cartões criados.');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const mk = (d: number) => new Date(year, month, d);

  await prisma.transaction.createMany({
    data: [
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: alimentacao.id, date: mk(2), amount: 120.50, description: 'Supermercado' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: transporte.id, date: mk(3), amount: 45.90, description: 'Uber' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: visa.id, categoryId: lazer.id, date: mk(5), amount: 80.00, description: 'Cinema' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: visa.id, categoryId: alimentacao.id, date: mk(10), amount: 60.00, description: 'Almoço' },
      { userId: user.id, type: TransactionType.EXPENSE, cardId: nubank.id, categoryId: transporte.id, date: mk(12), amount: 30.00, description: 'Combustível' },
      { userId: user.id, type: TransactionType.INCOME, categoryId: salario.id, date: mk(1), amount: 5000, description: 'Salário Mensal' },
    ]
  });

  console.log('Transações criadas.');

  const budgets = [
    { userId: user.id, categoryId: alimentacao.id, month: month + 1, year, amount: 600 },
    { userId: user.id, categoryId: transporte.id, month: month + 1, year, amount: 300 },
    { userId: user.id, categoryId: lazer.id, month: month + 1, year, amount: 200 },
  ];

  for (const budget of budgets) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: budget.userId,
          categoryId: budget.categoryId,
          month: budget.month,
          year: budget.year,
        },
      },
      update: { amount: budget.amount },
      create: budget,
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
