# Dockerfile para Epicenter DSP en Railway
FROM node:22-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    && pip3 install --break-system-packages --no-cache-dir yt-dlp

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files y patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Build de la aplicación
RUN pnpm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["pnpm", "start"]
