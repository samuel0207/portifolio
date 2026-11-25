import type { AppData } from '../types';
import { createSeedData } from '../data/seedData';

export const STORAGE_KEY = 'studio_atlas_portfolio_data_v1';

/**
 * Interface de repositório desacoplada para permitir alternar facilmente
 * entre persistência local (LocalStorage/JSON) e um backend remoto (ex: Supabase).
 */
export interface PersistenceRepository {
  load(): AppData;
  save(data: AppData): void;
  reset(): AppData;
  exportJSON(data: AppData): string;
  importJSON(raw: string): AppData;
}

export const localStorageRepository: PersistenceRepository = {
  load(): AppData {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = createSeedData();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(raw) as Partial<AppData>;
      const fallback = createSeedData();
      return {
        version: parsed.version ?? fallback.version,
        profile: { ...fallback.profile, ...(parsed.profile ?? {}) },
        portfolioItems: Array.isArray(parsed.portfolioItems)
          ? parsed.portfolioItems
          : fallback.portfolioItems,
        events: Array.isArray(parsed.events) ? parsed.events : fallback.events,
        products: Array.isArray(parsed.products) ? parsed.products : fallback.products,
        productInterests: Array.isArray(parsed.productInterests)
          ? parsed.productInterests
          : fallback.productInterests,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    } catch {
      const seed = createSeedData();
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      } catch {
        // Ignore quota errors
      }
      return seed;
    }
  },

  save(data: AppData): void {
    const payload: AppData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },

  reset(): AppData {
    const seed = createSeedData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  },

  exportJSON(data: AppData): string {
    return JSON.stringify(data, null, 2);
  },

  importJSON(raw: string): AppData {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || typeof parsed !== 'object' || !parsed.profile) {
      throw new Error('Arquivo JSON inválido: estrutura de portfólio não reconhecida.');
    }
    const fallback = createSeedData();
    const merged: AppData = {
      version: parsed.version ?? fallback.version,
      profile: { ...fallback.profile, ...parsed.profile },
      portfolioItems: Array.isArray(parsed.portfolioItems) ? parsed.portfolioItems : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      productInterests: Array.isArray(parsed.productInterests) ? parsed.productInterests : [],
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  },
};

/**
 * Configuração pronta para conexão futura com Supabase.
 * Para ativar, defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env
 * e crie uma tabela `portfolio_state (id text primary key, payload jsonb, updated_at timestamptz)`.
 */
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ),
};
