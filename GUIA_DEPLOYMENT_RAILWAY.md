# 🚀 Guía de Deployment en Railway.app con Google AdSense

Esta guía te llevará paso a paso para publicar tu Epicenter DSP en Railway.app y monetizarlo con Google AdSense.

---

## 📋 Requisitos Previos

1. **Cuenta de GitHub** - Para conectar el repositorio
2. **Cuenta de Railway.app** - Regístrate en https://railway.app
3. **Cuenta de Google AdSense** - Para monetización (opcional al inicio)

---

## 🎯 Parte 1: Preparar el Repositorio en GitHub

### Paso 1: Crear repositorio en GitHub

```bash
# Inicializar git en tu proyecto
cd epicenter-dsp
git init

# Agregar archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Epicenter DSP"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/epicenter-dsp.git
git branch -M main
git push -u origin main
```

### Paso 2: Verificar archivos importantes

Asegúrate de que estos archivos estén en tu repositorio:
- ✅ `Dockerfile` - Configuración de Docker
- ✅ `railway.json` - Configuración de Railway
- ✅ `.dockerignore` - Archivos a ignorar
- ✅ `package.json` - Dependencias
- ✅ `.env.example` - Variables de entorno de ejemplo

---

## 🚂 Parte 2: Deploy en Railway.app

### Paso 1: Crear nuevo proyecto

1. Ve a https://railway.app
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio `epicenter-dsp`

### Paso 2: Configurar variables de entorno

En el dashboard de Railway, ve a **Variables** y agrega:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://usuario:password@host:3306/database
OAUTH_SERVER_URL=https://tu-dominio.railway.app
```

**Nota**: Railway proporciona automáticamente una base de datos MySQL si la agregas como servicio.

### Paso 3: Agregar base de datos MySQL (opcional)

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add MySQL"**
3. Railway generará automáticamente la variable `DATABASE_URL`
4. Ejecuta las migraciones:
   ```bash
   pnpm run db:push
   ```

### Paso 4: Deploy automático

Railway detectará el `Dockerfile` y comenzará el build automáticamente:
- ⏳ Build tarda ~5-10 minutos la primera vez
- 🔄 Deploys automáticos en cada push a `main`
- 🌐 Railway te dará un dominio: `tu-app.up.railway.app`

### Paso 5: Dominio personalizado (opcional)

1. Ve a **Settings** → **Domains**
2. Haz clic en **"Custom Domain"**
3. Agrega tu dominio (ej: `epicenterdsp.com`)
4. Configura los DNS según las instrucciones de Railway

---

## 💰 Parte 3: Configurar Google AdSense

### Paso 1: Solicitar cuenta de AdSense

1. Ve a https://www.google.com/adsense
2. Haz clic en **"Comenzar"**
3. Completa el formulario con:
   - URL de tu sitio: `https://tu-app.up.railway.app`
   - País
   - Aceptar términos y condiciones

### Paso 2: Verificar tu sitio

Google te pedirá que verifiques tu sitio. El código ya está agregado en `client/index.html`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
 crossorigin="anonymous"></script>
```

**Reemplaza `ca-pub-XXXXXXXXXXXXXXXX` con tu ID de AdSense.**

### Paso 3: Crear unidades de anuncios

Una vez aprobado tu sitio (puede tardar 1-2 días):

1. Ve a **Anuncios** → **Por unidad de anuncio**
2. Crea 3 unidades:
   - **Anuncio Superior**: Tipo "Display horizontal"
   - **Anuncio Inferior**: Tipo "Display horizontal"
   - **Anuncio Sidebar**: Tipo "Display vertical"

3. Copia los **data-ad-slot** de cada anuncio

### Paso 4: Actualizar los slots en el código

En `client/index.html`, reemplaza:
```html
ca-pub-XXXXXXXXXXXXXXXX
```

En `client/src/components/AdSense.tsx`, reemplaza:
```typescript
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
```

En `client/src/pages/Home.tsx`, reemplaza los slots:
```typescript
adSlot="1111111111"  // Reemplaza con tu slot de anuncio superior
adSlot="2222222222"  // Reemplaza con tu slot de anuncio inferior
adSlot="3333333333"  // Reemplaza con tu slot de sidebar
```

### Paso 5: Hacer commit y push

```bash
git add .
git commit -m "Configurar Google AdSense con IDs reales"
git push origin main
```

Railway hará deploy automáticamente con los cambios.

---

## 📊 Parte 4: Monitoreo y Optimización

### Monitorear Railway

- **Logs**: Ve a **Deployments** → Selecciona el deploy → **View Logs**
- **Métricas**: CPU, RAM, y tráfico de red
- **Costo**: Railway cobra $5/mes por 500 horas de uso

### Monitorear AdSense

- **Panel de AdSense**: https://www.google.com/adsense
- **Métricas clave**:
  - RPM (Revenue per 1000 impressions)
  - CTR (Click-through rate)
  - Ingresos estimados

### Optimización de anuncios

1. **Prueba diferentes posiciones** de anuncios
2. **Usa anuncios responsive** para mejor rendimiento móvil
3. **Evita saturar** con demasiados anuncios (máximo 3-4 por página)
4. **Monitorea el rendimiento** semanalmente

---

## 🔧 Solución de Problemas

### Error: "Build failed"

**Solución**: Verifica los logs en Railway. Común:
- Falta instalar `yt-dlp` → Ya está en el Dockerfile
- Error de dependencias → Ejecuta `pnpm install` localmente

### Error: "yt-dlp not found"

**Solución**: El Dockerfile ya incluye la instalación de `yt-dlp`. Si persiste:
```dockerfile
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install --no-cache-dir yt-dlp
```

### Los anuncios no se muestran

**Posibles causas**:
1. AdSense aún no aprobó tu sitio (espera 1-2 días)
2. ID de AdSense incorrecto
3. Bloqueador de anuncios activo
4. Estás en modo desarrollo (los anuncios solo se muestran en producción)

### Base de datos no conecta

**Solución**: Verifica que `DATABASE_URL` esté configurado correctamente en Railway.

---

## 💡 Consejos para Maximizar Ingresos

1. **SEO**: Optimiza tu sitio para búsquedas como "procesar audio online", "epicenter dsp online"
2. **Contenido**: Agrega tutoriales o guías sobre car audio
3. **Redes sociales**: Comparte en grupos de car audio
4. **Calidad**: Mantén la experiencia de usuario excelente
5. **Tráfico**: Más visitas = más ingresos (objetivo: 1000+ visitas/día)

### Estimación de ingresos

Con 1000 visitas diarias:
- RPM promedio: $2-5
- Ingresos mensuales: $60-150 USD

Con 10,000 visitas diarias:
- Ingresos mensuales: $600-1500 USD

---

## 📞 Soporte

- **Railway**: https://railway.app/help
- **AdSense**: https://support.google.com/adsense
- **Documentación**: Este archivo

---

## ✅ Checklist Final

Antes de lanzar, verifica:

- [ ] Repositorio en GitHub actualizado
- [ ] Deploy exitoso en Railway
- [ ] Base de datos MySQL conectada (si aplica)
- [ ] Variables de entorno configuradas
- [ ] Dominio personalizado configurado (opcional)
- [ ] Google AdSense solicitado
- [ ] IDs de AdSense actualizados en el código
- [ ] Anuncios visibles en producción
- [ ] Pruebas de funcionalidad completas
- [ ] YouTube download funcionando
- [ ] Conversión a MP3 funcionando

---

**¡Listo para generar ingresos con tu Epicenter DSP! 🎵💰**

Desarrollado por Abraham Isaias Garcia Barragan
