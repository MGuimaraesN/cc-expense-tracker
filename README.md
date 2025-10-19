# 💳 Controle de Gastos com Cartão — Full Stack

Sistema completo (API Node + Frontend React) para controle de gastos com cartão de crédito.

## 🔧 Tecnologias
- **Backend:** Node.js + Express + Prisma (SQLite), JWT, Multer, fast-csv, PDFKit, Swagger
- **Frontend:** React + Vite + TailwindCSS + React Router + Axios + Recharts
- **Banco:** SQLite por padrão (PostgreSQL opcional)
- **Docker:** docker-compose com backend e frontend

## ▶️ Execução rápida (sem Docker)

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
API: http://localhost:4000/api — Swagger: http://localhost:4000/api/docs

### 2) Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Web: http://localhost:5173

Usuário seed: **user@example.com** / **secret123**

## ▶️ Execução com Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 📁 Estrutura
```
backend/
  src/ (rotas, middleware, utils)
  prisma/ (schema + seed)
  Dockerfile
frontend/
  src/ (páginas, componentes, contexto)
  Dockerfile
docker-compose.yml
```

## 🔐 Autenticação
- Registro: `POST /api/auth/register`
- Login: `POST /api/auth/login` → retorna `token` (JWT)
- Enviar `Authorization: Bearer <token>` nas rotas protegidas

## 📊 Funcionalidades
- CRUD: cartões, categorias, transações, orçamentos
- Filtros por período, cartão e categoria
- **Importação CSV** em `/api/transactions/import` (campos: `date,amount,description,card_name,category`)
  - Suporta mapeamento: envie `mapping` (JSON) no mesmo `multipart/form-data`
- **Exportação**: relatório mensal CSV/PDF em `/api/reports/monthly?month=MM&year=YYYY&format=csv|pdf`
- **Dashboard**: resumo mensal por categoria e por cartão (Recharts)
- **Alertas de orçamento** no Dashboard quando gasto > orçamento
- **Swagger** disponível em `/api/docs`

## 🧪 Dados de exemplo
- Usuário: `user@example.com` / `secret123`
- 2 cartões (Nubank, Visa Gold)
- Categorias: Alimentação, Transporte, Lazer
- 5 transações exemplo
- Orçamentos do mês corrente para as categorias

## 🧱 Banco de dados
Padrão: **SQLite**. Para PostgreSQL, ajuste `DATABASE_URL` e `provider` no `schema.prisma` e rode as migrações.

## 🚀 Próximas melhorias (sugestões)
- PWA com cache offline e instalação no dispositivo
- Upload de logo/ícone para cartões
- Compartilhamento de conta entre múltiplos usuários
- Exportação de OFX/Excel
- Testes (Jest) e CI
- Multi-moeda e conversão cambial
```

