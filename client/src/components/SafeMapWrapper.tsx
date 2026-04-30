import { useState, useEffect, ReactNode } from 'react';
import { Card } from './ui/card';
import { MapPin, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  height?: string;
  fallbackMessage?: string;
}

/**
 * Wrapper seguro para componentes Google Maps.
 * Detecta RefererNotAllowedMapError (erro de domínio não autorizado) via window.onerror
 * e exibe um fallback amigável com instruções para resolver.
 *
 * Diferente do MapErrorBoundary (que captura crashes React),
 * este componente captura erros de console/window do Google Maps SDK.
 */
export default function SafeMapWrapper({ children, height = '400px', fallbackMessage }: Props) {
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    // Detecta erros do Google Maps via window.onerror
    const originalOnError = window.onerror;

    const handleError = (
      message: string | Event,
      source?: string,
      _lineno?: number,
      _colno?: number,
      _error?: Error
    ) => {
      const msg = typeof message === 'string' ? message : String(message);
      const src = source || '';

      // Detecta erros específicos do Google Maps
      if (
        src.includes('maps.googleapis.com') ||
        msg.includes('RefererNotAllowedMapError') ||
        msg.includes('InvalidKeyMapError') ||
        msg.includes('MapsServerError') ||
        msg.includes('ApiNotActivatedMapError')
      ) {
        setMapsError(msg);
        return true; // Suprime o erro do console
      }

      // Chama o handler original para outros erros
      if (typeof originalOnError === 'function') {
        return originalOnError(message, source, _lineno, _colno, _error);
      }
      return false;
    };

    window.onerror = handleError;

    // Também detecta via console.error (Google Maps usa isso)
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = args.join(' ');
      if (
        msg.includes('RefererNotAllowedMapError') ||
        msg.includes('InvalidKeyMapError') ||
        msg.includes('ApiNotActivatedMapError') ||
        (msg.includes('Google Maps') && msg.includes('error'))
      ) {
        setMapsError(msg);
        return; // Suprime do console
      }
      originalConsoleError(...args);
    };

    return () => {
      window.onerror = originalOnError;
      console.error = originalConsoleError;
    };
  }, []);

  if (mapsError) {
    const isRefererError =
      mapsError.includes('RefererNotAllowed') || mapsError.includes('referer');
    const isKeyError = mapsError.includes('InvalidKey') || mapsError.includes('ApiNotActivated');

    return (
      <Card
        className="border-amber-500/30 bg-amber-500/5"
        style={{ minHeight: height, display: 'flex', alignItems: 'center' }}
      >
        <div className="p-6 w-full">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">
                {fallbackMessage || 'Mapa indisponível'}
              </h3>

              {isRefererError && (
                <>
                  <p className="text-sm text-muted-foreground mt-1">
                    A API key do Google Maps não está autorizada para este domínio. Para resolver,
                    adicione os domínios abaixo nas restrições da API key no Google Cloud Console:
                  </p>
                  <div className="mt-3 p-3 bg-muted rounded-md font-mono text-xs space-y-1">
                    <div>https://stripmallia-yczurrez.manus.space/*</div>
                    <div>https://*.manusvm.computer/*</div>
                    <div>https://*.manus.computer/*</div>
                    <div>http://localhost:3000/*</div>
                    <div>http://localhost:3002/*</div>
                  </div>
                </>
              )}

              {isKeyError && (
                <p className="text-sm text-muted-foreground mt-1">
                  A API key do Google Maps é inválida ou a API Maps JavaScript não está habilitada
                  no Google Cloud Console.
                </p>
              )}

              {!isRefererError && !isKeyError && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ocorreu um erro ao carregar o Google Maps. Verifique a configuração da API key.
                </p>
              )}

              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMapsError(null)}
                  className="gap-2"
                >
                  Tentar novamente
                </Button>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir Google Cloud Console
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
