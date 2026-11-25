/**
 * Credenciais padrão do administrador para o modo de demonstração.
 * Edite estes valores (ou configure variáveis VITE_ADMIN_USER / VITE_ADMIN_PASS)
 * antes de publicar em produção ou ao conectar autenticação Supabase.
 */
export const ADMIN_AUTH_CONFIG = {
  username: import.meta.env.VITE_ADMIN_USER || 'admin@estudioatlas.com.br',
  password: import.meta.env.VITE_ADMIN_PASS || 'atlas2026',
  displayName: 'Rafael Mendes',
  sessionKey: 'studio_atlas_admin_session_v1',
  demoMode: true,
} as const;
