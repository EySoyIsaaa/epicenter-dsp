import { Music, Guitar, Mic2, Piano, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Preset {
  id: string;
  name: string;
  icon: React.ReactNode;
  sweepFreq: number;
  width: number;
  intensity: number;
  description: string;
  color: string;
}

const PRESETS: Preset[] = [
  {
    id: 'regional',
    name: 'Regional',
    icon: <Music className="w-5 h-5" />,
    sweepFreq: 42,
    width: 70,
    intensity: 80,
    description: 'Regional Mexicano / Banda / Corridos - Boost agresivo',
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'rock',
    name: 'Rock',
    icon: <Guitar className="w-5 h-5" />,
    sweepFreq: 47,
    width: 55,
    intensity: 68,
    description: 'Rock / Metal - Intensidad moderada',
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'pop',
    name: 'Pop',
    icon: <Mic2 className="w-5 h-5" />,
    sweepFreq: 44,
    width: 45,
    intensity: 58,
    description: 'Pop / Baladas - Preserva claridad vocal',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'classical',
    name: 'Clásica',
    icon: <Piano className="w-5 h-5" />,
    sweepFreq: 37,
    width: 35,
    intensity: 48,
    description: 'Música Clásica - Restauración sutil',
    color: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: <Settings2 className="w-5 h-5" />,
    sweepFreq: 45,
    width: 50,
    intensity: 50,
    description: 'Configuración personalizada',
    color: 'from-zinc-600 to-zinc-500',
  },
];

interface PresetSelectorProps {
  activePreset: string;
  onSelectPreset: (preset: Preset) => void;
  disabled?: boolean;
}

export function PresetSelector({
  activePreset,
  onSelectPreset,
  disabled = false,
}: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Presets por Género
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PRESETS.map((preset) => (
          <Tooltip key={preset.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => onSelectPreset(preset)}
                disabled={disabled}
                className={`
                  relative h-auto py-3 px-3 flex flex-col items-center gap-1.5
                  border-zinc-700 hover:border-zinc-600
                  ${activePreset === preset.id 
                    ? `bg-gradient-to-br ${preset.color} border-transparent text-white` 
                    : 'bg-zinc-900/50 text-zinc-400 hover:text-white'}
                  transition-all duration-200
                `}
              >
                {preset.icon}
                <span className="text-xs font-medium">{preset.name}</span>
                
                {activePreset === preset.id && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-lg" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">{preset.name}</p>
              <p className="text-xs text-zinc-400 mt-1">{preset.description}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500">Sweep:</span>
                  <span className="ml-1 font-mono">{preset.sweepFreq}Hz</span>
                </div>
                <div>
                  <span className="text-zinc-500">Width:</span>
                  <span className="ml-1 font-mono">{preset.width}%</span>
                </div>
                <div>
                  <span className="text-zinc-500">Intensity:</span>
                  <span className="ml-1 font-mono">{preset.intensity}%</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export { PRESETS };
export type { Preset };
export default PresetSelector;
