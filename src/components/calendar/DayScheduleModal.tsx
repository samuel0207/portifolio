import React, { useState } from 'react';
import {
  Clock,
  User,
  Phone,
  FileText,
  CalendarCheck,
  Plus,
  Pencil,
  Trash2,
  CalendarPlus,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { EventStatusBadge } from '../ui/StatusBadge';
import type { CalendarEvent } from '../../types';
import { formatDateLongBR, formatTimeRange } from '../../utils/format';
import { useApp } from '../../context/AppContext';

interface DayScheduleModalProps {
  isoDate: string | null;
  onClose: () => void;
  mode: 'public' | 'admin';
  onAdminCreate?: (isoDate: string) => void;
  onAdminEdit?: (event: CalendarEvent) => void;
}

export const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  isoDate,
  onClose,
  mode,
  onAdminCreate,
  onAdminEdit,
}) => {
  const { data, bookEventSlot, requestCustomBooking, deleteEvent, notify } = useApp();

  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Form states for visitor booking
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [notes, setNotes] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customStart, setCustomStart] = useState('10:00');
  const [customEnd, setCustomEnd] = useState('11:00');

  if (!isoDate) return null;

  const dayEvents = data.events
    .filter((ev) => ev.date === isoDate)
    .sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
    });

  const isDayBlockedAllDay = dayEvents.some((ev) => ev.allDay && ev.status === 'Bloqueado');

  const resetForms = () => {
    setBookingSlotId(null);
    setShowCustomForm(false);
    setClientName('');
    setClientContact('');
    setNotes('');
    setCustomTitle('');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleBookSlot = (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    if (!clientName.trim() || !clientContact.trim()) {
      notify({
        type: 'warning',
        title: 'Preencha seus dados',
        message: 'Informe seu nome e um contato (WhatsApp ou e-mail) para confirmar.',
      });
      return;
    }
    bookEventSlot(eventId, {
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      notes: notes.trim(),
    });
    notify({
      type: 'success',
      title: 'Horário agendado com sucesso!',
      message: 'A agenda foi atualizada imediatamente.',
    });
    resetForms();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientContact.trim()) {
      notify({
        type: 'warning',
        title: 'Campos obrigatórios',
        message: 'Informe nome e contato para solicitar o agendamento.',
      });
      return;
    }
    requestCustomBooking({
      date: isoDate,
      startTime: customStart,
      endTime: customEnd,
      title: customTitle.trim() || `Atendimento • ${clientName.trim()}`,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      notes: notes.trim(),
    });
    notify({
      type: 'success',
      title: 'Agendamento registrado!',
      message: `Seu horário para ${customStart} – ${customEnd} já aparece no calendário.`,
    });
    resetForms();
  };

  return (
    <Modal
      open={Boolean(isoDate)}
      onClose={handleClose}
      title={formatDateLongBR(isoDate)}
      subtitle={
        dayEvents.length === 0
          ? 'Nenhum compromisso cadastrado nesta data.'
          : `${dayEvents.length} registro${dayEvents.length > 1 ? 's' : ''} nesta data`
      }
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-4">
        {/* Admin quick add button */}
        {mode === 'admin' && onAdminCreate && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAdminCreate(isoDate);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#ef5350] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#f26461]"
            >
              <Plus className="h-4 w-4" />
              Adicionar evento neste dia
            </button>
          </div>
        )}

        {/* Day events list */}
        {dayEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#252d3a] bg-[#161b22]/50 px-5 py-8 text-center">
            <CalendarCheck className="mx-auto h-9 w-9 text-[#5b6677]" />
            <p className="mt-2.5 text-sm font-medium text-[#d5dce6]">Dia livre na agenda</p>
            <p className="mt-1 text-xs text-[#8b96a6]">
              {mode === 'public'
                ? data.profile.allowPublicCustomBooking
                  ? 'Você pode solicitar um horário personalizado para esta data abaixo.'
                  : 'Não há janelas abertas configuradas para este dia.'
                : 'Clique em "Adicionar evento neste dia" para liberar horários ou registrar compromissos.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((ev) => {
              const isBookingThis = bookingSlotId === ev.id;
              return (
                <div
                  key={ev.id}
                  className="rounded-xl border border-[#252d3a] bg-[#161b22] p-4 transition hover:border-[#323d4f]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#c9d3e0]">
                          <Clock className="h-3.5 w-3.5 text-[#ef5350]" />
                          {formatTimeRange(ev.allDay, ev.startTime, ev.endTime)}
                        </span>
                        <EventStatusBadge status={ev.status} />
                        {ev.bookedByVisitor && mode === 'admin' && (
                          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                            Via Link Público
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-[#e6edf3]">{ev.title}</h4>
                      {ev.description && (
                        <p className="mt-1 text-xs leading-relaxed text-[#9aa5b4]">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    {mode === 'admin' && (
                      <div className="flex items-center gap-1.5">
                        {onAdminEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onAdminEdit(ev);
                            }}
                            className="rounded-lg border border-[#252d3a] bg-[#0f131a] p-1.5 text-[#9aa5b4] transition hover:border-[#3a475c] hover:text-white"
                            title="Editar evento"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            deleteEvent(ev.id);
                            notify({
                              type: 'info',
                              title: 'Evento removido',
                              message: `"${ev.title}" foi excluído da agenda.`,
                            });
                          }}
                          className="rounded-lg border border-[#252d3a] bg-[#0f131a] p-1.5 text-[#9aa5b4] transition hover:border-[#ef5350]/50 hover:text-[#ef5350]"
                          title="Excluir evento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Admin sees client details */}
                  {mode === 'admin' && (ev.clientName || ev.clientContact || ev.notes) && (
                    <div className="mt-3 space-y-1.5 rounded-lg border border-[#252d3a]/80 bg-[#0f131a] p-3 text-xs text-[#9aa5b4]">
                      {ev.clientName && (
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-[#6b7686]" />
                          <span className="text-[#d5dce6]">{ev.clientName}</span>
                        </div>
                      )}
                      {ev.clientContact && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-[#6b7686]" />
                          <span>{ev.clientContact}</span>
                        </div>
                      )}
                      {ev.notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6b7686]" />
                          <span>{ev.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Public visitor booking CTA on available slot */}
                  {mode === 'public' && ev.status === 'Disponível' && (
                    <div className="mt-3 pt-3 border-t border-[#252d3a]">
                      {!isBookingThis ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomForm(false);
                            setBookingSlotId(ev.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Marcar este horário
                        </button>
                      ) : (
                        <form
                          onSubmit={(e) => handleBookSlot(e, ev.id)}
                          className="space-y-3 rounded-xl border border-emerald-500/25 bg-[#0f131a] p-3.5"
                        >
                          <p className="text-xs font-semibold text-emerald-300">
                            Confirmar reserva — {ev.title}
                          </p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <input
                              type="text"
                              required
                              placeholder="Seu nome completo *"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-emerald-400/60"
                            />
                            <input
                              type="text"
                              required
                              placeholder="WhatsApp ou E-mail *"
                              value={clientContact}
                              onChange={(e) => setClientContact(e.target.value)}
                              className="rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-emerald-400/60"
                            />
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Observação ou assunto do encontro (opcional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-emerald-400/60"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setBookingSlotId(null)}
                              className="rounded-lg border border-[#252d3a] px-3 py-1.5 text-xs text-[#9aa5b4] hover:text-white"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-[#08120c] transition hover:bg-emerald-400"
                            >
                              Confirmar Agendamento
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Public custom time request option */}
        {mode === 'public' && data.profile.allowPublicCustomBooking && !isDayBlockedAllDay && (
          <div className="border-t border-[#252d3a] pt-4">
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => {
                  setBookingSlotId(null);
                  setShowCustomForm(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#344054] bg-[#161b22]/60 px-4 py-3 text-xs font-semibold text-[#d5dce6] transition hover:border-[#ef5350]/60 hover:bg-[#1c222d] hover:text-white"
              >
                <CalendarPlus className="h-4 w-4 text-[#ef5350]" />
                Solicitar outro horário nesta data
              </button>
            ) : (
              <form
                onSubmit={handleCustomSubmit}
                className="space-y-3 rounded-xl border border-[#252d3a] bg-[#161b22] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#e6edf3]">
                    Solicitar agendamento personalizado
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="text-xs text-[#8b96a6] hover:text-white"
                  >
                    Fechar
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Assunto / Título do atendimento (ex: Orçamento de projeto)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-[#ef5350]/70"
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1 block text-[11px] text-[#8b96a6]">Início</label>
                    <input
                      type="time"
                      required
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-[#e6edf3] outline-none focus:border-[#ef5350]/70"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[#8b96a6]">Término</label>
                    <input
                      type="time"
                      required
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-[#e6edf3] outline-none focus:border-[#ef5350]/70"
                    />
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo *"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-[#ef5350]/70"
                  />
                  <input
                    type="text"
                    required
                    placeholder="WhatsApp ou E-mail *"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-[#ef5350]/70"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Observações adicionais (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0f131a] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#637083] outline-none focus:border-[#ef5350]/70"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="rounded-lg border border-[#252d3a] px-3 py-1.5 text-xs text-[#9aa5b4] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#ef5350] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#f26461]"
                  >
                    Solicitar Horário
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
