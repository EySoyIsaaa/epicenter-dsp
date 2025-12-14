# 📦 Epicenter DSP - Versión Railway + AdSense

## ✅ Cambios Implementados

### 🎵 Funcionalidades Core (Previas)
1. ✅ Salida en formato MP3 (320 kbps)
2. ✅ Nombre de archivo con sufijo "_epicenter"
3. ✅ Búsqueda y descarga desde YouTube con yt-dlp
4. ✅ Procesamiento DSP basado en patente US4698842
5. ✅ Corrección de error MPEGMode (usando @breezystack/lamejs)

### 🚀 Nuevos Cambios para Railway
6. ✅ **Dockerfile** - Configuración completa para deployment
7. ✅ **railway.json** - Configuración específica de Railway
8. ✅ **.dockerignore** - Optimización de build
9. ✅ **.env.example** - Template de variables de entorno

### 💰 Integración de Google AdSense
10. ✅ **Script de AdSense** en `client/index.html`
11. ✅ **Componente AdSense** reutilizable (`client/src/components/AdSense.tsx`)
12. ✅ **3 espacios de anuncios** estratégicamente ubicados:
    - Anuncio superior (horizontal)
    - Anuncio inferior (horizontal)
    - Anuncio sidebar (vertical)
13. ✅ **Meta tags SEO** para mejor indexación
14. ✅ **Modo desarrollo** - Los anuncios solo se muestran en producción

### 📚 Documentación
15. ✅ **GUIA_DEPLOYMENT_RAILWAY.md** - Guía paso a paso completa
16. ✅ **README.md** - Documentación profesional del proyecto
17. ✅ **CAMBIOS_REALIZADOS.md** - Historial de modificaciones

---

## 📁 Archivos Nuevos Creados

```
epicenter-dsp/
├── Dockerfile                          # ⭐ Nuevo
├── .dockerignore                       # ⭐ Nuevo
├── railway.json                        # ⭐ Nuevo
├── .env.example                        # ⭐ Nuevo
├── README.md                           # ⭐ Actualizado
├── GUIA_DEPLOYMENT_RAILWAY.md          # ⭐ Nuevo
├── CAMBIOS_REALIZADOS.md               # ⭐ Actualizado
├── client/
│   ├── index.html                      # ⭐ Actualizado (AdSense + SEO)
│   └── src/
│       ├── components/
│       │   ├── AdSense.tsx             # ⭐ Nuevo
│       │   └── YouTubeSearch.tsx       # Existente
│       ├── pages/
│       │   └── Home.tsx                # ⭐ Actualizado (3 anuncios)
│       └── utils/
│           └── mp3Encoder.ts           # ⭐ Actualizado (lamejs fix)
└── server/
    ├── youtube.ts                      # Existente
    └── _core/
        └── index.ts                    # Actualizado
```

---

## 🎯 Configuración Requerida (Post-Deploy)

### 1. Google AdSense (Obligatorio para monetizar)

**Ubicación**: `client/index.html` línea 14
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
```
**Reemplazar**: `ca-pub-XXXXXXXXXXXXXXXX` con tu ID real de AdSense

**Ubicación**: `client/src/components/AdSense.tsx` línea 51
```typescript
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
```
**Reemplazar**: `ca-pub-XXXXXXXXXXXXXXXX` con tu ID real de AdSense

**Ubicación**: `client/src/pages/Home.tsx` líneas 177, 313, 425
```typescript
adSlot="1111111111"  // Reemplazar con slot real
adSlot="2222222222"  // Reemplazar con slot real
adSlot="3333333333"  // Reemplazar con slot real
```

### 2. Variables de Entorno en Railway

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://... (Railway lo genera automáticamente)
OAUTH_SERVER_URL=https://tu-dominio.railway.app
```

---

## 🚀 Pasos para Deploy

### Opción A: Deploy Automático (Recomendado)

