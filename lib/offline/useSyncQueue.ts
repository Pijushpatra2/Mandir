'use client';

/**
 * useSyncQueue.ts
 *
 * The Offline Sync Worker — runs in the background inside the canteen app.
 *
 * WHAT IT DOES:
 *   1. Registers the service worker (sw.js) on mount.
 *   2. Listens for the browser 'online' event.
 *   3. When the device comes back online, fires a bulk sync to the server.
 *   4. Reads all 'pending' entries from Dexie sync_queue.
 *   5. Sends them as a single POST /api/canteen/sync/bulk request.
 *   6. On success: marks entries 'done', clears them, invalidates query cache.
 *   7. On failure: marks entries 'failed' with the error message.
 *
 * DEDUPE SAFETY:
 *   Each entry has a `clientId` (UUID). The server skips any action whose
 *   clientId already exists in the database, making sync idempotent.
 *
 * USAGE:
 *   Mounted headlessly inside CanteenBootstrap (canteenPOS/layout.tsx).
 *   No props needed — it runs automatically.
 *
 * @example
 * function CanteenBootstrap() {
 *   useDbSeed();
 *   useSyncQueue();
 *   return null;
 * }
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import {
  db,
  getPendingSyncItems,
  clearSyncedItems,
  type SyncQueueEntry,
} from '@/lib/offline/db';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SyncResult {
  clientId: string;
  action: string;
  status: 'succeeded' | 'skipped' | 'failed';
  error?: string;
}

interface BulkSyncResponse {
  total: number;
  succeeded: number;
  skipped: number;
  failed: number;
  results: SyncResult[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSyncQueue() {
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);

  // ── Register Service Worker ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          console.info('[SyncQueue] Stale service worker registrations found. Purging...');
          Promise.all(registrations.map((r) => r.unregister())).then(() => {
            if (typeof caches !== 'undefined') {
              caches.keys().then((names) => {
                Promise.all(names.map((name) => caches.delete(name))).then(() => {
                  window.location.reload();
                });
              });
            } else {
              window.location.reload();
            }
          });
        }
      });
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/canteenPOS/' })
      .then((reg) => {
        console.info('[SyncQueue] Service worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SyncQueue] Service worker registration failed:', err);
      });
  }, []);

  // ── Sync Trigger ──────────────────────────────────────────────────────────
  const runSync = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    // Guard: Only sync queue if canteen staff is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('canteen_staff_access_token') : null;
    if (!token) {
      isSyncing.current = false;
      return;
    }

    try {
      const pending = await getPendingSyncItems();
      if (pending.length === 0) {
        console.info('[SyncQueue] Nothing to sync.');
        isSyncing.current = false;
        return;
      }

      console.info(`[SyncQueue] Syncing ${pending.length} queued action(s)...`);

      // Mark all as 'syncing' before sending
      await db.sync_queue
        .where('status')
        .equals('pending')
        .modify({ status: 'syncing' });

      // Send the bulk payload to the server
      const { data } = await staffApiClient.post<{
        success: boolean;
        data: BulkSyncResponse;
      }>('/canteen/sync/bulk', { actions: pending });

      const result = data.data;
      console.info(
        `[SyncQueue] Sync complete — ` +
        `succeeded: ${result.succeeded}, skipped: ${result.skipped}, failed: ${result.failed}`
      );

      // Update individual entry statuses based on server response
      await Promise.all(
        result.results.map(async (r) => {
          const newStatus = r.status === 'failed' ? 'failed' : 'done';
          await db.sync_queue
            .where('clientId')
            .equals(r.clientId)
            .modify((entry) => {
              entry.status = newStatus;
              entry.errorMessage = r.error ?? null;
              entry.attempts = (entry.attempts ?? 0) + 1;
            });
        })
      );

      // Mark local orders as synced
      const succeededIds = result.results
        .filter((r) => r.status !== 'failed')
        .map((r) => r.clientId);

      if (succeededIds.length > 0) {
        await db.local_orders
          .where('clientId')
          .anyOf(succeededIds)
          .modify({ synced: true });
      }

      // Clean up done entries
      await clearSyncedItems();

      // Refresh all affected query caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitchenQueue() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory() });
    } catch (err: any) {
      console.error('[SyncQueue] Bulk sync failed:', err?.message ?? err);

      // Mark all syncing entries as failed for retry on next reconnect
      await db.sync_queue
        .where('status')
        .equals('syncing')
        .modify((entry) => {
          entry.status = 'failed';
          entry.errorMessage = err?.message ?? 'Unknown sync error';
          entry.attempts = (entry.attempts ?? 0) + 1;
        });
    } finally {
      isSyncing.current = false;
    }
  }, [queryClient]);

  // ── Online Event Listener ─────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      console.info('[SyncQueue] Device came online — starting sync...');
      // Small delay to ensure connection is stable before syncing
      setTimeout(runSync, 2000);
    };

    window.addEventListener('online', handleOnline);

    // Also run sync if the app loads while already online and queue has items
    if (navigator.onLine) {
      setTimeout(runSync, 3000); // 3s delay after boot to let app settle
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [runSync]);
}
