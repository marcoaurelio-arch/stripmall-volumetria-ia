import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SafeMapWrapper from '../components/SafeMapWrapper';

// Mock clipboard API
const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
});

describe('SafeMapWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore any patched globals
    vi.restoreAllMocks();
  });

  it('renders children when no Maps error occurs', () => {
    render(
      <SafeMapWrapper>
        <div data-testid="map-content">Map content</div>
      </SafeMapWrapper>
    );
    expect(screen.getByTestId('map-content')).toBeInTheDocument();
  });

  it('shows RefererNotAllowedMapError fallback when window.onerror fires with Maps error', async () => {
    render(
      <SafeMapWrapper>
        <div data-testid="map-content">Map content</div>
      </SafeMapWrapper>
    );

    // Simulate Google Maps error via window.onerror
    act(() => {
      window.onerror?.(
        'Google Maps JavaScript API error: RefererNotAllowedMapError',
        'https://maps.googleapis.com/maps-api-v3/api/js/main.js',
        1, 1, undefined
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Domínio não autorizado na API key')).toBeInTheDocument();
    });

    // Should show the list of authorized domains
    expect(screen.getByText('http://localhost:3000/*')).toBeInTheDocument();
    expect(screen.getByText('http://localhost:3002/*')).toBeInTheDocument();

    // Should show the error badge
    expect(screen.getByText('RefererNotAllowedMapError')).toBeInTheDocument();

    // Children should be hidden
    expect(screen.queryByTestId('map-content')).not.toBeInTheDocument();
  });

  it('shows InvalidKeyMapError fallback when console.error fires', async () => {
    render(
      <SafeMapWrapper>
        <div data-testid="map-content">Map content</div>
      </SafeMapWrapper>
    );

    act(() => {
      console.error('Google Maps JavaScript API error: InvalidKeyMapError');
    });

    await waitFor(() => {
      expect(screen.getByText('API key inválida ou ausente')).toBeInTheDocument();
    });

    expect(screen.getByText('InvalidKeyMapError')).toBeInTheDocument();
  });

  it('shows ApiNotActivatedMapError fallback', async () => {
    render(
      <SafeMapWrapper>
        <div data-testid="map-content">Map content</div>
      </SafeMapWrapper>
    );

    act(() => {
      console.error('Google Maps JavaScript API error: ApiNotActivatedMapError');
    });

    await waitFor(() => {
      expect(screen.getByText('Maps JavaScript API não está ativada')).toBeInTheDocument();
    });
  });

  it('shows custom fallbackMessage when provided', async () => {
    render(
      <SafeMapWrapper fallbackMessage="Mapa de localização indisponível">
        <div>Map</div>
      </SafeMapWrapper>
    );

    act(() => {
      console.error('Google Maps JavaScript API error: RefererNotAllowedMapError');
    });

    await waitFor(() => {
      expect(screen.getByText('Mapa de localização indisponível')).toBeInTheDocument();
    });
  });

  it('shows retry button that resets the error state', async () => {
    const user = userEvent.setup();

    render(
      <SafeMapWrapper>
        <div data-testid="map-content">Map content</div>
      </SafeMapWrapper>
    );

    // Trigger error
    act(() => {
      console.error('Google Maps JavaScript API error: RefererNotAllowedMapError');
    });

    await waitFor(() => {
      expect(screen.getByText('Domínio não autorizado na API key')).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    // Children should be visible again
    await waitFor(() => {
      expect(screen.getByTestId('map-content')).toBeInTheDocument();
    });
  });

  it('copies all domains to clipboard when "Copiar todos" is clicked', async () => {
    const user = userEvent.setup();
    // Spy on clipboard inside the test to ensure it's set up after jsdom init
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    render(
      <SafeMapWrapper>
        <div>Map</div>
      </SafeMapWrapper>
    );

    act(() => {
      console.error('Google Maps JavaScript API error: RefererNotAllowedMapError');
    });

    await waitFor(() => {
      expect(screen.getByText(/Copiar todos/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Copiar todos/i));

    expect(clipboardSpy).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000/*')
    );

    // Should show "Copiado!" feedback
    await waitFor(() => {
      expect(screen.getByText(/Copiado!/i)).toBeInTheDocument();
    });

    clipboardSpy.mockRestore();
  });

  it('does not intercept non-Maps console.error calls', () => {
    const originalConsoleError = console.error;
    const spy = vi.fn();

    render(
      <SafeMapWrapper>
        <div>Map</div>
      </SafeMapWrapper>
    );

    // Replace with spy after component mounts (component patches console.error)
    const patchedConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      spy(...args);
      patchedConsoleError(...args);
    };

    act(() => {
      console.error('Some unrelated error');
    });

    // Non-Maps errors should pass through
    expect(spy).toHaveBeenCalledWith('Some unrelated error');

    console.error = originalConsoleError;
  });

  it('detects error from maps.googleapis.com source in window.onerror', async () => {
    render(
      <SafeMapWrapper>
        <div data-testid="map-content">Map</div>
      </SafeMapWrapper>
    );

    act(() => {
      window.onerror?.(
        'Script error',
        'https://maps.googleapis.com/maps-api-v3/api/js/64/9c/main.js',
        1, 1, undefined
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('map-content')).not.toBeInTheDocument();
    });
  });
});
