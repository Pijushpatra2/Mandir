'use client';

/**
 * OfflineContext.tsx
 *
 * Detects and broadcasts the app's online/offline status in real time.
 * All components can read `useOfflineStatus()` to know if they are online.
 *
 * HOW IT WORKS:
 *   - Reads `navigator.onLine` on mount for the initial state.
 *   - Listens to the browser's 'online' and 'offline' window events.
 *   - Exposes `isOnline`, `isOffline`, `lastOnlineAt` to all children.
 *   - Does NOT poll — the browser pushes events automatically.
 *
 * USAGE:
 *   const { isOnline, isOffline } = useOfflineStatus();
 *
 * MOUNTED:
 *   <OfflineProvider> wraps only the canteen layout (see canteenPOS/layout.tsx)
 *   so it doesn't affect the main temple website.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface OfflineContextType {
  /** True when navigator.onLine is true and 'online' event confirmed */
  isOnline: boolean;

  /** Shorthand for !isOnline */
  isOffline: boolean;

  /** Timestamp (Date.now()) of the last time the device came online */
  lastOnlineAt: number | null;

  /** Timestamp of the last time the device went offline */
  lastOfflineAt: number | null;

  /** Number of times the connection was lost in this session */
  offlineCount: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // SSR guard: assume online until we can read navigator
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(null);
  const [lastOfflineAt, setLastOfflineAt] = useState<number | null>(null);
  const [offlineCount, setOfflineCount] = useState<number>(0);

  // Track if initial state has been set from navigator
  const initialised = useRef(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineAt(Date.now());
    console.info('[OfflineContext] Connection restored.');
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setLastOfflineAt(Date.now());
    setOfflineCount((c) => c + 1);
    console.warn('[OfflineContext] Connection lost. Switching to offline mode.');
  }, []);

  useEffect(() => {
    // Set the real initial state from navigator (client-side only)
    if (!initialised.current) {
      setIsOnline(navigator.onLine);
      initialised.current = true;
    }

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOffline: !isOnline,
        lastOnlineAt,
        lastOfflineAt,
        offlineCount,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useOfflineStatus
 *
 * Returns the current online/offline state.
 * Must be used inside <OfflineProvider>.
 *
 * @example
 * const { isOnline, isOffline } = useOfflineStatus();
 * if (isOffline) return <div>Working offline...</div>;
 */
export function useOfflineStatus(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineStatus must be used within <OfflineProvider>');
  }
  return context;
}
