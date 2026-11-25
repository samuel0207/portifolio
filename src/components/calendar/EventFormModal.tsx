import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import type { CalendarEvent, EventColor, EventStatus } from '../../types';
import { formatDateISO } from '../../utils/format';

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  editingEvent?: CalendarEvent | null;
  onSave: (payload: Omit<CalendarEvent, 'id' | 'createdAt'>, editingId?: string) => void;
}

const COLOR_OPTIONS: { value: EventColor; label: string; dot: string }[] = [
  { value: 'emerald', label: 'Esmeralda', dot: 'bg-emerald-400' },
  { value: 'sky', label: 'Azul', dot: 'bg-sky-400' },
  { value: 'amber', label: 'Âmbar', dot: 'bg-amber-400' },
  { value: 'violet', label: 'Violeta', dot: 'bg-violet-400' },
  { value: 'coral', label: 'Coral', dot: 'bg-[#ef5350]' },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  open,
  onClose,
  initialDate,
  editingEvent,
  onSave,
}) => {
  const [date, setDate] = useState(initialDate || formatDateISO(new Date()));
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<EventStatus>('Disponível');
  const [color, setColor] = useState<EventColor>('emerald');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingEvent) {
      setDate(editingEvent.date);
      setAllDay(editingEvent.allDay);
      setStartTime(editingEvent.startTime || '09:00');
      setEndTime(editingEvent.endTime || '10:30');
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setStatus(editingEvent.status);
      setColor(editingEvent.color);
      setClientName(editingEvent.clientName || '');
      setClientContact(editingEvent.clientContact || '');
      setNotes(editingEvent.notes || '');
    } else {
      setDate(initialDate || formatDateISO(new Date()));
      setAllDay(false);
      setStartTime('10:00');
      setEndTime('11:30');
      setTitle('');
      setDescription('');
      setStatus('Disponível');
      setColor('emerald');
      setClientName('');
      setClientContact('');
      setNotes('');
    }
  }, [open, editingEvent, initialDate]);

  const handleStatusChange = (nextStatus: EventStatus) => {
    setStatus(nextStatus);
    if (!editingEvent) {
      if (nextStatus === 'Disponível') setColor('emerald');
      else if (nextStatus === 'Reservado') setColor('sky');
      else setColor('coral');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave(
      {
        date,
        allDay,
        startTime: allDay ? undefined : startTime,
        endTime: allDay ? undefined : endTime,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        color,
        clientName: clientName.trim() || undefined,
        clientContact: clientContact.trim() || undefined,
        notes: notes.trim() || undefined,
        bookedByVisitor: editingEvent?.bookedByVisitor,
      },
      editingEvent?.id
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEvent ? 'Editar Evento / Horário' : 'Novo Evento / Horário'}
      subtitle="Configure disponibilidade, reserva ou bloqueio na agenda pública."
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">Título *</label>
          <input
            type="text"
            required
            placeholder="Ex: Consultoria de Portfólio, Curso de Fotografia, Bloqueio..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">Data *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#ef5350]/70"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
              className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#ef5350]/70"
            >
              <option value="Disponível">Disponível (aberto ao público)</option>
              <option value="Reservado">Reservado</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-[#252d3a] bg-[#161b22]/70 p-3.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#d5dce6]">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-[#344054] bg-[#0b0e14] accent-[#ef5350]"
            />
            Evento de dia inteiro
          </label>

          {!allDay && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-[#8b96a6]">Horário de início</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#ef5350]/70"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-[#8b96a6]">Horário de término</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#ef5350]/70"
                />
              </div>
            </div>
          )}
        </div>

        {/* Indicator color */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#9aa5b4]">
            Cor do marcador no calendário
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  color === opt.value
                    ? 'border-[#e6edf3]/50 bg-[#1c222d] text-white'
                    : 'border-[#252d3a] bg-[#0b0e14] text-[#8b96a6] hover:text-white'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">
            Descrição pública (opcional)
          </label>
          <textarea
            rows={2}
            placeholder="Detalhes visíveis ao clicar no dia no calendário..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">
              Cliente / Participante
            </label>
            <input
              type="text"
              placeholder="Nome do cliente (opcional)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">
              Contato do cliente
            </label>
            <input
              type="text"
              placeholder="WhatsApp ou e-mail"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#9aa5b4]">
            Observação interna (visível apenas para o admin)
          </label>
          <textarea
            rows={2}
            placeholder="Notas internas sobre o atendimento..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none focus:border-[#ef5350]/70"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#252d3a] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#252d3a] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c8d1dc] transition hover:bg-[#1c222d]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#ef5350] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f26461]"
          >
            {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
