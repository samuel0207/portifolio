import React, { useEffect, useState } from 'react';
import {
  Save,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Star,
  Link as LinkIcon,
  User,
  Layers,
  Type,
  Sparkles,
  LayoutTemplate,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageInput } from '../../components/ui/ImageInput';
import { Modal } from '../../components/ui/Modal';
import type {
  EditorialPillar,
  PillarIconKey,
  PortfolioItem,
  PortfolioItemKind,
  PublicSectionKey,
  SocialLink,
  SocialPlatform,
} from '../../types';
import { generateId, slugify } from '../../utils/format';

const SECTION_LABELS: Record<PublicSectionKey, string> = {
  projects: 'Serviços / Portfólio & Banner História',
  calendar: 'Calendário de Agendamentos',
  inventory: 'Vitrine de Produtos / Inventário',
};

export const AdminPortfolioPage: React.FC = () => {
  const {
    data,
    updateProfile,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    movePortfolioItem,
    notify,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'blocks' | 'items'>('profile');

  // Local profile form state (kept in sync with remote Supabase updates)
  const [profileForm, setProfileForm] = useState(data.profile);

  useEffect(() => {
    setProfileForm(data.profile);
  }, [data.profile]);

  const handleSavePortfolioSectionHeader = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      portfolioSectionEyebrow: profileForm.portfolioSectionEyebrow,
      portfolioSectionTitle: profileForm.portfolioSectionTitle,
      portfolioSectionDescription: profileForm.portfolioSectionDescription,
    });
    notify({
      type: 'success',
      title: 'Cabeçalho da seção atualizado!',
      message: 'Os novos textos já aparecem no site público.',
    });
  };

  // Portfolio item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemKind, setItemKind] = useState<PortfolioItemKind>('servico');
  const [itemDesc, setItemDesc] = useState('');
  const [itemTagsText, setItemTagsText] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemPeriod, setItemPeriod] = useState('');
  const [itemHighlight, setItemHighlight] = useState('');
  const [itemFeatured, setItemFeatured] = useState(false);
  const [itemVisible, setItemVisible] = useState(true);

  const sortedItems = [...data.portfolioItems].sort((a, b) => a.order - b.order);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slugify(profileForm.slug || profileForm.name);
    const updated = { ...profileForm, slug: cleanSlug };
    setProfileForm(updated);
    updateProfile(updated);
    notify({
      type: 'success',
      title: 'Alterações publicadas!',
      message: `Site público atualizado em /p/${cleanSlug}.`,
    });
  };

  const addSocialLink = () => {
    const next: SocialLink = {
      id: generateId('soc'),
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://',
      visible: true,
    };
    setProfileForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, next] }));
  };

  const updateSocial = (id: string, patch: Partial<SocialLink>) => {
    setProfileForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const removeSocial = (id: string) => {
    setProfileForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((s) => s.id !== id),
    }));
  };

  // Editorial Pillars CRUD
  const addPillar = () => {
    const next: EditorialPillar = {
      id: generateId('pil'),
      icon: 'sparkles',
      title: 'Novo Diferencial',
      description: 'Descreva brevemente este benefício para seus clientes.',
    };
    setProfileForm((prev) => ({ ...prev, pillars: [...prev.pillars, next] }));
  };

  const updatePillar = (id: string, patch: Partial<EditorialPillar>) => {
    setProfileForm((prev) => ({
      ...prev,
      pillars: prev.pillars.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const removePillar = (id: string) => {
    setProfileForm((prev) => ({
      ...prev,
      pillars: prev.pillars.filter((p) => p.id !== id),
    }));
  };

  const moveSection = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= profileForm.sectionOrder.length) return;
    const copy = [...profileForm.sectionOrder];
    const tmp = copy[index];
    copy[index] = copy[target];
    copy[target] = tmp;
    setProfileForm((prev) => ({ ...prev, sectionOrder: copy }));
  };

  const openCreateItem = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemSubtitle('');
    setItemKind('servico');
    setItemDesc('');
    setItemTagsText('');
    setItemImage('');
    setItemUrl('');
    setItemPeriod('2026');
    setItemHighlight('');
    setItemFeatured(false);
    setItemVisible(true);
    setItemModalOpen(true);
  };

  const openEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemSubtitle(item.subtitle);
    setItemKind(item.kind);
    setItemDesc(item.description);
    setItemTagsText(item.tags.join(', '));
    setItemImage(item.imageUrl);
    setItemUrl(item.externalUrl);
    setItemPeriod(item.period || '');
    setItemHighlight(item.highlight || '');
    setItemFeatured(item.featured);
    setItemVisible(item.visible);
    setItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;
    const tags = itemTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      kind: itemKind,
      title: itemTitle.trim(),
      subtitle: itemSubtitle.trim(),
      description: itemDesc.trim(),
      tags,
      imageUrl: itemImage.trim(),
      externalUrl: itemUrl.trim(),
      period: itemPeriod.trim() || undefined,
      highlight: itemHighlight.trim() || undefined,
      featured: itemFeatured,
      visible: itemVisible,
    };

    if (editingItem) {
      updatePortfolioItem(editingItem.id, payload);
      notify({ type: 'success', title: 'Card atualizado no site público' });
    } else {
      addPortfolioItem(payload);
      notify({ type: 'success', title: 'Novo card adicionado ao site público' });
    }
    setItemModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header + 3 Underline Tabs */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#18191c]">
            Site Público & Portfólio
          </h1>
          <p className="mt-1 text-sm text-[#686c75]">
            Edite todos os blocos do layout editorial público: capa, diferenciais, banners, serviços
            e rodapé.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-b border-black/10">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`relative inline-flex items-center gap-2 pb-2.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'profile' ? 'text-[#141518]' : 'text-[#72767f] hover:text-[#2f3238]'
            }`}
          >
            <User className="h-4 w-4" />
            Hero & Identidade
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1f2024]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blocks')}
            className={`relative inline-flex items-center gap-2 pb-2.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'blocks' ? 'text-[#141518]' : 'text-[#72767f] hover:text-[#2f3238]'
            }`}
          >
            <LayoutTemplate className="h-4 w-4" />
            Blocos & Banners
            {activeTab === 'blocks' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1f2024]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`relative inline-flex items-center gap-2 pb-2.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'items' ? 'text-[#141518]' : 'text-[#72767f] hover:text-[#2f3238]'
            }`}
          >
            <Layers className="h-4 w-4" />
            Serviços & Cards ({data.portfolioItems.length})
            {activeTab === 'items' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1f2024]" />
            )}
          </button>
        </div>
      </div>

      {/* ====================================================================
          TAB 1: HERO, MARCA, CONTATO & REDES SOCIAIS
         ==================================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Brand & Hero Editorial Headlines */}
            <div className="studio-card space-y-4 rounded-[22px] p-5">
              <h2 className="text-sm font-semibold text-[#18191c]">Marca & Chamada Principal (Hero)</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Nome / Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Ex: Lumière"
                    className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Subtítulo da Marca
                  </label>
                  <input
                    type="text"
                    value={profileForm.brandTagline}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, brandTagline: e.target.value })
                    }
                    placeholder="Ex: ATELIÊ & ESTÚDIO"
                    className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Slug do Link Público
                  </label>
                  <div className="studio-input flex items-center overflow-hidden rounded-xl">
                    <span className="border-r border-black/10 bg-black/[0.04] px-2.5 py-2 font-mono text-xs text-[#666a73]">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={profileForm.slug}
                      onChange={(e) => setProfileForm({ ...profileForm, slug: e.target.value })}
                      className="w-full bg-transparent px-2.5 py-2 font-mono text-xs text-[#18191c] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Selo acima do Título
                  </label>
                  <input
                    type="text"
                    value={profileForm.heroEyebrow}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, heroEyebrow: e.target.value })
                    }
                    placeholder="Ex: Onde a Confiança Floresce"
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Título Linha 1
                  </label>
                  <input
                    type="text"
                    value={profileForm.heroHeadlineLine1}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, heroHeadlineLine1: e.target.value })
                    }
                    placeholder="Cuidado Real."
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Título Linha 2
                  </label>
                  <input
                    type="text"
                    value={profileForm.heroHeadlineLine2}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, heroHeadlineLine2: e.target.value })
                    }
                    placeholder="Sua Melhor Versão."
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Destaque Terracota
                  </label>
                  <input
                    type="text"
                    value={profileForm.heroHeadlineAccent}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, heroHeadlineAccent: e.target.value })
                    }
                    placeholder="Todos os Dias."
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Texto de Apresentação (Bio)
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-[#52565f]">Botão Principal</label>
                    <label className="flex cursor-pointer items-center gap-1 text-[11px] text-[#5c6068]">
                      <input
                        type="checkbox"
                        checked={profileForm.showPrimaryCta}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, showPrimaryCta: e.target.checked })
                        }
                        className="h-3.5 w-3.5 accent-[#1f2024]"
                      />
                      Ativo
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={!profileForm.showPrimaryCta}
                    value={profileForm.primaryCtaLabel}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, primaryCtaLabel: e.target.value })
                    }
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none disabled:opacity-45"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-[#52565f]">Botão Secundário</label>
                    <label className="flex cursor-pointer items-center gap-1 text-[11px] text-[#5c6068]">
                      <input
                        type="checkbox"
                        checked={profileForm.showSecondaryCta}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, showSecondaryCta: e.target.checked })
                        }
                        className="h-3.5 w-3.5 accent-[#1f2024]"
                      />
                      Ativo
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={!profileForm.showSecondaryCta}
                    value={profileForm.secondaryCtaLabel}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, secondaryCtaLabel: e.target.value })
                    }
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none disabled:opacity-45"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Selo Circular na Foto
                  </label>
                  <input
                    type="text"
                    value={profileForm.heroBadgeText}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, heroBadgeText: e.target.value })
                    }
                    placeholder="ATENDIMENTO PREMIUM"
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Social Proof Bar */}
              <div className="studio-subcard space-y-2.5 rounded-xl p-3.5">
                <label className="flex cursor-pointer items-center justify-between text-xs font-medium text-[#2c2f36]">
                  <span>Exibir selo de avaliação / prova social no Hero</span>
                  <input
                    type="checkbox"
                    checked={profileForm.showSocialProof}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, showSocialProof: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#1f2024]"
                  />
                </label>
                {profileForm.showSocialProof && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      value={profileForm.socialProofTitle}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, socialProofTitle: e.target.value })
                      }
                      placeholder="Ex: Amado por 500+ clientes"
                      className="studio-input rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={profileForm.socialProofSubtitle}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, socialProofSubtitle: e.target.value })
                      }
                      placeholder="Ex: 4,9/5 (120 avaliações)"
                      className="studio-input rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Hero Images, Contact & Footer */}
            <div className="studio-card space-y-4 rounded-[22px] p-5">
              <h2 className="text-sm font-semibold text-[#18191c]">
                Fotos do Hero, Contato & Rodapé
              </h2>

              <ImageInput
                label="Foto Principal do Hero (lado direito)"
                value={profileForm.bannerUrl}
                onChange={(bannerUrl) => setProfileForm({ ...profileForm, bannerUrl })}
                previewAspect="banner"
                surface="studio"
              />

              <ImageInput
                label="Avatar / Foto do Perfil"
                value={profileForm.avatarUrl}
                onChange={(avatarUrl) => setProfileForm({ ...profileForm, avatarUrl })}
                previewAspect="square"
                surface="studio"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">E-mail</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.whatsapp}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">Telefone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Endereço / Localização
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Frase curta no rodapé (sobre a marca)
                </label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Texto de Direitos Autorais (Rodapé)
                </label>
                <input
                  type="text"
                  value={profileForm.footerText}
                  onChange={(e) => setProfileForm({ ...profileForm, footerText: e.target.value })}
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="studio-card space-y-4 rounded-[22px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#18191c]">Redes Sociais no Rodapé</h2>
              <button
                type="button"
                onClick={addSocialLink}
                className="studio-pill-btn inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Link
              </button>
            </div>

            <div className="grid gap-2.5 lg:grid-cols-2">
              {profileForm.socialLinks.map((soc) => (
                <div
                  key={soc.id}
                  className="studio-subcard grid gap-2 rounded-xl p-3 sm:grid-cols-12 sm:items-center"
                >
                  <select
                    value={soc.platform}
                    onChange={(e) =>
                      updateSocial(soc.id, { platform: e.target.value as SocialPlatform })
                    }
                    className="studio-input rounded-lg px-2 py-1.5 text-xs sm:col-span-3"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="youtube">YouTube</option>
                    <option value="website">Website</option>
                  </select>
                  <input
                    type="text"
                    value={soc.label}
                    onChange={(e) => updateSocial(soc.id, { label: e.target.value })}
                    placeholder="Rótulo"
                    className="studio-input rounded-lg px-2.5 py-1.5 text-xs sm:col-span-3"
                  />
                  <input
                    type="url"
                    value={soc.url}
                    onChange={(e) => updateSocial(soc.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="studio-input rounded-lg px-2.5 py-1.5 text-xs sm:col-span-4"
                  />
                  <div className="flex items-center justify-end gap-1 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => updateSocial(soc.id, { visible: !soc.visible })}
                      className="rounded-lg p-1.5 text-[#52565f] hover:bg-white/60"
                      title={soc.visible ? 'Ocultar' : 'Exibir'}
                    >
                      {soc.visible ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-700" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-[#8d929b]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSocial(soc.id)}
                      className="rounded-lg p-1.5 text-[#52565f] hover:bg-white/60 hover:text-rose-600"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="studio-dark-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold sm:text-sm"
            >
              <Save className="h-4 w-4" />
              Salvar e Publicar no Site
            </button>
          </div>
        </form>
      )}

      {/* ====================================================================
          TAB 2: EDITORIAL BLOCKS (PILLARS, TERRACOTTA STORY, OVAL CTA, HEADERS)
         ==================================================================== */}
      {activeTab === 'blocks' && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* 1. 4-Column Differentials Strip */}
          <div className="studio-card space-y-4 rounded-[22px] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f2024] text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#18191c]">
                    Faixa de Diferenciais (Abaixo do Hero)
                  </h2>
                  <p className="text-xs text-[#686c75]">
                    Os pilares com ícone, título e texto curto (ex: Produtos Selecionados,
                    Especialistas, Agendamento Fácil).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#2c2f36]">
                  <input
                    type="checkbox"
                    checked={profileForm.showPillarsSection}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, showPillarsSection: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#1f2024]"
                  />
                  Exibir faixa
                </label>
                <button
                  type="button"
                  onClick={addPillar}
                  className="studio-pill-btn inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Pilar
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {profileForm.pillars.map((pillar) => (
                <div key={pillar.id} className="studio-subcard space-y-2.5 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={pillar.icon}
                      onChange={(e) =>
                        updatePillar(pillar.id, { icon: e.target.value as PillarIconKey })
                      }
                      className="studio-input rounded-lg px-2 py-1.5 text-xs"
                    >
                      <option value="sparkles">Brilho / Produtos</option>
                      <option value="award">Prêmio / Especialista</option>
                      <option value="heart">Coração / Cuidado</option>
                      <option value="calendar">Calendário / Agenda</option>
                      <option value="shield">Escudo / Garantia</option>
                      <option value="star">Estrela / Qualidade</option>
                    </select>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => updatePillar(pillar.id, { title: e.target.value })}
                      placeholder="Título do pilar"
                      className="studio-input flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removePillar(pillar.id)}
                      className="rounded-lg p-1.5 text-[#555962] hover:bg-white/60 hover:text-rose-600"
                      title="Remover pilar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={pillar.description}
                    onChange={(e) => updatePillar(pillar.id, { description: e.target.value })}
                    placeholder="Descrição curta..."
                    className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Terracotta Editorial Story Banner & Oval CTA Banner */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Story Banner */}
            <div className="studio-card space-y-3.5 rounded-[22px] p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#18191c]">
                  Banner Terracota (Destaque / História)
                </h2>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#2c2f36]">
                  <input
                    type="checkbox"
                    checked={profileForm.showStoryBanner}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, showStoryBanner: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#1f2024]"
                  />
                  Exibir
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">Selo Superior</label>
                <input
                  type="text"
                  value={profileForm.storyEyebrow}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, storyEyebrow: e.target.value })
                  }
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Título (use Enter para quebrar linha)
                </label>
                <textarea
                  rows={2}
                  value={profileForm.storyTitle}
                  onChange={(e) => setProfileForm({ ...profileForm, storyTitle: e.target.value })}
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">Descrição</label>
                <textarea
                  rows={3}
                  value={profileForm.storyDescription}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, storyDescription: e.target.value })
                  }
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={profileForm.storyCtaLabel}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, storyCtaLabel: e.target.value })
                    }
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Destino (#agenda, #produtos ou URL)
                  </label>
                  <input
                    type="text"
                    value={profileForm.storyCtaHref}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, storyCtaHref: e.target.value })
                    }
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <ImageInput
                label="Foto Lateral do Banner Terracota"
                value={profileForm.storyImageUrl}
                onChange={(storyImageUrl) => setProfileForm({ ...profileForm, storyImageUrl })}
                previewAspect="video"
                surface="studio"
              />
            </div>

            {/* Oval CTA Banner + Section Visibility/Order */}
            <div className="space-y-5">
              <div className="studio-card space-y-3.5 rounded-[22px] p-5">
                <h2 className="text-sm font-semibold text-[#18191c]">
                  Banner Final (Foto Oval + Chamada Contato)
                </h2>

                <ImageInput
                  label="Foto Oval do Estúdio / Espaço"
                  value={profileForm.ctaImageUrl}
                  onChange={(ctaImageUrl) => setProfileForm({ ...profileForm, ctaImageUrl })}
                  previewAspect="video"
                  surface="studio"
                />

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#52565f]">
                      Selo Superior
                    </label>
                    <input
                      type="text"
                      value={profileForm.contactSectionEyebrow}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          contactSectionEyebrow: e.target.value,
                        })
                      }
                      className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#52565f]">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={profileForm.ctaButtonLabel}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, ctaButtonLabel: e.target.value })
                      }
                      className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">
                    Título da Chamada
                  </label>
                  <input
                    type="text"
                    value={profileForm.contactSectionTitle}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, contactSectionTitle: e.target.value })
                    }
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#52565f]">Descrição</label>
                  <textarea
                    rows={2}
                    value={profileForm.contactSectionDescription}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        contactSectionDescription: e.target.value,
                      })
                    }
                    className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Section Visibility & Order */}
              <div className="studio-card space-y-3 rounded-[22px] p-5">
                <h2 className="text-sm font-semibold text-[#18191c]">Seções Visíveis & Ordem</h2>

                <div className="space-y-2">
                  <label className="studio-subcard flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs">
                    <span className="font-medium text-[#2c2f36]">Exibir Calendário no site</span>
                    <input
                      type="checkbox"
                      checked={profileForm.showCalendarSection}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, showCalendarSection: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#1f2024]"
                    />
                  </label>

                  <label className="studio-subcard flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs">
                    <span className="font-medium text-[#2c2f36]">
                      Permitir horário personalizado do visitante
                    </span>
                    <input
                      type="checkbox"
                      checked={profileForm.allowPublicCustomBooking}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          allowPublicCustomBooking: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#1f2024]"
                    />
                  </label>

                  <label className="studio-subcard flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-xs">
                    <span className="font-medium text-[#2c2f36]">Exibir Vitrine de Produtos</span>
                    <input
                      type="checkbox"
                      checked={profileForm.showInventorySection}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, showInventorySection: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#1f2024]"
                    />
                  </label>
                </div>

                <div className="space-y-1.5 pt-1">
                  {profileForm.sectionOrder.map((sec, idx) => (
                    <div
                      key={sec}
                      className="studio-subcard flex items-center justify-between rounded-xl px-3 py-2"
                    >
                      <span className="text-xs font-medium text-[#18191c]">
                        {idx + 1}. {SECTION_LABELS[sec]}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          className="studio-pill-btn rounded-lg p-1 disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === profileForm.sectionOrder.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          className="studio-pill-btn rounded-lg p-1 disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Section Titles (Services, Calendar, Inventory) */}
          <div className="studio-card space-y-4 rounded-[22px] p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f2024] text-white">
                <Type className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#18191c]">
                  Títulos das Seções de Serviços, Agenda e Produtos
                </h2>
                <p className="text-xs text-[#686c75]">
                  Customize o selo superior, título em serifa e subtítulo de cada seção.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Serviços/Portfólio */}
              <div className="studio-subcard space-y-2 rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#18191c]">Serviços / Portfólio</p>
                <input
                  type="text"
                  value={profileForm.portfolioSectionEyebrow}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, portfolioSectionEyebrow: e.target.value })
                  }
                  placeholder="Selo superior"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <input
                  type="text"
                  value={profileForm.portfolioSectionTitle}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, portfolioSectionTitle: e.target.value })
                  }
                  placeholder="Título"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <textarea
                  rows={2}
                  value={profileForm.portfolioSectionDescription}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      portfolioSectionDescription: e.target.value,
                    })
                  }
                  placeholder="Descrição"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              {/* Agenda */}
              <div className="studio-subcard space-y-2 rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#18191c]">Agenda Online</p>
                <input
                  type="text"
                  value={profileForm.calendarSectionEyebrow}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, calendarSectionEyebrow: e.target.value })
                  }
                  placeholder="Selo superior"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <input
                  type="text"
                  value={profileForm.calendarSectionTitle}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, calendarSectionTitle: e.target.value })
                  }
                  placeholder="Título"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <textarea
                  rows={2}
                  value={profileForm.calendarSectionDescription}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      calendarSectionDescription: e.target.value,
                    })
                  }
                  placeholder="Descrição"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              {/* Inventário */}
              <div className="studio-subcard space-y-2 rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#18191c]">Produtos / Inventário</p>
                <input
                  type="text"
                  value={profileForm.inventorySectionEyebrow}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, inventorySectionEyebrow: e.target.value })
                  }
                  placeholder="Selo superior"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <input
                  type="text"
                  value={profileForm.inventorySectionTitle}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, inventorySectionTitle: e.target.value })
                  }
                  placeholder="Título"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <textarea
                  rows={2}
                  value={profileForm.inventorySectionDescription}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      inventorySectionDescription: e.target.value,
                    })
                  }
                  placeholder="Descrição"
                  className="studio-input w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="studio-dark-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold sm:text-sm"
            >
              <Save className="h-4 w-4" />
              Salvar Blocos Editoriais
            </button>
          </div>
        </form>
      )}

      {/* ====================================================================
          TAB 3: ARCHED CARDS CRUD (SERVIÇOS / PROJETOS / EXPERIÊNCIAS)
         ==================================================================== */}
      {activeTab === 'items' && (
        <div className="space-y-5">
          {/* Quick Editor for the Services/Portfolio Section Heading */}
          <form
            onSubmit={handleSavePortfolioSectionHeader}
            className="studio-card space-y-3 rounded-[22px] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f2024] text-white">
                  <Type className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#18191c]">
                    Cabeçalho da Seção de Serviços / Portfólio
                  </h2>
                  <p className="text-xs text-[#686c75]">
                    Edite o selo, título e texto exibidos à esquerda dos cards em arco.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className="studio-dark-btn inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar Cabeçalho
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Selo Superior
                </label>
                <input
                  type="text"
                  value={profileForm.portfolioSectionEyebrow}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, portfolioSectionEyebrow: e.target.value })
                  }
                  placeholder="Ex: NOSSOS SERVIÇOS"
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#52565f]">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={profileForm.portfolioSectionTitle}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, portfolioSectionTitle: e.target.value })
                  }
                  placeholder="Ex: Cuidado & Excelência Para Você"
                  className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Descrição Lateral
              </label>
              <textarea
                rows={2}
                value={profileForm.portfolioSectionDescription}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    portfolioSectionDescription: e.target.value,
                  })
                }
                className="studio-input w-full rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#686c75]">
              Gerencie os cards com moldura em arco exibidos na vitrine de serviços/portfólio.
            </p>
            <button
              type="button"
              onClick={openCreateItem}
              className="studio-dark-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              Novo Card / Serviço
            </button>
          </div>

          {sortedItems.length === 0 ? (
            <div className="studio-card rounded-[22px] py-12 text-center">
              <Layers className="mx-auto h-9 w-9 text-[#72767f]" />
              <p className="mt-2 text-sm font-medium text-[#2c2f36]">Nenhum card cadastrado.</p>
              <button
                type="button"
                onClick={openCreateItem}
                className="studio-dark-btn mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar primeiro card
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`studio-card flex flex-col gap-4 rounded-[20px] p-4 transition sm:flex-row sm:items-center ${
                    item.visible ? '' : 'opacity-65'
                  }`}
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-t-full rounded-b-lg border border-black/10 bg-white/40">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#72767f]">
                        <Layers className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-black/[0.07] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3c3f46]">
                        {item.kind}
                      </span>
                      {item.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
                          <Star className="h-2.5 w-2.5 fill-amber-700" />
                          Destaque
                        </span>
                      )}
                      {!item.visible && (
                        <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#555962]">
                          Oculto
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 truncate text-sm font-semibold text-[#18191c]">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#666a73]">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-white/55 px-1.5 py-0.5 text-[10px] font-medium text-[#4a4e57]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePortfolioItem(item.id, 'up')}
                      className="studio-pill-btn rounded-xl p-2 disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sortedItems.length - 1}
                      onClick={() => movePortfolioItem(item.id, 'down')}
                      className="studio-pill-btn rounded-xl p-2 disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updatePortfolioItem(item.id, { visible: !item.visible });
                        notify({
                          type: 'info',
                          title: item.visible ? 'Card ocultado' : 'Card publicado',
                        });
                      }}
                      className="studio-pill-btn rounded-xl p-2"
                      title={item.visible ? 'Ocultar' : 'Exibir'}
                    >
                      {item.visible ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-700" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-[#72767f]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditItem(item)}
                      className="studio-pill-btn rounded-xl p-2"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePortfolioItem(item.id);
                        notify({ type: 'info', title: 'Card excluído' });
                      }}
                      className="studio-pill-btn rounded-xl p-2 hover:text-rose-600"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Item Modal */}
      <Modal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? 'Editar Card / Serviço' : 'Novo Card / Serviço'}
        subtitle="A imagem será exibida automaticamente no formato editorial em arco."
        maxWidthClass="max-w-2xl"
        surface="studio"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#52565f]">Título *</label>
              <input
                type="text"
                required
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Ex: Corte & Styling, Consultoria Visual..."
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">Tipo</label>
              <select
                value={itemKind}
                onChange={(e) => setItemKind(e.target.value as PortfolioItemKind)}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="servico">Serviço</option>
                <option value="projeto">Projeto</option>
                <option value="experiencia">Experiência</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Subtítulo / Categoria
              </label>
              <input
                type="text"
                value={itemSubtitle}
                onChange={(e) => setItemSubtitle(e.target.value)}
                placeholder="Ex: Atendimento Personalizado"
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Duração / Ano (opcional)
              </label>
              <input
                type="text"
                value={itemPeriod}
                onChange={(e) => setItemPeriod(e.target.value)}
                placeholder="Ex: 60 min ou 2026"
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#52565f]">Descrição *</label>
            <textarea
              rows={3}
              required
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Descreva os detalhes e benefícios..."
              className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={itemTagsText}
                onChange={(e) => setItemTagsText(e.target.value)}
                placeholder="Cuidado, Sob Medida, Premium"
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#52565f]">
                Destaque / Resultado
              </label>
              <input
                type="text"
                value={itemHighlight}
                onChange={(e) => setItemHighlight(e.target.value)}
                placeholder="Ex: Mais procurado"
                className="studio-input w-full rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#52565f]">
              Link Externo (opcional)
            </label>
            <div className="relative">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d717a]" />
              <input
                type="url"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                placeholder="https://..."
                className="studio-input w-full rounded-xl py-2 pl-9 pr-3 text-sm outline-none"
              />
            </div>
          </div>

          <ImageInput
            label="Foto do Card (exibida em moldura de arco)"
            value={itemImage}
            onChange={setItemImage}
            previewAspect="video"
            surface="studio"
          />

          <div className="studio-subcard flex flex-wrap items-center gap-5 rounded-xl px-4 py-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#2c2f36]">
              <input
                type="checkbox"
                checked={itemVisible}
                onChange={(e) => setItemVisible(e.target.checked)}
                className="h-4 w-4 accent-[#1f2024]"
              />
              Visível no site público
            </label>
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#2c2f36]">
              <input
                type="checkbox"
                checked={itemFeatured}
                onChange={(e) => setItemFeatured(e.target.checked)}
                className="h-4 w-4 accent-[#1f2024]"
              />
              Marcar como destaque
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-black/10 pt-4">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="studio-pill-btn rounded-full px-4 py-2 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="studio-dark-btn rounded-full px-5 py-2 text-xs font-semibold"
            >
              {editingItem ? 'Salvar Card' : 'Adicionar Card'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
