import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, LayoutDashboard, Menu, X, Calendar, Package, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PublicNavbar: React.FC = () => {
  const { data, isAuthenticated } = useApp();
  const { profile } = data;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '#projetos', label: 'Portfólio', icon: Layers, visible: true },
    { href: '#agenda', label: 'Agenda', icon: Calendar, visible: profile.showCalendarSection },
    { href: '#produtos', label: 'Produtos', icon: Package, visible: profile.showInventorySection },
  ].filter((item) => item.visible);

  return (
    <header className="sticky top-0 z-40 border-b border-[#222a36]/80 bg-[#0b0e14]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2.5">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-8 w-8 rounded-full border border-[#2f3949] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef5350]/20 text-xs font-bold text-[#ef5350]">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="leading-tight">
            <span className="block text-sm font-semibold text-[#e6edf3]">{profile.name}</span>
            <span className="hidden text-[11px] text-[#7d8898] sm:block">/p/{profile.slug}</span>
          </div>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#9aa5b4] transition hover:bg-[#161b22] hover:text-white"
              >
                <Icon className="h-3.5 w-3.5 text-[#7d8898]" />
                {item.label}
              </a>
            );
          })}
          <a
            href="#contato"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#9aa5b4] transition hover:bg-[#161b22] hover:text-white"
          >
            Contato
          </a>
        </nav>

        {/* Admin entry button */}
        <div className="flex items-center gap-2">
          <Link
            to={isAuthenticated ? '/admin' : '/admin/login'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#d5dce6] transition hover:border-[#394558] hover:bg-[#1c222d] hover:text-white"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className="h-3.5 w-3.5 text-[#ef5350]" />
                <span className="hidden sm:inline">Painel Admin</span>
                <span className="sm:hidden">Admin</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[#9aa5b4]" />
                <span className="hidden sm:inline">Acesso Admin</span>
                <span className="sm:hidden">Admin</span>
              </>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg border border-[#252d3a] bg-[#161b22] p-1.5 text-[#9aa5b4] md:hidden"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-[#222a36] bg-[#0f131a] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#c8d1dc] hover:bg-[#161b22]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contato"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#c8d1dc] hover:bg-[#161b22]"
            >
              Contato
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
