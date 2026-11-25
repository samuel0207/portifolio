import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  surface?: 'dark' | 'studio';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-2xl',
  surface = 'dark',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isStudio = surface === 'studio';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-sm sm:p-6 ${
        isStudio ? 'bg-black/35' : 'bg-black/75'
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-2xl ${
          isStudio
            ? 'studio-window text-[#18191c]'
            : 'border border-[#252d3a] bg-[#0f131a] text-[#e6edf3] shadow-2xl shadow-black/70'
        }`}
      >
        <div
          className={`flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${
            isStudio
              ? 'border-black/10 bg-white/45'
              : 'border-[#252d3a] bg-[#161b22]/80'
          }`}
        >
          <div className="min-w-0">
            <h3
              className={`truncate text-base font-semibold sm:text-lg ${
                isStudio ? 'text-[#141518]' : 'text-[#e6edf3]'
              }`}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={`mt-0.5 text-xs sm:text-sm ${
                  isStudio ? 'text-[#5b6069]' : 'text-[#8b96a6]'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg border border-transparent p-1.5 transition ${
              isStudio
                ? 'text-[#5b6069] hover:border-black/10 hover:bg-white/60 hover:text-[#141518]'
                : 'text-[#8b96a6] hover:border-[#252d3a] hover:bg-[#1c222d] hover:text-white'
            }`}
            aria-label="Fechar janela"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
};
