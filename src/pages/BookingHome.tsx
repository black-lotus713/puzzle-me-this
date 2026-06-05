import { Link } from 'react-router-dom'

export default function BookingHome() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 min-h-[calc(100vh-64px)] flex items-center py-20 md:py-0">
        <div className="w-full max-w-2xl">
          <p className="text-xs uppercase tracking-[0.1em] font-semibold text-accent mb-4">
            Personal Consultations
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-primary leading-[1.15]">
            Reserve Your Session,<br />At Your Convenience
          </h1>
          <p className="mt-4 text-base text-secondary max-w-[440px]">
            One-on-one sessions tailored to you. Browse available times and book
            in seconds — no account needed.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/booking/book"
              className="px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-subtle">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-primary">How It Works</h2>
            <div className="mx-auto mt-3 h-[2px] w-10 bg-accent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Browse Available Slots', body: 'View all open time slots and pick the one that fits your schedule best.' },
              { step: '2', title: 'Fill In Your Details', body: 'Enter your name, email, and any notes about what you\'d like to discuss.' },
              { step: '3', title: 'You\'re Confirmed', body: 'Your booking is instantly confirmed. We\'ll see you at your chosen time.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-inverse font-display text-xl font-bold mb-4">
                  {step}
                </div>
                <h3 className="font-display text-lg font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the Service ── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl text-primary mb-6">About the Service</h2>
          <p className="text-base text-secondary leading-relaxed">
            We offer focused, one-on-one consultations designed to help you make
            thoughtful decisions. Whether you're looking for expert guidance on a
            specific topic or simply a dedicated hour to think through a challenge,
            our sessions are tailored entirely to your needs. Each appointment is
            private, unhurried, and built around you.
          </p>
          <Link
            to="/booking/book"
            className="inline-block mt-8 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          >
            Book a Session
          </Link>
        </div>
      </section>
    </div>
  )
}
