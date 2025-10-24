# ---- Build stage (install deps) ----
FROM node:20-alpine AS deps

# Instala openssl (para o Prisma) E
# todas as dependências para COMPILAR o 'canvas' (python, build-base, cairo-dev, etc.)
RUN apk add --no-cache openssl-dev python3 build-base cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev

WORKDIR /app
COPY package.json package-lock.json* ./
# O 'npm ci' agora deve funcionar
RUN npm ci || npm install


# ---- Runtime stage ----
FROM node:20-alpine

# Instala openssl (para o Prisma) E
# todas as dependências para EXECUTAR o 'canvas' (cairo, jpeg, pango, etc.)
RUN apk add --no-cache openssl cairo jpeg pango giflib pixman

WORKDIR /app
ENV NODE_ENV=production

# Copia os node_modules do estágio de dependências
COPY --from=deps /app/node_modules ./node_modules

# Copia o código da aplicação e o schema do prisma
COPY . .

EXPOSE 4000

# O Prisma precisa do schema para rodar as migrações
RUN npx prisma generate

# Comando de inicialização
CMD [ "sh", "-c", "echo '--- FORÇANDO SINCRONIZAÇÃO DO BANCO DE DADOS ---' && npx prisma db push --accept-data-loss && echo '--- SINCRONIZAÇÃO CONCLUÍDA. CONTEÚDO DA PASTA PRISMA: ---' && ls -l prisma/ && echo '--- INICIANDO APLICAÇÃO ---' && node src/index.js" ]