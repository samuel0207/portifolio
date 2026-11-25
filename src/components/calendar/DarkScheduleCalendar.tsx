import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import type { CalendarEvent, EventColor, EventStatus } from '../../types';
import { formatDateISO, formatMonthYearBR } from '../../utils/format';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CHIP_STYLES: Record<EventColor, { bar: string; bg: string; text: string }> = {
  emerald: {
    bar: 'border-l-emerald-400',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/18',
    text: 'text-emerald-100',
  },
  coral: {
    bar: 'border-l-[#ef5350]',
    bg: 'bg-[#ef5350]/12 hover:bg-[#ef5350]/20',
    text: 'text-rose-100',
  },
  sky: {
    bar: 'border-l-sky-400',
    bg: 'bg-sky-500/10 hover:bg-sky-500/18',
    text: 'text-sky-100',
  },
  amber: {
    bar: 'border-l-amber-400',
    bg: 'bg-amber-500/12 hover:bg-amber-500/20',
    text: 'text-amber-100',
  },
  violet: {
    bar: 'border-l-violet-400',
    bg: 'bg-violet-500/12 hover:bg-violet-500/20',
    text: 'text-violet-100',
  },
};

function getChipStyle(event: CalendarEvent) {
  if (event.color && CHIP_STYLES[event.color]) {
    return CHIP_STYLES[event.color];
  }
  if (event.status === 'Disponível') return CHIP_STYLES.emerald;
  if (event.status === 'Bloqueado') return CHIP_STYLES.coral;
  return CHIP_STYLES.sky;
}

