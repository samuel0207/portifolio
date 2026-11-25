import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Package,
  Globe,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PortfolioSection } from '../components/public/PortfolioSection';
import { InventorySection } from '../components/public/InventorySection';
import { DarkScheduleCalendar } from '../components/calendar/DarkScheduleCalendar';
import { DayScheduleModal } from '../components/calendar/DayScheduleModal';
import type { PublicSectionKey, SocialPlatform } from '../types';

function renderSocialIcon(platform: SocialPlatform) {
  switch (platform) {
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'linkedin':
      return <Linkedin className="h-4 w-4" />;
    case 'github':
      return <Github className="h-4 w-4" />;
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'whatsapp':
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
}

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { data } = useApp();
  const { profile, portfolioItems, events, products } = data;

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const visibleProjectsCount = useMemo(
    () => portfolioItems.filter((i) => i.visible).length,
    [portfolioItems]
  );
  const availableSlotsCount = useMemo(
    () => events.filter((e) => e.status === 'Disponível').length,
    [events]
  );
  const availableProductsCount = useMemo(
    () => products.filter((p) => p.visiblePublic && p.status !== 'Oculto' && p.stock > 0).length,
    [products]
  );

  const slugMismatch = Boolean(slug && slug !== profile.slug);

  const renderSection = (key: PublicSectionKey) => {
    if (key === 'projects') {
      return (
        <PortfolioSection
          key="projects"
          items={portfolioItems}
          eyebrow={profile.portfolioSectionEyebrow}
          title={profile.portfolioSectionTitle}
          description={profile.portfolioSectionDescription}
        />
      );
    }
    if (key === 'calendar' && profile.showCalendarSection) {
      return (
        <section key="calendar" id="agenda" className="scroll-mt-20 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {profile.calendarSectionEyebrow && (
                <span className="text-xs font-semibold uppercase tracking-widest text-[#ef5350]">
                  {profile.calendarSectionEyebrow}
                </span>
              )}
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {profile.calendarSectionTitle}
              </h2>
              {profile.calendarSectionDescription && (
                <p className="mt-1.5 max-w-2xl text-sm text-[#8b96a6]">
                  {profile.calendarSectionDescription}
                </p>
              )}
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {availableSlotsCount} horário{availableSlotsCount === 1 ? '' : 's'} livre
              {availableSlotsCount === 1 ? '' : 's'}
            </div>
          </div>

          <DarkScheduleCalendar
            events={events}
            mode="public"
            onSelectDay={(iso) => setSelectedDay(iso)}
          />
        </section>
      );
    }
    if (key === 'inventory' && profile.showInventorySection) {
      return (
        <InventorySection
          key="inventory"
          products={products}
          eyebrow={profile.inventorySectionEyebrow}
          title={profile.inventorySectionTitle}
          description={profile.inventorySectionDescription}
        />
      );
    }
    return null;
  };

  return (
    <div id="inicio" className="min-h-screen bg-[#0b0e14] text-[#e6edf3]">
      <PublicNavbar />

      {slugMismatch && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">
          Link personalizado <code>/p/{slug}</code> redirecionado para o portfólio ativo{' '}
          <span className="font-semibold text-white">/p/{profile.slug}</span>.
        </div>
      )}

      {/* Hero / Profile Header */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="overflow-hidden rounded-3xl border border-[#252d3a] bg-[#0f131a] shadow-2xl shadow-black/50">
          {/* Banner */}
          <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-[#171d29] via-[#1f2636] to-[#281b23] sm:h-56">
            {profile.bannerUrl && (
              <img
                src={profile.bannerUrl}
                alt="Capa do portfólio"
                className="h-full w-full object-cover opacity-75"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f131a] via-[#0f131a]/35 to-transparent" />
          </div>

          {/* Profile Info Body */}
          <div className="relative px-5 pb-7 sm:px-8 sm:pb-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-[#0f131a] bg-[#161b22] shadow-xl sm:h-28 sm:w-28">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1c222d] text-2xl font-bold text-[#ef5350]">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {profile.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Agenda aberta
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#c8d1dc] sm:text-base">{profile.title}</p>
                  {profile.location && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-[#8b96a6]">
                      <MapPin className="h-3.5 w-3.5 text-[#ef5350]" />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {profile.showCalendarSection && (
                  <a
                    href="#agenda"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef5350] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#ef5350]/20 transition hover:bg-[#f26461] sm:text-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    {profile.primaryCtaLabel || 'Agendar Horário'}
                  </a>
                )}
                {profile.showInventorySection && (
                  <a
                    href="#produtos"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#2d3646] bg-[#161b22] px-4 py-2.5 text-xs font-semibold text-[#e6edf3] transition hover:border-[#3e4a5e] hover:bg-[#1c222d] sm:text-sm"
                  >
                    <Package className="h-4 w-4 text-[#9aa5b4]" />
                    {profile.secondaryCtaLabel || 'Ver Produtos'}
                  </a>
                )}
              </div>
            </div>

            {/* Bio & Social Links */}
            <div className="mt-6 grid gap-6 border-t border-[#222a36] pt-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <p className="text-sm leading-relaxed text-[#b4bfd0] sm:text-[15px]">
                  {profile.bio}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {profile.socialLinks
                    .filter((s) => s.visible && s.url)
                    .map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#c8d1dc] transition hover:border-[#3c485c] hover:bg-[#1c222d] hover:text-white"
                      >
                        {renderSocialIcon(social.platform)}
                        {social.label}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    ))}
                </div>
              </div>

              {/* Quick metrics */}
              <div className="grid grid-cols-3 gap-2.5 self-start">
                <div className="rounded-xl border border-[#252d3a] bg-[#161b22] p-3 text-center">
                  <span className="block text-xl font-bold text-white">{visibleProjectsCount}</span>
                  <span className="mt-0.5 block text-[11px] text-[#8b96a6]">Portfólio</span>
                </div>
                <div className="rounded-xl border border-[#252d3a] bg-[#161b22] p-3 text-center">
                  <span className="block text-xl font-bold text-emerald-400">
                    {availableSlotsCount}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8b96a6]">Horários</span>
                </div>
                <div className="rounded-xl border border-[#252d3a] bg-[#161b22] p-3 text-center">
                  <span className="block text-xl font-bold text-white">
                    {availableProductsCount}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8b96a6]">Produtos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        {profile.sectionOrder.map((sectionKey) => renderSection(sectionKey))}

        {/* Contact Card */}
        <section
          id="contato"
          className="scroll-mt-20 rounded-3xl border border-[#252d3a] bg-gradient-to-br from-[#131820] to-[#0f131a] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              {profile.contactSectionEyebrow && (
                <span className="text-xs font-semibold uppercase tracking-widest text-[#ef5350]">
                  {profile.contactSectionEyebrow}
                </span>
              )}
              <h2 className="text-2xl font-bold text-white">{profile.contactSectionTitle}</h2>
              {profile.contactSectionDescription && (
                <p className="max-w-xl text-sm text-[#8b96a6]">
                  {profile.contactSectionDescription}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2.5 rounded-xl border border-[#252d3a] bg-[#161b22] px-4 py-3 text-xs font-medium text-[#d5dce6] transition hover:border-[#3a475c] hover:text-white"
                >
                  <Mail className="h-4 w-4 text-[#ef5350]" />
                  <span className="truncate">{profile.email}</span>
                </a>
              )}
              {profile.whatsapp && (
                <div className="flex items-center gap-2.5 rounded-xl border border-[#252d3a] bg-[#161b22] px-4 py-3 text-xs font-medium text-[#d5dce6]">
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>{profile.whatsapp}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2.5 rounded-xl border border-[#252d3a] bg-[#161b22] px-4 py-3 text-xs font-medium text-[#d5dce6]">
                  <Phone className="h-4 w-4 text-sky-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222a36] bg-[#0f131a] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-[#7d8898] sm:flex-row sm:px-6">
          <p>{profile.footerText}</p>
          <p className="font-mono text-[11px] text-[#637083]">
            Link público: /p/{profile.slug}
          </p>
        </div>
      </footer>

      {/* Public Day Details & Booking Modal */}
      <DayScheduleModal
        isoDate={selectedDay}
        onClose={() => setSelectedDay(null)}
        mode="public"
      />
    </div>
  );
};
