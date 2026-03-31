import { HOURLY_RATE } from '../config'

/**
 * Pricing logic based on real Canadian market data (London/GTA, Ontario 2024-25).
 *
 * Sources:
 *  - GTA data: 2-bed regular = 3.5h, 3-bed = 5h (Now It's Clean, Enjoy House Cleaning)
 *  - Deep clean = 2x regular time (Squeaky Cleaning, No More Chores)
 *  - Move-in/out: 4-8h small, 8-12h medium homes (Oasis Cleans, Canada Cleans)
 *  - Post-reno: most labour-intensive, 2-2.5x base (MP Clean, Always Fresh)
 *  - Finished basement: 3-5h on its own (SKYREX), scaled as add-on here
 *  - Frequency discounts: standard Canadian market practice
 */

// ── Base hours by bedroom count (regular clean) ──────────────────────────────
// Anchor: 3 bed + 2 bath + 2 floors + regular = exactly 3h → $111
const BEDROOM_HOURS = {
  '1 bedroom':   1.5,
  '2 bedrooms':  2.0,
  '3 bedrooms':  2.5,   // anchor point
  '4+ bedrooms': 3.5,
}

// ── Extra hours per bathroom (1st bathroom is included in base) ──────────────
const BATHROOM_EXTRA_HOURS = {
  '1 bathroom':   0,
  '2 bathrooms':  0.25,  // anchor: +0.25h
  '3+ bathrooms': 0.5,
}

// ── Extra hours per floor beyond the first ───────────────────────────────────
const FLOOR_EXTRA_HOURS = {
  '1 floor':   0,
  '2 floors':  0.25,   // anchor: +0.25h
  '3+ floors': 0.5,
}

// ── Extra hours for basement ─────────────────────────────────────────────────
const BASEMENT_HOURS = {
  'No basement':          0,
  'Unfinished basement':  0.25,
  'Finished basement':    0.75,
}

// ── Service type multiplier ───────────────────────────────────────────────────
// Regular=1x | Deep=1.8x | Move-in/out=1.6x | Post-reno=2x
const SERVICE_MULTIPLIER = {
  regular:  1.0,
  deep:     1.8,
  movein:   1.6,
  moveout:  1.6,
  postreno: 2.0,
}

// ── Extra areas beyond the "standard" rooms ───────────────────────────────────
// Standard (included in base): living room, kitchen, bedrooms, bathrooms
const AREA_EXTRA_HOURS = {
  dining:        0.15,
  basement_area: 0,     // accounted for by the basement field
  laundry:       0.15,
  office:        0.15,
  garage:        0.25,
  balcony:       0.15,
  living:        0,     // included in base
  kitchen:       0,     // included in base
  bedrooms:      0,     // included in base
  bathrooms:     0,     // included in base
}

// ── Frequency discount ────────────────────────────────────────────────────────
const FREQUENCY_DISCOUNT = {
  'One-time visit': 0,
  'Weekly':         0,
  'Bi-weekly':      0,
  'Monthly':        0,
}

const MINIMUM_HOURS = 3

export function calculateEstimate(form) {
  // Nothing selected yet
  if (!form.bedrooms && !form.serviceType) {
    return null
  }

  // 1. Base hours from bedrooms
  let hours = BEDROOM_HOURS[form.bedrooms] ?? 0

  // 2. Bathrooms add-on
  hours += BATHROOM_EXTRA_HOURS[form.bathrooms] ?? 0

  // 3. Floors add-on
  hours += FLOOR_EXTRA_HOURS[form.floors] ?? 0

  // 4. Basement add-on
  hours += BASEMENT_HOURS[form.basement] ?? 0

  // 5. Extra areas
  for (const areaId of form.areas) {
    hours += AREA_EXTRA_HOURS[areaId] ?? 0
  }

  // 6. Service type multiplier
  const multiplier = SERVICE_MULTIPLIER[form.serviceType] ?? 1
  hours = hours * multiplier

  // 7. Enforce minimum
  hours = Math.max(hours, MINIMUM_HOURS)

  // 8. Frequency discount
  const discount = FREQUENCY_DISCOUNT[form.frequency] ?? 0
  const grossTotal = hours * HOURLY_RATE
  const discountAmount = grossTotal * discount
  const total = grossTotal - discountAmount

  return {
    hours: Math.round(hours * 10) / 10,       // 1 decimal
    hourlyRate: HOURLY_RATE,
    grossTotal: Math.round(grossTotal),
    discount,
    discountAmount: Math.round(discountAmount),
    total: Math.round(total),
    hasDiscount: discount > 0,
  }
}

export function formatCurrency(amount) {
  return `$${amount.toLocaleString('en-CA')}`
}
