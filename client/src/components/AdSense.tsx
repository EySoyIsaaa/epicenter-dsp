import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
}

/**
 * Componente de Google AdSense
 * 
 * Uso:
 * <AdSense adSlot="1234567890" adFormat="auto" />
 * 
 * Nota: Reemplaza "ca-pub-XXXXXXXXXXXXXXXX" en index.html con tu ID de AdSense
 */
export function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block' },
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // No mostrar anuncios en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-400">
          📢 Espacio para anuncio de Google AdSense
        </p>
        <p className="text-xs text-gray-500 mt-1">
          (Los anuncios solo se muestran en producción)
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
