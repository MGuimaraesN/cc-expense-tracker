# ---- Build stage (install deps) ----
FROM node:20-alpine AS deps

# Instala dependências para compilar o `canvas`
RUN apk add --no-cache python3 make g++ openssl-dev

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install


# ---- Runtime stage ----
FROM node:20-alpine

# Instala o pacote completo do openssl para garantir que todas as bibliotecas estejam disponíveis.
# Esta é uma abordagem mais robusta.
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

# Copia os node_modules do estágio de dependências (SINTAXE CORRIGIDA AQUI)
COPY --from=deps /app/node_modules ./node_modules

# Copia o código da aplicação e o schema do prisma
COPY . .

EXPOSE 4000

# O Prisma precisa do schema para rodar as migrações
RUN npx prisma generate

# VERSÃO FINAL E MAIS ROBUSTA:
# 1. Usa '--accept-data-loss' para forçar a aplicação do schema sem perguntas.
# 2. Adiciona mais 'echo' e 'ls' para podermos ver o que está acontecendo nos logs.
CMD [ "sh", "-c", "echo '--- FORÇANDO SINCRONIZAÇÃO DO BANCO DE DADOS ---' && npx prisma db push --accept-data-loss && echo '--- SINCRONIZAÇÃO CONCLUÍDA. CONTEÚDO DA PASTA PRISMA: ---' && ls -l prisma/ && echo '--- INICIANDO APLICAÇÃO ---' && node src/index.js" ]

