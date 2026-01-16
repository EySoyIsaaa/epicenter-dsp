import { useState, useCallback } from 'react';
import { Download, Zap, Volume2, Info, Heart } from 'lucide-react';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Knob } from '@/components/Knob';
import { FileUploader } from '@/components/FileUploader';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SpectrumVisualizer } from '@/components/SpectrumVisualizer';
import { PresetSelector, PRESETS, type Preset } from '@/components/PresetSelector';
import { YouTubeSearch } from '@/components/YouTubeSearch';
import { AdSense } from '@/components/AdSense';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/_core/hooks/useAuth';

interface AudioFileInfo {
  file: File;
  name: string;
  format: string;
  size: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<AudioFileInfo | null>(null);
  const [sweepFreq, setSweepFreq] = useState(45);
  const [width, setWidth] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const [balance, setBalance] = useState(50); // 0=voz, 100=bajo
  const [volume, setVolume] = useState(100); // 100% por defecto, max 150%
  const [activePreset, setActivePreset] = useState('custom');

  const {
    isProcessing,
    progress,
    error,
    result,
    originalSpectrum,
    processedSpectrum,
    processAudio,
    clearResult,
    downloadProcessed,
  } = useAudioProcessor();

  const handleFileSelect = useCallback((fileInfo: AudioFileInfo) => {
    setSelectedFile(fileInfo);
    clearResult();
  }, [clearResult]);

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    clearResult();
  }, [clearResult]);

  const handleYouTubeDownload = useCallback((file: File) => {
    // Crear AudioFileInfo desde el archivo descargado
    const fileInfo: AudioFileInfo = {
      file,
      name: file.name,
      format: 'mp3',
      size: file.size,
    };
    setSelectedFile(fileInfo);
    clearResult();
  }, [clearResult]);

  const handlePresetSelect = useCallback((preset: Preset) => {
    setSweepFreq(preset.sweepFreq);
    setWidth(preset.width);
    setIntensity(preset.intensity);
    setActivePreset(preset.id);
  }, []);

  const handleKnobChange = useCallback((setter: (v: number) => void) => {
    return (value: number) => {
      setter(value);
      setActivePreset('custom');
    };
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;
    
    await processAudio(selectedFile, {
      sweepFreq,
      width,
      intensity,
      balance,
      volume,
    });
  }, [selectedFile, sweepFreq, width, intensity, balance, volume, processAudio]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EPICENTER DSP</h1>
                <p className="text-xs text-muted-foreground">Procesador de Restauración de Bajos</p>
                <p className="text-xs text-muted-foreground/70 italic">Desarrollado por Abraham Isaias Garcia Barragan</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botón de Donaciones Ko-fi */}
              <a 
                href="https://ko-fi.com/G2G41QLJFO" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Heart className="w-4 h-4 fill-current" />
                  Apoya al Proyecto
                </Button>
              </a>
              
              {/* Botón Acerca de */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Info className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Acerca de Epicenter DSP</DialogTitle>
                    <DialogDescription>
                      Procesador de audio profesional basado en la patente US4698842
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 text-sm text-muted-foreground">
                    {/* Introducción */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">¿Qué es Epicenter DSP?</h3>
                      <p className="mb-3">
                        <strong className="text-foreground">Epicenter DSP</strong> es una recreación digital del legendario 
                        AudioControl Epicenter, un procesador de restauración de bajos utilizado en sistemas de car audio 
                        profesional desde los años 90. Esta herramienta web permite a cualquier persona procesar sus canciones 
                        favoritas y experimentar bajos profundos y potentes que normalmente solo se encuentran en sistemas de 
                        audio de alta gama.
                      </p>
                      <p>
                        El procesador está diseñado específicamente para música que ha perdido sus frecuencias fundamentales 
                        más bajas durante la compresión MP3 o la masterización comercial, restaurando la energía y el impacto 
                        que hace vibrar los subwoofers de manera impresionante.
                      </p>
                    </section>

                    {/* Historia y Tecnología */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Historia y Tecnología</h3>
                      <p className="mb-3">
                        El Epicenter original fue desarrollado por AudioControl y patentado bajo el número <strong className="text-foreground">US4698842</strong>. 
                        Esta patente describe un método revolucionario para sintetizar frecuencias fundamentales a partir de armónicos 
                        superiores presentes en la señal de audio. A diferencia de un simple ecualizador que solo amplifica frecuencias 
                        existentes, el Epicenter <em>crea</em> nuevas frecuencias sub-bajas que no estaban presentes en la grabación original.
                      </p>
                      <p className="mb-3">
                        El algoritmo funciona mediante un proceso de seis etapas: primero extrae los armónicos superiores (típicamente 
                        entre 55-120 Hz), luego utiliza un circuito divisor de frecuencia (flip-flop) para dividir estas frecuencias 
                        por dos, generando así las fundamentales perdidas. Posteriormente, modula la envolvente para mantener la dinámica 
                        original de la música, aplica filtrado paso-bajo para suavizar la señal, y finalmente mezcla el resultado con 
                        el audio original.
                      </p>
                      <p>
                        Este proceso puede generar boosts de hasta <strong className="text-foreground">50 veces</strong> en frecuencias 
                        específicas, creando sub-bajos masivos que son especialmente efectivos en géneros como Regional Mexicano, Banda, 
                        Rock y Pop.
                      </p>
                    </section>

                    {/* Cómo Funciona */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Cómo Funciona el Procesamiento</h3>
                      <p className="mb-3">
                        El procesador Epicenter DSP implementa el algoritmo patentado a través de procesamiento digital de señales (DSP) 
                        en tiempo real dentro de tu navegador. Cuando subes un archivo de audio o descargas una canción, el sistema 
                        analiza la forma de onda completa y aplica las siguientes transformaciones:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                        <li><strong className="text-foreground">Extracción de armónicos:</strong> Filtra la banda de frecuencias entre 55-120 Hz donde residen los segundos armónicos.</li>
                        <li><strong className="text-foreground">División de frecuencia:</strong> Reduce estas frecuencias a la mitad para sintetizar las fundamentales (27-63 Hz).</li>
                        <li><strong className="text-foreground">Modulación de envolvente:</strong> Preserva la dinámica y el "punch" original de la música.</li>
                        <li><strong className="text-foreground">Filtrado paso-bajo:</strong> Elimina artefactos no deseados y suaviza la señal sintetizada.</li>
                        <li><strong className="text-foreground">Mezcla final:</strong> Combina los bajos sintetizados con el audio original según los parámetros configurados.</li>
                      </ul>
                      <p>
                        Todo este procesamiento se realiza localmente en tu dispositivo utilizando la Web Audio API, garantizando 
                        privacidad y velocidad sin necesidad de subir tus archivos a servidores externos.
                      </p>
                    </section>

                    {/* Controles y Parámetros */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Guía de Controles</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground">SWEEP (27-63 Hz)</h4>
                          <p>
                            Controla la frecuencia central del efecto Epicenter. Valores más bajos (27-35 Hz) generan sub-bajos 
                            ultra profundos ideales para música clásica o ambiental. Valores medios (40-48 Hz) son perfectos para 
                            Regional Mexicano, Banda y Pop. Valores altos (50-63 Hz) funcionan mejor para Rock y música con mucha 
                            energía en medios-bajos.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">WIDTH (0-100%)</h4>
                          <p>
                            Define el ancho de banda del efecto. Un valor bajo (20-40%) crea un efecto muy focalizado y quirúrgico. 
                            Valores medios (50-60%) ofrecen un balance natural. Valores altos (70-100%) generan un efecto más amplio 
                            y envolvente, pero pueden causar saturación en algunos sistemas.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">INTENSITY (0-100%)</h4>
                          <p>
                            Controla la cantidad de bajos sintetizados que se agregan a la mezcla. Valores bajos (30-50%) son sutiles 
                            y naturales. Valores medios (60-75%) ofrecen impacto notable sin distorsión. Valores altos (80-100%) 
                            generan bajos extremos para competencias de car audio, pero requieren sistemas de alta calidad.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">BALANCE (0-100%)</h4>
                          <p>
                            Ajusta el balance entre vocales y bajos en la mezcla final. 0% preserva las voces y medios sin cambios. 
                            50% ofrece un balance equilibrado. 100% maximiza los bajos y puede atenuar ligeramente las frecuencias medias, 
                            ideal para sistemas enfocados en SPL (Sound Pressure Level).
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Presets Recomendados */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Presets Recomendados por Género</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">Regional Mexicano / Banda</h4>
                          <p className="text-xs mb-2">SWEEP: 40-45 Hz | WIDTH: 60% | INTENSITY: 75-85%</p>
                          <p className="text-xs">
                            Configuración optimizada para tubas, tamboras y bajos acústicos. Genera impacto masivo sin perder claridad 
                            en las voces. Ideal para sistemas de car audio con subwoofers de 12" o 15".
                          </p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">Rock / Metal</h4>
                          <p className="text-xs mb-2">SWEEP: 45-50 Hz | WIDTH: 50% | INTENSITY: 60-75%</p>
                          <p className="text-xs">
                            Refuerza bombos y bajos eléctricos sin saturar. Mantiene la agresividad y el punch característicos del género. 
                            Evita valores muy altos de intensity para prevenir distorsión en guitarras.
                          </p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">Pop / Comercial</h4>
                          <p className="text-xs mb-2">SWEEP: 42-48 Hz | WIDTH: 55% | INTENSITY: 65-75%</p>
                          <p className="text-xs">
                            Balance perfecto entre impacto y claridad vocal. Mejora la experiencia de escucha sin alterar la mezcla 
                            comercial. Funciona excelente en sistemas de audio de automóvil estándar.
                          </p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">Clásica / Jazz</h4>
                          <p className="text-xs mb-2">SWEEP: 35-40 Hz | WIDTH: 40% | INTENSITY: 50-60%</p>
                          <p className="text-xs">
                            Efecto sutil que restaura la profundidad de contrabajos y timbales sin alterar la naturalidad de la orquesta. 
                            Requiere sistemas de alta fidelidad para apreciar completamente.
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-xs italic">
                        <strong className="text-foreground">Nota importante:</strong> Evita usar Epicenter en Hip-Hop, EDM, Trap o Dubstep, 
                        ya que estos géneros ya contienen sub-bajos profundos en la producción original. Aplicar el efecto puede causar 
                        saturación excesiva y distorsión.
                      </p>
                    </section>

                    {/* Aplicaciones Prácticas */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Aplicaciones Prácticas</h3>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-foreground">Car Audio:</strong> Maximiza el rendimiento de subwoofers en sistemas de automóvil, especialmente en competencias de SPL.</li>
                        <li><strong className="text-foreground">Home Theater:</strong> Mejora la experiencia cinematográfica agregando profundidad a bandas sonoras y efectos especiales.</li>
                        <li><strong className="text-foreground">Producción Musical:</strong> Herramienta creativa para productores que buscan agregar peso a mezclas sin usar samples adicionales.</li>
                        <li><strong className="text-foreground">DJs y Eventos:</strong> Procesa tracks para sistemas de sonido en vivo, garantizando impacto en pistas de baile.</li>
                        <li><strong className="text-foreground">Entusiastas del Audio:</strong> Experimenta con diferentes configuraciones para descubrir nuevas dimensiones en tu música favorita.</li>
                      </ul>
                    </section>

                    {/* Especificaciones Técnicas */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Especificaciones Técnicas</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-secondary/50 rounded-lg">
                          <div className="text-2xl font-bold text-red-500">27-63</div>
                          <div className="text-xs">Hz Sweep Range</div>
                        </div>
                        <div className="text-center p-3 bg-secondary/50 rounded-lg">
                          <div className="text-2xl font-bold text-red-500">50x</div>
                          <div className="text-xs">Max Boost</div>
                        </div>
                        <div className="text-center p-3 bg-secondary/50 rounded-lg">
                          <div className="text-2xl font-bold text-red-500">320</div>
                          <div className="text-xs">kbps MP3 Output</div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 text-xs">
                        <p><strong className="text-foreground">Formatos de entrada soportados:</strong> MP3, WAV, FLAC, OGG, M4A</p>
                        <p><strong className="text-foreground">Formato de salida:</strong> MP3 320 kbps CBR</p>
                        <p><strong className="text-foreground">Sample rate:</strong> 44.1 kHz / 48 kHz</p>
                        <p><strong className="text-foreground">Procesamiento:</strong> 32-bit float point DSP</p>
                        <p><strong className="text-foreground">Latencia:</strong> ~10-30 segundos dependiendo de la duración del archivo</p>
                      </div>
                    </section>

                    {/* Sobre el Desarrollador */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Sobre el Desarrollador</h3>
                      <p className="mb-3">
                        <strong className="text-foreground">Abraham Isaias Garcia Barragan</strong> es un desarrollador de software 
                        y entusiasta del audio profesional con pasión por el car audio y los sistemas de sonido de alta potencia. 
                        Este proyecto nació de la necesidad de hacer accesible la tecnología Epicenter a cualquier persona con una 
                        conexión a internet, democratizando herramientas que antes solo estaban disponibles en equipos de hardware 
                        costosos.
                      </p>
                      <p>
                        El desarrollo de Epicenter DSP involucró investigación profunda de la patente original, implementación de 
                        algoritmos DSP complejos en JavaScript, y optimización para funcionar eficientemente en navegadores web modernos. 
                        El proyecto es de código abierto y está disponible en GitHub para que otros desarrolladores puedan aprender, 
                        contribuir y mejorar la herramienta.
                      </p>
                    </section>

                    {/* Recursos y Referencias */}
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Recursos y Referencias</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                        <li><a href="https://patents.google.com/patent/US4698842" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Patente US4698842 - AudioControl Epicenter</a></li>
                        <li><a href="https://www.audiocontrol.com/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">AudioControl - Sitio Oficial</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Web Audio API Documentation</a></li>
                        <li><a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">yt-dlp - YouTube Downloader</a></li>
                      </ul>
                    </section>

                    {/* Apoyo al Proyecto */}
                    <section className="border-t border-border pt-4">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Apoya el Proyecto</h3>
                      <p className="mb-3">
                        Epicenter DSP es completamente gratuito y de código abierto. Si encuentras útil esta herramienta y deseas 
                        apoyar su desarrollo continuo, considera hacer una donación. Tu apoyo ayuda a mantener el servidor en línea, 
                        agregar nuevas características y mejorar la experiencia de usuario.
                      </p>
                      <a 
                        href="https://ko-fi.com/G2G41QLJFO" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                          <Heart className="w-4 h-4 fill-current" />
                          Donar en Ko-fi
                        </Button>
                      </a>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Main Panel */}
          <div className="space-y-6">
            {/* Anuncio Superior */}
            <AdSense 
              adSlot="1111111111" 
              adFormat="horizontal"
              className="mb-6"
            />

            {/* YouTube Search */}
            <YouTubeSearch
              onAudioDownloaded={handleYouTubeDownload}
              disabled={isProcessing}
            />

            {/* File Upload */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  O Sube un Archivo de Audio
                </h2>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onClear={handleFileClear}
                  selectedFile={selectedFile}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Controls Panel */}
            <Card className="border-border/50 bg-card/80 backdrop-blur overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-1">
                <div className="bg-gradient-to-b from-zinc-900 to-black p-6 rounded-sm">
                  {/* Presets */}
                  <div className="mb-8">
                    <PresetSelector
                      activePreset={activePreset}
                      onSelectPreset={handlePresetSelect}
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Knobs */}
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    <Knob
                      value={sweepFreq}
                      min={27}
                      max={63}
                      onChange={handleKnobChange(setSweepFreq)}
                      label="SWEEP"
                      unit="Hz"
                      color="#ef4444"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={width}
                      min={0}
                      max={100}
                      onChange={handleKnobChange(setWidth)}
                      label="WIDTH"
                      unit="%"
                      color="#f97316"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={intensity}
                      min={0}
                      max={100}
                      onChange={handleKnobChange(setIntensity)}
                      label="INTENSITY"
                      unit="%"
                      color="#eab308"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={balance}
                      min={0}
                      max={100}
                      step={1}
                      onChange={handleKnobChange(setBalance)}
                      label="BALANCE"
                      color="blue"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={volume}
                      min={100}
                      max={150}
                      step={1}
                      onChange={handleKnobChange(setVolume)}
                      label="VOLUMEN"
                      color="green"
                      disabled={isProcessing}
                    />
                  </div>

                  {/* LED Indicators */}
                  <div className="flex justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedFile ? 'led-on' : 'led-off'}`} />
                      <span className="text-xs text-zinc-500">INPUT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isProcessing ? 'led-on animate-pulse' : 'led-off'}`} />
                      <span className="text-xs text-zinc-500">PROCESS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${result ? 'led-on' : 'led-off'}`} />
                      <span className="text-xs text-zinc-500">OUTPUT</span>
                    </div>
                  </div>

                  {/* Process Button */}
                  <div className="mt-8">
                    <Button
                      onClick={handleProcess}
                      disabled={!selectedFile || isProcessing}
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-zinc-800 disabled:to-zinc-900 glow-red-button"
                    >
                      {isProcessing ? (
                        <>
                          <Volume2 className="w-5 h-5 mr-2 animate-pulse" />
                          PROCESANDO...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          PROCESAR AUDIO
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {isProcessing && (
                    <div className="mt-4">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-center text-zinc-500 mt-2">
                        {progress}% completado
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Results */}
            {result && (
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Resultado del Procesamiento
                    </h2>
                    <Button
                      onClick={downloadProcessed}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar MP3
                    </Button>
                  </div>

                  {/* Audio Player con comparación A/B */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Reproductor con Comparación A/B</h3>
                    <AudioPlayer 
                      originalUrl={result.originalUrl} 
                      processedUrl={result.processedUrl}
                    />
                  </div>

                  {/* Spectrum Visualizers */}
                  {originalSpectrum && processedSpectrum && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs text-muted-foreground mb-2">Espectro Original</h3>
                        <SpectrumVisualizer originalData={originalSpectrum} />
                      </div>
                      <div>
                        <h3 className="text-xs text-muted-foreground mb-2">Espectro Procesado</h3>
                        <SpectrumVisualizer processedData={processedSpectrum} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Anuncio Inferior */}
            <AdSense 
              adSlot="2222222222" 
              adFormat="horizontal"
              className="mt-6"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Anuncio Sidebar */}
            <AdSense 
              adSlot="3333333333" 
              adFormat="vertical"
            />

            {/* Info Card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Información
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p>
                    El Epicenter restaura bajos profundos que se pierden durante la compresión MP3 o masterización.
                  </p>
                  <p>
                    Ideal para música Regional, Banda, Rock y Pop. Evitar en Hip-Hop y EDM que ya tienen sub-bajos.
                  </p>
                  <p>
                    Los archivos procesados se descargan en formato MP3 de alta calidad (320 kbps).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Banner de Instalación PWA (Solo iPhone) */}
      <PWAInstallBanner />
    </div>
  );
}
