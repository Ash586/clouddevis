'use client';

// ============================================================
// Rakmana — Network Detection Hook
// Detects online/offline using native bridge or browser APIs
// Provides isOnline + connectionType + auto-reconnection
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { checkIsOnline, isNativePlatform } from '@/lib/native';

export type ConnectionType = 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'ethernet' | 'unknown' | 'none';

export interface NetworkState {
  isOnline: boolean;
  connectionType: ConnectionType;
  isSyncing: boolean;
  lastChangedAt: number | null;
}

export interface UseNetworkOptions {
  onReconnect?: () => void | Promise<void>;
  reconnectDebounce?: number;
}

export function useNetwork(options: UseNetworkOptions = {}) {
  const { onReconnect, reconnectDebounce = 1000 } = options;

  const [state, setState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown',
    isSyncing: false,
    lastChangedAt: null,
  });

  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOffline = useRef(false);

  const handleStatusChange = useCallback(
    (online: boolean) => {
      const wasOff = wasOffline.current;
      const connType: ConnectionType = online ? 'unknown' : 'none';

      setState((prev) => ({
        ...prev,
        isOnline: online,
        connectionType: connType,
        lastChangedAt: Date.now(),
      }));

      wasOffline.current = !online;

      if (online && wasOff && onReconnect) {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => {
          onReconnect();
        }, reconnectDebounce);
      }
    },
    [onReconnect, reconnectDebounce]
  );

  useEffect(() => {
    if (isNativePlatform()) {
      // On Android, poll network status periodically (no plugin listener)
      const interval = setInterval(() => {
        handleStatusChange(checkIsOnline());
      }, 3000);
      return () => {
        clearInterval(interval);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      };
    }

    // Browser fallback — use online/offline events
    const onOnline = () => handleStatusChange(true);
    const onOffline = () => handleStatusChange(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [handleStatusChange]);

  const setSyncing = useCallback((syncing: boolean) => {
    setState((prev) => ({ ...prev, isSyncing: syncing }));
  }, []);

  const refresh = useCallback(async () => {
    handleStatusChange(checkIsOnline());
  }, [handleStatusChange]);

  return {
    ...state,
    setSyncing,
    refresh,
  };
}
