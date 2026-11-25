import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppData } from '../types';
import { SUPABASE_CONFIG } from './storage';

const TABLE_NAME = 'portfolio_state';
const STATE_ROW_ID = 'default';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_CONFIG.isConfigured) return null;
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return cachedClient;
}

export async function loadRemoteState(): Promise<AppData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE_NAME)
    .select('payload')
    .eq('id', STATE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.payload || typeof data.payload !== 'object') {
    return null;
  }

  return data.payload as AppData;
}

export async function saveRemoteState(payload: AppData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from(TABLE_NAME).upsert(
    {
      id: STATE_ROW_ID,
      payload,
      updated_at: payload.updatedAt || new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }
}

export function subscribeRemoteState(onRemoteChange: (payload: AppData) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('portfolio_state_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `id=eq.${STATE_ROW_ID}`,
      },
      (change) => {
        const record = change.new as { payload?: AppData } | null;
        if (record?.payload && typeof record.payload === 'object') {
          onRemoteChange(record.payload);
        }
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
