// Todos os valores sensíveis vêm do arquivo .env (nunca commitado no git)
// Para rodar localmente: copie .env.example → .env e preencha os valores

// ─── Proprietário ────────────────────────────────────────────────────────────
export const OWNER_PHONE = import.meta.env.VITE_OWNER_PHONE

// ─── EmailJS ─────────────────────────────────────────────────────────────────
export const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
export const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
export const OWNER_EMAIL         = import.meta.env.VITE_OWNER_EMAIL

// ─── Precificação ─────────────────────────────────────────────────────────────
export const HOURLY_RATE = Number(import.meta.env.VITE_HOURLY_RATE)

// ─── Área de atendimento ──────────────────────────────────────────────────────
export const OWNER_LOCATION = {
  lat: Number(import.meta.env.VITE_OWNER_LAT),
  lon: Number(import.meta.env.VITE_OWNER_LON),
}
export const MAX_DISTANCE_KM = Number(import.meta.env.VITE_MAX_DISTANCE_KM)

// ─── Disponibilidade ──────────────────────────────────────────────────────────
// Dias bloqueados completamente (0=Dom, 1=Seg, ..., 6=Sáb)
export const BLOCKED_WEEKDAYS = [0]

// Dias com horário restrito (apenas manhã)
export const MORNING_ONLY_WEEKDAYS = [6]

// Datas específicas bloqueadas ('YYYY-MM-DD')
export const BLOCKED_DATES = [
  // '2026-07-01', // Canada Day
  // '2026-12-25', // Christmas
]
