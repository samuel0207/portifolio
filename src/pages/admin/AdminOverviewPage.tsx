import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Calendar,
  Package,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventStatusBadge } from '../../components/ui/StatusBadge';
import { formatDateBR, formatTimeRange } from '../../utils/format';

export const AdminOverviewPage: React.FC = () => {
  const { data } = useApp();

  const visiblePortfolio = data.portfolioItems.filter((i) => i.visible).length;
  const availableSlots = data.events.filter((e) => e.status === 'Disponível').length;
  const reservedEvents = data.events.filter((e) => e.status === 'Reservado').length;
  const totalStock = data.products.reduce((acc, p) => acc + p.stock, 0);
  const lowOrOutCount = data.products.filter(
    (p) => p.status === 'Baixo estoque' || p.status === 'Esgotado'
  ).length;
  const pendingInterests = data.productInterests.filter((i) => !i.resolved);

  const upcomingEvents = [...data.events]
    .sort((a, b) => `${a.date}${a.startTime || ''}`.localeCompare(`${b.date}${b.startTime || ''}`))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Visão Geral</h1>
        <p className="mt-1 text-sm text-[#8b96a6]">
          Resumo operacional do seu portfólio público, agenda de atendimentos e inventário.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8b96a6]">Itens no Portfólio</span>
            <span className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{data.portfolioItems.length}</p>
          <p className="mt-1 text-xs text-[#7d8898]">{visiblePortfolio} visíveis publicamente</p>
        </div>

        <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8b96a6]">Agenda do Mês</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{reservedEvents}</p>
          <p className="mt-1 text-xs text-emerald-400">{availableSlots} horários livres abertos</p>
        </div>

        <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8b96a6]">Produtos em Estoque</span>
            <span className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{totalStock} un.</p>
          <p className="mt-1 text-xs text-[#7d8898]">{data.products.length} produtos cadastrados</p>
        </div>

        <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8b96a6]">Alertas & Solicitações</span>
            <span className="rounded-lg bg-[#ef5350]/12 p-2 text-[#ef5350]">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {lowOrOutCount + pendingInterests.length}
          </p>
          <p className="mt-1 text-xs text-[#8b96a6]">
            {lowOrOutCount} estoque baixo/zerado • {pendingInterests.length} interesse(s)
          </p>
        </div>
      </div>

      {/* Two column panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Schedule */}
        <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Próximos Eventos na Agenda</h2>
              <p className="text-xs text-[#8b96a6]">Horários reservados, disponíveis e bloqueios</p>
            </div>
            <Link
              to="/admin/agenda"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#ef5350] hover:underline"
            >
              Gerenciar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#222a36] bg-[#161b22] px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#e6edf3]">{ev.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-[#8b96a6]">
                    <span>{formatDateBR(ev.date)}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeRange(ev.allDay, ev.startTime, ev.endTime)}
                    </span>
                  </p>
                </div>
                <EventStatusBadge status={ev.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Pending Product Interests */}
        <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Reservas & Interesses de Produtos
              </h2>
              <p className="text-xs text-[#8b96a6]">
                Solicitações feitas por visitantes na vitrine pública
              </p>
            </div>
            <Link
              to="/admin/inventario"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#ef5350] hover:underline"
            >
              Ver Inventário
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pendingInterests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#252d3a] bg-[#161b22]/50 py-10 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400/70" />
              <p className="mt-2 text-sm font-medium text-[#d5dce6]">Tudo em dia!</p>
              <p className="mt-0.5 text-xs text-[#8b96a6]">
                Nenhuma reserva ou interesse pendente no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingInterests.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#222a36] bg-[#161b22] px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-amber-400" />
                      <p className="text-sm font-medium text-white">{item.productName}</p>
                    </div>
                    <span className="rounded-md bg-[#0f131a] px-2 py-0.5 font-mono text-[11px] text-[#c8d1dc]">
                      {item.quantity}x
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#9aa5b4]">
                    {item.visitorName} • {item.visitorContact}
                  </p>
                  {item.notes && (
                    <p className="mt-1 text-xs italic text-[#7d8898]">“{item.notes}”</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