interface CalendarCell {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

interface DarkScheduleCalendarProps {
  events: CalendarEvent[];
  mode: 'public' | 'admin';
  onSelectDay: (isoDate: string) => void;
  onCreateEvent?: (isoDate?: string) => void;
}

export const DarkScheduleCalendar: React.FC<DarkScheduleCalendarProps> = ({
  events,
  mode,
  onSelectDay,
  onCreateEvent,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => formatDateISO(today), [today]);

  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [statusFilter, setStatusFilter] = useState<'Todos' | EventStatus>('Todos');

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (statusFilter !== 'Todos' && ev.status !== statusFilter) return false;
      return true;
    });
  }, [events, statusFilter]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of filteredEvents) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
      });
      map.set(k, list);
    }
    return map;
  }, [filteredEvents]);

  // Build 42-cell (6-week) or 35-cell (5-week) clean grid
  const cells = useMemo<CalendarCell[]>(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Dom
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalNeeded = startWeekday + daysInMonth;
    const totalCells = totalNeeded > 35 ? 42 : 35;

    const result: CalendarCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dateObj = new Date(viewYear, viewMonth, 1 - startWeekday + i);
      const iso = formatDateISO(dateObj);
      result.push({
        iso,
        dayNumber: dateObj.getDate(),
        inCurrentMonth: dateObj.getMonth() === viewMonth && dateObj.getFullYear() === viewYear,
        isToday: iso === todayIso,
      });
    }
    return result;
  }, [viewYear, viewMonth, todayIso]);

  const monthEventCount = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
    return filteredEvents.filter((ev) => ev.date.startsWith(prefix)).length;
  }, [filteredEvents, viewYear, viewMonth]);

  const availableInMonthCount = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
    return events.filter((ev) => ev.date.startsWith(prefix) && ev.status === 'Disponível').length;
  }, [events, viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const yearOptions = Array.from({ length: 7 }, (_, i) => today.getFullYear() - 2 + i);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#252d3a] bg-[#0f131a] shadow-2xl shadow-black/40">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 border-b border-[#252d3a] bg-[#131820] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252d3a] bg-[#161b22] text-[#ef5350]">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-[#e6edf3] sm:text-lg">
              {formatMonthYearBR(viewYear, viewMonth)}
            </h3>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#252d3a] bg-[#0f131a] p-0.5">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-md p-1.5 text-[#9aa5b4] transition hover:bg-[#1c222d] hover:text-white"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-[#d5dce6] transition hover:bg-[#1c222d] hover:text-white"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-md p-1.5 text-[#9aa5b4] transition hover:bg-[#1c222d] hover:text-white"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter pills + optional admin action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#252d3a] bg-[#0f131a] p-1">
            {(['Todos', 'Disponível', 'Reservado', 'Bloqueado'] as const).map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    active
                      ? 'bg-[#222a36] text-white shadow-sm'
                      : 'text-[#8b96a6] hover:text-[#d5dce6]'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {mode === 'admin' && onCreateEvent && (
            <button
              type="button"
              onClick={() => onCreateEvent(todayIso)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#ef5350] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#f26461]"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Evento
            </button>
          )}
        </div>
      </div>

      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-[#252d3a] bg-[#12171f]">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider sm:px-3 sm:text-left ${
              index === 0 || index === 6 ? 'text-[#7c8798]' : 'text-[#9aa5b4]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Monthly 7-Column Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#222a36] border-b border-[#252d3a]">
        {cells.map((cell) => {
          const dayEvents = eventsByDate.get(cell.iso) ?? [];
          const visibleChips = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - visibleChips.length;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDay(cell.iso)}
              className={`group relative flex min-h-[86px] flex-col p-1.5 text-left transition sm:min-h-[118px] sm:p-2 ${
                cell.inCurrentMonth
                  ? 'bg-[#161b22] hover:bg-[#1b222c]'
                  : 'bg-[#0c1016] hover:bg-[#121720]'
              } ${cell.isToday ? 'calendar-today-cell z-10' : ''}`}
            >
              {/* Day number header */}
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition sm:h-7 sm:w-7 ${
                    cell.isToday
                      ? 'bg-[#ef5350] text-white shadow-md shadow-[#ef5350]/35'
                      : cell.inCurrentMonth
                        ? 'text-[#e6edf3] group-hover:text-white'
                        : 'text-[#4d5665]'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {dayEvents.some((e) => e.status === 'Disponível') && cell.inCurrentMonth && (
                  <span
                    className="hidden h-1.5 w-1.5 rounded-full bg-emerald-400/90 sm:inline-block"
                    title="Horário disponível"
                  />
                )}
              </div>

              {/* Event chips */}
              <div className="flex w-full flex-1 flex-col gap-1 overflow-hidden">
                {visibleChips.map((ev) => {
                  const chip = getChipStyle(ev);
                  const prefix = ev.allDay ? 'Dia inteiro' : ev.startTime || '';
                  return (
                    <div
                      key={ev.id}
                      title={`${prefix ? `${prefix} ` : ''}${ev.title} (${ev.status})`}
                      className={`flex items-center gap-1 truncate rounded-[5px] border-l-2 px-1.5 py-0.5 text-[10px] leading-tight transition sm:text-[11px] ${chip.bar} ${chip.bg} ${chip.text}`}
                    >
                      {prefix && (
                        <span className="shrink-0 font-mono text-[10px] font-semibold opacity-90">
                          {prefix}
                        </span>
                      )}
                      <span className="truncate font-medium">
                        {ev.allDay ? ev.title.replace(/^Dia inteiro\s*[•\-:]?\s*/i, '') : ev.title}
                      </span>
                    </div>
                  );
                })}

                {hiddenCount > 0 && (
                  <span className="px-1 text-[10px] font-medium text-[#8b96a6]">
                    +{hiddenCount} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Summary & Month/Year Controls Bar */}
      <div className="flex flex-col gap-3 bg-[#11161e] px-4 py-3 text-xs text-[#9aa5b4] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <p className="text-[#c8d1dc]">
            <span className="font-semibold text-white">{monthEventCount}</span>{' '}
            {monthEventCount === 1 ? 'evento neste mês.' : 'eventos neste mês.'}{' '}
            <span className="text-[#8b96a6]">
              Selecione um dia para consultar a agenda
              {mode === 'public' && availableInMonthCount > 0
                ? ` (${availableInMonthCount} horário${availableInMonthCount > 1 ? 's' : ''} disponível${availableInMonthCount > 1 ? 'is' : ''}).`
                : '.'}
            </span>
          </p>

          <div className="hidden items-center gap-3 text-[11px] lg:flex">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Disponível
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Reservado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ef5350]" />
              Bloqueado
            </span>
          </div>
        </div>

        {/* Direct month/year selectors */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            aria-label="Selecionar mês"
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1 text-xs text-[#d5dce6] outline-none transition focus:border-[#ef5350]/60"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          <select
            aria-label="Selecionar ano"
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="rounded-lg border border-[#252d3a] bg-[#161b22] px-2.5 py-1 text-xs text-[#d5dce6] outline-none transition focus:border-[#ef5350]/60"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
