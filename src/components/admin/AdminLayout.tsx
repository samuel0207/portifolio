import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
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
  Search,
  Folder,
  Plus,
  ChevronDown,
  Bell,
  Clock,
  AlertTriangle,
  Wifi,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLayout: React.FC = () => {
  const { data, publicUrl, publicPath, syncStatus, logout, notify } = useApp();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [treeQuery, setTreeQuery] = useState('');

  useEffect(() => {
    document.title = `Painel Admin — ${data.profile.name}`;
  }, [data.profile.name]);

  const availableSlots = data.events.filter((e) => e.status === 'Disponível').length;
  const reservedEvents = data.events.filter((e) => e.status === 'Reservado').length;
  const blockedEvents = data.events.filter((e) => e.status === 'Bloqueado').length;
  const pendingInterests = data.productInterests.filter((i) => !i.resolved).length;
  const visitorBookings = data.events.filter((e) => e.bookedByVisitor).length;
  const lowOrOutStock = data.products.filter(
    (p) => p.status === 'Baixo estoque' || p.status === 'Esgotado'
  ).length;

  const projectCount = data.portfolioItems.filter((i) => i.kind === 'projeto').length;
  const serviceCount = data.portfolioItems.filter((i) => i.kind === 'servico').length;
  const experienceCount = data.portfolioItems.filter((i) => i.kind === 'experiencia').length;

  const treeFolders = useMemo(() => {
    const q = treeQuery.trim().toLowerCase();
    const groups = [
      {
        id: 'portfolio',
        label: 'Portfólio Público',
        count: data.portfolioItems.length,
        to: '/admin/portfolio',
        children: [
          { id: 'proj', label: 'Projetos', count: projectCount, to: '/admin/portfolio' },
          { id: 'serv', label: 'Serviços', count: serviceCount, to: '/admin/portfolio' },
          { id: 'exp', label: 'Experiências', count: experienceCount, to: '/admin/portfolio' },
        ],
      },
      {
        id: 'agenda',
        label: 'Agenda Mensal',
        count: data.events.length,
        to: '/admin/agenda',
        children: [
          { id: 'disp', label: 'Disponíveis', count: availableSlots, to: '/admin/agenda' },
          { id: 'res', label: 'Reservados', count: reservedEvents, to: '/admin/agenda' },
          { id: 'bloq', label: 'Bloqueados', count: blockedEvents, to: '/admin/agenda' },
        ],
      },
      {
        id: 'inv',
        label: 'Inventário',
        count: data.products.length,
        to: '/admin/inventario',
        children: [],
      },
    ];

    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        children: g.children.filter((c) => c.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.label.toLowerCase().includes(q) || g.children.length > 0);
  }, [
    treeQuery,
    data.portfolioItems.length,
    projectCount,
    serviceCount,
    experienceCount,
    data.events.length,
    availableSlots,
    reservedEvents,
    blockedEvents,
    data.products.length,
  ]);

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

  const mainNavItems = [
    {
      to: '/admin',
      label: 'Visão Geral',
      icon: SlidersHorizontal,
      end: true,
      count: visitorBookings + pendingInterests,
    },
    {
      to: '/admin/portfolio',
      label: 'Portfólio & Perfil',
      icon: Layers,
      end: false,
      count: data.portfolioItems.length,
    },
    {
      to: '/admin/agenda',
      label: 'Agenda & Eventos',
      icon: Calendar,
      end: false,
      count: data.events.length,
    },
    {
      to: '/admin/inventario',
      label: 'Inventário',
      icon: Package,
      end: false,
      count: data.products.length,
    },
    {
      to: '/admin/configuracoes',
      label: 'Configurações',
      icon: Settings,
      end: false,
      count: undefined,
    },
  ];

  return (
    <div className="admin-studio-bg min-h-screen w-full p-2.5 sm:p-4 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1400px] lg:min-h-[calc(100vh-3rem)]">
        {/* ================================================================
            MAIN FROSTED GLASS WINDOW SHELL
           ================================================================ */}
        <div className="studio-window flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] lg:flex-row lg:rounded-[28px]">
          {/* INNER LEFT SIDEBAR (Desktop) */}
          <aside className="hidden w-[274px] shrink-0 flex-col border-r border-black/[0.08] bg-white/[0.14] lg:flex">
            {/* macOS Window Chrome Dots + Sync Indicator */}
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e2857b]/85 shadow-inner ring-1 ring-black/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e3c37b]/85 shadow-inner ring-1 ring-black/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#8ec49e]/85 shadow-inner ring-1 ring-black/10" />
              </div>

              <span
                title={
                  syncStatus === 'synced'
                    ? 'Conectado ao Supabase em tempo real'
                    : syncStatus === 'error'
                      ? 'Modo cache local (erro no Supabase)'
                      : 'Armazenamento local ativo'
                }
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/35 px-1.5 py-0.5 text-[10px] font-medium text-[#52565f]"
              >
                <Wifi
                  className={`h-3 w-3 ${
                    syncStatus === 'synced'
                      ? 'text-emerald-700'
                      : syncStatus === 'error'
                        ? 'text-rose-600'
                        : 'text-[#5b6069]'
                  }`}
                />
                {syncStatus === 'synced' ? 'Cloud' : 'Local'}
              </span>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3 px-5 pb-4 pt-1">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#1e1f23]/80 bg-[#1e1f23] shadow-sm">
                {data.profile.avatarUrl ? (
                  <img
                    src={data.profile.avatarUrl}
                    alt={data.profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {data.profile.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-[13px] font-semibold text-[#18191c]">
                    {data.profile.name}
                  </p>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#6d717a]" />
                </div>
                <p className="truncate text-[11px] text-[#6d717a]">
                  {data.profile.email || `/p/${data.profile.slug}`}
                </p>
              </div>
            </div>

            {/* Scrollable Sidebar Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-5">
              {/* Group 1: Gestão */}
              <div>
                <p className="mb-2 px-2 text-[11px] font-medium text-[#72767f]">Gerenciamento</p>
                <nav className="space-y-1">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `group relative flex items-center justify-between rounded-xl px-3 py-2 text-[13px] transition ${
                            isActive
                              ? 'studio-active-nav font-semibold text-[#141518]'
                              : 'font-medium text-[#3c3f46] hover:bg-white/35 hover:text-[#141518]'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span className="flex items-center gap-2.5 truncate">
                              <Icon
                                className={`h-4 w-4 shrink-0 ${
                                  isActive ? 'text-[#141518]' : 'text-[#555962]'
                                }`}
                                strokeWidth={1.8}
                              />
                              <span className="truncate">{item.label}</span>
                            </span>
                            {item.count !== undefined && (
                              <span
                                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                                  isActive
                                    ? 'bg-white/80 text-[#3e424a] shadow-sm'
                                    : 'bg-black/[0.06] text-[#6b7078]'
                                }`}
                              >
                                {item.count}
                              </span>
                            )}
                            {isActive && (
                              <span className="absolute -right-[17px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white shadow-sm" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="h-px bg-black/[0.07]" />

              {/* Group 2: Status */}
              <div>
                <p className="mb-2 px-2 text-[11px] font-medium text-[#72767f]">Status</p>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/agenda')}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#3c3f46] transition hover:bg-white/35 hover:text-[#141518]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-[#555962]" strokeWidth={1.8} />
                      Horários Livres
                    </span>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/[0.06] px-1.5 text-[10px] font-semibold text-[#5a5e67]">
                      {availableSlots}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/inventario')}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#3c3f46] transition hover:bg-white/35 hover:text-[#141518]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-[#555962]" strokeWidth={1.8} />
                      Solicitações
                    </span>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/[0.06] px-1.5 text-[10px] font-semibold text-[#5a5e67]">
                      {pendingInterests + visitorBookings}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/inventario')}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#3c3f46] transition hover:bg-white/35 hover:text-[#141518]"
                  >
                    <span className="flex items-center gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-[#555962]" strokeWidth={1.8} />
                      Estoque Baixo
                    </span>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/[0.06] px-1.5 text-[10px] font-semibold text-[#5a5e67]">
                      {lowOrOutStock}
                    </span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-black/[0.07]" />

              {/* Group 3: Atalhos & Sessão */}
              <div>
                <p className="mb-2 px-2 text-[11px] font-medium text-[#72767f]">Atalhos</p>
                <div className="space-y-0.5">
                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#3c3f46] transition hover:bg-white/35 hover:text-[#141518]"
                  >
                    <span className="flex items-center gap-2.5">
                      <ExternalLink className="h-4 w-4 text-[#555962]" strokeWidth={1.8} />
                      Ver Portfólio Público
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#4a4e57] transition hover:bg-rose-500/10 hover:text-rose-700"
                  >
                    <span className="flex items-center gap-2.5">
                      <LogOut className="h-4 w-4" strokeWidth={1.8} />
                      Sair do Painel
                    </span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-black/[0.07]" />

              {/* Group 4: Estrutura */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[11px] font-medium text-[#72767f]">Estrutura</p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/portfolio')}
                    title="Novo item"
                    className="rounded-md p-0.5 text-[#52565f] transition hover:bg-white/40 hover:text-[#141518]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d717a]" />
                  <input
                    type="text"
                    value={treeQuery}
                    onChange={(e) => setTreeQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="studio-input w-full rounded-lg py-1.5 pl-8 pr-2.5 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1 rounded-xl border border-black/[0.06] bg-white/[0.16] p-2">
                  {treeFolders.map((folder) => (
                    <div key={folder.id} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => navigate(folder.to)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs font-medium text-[#2c2f36] transition hover:bg-white/45"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Folder className="h-3.5 w-3.5 shrink-0 text-[#666a73]" />
                          <span className="truncate">{folder.label}</span>
                        </span>
                        <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-[#666a73]">
                          {folder.count}
                        </span>
                      </button>

                      {folder.children.length > 0 && (
                        <div className="ml-3.5 space-y-0.5 border-l border-black/10 pl-2.5">
                          {folder.children.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => navigate(child.to)}
                              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] font-medium text-[#4a4e57] transition hover:bg-black/[0.06] hover:text-[#141518]"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <Folder className="h-3 w-3 shrink-0 text-[#72767f]" />
                                <span className="truncate">{child.label}</span>
                              </span>
                              <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-[#6d717a]">
                                {child.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ================================================================
              RIGHT MAIN CONTENT SURFACE
             ================================================================ */}
          <div className="flex min-w-0 flex-1 flex-col bg-black/[0.02]">
            {/* Top Utility Bar */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.07] bg-white/[0.18] px-4 py-3 sm:px-7">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  className="studio-pill-btn rounded-xl p-2 lg:hidden"
                  aria-label="Abrir navegação"
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#18191c]">Estúdio Admin</span>
                  <span className="hidden text-[#8e929b] sm:inline">•</span>
                  <span className="hidden font-mono text-[11px] text-[#666a73] sm:inline">
                    /p/{data.profile.slug}
                  </span>
                </div>
              </div>

              {/* Public Link Action Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="studio-pill-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                      Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#555962]" />
                      Copiar Link Público
                    </>
                  )}
                </button>

                <a
                  href={publicPath}
                  target="_blank"
                  rel="noreferrer"
                  className="studio-dark-btn inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir Portfólio Público
                </a>
              </div>
            </header>

            {/* Mobile Nav Drawer */}
            {mobileMenuOpen && (
              <div className="border-b border-black/10 bg-white/60 p-3 backdrop-blur-md lg:hidden">
                <div className="grid gap-1">
                  {mainNavItems.map((item) => {
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
                              ? 'studio-active-nav text-[#141518]'
                              : 'text-[#42454d] hover:bg-white/50'
                          }`
                        }
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        {item.count !== undefined && (
                          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold">
                            {item.count}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair do Painel
                  </button>
                </div>
              </div>
            )}

            {/* Main Outlet */}
            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-7 sm:py-7">
              <div className="mx-auto max-w-5xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
