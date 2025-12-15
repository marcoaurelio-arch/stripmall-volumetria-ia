import { Card } from './ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

/**
 * Componente de Verificação de Variáveis de Ambiente
 * 
 * Use este componente temporariamente em qualquer página para verificar
 * se as variáveis de ambiente estão sendo carregadas corretamente.
 * 
 * Exemplo de uso:
 * import EnvChecker from '@/components/EnvChecker';
 * 
 * function MyPage() {
 *   return (
 *     <div>
 *       <EnvChecker />
 *       // ... resto do conteúdo
 *     </div>
 *   );
 * }
 */
export default function EnvChecker() {
  const envVars = {
    'VITE_GOOGLE_MAPS_API_KEY': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    'VITE_APP_TITLE': import.meta.env.VITE_APP_TITLE,
    'VITE_APP_LOGO': import.meta.env.VITE_APP_LOGO,
    'VITE_APP_ID': import.meta.env.VITE_APP_ID,
    'VITE_FRONTEND_FORGE_API_KEY': import.meta.env.VITE_FRONTEND_FORGE_API_KEY,
    'VITE_FRONTEND_FORGE_API_URL': import.meta.env.VITE_FRONTEND_FORGE_API_URL,
  };

  const maskValue = (value: string | undefined) => {
    if (!value) return 'undefined';
    if (value.length > 20) {
      return `${value.substring(0, 8)}...${value.substring(value.length - 4)} (${value.length} chars)`;
    }
    return value;
  };

  const googleMapsConfigured = !!envVars['VITE_GOOGLE_MAPS_API_KEY'];

  return (
    <Card className="p-6 mb-6 bg-slate-900 border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Verificação de Variáveis de Ambiente</h3>
      </div>

      <div className="space-y-3">
        {Object.entries(envVars).map(([key, value]) => {
          const isConfigured = !!value;
          const isRequired = key === 'VITE_GOOGLE_MAPS_API_KEY';

          return (
            <div key={key} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
              {isConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRequired ? 'text-red-400' : 'text-yellow-400'}`} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-blue-300">{key}</code>
                  {isRequired && !isConfigured && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                      Obrigatória
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono break-all">
                  {isConfigured ? maskValue(value) : 'Não configurada'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!googleMapsConfigured && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-red-300 mb-2">
            ⚠️ Google Maps API Key não configurada
          </h4>
          <p className="text-xs text-red-200/80 mb-3">
            Os componentes de mapa não funcionarão sem esta variável.
          </p>
          <div className="text-xs text-red-200/70 space-y-1">
            <p className="font-semibold">Como resolver:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Acesse Settings → Secrets no painel de gerenciamento</li>
              <li>Adicione: <code className="bg-red-900/30 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>Cole sua chave do Google Maps API</li>
              <li>Reinicie o servidor de desenvolvimento</li>
            </ol>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          💡 <strong>Dica:</strong> Remova este componente após verificar que tudo está funcionando.
        </p>
      </div>
    </Card>
  );
}
