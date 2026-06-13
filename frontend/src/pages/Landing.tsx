import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // WebGL shader background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec3 colorPrimary = vec3(0.31, 0.27, 0.90);
    vec3 colorSurface = vec3(0.99, 0.97, 1.0);
    float line1 = sin(uv.y * 50.0 + u_time * 2.0) * 0.5 + 0.5;
    float line2 = sin(uv.y * 120.0 - u_time * 1.5) * 0.5 + 0.5;
    float wave = sin(uv.x * 2.0 + u_time * 0.5) * 0.1 + 0.5;
    float mask = smoothstep(wave - 0.2, wave + 0.2, uv.y);
    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 finalColor = mix(colorSurface, colorPrimary, mask * 0.1);
    float bit = step(0.995, sin(uv.x * 10.0 + u_time) * sin(uv.y * 10.0 - u_time));
    finalColor = mix(finalColor, colorPrimary, bit * 0.3);
    finalColor -= noise * 0.02;
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function createShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let animId: number;
    function render(t: number) {
      if (!canvas || !gl) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16 glass-panel border-b border-outline-variant shadow-sm transition-all duration-300">
        <Logo variant="horizontal" showTagline={false} size={40} className="md:scale-110" />
        <div className="flex items-center gap-gutter">
          <Link
            to="/login"
            className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-secondary-container text-on-secondary-container font-label-bold text-label-bold rounded-full hover:opacity-90 transition-colors"
          >
            Student Portal
          </Link>

          <Link to="/login" className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint transition-colors">
            Staff Login
          </Link>

          <Link to="/login" className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-full hover:bg-surface-container-low transition-colors">
            Admin Login
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-sm text-primary hover:bg-surface-container-high rounded-full transition-colors md:hidden"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-outline-variant shadow-lg py-4 px-6 flex flex-col gap-3 md:hidden z-50 animate-in slide-in-from-top-2">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-lg py-sm bg-secondary-container text-on-secondary-container font-label-bold text-label-bold rounded-full hover:opacity-90 transition-colors"
            >
              Student Portal
            </Link>

            <Link 
              to="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-lg py-sm bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint transition-colors"
            >
              Staff Login
            </Link>

            <Link 
              to="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-lg py-sm bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-full hover:bg-surface-container-low transition-colors"
            >
              Admin Login
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* WebGL Shader Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-surface/40 z-0" />

        <div className="container mx-auto px-gutter max-w-container-max relative z-10 grid md:grid-cols-2 gap-xl items-center">
          <div className="space-y-lg animate-fade-in-up">
            <div className="flex flex-col items-start gap-4">
              <Logo variant="default" showTagline={true} size={80} className="hidden md:flex -ml-8" />
              <div className="flex-1">
                <div className="inline-flex items-center gap-sm px-sm py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-label-bold mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
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
              </div>
            </div>
            <div className="md:hidden flex justify-center py-4">
              <Logo variant="default" showTagline={true} />
            </div>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
              Eliminate 'Ghost Reservations' and ensure fair access to study spaces with real-time occupancy tracking and automated enforcement.
            </p>
            <div className="flex flex-col sm:flex-row gap-sm pt-sm">
              <Link to="/login" className="inline-flex items-center justify-center px-xl py-md bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Explore Live Map
                <span className="material-symbols-outlined ml-sm text-[18px]">arrow_forward</span>
              </Link>
              <button className="inline-flex items-center justify-center px-xl py-md bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-full hover:bg-surface-container-low transition-colors">
                View Demo
              </button>
            </div>
          </div>

          {/* Right side with 3D-like hero visual + floating card */}
          <div className="relative h-[400px] md:h-[600px] w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Abstract 3D Desk Visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Rotating gradient orb */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary-container/30 to-tertiary-container/20 animate-spin-slow" />
                {/* Inner content */}
                <div className="absolute inset-8 rounded-2xl glass-panel flex flex-col items-center justify-center gap-4 shadow-2xl">
                  {/* Mini desk grid */}
                  <div className="grid grid-cols-4 gap-2 p-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-primary-container border-2 border-primary animate-pulse" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-error-container border border-error" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-primary-container border border-primary-fixed" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-tertiary-container border border-tertiary" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-primary-container border-2 border-primary" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-error-container border border-error animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-label-bold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-container border border-primary" /> Free</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error-container border border-error" /> Occupied</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary-container border border-tertiary" /> Away</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Glass Card */}
            <div className="absolute bottom-10 -left-4 md:-left-12 glass-panel p-md rounded-xl shadow-lg flex items-center gap-md animate-fade-in-up z-20" style={{ animationDelay: '0.6s' }}>
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div>
                <div className="font-label-bold text-label-bold text-on-surface-variant uppercase">Desk 42 • Level 3</div>
                <div className="font-mono-timer text-mono-timer text-on-surface flex items-center gap-xs">
                  <span className="text-error font-bold">Abandoned:</span> 14:29
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-gutter max-w-container-max text-center max-w-3xl">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-md reveal-on-scroll">The 'Ghost Reservation' Epidemic</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mb-xl reveal-on-scroll">
            Libraries are full, yet desks sit empty. Students leave belongings to "claim" territory for hours while others wander aimlessly looking for a spot. It's frustrating, inefficient, and unfair.
          </p>
          <div className="grid md:grid-cols-3 gap-lg text-left">
            <div className="p-lg bg-surface-container rounded-xl border border-outline-variant/30 reveal-on-scroll">
              <div className="w-12 h-12 rounded-lg bg-surface mb-md flex items-center justify-center text-secondary border border-outline-variant/50">
                <span className="material-symbols-outlined text-[24px]">visibility_off</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Blind Spots</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Staff cannot manually monitor thousands of desks across multiple floors continuously.</p>
            </div>
            <div className="p-lg bg-error-container/20 rounded-xl border border-error-container reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-lg bg-error-container mb-md flex items-center justify-center text-on-error-container border border-error-container/50">
                <span className="material-symbols-outlined text-[24px]">sentiment_dissatisfied</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Student Frustration</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">High-stress periods become battlegrounds for study space, impacting academic performance.</p>
            </div>
            <div className="p-lg bg-surface-container rounded-xl border border-outline-variant/30 reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-lg bg-surface mb-md flex items-center justify-center text-secondary border border-outline-variant/50">
                <span className="material-symbols-outlined text-[24px]">trending_down</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Inefficiency</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Premium real estate is underutilized despite appearing "at capacity" on paper.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section (Bento) */}
      <section className="py-24 bg-surface relative overflow-hidden">
        {/* Decorative blur orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary-container/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-gutter max-w-container-max relative z-10">
          <div className="text-center mb-xl reveal-on-scroll">
            <h2 className="font-display-lg text-display-lg text-on-surface font-bold mb-sm">Engineered for Academic Utility</h2>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mx-auto">A comprehensive suite designed to enforce fairness without adding administrative overhead.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg auto-rows-[300px]">
            {/* Feature 1: Live Map — large span */}
            <div className="md:col-span-8 glass-panel rounded-2xl p-xl flex flex-col justify-between relative overflow-hidden reveal-on-scroll group">
              <div className="relative z-10 w-full max-w-md">
                <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-bold text-label-bold mb-md text-[10px]">
                  <span className="material-symbols-outlined text-[14px]">map</span> CORE FEATURE
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Live Interactive Map</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time visualization of your entire library layout. Instantly identify available, occupied, and abandoned desks through clear color-coded statuses.</p>
              </div>
              {/* Abstract Map */}
              <div className="absolute right-0 bottom-0 w-2/3 h-full translate-x-10 translate-y-10 opacity-80 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500">
                <div className="grid grid-cols-4 gap-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant rotate-[-5deg] shadow-lg">
                  <div className="w-12 h-12 rounded bg-primary-container border-2 border-primary" />
                  <div className="w-12 h-12 rounded bg-surface border border-outline-variant" />
                  <div className="w-12 h-12 rounded bg-error-container border border-error" />
                  <div className="w-12 h-12 rounded bg-surface border border-outline-variant" />
                  <div className="w-12 h-12 rounded bg-primary-container border border-primary-fixed" />
                  <div className="w-12 h-12 rounded bg-surface border border-outline-variant" />
                  <div className="w-12 h-12 rounded bg-tertiary-container border border-tertiary" />
                  <div className="w-12 h-12 rounded bg-surface border border-outline-variant" />
                </div>
              </div>
            </div>

            {/* Feature 2: Server-Side Integrity — small */}
            <div className="md:col-span-4 bg-primary text-on-primary rounded-2xl p-lg flex flex-col justify-between reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div>
                <span className="material-symbols-outlined text-[32px] mb-md opacity-80">lock_clock</span>
                <h3 className="font-headline-md text-headline-md font-bold mb-xs">Server-Side Integrity</h3>
                <p className="font-body-sm text-body-sm opacity-90">Timers are managed securely on the server. No client-side manipulation, no sleeping tabs pausing countdowns.</p>
              </div>
              <div className="font-mono-timer text-mono-timer tracking-widest bg-black/20 p-sm rounded text-center mt-auto">
                00:45:00
              </div>
            </div>

            {/* Feature 3: Automated Enforcement — small */}
            <div className="md:col-span-4 glass-panel border-outline-variant rounded-2xl p-lg flex flex-col reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <span className="material-symbols-outlined text-[32px] text-tertiary mb-md">gavel</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-xs">Automated Enforcement</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">When a timer expires, the desk status updates automatically, alerting staff and freeing the space.</p>
            </div>

            {/* Feature 4: Usage Analytics — medium span */}
            <div className="md:col-span-8 bg-surface-container-high rounded-2xl p-lg flex items-center reveal-on-scroll" style={{ transitionDelay: '0.3s' }}>
              <div className="flex-1 pr-lg">
                <span className="material-symbols-outlined text-[32px] text-secondary mb-md">analytics</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-xs">Usage Analytics</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Track peak hours, popular zones, and average reservation times to optimize staffing and space planning.</p>
              </div>
              <div className="w-1/3 h-full bg-surface rounded-xl border border-outline-variant/50 p-sm flex items-end gap-1 opacity-80">
                <div className="w-full bg-primary-container rounded-t h-[40%]" />
                <div className="w-full bg-primary-container rounded-t h-[60%]" />
                <div className="w-full bg-primary rounded-t h-[90%]" />
                <div className="w-full bg-primary-container rounded-t h-[70%]" />
                <div className="w-full bg-primary-container rounded-t h-[50%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-xl bg-surface-container border-y border-outline-variant/30">
        <div className="container mx-auto px-gutter max-w-container-max text-center">
          <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-widest mb-lg">Trusted by the world's leading academic libraries</p>
          <div className="flex flex-wrap justify-center items-center gap-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">Stanford<span className="font-normal text-sm block">Libraries</span></span>
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">MIT<span className="font-normal text-sm block">Reading Rooms</span></span>
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">UCL<span className="font-normal text-sm block">Student Centre</span></span>
            <span className="font-display-lg-mobile font-bold text-secondary text-xl">Melbourne<span className="font-normal text-sm block">Uni Library</span></span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-inverse-surface text-inverse-on-surface relative overflow-hidden">
        <div className="container mx-auto px-gutter max-w-container-max text-center relative z-10 reveal-on-scroll">
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
            <Logo variant="horizontal" showTagline={false} className="scale-75" />
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
