import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminLoginPage: React.FC = () => {
  const { isAuthenticated, login, notify, data } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from || '/admin';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = login(username, password);
    if (!ok) {
      setError('Usuário/e-mail ou senha inválidos. Tente novamente.');
      return;
    }
    notify({
      type: 'success',
      title: 'Bem-vindo ao Painel Administrativo',
      message: 'Todas as alterações refletem em tempo real no portfólio público.',
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="admin-studio-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[430px] space-y-5">
        <div className="flex items-center">
          <Link
            to="/"
            className="studio-pill-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Portfólio Público
          </Link>
        </div>

        <div className="studio-window overflow-hidden rounded-[26px]">
          {/* macOS Window Chrome Dots */}
          <div className="flex items-center justify-between border-b border-black/[0.07] bg-white/30 px-5 py-3.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e2857b]/85 shadow-inner ring-1 ring-black/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e3c37b]/85 shadow-inner ring-1 ring-black/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#8ec49e]/85 shadow-inner ring-1 ring-black/10" />
            </div>
            <span className="text-[11px] font-medium text-[#686c75]">Acesso Restrito</span>
          </div>

          {/* Header */}
          <div className="border-b border-black/[0.07] bg-white/20 px-6 py-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1e1f23] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
                <Lock className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight text-[#18191c]">
                  Painel do Administrador
                </h1>
                <p className="truncate text-xs text-[#666a73]">
                  {data.profile.name} • Gestão de Portfólio, Agenda e Inventário
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#4d5159]">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d717a]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu e-mail ou usuário"
                  className="studio-input w-full rounded-xl py-2.5 pl-10 pr-3.5 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#4d5159]">Senha</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d717a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="studio-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d717a] transition hover:text-[#18191c]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-600/25 bg-rose-600/10 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="studio-dark-btn mt-1 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition"
            >
              <ShieldCheck className="h-4 w-4" />
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
