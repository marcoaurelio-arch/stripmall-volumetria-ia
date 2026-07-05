import { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { AlertTriangle, ExternalLink, Copy, CheckCheck, MapPin, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Props {
  children: ReactNode;
  /** Altura mínima do fallback (default: 400px) */
  height?: string;
  /** Mensagem customizada para o título do aviso */
  fallbackMessage?: string;
}

type MapsErrorType = 'referer' | 'invalid-key' | 'api-not-activated' | 'quota' | 'unknown';

interface MapsError {
  type: MapsErrorType;
  raw: string;
}

const STATIC_AUTHORIZED_DOMAINS = [
  'http://localhost:3000/*',
  'http://localhost:3002/*',
];

function buildAuthorizedDomains(currentOrigin: string): string[] {
  return Array.from(new Set([`${currentOrigin}/*`, ...STATIC_AUTHORIZED_DOMAINS]));
}

function classifyError(msg: string): MapsErrorType {
  if (msg.includes('RefererNotAllowed') || msg.includes('referer')) return 'referer';
  if (msg.includes('InvalidKey')) return 'invalid-key';
  if (msg.includes('ApiNotActivated')) return 'api-not-activated';
  if (msg.includes('OverQuota') || msg.includes('quota')) return 'quota';
  return 'unknown';
}

function isMapsError(msg: string, src?: string): boolean {
  const mapsSource = (src || '').includes('maps.googleapis.com');
  const mapsKeywords = [
    'RefererNotAllowedMapError',
    'InvalidKeyMapError',
    'ApiNotActivatedMapError',
    'OverQuotaMapError',
    'MapsServerError',
    'Google Maps JavaScript API error',
  ];
  return mapsSource || mapsKeywords.some((kw) => msg.includes(kw));
}

/**
 * Wrapper seguro para componentes Google Maps.
 *
 * Detecta erros de domínio não autorizado (RefererNotAllowedMapError),
 * API key inválida, API não ativada e quota excedida via múltiplos mecanismos:
 * - window.onerror (erros JavaScript do SDK)
 * - console.error (mensagens de erro do Google Maps)
 * - MutationObserver (banner de erro injetado no DOM pelo Google Maps)
 *
 * Exibe um aviso claro e acionável em vez de deixar a página travar.
 */
export default function SafeMapWrapper({ children, height = '400px', fallbackMessage }: Props) {
  const [mapsError, setMapsError] = useState<MapsError | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const detectedRef = useRef(false);
  const authorizedDomains = buildAuthorizedDomains(window.location.origin);

  const reportError = useCallback((raw: string) => {
    if (detectedRef.current) return;
    detectedRef.current = true;
    setMapsError({ type: classifyError(raw), raw });
  }, []);

  const handleRetry = () => {
    detectedRef.current = false;
    setMapsError(null);
  };

  const copyDomains = async () => {
    await navigator.clipboard.writeText(authorizedDomains.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // 1. Intercepta window.onerror
    const prevOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const msg = typeof message === 'string' ? message : String(message);
      if (isMapsError(msg, source)) {
        reportError(msg);
        return true; // suprime o erro do console
      }
      return typeof prevOnError === 'function'
        ? prevOnError(message, source, lineno, colno, error)
        : false;
    };

    // 2. Intercepta console.error
    const prevConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = args.map(String).join(' ');
      if (isMapsError(msg)) {
        reportError(msg);
        return; // suprime do console
      }
      prevConsoleError(...args);
    };

    // 3. MutationObserver — Google Maps injeta um div com classe "gm-err-container"
    //    quando a API key não está autorizada para o domínio
    const observer = new MutationObserver(() => {
      const errContainer = document.querySelector('.gm-err-container');
      const errMessage = document.querySelector('.gm-err-message');
      if (errContainer || errMessage) {
        const text = errMessage?.textContent || 'RefererNotAllowedMapError';
        reportError(text);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.onerror = prevOnError;
      console.error = prevConsoleError;
      observer.disconnect();
    };
  }, [reportError]);

  if (mapsError) {
    const { type } = mapsError;

    const titles: Record<MapsErrorType, string> = {
      referer: 'Domínio não autorizado na API key',
      'invalid-key': 'API key inválida ou ausente',
      'api-not-activated': 'Maps JavaScript API não está ativada',
      quota: 'Limite de requisições atingido',
      unknown: 'Erro ao carregar o Google Maps',
    };

    const badges: Record<MapsErrorType, { label: string; className: string }> = {
      referer: { label: 'RefererNotAllowedMapError', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
      'invalid-key': { label: 'InvalidKeyMapError', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      'api-not-activated': { label: 'ApiNotActivatedMapError', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      quota: { label: 'OverQuotaMapError', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      unknown: { label: 'MapsError', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
    };

    return (
      <div
        ref={containerRef}
        className="w-full rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 flex items-center justify-center"
        style={{ minHeight: height }}
      >
        <div className="p-6 w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-foreground text-sm">
                  {fallbackMessage || titles[type]}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-1.5 py-0 border-0 ${badges[type].className}`}
                >
                  {badges[type].label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {type === 'referer' && (
                  <>O domínio <code className="bg-muted px-1 rounded text-[10px]">{window.location.hostname}</code> não está na lista de domínios autorizados da API key.</>
                )}
                {type === 'invalid-key' && 'Verifique se a variável VITE_GOOGLE_MAPS_API_KEY está configurada corretamente.'}
                {type === 'api-not-activated' && 'Ative a Maps JavaScript API no Google Cloud Console para este projeto.'}
                {type === 'quota' && 'O limite de requisições da API foi atingido. Verifique as cotas no Google Cloud Console.'}
                {type === 'unknown' && 'Verifique a configuração da API key no Google Cloud Console.'}
              </p>
            </div>
          </div>

          {/* Domínios a autorizar (apenas para erro de referer) */}
          {type === 'referer' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Adicione estes domínios na API key:
                </span>
                <button
                  onClick={copyDomains}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {copied ? (
                    <><CheckCheck className="h-3 w-3" /> Copiado!</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Copiar todos</>
                  )}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 divide-y divide-border overflow-hidden">
                {authorizedDomains.map((domain) => (
                  <div
                    key={domain}
                    className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground hover:bg-muted transition-colors flex items-center justify-between group"
                  >
                    <span>{domain}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(domain)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copiar"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-1.5 h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar novamente
            </Button>
            <a
              href={
                type === 'referer'
                  ? 'https://console.cloud.google.com/apis/credentials'
                  : type === 'api-not-activated'
                  ? 'https://console.cloud.google.com/apis/library/maps-backend.googleapis.com'
                  : 'https://console.cloud.google.com/apis/dashboard'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {type === 'referer' ? 'Abrir Credenciais' : 'Abrir Cloud Console'}
            </a>
          </div>

          {/* Placeholder do mapa */}
          <div className="mt-4 rounded-lg border border-dashed border-border/50 bg-muted/20 flex items-center justify-center py-4 gap-2 text-muted-foreground/40">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">Mapa indisponível</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
