import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { geocodePostalCode, haversineKm } from '../utils/geo'
import { sendBookingEmail } from '../utils/email'
import { calculateEstimate, formatCurrency } from '../utils/pricing'
import { OWNER_LOCATION, MAX_DISTANCE_KM, BLOCKED_WEEKDAYS, MORNING_ONLY_WEEKDAYS, BLOCKED_DATES } from '../config'

const STORAGE_KEY = 'braun_clean_booking'

const INITIAL_FORM = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  bedrooms: '',
  bathrooms: '',
  basement: '',
  floors: '',
  areas: [],
  serviceType: '',
  frequency: '',
  preferredDate: '',
  preferredTime: '',
  hasPets: '',
  extraNotes: '',
}

const BEDROOM_OPTIONS  = ['1 bedroom',  '2 bedrooms',  '3 bedrooms', '4+ bedrooms']
const BATHROOM_OPTIONS = ['1 bathroom', '2 bathrooms', '3+ bathrooms']
const BASEMENT_OPTIONS = ['No basement', 'Unfinished basement', 'Finished basement']
const FLOOR_OPTIONS    = ['1 floor', '2 floors', '3+ floors']

const AREA_OPTIONS = [
  { id: 'living',       label: 'Living Room'   },
  { id: 'kitchen',      label: 'Kitchen'        },
  { id: 'dining',       label: 'Dining Room'    },
  { id: 'bedrooms',     label: 'Bedrooms'       },
  { id: 'bathrooms',    label: 'Bathrooms'      },
  { id: 'basement_area',label: 'Basement'       },
  { id: 'laundry',      label: 'Laundry Room'   },
  { id: 'office',       label: 'Home Office'    },
  { id: 'garage',       label: 'Garage'         },
  { id: 'balcony',      label: 'Balcony / Patio'},
]

const SERVICE_OPTIONS = [
  { id: 'regular',  label: 'Regular Cleaning',     desc: 'Routine maintenance clean'         },
  { id: 'deep',     label: 'Deep Cleaning',         desc: 'Thorough top-to-bottom clean'      },
  { id: 'movein',   label: 'Move-In Cleaning',      desc: 'Fresh start for a new home'        },
  { id: 'moveout',  label: 'Move-Out Cleaning',     desc: 'Leave it spotless for the next tenant' },
  { id: 'postreno', label: 'Post-Renovation',       desc: 'After construction dust & debris'  },
]

const FREQUENCY_OPTIONS = ['One-time visit', 'Weekly', 'Bi-weekly', 'Monthly']
const TIME_OPTIONS      = ['Morning (8am – 12pm)', 'Afternoon (12pm – 4pm)', 'Evening (4pm – 7pm)']

// ─── Price widget ─────────────────────────────────────────────────────────────

function PriceWidget({ estimate }) {
  if (!estimate) return null

  return (
    <div className="sticky top-20 z-40 mx-auto max-w-3xl px-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-lg px-5 py-3 flex items-center justify-between gap-4 animate-fade-in">
        {/* Hours */}
        <div className="flex items-center gap-2 text-sky-600 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong className="text-sky-900">{estimate.hours}h</strong> estimated</span>
        </div>

        {/* Rate */}
        <div className="hidden sm:block text-sky-400 text-xs">
          {estimate.hours}h × {formatCurrency(estimate.hourlyRate)}/hr
        </div>

        {/* Discount badge */}
        {estimate.hasDiscount && (
          <div className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            -{Math.round(estimate.discount * 100)}% off
          </div>
        )}

        {/* Total */}
        <div className="flex items-baseline gap-1.5 ml-auto">
          {estimate.hasDiscount && (
            <span className="text-sky-300 line-through text-sm">
              {formatCurrency(estimate.grossTotal)}
            </span>
          )}
          <span className="text-2xl font-extrabold text-sky-900">
            {formatCurrency(estimate.total)}
          </span>
          <span className="text-sky-400 text-xs">CAD</span>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt} className="cursor-pointer">
          <input type="radio" name={name} value={opt}
            checked={value === opt} onChange={() => onChange(opt)} className="sr-only" />
          <span className={`inline-block px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
            value === opt
              ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
              : 'border-sky-200 text-sky-700 hover:border-sky-400 hover:bg-sky-50'
          }`}>
            {opt}
          </span>
        </label>
      ))}
    </div>
  )
}

