import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  User,
  Phone,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DarkScheduleCalendar } from '../../components/calendar/DarkScheduleCalendar';
import { DayScheduleModal } from '../../components/calendar/DayScheduleModal';
import { EventFormModal } from '../../components/calendar/EventFormModal';
import { EventStatusBadge } from '../../components/ui/StatusBadge';
import type { CalendarEvent, EventStatus } from '../../types';
import { formatDateBR, formatDateISO, formatTimeRange } from '../../utils/format';

export const AdminSchedulePage: React.FC = () => {
  const { data, addEvent, updateEvent, deleteEvent, notify } = useApp();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<string>(formatDateISO(new Date()));
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [search, setSearch] = useState('');
  const [listFilter, setListFilter] = useState<'Todos' | EventStatus | 'Publico'>('Todos');

  const openCreateModal = (isoDate?: string) => {
    setEditingEvent(null);
    setFormInitialDate(isoDate || formatDateISO(new Date()));
    setFormOpen(true);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormInitialDate(ev.date);
    setFormOpen(true);
  };

  const handleSaveEvent = (
    payload: Omit<CalendarEvent, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      updateEvent(editingId, payload);
      notify({
        type: 'success',
        title: 'Evento atualizado',
        message: `"${payload.title}" foi salvo na agenda.`,
      });
    } else {
      addEvent(payload);
      notify({
        type: 'success',
        title: 'Evento criado na agenda',
        message: `"${payload.title}" já está visível no calendário.`,
      });
    }
  };

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...data.events]
      .sort((a, b) => `${a.date}${a.startTime || ''}`.localeCompare(`${b.date}${b.startTime || ''}`))
      .filter((ev) => {
        if (listFilter === 'Publico' && !ev.bookedByVisitor) return false;
        if (listFilter !== 'Todos' && listFilter !== 'Publico' && ev.status !== listFilter) {
          return false;
        }
        if (!q) return true;
        return (
          ev.title.toLowerCase().includes(q) ||
          (ev.clientName || '').toLowerCase().includes(q) ||
          (ev.clientContact || '').toLowerCase().includes(q) ||
          ev.date.includes(q)
        );
      });
  }, [data.events, listFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Agenda & Agendamentos</h1>
          <p className="mt-1 text-sm text-[#8b96a6]">
            Gerencie horários disponíveis, reservas feitas por visitantes e dias bloqueados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-[#ef5350] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#ef5350]/20 transition hover:bg-[#f26461] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Evento / Horário
        </button>
      </div>

      {/* Main Dark Reference Calendar */}
      <DarkScheduleCalendar
        events={data.events}
        mode="admin"
        onSelectDay={(iso) => setSelectedDay(iso)}
        onCreateEvent={(iso) => openCreateModal(iso)}
      />

      {/* Detailed Events & Visitor Bookings Table */}
      <div className="rounded-2xl border border-[#252d3a] bg-[#0f131a] p-5">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Lista de Eventos & Reservas</h2>
            <p className="text-xs text-[#8b96a6]">
              Clique em um evento para editar status, horário ou consultar dados do cliente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7686]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar título ou cliente..."
                className="w-52 rounded-lg border border-[#252d3a] bg-[#0b0e14] py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
              />
            </div>

            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value as typeof listFilter)}
              className="rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#d5dce6] outline-none"
            >
              <option value="Todos">Todos os status</option>
              <option value="Disponível">Disponível</option>
              <option value="Reservado">Reservado</option>
              <option value="Bloqueado">Bloqueado</option>
              <option value="Publico">Agendados pelo Público</option>
            </select>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#252d3a] bg-[#161b22]/40 py-10 text-center">
            <CalendarIcon className="mx-auto h-8 w-8 text-[#5a6575]" />
            <p className="mt-2 text-sm text-[#c8d1dc]">Nenhum evento encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#222a36]">
            {filteredList.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#161b22] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#c8d1dc]">
                      {formatDateBR(ev.date)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#9aa5b4]">
                      <Clock className="h-3 w-3 text-[#ef5350]" />
                      {formatTimeRange(ev.allDay, ev.startTime, ev.endTime)}
                    </span>
                    <EventStatusBadge status={ev.status} />
                    {ev.bookedByVisitor && (
                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                        Via Portfólio Público
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white">{ev.title}</p>

                  {(ev.clientName || ev.clientContact || ev.notes) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b96a6]">
                      {ev.clientName && (
                        <span className="inline-flex items-center gap-1 text-[#c8d1dc]">
                          <User className="h-3 w-3 text-[#6b7686]" />
                          {ev.clientName}
                        </span>
                      )}
                      {ev.clientContact && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-[#6b7686]" />
                          {ev.clientContact}
                        </span>
                      )}
                      {ev.notes && <span className="italic">Obs: {ev.notes}</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(ev)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1.5 text-xs font-medium text-[#d5dce6] transition hover:bg-[#1c222d] hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteEvent(ev.id);
                      notify({
                        type: 'info',
                        title: 'Evento excluído',
                        message: `"${ev.title}" foi removido.`,
                      });
                    }}
                    className="rounded-lg border border-[#252d3a] bg-[#161b22] p-1.5 text-[#9aa5b4] transition hover:border-[#ef5350]/50 hover:text-[#ef5350]"
                    title="Excluir evento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DayScheduleModal
        isoDate={selectedDay}
        onClose={() => setSelectedDay(null)}
        mode="admin"
        onAdminCreate={(iso) => openCreateModal(iso)}
        onAdminEdit={(ev) => openEditModal(ev)}
      />

      <EventFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialDate={formInitialDate}
        editingEvent={editingEvent}
        onSave={handleSaveEvent}
      />
    </div>
  );
};
