import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Search,
  ShoppingBag,
  CheckCircle2,
  Layers,
  Calendar,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventStatusBadge, ProductStatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrencyBRL, formatDateBR, formatTimeRange } from '../../utils/format';

type OverviewTab = 'agenda' | 'reservas' | 'inventario';

export const AdminOverviewPage: React.FC = () => {
  const { data } = useApp();
  const [activeTab, setActiveTab] = useState<OverviewTab>('agenda');
  const [query, setQuery] = useState('');

  const visiblePortfolio = data.portfolioItems.filter((i) => i.visible).length;
  const availableSlots = data.events.filter((e) => e.status === 'Disponível').length;
  const reservedEvents = data.events.filter((e) => e.status === 'Reservado').length;
  const totalStock = data.products.reduce((acc, p) => acc + p.stock, 0);
  const lowOrOutCount = data.products.filter(
    (p) => p.status === 'Baixo estoque' || p.status === 'Esgotado'
  ).length;
  const pendingInterests = data.productInterests.filter((i) => !i.resolved);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...data.events]
      .sort((a, b) => `${a.date}${a.startTime || ''}`.localeCompare(`${b.date}${b.startTime || ''}`))
      .filter((ev) => {
        if (!q) return true;
        return (
          ev.title.toLowerCase().includes(q) ||
          (ev.clientName || '').toLowerCase().includes(q) ||
          ev.status.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [data.events, query]);

  const filteredInterests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.productInterests.filter((item) => {
      if (!q) return true;
      return (
        item.productName.toLowerCase().includes(q) ||
        item.visitorName.toLowerCase().includes(q) ||
        item.productSku.toLowerCase().includes(q)
      );
    });
  }, [data.productInterests, query]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [data.products, query]);

  return (
    <div className="space-y-8">
      {/* Main Page Heading (Matches Reference Typography) */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#18191c]">Visão Geral</h1>
        <p className="mt-1 text-sm text-[#686c75]">
          Todos os seus projetos, agendamentos e controle de inventário em um só lugar.
        </p>
      </div>

      {/* Hero Metric Cards (Matches the iconic Executions 340 + pill + See Report -> cards) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Agenda */}
        <div className="studio-card flex flex-col justify-between rounded-[22px] p-5">
          <div>
            <p className="text-xs font-medium text-[#52565f]">Agendamentos</p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-light tracking-tight text-[#23252a]">
                {data.events.length}
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-[#b9d7ca]/80 px-2 py-0.5 text-[11px] font-semibold text-[#1f624c]">
                <ArrowUpRight className="h-3 w-3" />
                {availableSlots} livres
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#6c7079]">
              {reservedEvents} compromisso(s) reservado(s)
            </p>
          </div>

          <div className="mt-5">
            <Link
              to="/admin/agenda"
              className="studio-pill-btn inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition"
            >
              Ver Agenda
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Inventário */}
        <div className="studio-card flex flex-col justify-between rounded-[22px] p-5">
          <div>
            <p className="text-xs font-medium text-[#52565f]">Itens em Estoque</p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-light tracking-tight text-[#23252a]">
                {totalStock}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${
                  lowOrOutCount > 0
                    ? 'bg-amber-600/15 text-amber-900'
                    : 'bg-[#b9d7ca]/80 text-[#1f624c]'
                }`}
              >
                {lowOrOutCount > 0 ? `${lowOrOutCount} alerta(s)` : 'Em dia'}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#6c7079]">
              {data.products.length} produtos cadastrados • {pendingInterests.length} reserva(s)
            </p>
          </div>

          <div className="mt-5">
            <Link
              to="/admin/inventario"
              className="studio-pill-btn inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition"
            >
              Ver Inventário
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Portfólio */}
        <div className="studio-card flex flex-col justify-between rounded-[22px] p-5">
          <div>
            <p className="text-xs font-medium text-[#52565f]">Portfólio Publicado</p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-light tracking-tight text-[#23252a]">
                {visiblePortfolio}
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-[#b9d7ca]/80 px-2 py-0.5 text-[11px] font-semibold text-[#1f624c]">
                de {data.portfolioItems.length}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#6c7079]">
              Projetos, serviços e experiências visíveis
            </p>
          </div>

          <div className="mt-5">
            <Link
              to="/admin/portfolio"
              className="studio-pill-btn inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition"
            >
              Editar Portfólio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Section (Matches Reference Executions -> Workflows | Permissions -> Search -> Card) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[#18191c]">Atividades</h2>

          {/* Underline Tabs */}
          <div className="mt-3 flex items-center gap-6 border-b border-black/10">
            {(
              [
                { key: 'agenda', label: 'Próximos Eventos', icon: Calendar },
                {
                  key: 'reservas',
                  label: `Reservas de Produtos (${pendingInterests.length})`,
                  icon: ShoppingBag,
                },
                { key: 'inventario', label: 'Resumo do Estoque', icon: Package },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative pb-2.5 text-xs font-medium transition sm:text-sm ${
                    active ? 'text-[#141518]' : 'text-[#72767f] hover:text-[#2f3238]'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1f2024]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d717a]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em atividades..."
            className="studio-input w-full rounded-xl py-2 pl-10 pr-3.5 text-xs outline-none sm:text-sm"
          />
        </div>

        {/* Frosted Activity Container */}
        <div className="studio-card rounded-[22px] p-4 sm:p-5">
          {activeTab === 'agenda' && (
            <div className="divide-y divide-black/[0.07]">
              {filteredEvents.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#686c75]">
                  Nenhum evento encontrado para esta busca.
                </div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col gap-2 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#18191c]">{ev.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#666a73]">
                        <span>{formatDateBR(ev.date)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeRange(ev.allDay, ev.startTime, ev.endTime)}
                        </span>
                        {ev.clientName && (
                          <>
                            <span>•</span>
                            <span className="font-sans text-[#3c3f46]">{ev.clientName}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <EventStatusBadge status={ev.status} surface="studio" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reservas' && (
            <div className="divide-y divide-black/[0.07]">
              {filteredInterests.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-700/70" />
                  <p className="mt-2 text-sm font-medium text-[#2c2f36]">
                    Nenhuma reserva ou interesse encontrado
                  </p>
                </div>
              ) : (
                filteredInterests.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[#18191c]">
                          {item.productName}
                        </p>
                        <span className="rounded-full bg-black/[0.07] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#3c3f46]">
                          {item.quantity}x
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#666a73]">
                        {item.visitorName} • {item.visitorContact}
                        {item.notes ? ` — “${item.notes}”` : ''}
                      </p>
                    </div>
                    <span
                      className={`self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:self-center ${
                        item.resolved
                          ? 'bg-black/[0.07] text-[#555962]'
                          : 'bg-emerald-600/15 text-emerald-800'
                      }`}
                    >
                      {item.resolved ? 'Atendido' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'inventario' && (
            <div className="divide-y divide-black/[0.07]">
              {filteredProducts.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#686c75]">
                  Nenhum produto encontrado.
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex flex-col gap-2 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-[#686c75]" />
                        <p className="truncate text-sm font-medium text-[#18191c]">{prod.name}</p>
                        <span className="font-mono text-[11px] text-[#6d717a]">{prod.sku}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#666a73]">
                        {prod.category} •{' '}
                        {prod.showPrice ? formatCurrencyBRL(prod.price) : 'Preço oculto'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 self-start sm:self-center">
                      <span className="font-mono text-xs font-semibold text-[#23252a]">
                        {prod.stock} un.
                      </span>
                      <ProductStatusBadge status={prod.status} surface="studio" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
