/**
 * Haversine formula — returns distance in km between two lat/lon points.
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

/**
 * Geocodes a Canadian postal code.
 *
 * Strategy:
 *   1. zippopotam.us  — free, CORS-safe, uses the FSA (first 3 chars)
 *   2. Nominatim      — fallback, full postal code, no custom headers
 *
 * Returns { lat, lon } or throws if both fail.
 */
export async function geocodePostalCode(postalCode) {
  const code = postalCode.replace(/\s/g, '').toUpperCase()

  // ── 1. zippopotam.us (primary) ──────────────────────────────────────────
  // Uses the FSA (Forward Sortation Area = first 3 characters of a Canadian
  // postal code), which is precise enough for a 50 km radius check.
  const fsa = code.slice(0, 3)
  try {
    const res = await fetch(`https://api.zippopotam.us/ca/${fsa}`)
    if (res.ok) {
      const data = await res.json()
      if (data.places?.length) {
        return {
          lat: parseFloat(data.places[0].latitude),
          lon: parseFloat(data.places[0].longitude),
        }
      }
    }
  } catch {
    // fall through to Nominatim
  }

  // ── 2. Nominatim fallback ─────────────────────────────────────────────────
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?postalcode=${encodeURIComponent(code)}&country=Canada&format=json&limit=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding request failed')

  const data = await res.json()
  if (!data.length) throw new Error('Postal code not found')

  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}
