import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ADMIN_AUTH_CONFIG } from '../config/auth';
import {
  localStorageRepository,
  normalizeAppData,
  STORAGE_KEY,
  SUPABASE_CONFIG,
} from '../services/storage';
import {
  loadRemoteState,
  saveRemoteState,
  subscribeRemoteState,
} from '../services/supabaseClient';
import type {
  AppData,
  CalendarEvent,
  InventoryProduct,
  PortfolioItem,
  PortfolioProfile,
  ProductInterest,
  ToastItem,
} from '../types';
import { computeProductStatus, generateId } from '../utils/format';

export type CloudSyncStatus = 'local' | 'syncing' | 'synced' | 'error';

interface AppContextValue {
  data: AppData;
  isAuthenticated: boolean;
  syncStatus: CloudSyncStatus;
  syncError: string | null;
  forceSyncToCloud: () => Promise<boolean>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  publicUrl: string;
  publicPath: string;
  // Profile
  updateProfile: (patch: Partial<PortfolioProfile>) => void;
  // Portfolio items
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'order'>) => void;
  updatePortfolioItem: (id: string, patch: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;
  movePortfolioItem: (id: string, direction: 'up' | 'down') => void;
  // Calendar events
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  bookEventSlot: (
    eventId: string,
    booking: { clientName: string; clientContact: string; notes: string }
  ) => void;
  requestCustomBooking: (booking: {
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    clientName: string;
    clientContact: string;
    notes: string;
  }) => void;
  // Inventory products
  addProduct: (product: Omit<InventoryProduct, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, patch: Partial<InventoryProduct>) => void;
  deleteProduct: (id: string) => void;
  adjustProductStock: (id: string, delta: number) => void;
  registerProductInterest: (payload: {
    productId: string;
    quantity: number;
    visitorName: string;
    visitorContact: string;
    notes: string;
  }) => { ok: boolean; message: string };
  toggleInterestResolved: (interestId: string) => void;
  deleteInterest: (interestId: string) => void;
  // Backup / Seed
  resetToSeed: () => void;
  exportDataJSON: () => string;
  importDataJSON: (raw: string) => void;
  // Toasts
  toasts: ToastItem[];
  notify: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => localStorageRepository.load());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(ADMIN_AUTH_CONFIG.sessionKey) === 'authenticated';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(
    SUPABASE_CONFIG.isConfigured ? 'syncing' : 'local'
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const lastRemoteTimestampRef = useRef<string>('');

  const notify = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const persistToCloud = useCallback((payload: AppData) => {
    if (!SUPABASE_CONFIG.isConfigured) return;
    setSyncStatus('syncing');
    setSyncError(null);
    lastRemoteTimestampRef.current = payload.updatedAt;
    void saveRemoteState(payload)
      .then(() => {
        setSyncStatus('synced');
      })
      .catch((err: unknown) => {
        setSyncStatus('error');
        setSyncError(err instanceof Error ? err.message : 'Falha ao sincronizar com Supabase.');
      });
  }, []);

  const commit = useCallback(
    (updater: (prev: AppData) => AppData) => {
      setData((prev) => {
        const next: AppData = {
          ...updater(prev),
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorageRepository.save(next);
        } catch {
          // Fallback if storage quota exceeded (e.g., very large base64 image)
        }
        persistToCloud(next);
        return next;
      });
    },
    [persistToCloud]
  );

  // Initial load + Realtime sync when Supabase is configured
  useEffect(() => {
    if (!SUPABASE_CONFIG.isConfigured) return;

    let active = true;
    setSyncStatus('syncing');
    setSyncError(null);

    void loadRemoteState()
      .then((remote) => {
        if (!active) return;
        if (remote) {
          const normalized = normalizeAppData(remote);
          lastRemoteTimestampRef.current = normalized.updatedAt;
          setData(normalized);
          try {
            localStorageRepository.save(normalized);
          } catch {
            // Ignore local cache quota issues
          }
          setSyncStatus('synced');
        } else {
          // Seed initial data into Supabase automatically on first connection
          const localSeed = localStorageRepository.load();
          lastRemoteTimestampRef.current = localSeed.updatedAt;
          return saveRemoteState(localSeed).then(() => {
            if (active) setSyncStatus('synced');
          });
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setSyncStatus('error');
        setSyncError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar dados do Supabase. Verifique o schema.sql.'
        );
      });

    const unsubscribe = subscribeRemoteState((remotePayload) => {
      if (!active) return;
      if (remotePayload.updatedAt === lastRemoteTimestampRef.current) return;
      const normalized = normalizeAppData(remotePayload);
      lastRemoteTimestampRef.current = normalized.updatedAt;
      setData(normalized);
      try {
        localStorageRepository.save(normalized);
      } catch {
        // Ignore
      }
      setSyncStatus('synced');
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const forceSyncToCloud = useCallback(async (): Promise<boolean> => {
    if (!SUPABASE_CONFIG.isConfigured) return false;
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const payload: AppData = { ...data, updatedAt: new Date().toISOString() };
      lastRemoteTimestampRef.current = payload.updatedAt;
      await saveRemoteState(payload);
      localStorageRepository.save(payload);
      setData(payload);
      setSyncStatus('synced');
      return true;
    } catch (err: unknown) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : 'Erro ao sincronizar com Supabase.');
      return false;
    }
  }, [data]);

  // Real-time synchronization across browser tabs (Admin <-> Public Portfolio)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setData(localStorageRepository.load());
      }
      if (event.key === ADMIN_AUTH_CONFIG.sessionKey) {
        setIsAuthenticated(event.newValue === 'authenticated');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const normalizedUser = username.trim().toLowerCase();
    const expectedUser = ADMIN_AUTH_CONFIG.username.trim().toLowerCase();
    const ok =
      (normalizedUser === expectedUser || normalizedUser === 'admin') &&
      password === ADMIN_AUTH_CONFIG.password;
    if (ok) {
      window.localStorage.setItem(ADMIN_AUTH_CONFIG.sessionKey, 'authenticated');
      setIsAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(ADMIN_AUTH_CONFIG.sessionKey);
    setIsAuthenticated(false);
  }, []);

  const publicPath = `/p/${data.profile.slug || 'estudio-atlas'}`;
  const publicUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${publicPath}` : publicPath;

  const updateProfile = useCallback(
    (patch: Partial<PortfolioProfile>) => {
      commit((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...patch },
      }));
    },
    [commit]
  );

  const addPortfolioItem = useCallback(
    (item: Omit<PortfolioItem, 'id' | 'order'>) => {
      commit((prev) => {
        const nextOrder = prev.portfolioItems.length;
        return {
          ...prev,
          portfolioItems: [
            ...prev.portfolioItems,
            { ...item, id: generateId('proj'), order: nextOrder },
          ],
        };
      });
    },
    [commit]
  );

  const updatePortfolioItem = useCallback(
    (id: string, patch: Partial<PortfolioItem>) => {
      commit((prev) => ({
        ...prev,
        portfolioItems: prev.portfolioItems.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      }));
    },
    [commit]
  );

  const deletePortfolioItem = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        portfolioItems: prev.portfolioItems
          .filter((item) => item.id !== id)
          .map((item, idx) => ({ ...item, order: idx })),
      }));
    },
    [commit]
  );

  const movePortfolioItem = useCallback(
    (id: string, direction: 'up' | 'down') => {
      commit((prev) => {
        const sorted = [...prev.portfolioItems].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex((i) => i.id === id);
        if (index === -1) return prev;
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sorted.length) return prev;
        const temp = sorted[index];
        sorted[index] = sorted[swapIndex];
        sorted[swapIndex] = temp;
        return {
          ...prev,
          portfolioItems: sorted.map((item, idx) => ({ ...item, order: idx })),
        };
      });
    },
    [commit]
  );

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
      commit((prev) => ({
        ...prev,
        events: [
          ...prev.events,
          {
            ...event,
            id: generateId('evt'),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [commit]
  );

  const updateEvent = useCallback(
    (id: string, patch: Partial<CalendarEvent>) => {
      commit((prev) => ({
        ...prev,
        events: prev.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
      }));
    },
    [commit]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        events: prev.events.filter((ev) => ev.id !== id),
      }));
    },
    [commit]
  );

  const bookEventSlot = useCallback(
    (
      eventId: string,
      booking: { clientName: string; clientContact: string; notes: string }
    ) => {
      commit((prev) => ({
        ...prev,
        events: prev.events.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                status: 'Reservado',
                color: 'amber',
                clientName: booking.clientName,
                clientContact: booking.clientContact,
                notes: booking.notes || ev.notes,
                bookedByVisitor: true,
              }
            : ev
        ),
      }));
    },
    [commit]
  );

  const requestCustomBooking = useCallback(
    (booking: {
      date: string;
      startTime: string;
      endTime: string;
      title: string;
      clientName: string;
      clientContact: string;
      notes: string;
    }) => {
      commit((prev) => ({
        ...prev,
        events: [
          ...prev.events,
          {
            id: generateId('evt'),
            date: booking.date,
            allDay: false,
            startTime: booking.startTime,
            endTime: booking.endTime,
            title: booking.title || `Agendamento • ${booking.clientName}`,
            description: 'Solicitação realizada pelo portfólio público.',
            clientName: booking.clientName,
            clientContact: booking.clientContact,
            notes: booking.notes,
            status: 'Reservado',
            color: 'amber',
            bookedByVisitor: true,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [commit]
  );

  const addProduct = useCallback(
    (product: Omit<InventoryProduct, 'id' | 'createdAt'>) => {
      commit((prev) => ({
        ...prev,
        products: [
          ...prev.products,
          {
            ...product,
            id: generateId('prod'),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [commit]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<InventoryProduct>) => {
      commit((prev) => ({
        ...prev,
        products: prev.products.map((prod) => (prod.id === id ? { ...prod, ...patch } : prod)),
      }));
    },
    [commit]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        products: prev.products.filter((prod) => prod.id !== id),
      }));
    },
    [commit]
  );

  const adjustProductStock = useCallback(
    (id: string, delta: number) => {
      commit((prev) => ({
        ...prev,
        products: prev.products.map((prod) => {
          if (prod.id !== id) return prod;
          const nextStock = Math.max(0, prod.stock + delta);
          const nextStatus = computeProductStatus(
            nextStock,
            prod.lowStockThreshold,
            prod.status
          );
          return { ...prod, stock: nextStock, status: nextStatus };
        }),
      }));
    },
    [commit]
  );

  const registerProductInterest = useCallback(
    (payload: {
      productId: string;
      quantity: number;
      visitorName: string;
      visitorContact: string;
      notes: string;
    }): { ok: boolean; message: string } => {
      const target = data.products.find((p) => p.id === payload.productId);
      if (!target) {
        return { ok: false, message: 'Produto não encontrado.' };
      }
      if (!target.allowReservation) {
        return { ok: false, message: 'Reservas desativadas para este produto.' };
      }

      const qty = Math.max(1, payload.quantity);
      const shouldDeduct = target.deductStockOnReserve && target.stock > 0;

      if (target.deductStockOnReserve && target.stock > 0 && qty > target.stock) {
        return {
          ok: false,
          message: `Quantidade indisponível. Restam apenas ${target.stock} unidade(s) em estoque.`,
        };
      }

      const interest: ProductInterest = {
        id: generateId('int'),
        productId: target.id,
        productName: target.name,
        productSku: target.sku,
        quantity: qty,
        visitorName: payload.visitorName,
        visitorContact: payload.visitorContact,
        notes: payload.notes,
        deductedStock: shouldDeduct,
        createdAt: new Date().toISOString(),
        resolved: false,
      };

      commit((prev) => ({
        ...prev,
        products: prev.products.map((prod) => {
          if (prod.id !== target.id || !shouldDeduct) return prod;
          const nextStock = Math.max(0, prod.stock - qty);
          const nextStatus = computeProductStatus(
            nextStock,
            prod.lowStockThreshold,
            prod.status
          );
          return { ...prod, stock: nextStock, status: nextStatus };
        }),
        productInterests: [interest, ...prev.productInterests],
      }));

      return {
        ok: true,
        message: shouldDeduct
          ? `Reserva confirmada! ${qty} unidade(s) reservada(s) e descontada(s) do estoque.`
          : 'Interesse registrado com sucesso! O responsável entrará em contato.',
      };
    },
    [commit, data.products]
  );

  const toggleInterestResolved = useCallback(
    (interestId: string) => {
      commit((prev) => ({
        ...prev,
        productInterests: prev.productInterests.map((item) =>
          item.id === interestId ? { ...item, resolved: !item.resolved } : item
        ),
      }));
    },
    [commit]
  );

  const deleteInterest = useCallback(
    (interestId: string) => {
      commit((prev) => ({
        ...prev,
        productInterests: prev.productInterests.filter((item) => item.id !== interestId),
      }));
    },
    [commit]
  );

  const resetToSeed = useCallback(() => {
    const seed = localStorageRepository.reset();
    setData(seed);
    persistToCloud(seed);
  }, [persistToCloud]);

  const exportDataJSON = useCallback(() => {
    return localStorageRepository.exportJSON(data);
  }, [data]);

  const importDataJSON = useCallback(
    (raw: string) => {
      const imported = localStorageRepository.importJSON(raw);
      setData(imported);
      persistToCloud(imported);
    },
    [persistToCloud]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      isAuthenticated,
      syncStatus,
      syncError,
      forceSyncToCloud,
      login,
      logout,
      publicUrl,
      publicPath,
      updateProfile,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      movePortfolioItem,
      addEvent,
      updateEvent,
      deleteEvent,
      bookEventSlot,
      requestCustomBooking,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustProductStock,
      registerProductInterest,
      toggleInterestResolved,
      deleteInterest,
      resetToSeed,
      exportDataJSON,
      importDataJSON,
      toasts,
      notify,
      dismissToast,
    }),
    [
      data,
      isAuthenticated,
      syncStatus,
      syncError,
      forceSyncToCloud,
      login,
      logout,
      publicUrl,
      publicPath,
      updateProfile,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      movePortfolioItem,
      addEvent,
      updateEvent,
      deleteEvent,
      bookEventSlot,
      requestCustomBooking,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustProductStock,
      registerProductInterest,
      toggleInterestResolved,
      deleteInterest,
      resetToSeed,
      exportDataJSON,
      importDataJSON,
      toasts,
      notify,
      dismissToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser utilizado dentro de AppProvider');
  }
  return ctx;
}
