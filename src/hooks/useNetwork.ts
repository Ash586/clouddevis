'use client';

// ============================================================
// Rakmana — Network Detection Hook
// Wraps Capacitor Network plugin in a React hook
// Provides isOnline + connectionType + auto-reconnection
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Network, type NetworkStatus } from '@capacitor/network';

export type ConnectionType = 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'ethernet' | 'unknown' | 'none';

export interface NetworkState {
  /** Whether the device has a network connection */
  isOnline: boolean;
  /** The type of connection */
  connectionType: ConnectionType;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Last time the network status changed */
  lastChangedAt: number | null;
}

export interface UseNetworkOptions {
  /** Auto-sync callback when coming back online */
  onReconnect?: () => void | Promise<void>;
  /** Debounce time in ms before triggering reconnect (default: 1000) */
  reconnectDebounce?: number;
}

/**
 * Network detection hook backed by Capacitor Network plugin.
 *
 * @example
 * ```tsx
 * const { isOnline, connectionType } = useNetwork();
 * if (!isOnline) return <OfflineBanner />;
 * ```
 */
export function useNetwork(options: UseNetworkOptions = {}) {
  const { onReconnect, reconnectDebounce = 1000 } = options;

  const [state, setState] = useState<NetworkState>({
    isOnline: true, // Assume online initially
    connectionType: 'unknown',
    isSyncing: false,
    lastChangedAt: null,
  });

  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOffline = useRef(false);

  // ── Handle network status change ──────────────────────────
  const handleStatusChange = useCallback(
    (status: NetworkStatus) => {
      const wasOff = wasOffline.current;
      const isNowOnline = status.connected;
      const connType = (status.connectionType as ConnectionType) || 'unknown';

      setState((prev) => ({
        ...prev,
        isOnline: isNowOnline,
        connectionType: connType,
        lastChangedAt: Date.now(),
      }));

      wasOffline.current = !isNowOnline;

      // Auto-sync when coming back online (with debounce)
      if (isNowOnline && wasOff && onReconnect) {
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
        reconnectTimer.current = setTimeout(() => {
          onReconnect();
        }, reconnectDebounce);
      }
    },
    [onReconnect, reconnectDebounce]
  );

  // ── Initialize: get current status + add listener ─────────
  useEffect(() => {
    let listenerHandle: { remove: () => void } | null = null;

    async function init() {
      try {
        // Get initial status
        const status = await Network.getStatus();
        handleStatusChange(status);

        // Subscribe to changes
        listenerHandle = await Network.addListener(
          'networkStatusChange',
          handleStatusChange
        );
      } catch {
        // Capacitor not available (web browser) — fall back to navigator.onLine
        setState((prev) => ({
          ...prev,
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
          connectionType: 'unknown',
        }));

        // Browser fallback
        if (typeof window !== 'undefined') {
          const onOnline = () =>
            handleStatusChange({ connected: true, connectionType: 'unknown' } as NetworkStatus);
          const onOffline = () =>
            handleStatusChange({ connected: false, connectionType: 'none' } as NetworkStatus);

          window.addEventListener('online', onOnline);
          window.addEventListener('offline', onOffline);

          return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            if (listenerHandle) listenerHandle.remove();
          };
        }
      }
    }

    init();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (listenerHandle) listenerHandle.remove();
    };
  }, [handleStatusChange]);

  // ── Set syncing state (for UI feedback) ───────────────────
  const setSyncing = useCallback((syncing: boolean) => {
    setState((prev) => ({ ...prev, isSyncing: syncing }));
  }, []);

  // ── Force refresh ─────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const status = await Network.getStatus();
      handleStatusChange(status);
    } catch {
      // Browser fallback
      setState((prev) => ({
        ...prev,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      }));
    }
  }, [handleStatusChange]);

  return {
    ...state,
    setSyncing,
    refresh,
  };
}
