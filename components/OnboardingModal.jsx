'use client';
import React, { useState } from 'react';
import { ShieldCheck, User, Phone, Key, MapPin, Check, ArrowRight, ArrowLeft, Lock, Plus, X } from 'lucide-react';
import { saveUserProfile } from '../lib/userStorage';

const inputStyle = {
  width: '100%', background: 'var(--bg-secondary)',
  border: '1px solid var(--border-glass)',
  padding: '11px 14px', borderRadius: 10,
  color: 'var(--text-primary)', fontSize: '0.9rem',
};

const steps = [
  { id: 1, icon: User,     title: 'New User Sign Up',       sub: 'Create your personal profile & calibrate your voice baseline' },
  { id: 2, icon: Phone,    title: '3 Trusted Contacts',     sub: 'Choose people you can contact from a potential-event review' },
  { id: 3, icon: Key,      title: 'Secret Code-Words',      sub: 'Optional phrases matched in analyzed audio or transcript' },
  { id: 4, icon: MapPin,   title: 'Safe Zones & Routine',   sub: 'Contextual geofences & schedule to prevent false alarms' },
];

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: 'Zainab Shaikh',
    age: '',
    phone: '9892058858',
    contacts: [
      { name: 'Priya Gupta', relation: 'Primary Emergency Contact', phone: '+91 93249 57234', isPrimary: true },
      { name: 'Isha Narvekar', relation: 'Emergency Contact', phone: '+91 9324402673', isPrimary: false },
      { name: 'Jiya Talreja', relation: 'Emergency Contact', phone: '+91 95292 95915', isPrimary: false },
    ],
    codeWords: ['blue umbrella', 'weather is cold today', 'check the ledger'],
    wordInput: '',
    homeLocation: 'Home - Residence',
    workLocation: 'Campus / Workplace',
    sleepStart: '23:00',
    sleepEnd: '07:00',
    locationConsent: false,
  });

  if (!isOpen) return null;

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const updateContact = (index, field, value) => {
    setData(d => {
      const updated = [...d.contacts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...d, contacts: updated };
    });
  };

  const addWord = e => {
    e.preventDefault();
    if (!data.wordInput.trim()) return;
    set('codeWords', [...data.codeWords, data.wordInput.trim().toLowerCase()]);
    set('wordInput', '');
  };

  const removeWord = w => set('codeWords', data.codeWords.filter(x => x !== w));

  const finish = () => {
    const profile = {
      userId: 'usr_safe_9921',
      name: data.name || 'Zainab Shaikh',
      age: data.age,
      phone: data.phone || '9892058858',
      calibratedAt: new Date().toISOString().split('T')[0],
      avgPitchHz: 182, pitchRange: [155, 205],
      avgEnergyDb: -22, speakingRateWpm: 135,
      avgBreathingRpm: 16, breathingRange: [12, 19],
      microTremorJitterPct: 1.2,
      avgPauseDurationMs: 420, silenceRatioPct: 18,
      configuredCodeWords: data.codeWords,
      configuredKeywords: ['help', 'stop', 'let me go', 'hurry'],
      safeLocations: [
        { name: data.homeLocation, coords: { lat: 28.6139, lng: 77.209 }, radiusMeters: 300 },
        { name: data.workLocation, coords: { lat: 28.545,  lng: 77.193 }, radiusMeters: 500 },
      ],
      typicalRoutine: {
        sleep:  { start: data.sleepStart, end: data.sleepEnd },
        active: { start: data.sleepEnd,   end: data.sleepStart },
      },
      trustedContacts: data.contacts.map((c, i) => ({
        id: `c${i+1}`,
        name: c.name || `Contact ${i+1}`,
        relation: c.relation || 'Emergency Contact',
        phone: c.phone || '',
        isPrimary: i === 0,
      })),
      locationPermissionGranted: data.locationConsent,
      alertSensitivity: 65,
    };
    saveUserProfile(profile);
    onComplete?.(profile);
  };

  const StepIcon = steps[step - 1].icon;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-highlight)',
        borderRadius: 22, padding: '32px 36px',
        maxWidth: 520, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 32px rgba(45,212,191,0.18)',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Step progress dots */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          {steps.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: s.id <= step ? 'var(--teal-400)' : 'var(--border-glass)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Icon + heading */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--teal-400)',
          }}>
            <StepIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize:'0.68rem', color:'var(--teal-400)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Step {step} of 4
            </div>
            <h3 style={{ fontSize:'1.15rem', margin:0 }}>{steps[step-1].title}</h3>
          </div>
        </div>
        <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:22 }}>
          {steps[step-1].sub}
        </p>

        {/* ── Step 1: Identity ── */}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:6, fontWeight:600 }}>
                Your Full Name
              </label>
              <input style={inputStyle} type="text" placeholder="e.g. Zainab Shaikh"
                value={data.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:6, fontWeight:600 }}>
                Your Phone Number
              </label>
              <input style={inputStyle} type="tel" placeholder="e.g. 9892058858"
                value={data.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:6, fontWeight:600 }}>
                Age (optional)
              </label>
              <input style={inputStyle} type="number" min="13" max="120" value={data.age} onChange={e => set('age', e.target.value)} />
            </div>
            <div style={{
              background: 'rgba(45,212,191,0.06)', border:'1px solid rgba(45,212,191,0.18)',
              padding:'12px 14px', borderRadius:10, fontSize:'0.78rem', color:'var(--text-secondary)',
            }}>
              <strong style={{ color:'var(--teal-300)' }}>Document Section 3 - Basic Profile:</strong>{' '}
              Stores user identity, phone, and baseline characteristics locally to personalize acoustic monitoring and prevent generic false alarms.
            </div>
          </div>
        )}

        {/* ── Step 2: Emergency Contacts (3 Contacts) ── */}
        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:2 }}>
              Add people you may choose to contact after reviewing a potential event. This browser prototype does not send alerts automatically.
            </div>
            {data.contacts.map((c, idx) => (
              <div key={idx} style={{
                background:'var(--bg-tertiary)', border:'1px solid var(--border-glass)',
                padding:'12px', borderRadius:10, display:'flex', flexDirection:'column', gap:8
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color: idx === 0 ? 'var(--teal-300)' : 'var(--text-muted)' }}>
                    {idx === 0 ? '★ Primary Contact' : `Emergency Contact #${idx + 1}`}
                  </span>
                  <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{c.relation}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <input style={{ ...inputStyle, padding:'8px 10px', fontSize:'0.82rem' }}
                    type="text" placeholder="Full Name"
                    value={c.name} onChange={e => updateContact(idx, 'name', e.target.value)} />
                  <input style={{ ...inputStyle, padding:'8px 10px', fontSize:'0.82rem' }}
                    type="tel" placeholder="Phone Number"
                    value={c.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} />
                </div>
              </div>
            ))}
            <div style={{
              background:'rgba(244,63,94,0.07)', border:'1px solid rgba(244,63,94,0.2)',
              padding:'11px 14px', borderRadius:10, fontSize:'0.78rem', color:'var(--text-secondary)',
            }}>
              <strong style={{ color:'#f43f5e' }}>Contact actions are manual:</strong>{' '}
              This browser prototype stores trusted contacts locally. It does not send encrypted notifications or contact anyone automatically.
            </div>
          </div>
        )}

        {/* ── Step 3: Code-Words ── */}
        {step === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.55, margin:0 }}>
              Choose phrases that sound natural in conversation (e.g. <em>"blue umbrella"</em>). A match in a transcript can contribute to a potential-event classification; the browser prototype does not monitor calls or send alerts.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, minHeight:40 }}>
              {data.codeWords.map(w => (
                <span key={w} style={{
                  background:'rgba(45,212,191,0.1)', border:'1px solid rgba(45,212,191,0.3)',
                  padding:'5px 12px', borderRadius:20, fontSize:'0.82rem',
                  display:'inline-flex', alignItems:'center', gap:7, color:'var(--text-primary)',
                }}>
                  "{w}"
                  <button onClick={() => removeWord(w)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:0, lineHeight:1 }}>
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={addWord} style={{ display:'flex', gap:8 }}>
              <input style={{ ...inputStyle, flex:1 }} type="text"
                placeholder="Add phrase, e.g. 'check the ledger'"
                value={data.wordInput} onChange={e => set('wordInput', e.target.value)} />
              <button type="submit" className="btn btn-outline" style={{ padding:'10px 14px', flexShrink:0 }}>
                <Plus size={15} /> Add
              </button>
            </form>
          </div>
        )}

        {/* ── Step 4: Safe zones & routine ── */}
        {step === 4 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.76rem', color:'var(--text-secondary)', marginBottom:5, fontWeight:600 }}>Home Safe Zone</label>
                <input style={inputStyle} type="text" value={data.homeLocation} onChange={e => set('homeLocation', e.target.value)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.76rem', color:'var(--text-secondary)', marginBottom:5, fontWeight:600 }}>Work / Campus Zone</label>
                <input style={inputStyle} type="text" value={data.workLocation} onChange={e => set('workLocation', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.76rem', color:'var(--text-secondary)', marginBottom:6, fontWeight:600 }}>
                Sleep Schedule (unusual hours raise contextual concern)
              </label>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input style={{ ...inputStyle, width:'auto' }} type="time" value={data.sleepStart} onChange={e => set('sleepStart', e.target.value)} />
                <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>to</span>
                <input style={{ ...inputStyle, width:'auto' }} type="time" value={data.sleepEnd} onChange={e => set('sleepEnd', e.target.value)} />
              </div>
            </div>
            <label style={{
              display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer',
              background:'rgba(45,212,191,0.06)', border:'1px solid rgba(45,212,191,0.18)',
              padding:'12px 14px', borderRadius:10, fontSize:'0.78rem', color:'var(--text-secondary)',
            }}>
              <input type="checkbox" checked={data.locationConsent} onChange={e => set('locationConsent', e.target.checked)}
                style={{ marginTop:2, accentColor:'var(--teal-500)', flexShrink:0 }} />
              <span>
                <strong style={{ color:'var(--teal-300)' }}>Location Consent:</strong>{' '}
                Allow a one-time location lookup for a Level 4 review. Coordinates stay in this browser; no message is sent automatically.
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:26 }}>
          {step > 1
            ? <button onClick={() => setStep(s => s-1)} className="btn btn-outline" style={{ padding:'9px 18px' }}>
                <ArrowLeft size={15} /> Back
              </button>
            : <span />
          }
          {step < 4
            ? <button onClick={() => setStep(s => s+1)} className="btn btn-primary" style={{ padding:'9px 22px' }}>
                Continue <ArrowRight size={15} />
              </button>
            : <button onClick={finish} className="btn btn-primary" style={{ padding:'9px 24px', background:'linear-gradient(135deg,#0d9488 0%,#0891b2 100%)' }}>
                <Check size={16} /> Complete Sign Up &amp; Start Tour
              </button>
          }
        </div>
      </div>
    </div>
  );
}
