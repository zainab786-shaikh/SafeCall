'use client';
import React, { useState } from 'react';
import { ShieldCheck, Wind, HeartHandshake, ArrowRight, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { markGuideAsSeen } from '../lib/userStorage';

const slides = [
  {
    icon: ShieldCheck,
    color: 'var(--teal-400)',
    badge: 'The PSWB 03 Problem',
    title: 'Panic buttons fail in real emergencies',
    body: [
      'When hands are restrained, a phone is pocketed, or fear causes freezing — pressing a button is physically impossible.',
      'SafeCall solves this by listening passively during any normal phone call. No buttons, no suspicious actions needed.',
    ],
    visual: (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 }}>
        {[
          ['❌ Hands restrained', 'Cannot reach phone'],
          ['❌ Aggressor watching', 'Pressing button alerts them'],
          ['✓ Speak naturally', 'Codeword triggers silent alert'],
          ['✓ Freeze / Gasp', 'Breathing sensor detects it'],
        ].map(([t, s]) => (
          <div key={t} style={{
            background: t.startsWith('✓') ? 'rgba(52,211,153,0.08)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${t.startsWith('✓') ? 'rgba(52,211,153,0.25)' : 'rgba(244,63,94,0.2)'}`,
            padding: '10px 12px', borderRadius: 10,
          }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, color: t.startsWith('✓') ? '#34d399' : '#f43f5e', marginBottom:3 }}>{t}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{s}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Wind,
    color: 'var(--cyan-400)',
    badge: 'Three Silent Sensors',
    title: 'What SafeCall listens for',
    body: [
      'During a permitted phone call, three acoustic channels are monitored locally on your device.',
    ],
    visual: (
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:4 }}>
        {[
          { c:'var(--teal-400)',  n:'Covert Code-Words', d:'A phrase like "blue umbrella" spoken naturally triggers an immediate silent alert without alerting anyone nearby.' },
          { c:'var(--cyan-400)', n:'Breathing Irregularities', d:'Hyperventilation (>24 bpm), sharp gasps, or prolonged frozen silence are detected without speech.' },
          { c:'#fbbf24',         n:'Vocal Stress & Tremor', d:'Involuntary pitch elevation and micro-tremors in the vocal cords appear under acute threat, even when trying to sound calm.' },
        ].map(({ c, n, d }) => (
          <div key={n} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'var(--bg-tertiary)', padding:'12px 14px', borderRadius:10, border:'1px solid var(--border-glass)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:c, marginTop:5, flexShrink:0 }} />
            <div>
              <div style={{ fontWeight:700, fontSize:'0.86rem', marginBottom:3, color:'var(--text-primary)' }}>{n}</div>
              <div style={{ fontSize:'0.76rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: HeartHandshake,
    color: '#34d399',
    badge: 'Zero False Alarms',
    title: 'Two engines — one for stress, one for danger',
    body: [
      'A busy work call sounds stressed but is never an emergency. SafeCall separates both.',
    ],
    visual: (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:4 }}>
        <div style={{ background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', padding:'14px', borderRadius:12 }}>
          <div style={{ fontWeight:700, color:'var(--cyan-400)', fontSize:'0.85rem', marginBottom:6 }}>💙 Wellbeing Engine</div>
          <div style={{ fontSize:'0.76rem', color:'var(--text-secondary)', lineHeight:1.55 }}>
            Tracks work fatigue and study stress over days. Logs insights privately. <strong>Emergency contacts are never alerted.</strong>
          </div>
        </div>
        <div style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.25)', padding:'14px', borderRadius:12 }}>
          <div style={{ fontWeight:700, color:'#f43f5e', fontSize:'0.85rem', marginBottom:6 }}>🛡️ Safety Engine</div>
          <div style={{ fontSize:'0.76rem', color:'var(--text-secondary)', lineHeight:1.55 }}>
            Activates on multi-signal danger. Sends a discreet GPS-pinned alert to your trusted contact with zero sound on your phone.
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksModal({ isOpen, onClose }) {
  const [slide, setSlide] = useState(0);
  if (!isOpen) return null;

  const { icon: Icon, color, badge, title, body, visual } = slides[slide];

  const finish = () => { markGuideAsSeen(); onClose(); };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-highlight)',
        borderRadius: 22, padding: '30px 34px',
        maxWidth: 560, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 28px rgba(45,212,191,0.18)',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Top row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span className="glass-pill">{badge}</span>
          <button onClick={finish} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Icon */}
        <div style={{
          width:50, height:50, borderRadius:14,
          background:`rgba(${color === 'var(--teal-400)' ? '45,212,191' : color === 'var(--cyan-400)' ? '34,211,238' : '52,211,153'},0.12)`,
          border:`1.5px solid ${color}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color, marginBottom:14,
        }}>
          <Icon size={26} />
        </div>

        <h3 style={{ fontSize:'1.3rem', marginBottom:10 }}>{title}</h3>
        {body.map((b, i) => (
          <p key={i} style={{ fontSize:'0.87rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:6 }}>{b}</p>
        ))}

        <div style={{ marginTop:16 }}>{visual}</div>

        {/* Dots + nav */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:26, paddingTop:20, borderTop:'1px solid var(--border-glass)' }}>
          <div style={{ display:'flex', gap:6 }}>
            {slides.map((_, i) => (
              <span key={i} onClick={() => setSlide(i)} style={{
                width: i === slide ? 22 : 8, height:8, borderRadius:4,
                background: i === slide ? 'var(--teal-400)' : 'var(--border-glass)',
                cursor:'pointer', transition:'all 0.25s',
              }} />
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s-1)} className="btn btn-outline" style={{ padding:'8px 16px', fontSize:'0.83rem' }}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            {slide < slides.length - 1
              ? <button onClick={() => setSlide(s => s+1)} className="btn btn-primary" style={{ padding:'8px 18px', fontSize:'0.83rem' }}>
                  Next <ArrowRight size={14} />
                </button>
              : <button onClick={finish} className="btn btn-primary" style={{ padding:'8px 18px', fontSize:'0.83rem' }}>
                  <CheckCircle2 size={14} /> Got it!
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
