import { useState, useCallback, useEffect } from "react";
import {
  Download,
  Zap,
  Volume2,
  Info,
  Heart,
  Smartphone,
  Monitor,
  TabletSmartphone,
  ArrowUpRight,
} from "lucide-react";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Knob } from "@/components/Knob";
import { FileUploader } from "@/components/FileUploader";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SpectrumVisualizer } from "@/components/SpectrumVisualizer";
import { PresetSelector, type Preset } from "@/components/PresetSelector";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { AdSense } from "@/components/AdSense";
import { useAudioProcessor } from "@/hooks/useAudioProcessor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AudioFileInfo {
  file: File;
  name: string;
  format: string;
  size: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

type ViewportProfile = "desktop" | "mobile-portrait" | "mobile-landscape";

export default function Home() {
  const appStoreUrl =
    "https://play.google.com/store/apps/details?id=com.epicenter.hifi";

  const [selectedFile, setSelectedFile] = useState<AudioFileInfo | null>(null);
  const [sweepFreq, setSweepFreq] = useState(45);
  const [width, setWidth] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const [balance, setBalance] = useState(50);
  const [volume, setVolume] = useState(100);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbIntensity, setReverbIntensity] = useState(30);
  const [activePreset, setActivePreset] = useState("custom");
  const [viewportProfile, setViewportProfile] =
    useState<ViewportProfile>("desktop");

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

  useEffect(() => {
    const detectViewport = () => {
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;

      if (!isMobile) {
        setViewportProfile("desktop");
        return;
      }

      setViewportProfile(isPortrait ? "mobile-portrait" : "mobile-landscape");
    };

    detectViewport();
    window.addEventListener("resize", detectViewport);
    window.addEventListener("orientationchange", detectViewport);

    return () => {
      window.removeEventListener("resize", detectViewport);
      window.removeEventListener("orientationchange", detectViewport);
    };
  }, []);

  const isDesktop = viewportProfile === "desktop";
  const isPortraitMobile = viewportProfile === "mobile-portrait";

  const handleFileSelect = useCallback(
    (fileInfo: AudioFileInfo) => {
      setSelectedFile(fileInfo);
      clearResult();
    },
    [clearResult]
  );

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    clearResult();
  }, [clearResult]);

  const handleYouTubeDownload = useCallback(
    (file: File) => {
      const fileInfo: AudioFileInfo = {
        file,
        name: file.name,
        format: "mp3",
        size: file.size,
      };
      setSelectedFile(fileInfo);
      clearResult();
    },
    [clearResult]
  );

  const handlePresetSelect = useCallback((preset: Preset) => {
    setSweepFreq(preset.sweepFreq);
    setWidth(preset.width);
    setIntensity(preset.intensity);
    setActivePreset(preset.id);
  }, []);

  const handleKnobChange = useCallback((setter: (v: number) => void) => {
    return (value: number) => {
      setter(value);
      setActivePreset("custom");
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
  }, [
    selectedFile,
    sweepFreq,
    width,
    intensity,
    balance,
    volume,
    reverbEnabled,
    reverbIntensity,
    processAudio,
  ]);

  return (
    <div className="min-h-screen bg-[#030711] text-blue-50">
      <header className="sticky top-0 z-50 border-b border-blue-400/20 bg-[#030711]/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-[#081124]">
                <Zap className="h-5 w-5 text-blue-100" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-wide">
                  EPICENTER DSP
                </h1>
                <p className="text-xs text-blue-200">
                  Restauración de bajos con enfoque profesional
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1.5 text-[11px] uppercase tracking-wider text-blue-200">
              {isDesktop ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <TabletSmartphone className="h-4 w-4" />
              )}
              {viewportProfile === "desktop" && "Optimizado para escritorio"}
              {viewportProfile === "mobile-portrait" &&
                "Optimizado móvil vertical"}
              {viewportProfile === "mobile-landscape" &&
                "Optimizado móvil horizontal"}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <section className="rounded-3xl border border-blue-400/20 bg-[#071225] p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                Epicenter Harmonic Bass Restoration
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-blue-50 md:text-5xl">
                Restauración armónica de baja frecuencia para sistemas que
                exigen precisión, profundidad y control real.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-blue-200 md:text-base">
                Epicenter DSP no hace “bass boost”: reconstruye información
                fundamental perdida en compresión y masterización. Esta
                implementación fue desarrollada por Abraham Isaias Garcia
                Barragan, conservando la esencia técnica del Epicenter y
                llevándola a un flujo moderno para audiófilos.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="h-11 w-full bg-blue-500 px-6 font-semibold text-white hover:bg-blue-600 sm:w-auto">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Descargar App Android
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://ko-fi.com/G2G41QLJFO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    className="h-11 w-full border-blue-300/35 bg-transparent text-blue-100 hover:bg-blue-400/5 sm:w-auto"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Apoya al proyecto
                  </Button>
                </a>
              </div>
            </div>

            <Card className="border-blue-400/20 bg-[#0b1c3a]">
              <CardContent className="space-y-4 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                  Descarga oficial
                </p>
                <p className="text-sm leading-relaxed text-blue-200">
                  Instala Epicenter DSP Player en tu Android y accede a la
                  experiencia completa desde tu dispositivo móvil.
                </p>
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    className="w-full max-w-[230px]"
                    loading="lazy"
                  />
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <AdSense adSlot="1111111111" adFormat="horizontal" />

            <Card className="border-blue-400/20 bg-[#071225]">
              <CardContent className="p-5 md:p-6">
                <YouTubeSearch
                  onAudioDownloaded={handleYouTubeDownload}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            <Card className="border-blue-400/20 bg-[#071225]">
              <CardContent className="p-5 md:p-6">
                <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-blue-400">
                  Subir archivo
                </h3>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onClear={handleFileClear}
                  selectedFile={selectedFile}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            <Card className="border-blue-400/20 bg-[#071225]">
              <CardContent className="space-y-7 p-5 md:p-6">
                <PresetSelector
                  activePreset={activePreset}
                  onSelectPreset={handlePresetSelect}
                  disabled={isProcessing}
                />

                <div className="flex flex-wrap justify-center gap-5 md:gap-8">
                  <Knob
                    value={sweepFreq}
                    min={27}
                    max={63}
                    onChange={handleKnobChange(setSweepFreq)}
                    label="SWEEP"
                    unit="Hz"
                    color="#60a5fa"
                    disabled={isProcessing}
                  />
                  <Knob
                    value={width}
                    min={0}
                    max={100}
                    onChange={handleKnobChange(setWidth)}
                    label="WIDTH"
                    unit="%"
                    color="#3b82f6"
                    disabled={isProcessing}
                  />
                  <Knob
                    value={intensity}
                    min={0}
                    max={100}
                    onChange={handleKnobChange(setIntensity)}
                    label="INTENSITY"
                    unit="%"
                    color="#2563eb"
                    disabled={isProcessing}
                  />
                  <Knob
                    value={balance}
                    min={0}
                    max={100}
                    onChange={handleKnobChange(setBalance)}
                    label="BALANCE"
                    color="blue"
                    disabled={isProcessing}
                  />
                  <Knob
                    value={volume}
                    min={100}
                    max={150}
                    onChange={handleKnobChange(setVolume)}
                    label="VOLUMEN"
                    color="#0ea5e9"
                    disabled={isProcessing}
                  />

                  <div className="flex flex-col items-center gap-4">
                    <Knob
                      value={reverbIntensity}
                      min={0}
                      max={100}
                      onChange={handleKnobChange(setReverbIntensity)}
                      label="REVERB"
                      unit="%"
                      color="#ffffff"
                      disabled={isProcessing || !reverbEnabled}
                    />
                    <div className="flex items-center gap-2 rounded-full border border-blue-400/30 px-3 py-2">
                      <Switch
                        id="reverb-mode"
                        checked={reverbEnabled}
                        onCheckedChange={setReverbEnabled}
                        disabled={isProcessing}
                      />
                      <Label
                        htmlFor="reverb-mode"
                        className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200"
                      >
                        {reverbEnabled ? "ON" : "OFF"}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-xs text-blue-400 sm:grid-cols-3">
                  <div className="rounded-lg border border-blue-400/20 bg-blue-400/[0.06] px-3 py-2">
                    Entrada: {selectedFile ? "lista" : "sin archivo"}
                  </div>
                  <div className="rounded-lg border border-blue-400/20 bg-blue-400/[0.06] px-3 py-2">
                    Proceso: {isProcessing ? "activo" : "en espera"}
                  </div>
                  <div className="rounded-lg border border-blue-400/20 bg-blue-400/[0.06] px-3 py-2">
                    Salida: {result ? "disponible" : "pendiente"}
                  </div>
                </div>

                <Button
                  onClick={handleProcess}
                  disabled={!selectedFile || isProcessing}
                  className="h-12 w-full bg-blue-500 font-semibold text-white hover:bg-blue-600"
                >
                  {isProcessing ? (
                    <>
                      <Volume2 className="mr-2 h-5 w-5 animate-pulse" />
                      PROCESANDO...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      PROCESAR AUDIO
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div>
                    <Progress value={progress} className="h-2" />
                    <p className="mt-2 text-center text-xs text-blue-200">
                      {progress}% completado
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {result && (
              <Card className="border-blue-400/20 bg-[#071225]">
                <CardContent className="space-y-5 p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm uppercase tracking-[0.15em] text-blue-200">
                      Resultado del procesamiento
                    </h2>
                    <Button
                      onClick={downloadProcessed}
                      className="bg-blue-500 font-semibold text-white hover:bg-blue-600"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar MP3
                    </Button>
                  </div>

                  <AudioPlayer
                    originalUrl={result.originalUrl}
                    processedUrl={result.processedUrl}
                  />

                  {originalSpectrum && processedSpectrum && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-xs text-blue-400">
                          Espectro original
                        </h3>
                        <SpectrumVisualizer originalData={originalSpectrum} />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xs text-blue-400">
                          Espectro procesado
                        </h3>
                        <SpectrumVisualizer processedData={processedSpectrum} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <AdSense adSlot="2222222222" adFormat="horizontal" />
          </div>

          <aside className="space-y-6">
            <AdSense adSlot="3333333333" adFormat="vertical" />

            <Card className="border-blue-400/20 bg-[#071225]">
              <CardContent className="space-y-4 p-5">
                <h3 className="text-xs uppercase tracking-[0.2em] text-blue-400">
                  Resumen técnico
                </h3>
                <div className="space-y-2 text-xs leading-relaxed text-blue-200">
                  <p>
                    Analiza la señal entrante y sintetiza fundamentales
                    coherentes en el rango bajo, en lugar de solo amplificar
                    graves existentes.
                  </p>
                  <p>
                    Útil para recuperar cuerpo en material comprimido (MP3,
                    streaming y masters con low-end limitado).
                  </p>
                  <p>
                    Implementado por Abraham Isaias Garcia Barragan para una
                    experiencia clara, precisa y orientada a Sound Quality.
                  </p>
                  <p>Ideal para Regional, Banda, Rock y Pop.</p>
                  <p>Exportación final en MP3 320 kbps.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-400/20 bg-[#071225]">
              <CardContent className="space-y-3 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                  Acceso directo
                </p>
                <h4 className="text-sm font-medium text-blue-50">
                  Descarga la app oficial en Google Play.
                </h4>
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-blue-500 font-semibold text-white hover:bg-blue-600">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Ir a Google Play
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-blue-400/30 bg-transparent text-blue-100 hover:bg-blue-400/5"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Acerca de Epicenter DSP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Epicenter de AudioControl</DialogTitle>
                  <DialogDescription>
                    Restaurador armónico inteligente de baja frecuencia,
                    implementado por Abraham Isaias Garcia Barragan.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 text-sm text-muted-foreground">
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      Restaurador armónico, no “bass boost”
                    </h3>
                    <p>
                      El Epicenter de AudioControl no es un simple procesador de
                      graves; es un restaurador armónico inteligente de bajas
                      frecuencias, diseñado para reconstruir información
                      eliminada durante compresión, masterización comercial o
                      limitación dinámica.
                    </p>
                  </section>
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      ¿Cómo trabaja técnicamente?
                    </h3>
                    <p>
                      Analiza en tiempo real el contenido espectral de la señal
                      entrante. Cuando detecta fundamentales débiles o ausentes
                      entre ~27 Hz y 63 Hz (según ajuste), genera armónicos
                      musicalmente coherentes a partir de frecuencias superiores
                      presentes en la señal original, manteniendo fase y
                      coherencia temporal.
                    </p>
                  </section>
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      ¿Por qué importa en Sound Quality?
                    </h3>
                    <div className="space-y-2">
                      <p>
                        Recupera cuerpo en grabaciones comprimidas y mejora la
                        sensación de profundidad en sistemas sellados.
                      </p>
                      <p>
                        Optimiza el rendimiento subjetivo del subwoofer sin
                        saturar la etapa de potencia y mejora percepción
                        dinámica en cabina.
                      </p>
                      <p>
                        En un sistema bien calibrado no se percibe como efecto:
                        se percibe como restauración natural del fundamento
                        armónico.
                      </p>
                    </div>
                  </section>
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      Guía de controles
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong className="text-foreground">SWEEP:</strong>{" "}
                        frecuencia central para restauración de bajos.
                      </p>
                      <p>
                        <strong className="text-foreground">WIDTH:</strong>{" "}
                        amplitud de banda procesada alrededor de SWEEP.
                      </p>
                      <p>
                        <strong className="text-foreground">INTENSITY:</strong>{" "}
                        nivel de bajos restaurados.
                      </p>
                      <p>
                        <strong className="text-foreground">BALANCE:</strong>{" "}
                        relación entre voces y bajo procesado.
                      </p>
                      <p>
                        <strong className="text-foreground">VOLUMEN:</strong>{" "}
                        ganancia final.
                      </p>
                      <p>
                        <strong className="text-foreground">
                          REVERB VOCAL:
                        </strong>{" "}
                        espacialidad adicional para voces.
                      </p>
                    </div>
                  </section>
                </div>
              </DialogContent>
            </Dialog>
          </aside>
        </div>
      </main>

      {isPortraitMobile && (
        <div className="fixed inset-x-3 bottom-3 z-40 rounded-xl border border-blue-400/20 bg-[#071225]/95 p-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-blue-200">
              Descarga la app Epicenter DSP para Android.
            </p>
            <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
              <Button className="h-8 bg-blue-500 px-4 text-xs font-semibold text-white hover:bg-blue-400">
                Descargar
              </Button>
            </a>
          </div>
        </div>
      )}

      <PWAInstallBanner />
    </div>
  );
}
