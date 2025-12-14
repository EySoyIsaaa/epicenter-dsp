# Epicenter DSP - Versión Modificada

## Cambios Realizados

### 1. **Salida en formato MP3 en lugar de WAV**
   - Se implementó la conversión a MP3 usando la librería `lamejs`
   - El archivo de salida ahora se genera en formato MP3 con calidad de 320 kbps
   - Archivo modificado: `client/src/hooks/useAudioProcessor.ts`
   - Nuevo archivo: `client/src/utils/mp3Encoder.ts`

### 2. **Nombre del archivo con sufijo "_epicenter"**
   - El archivo procesado ahora se descarga con el nombre original seguido de "_epicenter.mp3"
   - Ejemplo: Si subes "cancion.mp3", el resultado será "cancion_epicenter.mp3"
   - Modificación en: `client/src/hooks/useAudioProcessor.ts`

### 3. **Búsqueda y descarga desde YouTube**
   - Se agregó un nuevo componente en la parte superior de la interfaz
   - Permite buscar canciones directamente desde YouTube usando yt-dlp
   - El audio se descarga automáticamente en formato MP3 y se carga en el procesador
   - Archivos nuevos:
     - `client/src/components/YouTubeSearch.tsx` - Componente de búsqueda
     - `server/youtube.ts` - Endpoint del servidor para descargar desde YouTube
   - Archivos modificados:
     - `client/src/pages/Home.tsx` - Integración del componente de búsqueda
     - `server/_core/index.ts` - Registro de la ruta de YouTube

### 4. **Actualización de la interfaz**
   - El diálogo "Acerca de" ahora muestra "MP3" en lugar de "WAV" como formato de salida
   - Se agregó texto "O Sube un Archivo de Audio" para distinguir entre búsqueda y carga manual

## Requisitos del Sistema

### Dependencias de Node.js
- `@breezystack/lamejs` - Para conversión a MP3 (ya incluido en package.json)

### Dependencias del Sistema
- `yt-dlp` - Para descargar audio desde YouTube

## Instalación

### 1. Instalar dependencias de Node.js
```bash
pnpm install
```

### 2. Instalar yt-dlp (Linux/Mac)
```bash
# Ubuntu/Debian
sudo apt install yt-dlp

# O usando pip
sudo pip3 install yt-dlp

# Mac con Homebrew
brew install yt-dlp
```

### 3. Compilar el proyecto
```bash
pnpm run build
```

### 4. Ejecutar en modo desarrollo
```bash
pnpm run dev
```

### 5. Ejecutar en modo producción
```bash
pnpm start
```

## Uso

### Búsqueda desde YouTube
1. En la parte superior de la interfaz, encontrarás el campo "Buscar en YouTube"
2. Escribe el nombre de la canción que deseas procesar
3. Haz clic en "Buscar y Descargar"
4. El audio se descargará automáticamente y se cargará en el procesador
5. Ajusta los parámetros del Epicenter (SWEEP, WIDTH, INTENSITY, BALANCE)
6. Haz clic en "PROCESAR AUDIO"
7. Descarga el resultado con el botón de descarga

### Carga manual de archivos
1. Si prefieres subir tu propio archivo, usa la sección "O Sube un Archivo de Audio"
2. Arrastra y suelta un archivo de audio o haz clic para seleccionar
3. Continúa con el procesamiento como se describe arriba

## Formato de Salida

- **Formato**: MP3
- **Calidad**: 320 kbps
- **Nombre**: `[nombre_original]_epicenter.mp3`

## Notas Técnicas

- La conversión a MP3 se realiza en el navegador usando `@breezystack/lamejs` (versión mejorada y compatible)
- La descarga desde YouTube se ejecuta en el servidor usando `yt-dlp`
- El archivo descargado desde YouTube se almacena temporalmente y se elimina después de enviarlo al cliente
- El procesamiento DSP sigue siendo el mismo algoritmo basado en la patente US4698842

## Solución de Problemas

### Error al descargar desde YouTube
- Asegúrate de que `yt-dlp` esté instalado correctamente
- Verifica que el servidor tenga acceso a Internet
- Revisa los logs del servidor para más detalles

### Error de conversión a MP3
- Verifica que `@breezystack/lamejs` esté instalado: `pnpm list @breezystack/lamejs`
- Limpia la caché y reinstala: `pnpm install --force`

### Correcciones aplicadas
- Se reemplazó `lamejs` por `@breezystack/lamejs` para mejor compatibilidad con Vite
- Esto soluciona el error "MPEGMode is not defined"

## Desarrollador

**Abraham Isaias Garcia Barragan**

---

**Fecha de modificación**: Diciembre 2024
