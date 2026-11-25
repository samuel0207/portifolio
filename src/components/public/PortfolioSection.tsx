import React, { useMemo, useState } from 'react';
import { ExternalLink, Layers, Award, ArrowRight } from 'lucide-react';
import type { PortfolioItem, PortfolioItemKind } from '../../types';
import { Modal } from '../ui/Modal';

interface PortfolioSectionProps {
  items: PortfolioItem[];
  eyebrow: string;
  title: string;
  description: string;
}

const KIND_LABELS: Record<PortfolioItemKind, string> = {
  projeto: 'Projeto',
  servico: 'Serviço',
  experiencia: 'Experiência',
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  items,
  eyebrow,
  title,
  description,
}) => {
  const [filter, setFilter] = useState<'todos' | PortfolioItemKind>('todos');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => item.visible)
      .sort((a, b) => a.order - b.order)
      .filter((item) => (filter === 'todos' ? true : item.kind === filter));
  }, [items, filter]);

  const availableKinds = useMemo(() => {
    const kinds = new Set<PortfolioItemKind>();
    items.filter((i) => i.visible).forEach((i) => kinds.add(i.kind));
    return kinds;
  }, [items]);

  return (
    <section id="projetos" className="scroll-mt-24 bg-[#f8f2eb] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Editorial Intro Column (Matches Reference "OUR SERVICES / Luxury Care For Every You") */}
          <div className="space-y-4 lg:col-span-3 lg:sticky lg:top-28">
            {eyebrow && (
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#b96b4d] uppercase">
                {eyebrow}
              </p>
            )}
            <h2 className="font-editorial text-3xl font-medium leading-[1.12] text-[#2a211d] sm:text-4xl">
              {title}
            </h2>
            <div className="h-[1.5px] w-10 bg-[#b96b4d]/70" />
            {description && (
              <p className="text-xs leading-relaxed text-[#6f6259] sm:text-sm">{description}</p>
            )}

            {/* Editorial Filter Pills */}
            {availableKinds.size > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(
                  [
                    { key: 'todos', label: 'Todos' },
                    { key: 'projeto', label: 'Projetos' },
                    { key: 'servico', label: 'Serviços' },
                    { key: 'experiencia', label: 'Experiências' },
                  ] as const
                )
                  .filter((tab) => tab.key === 'todos' || availableKinds.has(tab.key))
                  .map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilter(tab.key)}
                      className={`rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.12em] uppercase transition ${
                        filter === tab.key
                          ? 'bg-[#b96b4d] text-[#fdfaf7]'
                          : 'border border-[#e2d4c5] bg-[#fbf8f4] text-[#6f6259] hover:border-[#b96b4d]/60 hover:text-[#2a211d]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setFilter('todos')}
              className="inline-flex items-center gap-2 pt-2 text-[10px] font-semibold tracking-[0.18em] text-[#b96b4d] uppercase transition hover:gap-3 hover:text-[#985237]"
            >
              Ver Todos
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right Arched-Top Editorial Cards Grid */}
          <div className="lg:col-span-9">
            {visibleItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dfd0c1] bg-[#fbf8f4] px-6 py-12 text-center">
                <Layers className="mx-auto h-9 w-9 text-[#b5a395]" />
                <p className="mt-3 font-editorial text-xl text-[#2a211d]">
                  Nenhum item encontrado nesta categoria.
                </p>
                <p className="mt-1 text-xs text-[#7c6d63]">
                  Selecione outro filtro ou cadastre itens no painel administrativo.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visibleItems.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="group flex cursor-pointer flex-col rounded-t-[150px] rounded-b-xl border border-[#ece1d5] bg-[#fbf8f4] p-3.5 pb-5 shadow-[0_10px_30px_rgba(42,33,29,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#d8c3af] hover:shadow-[0_16px_36px_rgba(42,33,29,0.08)]"
                  >
                    {/* Iconic Arched Top Photo Frame */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[140px] rounded-b-md bg-[#efe5da]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#b5a395]">
                          <Layers className="h-10 w-10" />
                        </div>
                      )}
                      {item.featured && (
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#b96b4d]/90 px-3 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                          Destaque
                        </span>
                      )}
                    </div>

                    {/* Editorial Card Body */}
                    <div className="flex flex-1 flex-col px-1.5 pt-4">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-medium tracking-[0.14em] text-[#9b887b] uppercase">
                        <span>{KIND_LABELS[item.kind]}</span>
                        {item.period && <span>{item.period}</span>}
                      </div>

                      <h3 className="font-editorial mt-1.5 text-xl font-semibold leading-snug text-[#2a211d] transition group-hover:text-[#b96b4d]">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-[#6f6259]">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-[#efe5da] pt-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#b96b4d] uppercase transition group-hover:gap-2.5">
                          Saiba Mais
                          <ArrowRight className="h-3 w-3" />
                        </span>
                        {item.tags[0] && (
                          <span className="truncate rounded-full bg-[#f4ebe1] px-2 py-0.5 text-[10px] text-[#7c6d63]">
                            {item.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editorial Detail Modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || ''}
        subtitle={
          selected
            ? `${KIND_LABELS[selected.kind]}${selected.subtitle ? ` • ${selected.subtitle}` : ''}${
                selected.period ? ` • ${selected.period}` : ''
              }`
            : undefined
        }
        maxWidthClass="max-w-2xl"
        surface="editorial"
      >
        {selected && (
          <div className="space-y-5">
            {selected.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-[#e5d8ca] bg-[#f1e7dc]">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="max-h-72 w-full object-cover"
                />
              </div>
            )}

            {selected.highlight && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b96b4d]/25 bg-[#f4e8de] px-3.5 py-1.5 text-xs font-medium text-[#9f573b]">
                <Award className="h-4 w-4" />
                {selected.highlight}
              </div>
            )}

            <p className="whitespace-pre-line text-sm leading-relaxed text-[#4f433c]">
              {selected.description}
            </p>

            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#e5d8ca] bg-[#f5eee6] px-3 py-1 text-[11px] font-medium text-[#6f6259]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#e8ddd1] pt-4">
              {selected.externalUrl && (
                <a
                  href={selected.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[#b96b4d] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-[#9f573b]"
                >
                  Abrir Link Externo
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-[4px] border border-[#dfd0c1] bg-[#f5eee6] px-4 py-2 text-xs font-medium text-[#5c4f47] hover:bg-[#ece0d3]"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
