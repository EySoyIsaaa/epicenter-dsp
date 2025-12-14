import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Clock, Settings2, FileAudio, ArrowLeft, LogIn } from 'lucide-react';
import { Link } from 'wouter';
import { getLoginUrl } from '@/const';

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: history, isLoading } = trpc.history.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container py-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Historial</h1>
                  <p className="text-xs text-muted-foreground">Procesamiento anterior</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-16">
          <Card className="max-w-md mx-auto border-border/50 bg-card/80">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Inicia sesión</h2>
              <p className="text-muted-foreground mb-6">
                Inicia sesión para ver tu historial de procesamiento y guardar tus configuraciones.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <a href={getLoginUrl()}>Iniciar Sesión</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Historial</h1>
                  <p className="text-xs text-muted-foreground">Tus procesamientos anteriores</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : !history || history.length === 0 ? (
          <Card className="max-w-md mx-auto border-border/50 bg-card/80">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileAudio className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sin historial</h2>
              <p className="text-muted-foreground mb-6">
                Aún no has procesado ningún archivo. ¡Comienza a procesar audio para ver tu historial aquí!
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/">Procesar Audio</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{history.length} procesamientos</h2>
            </div>

            <div className="grid gap-4">
              {history.map((item) => (
                <Card key={item.id} className="border-border/50 bg-card/80 hover:bg-card transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-600/20 rounded-lg">
                          <FileAudio className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground truncate max-w-[300px]">
                            {item.fileName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(item.createdAt)}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{item.fileFormat}</span>
                            <span>{item.sampleRate} Hz</span>
                            <span>{formatDuration(item.duration)}</span>
                            <span>{item.channels === 1 ? 'Mono' : 'Estéreo'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {item.presetUsed && (
                          <span className="px-2 py-1 bg-secondary rounded text-xs font-medium capitalize">
                            {item.presetUsed}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Settings2 className="w-3 h-3 text-red-500" />
                            <span className="font-mono">{item.sweepFreq}Hz</span>
                          </div>
                          <span className="font-mono text-orange-500">{item.width}%</span>
                          <span className="font-mono text-yellow-500">{item.intensity}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
