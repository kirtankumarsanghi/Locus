import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

// Tab data for "How it Works"
const HOW_IT_WORKS_TABS = [
  {
    id: 'check-in',
    title: '1. Check In',
    icon: 'how_to_reg',
    description: 'Arrive at your reserved desk or claim an available one. Your session begins immediately.',
    color: 'text-primary border-primary',
    bg: 'bg-primary-container',
  },
  {
    id: 'focus',
    title: '2. Deep Focus',
    icon: 'psychology',
    description: 'Study uninterrupted. Your status shows as occupied on the live map, so others know the space is taken.',
    color: 'text-secondary border-secondary',
    bg: 'bg-secondary-container',
  },
  {
    id: 'break',
    title: '3. Take a Break',
    icon: 'coffee',
    description: 'Need coffee? Tap "Away". Your timer starts (e.g., 45 mins). The desk is held for you until you return.',
    color: 'text-tertiary border-tertiary',
    bg: 'bg-tertiary-container',
  },
  {
    id: 'auto-release',
    title: '4. Auto-Release',
    icon: 'timer_off',
    description: 'If your break timer expires, the system automatically frees the desk for others.',
    color: 'text-error border-error',
    bg: 'bg-error-container',
  }
];

// Dynamic status states for Hero card
const HERO_STATUSES = [
  { label: 'Occupied', color: 'bg-surface border-outline-variant', textClass: 'text-secondary', icon: 'person', timer: 'Active since 09:00' },
  { label: 'Away', color: 'bg-tertiary-container text-on-tertiary-container border-tertiary', textClass: 'text-tertiary', icon: 'coffee', timer: 'Returns in 12:45' },
  { label: 'Abandoned', color: 'bg-error-container text-on-error-container border-error', textClass: 'text-error', icon: 'timer', timer: 'Expired at 14:29' },
  { label: 'Available', color: 'bg-status-available text-on-status-available border-green-500', textClass: 'text-green-700', icon: 'check_circle', timer: 'Ready to use' }
];

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [heroStatusIndex, setHeroStatusIndex] = useState(0);
  const navigate = useNavigate();

  // Rotate hero status dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroStatusIndex((prev) => (prev + 1) % HERO_STATUSES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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

  const currentHeroStatus = HERO_STATUSES[heroStatusIndex];

  return (
    <div className="bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      {/* Add custom keyframes for marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16 glass-panel border-b border-outline-variant shadow-sm transition-all duration-300">
        <Logo variant="horizontal" showTagline={false} size={40} className="md:scale-110" />
        <div className="flex items-center gap-gutter">
          <Link
            to="/login"
            className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-secondary-container text-on-secondary-container font-label-bold text-label-bold rounded-full hover:opacity-90 hover:scale-105 transition-all"
          >
            Student Portal
          </Link>

          <Link to="/login" className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint hover:scale-105 transition-all">
            Staff Login
          </Link>

          <Link to="/login" className="hidden md:inline-flex items-center justify-center px-lg py-sm bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-full hover:bg-surface-container-low hover:scale-105 transition-all">
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
                <div className="inline-flex items-center gap-sm px-sm py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-label-bold mb-4 hover:scale-105 transition-transform cursor-default">
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
              <Link to="/login" className="inline-flex items-center justify-center px-xl py-md bg-primary text-on-primary font-label-bold text-label-bold rounded-full hover:bg-surface-tint shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Explore Live Map
                <span className="material-symbols-outlined ml-sm text-[18px]">arrow_forward</span>
              </Link>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center px-xl py-md bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-full hover:bg-surface-container-low transition-all hover:-translate-y-1 hover:shadow-md"
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Right side with 3D-like hero visual + floating card */}
          <div className="relative h-[400px] md:h-[600px] w-full animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>
            {/* Abstract 3D Desk Visual */}
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Rotating gradient orb */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary-container/30 to-tertiary-container/20 animate-spin-slow" />
                {/* Inner content */}
                <div className="absolute inset-8 rounded-2xl glass-panel flex flex-col items-center justify-center gap-4 shadow-2xl backdrop-blur-xl">
                  {/* Mini desk grid */}
                  <div className="grid grid-cols-4 gap-2 p-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-primary-container border-2 border-primary animate-pulse" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant transition-colors hover:bg-primary-container" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-error-container border border-error" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant transition-colors hover:bg-primary-container" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-primary-container border border-primary-fixed" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant transition-colors hover:bg-primary-container" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-tertiary-container border border-tertiary" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant transition-colors hover:bg-primary-container" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant transition-colors hover:bg-primary-container" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-primary-container border-2 border-primary" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-surface border border-outline-variant transition-colors hover:bg-primary-container" />
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

            {/* Dynamic Floating Glass Card */}
            <div className={`absolute bottom-10 -left-4 md:-left-12 glass-panel p-md rounded-xl shadow-xl flex items-center gap-md animate-fade-in-up z-20 transition-all duration-500 ${currentHeroStatus.color} group-hover:-translate-y-2`} style={{ animationDelay: '0.6s' }}>
              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                <span className={`material-symbols-outlined ${currentHeroStatus.textClass}`}>{currentHeroStatus.icon}</span>
              </div>
              <div>
                <div className="font-label-bold text-label-bold uppercase">Desk 42 • Level 3</div>
                <div className="font-mono-timer text-mono-timer flex items-center gap-xs">
                  <span className={`font-bold ${currentHeroStatus.textClass}`}>{currentHeroStatus.label}:</span> {currentHeroStatus.timer}
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
            <div className="p-lg bg-surface-container rounded-xl border border-outline-variant/30 reveal-on-scroll hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-surface mb-md flex items-center justify-center text-secondary border border-outline-variant/50 group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined text-[24px]">visibility_off</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Blind Spots</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Staff cannot manually monitor thousands of desks across multiple floors continuously.</p>
            </div>
            <div className="p-lg bg-error-container/20 rounded-xl border border-error-container reveal-on-scroll hover:-translate-y-2 hover:shadow-xl hover:shadow-error/10 transition-all duration-300 group cursor-default" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-lg bg-error-container mb-md flex items-center justify-center text-on-error-container border border-error-container/50 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">sentiment_dissatisfied</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface uppercase mb-xs tracking-wider">Student Frustration</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">High-stress periods become battlegrounds for study space, impacting academic performance.</p>
            </div>
            <div className="p-lg bg-surface-container rounded-xl border border-outline-variant/30 reveal-on-scroll hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-default" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-lg bg-surface mb-md flex items-center justify-center text-secondary border border-outline-variant/50 group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
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
            <div className="md:col-span-8 glass-panel rounded-2xl p-xl flex flex-col justify-between relative overflow-hidden reveal-on-scroll group hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-default">
              <div className="relative z-10 w-full max-w-md">
                <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-bold text-label-bold mb-md text-[10px]">
                  <span className="material-symbols-outlined text-[14px]">map</span> CORE FEATURE
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm group-hover:text-primary transition-colors">Live Interactive Map</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time visualization of your entire library layout. Instantly identify available, occupied, and abandoned desks through clear color-coded statuses.</p>
              </div>
              {/* Abstract Map */}
              <div className="absolute right-0 bottom-0 w-2/3 h-full translate-x-10 translate-y-10 opacity-80 group-hover:translate-x-4 group-hover:translate-y-4 group-hover:scale-105 transition-all duration-700 ease-out">
                <div className="grid grid-cols-4 gap-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant rotate-[-5deg] shadow-lg">
                  <div className="w-12 h-12 rounded bg-primary-container border-2 border-primary animate-pulse" />
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
            <div className="md:col-span-4 bg-primary text-on-primary rounded-2xl p-lg flex flex-col justify-between reveal-on-scroll group hover:shadow-xl hover:bg-surface-tint transition-all duration-300 cursor-default" style={{ transitionDelay: '0.1s' }}>
              <div>
                <span className="material-symbols-outlined text-[32px] mb-md opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all">lock_clock</span>
                <h3 className="font-headline-md text-headline-md font-bold mb-xs">Server-Side Integrity</h3>
                <p className="font-body-sm text-body-sm opacity-90">Timers are managed securely on the server. No client-side manipulation, no sleeping tabs pausing countdowns.</p>
              </div>
              <div className="font-mono-timer text-mono-timer tracking-widest bg-black/20 p-sm rounded text-center mt-auto group-hover:bg-black/30 transition-colors">
                00:45:00
              </div>
            </div>

            {/* Feature 3: Automated Enforcement — small */}
            <div className="md:col-span-4 glass-panel border-outline-variant rounded-2xl p-lg flex flex-col reveal-on-scroll group hover:shadow-xl hover:border-tertiary/50 transition-all duration-300 cursor-default" style={{ transitionDelay: '0.2s' }}>
              <span className="material-symbols-outlined text-[32px] text-tertiary mb-md group-hover:rotate-12 transition-transform">gavel</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-xs">Automated Enforcement</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">When a timer expires, the desk status updates automatically, alerting staff and freeing the space.</p>
            </div>

            {/* Feature 4: Usage Analytics — medium span */}
            <div className="md:col-span-8 bg-surface-container-high rounded-2xl p-lg flex items-center reveal-on-scroll group hover:shadow-xl transition-all duration-300 cursor-default" style={{ transitionDelay: '0.3s' }}>
              <div className="flex-1 pr-lg">
                <span className="material-symbols-outlined text-[32px] text-secondary mb-md group-hover:scale-110 transition-transform">analytics</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-xs group-hover:text-primary transition-colors">Usage Analytics</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Track peak hours, popular zones, and average reservation times to optimize staffing and space planning.</p>
              </div>
              <div className="w-1/3 h-full bg-surface rounded-xl border border-outline-variant/50 p-sm flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-full bg-primary-container rounded-t h-[40%] group-hover:h-[50%] transition-all duration-500 delay-75" />
                <div className="w-full bg-primary-container rounded-t h-[60%] group-hover:h-[80%] transition-all duration-500 delay-100" />
                <div className="w-full bg-primary rounded-t h-[90%] group-hover:h-[100%] transition-all duration-500 delay-150" />
                <div className="w-full bg-primary-container rounded-t h-[70%] group-hover:h-[60%] transition-all duration-500 delay-200" />
                <div className="w-full bg-primary-container rounded-t h-[50%] group-hover:h-[70%] transition-all duration-500 delay-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 170+ Features Highlight Section */}
      <section className="py-24 bg-surface relative overflow-hidden border-t border-outline-variant/30">
        <div className="container mx-auto px-gutter max-w-container-max">
          <div className="text-center mb-xl reveal-on-scroll">
            <div className="inline-flex items-center gap-sm px-sm py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-label-bold mb-4">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              170+ Comprehensive Features
            </div>
            <h2 className="font-display-lg text-display-lg text-on-surface font-bold mb-sm">Everything you need, nothing you don't</h2>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mx-auto">From AI-powered recommendations to real-time administrative control, Locus delivers a complete desk management ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-lg">
            {/* Feature 1 */}
            <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/50 hover:shadow-lg transition-shadow reveal-on-scroll group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-xs">AI Smart Recommendations</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                Machine learning-style scoring ranks desks based on previous usage, preferred zones, noise levels, and current availability.
              </p>
              <ul className="space-y-2 font-label-md text-label-md text-on-surface-variant">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> Personal Study Heatmaps</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> Zone & Noise Preferences</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/50 hover:shadow-lg transition-shadow reveal-on-scroll group cursor-default" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-xl bg-tertiary-container text-tertiary flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">social_leaderboard</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-xs">Gamified Study Streaks</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                Keep students motivated with an achievement system including 'Early Bird', 'Marathon Session', and consecutive day study streaks.
              </p>
              <ul className="space-y-2 font-label-md text-label-md text-on-surface-variant">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span> Color-coded Badges & Rarity</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span> Weekly & Monthly Goal Tracking</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/50 hover:shadow-lg transition-shadow reveal-on-scroll group cursor-default" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-xs">Sub-Second Real-Time Sync</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                Powered by Socket.IO, experience &lt;100ms updates across 13 live event types. See desks change state the moment they're claimed.
              </p>
              <ul className="space-y-2 font-label-md text-label-md text-on-surface-variant">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span> Auto-reconnection & Fallbacks</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span> Zero-refresh Data Sync</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/50 hover:shadow-lg transition-shadow reveal-on-scroll group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-xs">Role-Based Dashboards</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                Tailored experiences for 3 user roles: Students (booking & tracking), Staff (live map & alerts), and Admins (system analytics & CRUD).
              </p>
              <ul className="space-y-2 font-label-md text-label-md text-on-surface-variant">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-error text-[16px]">check_circle</span> Strict RBAC Security</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-error text-[16px]">check_circle</span> Role-Specific Quick Actions</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/50 hover:shadow-lg transition-shadow reveal-on-scroll group cursor-default" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-xs">Frictionless Check-In</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                Three ways to check in: instant quick select from the live map, integrated QR code scanner, or manual ID entry.
              </p>
              <ul className="space-y-2 font-label-md text-label-md text-on-surface-variant">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> Session State Machine</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> Availability Validation</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/50 hover:shadow-lg transition-shadow reveal-on-scroll group cursor-default" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-xl bg-status-available/20 text-status-available flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">monitoring</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-xs">Time-Travel Analytics</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                Deep dive into occupancy trends with 10+ chart types, peak usage heatmaps, and multi-format exports (CSV, Excel, JSON).
              </p>
              <ul className="space-y-2 font-label-md text-label-md text-on-surface-variant">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-status-available text-[16px]">check_circle</span> Hour × Day Usage Matrix</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-status-available text-[16px]">check_circle</span> Custom Report Generation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Interactive How It Works Section */}
      <section className="py-24 bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="container mx-auto px-gutter max-w-container-max">
          <div className="text-center mb-xl reveal-on-scroll">
            <h2 className="font-display-lg text-display-lg text-on-surface font-bold mb-sm">How Locus Works</h2>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mx-auto">A seamless lifecycle that ensures fair use without getting in the way of studying.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl items-center reveal-on-scroll">
            {/* Interactive Tabs */}
            <div className="flex flex-col gap-sm">
              {HOW_IT_WORKS_TABS.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`text-left p-lg rounded-xl border-2 transition-all duration-300 flex items-start gap-md ${activeTab === idx ? `${tab.color} bg-surface-container shadow-md` : 'border-transparent hover:bg-surface-container-low opacity-60 hover:opacity-100'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeTab === idx ? tab.bg + ' ' + tab.color : 'bg-surface border border-outline-variant'}`}>
                    <span className="material-symbols-outlined">{tab.icon}</span>
                  </div>
                  <div>
                    <h3 className={`font-headline-md text-headline-md font-bold mb-xs ${activeTab === idx ? 'text-on-surface' : 'text-on-surface-variant'}`}>{tab.title}</h3>
                    <div className={`font-body-sm text-body-sm overflow-hidden transition-all duration-300 ${activeTab === idx ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <p className="text-on-surface-variant">{tab.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Dynamic Visual Content based on active tab */}
            <div className="h-[400px] rounded-3xl bg-surface-container-high border border-outline-variant flex items-center justify-center p-xl relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <span className="material-symbols-outlined text-[300px]">{HOW_IT_WORKS_TABS[activeTab].icon}</span>
              </div>
              <div className={`glass-panel p-xl rounded-2xl shadow-2xl relative z-10 w-full max-w-sm text-center transition-all duration-500 transform ${activeTab % 2 === 0 ? 'scale-105' : 'scale-100'}`}>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-md ${HOW_IT_WORKS_TABS[activeTab].bg}`}>
                  <span className={`material-symbols-outlined text-[40px] ${HOW_IT_WORKS_TABS[activeTab].color}`}>{HOW_IT_WORKS_TABS[activeTab].icon}</span>
                </div>
                <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">{HOW_IT_WORKS_TABS[activeTab].title}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{HOW_IT_WORKS_TABS[activeTab].description}</p>
                {activeTab === 2 && (
                  <div className="mt-md font-mono-timer text-mono-timer text-tertiary bg-tertiary-container/30 py-xs px-sm rounded animate-pulse">
                    Timer: 45:00
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section (Now with animated marquee) */}
      <section className="py-xl bg-surface-container overflow-hidden">
        <div className="container mx-auto px-gutter max-w-container-max text-center">
          <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-widest mb-lg">Trusted by the world's leading academic libraries</p>
          
          <div className="relative w-full flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-24 py-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
              {/* Marquee Content - Duplicate for seamless loop */}
              {[1, 2].map((group) => (
                <div key={group} className="flex gap-24 items-center">
                  <span className="font-display-lg-mobile font-bold text-secondary text-xl whitespace-nowrap">Stanford <span className="font-normal text-sm inline-block">Libraries</span></span>
                  <span className="font-display-lg-mobile font-bold text-secondary text-xl whitespace-nowrap">MIT <span className="font-normal text-sm inline-block">Reading Rooms</span></span>
                  <span className="font-display-lg-mobile font-bold text-secondary text-xl whitespace-nowrap">UCL <span className="font-normal text-sm inline-block">Student Centre</span></span>
                  <span className="font-display-lg-mobile font-bold text-secondary text-xl whitespace-nowrap">Melbourne <span className="font-normal text-sm inline-block">Uni Library</span></span>
                  <span className="font-display-lg-mobile font-bold text-secondary text-xl whitespace-nowrap">Oxford <span className="font-normal text-sm inline-block">Bodleian</span></span>
                </div>
              ))}
            </div>
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface-container to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface-container to-transparent z-10" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-inverse-surface text-inverse-on-surface relative overflow-hidden">
        <div className="container mx-auto px-gutter max-w-container-max text-center relative z-10 reveal-on-scroll">
          <h2 className="font-display-lg text-display-lg font-bold mb-md">Ready to restore order to your library?</h2>
          <p className="font-body-base text-body-base text-surface-variant max-w-2xl mx-auto mb-xl">Implement Locus in under 48 hours. No hardware installation required.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center px-xl py-md bg-primary-fixed text-on-primary-fixed font-label-bold text-label-bold rounded-full hover:bg-primary-fixed-dim hover:scale-105 shadow-lg transition-all duration-300"
          >
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
