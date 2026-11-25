import type { ProductStatus } from '../types';

export function formatCurrencyBRL(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return 'Sob consulta';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDateBR(iso: string): string {
  const date = parseISODate(iso);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateLongBR(iso: string): string {
  const date = parseISODate(iso);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatMonthYearBR(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTimeRange(allDay: boolean, startTime?: string, endTime?: string): string {
  if (allDay) return 'Dia inteiro';
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  if (startTime) return startTime;
  return 'Horário a combinar';
}

export function computeProductStatus(
  stock: number,
  lowStockThreshold: number,
  currentStatus?: ProductStatus
): ProductStatus {
  if (currentStatus === 'Oculto') return 'Oculto';
  if (stock <= 0) return 'Esgotado';
  if (stock <= Math.max(1, lowStockThreshold)) return 'Baixo estoque';
  return 'Disponível';
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'estudio';
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao ler o arquivo.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao carregar imagem.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Otimiza imagens enviadas mantendo a proporção original exata (sem cortes),
 * redimensionando apenas se ultrapassar maxDimension (padrão 1600px) para
 * garantir alta nitidez em telas mobile e desktop com carregamento rápido.
 */
export async function optimizeUploadedImage(
  file: File,
  maxDimension = 1600,
  quality = 0.86
): Promise<string> {
  const rawDataUrl = await readFileAsDataURL(file);

  // Skip canvas re-encoding for SVGs or GIFs
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return rawDataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) {
        resolve(rawDataUrl);
        return;
      }

      const scale = Math.min(1, maxDimension / Math.max(w, h));
      const targetW = Math.round(w * scale);
      const targetH = Math.round(h * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const outputMime = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
      const optimized = canvas.toDataURL(outputMime, quality);
      resolve(optimized.length < rawDataUrl.length ? optimized : rawDataUrl);
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}
