import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageInput } from '../../components/ui/ImageInput';
import { Modal } from '../../components/ui/Modal';
import type {
  PortfolioItem,
  PortfolioItemKind,
  PublicSectionKey,
  SocialLink,
  SocialPlatform,
} from '../../types';
import { generateId, slugify } from '../../utils/format';

const SECTION_LABELS: Record<PublicSectionKey, string> = {
  projects: 'Projetos, Serviços & Experiências',
  calendar: 'Calendário de Agendamentos',
  inventory: 'Inventário de Produtos',
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

  const [activeTab, setActiveTab] = useState<'profile' | 'items'>('profile');

  // Local profile form state
  const [profileForm, setProfileForm] = useState(data.profile);

  // Portfolio item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemKind, setItemKind] = useState<PortfolioItemKind>('projeto');
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
      title: 'Perfil e portfólio salvos!',
      message: `Link público atualizado em /p/${cleanSlug}.`,
    });
  };

  const addSocialLink = () => {
    const next: SocialLink = {
      id: generateId('soc'),
      platform: 'website',
      label: 'Novo Link',
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
    setItemKind('projeto');
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
      notify({ type: 'success', title: 'Item atualizado no portfólio' });
    } else {
      addPortfolioItem(payload);
      notify({ type: 'success', title: 'Novo item adicionado ao portfólio' });
    }
    setItemModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Portfólio & Perfil</h1>
          <p className="mt-1 text-sm text-[#8b96a6]">
            Personalize cabeçalho, textos, imagens, links sociais e todos os blocos públicos.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[#252d3a] bg-[#0f131a] p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-[#1c222d] text-white'
                : 'text-[#8b96a6] hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Cabeçalho & Perfil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'items'
                ? 'bg-[#1c222d] text-white'
                : 'text-[#8b96a6] hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Projetos & Serviços ({data.portfolioItems.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PROFILE & HERO */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Identity */}
            <div className="space-y-4 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
              <h2 className="text-sm font-semibold text-white">Identidade & Cabeçalho (Hero)</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">Nome / Marca *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">Slug do Link Público</label>
                  <div className="flex items-center overflow-hidden rounded-lg border border-[#252d3a] bg-[#0b0e14]">
                    <span className="border-r border-[#252d3a] bg-[#161b22] px-2.5 py-2 font-mono text-xs text-[#7d8898]">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={profileForm.slug}
                      onChange={(e) => setProfileForm({ ...profileForm, slug: e.target.value })}
                      className="w-full bg-transparent px-2.5 py-2 font-mono text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#9aa5b4]">Título / Especialidade</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#9aa5b4]">Bio Curta</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#9aa5b4]">Localização / Atendimento</label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">Botão Principal</label>
                  <input
                    type="text"
                    value={profileForm.primaryCtaLabel}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, primaryCtaLabel: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">Botão Secundário</label>
                  <input
                    type="text"
                    value={profileForm.secondaryCtaLabel}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, secondaryCtaLabel: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
                  />
                </div>
              </div>
            </div>

            {/* Images & Contact */}
            <div className="space-y-4 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
              <h2 className="text-sm font-semibold text-white">Imagens & Informações de Contato</h2>

              <ImageInput
                label="Avatar / Foto de Perfil"
                value={profileForm.avatarUrl}
                onChange={(avatarUrl) => setProfileForm({ ...profileForm, avatarUrl })}
                previewAspect="square"
              />

              <ImageInput
                label="Banner de Capa"
                value={profileForm.bannerUrl}
                onChange={(bannerUrl) => setProfileForm({ ...profileForm, bannerUrl })}
                previewAspect="banner"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">E-mail</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-xs text-white outline-none focus:border-[#ef5350]/70"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.whatsapp}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                    className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-xs text-white outline-none focus:border-[#ef5350]/70"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#9aa5b4]">Telefone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-xs text-white outline-none focus:border-[#ef5350]/70"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#9aa5b4]">Texto do Rodapé</label>
                <input
                  type="text"
                  value={profileForm.footerText}
                  onChange={(e) => setProfileForm({ ...profileForm, footerText: e.target.value })}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-xs text-white outline-none focus:border-[#ef5350]/70"
                />
              </div>
            </div>
          </div>

          {/* Social Links & Section Visibility/Order */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Links Sociais</h2>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1.5 text-xs font-medium text-[#d5dce6] hover:bg-[#1c222d]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Link
                </button>
              </div>

              <div className="space-y-2.5">
                {profileForm.socialLinks.map((soc) => (
                  <div
                    key={soc.id}
                    className="grid gap-2 rounded-xl border border-[#222a36] bg-[#161b22] p-3 sm:grid-cols-12 sm:items-center"
                  >
                    <select
                      value={soc.platform}
                      onChange={(e) =>
                        updateSocial(soc.id, { platform: e.target.value as SocialPlatform })
                      }
                      className="rounded-lg border border-[#252d3a] bg-[#0b0e14] px-2 py-1.5 text-xs text-white sm:col-span-3"
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
                      className="rounded-lg border border-[#252d3a] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-white sm:col-span-3"
                    />
                    <input
                      type="url"
                      value={soc.url}
                      onChange={(e) => updateSocial(soc.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="rounded-lg border border-[#252d3a] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-white sm:col-span-4"
                    />
                    <div className="flex items-center justify-end gap-1 sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => updateSocial(soc.id, { visible: !soc.visible })}
                        className="rounded-lg p-1.5 text-[#9aa5b4] hover:bg-[#0f131a] hover:text-white"
                        title={soc.visible ? 'Ocultar link' : 'Exibir link'}
                      >
                        {soc.visible ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-[#5a6575]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSocial(soc.id)}
                        className="rounded-lg p-1.5 text-[#9aa5b4] hover:bg-[#0f131a] hover:text-[#ef5350]"
                        title="Remover link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
              <h2 className="text-sm font-semibold text-white">Seções Públicas & Ordem</h2>

              <div className="space-y-2.5">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#222a36] bg-[#161b22] px-3.5 py-2.5 text-xs">
                  <span className="text-[#d5dce6]">Exibir Calendário de Agendamentos no público</span>
                  <input
                    type="checkbox"
                    checked={profileForm.showCalendarSection}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, showCalendarSection: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#ef5350]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#222a36] bg-[#161b22] px-3.5 py-2.5 text-xs">
                  <span className="text-[#d5dce6]">
                    Permitir visitante solicitar horário personalizado
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
                    className="h-4 w-4 accent-[#ef5350]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#222a36] bg-[#161b22] px-3.5 py-2.5 text-xs">
                  <span className="text-[#d5dce6]">Exibir Inventário de Produtos no público</span>
                  <input
                    type="checkbox"
                    checked={profileForm.showInventorySection}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, showInventorySection: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#ef5350]"
                  />
                </label>
              </div>

              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-[#9aa5b4]">Ordem de exibição</p>
                <div className="space-y-2">
                  {profileForm.sectionOrder.map((sec, idx) => (
                    <div
                      key={sec}
                      className="flex items-center justify-between rounded-xl border border-[#222a36] bg-[#161b22] px-3.5 py-2.5"
                    >
                      <span className="text-xs font-medium text-[#e6edf3]">
                        {idx + 1}. {SECTION_LABELS[sec]}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          className="rounded-md border border-[#252d3a] p-1 text-[#9aa5b4] hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === profileForm.sectionOrder.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          className="rounded-md border border-[#252d3a] p-1 text-[#9aa5b4] hover:text-white disabled:opacity-30"
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef5350] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ef5350]/20 transition hover:bg-[#f26461]"
            >
              <Save className="h-4 w-4" />
              Salvar Alterações do Perfil
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PORTFOLIO ITEMS CRUD */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#8b96a6]">
              Crie, edite, reordene, oculte ou exclua projetos, serviços e experiências exibidos no
              portfólio público.
            </p>
            <button
              type="button"
              onClick={openCreateItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f26461]"
            >
              <Plus className="h-4 w-4" />
              Novo Item de Portfólio
            </button>
          </div>

          {sortedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#252d3a] bg-[#0f131a] py-12 text-center">
              <Layers className="mx-auto h-9 w-9 text-[#5a6575]" />
              <p className="mt-2 text-sm font-medium text-[#d5dce6]">
                Nenhum item de portfólio cadastrado.
              </p>
              <button
                type="button"
                onClick={openCreateItem}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ef5350] px-3.5 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar primeiro item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                    item.visible
                      ? 'border-[#252d3a] bg-[#0f131a]'
                      : 'border-[#222a36] bg-[#0f131a]/50 opacity-70'
                  }`}
                >
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl border border-[#222a36] bg-[#161b22] sm:w-28">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#5a6575]">
                        <Layers className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-[#252d3a] bg-[#161b22] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c8d1dc]">
                        {item.kind}
                      </span>
                      {item.featured && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          <Star className="h-2.5 w-2.5 fill-amber-300" />
                          Destaque
                        </span>
                      )}
                      {!item.visible && (
                        <span className="rounded-md bg-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          Oculto
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 truncate text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#8b96a6]">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-[#161b22] px-1.5 py-0.5 text-[10px] text-[#9aa5b4]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePortfolioItem(item.id, 'up')}
                      className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:text-white disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sortedItems.length - 1}
                      onClick={() => movePortfolioItem(item.id, 'down')}
                      className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:text-white disabled:opacity-30"
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
                          title: item.visible ? 'Item ocultado' : 'Item publicado',
                        });
                      }}
                      className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:text-white"
                      title={item.visible ? 'Ocultar do público' : 'Exibir no público'}
                    >
                      {item.visible ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditItem(item)}
                      className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:text-white"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePortfolioItem(item.id);
                        notify({ type: 'info', title: 'Item excluído do portfólio' });
                      }}
                      className="rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#9aa5b4] hover:border-[#ef5350]/50 hover:text-[#ef5350]"
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
        title={editingItem ? 'Editar Item do Portfólio' : 'Novo Item do Portfólio'}
        subtitle="Preencha os detalhes do projeto, serviço ou experiência."
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#9aa5b4]">Título *</label>
              <input
                type="text"
                required
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Ex: Redesign E-commerce Norte Café"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Tipo</label>
              <select
                value={itemKind}
                onChange={(e) => setItemKind(e.target.value as PortfolioItemKind)}
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              >
                <option value="projeto">Projeto</option>
                <option value="servico">Serviço</option>
                <option value="experiencia">Experiência</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Subtítulo / Segmento</label>
              <input
                type="text"
                value={itemSubtitle}
                onChange={(e) => setItemSubtitle(e.target.value)}
                placeholder="Ex: Branding • Produto Digital"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Período / Ano</label>
              <input
                type="text"
                value={itemPeriod}
                onChange={(e) => setItemPeriod(e.target.value)}
                placeholder="Ex: 2026 ou 2023 – Atual"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#9aa5b4]">Descrição *</label>
            <textarea
              rows={3}
              required
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Descreva o escopo, entregas e resultados..."
              className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">
                Tags / Tecnologias (separadas por vírgula)
              </label>
              <input
                type="text"
                value={itemTagsText}
                onChange={(e) => setItemTagsText(e.target.value)}
                placeholder="React, Figma, Branding, UX"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#9aa5b4]">Destaque / Resultado</label>
              <input
                type="text"
                value={itemHighlight}
                onChange={(e) => setItemHighlight(e.target.value)}
                placeholder="Ex: +40% conversão"
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#9aa5b4]">Link Externo (opcional)</label>
            <div className="relative">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7686]" />
              <input
                type="url"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#ef5350]/70"
              />
            </div>
          </div>

          <ImageInput
            label="Imagem / Capa do Card"
            value={itemImage}
            onChange={setItemImage}
            previewAspect="video"
          />

          <div className="flex flex-wrap items-center gap-5 rounded-xl border border-[#222a36] bg-[#161b22] px-4 py-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-[#d5dce6]">
              <input
                type="checkbox"
                checked={itemVisible}
                onChange={(e) => setItemVisible(e.target.checked)}
                className="h-4 w-4 accent-[#ef5350]"
              />
              Visível no portfólio público
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[#d5dce6]">
              <input
                type="checkbox"
                checked={itemFeatured}
                onChange={(e) => setItemFeatured(e.target.checked)}
                className="h-4 w-4 accent-[#ef5350]"
              />
              Marcar como destaque
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#252d3a] pt-4">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="rounded-lg border border-[#252d3a] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c8d1dc]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white hover:bg-[#f26461]"
            >
              {editingItem ? 'Salvar Item' : 'Adicionar Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
