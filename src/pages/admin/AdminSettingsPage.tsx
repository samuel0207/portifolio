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
        <h1 className="text-3xl font-semibold tracking-tight text-[#18191c]">
          Configurações & Backup
        </h1>
        <p className="mt-1 text-sm text-[#686c75]">
          Gerencie seu link público, exporte/importe backups em JSON ou acompanhe a sincronização
          com Supabase.
        </p>
      </div>

      {/* Public Link Card */}
      <div className="studio-card rounded-[22px] p-5">
        <h2 className="text-sm font-semibold text-[#18191c]">Link Público do Portfólio</h2>
        <p className="mt-1 text-xs text-[#686c75]">
          Compartilhe este endereço com clientes e visitantes. Ele reflete instantaneamente todas as
          alterações salvas no painel.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="studio-input flex-1 truncate rounded-xl px-3.5 py-2.5 font-mono text-xs">
            {publicUrl}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="studio-pill-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </button>
            <a
              href={publicPath}
              target="_blank"
              rel="noreferrer"
              className="studio-dark-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </a>
          </div>
        </div>
      </div>

      {/* Backup JSON & Supabase */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="studio-card space-y-4 rounded-[22px] p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f2024] text-white">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#18191c]">
                Persistência Local & Backup JSON
              </h2>
              <p className="text-xs text-[#686c75]">
                Exporte seus dados ou restaure um snapshot salvo anteriormente.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="studio-pill-btn inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 text-emerald-700" />
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
              className="studio-pill-btn inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <Upload className="h-3.5 w-3.5 text-sky-700" />
              Importar JSON
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-rose-600/25 bg-rose-600/10 px-4 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-600/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar Dados Demo
            </button>
          </div>
        </div>

        {/* Auth & Supabase Live Status */}
        <div className="studio-card space-y-3 rounded-[22px] p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f2024] text-white">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#18191c]">
                  Supabase & Deploy na Vercel
                </h2>
                <p className="text-xs text-[#686c75]">
                  Sincronização em nuvem e variáveis de ambiente.
                </p>
              </div>
            </div>

            {SUPABASE_CONFIG.isConfigured && (
              <button
                type="button"
                onClick={handleManualSync}
                className="studio-pill-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                Sincronizar
              </button>
            )}
          </div>

          <div className="studio-subcard space-y-2 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-2">
              {syncStatus === 'synced' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              ) : syncStatus === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              ) : (
                <Database className="h-4 w-4 text-sky-700" />
              )}
              <span className="text-[#4a4e57]">
                Armazenamento:{' '}
                <strong className="text-[#18191c]">
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

            {syncError && <p className="text-[11px] text-rose-700">{syncError}</p>}

            <p className="text-[#555962]">
              Usuário admin atual:{' '}
              <code className="rounded bg-black/[0.07] px-1.5 py-0.5 text-[#18191c]">
                {ADMIN_AUTH_CONFIG.username}
              </code>
            </p>
            <p className="text-[11px] leading-relaxed text-[#666a73]">
              Para manter tudo sincronizado em produção, mantenha{' '}
              <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>,{' '}
              <code>VITE_ADMIN_USER</code> e <code>VITE_ADMIN_PASS</code> configurados na Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
