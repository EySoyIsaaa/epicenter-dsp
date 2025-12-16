import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);
const router = Router();

router.post('/download', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const tempDir = tmpdir();
  const outputTemplate = path.join(tempDir, 'yt_download_%(title)s.%(ext)s');
  
  try {
    // Ejecutar yt-dlp para descargar el audio
    const command = `yt-dlp -x --audio-format mp3 --embed-thumbnail -o "${outputTemplate}" "ytsearch:${query}"`;
    
    console.log('Executing:', command);
    const { stdout, stderr } = await execAsync(command, { 
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      timeout: 120000 // 2 minutos timeout
    });
    
    console.log('yt-dlp output:', stdout);
    if (stderr) console.error('yt-dlp stderr:', stderr);

    // Buscar el archivo descargado
    const outputMatch = stdout.match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
    let filePath: string | null = null;

    if (outputMatch) {
      filePath = outputMatch[1].trim();
    } else {
      // Intentar encontrar el archivo en el directorio temporal
      const { stdout: lsOutput } = await execAsync(`ls -t "${tempDir}"/yt_download_*.mp3 | head -1`);
      filePath = lsOutput.trim();
    }

    if (!filePath || !existsSync(filePath)) {
      throw new Error('No se pudo encontrar el archivo descargado');
    }

    // Leer el archivo
    const fileBuffer = await readFile(filePath);
    let fileName = path.basename(filePath).replace('yt_download_', '');
    
    // Sanitizar el nombre del archivo para evitar caracteres inválidos en headers HTTP
    // Remover o reemplazar caracteres especiales que no son válidos en headers
    fileName = fileName
      .replace(/[\u201C\u201D\uFF02]/g, '"')  // Comillas tipográficas a comillas normales
      .replace(/[\uFF5C\u2502]/g, '-')       // Barras verticales especiales a guiones
      .replace(/[^\x20-\x7E]/g, '')         // Remover caracteres no-ASCII
      .replace(/\s+/g, '_')                  // Espacios a guiones bajos
      .trim();

    // Enviar el archivo al cliente
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-File-Name', encodeURIComponent(fileName));
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileBuffer);

    // Limpiar el archivo temporal después de enviarlo
    await unlink(filePath).catch(err => console.error('Error deleting temp file:', err));

  } catch (error) {
    console.error('Error downloading from YouTube:', error);
    res.status(500).json({ 
      error: 'Error al descargar la canción desde YouTube',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
