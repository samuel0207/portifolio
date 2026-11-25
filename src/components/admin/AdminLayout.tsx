import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Package,
  Settings,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLayout: React.FC = () => {
  const { data, publicUrl, publicPath, logout, notify } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingInterests = data.productInterests.filter((i) => !i.resolved).length;
  const visitorBookings = data.events.filter((e) => e.bookedByVisitor).length;

  const navLinks = [
    { to: '/admin', label: 'Visão Geral', icon: LayoutDashboard, end: true },
    { to: '/admin/portfolio', label: 'Portfólio & Perfil', icon: Layers, end: false },
    {
      to: '/admin/agenda',
      label: 'Agenda & Eventos',
      icon: Calendar,
      end: false,
      badge: visitorBookings > 0 ? visitorBookings : undefined,
    },
    {
      to: '/admin/inventario',
      label: 'Inventário',
      icon: Package,
      end: false,
      badge: pendingInterests > 0 ? pendingInterests : undefined,
    },
    { to: '/admin/configuracoes', label: 'Configurações', icon: Settings, end: false },
  ];

  const handleCopyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      notify({
        type: 'success',
        title: 'Link público copiado!',
        message: publicUrl,
      });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      notify({
        type: 'info',
        title: 'Link público',
        message: publicUrl,
      });
    }
  };

  const handleLogout = () => {
    logout();
    notify({ type: 'info', title: 'Sessão encerrada' });
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-[#e6edf3]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#222a36] bg-[#0f131a] lg:flex">
        <div className="flex items-center gap-3 border-b border-[#222a36] px-5 py-4">
          {data.profile.avatarUrl ? (
            <img
              src={data.profile.avatarUrl}
              alt={data.profile.name}
              className="h-9 w-9 rounded-xl border border-[#2f3949] object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef5350]/20 text-xs font-bold text-[#ef5350]">
              {data.profile.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{data.profile.name}</p>
            <p className="truncate font-mono text-[11px] text-[#7d8898]">Admin • /p/{data.profile.slug}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? 'border border-[#ef5350]/30 bg-[#ef5350]/12 text-white'
                      : 'border border-transparent text-[#9aa5b4] hover:bg-[#161b22] hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-[#ef5350] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#222a36] p-3">
          <div className="mb-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-[11px] text-emerald-300">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Sincronização em tempo real ativa
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs font-medium text-[#b4bfd0] transition hover:border-[#ef5350]/40 hover:text-[#ff9b99]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-[#222a36] bg-[#0f131a]/90 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] lg:hidden"
                aria-label="Abrir navegação"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Painel Administrativo</p>
                <p className="font-mono text-[11px] text-[#7d8898]">{publicUrl}</p>
              </div>
            </div>

            {/* Public Link Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2d3646] bg-[#161b22] px-3 py-2 text-xs font-semibold text-[#e6edf3] transition hover:border-[#3f4b61] hover:bg-[#1c222d]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#9aa5b4]" />
                    Copiar Link Público
                  </>
                )}
              </button>

              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef5350] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#ef5350]/20 transition hover:bg-[#f26461]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir Portfólio Público
              </a>
            </div>
          </div>

          {/* Mobile Nav Drawer */}
          {mobileMenuOpen && (
            <div className="border-t border-[#222a36] bg-[#0f131a] p-3 lg:hidden">
              <div className="grid gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                          isActive
                            ? 'bg-[#ef5350]/15 text-white'
                            : 'text-[#9aa5b4] hover:bg-[#161b22]'
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-[#ef5350] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-[#252d3a] bg-[#161b22] px-3.5 py-2.5 text-xs font-medium text-[#ff9b99]"
                >
                  <LogOut className="h-4 w-4" />
                  Sair do Painel
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Page Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
