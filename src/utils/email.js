import emailjs from '@emailjs/browser'
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  OWNER_EMAIL,
} from '../config'

const SERVICE_LABELS = {
  regular:  'Regular Cleaning',
  deep:     'Deep Cleaning',
  movein:   'Move-In Cleaning',
  moveout:  'Move-Out Cleaning',
  postreno: 'Post-Renovation',
}

/**
 * Sends the booking summary email to the owner automatically,
 * with zero user interaction.
 */
export async function sendBookingEmail(form, distanceKm, estimate) {
  const areas = form.areas.length > 0 ? form.areas.join(', ') : '—'

  const estimateText = estimate
    ? `${estimate.hours}h × $${estimate.hourlyRate}/hr = $${estimate.total} CAD` +
      (estimate.hasDiscount ? ` (after ${Math.round(estimate.discount * 100)}% discount)` : '')
    : '—'

  const params = {
    owner_email:    OWNER_EMAIL,
    client_name:    form.name,
    client_phone:   form.phone,
    client_email:   form.email || '—',
    address:        `${form.address}, ${form.city}${form.postalCode ? ' ' + form.postalCode : ''}`,
    distance_km:    `~${Math.round(distanceKm)} km`,
    bedrooms:       form.bedrooms  || '—',
    bathrooms:      form.bathrooms || '—',
    basement:       form.basement  || '—',
    floors:         form.floors    || '—',
    areas,
    service:        SERVICE_LABELS[form.serviceType] || form.serviceType,
    frequency:      form.frequency      || '—',
    pets:           form.hasPets        || '—',
    preferred_date: form.preferredDate  || '—',
    preferred_time: form.preferredTime  || '—',
    notes:          form.extraNotes     || '—',
    estimate:       estimateText,
  }

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    params,
    EMAILJS_PUBLIC_KEY
  )
}
