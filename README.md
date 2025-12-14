# 🎵 Epicenter DSP - Procesador de Restauración de Bajos

Procesador de audio profesional basado en la patente **US4698842** de AudioControl. Descarga canciones desde YouTube y aplica el efecto Epicenter para restaurar bajos profundos.

![Epicenter DSP](https://img.shields.io/badge/Audio-Processing-red)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Características

- 🎵 **Descarga desde YouTube** - Busca y descarga canciones directamente
- 🔊 **Efecto Epicenter** - Restauración de bajos basada en patente profesional
- 💾 **Salida en MP3** - Archivos de alta calidad (320 kbps)
- 🎚️ **Controles profesionales** - SWEEP, WIDTH, INTENSITY, BALANCE
- 📊 **Análisis espectral** - Visualización antes/después
- 🎧 **Comparación A/B** - Escucha el original vs procesado
- 🎯 **Presets por género** - Regional, Rock, Pop, Clásica
- 💰 **Monetizable** - Integración con Google AdSense

---

## 🚀 Inicio Rápido

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/epicenter-dsp.git
cd epicenter-dsp

# Instalar dependencias
pnpm install

# Instalar yt-dlp
sudo pip3 install yt-dlp
# o en Ubuntu/Debian
sudo apt install yt-dlp

# Ejecutar en desarrollo
pnpm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Deploy en Railway.app

Sigue la guía completa en **[GUIA_DEPLOYMENT_RAILWAY.md](./GUIA_DEPLOYMENT_RAILWAY.md)**

Resumen rápido:
1. Sube el código a GitHub
2. Conecta Railway con tu repositorio
3. Railway hace deploy automático
4. Configura Google AdSense para monetizar

---

## 📁 Estructura del Proyecto

```
epicenter-dsp/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Páginas
│   │   └── utils/       # Utilidades (MP3 encoder)
│   └── index.html       # HTML principal con AdSense
├── server/              # Backend Node.js + Express
│   ├── _core/           # Core del servidor
│   ├── dsp/             # Algoritmos DSP
│   └── youtube.ts       # Endpoint de YouTube
├── shared/              # Código compartido
├── Dockerfile           # Configuración Docker para Railway
├── railway.json         # Configuración Railway
└── package.json         # Dependencias
```

---

## 🎛️ Uso

### 1. Buscar en YouTube
- Escribe el nombre de una canción
- Haz clic en "Buscar y Descargar"
- El audio se carga automáticamente

### 2. O Subir Archivo
- Arrastra un archivo MP3, WAV, FLAC u OGG
- O haz clic para seleccionar

### 3. Ajustar Parámetros
- **SWEEP** (27-63 Hz): Frecuencia central del efecto
- **WIDTH** (0-100%): Ancho de banda
- **INTENSITY** (0-100%): Intensidad del efecto
- **BALANCE** (0-100%): Mezcla voz/bajo

### 4. Procesar
- Haz clic en "PROCESAR AUDIO"
- Espera el análisis (10-30 segundos)
- Compara original vs procesado

### 5. Descargar
- Haz clic en "Descargar MP3"
- El archivo se guarda como `[nombre]_epicenter.mp3`

---

## 🎯 Presets Recomendados

| Género | SWEEP | WIDTH | INTENSITY | Uso |
|--------|-------|-------|-----------|-----|
| **Regional/Banda** | 40-45 Hz | 60% | 75-85% | Máximo impacto en bajos |
| **Rock** | 45-50 Hz | 50% | 60-75% | Evita saturación |
| **Pop** | 42-48 Hz | 55% | 65-75% | Balance comercial |
| **Clásica** | 35-40 Hz | 40% | 50-60% | Sutil y natural |

⚠️ **Evitar en Hip-Hop/EDM**: Estos géneros ya tienen sub-bajos profundos.

---

## 💰 Monetización con Google AdSense

El proyecto viene pre-configurado con espacios para anuncios:
- 📍 **Anuncio superior** - Horizontal
- 📍 **Anuncio inferior** - Horizontal
- 📍 **Anuncio sidebar** - Vertical

### Configurar AdSense

1. Solicita cuenta en https://www.google.com/adsense
2. Reemplaza `ca-pub-XXXXXXXXXXXXXXXX` en `client/index.html`
3. Actualiza los slots en `client/src/pages/Home.tsx`
4. Deploy y espera aprobación (1-2 días)

**Estimación de ingresos**:
- 1,000 visitas/día → $60-150/mes
- 10,000 visitas/día → $600-1,500/mes

---

## 🛠️ Tecnologías

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **@breezystack/lamejs** - Encoder MP3
- **Lucide React** - Iconos

### Backend
- **Node.js 22** - Runtime
- **Express** - Web framework
- **yt-dlp** - Descarga de YouTube
- **MySQL** - Base de datos (opcional)

### Deploy
- **Railway.app** - Hosting
- **Docker** - Containerización

---

## 📊 Algoritmo DSP

Basado en la patente **US4698842** de AudioControl:

1. **Extracción de armónicos** - Filtra segundos armónicos (55-120 Hz)
2. **División de frecuencia** - Flip-flop divide por 2
3. **Síntesis de fundamentales** - Genera bajos profundos
4. **Modulación de envolvente** - Mantiene dinámica original
5. **Filtrado paso-bajo** - Suaviza la señal
6. **Mezcla final** - Combina con audio original

---

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Desarrollador

**Abraham Isaias Garcia Barragan**

Proyecto elaborado con pasión por el audio profesional y car audio.

---

## 📚 Recursos

- [Patente US4698842](https://patents.google.com/patent/US4698842)
- [AudioControl Epicenter](https://www.audiocontrol.com/)
- [Railway.app Docs](https://docs.railway.app/)
- [Google AdSense](https://www.google.com/adsense)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)

---

## ⭐ Agradecimientos

- AudioControl por la patente original
- Comunidad de car audio
- Todos los contribuidores

---

**¿Te gusta el proyecto? Dale una ⭐ en GitHub!**
