import React from 'react';
import type { EventStatus, ProductStatus } from '../../types';

export const EventStatusBadge: React.FC<{ status: EventStatus; surface?: 'dark' | 'studio' }> = ({
  status,
  surface = 'dark',
}) => {
  const styles: Record<EventStatus, string> =
    surface === 'studio'
      ? {
          Disponível: 'border-emerald-700/20 bg-emerald-600/12 text-emerald-800',
          Reservado: 'border-amber-700/20 bg-amber-600/12 text-amber-900',
          Bloqueado: 'border-rose-700/20 bg-rose-600/12 text-rose-800',
        }
      : {
          Disponível: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          Reservado: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          Bloqueado: 'border-[#ef5350]/35 bg-[#ef5350]/12 text-[#ff8a88]',
        };

  const dot: Record<EventStatus, string> =
    surface === 'studio'
      ? {
          Disponível: 'bg-emerald-600',
          Reservado: 'bg-amber-600',
          Bloqueado: 'bg-rose-600',
        }
      : {
          Disponível: 'bg-emerald-400',
          Reservado: 'bg-amber-400',
          Bloqueado: 'bg-[#ef5350]',
        };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
};

export const ProductStatusBadge: React.FC<{
  status: ProductStatus;
  surface?: 'dark' | 'studio';
}> = ({ status, surface = 'dark' }) => {
  const styles: Record<ProductStatus, string> =
    surface === 'studio'
      ? {
          Disponível: 'border-emerald-700/20 bg-emerald-600/12 text-emerald-800',
          'Baixo estoque': 'border-amber-700/20 bg-amber-600/12 text-amber-900',
          Esgotado: 'border-rose-700/20 bg-rose-600/12 text-rose-800',
          Oculto: 'border-black/15 bg-black/8 text-[#4b4f57]',
        }
      : {
          Disponível: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          'Baixo estoque': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          Esgotado: 'border-[#ef5350]/35 bg-[#ef5350]/12 text-[#ff8a88]',
          Oculto: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
        };

  const dot: Record<ProductStatus, string> =
    surface === 'studio'
      ? {
          Disponível: 'bg-emerald-600',
          'Baixo estoque': 'bg-amber-600',
          Esgotado: 'bg-rose-600',
          Oculto: 'bg-[#6b7079]',
        }
      : {
          Disponível: 'bg-emerald-400',
          'Baixo estoque': 'bg-amber-400',
          Esgotado: 'bg-[#ef5350]',
          Oculto: 'bg-slate-400',
        };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
};
