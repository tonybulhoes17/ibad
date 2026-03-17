import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined, pattern = 'dd/MM/yyyy') {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatTime(time: string | null | undefined) {
  if (!time) return '—'
  return time.slice(0, 5)
}

export function generateDefaultTimeline(durationMinutes: number) {
  const points = []
  for (let m = 0; m <= durationMinutes; m += 15) {
    points.push(m)
  }
  return {
    duration_minutes: durationMinutes,
    end_marker_at: durationMinutes,
    o2: false,
    compressed_air: false,
    inhalational: null,
    saturation: points.map(m => ({ minute: m, value: '100%' })),
    ecg: points.map(m => ({ minute: m, value: 'RS' })),
    etco2: points.slice(0, Math.min(5, points.length)).map(m => ({ minute: m, value: '40' })),
    temperature: points.filter((_, i) => i % 2 === 0).map(m => ({ minute: m, value: '36°C' })),
    fluids: [{ minute: 0, value: 'SF' }],
    bp: points.map(m => ({ minute: m, systolic: 120, diastolic: 80 })),
    hr: points.map(m => ({ minute: m, value: 72 })),
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}
