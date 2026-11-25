/**
 * Credenciais padrão do administrador (fallback caso as variáveis de ambiente
 * VITE_ADMIN_USER / VITE_ADMIN_PASS não estejam definidas).
 */
export const ADMIN_AUTH_CONFIG = {
  username: import.meta.env.VITE_ADMIN_USER || 'admin@estudioatlas.com.br',
  password: import.meta.env.VITE_ADMIN_PASS || 'atlas2026',
  displayName: 'Rafael Mendes',
  sessionKey: 'studio_atlas_admin_session_v1',
  demoMode: false,
} as const;
