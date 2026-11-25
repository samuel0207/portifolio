import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { readFileAsDataURL } from '../../utils/format';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  previewAspect?: 'square' | 'video' | 'banner';
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://exemplo.com/imagem.jpg',
  previewAspect = 'video',
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setError('Imagem muito grande. Utilize um arquivo de até 2,5 MB.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      onChange(dataUrl);
    } catch {
      setError('Não foi possível ler a imagem selecionada.');
    }
    e.target.value = '';
  };

  const aspectClass =
    previewAspect === 'square'
      ? 'h-24 w-24'
      : previewAspect === 'banner'
        ? 'h-24 w-full'
        : 'h-32 w-full';

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[#9aa5b4]">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7686]" />
          <input
            type="text"
            value={value.startsWith('data:') ? '(Imagem enviada em Base64)' : value}
            onChange={(e) => {
              setError(null);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full rounded-lg border border-[#252d3a] bg-[#0b0e14] py-2 pl-9 pr-3 text-sm text-[#e6edf3] placeholder-[#5a6575] outline-none transition focus:border-[#ef5350]/70"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#252d3a] bg-[#161b22] px-3 py-2 text-xs font-medium text-[#d5dce6] transition hover:border-[#394558] hover:bg-[#1c222d]"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center justify-center rounded-lg border border-[#252d3a] bg-[#161b22] p-2 text-[#8b96a6] transition hover:border-[#ef5350]/50 hover:text-[#ef5350]"
              title="Remover imagem"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-[#ef5350]">{error}</p>}

      {value ? (
        <div
          className={`relative overflow-hidden rounded-xl border border-[#252d3a] bg-[#0b0e14] ${aspectClass}`}
        >
          <img
            src={value}
            alt="Pré-visualização"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#252d3a] bg-[#0b0e14]/50 px-3 py-2.5 text-xs text-[#6b7686]">
          <ImageIcon className="h-4 w-4 shrink-0" />
          <span>Cole uma URL de imagem ou faça upload direto do seu dispositivo.</span>
        </div>
      )}
    </div>
  );
};
