import React, { useMemo, useState } from 'react';
import { ExternalLink, Sparkles, Layers, Briefcase, Award, ArrowUpRight } from 'lucide-react';
import type { PortfolioItem, PortfolioItemKind } from '../../types';
import { Modal } from '../ui/Modal';

interface PortfolioSectionProps {
  items: PortfolioItem[];
}

const KIND_LABELS: Record<PortfolioItemKind, string> = {
  projeto: 'Projeto',
  servico: 'Serviço',
  experiencia: 'Experiência',
};

const KIND_ICONS: Record<PortfolioItemKind, React.ReactNode> = {
  projeto: <Layers className="h-3.5 w-3.5" />,
  servico: <Sparkles className="h-3.5 w-3.5" />,
  experiencia: <Briefcase className="h-3.5 w-3.5" />,
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ items }) => {
  const [filter, setFilter] = useState<'todos' | PortfolioItemKind>('todos');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => item.visible)
      .sort((a, b) => a.order - b.order)
      .filter((item) => (filter === 'todos' ? true : item.kind === filter));
  }, [items, filter]);

  return (
    <section id="projetos" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#ef5350]">
            Portfólio Selecionado
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Projetos, Serviços & Experiências
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[#8b96a6]">
            Trabalhos recentes, especialidades sob demanda e trajetória profissional atualizados em
            tempo real pelo painel administrativo.
          </p>
        </div>

        {/* Kind Filter */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#252d3a] bg-[#0f131a] p-1 self-start sm:self-auto">
          {(
            [
              { key: 'todos', label: 'Todos' },
              { key: 'projeto', label: 'Projetos' },
              { key: 'servico', label: 'Serviços' },
              { key: 'experiencia', label: 'Experiências' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === tab.key
                  ? 'bg-[#1c222d] text-white shadow-sm'
                  : 'text-[#8b96a6] hover:text-[#d5dce6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#252d3a] bg-[#0f131a] px-6 py-12 text-center">
          <Layers className="mx-auto h-9 w-9 text-[#5a6575]" />
          <p className="mt-3 text-sm font-medium text-[#d5dce6]">
            Nenhum item encontrado nesta categoria.
          </p>
          <p className="mt-1 text-xs text-[#8b96a6]">
            Selecione outro filtro ou adicione itens no painel do administrador.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelected(item)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#252d3a] bg-[#0f131a] transition duration-200 hover:-translate-y-0.5 hover:border-[#394558] hover:shadow-xl hover:shadow-black/40"
            >
              {item.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden border-b border-[#222a36] bg-[#161b22]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f131a] via-transparent to-transparent opacity-80" />
                  <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b0e14]/80 px-2.5 py-1 text-[11px] font-medium text-[#e6edf3] backdrop-blur-md">
                      {KIND_ICONS[item.kind]}
                      {KIND_LABELS[item.kind]}
                    </span>
                    {item.featured && (
                      <span className="rounded-full border border-[#ef5350]/40 bg-[#ef5350]/20 px-2.5 py-1 text-[10px] font-semibold text-[#ff9b99] backdrop-blur-md">
                        Destaque
                      </span>
                    )}
                  </div>
                  {item.period && (
                    <span className="absolute bottom-3 right-3.5 rounded-md bg-[#0b0e14]/75 px-2 py-0.5 font-mono text-[11px] text-[#c8d1dc] backdrop-blur-sm">
                      {item.period}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                {!item.imageUrl && (
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#252d3a] bg-[#161b22] px-2.5 py-1 text-[11px] font-medium text-[#d5dce6]">
                      {KIND_ICONS[item.kind]}
                      {KIND_LABELS[item.kind]}
                    </span>
                    {item.period && (
                      <span className="font-mono text-[11px] text-[#8b96a6]">{item.period}</span>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#e6edf3] transition group-hover:text-white sm:text-lg">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="mt-0.5 text-xs font-medium text-[#8b96a6]">{item.subtitle}</p>
                    )}
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#6b7686] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ef5350]" />
                </div>

                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-[#9aa5b4]">
                  {item.description}
                </p>

                {item.highlight && (
                  <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <Award className="h-3.5 w-3.5" />
                    {item.highlight}
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#222a36] pt-3.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#252d3a] bg-[#161b22] px-2 py-0.5 text-[11px] text-[#9aa5b4]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail Modal */}
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
      >
        {selected && (
          <div className="space-y-5">
            {selected.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-[#252d3a] bg-[#161b22]">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="max-h-72 w-full object-cover"
                />
              </div>
            )}

            {selected.highlight && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300">
                <Award className="h-4 w-4" />
                Resultado / Destaque: {selected.highlight}
              </div>
            )}

            <p className="whitespace-pre-line text-sm leading-relaxed text-[#c8d1dc]">
              {selected.description}
            </p>

            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1 text-xs font-medium text-[#b4bfd0]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#252d3a] pt-4">
              {selected.externalUrl && (
                <a
                  href={selected.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f26461]"
                >
                  Abrir Link Externo
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-[#252d3a] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c8d1dc] hover:bg-[#1c222d]"
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
