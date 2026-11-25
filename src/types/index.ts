export type SocialPlatform =
  | 'instagram'
  | 'linkedin'
  | 'github'
  | 'whatsapp'
  | 'youtube'
  | 'website';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  visible: boolean;
}

export type PublicSectionKey = 'projects' | 'calendar' | 'inventory';

export type PillarIconKey = 'sparkles' | 'award' | 'heart' | 'calendar' | 'shield' | 'star';

export interface EditorialPillar {
  id: string;
  icon: PillarIconKey;
  title: string;
  description: string;
}

export interface PortfolioProfile {
  slug: string;
  name: string;
  brandTagline: string;
  title: string;
  bio: string;
  location: string;
  avatarUrl: string;
  bannerUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  // Editorial Hero customization
  heroEyebrow: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroHeadlineAccent: string;
  heroBadgeText: string;
  showSocialProof: boolean;
  socialProofTitle: string;
  socialProofSubtitle: string;
  // 4-Column Differentials / Pillars strip
  showPillarsSection: boolean;
  pillars: EditorialPillar[];
  // Terracotta Editorial Story Banner
  showStoryBanner: boolean;
  storyEyebrow: string;
  storyTitle: string;
  storyDescription: string;
  storyCtaLabel: string;
  storyCtaHref: string;
  storyImageUrl: string;
  // Bottom Oval CTA Banner
  ctaImageUrl: string;
  ctaButtonLabel: string;
  // Section Headings
  portfolioSectionEyebrow: string;
  portfolioSectionTitle: string;
  portfolioSectionDescription: string;
  calendarSectionEyebrow: string;
  calendarSectionTitle: string;
  calendarSectionDescription: string;
  inventorySectionEyebrow: string;
  inventorySectionTitle: string;
  inventorySectionDescription: string;
  contactSectionEyebrow: string;
  contactSectionTitle: string;
  contactSectionDescription: string;
  showCalendarSection: boolean;
  showInventorySection: boolean;
  allowPublicCustomBooking: boolean;
  socialLinks: SocialLink[];
  sectionOrder: PublicSectionKey[];
  footerText: string;
}

export type PortfolioItemKind = 'projeto' | 'servico' | 'experiencia';

export interface PortfolioItem {
  id: string;
  kind: PortfolioItemKind;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  imageUrl: string;
  externalUrl: string;
  period?: string;
  highlight?: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export type EventStatus = 'Disponível' | 'Reservado' | 'Bloqueado';

export type EventColor = 'emerald' | 'coral' | 'sky' | 'amber' | 'violet';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  allDay: boolean;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  title: string;
  description?: string;
  clientName?: string;
  clientContact?: string;
  notes?: string;
  status: EventStatus;
  color: EventColor;
  bookedByVisitor?: boolean;
  createdAt: string;
}

export type ProductStatus =
  | 'Disponível'
  | 'Baixo estoque'
  | 'Esgotado'
  | 'Oculto';

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number | null;
  showPrice: boolean;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  visiblePublic: boolean;
  allowReservation: boolean;
  deductStockOnReserve: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface ProductInterest {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  visitorName: string;
  visitorContact: string;
  notes: string;
  deductedStock: boolean;
  createdAt: string;
  resolved: boolean;
}

export interface AppData {
  version: number;
  profile: PortfolioProfile;
  portfolioItems: PortfolioItem[];
  events: CalendarEvent[];
  products: InventoryProduct[];
  productInterests: ProductInterest[];
  updatedAt: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
