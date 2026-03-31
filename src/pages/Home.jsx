import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Trusted & Insured',
    desc: 'All our cleaners are background-checked, bonded and fully insured for your peace of mind.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Spotless Results',
    desc: 'We use professional-grade products and proven techniques to make every corner shine.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Always On Time',
    desc: 'We respect your schedule. On-time arrivals, every time — no excuses, just results.',
  },
]

const stats = [
  { number: '500+', label: 'Happy Homes' },
  { number: '5★', label: 'Average Rating' },
  { number: '3+', label: 'Years in Canada' },
]

export default function Home() {
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300" />

        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">

          {/* Logo badge */}
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/60">
              <img
                src="/logo.jpg"
                alt="Braun Clean"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          {/* Tagline */}
          <p className="section-subtitle mb-3 animate-fade-up delay-100 uppercase tracking-widest text-sm font-semibold text-sky-600">
            Professional Home Cleaning · Canada
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-sky-900 leading-tight mb-6 animate-fade-up delay-200">
            A cleaner home,<br />
            <span className="text-sky-500">a happier life.</span>
          </h1>

          <p className="text-lg md:text-xl text-sky-700 max-w-2xl mx-auto mb-10 font-light animate-fade-up delay-300">
            We bring professional care to every corner of your home — so you can focus on what truly matters.
          </p>

          {/* Main CTA */}
          <div className="animate-fade-up delay-400">
            <Link
              to="/booking"
              className="inline-block bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white
                         font-bold text-lg md:text-xl px-10 py-5 rounded-2xl
                         shadow-2xl shadow-sky-400/40 hover:shadow-sky-500/50
                         hover:-translate-y-1 active:translate-y-0
                         transition-all duration-200
                         focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              Schedule My Perfect Clean
              <span className="ml-2 inline-block">→</span>
            </Link>
            <p className="text-sky-600 text-sm mt-4 font-medium">
              Free quote · No commitment · Takes 2 minutes
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
          <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-sky-500 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-5xl font-extrabold text-white">{s.number}</div>
                <div className="text-sky-100 text-sm md:text-base mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-2 uppercase tracking-widest text-sm">Why choose us</p>
            <h2 className="section-title">Cleaning you can trust</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">{f.title}</h3>
                <p className="text-sky-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-20 bg-sky-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* Image placeholder / logo block */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-8 ring-sky-200">
                  <img src="/logo.jpg" alt="About Braun Clean" className="w-full h-full object-cover scale-110" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-sky-500 text-white rounded-2xl px-5 py-3 shadow-lg">
                  <span className="font-bold text-lg">3+ Years</span>
                  <p className="text-sky-100 text-xs">Serving Canada</p>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="section-subtitle mb-2 uppercase tracking-widest text-sm">About us</p>
              <h2 className="section-title mb-6">Who we are</h2>
              <p className="text-sky-700 text-lg leading-relaxed mb-5">
                Braun Clean is a family-owned professional cleaning company serving Canadian homes with passion and care.
                Founded with the belief that a clean home is a happy home, we bring dedication and a personal touch to every job.
              </p>
              <p className="text-sky-700 leading-relaxed mb-8">
                From regular maintenance cleans to deep seasonal cleans, we tailor every visit to your home's unique needs.
                Our team treats your space with the same respect we'd give our own.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Eco-Friendly Products', 'Pet-Safe', 'Insured & Bonded', 'Flexible Scheduling'].map((tag) => (
                  <span key={tag} className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-gradient-to-br from-sky-500 to-sky-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Your home deserves<br />the very best.
          </h2>
          <p className="text-sky-100 text-lg mb-10">
            Book in minutes. We handle the rest.
          </p>
          <Link
            to="/booking"
            className="inline-block bg-white text-sky-600 hover:bg-sky-50
                       font-bold text-lg px-10 py-5 rounded-2xl
                       shadow-xl hover:-translate-y-1 transition-all duration-200
                       focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            Book Your Cleaning Now
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-sky-900 text-sky-300 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.jpg" alt="Braun Clean" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white text-lg">
              Braun<span className="text-sky-400">Clean</span>
            </span>
          </div>
          <p className="text-sm text-center">
            Professional home cleaning services · Canada
          </p>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Braun Clean. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
