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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#18191c]">
            Agenda & Agendamentos
          </h1>
          <p className="mt-1 text-sm text-[#686c75]">
            Gerencie horários disponíveis, reservas feitas por visitantes e dias bloqueados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="studio-dark-btn inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-semibold sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Evento / Horário
        </button>
      </div>

      {/* Signature Dark Reference Calendar framed cleanly inside the Studio Window */}
      <DarkScheduleCalendar
        events={data.events}
        mode="admin"
        onSelectDay={(iso) => setSelectedDay(iso)}
        onCreateEvent={(iso) => openCreateModal(iso)}
      />

      {/* Detailed Events & Visitor Bookings Table */}
      <div className="studio-card rounded-[22px] p-5">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#18191c]">Lista de Eventos & Reservas</h2>
            <p className="text-xs text-[#686c75]">
              Clique em um evento para editar status, horário ou consultar dados do cliente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d717a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar título ou cliente..."
                className="studio-input w-52 rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none"
              />
            </div>

            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value as typeof listFilter)}
              className="studio-input rounded-xl px-2.5 py-1.5 text-xs outline-none"
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
          <div className="studio-subcard rounded-2xl py-10 text-center">
            <CalendarIcon className="mx-auto h-8 w-8 text-[#72767f]" />
            <p className="mt-2 text-sm text-[#4a4e57]">Nenhum evento encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.07]">
            {filteredList.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-black/[0.07] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#23252a]">
                      {formatDateBR(ev.date)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#555962]">
                      <Clock className="h-3 w-3 text-[#ef5350]" />
                      {formatTimeRange(ev.allDay, ev.startTime, ev.endTime)}
                    </span>
                    <EventStatusBadge status={ev.status} surface="studio" />
                    {ev.bookedByVisitor && (
                      <span className="rounded-full border border-sky-700/20 bg-sky-600/10 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                        Via Portfólio Público
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-[#18191c]">{ev.title}</p>

                  {(ev.clientName || ev.clientContact || ev.notes) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666a73]">
                      {ev.clientName && (
                        <span className="inline-flex items-center gap-1 text-[#2c2f36]">
                          <User className="h-3 w-3 text-[#6d717a]" />
                          {ev.clientName}
                        </span>
                      )}
                      {ev.clientContact && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-[#6d717a]" />
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
                    className="studio-pill-btn inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
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
                    className="studio-pill-btn rounded-full p-1.5 hover:text-rose-600"
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

      {/* Calendar Modals */}
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
