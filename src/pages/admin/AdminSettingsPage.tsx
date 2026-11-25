import React, { useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Database,
  Copy,
  ExternalLink,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_CONFIG } from '../../services/storage';
import { ADMIN_AUTH_CONFIG } from '../../config/auth';

export const AdminSettingsPage: React.FC = () => {
  const {
    publicUrl,
    publicPath,
    exportDataJSON,
    importDataJSON,
    resetToSeed,
    syncStatus,
    syncError,
    forceSyncToCloud,
    notify,
  } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify({
      type: 'success',
      title: 'Backup JSON exportado',
      message: 'Todos os dados do portfólio, agenda e inventário foram baixados.',
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importDataJSON(text);
      notify({
        type: 'success',
        title: 'Dados importados com sucesso!',
        message: 'Portfólio, agenda e inventário foram atualizados.',
      });
    } catch (err) {
      notify({
        type: 'error',
        title: 'Erro ao importar JSON',
        message: err instanceof Error ? err.message : 'Verifique o formato do arquivo.',
      });
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Deseja restaurar todos os dados iniciais de demonstração? Alterações não exportadas serão substituídas.'
      )
    ) {
      resetToSeed();
      notify({
        type: 'info',
        title: 'Dados de demonstração restaurados',
        message: 'O portfólio, calendário e inventário voltaram ao estado inicial.',
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      notify({ type: 'success', title: 'Link público copiado!', message: publicUrl });
    } catch {
      notify({ type: 'info', title: 'Link público', message: publicUrl });
    }
  };

  const handleManualSync = async () => {
    const ok = await forceSyncToCloud();
    if (ok) {
      notify({
        type: 'success',
        title: 'Sincronizado com Supabase',
        message: 'Estado atual enviado com sucesso para o banco em nuvem.',
      });
    } else {
      notify({
        type: 'error',
        title: 'Falha na sincronização',
        message: syncError || 'Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Configurações, Backup & Integração
        </h1>
        <p className="mt-1 text-sm text-[#8b96a6]">
          Gerencie seu link público, exporte/importe backups em JSON ou acompanhe a sincronização
          com Supabase.
        </p>
      </div>

      {/* Public Link Card */}
      <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
        <h2 className="text-sm font-semibold text-white">Link Público do Portfólio</h2>
        <p className="mt-1 text-xs text-[#8b96a6]">
          Compartilhe este endereço com clientes e visitantes. Ele reflete instantaneamente todas as
          alterações salvas no painel.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="flex-1 truncate rounded-xl border border-[#252d3a] bg-[#0b0e14] px-3.5 py-2.5 font-mono text-xs text-[#e6edf3]">
            {publicUrl}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#252d3a] bg-[#161b22] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#1c222d]"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </button>
            <a
              href={publicPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef5350] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#f26461]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </a>
          </div>
        </div>
      </div>

      {/* Backup JSON & Supabase */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Persistência Local & Backup JSON</h2>
              <p className="text-xs text-[#8b96a6]">
                Exporte seus dados ou restaure um snapshot salvo anteriormente.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-[#252d3a] bg-[#161b22] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c222d]"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Exportar JSON
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#252d3a] bg-[#161b22] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c222d]"
            >
              <Upload className="h-4 w-4 text-sky-400" />
              Importar JSON
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ef5350]/35 bg-[#ef5350]/10 px-4 py-2.5 text-xs font-semibold text-[#ff9b99] hover:bg-[#ef5350]/20"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Dados Demo
            </button>
          </div>
        </div>

        {/* Auth & Supabase Live Status */}
        <div className="space-y-3 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-semibold text-white">Supabase & Deploy na Vercel</h2>
                <p className="text-xs text-[#8b96a6]">
                  Sincronização em nuvem e variáveis de ambiente.
                </p>
              </div>
            </div>

            {SUPABASE_CONFIG.isConfigured && (
              <button
                type="button"
                onClick={handleManualSync}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1.5 text-xs font-medium text-[#e6edf3] hover:bg-[#1c222d]"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                Sincronizar
              </button>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-[#222a36] bg-[#161b22] p-3.5 text-xs">
            <div className="flex items-center gap-2">
              {syncStatus === 'synced' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : syncStatus === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-[#ef5350]" />
              ) : (
                <Database className="h-4 w-4 text-sky-400" />
              )}
              <span className="text-[#c8d1dc]">
                Armazenamento:{' '}
                <strong className="text-white">
                  {syncStatus === 'synced'
                    ? 'Supabase Conectado (Realtime ativo)'
                    : syncStatus === 'syncing'
                      ? 'Sincronizando com Supabase...'
                      : syncStatus === 'error'
                        ? 'Erro ao conectar no Supabase (usando cache local)'
                        : 'LocalStorage + Sync entre Abas'}
                </strong>
              </span>
            </div>

            {syncError && <p className="text-[11px] text-[#ff9b99]">{syncError}</p>}

            <p className="text-[#8b96a6]">
              Usuário admin atual:{' '}
              <code className="text-[#e6edf3]">{ADMIN_AUTH_CONFIG.username}</code>
            </p>
            <p className="text-[11px] leading-relaxed text-[#7d8898]">
              Para ativar o banco na nuvem, execute <code>supabase/schema.sql</code> no Supabase e
              configure <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>,{' '}
              <code>VITE_ADMIN_USER</code> e <code>VITE_ADMIN_PASS</code> nas Environment Variables
              da Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
