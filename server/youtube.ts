import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { Router } from 'express';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const router = Router();

const MAX_BUFFER = 50 * 1024 * 1024;
const TIMEOUT_MS = 120000;

const CLIENT_FALLBACKS = [
  'youtube:player_client=android',
  'youtube:player_client=tv_embedded,ios',
  'youtube:player_client=web_safari,ios',
  'youtube:player_client=ios,mweb',
];

function getCommonYtDlpArgs(outputTemplate: string): string[] {
  const args = [
    '--no-playlist',
    '--ignore-errors',
    '--no-warnings',
    '--js-runtimes',
    'node',
    '-f',
    'bestaudio/best',
    '-x',
    '--audio-format',
    'mp3',
    '--embed-thumbnail',
    '--print',
    'after_move:filepath',
    '-o',
    outputTemplate,
  ];

  const cookiesFile = process.env.YTDLP_COOKIES_FILE;
  if (cookiesFile) {
    if (existsSync(cookiesFile)) {
      args.push('--cookies', cookiesFile);
    } else {
      console.warn(`[YouTube] YTDLP_COOKIES_FILE is set but file does not exist: ${cookiesFile}`);
    }
  }

  const cookiesFromBrowser = process.env.YTDLP_COOKIES_FROM_BROWSER;
  if (cookiesFromBrowser) {
    args.push('--cookies-from-browser', cookiesFromBrowser);
  }

  const proxyUrl = process.env.YTDLP_PROXY;
  if (proxyUrl) {
    args.push('--proxy', proxyUrl);
  }

  return args;
}

function errorContainsBotChallenge(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Sign in to confirm you're not a bot") ||
    message.includes('Use --cookies-from-browser or --cookies') ||
    message.includes('HTTP Error 403: Forbidden')
  );
}

async function resolveDownloadedMp3Path(stdout: string, tempDir: string): Promise<string> {
  const lines = stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const resolvedPath = lines.reverse().find(line => line.endsWith('.mp3')) || null;

  if (resolvedPath && existsSync(resolvedPath)) {
    return resolvedPath;
  }

  const { stdout: lsOutput } = await execFileAsync('bash', ['-lc', `ls -t "${tempDir}"/yt_download_*.mp3 2>/dev/null | head -1`]);
  const fallbackPath = lsOutput.trim();
  if (fallbackPath && existsSync(fallbackPath)) {
    return fallbackPath;
  }

  throw new Error('No se pudo encontrar el archivo mp3 descargado');
}

async function downloadWithYtDlp(query: string, outputTemplate: string, tempDir: string) {
  const commonArgs = getCommonYtDlpArgs(outputTemplate);
  let lastError: unknown = null;

  for (const extractorArgs of CLIENT_FALLBACKS) {
    const args = [
      ...commonArgs,
      '--extractor-args',
      extractorArgs,
      `ytsearch1:${query}`,
    ];

    console.log('Executing: yt-dlp', args.join(' '));

    try {
      const { stdout, stderr } = await execFileAsync('yt-dlp', args, {
        maxBuffer: MAX_BUFFER,
        timeout: TIMEOUT_MS,
      });

      if (stderr) {
        console.error('yt-dlp stderr:', stderr);
      }

      return await resolveDownloadedMp3Path(stdout, tempDir);
    } catch (error) {
      lastError = error;
      console.error(`yt-dlp attempt failed (${extractorArgs}):`, error);

      if (errorContainsBotChallenge(error)) {
        // Si YouTube respondió con challenge anti-bot, no tiene sentido seguir rotando cliente
        break;
      }
    }
  }

  throw lastError;
}

router.post('/download', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const tempDir = tmpdir();
  const outputTemplate = path.join(tempDir, 'yt_download_%(title)s.%(ext)s');

  try {
    const filePath = await downloadWithYtDlp(query, outputTemplate, tempDir);

    const fileBuffer = await readFile(filePath);
    let fileName = path.basename(filePath).replace('yt_download_', '');

    fileName = fileName
      .replace(/[\u201C\u201D\uFF02]/g, '"')
      .replace(/[\uFF5C\u2502]/g, '-')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, '_')
      .trim();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-File-Name', encodeURIComponent(fileName));
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileBuffer);

    await unlink(filePath).catch(err => console.error('Error deleting temp file:', err));
  } catch (error) {
    console.error('Error downloading from YouTube:', error);

    const rawMessage = error instanceof Error ? error.message : String(error);
    const isBotBlock = errorContainsBotChallenge(error);

    res.status(isBotBlock ? 503 : 500).json({
      error: isBotBlock
        ? 'YouTube está solicitando verificación anti-bot. Configura YTDLP_COOKIES_FILE o YTDLP_COOKIES_FROM_BROWSER en el servidor para habilitar descargas.'
        : 'Error al descargar la canción desde YouTube',
      details: rawMessage,
      hints: isBotBlock
        ? [
            'YTDLP_COOKIES_FILE=/ruta/a/cookies.txt (formato Netscape)',
            'YTDLP_COOKIES_FROM_BROWSER=chrome | firefox | edge[:PROFILE]',
            'Opcional: YTDLP_PROXY=http://usuario:pass@host:puerto',
          ]
        : undefined,
    });
  }
});

export default router;
