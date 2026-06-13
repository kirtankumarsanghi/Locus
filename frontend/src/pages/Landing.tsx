import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface/70 backdrop-blur-md border-b border-outline-variant shadow-sm transition-all duration-300">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          <span className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold tracking-tight hidden md:block">Locus</span>
          <span className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold tracking-tight md:hidden">Locus</span>
        </div>
        <div className="flex items-center gap-gutter">
          <Link to="/map" className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint transition-colors">
            Staff Login
          </Link>
          <button className="inline-flex items-center justify-center p-sm text-primary hover:bg-surface-container-high rounded-full transition-colors md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 mesh-bg">
        <div className="container mx-auto px-gutter max-w-container-max relative z-10 grid md:grid-cols-2 gap-xl items-center">
          <div className="space-y-lg">
            <div className="inline-flex items-center gap-sm px-sm py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-label-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Now Live in 50+ Universities
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[48px] md:leading-[56px] text-on-surface font-bold tracking-tight">
              The Future of <br />
              <span className="text-primary relative inline-block">
                Focused Study
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-fixed" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-md text-lg">
              Your seat. Not your bag's.
            </p>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
              Eliminate 'Ghost Reservations' and ensure fair access to study spaces with real-time occupancy tracking and automated enforcement.
            </p>
            <div className="flex flex-col sm:flex-row gap-sm pt-sm">
              <Link to="/map" className="inline-flex items-center justify-center px-xl py-md bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Explore Live Map
                <span className="material-symbols-outlined ml-sm text-[18px]">arrow_forward</span>
              </Link>
              <button className="inline-flex items-center justify-center px-xl py-md bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-full hover:bg-surface-container-low transition-colors">
                View Demo
              </button>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[600px] w-full flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-gutter max-w-container-max text-center max-w-3xl">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-md text-2xl">The 'Ghost Reservation' Epidemic</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mb-xl">
            Libraries are full, yet desks sit empty. Students leave belongings to "claim" territory for hours while others wander aimlessly looking for a spot. It's frustrating, inefficient, and unfair.
          </p>
          <div className="grid md:grid-cols-3 gap-lg text-left">
            <div className="p-lg bg-surface-container rounded-xl border border-outline-variant/30">
              <div className="w-12 h-12 rounded-lg bg-surface mb-md flex items-center justify-center text-secondary border border-outline-variant/50">
                <span className="material-symbols-outlined text-[24px]">visibility_off</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Blind Spots</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Staff cannot manually monitor thousands of desks across multiple floors continuously.</p>
            </div>
            <div className="p-lg bg-error-container/20 rounded-xl border border-error-container">
              <div className="w-12 h-12 rounded-lg bg-error-container mb-md flex items-center justify-center text-on-error-container border border-error-container/50">
                <span className="material-symbols-outlined text-[24px]">sentiment_dissatisfied</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Student Frustration</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">High-stress periods become battlegrounds for study space, impacting academic performance.</p>
            </div>
            <div className="p-lg bg-surface-container rounded-xl border border-outline-variant/30">
              <div className="w-12 h-12 rounded-lg bg-surface mb-md flex items-center justify-center text-secondary border border-outline-variant/50">
                <span className="material-symbols-outlined text-[24px]">trending_down</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Inefficiency</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Premium real estate is underutilized despite appearing "at capacity" on paper.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24 bg-surface relative overflow-hidden">
        <div className="container mx-auto px-gutter max-w-container-max relative z-10">
          <div className="text-center mb-xl">
            <h2 className="font-display-lg text-display-lg text-on-surface font-bold mb-sm">Engineered for Academic Utility</h2>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mx-auto">A comprehensive suite designed to enforce fairness without adding administrative overhead.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-xl border border-outline-variant">
              <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-bold text-label-bold mb-md text-[10px]">
                <span className="material-symbols-outlined text-[14px]">map</span> CORE FEATURE
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Live Interactive Map</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time visualization of your entire library layout. Instantly identify available, occupied, and abandoned desks through clear color-coded statuses.</p>
            </div>
            <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-xl border border-outline-variant">
              <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-bold text-label-bold mb-md text-[10px]">
                <span className="material-symbols-outlined text-[14px]">verified_user</span> AUTOMATION
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Automated Enforcement</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Set custom grace periods and let the system automatically flag and release abandoned desks, ensuring fair access for all.</p>
            </div>
            <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-xl border border-outline-variant">
              <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-bold text-label-bold mb-md text-[10px]">
                <span className="material-symbols-outlined text-[14px]">analytics</span> INSIGHTS
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Usage Analytics</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Track peak hours, desk utilization patterns, and optimize your space allocation with data-driven insights.</p>
            </div>
            <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-xl border border-outline-variant">
              <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-bold text-label-bold mb-md text-[10px]">
                <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span> SEAMLESS
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Server-Side Integrity</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Secure check-in system prevents cheating and ensures only legitimate users can reserve desks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="container mx-auto px-gutter max-w-container-max text-center">
          <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-lg">Trusted by top institutions worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-xl">
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">Stanford<span className="font-normal text-sm block">Green Library</span></span>
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">MIT<span className="font-normal text-sm block">Hayden Library</span></span>
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">UCL<span className="font-normal text-sm block">Student Centre</span></span>
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">Melbourne<span className="font-normal text-sm block">Uni Library</span></span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-inverse-surface text-inverse-on-surface relative overflow-hidden">
        <div className="container mx-auto px-gutter max-w-container-max text-center relative z-10">
          <h2 className="font-display-lg text-display-lg font-bold mb-md">Ready to restore order to your library?</h2>
          <p className="font-body-base text-body-base text-surface-variant max-w-2xl mx-auto mb-xl">Implement Locus in under 48 hours. No hardware installation required.</p>
          <button className="inline-flex items-center justify-center px-xl py-md bg-primary-fixed text-on-primary-fixed font-label-bold text-label-bold rounded-full hover:bg-primary-fixed-dim shadow-lg transition-colors">
            Request a Custom Quote
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-lg border-t border-outline-variant text-center">
        <div className="container mx-auto px-gutter max-w-container-max">
          <div className="flex flex-col md:flex-row justify-between items-center gap-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
              <span className="font-label-bold text-label-bold text-primary font-bold">Locus</span>
            </div>
            <div className="flex gap-lg">
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
            </div>
            <p className="font-body-sm text-body-sm text-outline">© 2024 Locus Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
