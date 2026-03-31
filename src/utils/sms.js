import { OWNER_PHONE } from '../config'

/**
 * Formats a phone number to E.164-style digits for use in sms: URIs.
 * Prepends Canada/US country code (1) when the number has 10 digits.
 */
export function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) return '+' + digits
  if (digits.length === 10) return '+1' + digits
  return '+' + digits
}

/**
 * Builds the sms: deep-link for the OWNER with the full booking summary.
 *
 * The body includes two ready-to-tap reply links so the owner can
 * send an SMS confirmation or denial directly to the client.
 *
 * sms: URI format (works on iOS Messages and Android Messages):
 *   iOS   → sms:NUMBER&body=TEXT
 *   Android → sms:NUMBER?body=TEXT
 *
 * We use the iOS format; Android falls back gracefully (opens SMS to number).
 */
export function buildOwnerSmsLink(form, distanceKm) {
  const clientPhone = formatPhone(form.phone)
  const clientName  = form.name.split(' ')[0]

  const serviceLabels = {
    regular:  'Regular Cleaning',
    deep:     'Deep Cleaning',
    movein:   'Move-In Cleaning',
    moveout:  'Move-Out Cleaning',
    postreno: 'Post-Renovation',
  }

  // Pre-built SMS reply links embedded in the owner's message
  const confirmSms =
    `sms:${clientPhone}&body=` +
    encodeURIComponent(
      `Hi ${clientName}! Your cleaning appointment with Braun Clean is CONFIRMED. ` +
      `We'll be in touch soon with the final details. Thank you for choosing us!`
    )

  const denySms =
    `sms:${clientPhone}&body=` +
    encodeURIComponent(
      `Hi ${clientName}, unfortunately we're unable to schedule your appointment at the requested time. ` +
      `We'll contact you shortly to find a date that works. Sorry for any inconvenience — Braun Clean.`
    )

  const areas = form.areas.length > 0 ? form.areas.join(', ') : 'Not specified'

  const body =
    `--- BRAUN CLEAN BOOKING ---\n` +
    `Name: ${form.name}\n` +
    `Phone: ${form.phone}\n` +
    (form.email ? `Email: ${form.email}\n` : '') +
    `Address: ${form.address}, ${form.city}` + (form.postalCode ? ` ${form.postalCode}` : '') + `\n` +
    `Distance: ~${Math.round(distanceKm)} km\n` +
    `---------------------------\n` +
    `Bedrooms: ${form.bedrooms || '—'}\n` +
    `Bathrooms: ${form.bathrooms || '—'}\n` +
    `Basement: ${form.basement || '—'}\n` +
    `Floors: ${form.floors || '—'}\n` +
    `Areas: ${areas}\n` +
    `---------------------------\n` +
    `Service: ${serviceLabels[form.serviceType] || form.serviceType}\n` +
    `Frequency: ${form.frequency || '—'}\n` +
    `Pets: ${form.hasPets || '—'}\n` +
    (form.preferredDate ? `Date: ${form.preferredDate}\n` : '') +
    (form.preferredTime ? `Time: ${form.preferredTime}\n` : '') +
    (form.extraNotes ? `Notes: ${form.extraNotes}\n` : '') +
    `---------------------------\n` +
    `CONFIRM client: ${confirmSms}\n` +
    `DENY client:    ${denySms}`

  return `sms:${OWNER_PHONE}&body=${encodeURIComponent(body)}`
}
