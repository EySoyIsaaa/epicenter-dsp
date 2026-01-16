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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbIntensity, setReverbIntensity] = useState(30);
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
      reverbEnabled,
      reverbIntensity,
    });
  }, [selectedFile, sweepFreq, width, intensity, balance, volume, reverbEnabled, reverbIntensity, processAudio]);

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
                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">¿Qué es Epicenter DSP?</h3>
                      <p className="mb-3">
                        <strong className="text-foreground">Epicenter DSP</strong> es una recreación digital del legendario 
                        AudioControl Epicenter, un procesador de restauración de bajos utilizado en sistemas de car audio 
                        profesional desde los años 90. Esta herramienta web permite a cualquier persona procesar sus canciones 
                        favoritas y experimentar bajos profundos y potentes que normalmente solo se encuentran en sistemas de 
                        audio de alta gama.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Historia y Tecnología</h3>
                      <p className="mb-3">
                        El Epicenter original fue desarrollado por AudioControl y patentado bajo el número <strong className="text-foreground">US4698842</strong>. 
                        Esta patente describe un método revolucionario para sintetizar frecuencias fundamentales a partir de armónicos 
                        superiores presentes en la señal de audio.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Guía de Controles</h3>
                      <div className="space-y-3">
                        <div>
                          <p><strong className="text-foreground">SWEEP:</strong> Selecciona la frecuencia central que el Epicenter utilizará para restaurar los bajos.</p>
                        </div>
                        <div>
                          <p><strong className="text-foreground">WIDTH:</strong> Controla qué tan amplia es la banda de frecuencias alrededor del punto SWEEP que será procesada.</p>
                        </div>
                        <div>
                          <p><strong className="text-foreground">INTENSITY:</strong> Ajusta la cantidad de bajos restaurados que se inyectarán en la señal.</p>
                        </div>
                        <div>
                          <p><strong className="text-foreground">BALANCE:</strong> Permite equilibrar la mezcla entre las voces (medios/altos) y el bajo procesado.</p>
                        </div>
                        <div>
                          <p><strong className="text-foreground">VOLUMEN:</strong> Control de ganancia final para compensar la percepción de volumen tras el procesamiento.</p>
                        </div>
                        <div>
                          <p><strong className="text-foreground">REVERB VOCAL:</strong> Nuevo efecto que añade espacialidad exclusivamente a las voces, ideal para géneros como Banda o Rock.</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
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
                    
                    {/* Reverb Control */}
                    <div className="flex flex-col items-center gap-4">
                      <Knob
                        value={reverbIntensity}
                        min={0}
                        max={100}
                        step={1}
                        onChange={handleKnobChange(setReverbIntensity)}
                        label="REVERB"
                        unit="%"
                        color="#ffffff"
                        disabled={isProcessing || !reverbEnabled}
                      />
                      <div className="flex items-center space-x-2 bg-zinc-900/50 px-3 py-2 rounded-full border border-zinc-800">
                        <Switch 
                          id="reverb-mode" 
                          checked={reverbEnabled}
                          onCheckedChange={setReverbEnabled}
                          disabled={isProcessing}
                        />
                        <Label htmlFor="reverb-mode" className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                          {reverbEnabled ? 'ON' : 'OFF'}
                        </Label>
                      </div>
                    </div>
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
