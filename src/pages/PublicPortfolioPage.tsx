import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Heart,
  Shield,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PortfolioSection } from '../components/public/PortfolioSection';
import { InventorySection } from '../components/public/InventorySection';
import { DarkScheduleCalendar } from '../components/calendar/DarkScheduleCalendar';
import { DayScheduleModal } from '../components/calendar/DayScheduleModal';
import type { PillarIconKey, PublicSectionKey, SocialPlatform } from '../types';

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

function renderPillarIcon(icon: PillarIconKey) {
  switch (icon) {
    case 'award':
      return <Award className="h-5 w-5" strokeWidth={1.6} />;
    case 'heart':
      return <Heart className="h-5 w-5" strokeWidth={1.6} />;
    case 'calendar':
      return <Calendar className="h-5 w-5" strokeWidth={1.6} />;
    case 'shield':
      return <Shield className="h-5 w-5" strokeWidth={1.6} />;
    case 'star':
      return <Star className="h-5 w-5" strokeWidth={1.6} />;
    default:
      return <Sparkles className="h-5 w-5" strokeWidth={1.6} />;
  }
}

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { data } = useApp();
  const { profile, portfolioItems, events, products } = data;

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    document.title = profile.brandTagline
      ? `${profile.name} — ${profile.brandTagline}`
      : profile.name;
  }, [profile.name, profile.brandTagline]);

  const availableSlotsCount = useMemo(
    () => events.filter((e) => e.status === 'Disponível').length,
    [events]
  );

  // If visitor accesses an outdated /p/:slug link, cleanly redirect to the active slug
  if (slug && profile.slug && slug !== profile.slug) {
    return <Navigate to={`/p/${profile.slug}`} replace />;
  }

  const renderSection = (key: PublicSectionKey) => {
    if (key === 'projects') {
      return (
        <React.Fragment key="projects">
          <PortfolioSection
            items={portfolioItems}
            eyebrow={profile.portfolioSectionEyebrow}
            title={profile.portfolioSectionTitle}
            description={profile.portfolioSectionDescription}
          />

          {/* Terracotta Editorial Story Banner ("It's Your Time. It's Your Glow." Reference) */}
          {profile.showStoryBanner && (
            <section id="historia" className="scroll-mt-24 overflow-hidden bg-[#b96b4d] text-[#fdf9f5]">
              <div className="mx-auto grid max-w-6xl items-center lg:grid-cols-12">
                <div className="space-y-5 px-5 py-14 sm:px-8 lg:col-span-6 lg:py-20 lg:pr-12">
                  {profile.storyEyebrow && (
                    <p className="text-[10px] font-semibold tracking-[0.24em] text-[#f5ddd2] uppercase">
                      {profile.storyEyebrow}
                    </p>
                  )}
                  <h2 className="font-editorial whitespace-pre-line text-4xl font-medium leading-[1.08] text-white sm:text-5xl">
                    {profile.storyTitle}
                  </h2>
                  {profile.storyDescription && (
                    <p className="max-w-md text-sm leading-relaxed text-[#f7e7df]">
                      {profile.storyDescription}
                    </p>
                  )}
                  {profile.storyCtaLabel && (
                    <div className="pt-2">
                      <a
                        href={profile.storyCtaHref || '#agenda'}
                        className="inline-flex items-center gap-2.5 rounded-[4px] bg-[#fbf8f4] px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-[#9e5539] uppercase shadow-sm transition hover:bg-white"
                      >
                        {profile.storyCtaLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Arched Lifestyle Image */}
                <div className="relative h-72 w-full sm:h-96 lg:col-span-6 lg:h-full lg:min-h-[420px]">
                  <div className="h-full w-full overflow-hidden bg-[#a55c40] lg:rounded-tl-[220px]">
                    {profile.storyImageUrl ? (
                      <img
                        src={profile.storyImageUrl}
                        alt={profile.storyTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <Sparkles className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </React.Fragment>
      );
    }

    if (key === 'calendar' && profile.showCalendarSection) {
      return (
        <section key="calendar" id="agenda" className="scroll-mt-24 bg-[#f8f2eb] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                {profile.calendarSectionEyebrow && (
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-[#b96b4d] uppercase">
                    {profile.calendarSectionEyebrow}
                  </p>
                )}
                <h2 className="font-editorial mt-1.5 text-3xl font-medium text-[#2a211d] sm:text-4xl">
                  {profile.calendarSectionTitle}
                </h2>
                {profile.calendarSectionDescription && (
                  <p className="mt-2 text-xs leading-relaxed text-[#6f6259] sm:text-sm">
                    {profile.calendarSectionDescription}
                  </p>
                )}
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#dfd0c1] bg-[#fbf8f4] px-4 py-1.5 text-xs font-medium text-[#5c4f47] sm:self-auto">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                {availableSlotsCount} horário{availableSlotsCount === 1 ? '' : 's'} disponíve
                {availableSlotsCount === 1 ? 'l' : 'is'}
              </div>
            </div>

            {/* Signature Dark Slate Calendar Widget */}
            <DarkScheduleCalendar
              events={events}
              mode="public"
              onSelectDay={(iso) => setSelectedDay(iso)}
            />
          </div>
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
    <div id="inicio" className="public-editorial-page min-h-screen">
      <PublicNavbar />

      {/* ====================================================================
          BLOCK 1: SPLIT LUXURY EDITORIAL HERO
         ==================================================================== */}
      <section className="relative overflow-hidden bg-[#f5ede4]">
        <div className="mx-auto grid max-w-6xl items-center lg:min-h-[600px] lg:grid-cols-12">
          {/* Left Editorial Copy Column */}
          <div className="relative z-10 space-y-6 px-5 py-12 sm:px-6 lg:col-span-6 lg:py-20 lg:pr-8">
            {profile.heroEyebrow && (
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[#b96b4d] uppercase">
                {profile.heroEyebrow}
              </p>
            )}

            <h1 className="font-editorial text-5xl font-medium leading-[1.03] tracking-tight text-[#2a211d] sm:text-6xl">
              {profile.heroHeadlineLine1 && <span className="block">{profile.heroHeadlineLine1}</span>}
              {profile.heroHeadlineLine2 && <span className="block">{profile.heroHeadlineLine2}</span>}
              {profile.heroHeadlineAccent && (
                <span className="block text-[#b96b4d]">{profile.heroHeadlineAccent}</span>
              )}
            </h1>

            <div className="h-[1.5px] w-12 bg-[#b96b4d]/80" />

            <p className="max-w-md text-sm leading-relaxed text-[#6a5d54] sm:text-[15px]">
              {profile.bio}
            </p>

            {/* Primary & Secondary Actions */}
            {((profile.showPrimaryCta && profile.showCalendarSection) ||
              (profile.showSecondaryCta && profile.showInventorySection)) && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {profile.showPrimaryCta && profile.showCalendarSection && (
                  <a
                    href="#agenda"
                    className="inline-flex items-center gap-2.5 rounded-[4px] bg-[#b96b4d] px-6 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-[#fdfaf7] uppercase shadow-md shadow-[#b96b4d]/20 transition hover:bg-[#9f573b]"
                  >
                    {profile.primaryCtaLabel || 'Agendar Experiência'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}

                {profile.showSecondaryCta && profile.showInventorySection && (
                  <a
                    href="#produtos"
                    className="inline-flex items-center gap-2 rounded-[4px] border border-[#d8c7b6] bg-[#fbf8f4]/80 px-5 py-3.5 text-[11px] font-semibold tracking-[0.16em] text-[#4d413a] uppercase transition hover:border-[#b96b4d] hover:text-[#b96b4d]"
                  >
                    {profile.secondaryCtaLabel || 'Ver Produtos'}
                  </a>
                )}
              </div>
            )}

            {/* Social Proof Row */}
            {profile.showSocialProof && (
              <div className="flex items-center gap-3.5 pt-4">
                <div className="flex -space-x-2">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-9 w-9 rounded-full border-2 border-[#f5ede4] object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f5ede4] bg-[#b96b4d] text-xs font-semibold text-white">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f5ede4] bg-[#e7d6c5] font-editorial text-xs font-semibold text-[#5c4a3e]">
                    ★
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2a211d]">{profile.socialProofTitle}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="flex items-center text-[#c97b59]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#7e6f65]">
                      {profile.socialProofSubtitle}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Full-Bleed Editorial Photo */}
          <div className="relative h-80 w-full sm:h-[440px] lg:col-span-6 lg:h-full lg:min-h-[600px]">
            {profile.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#eadcd0] text-[#b96b4d]/40">
                <Sparkles className="h-16 w-16" />
              </div>
            )}

            {/* Soft blend gradient into left cream column on desktop */}
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-[#f5ede4] to-transparent lg:block" />

            {/* Circular Terracotta Stamp Badge (Bottom Right, like reference) */}
            {profile.heroBadgeText && (
              <div className="absolute bottom-5 right-5 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#b96b4d]/95 p-3 text-center text-[#fdf9f5] shadow-lg ring-4 ring-[#f5ede4]/40 backdrop-blur-sm">
                <Sparkles className="mb-1 h-4 w-4 text-[#f5ddd2]" />
                <span className="text-[8px] font-semibold leading-tight tracking-[0.18em] uppercase">
                  {profile.heroBadgeText}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          BLOCK 2: 4-COLUMN EDITORIAL DIFFERENTIALS STRIP
         ==================================================================== */}
      {profile.showPillarsSection && profile.pillars.length > 0 && (
        <section className="border-y border-[#ebe0d4] bg-[#fbf8f4]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div
              className={`grid divide-y divide-[#ebe0d4] sm:grid-cols-2 sm:divide-y-0 ${
                profile.pillars.length >= 4
                  ? 'lg:grid-cols-4 lg:divide-x'
                  : profile.pillars.length === 3
                    ? 'lg:grid-cols-3 lg:divide-x'
                    : 'lg:grid-cols-2 lg:divide-x'
              }`}
            >
              {profile.pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="flex flex-col items-center px-6 py-9 text-center transition hover:bg-[#f8f2eb]/60"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4e8de] text-[#b96b4d]">
                    {renderPillarIcon(pillar.icon)}
                  </span>
                  <h3 className="font-editorial mt-4 text-xl font-semibold text-[#2a211d]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 max-w-[230px] text-xs leading-relaxed text-[#74665c]">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          ORDERED DYNAMIC SECTIONS (Portfolio + Story, Calendar, Inventory)
         ==================================================================== */}
      <main>{profile.sectionOrder.map((sectionKey) => renderSection(sectionKey))}</main>

      {/* ====================================================================
          OVAL PHOTO CTA & CONTACT SECTION ("Ready for Your Best Hair?" Ref)
         ==================================================================== */}
      <section id="contato" className="scroll-mt-24 bg-[#fbf8f4] py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12">
          {/* Left Oval Photo Frame */}
          <div className="lg:col-span-6">
            <div className="mx-auto max-w-lg overflow-hidden rounded-full border-4 border-[#f2e8dd] bg-[#efe5da] shadow-[0_16px_40px_rgba(42,33,29,0.08)]">
              {profile.ctaImageUrl ? (
                <img
                  src={profile.ctaImageUrl}
                  alt={profile.contactSectionTitle}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-[#b5a395]">
                  <Sparkles className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>

          {/* Right Editorial CTA + Contact Details */}
          <div className="space-y-5 lg:col-span-6 lg:pl-6">
            {profile.contactSectionEyebrow && (
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#b96b4d] uppercase">
                {profile.contactSectionEyebrow}
              </p>
            )}
            <h2 className="font-editorial text-4xl font-medium leading-[1.1] text-[#2a211d] sm:text-5xl">
              {profile.contactSectionTitle}
            </h2>
            {profile.contactSectionDescription && (
              <p className="max-w-md text-sm leading-relaxed text-[#6f6259]">
                {profile.contactSectionDescription}
              </p>
            )}

            {profile.showCalendarSection && (
              <div className="pt-1">
                <a
                  href="#agenda"
                  className="inline-flex items-center gap-2.5 rounded-[4px] bg-[#b96b4d] px-6 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-[#fdfaf7] uppercase shadow-sm transition hover:bg-[#9f573b]"
                >
                  {profile.ctaButtonLabel || 'Agendar Horário'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Subtle Contact Pills */}
            <div className="flex flex-wrap gap-2.5 pt-3">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5d8ca] bg-[#f8f2eb] px-3.5 py-2 text-xs text-[#5c4f47] transition hover:border-[#b96b4d] hover:text-[#2a211d]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#b96b4d]" />
                  {profile.email}
                </a>
              )}
              {profile.whatsapp && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e5d8ca] bg-[#f8f2eb] px-3.5 py-2 text-xs text-[#5c4f47]">
                  <MessageCircle className="h-3.5 w-3.5 text-[#b96b4d]" />
                  {profile.whatsapp}
                </span>
              )}
              {profile.phone && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e5d8ca] bg-[#f8f2eb] px-3.5 py-2 text-xs text-[#5c4f47]">
                  <Phone className="h-3.5 w-3.5 text-[#b96b4d]" />
                  {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          RICH TERRACOTTA 4-COLUMN EDITORIAL FOOTER
         ==================================================================== */}
      <footer className="bg-[#b26346] text-[#fdf7f2]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1: Brand & Social */}
            <div className="space-y-4">
              <div className="leading-none">
                <span className="font-editorial block text-3xl font-medium tracking-[0.14em] text-white uppercase">
                  {profile.name}
                </span>
                {profile.brandTagline && (
                  <span className="mt-1 block text-[9px] font-medium tracking-[0.3em] text-[#f3d8cb] uppercase">
                    {profile.brandTagline}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-[#f4dfd5]">{profile.title}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {profile.socialLinks
                  .filter((s) => s.visible && s.url)
                  .map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      title={social.label}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white hover:text-[#b26346]"
                    >
                      {renderSocialIcon(social.platform)}
                    </a>
                  ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.22em] text-[#f3d8cb] uppercase">
                Links Rápidos
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-[#fdf7f2]/90">
                <li>
                  <a href="#inicio" className="transition hover:text-white hover:underline">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#projetos" className="transition hover:text-white hover:underline">
                    {profile.portfolioSectionTitle || 'Serviços'}
                  </a>
                </li>
                {profile.showStoryBanner && (
                  <li>
                    <a href="#historia" className="transition hover:text-white hover:underline">
                      Nossa História
                    </a>
                  </li>
                )}
                {profile.showInventorySection && (
                  <li>
                    <a href="#produtos" className="transition hover:text-white hover:underline">
                      Produtos
                    </a>
                  </li>
                )}
                <li>
                  <a href="#contato" className="transition hover:text-white hover:underline">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Information */}
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.22em] text-[#f3d8cb] uppercase">
                Informações
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-[#fdf7f2]/90">
                {profile.showCalendarSection && (
                  <li>
                    <a href="#agenda" className="transition hover:text-white hover:underline">
                      Agendar Horário
                    </a>
                  </li>
                )}
                <li>
                  <Link to="/admin/login" className="transition hover:text-white hover:underline">
                    Área Administrativa
                  </Link>
                </li>
                <li className="font-mono text-[11px] text-[#f3d8cb]">/p/{profile.slug}</li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.22em] text-[#f3d8cb] uppercase">
                Contato
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-[#fdf7f2]/90">
                {profile.whatsapp && (
                  <li className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 shrink-0 text-[#f3d8cb]" />
                    <span>{profile.whatsapp}</span>
                  </li>
                )}
                {profile.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#f3d8cb]" />
                    <span>{profile.phone}</span>
                  </li>
                )}
                {profile.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#f3d8cb]" />
                    <span className="truncate">{profile.email}</span>
                  </li>
                )}
                {profile.location && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f3d8cb]" />
                    <span>{profile.location}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/15 pt-6 text-center text-[11px] text-[#f3d8cb]">
            {profile.footerText}
          </div>
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
