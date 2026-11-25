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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0b0e14] px-4 py-10">
      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,83,80,0.12),_transparent_55%)]" />

      <div className="relative w-full max-w-md space-y-6">
        <div className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9aa5b4] transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Portfólio Público
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#252d3a] bg-[#0f131a] shadow-2xl shadow-black/60">
          <div className="border-b border-[#252d3a] bg-[#161b22]/70 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ef5350]/35 bg-[#ef5350]/15 text-[#ef5350]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Painel do Administrador</h1>
                <p className="text-xs text-[#8b96a6]">
                  {data.profile.name} • Gestão de Portfólio, Agenda e Inventário
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9aa5b4]">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7686]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu e-mail ou usuário"
                  className="w-full rounded-xl border border-[#252d3a] bg-[#0b0e14] py-2.5 pl-10 pr-3.5 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none transition focus:border-[#ef5350]/70"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#9aa5b4]">Senha</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7686]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#252d3a] bg-[#0b0e14] py-2.5 pl-10 pr-10 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none transition focus:border-[#ef5350]/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8898] hover:text-white"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[#ef5350]/40 bg-[#ef5350]/12 px-3.5 py-2.5 text-xs text-[#ffb0ae]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef5350] py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ef5350]/20 transition hover:bg-[#f26461]"
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
