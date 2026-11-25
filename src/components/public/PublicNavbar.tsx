import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, LayoutDashboard, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PublicNavbar: React.FC = () => {
  const { data, isAuthenticated } = useApp();
  const { profile } = data;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '#inicio', label: 'Início', visible: true },
    { href: '#projetos', label: 'Serviços', visible: true },
    { href: '#historia', label: 'Sobre', visible: profile.showStoryBanner },
    { href: '#produtos', label: 'Produtos', visible: profile.showInventorySection },
    { href: '#agenda', label: 'Agenda', visible: profile.showCalendarSection },
    { href: '#contato', label: 'Contato', visible: true },
  ].filter((item) => item.visible);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ddd0] bg-[#f8f2eb]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        {/* Stacked Editorial Serif Brand */}
        <a href="#inicio" className="group flex flex-col leading-none">
          <span className="font-editorial text-2xl font-medium tracking-[0.14em] text-[#2a211d] uppercase sm:text-[26px]">
            {profile.name}
          </span>
          {profile.brandTagline && (
            <span className="mt-0.5 text-[9px] font-medium tracking-[0.32em] text-[#7e6d62] uppercase">
              {profile.brandTagline}
            </span>
          )}
        </a>

        {/* Minimalist Center Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              className={`relative py-1 text-[11px] font-medium tracking-[0.16em] uppercase transition ${
                idx === 0
                  ? 'text-[#b96b4d] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#b96b4d]'
                  : 'text-[#5c4f47] hover:text-[#b96b4d]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA + Subtle Admin Entry */}
        <div className="flex items-center gap-2">
          {profile.showCalendarSection && (
            <a
              href="#agenda"
              className="hidden rounded-[4px] bg-[#b96b4d] px-4 py-2.5 text-[10px] font-semibold tracking-[0.18em] text-[#fdfaf7] uppercase shadow-sm transition hover:bg-[#a25a3e] sm:inline-flex"
            >
              {profile.primaryCtaLabel || 'Agendar Horário'}
            </a>
          )}

          <Link
            to={isAuthenticated ? '/admin' : '/admin/login'}
            title={isAuthenticated ? 'Ir para o Painel Admin' : 'Acesso Administrativo'}
            className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#dfd0c1] bg-[#fbf8f4] px-2.5 py-2 text-[10px] font-medium tracking-[0.12em] text-[#5c4f47] uppercase transition hover:border-[#b96b4d]/60 hover:text-[#2a211d]"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className="h-3.5 w-3.5 text-[#b96b4d]" />
                <span className="hidden lg:inline">Admin</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[#8c7b70]" />
                <span className="hidden lg:inline">Admin</span>
              </>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-[4px] border border-[#dfd0c1] bg-[#fbf8f4] p-2 text-[#5c4f47] md:hidden"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#e8ddd0] bg-[#fbf8f4] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium tracking-[0.14em] text-[#4c4039] uppercase hover:bg-[#f1e7dc] hover:text-[#b96b4d]"
              >
                {item.label}
              </a>
            ))}
            {profile.showCalendarSection && (
              <a
                href="#agenda"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-[4px] bg-[#b96b4d] px-4 py-2.5 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase"
              >
                {profile.primaryCtaLabel || 'Agendar Horário'}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