function SectionTitle({ step, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <h3 className="text-xl font-bold text-sky-900">{title}</h3>
        {subtitle && <p className="text-sky-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Too Far screen ───────────────────────────────────────────────────────────

function TooFarScreen({ distanceKm, onBack }) {
  return (
    <div className="min-h-screen bg-sky-50">
      <Header />
      <div className="pt-28 pb-20 px-4 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-14 max-w-lg w-full animate-fade-up">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-sky-900 mb-3">
            You're a bit far from us
          </h2>
          <p className="text-sky-600 mb-2 text-lg">
            Your location is approximately{' '}
            <strong className="text-sky-800">{Math.round(distanceKm)} km</strong> away.
          </p>
          <p className="text-sky-500 mb-8 leading-relaxed">
            We currently serve homes within <strong>{MAX_DISTANCE_KM} km</strong> of London, Ontario.
            Unfortunately we're unable to schedule a visit at this time — but we're always expanding!
          </p>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 mb-8 text-left">
            <p className="text-sky-700 text-sm font-semibold mb-1">Want to be notified when we expand?</p>
            <p className="text-sky-500 text-sm">
              Reach out to us on WhatsApp and we'll add you to our expansion list.
            </p>
          </div>
          <button onClick={onBack} className="btn-primary w-full">
            ← Try a different postal code
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────

const SERVICE_LABELS = {
  regular: 'Regular Cleaning', deep: 'Deep Cleaning',
  movein: 'Move-In Cleaning', moveout: 'Move-Out Cleaning', postreno: 'Post-Renovation',
}

function SuccessScreen({ form, onBack }) {
  return (
    <div className="min-h-screen bg-sky-50">
      <Header />
      <div className="pt-28 pb-20 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full animate-fade-up text-center">

          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-sky-900 mb-2">Booking received!</h2>
          <p className="text-sky-500 text-lg mb-1">
            Thank you, <strong className="text-sky-800">{form.name.split(' ')[0]}</strong>!
          </p>
          <p className="text-sky-400 text-sm mb-8">
            We'll reach out to <strong className="text-sky-600">{form.phone}</strong> to confirm your appointment.
          </p>

          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-green-50 border-green-200 mb-8 text-left">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Booking summary sent!</p>
              <p className="text-xs text-green-600 mt-0.5">We received your request and will confirm by SMS shortly.</p>
            </div>
          </div>

          <div className="bg-sky-50 rounded-2xl p-5 text-left space-y-1.5 text-sm mb-8">
            <p className="font-semibold text-sky-800 mb-3">Your booking summary</p>
            <p className="text-sky-600"><span className="font-medium text-sky-800">Name:</span> {form.name}</p>
            <p className="text-sky-600"><span className="font-medium text-sky-800">Phone:</span> {form.phone}</p>
            <p className="text-sky-600"><span className="font-medium text-sky-800">Address:</span> {form.address}, {form.city}</p>
            <p className="text-sky-600"><span className="font-medium text-sky-800">Service:</span> {SERVICE_LABELS[form.serviceType] || form.serviceType}</p>
            {form.bedrooms && <p className="text-sky-600"><span className="font-medium text-sky-800">Bedrooms:</span> {form.bedrooms}</p>}
            {form.preferredDate && <p className="text-sky-600"><span className="font-medium text-sky-800">Preferred date:</span> {form.preferredDate}</p>}
          </div>

          <button onClick={onBack} className="btn-primary w-full">Back to Home</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Booking page ────────────────────────────────────────────────────────

export default function Booking() {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...INITIAL_FORM, ...JSON.parse(saved) } : INITIAL_FORM
    } catch {
      return INITIAL_FORM
    }
  })
  const [errors, setErrors]         = useState({})
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError]     = useState(null)
  // 'form' | 'too-far' | 'success'
  const [screen, setScreen]         = useState('form')
  const [distanceKm, setDistanceKm] = useState(null)
  const navigate = useNavigate()

  const estimate = calculateEstimate(form)

  // Auto-save draft
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch {}
  }, [form])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }))
    if (field === 'postalCode') { setGeoError(null) }
  }, [errors])

  function toggleArea(id) {
    setForm((prev) => ({
      ...prev,
      areas: prev.areas.includes(id)
        ? prev.areas.filter((a) => a !== id)
        : [...prev.areas, id],
    }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())    e.name = true
    if (!form.phone.trim())   e.phone = true
    if (!form.address.trim()) e.address = true
    if (!form.city.trim())    e.city = true
    if (!form.bedrooms)       e.bedrooms = true
    if (!form.bathrooms)      e.bathrooms = true
    if (!form.serviceType)    e.serviceType = true
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // 1. Field validation
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      document.querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // 2. Distance check (requires postal code)
    if (!form.postalCode.trim()) {
      setErrors((prev) => ({ ...prev, postalCode: true }))
      document.querySelector('[data-field="postalCode"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setGeoLoading(true)
    setGeoError(null)

    try {
      const { lat, lon } = await geocodePostalCode(form.postalCode)
      const km = haversineKm(OWNER_LOCATION.lat, OWNER_LOCATION.lon, lat, lon)
      setDistanceKm(km)

      // 3a. Too far
      if (km > MAX_DISTANCE_KM) {
        setScreen('too-far')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // 3b. Within range — send email automatically and show success
      await sendBookingEmail(form, km, estimate)

      try {
        const bookings = JSON.parse(localStorage.getItem('braun_clean_bookings') || '[]')
        bookings.push({ ...form, distanceKm: km, submittedAt: new Date().toISOString() })
        localStorage.setItem('braun_clean_bookings', JSON.stringify(bookings))
        localStorage.removeItem(STORAGE_KEY)
      } catch {}

      setScreen('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (err) {
      setGeoError(
        'Could not verify your postal code. Please double-check it and try again.'
      )
    } finally {
      setGeoLoading(false)
    }
  }

  // ── Screens ──────────────────────────────────────────────────────────────

  if (screen === 'too-far') {
    return <TooFarScreen distanceKm={distanceKm} onBack={() => setScreen('form')} />
  }

  if (screen === 'success') {
    return (
      <SuccessScreen form={form} onBack={() => navigate('/')} />
    )
  }

  // ── Booking form ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sky-50">
      <Header />

      {/* Sticky price widget — appears once bedrooms are selected */}
      <PriceWidget estimate={estimate} />

      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">

        <div className="text-center mb-10 animate-fade-up">
          <Link to="/" className="inline-flex items-center text-sky-500 hover:text-sky-700 text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="section-title mb-3">Book Your Cleaning</h1>
          <p className="text-sky-500 text-lg">Fill in the details below and we'll confirm by email.</p>
          <p className="text-sky-400 text-sm mt-2">Your progress is automatically saved.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* ── 1: Contact Info ── */}
          <div className="card animate-fade-up delay-100">
            <SectionTitle step="1" title="Your Information" subtitle="We'll confirm your booking via SMS" />
            <div className="grid sm:grid-cols-2 gap-4">

              <div data-error={!!errors.name}>
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  Full Name <span className="text-sky-400">*</span>
                </label>
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                  placeholder="Jane Smith"
                  className={`form-input ${errors.name ? 'border-red-400 ring-1 ring-red-300' : ''}`} />
                {errors.name && <p className="text-red-400 text-xs mt-1">Please enter your name</p>}
              </div>

              <div data-error={!!errors.phone}>
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  WhatsApp Number <span className="text-sky-400">*</span>
                </label>
                <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  placeholder="(519) 317-3192"
                  className={`form-input ${errors.phone ? 'border-red-400 ring-1 ring-red-300' : ''}`} />
                {errors.phone
                  ? <p className="text-red-400 text-xs mt-1">Please enter your phone number</p>
                  : <p className="text-sky-400 text-xs mt-1">We'll send your SMS confirmation here</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  Email <span className="text-sky-300 font-normal">(optional)</span>
                </label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  placeholder="jane@email.com" className="form-input" />
              </div>

              <div className="sm:col-span-2" data-error={!!errors.address}>
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  Service Address <span className="text-sky-400">*</span>
                </label>
                <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)}
                  placeholder="123 Maple Street, Unit 4"
                  className={`form-input ${errors.address ? 'border-red-400 ring-1 ring-red-300' : ''}`} />
                {errors.address && <p className="text-red-400 text-xs mt-1">Please enter your address</p>}
              </div>

              <div data-error={!!errors.city}>
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  City <span className="text-sky-400">*</span>
                </label>
                <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                  placeholder="London"
                  className={`form-input ${errors.city ? 'border-red-400 ring-1 ring-red-300' : ''}`} />
                {errors.city && <p className="text-red-400 text-xs mt-1">Please enter your city</p>}
              </div>

              {/* Postal code — required for distance check */}
              <div data-field="postalCode" data-error={!!errors.postalCode || !!geoError}>
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  Postal Code <span className="text-sky-400">*</span>
                </label>
                <input type="text" value={form.postalCode}
                  onChange={(e) => set('postalCode', e.target.value.toUpperCase())}
                  placeholder="N5X 0N3" maxLength={7}
                  className={`form-input ${(errors.postalCode || geoError) ? 'border-red-400 ring-1 ring-red-300' : ''}`} />
                {errors.postalCode && !geoError &&
                  <p className="text-red-400 text-xs mt-1">Postal code is required to check service area</p>}
                {geoError &&
                  <p className="text-red-400 text-xs mt-1">{geoError}</p>}
                {!errors.postalCode && !geoError &&
                  <p className="text-sky-400 text-xs mt-1">Required to verify we serve your area</p>}
              </div>

            </div>
          </div>

          {/* ── 2: Home Details ── */}
          <div className="card animate-fade-up delay-200">
            <SectionTitle step="2" title="About Your Home" subtitle="Help us prepare the right team and equipment" />
            <div className="space-y-6">

              <div data-error={!!errors.bedrooms}>
                <label className="block text-sm font-semibold text-sky-800 mb-3">
                  Bedrooms <span className="text-sky-400">*</span>
                </label>
                <RadioGroup name="bedrooms" options={BEDROOM_OPTIONS} value={form.bedrooms} onChange={(v) => set('bedrooms', v)} />
                {errors.bedrooms && <p className="text-red-400 text-xs mt-2">Please select number of bedrooms</p>}
              </div>

              <div data-error={!!errors.bathrooms}>
                <label className="block text-sm font-semibold text-sky-800 mb-3">
                  Bathrooms <span className="text-sky-400">*</span>
                </label>
                <RadioGroup name="bathrooms" options={BATHROOM_OPTIONS} value={form.bathrooms} onChange={(v) => set('bathrooms', v)} />
                {errors.bathrooms && <p className="text-red-400 text-xs mt-2">Please select number of bathrooms</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-3">Basement</label>
                <RadioGroup name="basement" options={BASEMENT_OPTIONS} value={form.basement} onChange={(v) => set('basement', v)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-3">Number of Floors</label>
                <RadioGroup name="floors" options={FLOOR_OPTIONS} value={form.floors} onChange={(v) => set('floors', v)} />
              </div>

            </div>
          </div>

          {/* ── 3: Areas ── */}
          <div className="card animate-fade-up delay-300">
            <SectionTitle step="3" title="Areas to Clean" subtitle="Select all that apply" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AREA_OPTIONS.map((area) => {
                const checked = form.areas.includes(area.id)
                return (
                  <label key={area.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                    checked
                      ? 'border-sky-500 bg-sky-50 text-sky-800'
                      : 'border-sky-100 text-sky-600 hover:border-sky-300 hover:bg-sky-50/50'
                  }`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleArea(area.id)} className="checkbox-input" />
                    <span className="text-sm font-medium">{area.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* ── 4: Service Type ── */}
          <div className="card animate-fade-up delay-300">
            <SectionTitle step="4" title="Type of Service" subtitle="What kind of clean do you need?" />
            <div className="space-y-3" data-error={!!errors.serviceType}>
              {SERVICE_OPTIONS.map((svc) => {
                const selected = form.serviceType === svc.id
                return (
                  <label key={svc.id} className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                    selected ? 'border-sky-500 bg-sky-50' : 'border-sky-100 hover:border-sky-300 hover:bg-sky-50/40'
                  }`}>
                    <input type="radio" name="serviceType" value={svc.id}
                      checked={selected} onChange={() => set('serviceType', svc.id)} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected ? 'border-sky-500 bg-sky-500' : 'border-sky-300'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${selected ? 'text-sky-800' : 'text-sky-700'}`}>{svc.label}</p>
                      <p className="text-sky-400 text-xs">{svc.desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
            {errors.serviceType && <p className="text-red-400 text-xs mt-3">Please select a service type</p>}

            <div className="mt-6 pt-5 border-t border-sky-100">
              <label className="block text-sm font-semibold text-sky-800 mb-3">Frequency</label>
              <RadioGroup name="frequency" options={FREQUENCY_OPTIONS} value={form.frequency} onChange={(v) => set('frequency', v)} />
            </div>
          </div>

          {/* ── 5: Schedule ── */}
          <div className="card animate-fade-up delay-400">
            <SectionTitle step="5" title="Scheduling & Extra Details" subtitle="Optional but helpful" />
            <div className="space-y-5">

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-sky-800 mb-1.5">Preferred Date</label>
                  <input type="date" value={form.preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const val = e.target.value
                      if (!val) { set('preferredDate', ''); return }
                      const d = new Date(val + 'T12:00:00')
                      const day = d.getDay()
                      if (BLOCKED_WEEKDAYS.includes(day) || BLOCKED_DATES.includes(val)) return
                      // If Saturday (morning-only) and afternoon/evening was picked, reset time
                      if (MORNING_ONLY_WEEKDAYS.includes(day) && form.preferredTime !== 'Morning (8am – 12pm)') {
                        set('preferredTime', 'Morning (8am – 12pm)')
                      }
                      set('preferredDate', val)
                    }}
                    className="form-input"
                  />
                  {/* Availability hint */}
                  {form.preferredDate && (() => {
                    const d = new Date(form.preferredDate + 'T12:00:00')
                    const day = d.getDay()
                    if (BLOCKED_WEEKDAYS.includes(day) || BLOCKED_DATES.includes(form.preferredDate)) {
                      return <p className="text-red-400 text-xs mt-1">This day is not available. Please choose another date.</p>
                    }
                    if (MORNING_ONLY_WEEKDAYS.includes(day)) {
                      return <p className="text-amber-500 text-xs mt-1">Saturdays: morning only (8am – 12pm).</p>
                    }
                    return null
                  })()}
                  <p className="text-sky-400 text-xs mt-1">Sundays unavailable · Saturdays morning only</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-sky-800 mb-3">Preferred Time</label>
                  {/* On morning-only days, only show morning option */}
                  {form.preferredDate && MORNING_ONLY_WEEKDAYS.includes(new Date(form.preferredDate + 'T12:00:00').getDay())
                    ? <RadioGroup name="preferredTime" options={['Morning (8am – 12pm)']} value={form.preferredTime} onChange={(v) => set('preferredTime', v)} />
                    : <RadioGroup name="preferredTime" options={TIME_OPTIONS} value={form.preferredTime} onChange={(v) => set('preferredTime', v)} />
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-3">Do you have pets?</label>
                <RadioGroup name="hasPets" options={['No pets', 'Yes – dog(s)', 'Yes – cat(s)', 'Yes – other']}
                  value={form.hasPets} onChange={(v) => set('hasPets', v)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-1.5">
                  Extra Notes or Special Requests
                </label>
                <textarea rows={4} value={form.extraNotes} onChange={(e) => set('extraNotes', e.target.value)}
                  placeholder="e.g. Please focus on the kitchen appliances, there's a fragile vase in the living room, allergic to certain products..."
                  className="form-input resize-none" />
              </div>

            </div>
          </div>

          {/* ── Submit ── */}
          <div className="animate-fade-up delay-500">
            {Object.keys(errors).length > 0 && (
              <p className="text-red-500 text-sm text-center mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                Please fill in all required fields marked with *
              </p>
            )}

            {/* Email notice */}
            <div className="bg-sky-100/60 border border-sky-200 rounded-2xl px-5 py-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-sky-800">
                After submitting, we'll receive your booking summary instantly by email and confirm via SMS.
              </p>
            </div>

            <button type="submit" disabled={geoLoading}
              className={`btn-primary w-full py-5 ${geoLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {geoLoading
                ? <span className="flex items-center justify-center gap-3 text-lg">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Checking your location…
                  </span>
                : estimate
                  ? <span className="flex flex-col items-center gap-0.5">
                      <span className="text-xl font-bold">
                        Book Now — Est. {formatCurrency(estimate.total)} CAD →
                      </span>
                      <span className="text-sky-200 text-sm font-normal">
                        {estimate.hours}h × ${estimate.hourlyRate}/hr
                        {estimate.hasDiscount && ` · ${Math.round(estimate.discount * 100)}% recurring discount`}
                      </span>
                    </span>
                  : <span className="text-xl">Send My Booking Request →</span>
              }
            </button>
            <p className="text-center text-sky-400 text-sm mt-4">
              Estimate is approximate. Final price confirmed before service.
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}
