import { Component, ReactNode } from 'react';
import { Card } from './ui/card';
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary específico para componentes Google Maps.
 * Captura erros de loop infinito, API não carregada e outros crashes do Maps.
 */
export default class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Erro desconhecido no mapa',
    };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[MapErrorBoundary] Google Maps error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 bg-destructive/10 border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">
                {this.props.fallbackMessage || 'Erro ao carregar o mapa'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                O componente de mapa encontrou um problema. Isso pode ocorrer quando a API key do Google Maps tem restrições de domínio ou quando a API não está habilitada.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  Verificar configuração da API
                </a>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
