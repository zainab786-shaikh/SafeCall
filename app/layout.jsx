'use client';
import React, { useState, useEffect } from 'react';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck, Activity, HeartHandshake, History,
  Info, PhoneCall, Sun, Moon, Lock, SlidersHorizontal,
} from 'lucide-react';
import OnboardingModal  from '../components/OnboardingModal';
import HowItWorksModal  from '../components/HowItWorksModal';
import { getUserProfile, hasSeenGuide } from '../lib/userStorage';

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('dark');
  const pathname = usePathname();

  /* ── Onboarding / guide state ── */
  const [onboarding, setOnboarding] = useState(false);
  const [guide,      setGuide]      = useState(false);

  useEffect(() => {
    // Theme
    const saved = localStorage.getItem('safecall_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    // Sign-up / tour
    if (!localStorage.getItem('safecall_user_profile_v2')) {
      setOnboarding(true);
    } else if (!hasSeenGuide()) {
      setGuide(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('safecall_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleOnboardingComplete = (profile) => {
    setOnboarding(false);
    // Always show the tour after a fresh sign-up
    setGuide(true);
  };

  const navLinks = [
    { name: 'Dashboard',     href: '/',          icon: Activity          },
    { name: 'System Inputs', href: '/inputs',    icon: SlidersHorizontal },
    { name: 'Wellbeing',     href: '/wellbeing', icon: HeartHandshake    },
    { name: 'Safety Setup',  href: '/safety',    icon: ShieldCheck       },
    { name: 'History',       href: '/history',   icon: History           },
    { name: 'Architecture',  href: '/about',     icon: Info              },
    { name: 'Contact',       href: '/contact',   icon: PhoneCall         },
  ];

  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>SafeCall — Non-Verbal Distress Detection</title>
        <meta name="description" content="Local-first SafeCall prototype for exploring personal audio patterns, configured phrases, and potential safety events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* ── Sync theme before first paint to prevent flash ── */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('safecall_theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body className="atmosphere-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Hackathon Banner ── */}
        <div style={{
          background: 'linear-gradient(90deg,#0f766e,#0891b2)',
          color: '#fff', padding: '7px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.76rem', fontWeight: 600, letterSpacing: '0.02em',
        }}>
          <span style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ background:'rgba(0,0,0,0.22)', padding:'2px 8px', borderRadius:4, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              PSWB 03 • Hackathon
            </span>
            Non-Verbal Distress Detection via Voice Pattern Analysis
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:6, opacity:0.85 }}>
            <Lock size={11} /> Privacy-First Local Processing
          </span>
        </div>

        {/* ── Nav Bar ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          background: 'var(--bg-glass)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '0 28px',
        }}>
          <div style={{
            maxWidth: 1340, margin: '0 auto',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', height: 60, gap: 16,
          }}>
            {/* Brand */}
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#14b8a6,#0891b2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(20,184,166,0.4)',
                position: 'relative',
              }}>
                <ShieldCheck color="#fff" size={20} />
                <span className="beacon-pulse" style={{ background:'#2dd4bf', position:'absolute', inset:'-3px', borderRadius:'50%' }} />
              </div>
              <span style={{ fontSize:'1.15rem', fontWeight:800, letterSpacing:'-0.02em' }}>
                Safe<span className="gradient-text">Call</span>
              </span>
            </Link>

            {/* Links */}
            <nav style={{ display:'flex', alignItems:'center', gap:2 }}>
              {navLinks.map(({ name, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 13px', borderRadius: 10,
                    textDecoration: 'none', fontSize: '0.85rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--teal-400)' : 'var(--text-secondary)',
                    background: active ? 'rgba(45,212,191,0.1)' : 'transparent',
                    border: active ? '1px solid rgba(45,212,191,0.28)' : '1px solid transparent',
                    transition: 'all 0.18s',
                  }}>
                    <Icon size={14} />
                    <span>{name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right controls */}
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <div className="glass-pill" style={{ fontSize:'0.72rem', gap:7 }}>
                <span className="beacon" style={{ background:'#34d399' }}>
                  <span className="beacon-pulse" style={{ background:'#34d399' }} />
                </span>
                Local Prototype
              </div>
              <button onClick={toggleTheme} aria-label="Toggle theme" style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                width: 36, height: 36, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s',
              }}>
                {theme === 'dark'
                  ? <Sun size={16} color="#facc15" />
                  : <Moon size={16} color="#0f766e" />}
              </button>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex:1, maxWidth:1340, width:'100%', margin:'0 auto', padding:'28px 20px 56px' }}>
          {children}
        </main>

        {/* ── Global Modals (Sign-Up & Tour) ── */}
        <OnboardingModal
          isOpen={onboarding}
          onClose={() => setOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
        <HowItWorksModal
          isOpen={guide}
          onClose={() => setGuide(false)}
        />

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid var(--border-glass)',
          background: 'var(--bg-secondary)',
          padding: '32px 28px 24px',
        }}>
          <div style={{ maxWidth:1340, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:28, marginBottom:28 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <ShieldCheck size={18} color="var(--teal-400)" />
                  <span style={{ fontWeight:700, fontSize:'1rem' }}>SafeCall AI</span>
                </div>
                <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, fontStyle:'italic' }}>
                  "Not every stressed voice needs an emergency alert — but not every emergency comes with a cry for help."
                </p>
              </div>
              <div>
                <h4 style={{ fontSize:'0.82rem', marginBottom:10, color:'var(--text-primary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Two Engines</h4>
                <ul style={{ listStyle:'none', fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', flexDirection:'column', gap:6 }}>
                  <li><strong style={{ color:'var(--cyan-400)' }}>Wellbeing Engine:</strong> Local session summaries; repeated history is needed for trends.</li>
                  <li><strong style={{ color:'#f43f5e' }}>Safety Engine:</strong> Prototype fusion of measured audio features, phrases, routine, and consented location.</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize:'0.82rem', marginBottom:10, color:'var(--text-primary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Responsible AI</h4>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.55 }}>
                  SafeCall does not diagnose mental illness or physical danger. Audio is analyzed locally; derived features are stored in this browser. Contact actions require your confirmation and do not replace emergency services.
                </p>
              </div>
            </div>
            <div style={{ borderTop:'1px solid var(--border-glass)', paddingTop:18, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.75rem', color:'var(--text-muted)', flexWrap:'wrap', gap:10 }}>
              <span>SafeCall Prototype · PSWB 03 Hackathon</span>
              <div style={{ display:'flex', gap:18 }}>
                <Link href="/about" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Architecture</Link>
                <Link href="/safety" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Privacy</Link>
                <Link href="/contact" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Emergency</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
