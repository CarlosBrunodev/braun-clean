import { OWNER_WHATSAPP } from '../config'

/**
 * Strips a phone number to digits only and prepends country code 1 (Canada/US)
 * if not already present.
 */
export function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) return digits
  if (digits.length === 10) return '1' + digits
  return digits
}

/**
 * Builds the WhatsApp deep-link for the OWNER with the full booking summary.
 * The message includes quick-reply links the owner can tap to send
 * a confirmation or denial back to the client.
 */
export function buildOwnerLink(form, distanceKm) {
  const clientWa = formatPhone(form.phone)
  const clientName = form.name.split(' ')[0]

  // Pre-built reply links for the owner to tap
  const confirmLink =
    `https://wa.me/${clientWa}?text=` +
    encodeURIComponent(
      `Olá, ${clientName}! 🏠✨\n` +
      `Seu agendamento com a *Braun Clean* foi *confirmado*!\n\n` +
      `Entraremos em contato em breve para alinhar os detalhes finais.\n` +
      `Obrigado por escolher a Braun Clean! 💙`
    )

  const denyLink =
    `https://wa.me/${clientWa}?text=` +
    encodeURIComponent(
      `Olá, ${clientName}! Infelizmente não conseguimos atender seu agendamento na data solicitada. 😔\n\n` +
      `Mas não se preocupe — entraremos em contato para encontrar uma nova data que funcione para você.\n` +
      `Atenciosamente, *Braun Clean* 💙`
    )

  const areas = form.areas.length > 0 ? form.areas.join(', ') : 'Não especificado'
  const serviceLabels = {
    regular: 'Regular Cleaning', deep: 'Deep Cleaning',
    movein: 'Move-In Cleaning', moveout: 'Move-Out Cleaning', postreno: 'Post-Renovation',
  }

  const summary =
    `🏠 *NOVO AGENDAMENTO — Braun Clean*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Nome:* ${form.name}\n` +
    `📞 *Telefone:* ${form.phone}\n` +
    `${form.email ? `📧 *E-mail:* ${form.email}\n` : ''}` +
    `📍 *Endereço:* ${form.address}, ${form.city}${form.postalCode ? ` — ${form.postalCode}` : ''}\n` +
    `📏 *Distância:* ~${Math.round(distanceKm)} km\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏡 *Sobre a casa:*\n` +
    `  • ${form.bedrooms || '—'}\n` +
    `  • ${form.bathrooms || '—'}\n` +
    `  • ${form.basement || 'Sem porão'}\n` +
    `  • ${form.floors || '—'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🧹 *Serviço:* ${serviceLabels[form.serviceType] || form.serviceType}\n` +
    `🔄 *Frequência:* ${form.frequency || 'Não informado'}\n` +
    `🗂️ *Áreas:* ${areas}\n` +
    `🐾 *Pets:* ${form.hasPets || 'Não informado'}\n` +
    `${form.preferredDate ? `📅 *Data preferida:* ${form.preferredDate}\n` : ''}` +
    `${form.preferredTime ? `🕐 *Horário:* ${form.preferredTime}\n` : ''}` +
    `${form.extraNotes ? `📝 *Observações:* ${form.extraNotes}\n` : ''}` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `*Responda ao cliente:*\n` +
    `✅ CONFIRMAR → ${confirmLink}\n` +
    `❌ RECUSAR → ${denyLink}`

  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(summary)}`
}

/**
 * Builds the WhatsApp deep-link to send the client their booking receipt.
 */
export function buildClientLink(form) {
  const clientWa = formatPhone(form.phone)
  const clientName = form.name.split(' ')[0]

  const msg =
    `Olá, ${clientName}! 🏠\n\n` +
    `Seu pedido de agendamento com a *Braun Clean* foi recebido com sucesso! 🎉\n\n` +
    `Estamos analisando sua solicitação e entraremos em contato em instantes para confirmar sua limpeza.\n\n` +
    `_Resumo da solicitação:_\n` +
    `📍 ${form.address}, ${form.city}\n` +
    `🧹 ${form.serviceType}\n` +
    `${form.preferredDate ? `📅 ${form.preferredDate}\n` : ''}` +
    `\nObrigado por escolher a *Braun Clean*! 💙`

  return `https://wa.me/${clientWa}?text=${encodeURIComponent(msg)}`
}