1. **Subir a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Epicenter DSP - Railway + AdSense"
   git remote add origin https://github.com/TU_USUARIO/epicenter-dsp.git
   git push -u origin main
   ```

2. **Conectar con Railway**
   - Ve a https://railway.app
   - Clic en "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Railway detecta el Dockerfile y hace build automático

3. **Configurar variables de entorno**
   - En Railway, ve a Variables
   - Agrega las variables necesarias

4. **Esperar el deploy** (5-10 minutos)
   - Railway te dará un dominio: `tu-app.up.railway.app`

### Opción B: Deploy Manual con Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up
```

---

## 💰 Estimación de Costos

### Railway.app
- **Plan Hobby**: $5/mes (500 horas)
- **Incluye**: 
  - CPU compartido
  - 512MB RAM
  - 1GB almacenamiento
  - SSL gratis
  - Dominio personalizado

### Google AdSense (Ingresos)
- **1,000 visitas/día**: $60-150/mes
- **5,000 visitas/día**: $300-750/mes
- **10,000 visitas/día**: $600-1,500/mes

**ROI**: Con solo 100-200 visitas diarias ya cubres el costo de Railway.

---

## 📊 Ubicación de Anuncios

```
┌─────────────────────────────────────────────┐
│           HEADER (Logo + Nav)               │
├─────────────────────────────────────────────┤
│                                             │
│  [📢 ANUNCIO SUPERIOR - Horizontal]         │
│                                             │
├─────────────────────────────────────────────┤
│  🔍 Buscar en YouTube                       │
│  📁 O Sube un Archivo                       │
│  🎛️ Controles (Knobs)                       │
│  📊 Análisis Espectral                      │
│  🎧 Comparación A/B                         │
│                                             │
│  [📢 ANUNCIO INFERIOR - Horizontal]         │
│                                             │
└─────────────────────────────────────────────┘

SIDEBAR (Derecha):
┌──────────────────┐
│ 🔴 PROCESAR      │
│ ⚙️ Configuración │
│ 💡 Consejos      │
│                  │
│ [📢 ANUNCIO      │
│  Vertical]       │
└──────────────────┘
```

---

## ✅ Checklist Pre-Launch

Antes de hacer público tu sitio:

- [ ] Código subido a GitHub
- [ ] Deploy exitoso en Railway
- [ ] Dominio personalizado configurado (opcional)
- [ ] Google AdSense solicitado
- [ ] ID de AdSense actualizado en el código
- [ ] Slots de anuncios actualizados
- [ ] Variables de entorno configuradas
- [ ] Prueba de descarga desde YouTube
- [ ] Prueba de conversión a MP3
- [ ] Prueba de procesamiento DSP
- [ ] Anuncios visibles en producción
- [ ] SEO básico configurado
- [ ] Analytics configurado (opcional)

---

## 🎓 Recursos Adicionales

### Documentación
- **Railway**: https://docs.railway.app
- **Google AdSense**: https://support.google.com/adsense
- **yt-dlp**: https://github.com/yt-dlp/yt-dlp

### Tutoriales
- Ver `GUIA_DEPLOYMENT_RAILWAY.md` para instrucciones detalladas
- Ver `README.md` para documentación del proyecto
- Ver `CAMBIOS_REALIZADOS.md` para historial de cambios

### Soporte
- Railway: https://railway.app/help
- AdSense: https://support.google.com/adsense

---

## 🎉 ¡Listo para Lanzar!

Tu Epicenter DSP está completamente preparado para:
1. ✅ Deploy en Railway.app
2. ✅ Monetización con Google AdSense
3. ✅ Escalabilidad profesional
4. ✅ Generación de ingresos pasivos

**Próximos pasos**:
1. Sube el código a GitHub
2. Conecta con Railway
3. Solicita AdSense
4. ¡Comienza a generar ingresos! 💰

---

**Desarrollado por Abraham Isaias Garcia Barragan**
**Fecha**: Diciembre 2024
**Versión**: 2.0 (Railway + AdSense)
