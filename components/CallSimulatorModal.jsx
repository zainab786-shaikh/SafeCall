'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Eye, EyeOff, ShieldAlert, CheckCircle2, X, Radio } from 'lucide-react';

export default function CallSimulatorModal({ isOpen, onClose, userProfile, onOpenReceiver }) {
  const [callActive, setCallActive]   = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [covertMode, setCovertMode]   = useState(false);
  const [micOn, setMicOn]             = useState(false);
  const [speechConsent, setSpeechConsent] = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [pitch, setPitch]             = useState(181);
  const [breathing, setBreathing]     = useState(16);
  const [codeword, setCodeword]       = useState(null);
  const [alertFired, setAlertFired]   = useState(false);

  const timerRef     = useRef(null);
  const recognRef    = useRef(null);
  const animFrameRef = useRef(null);

  // Animated wave bars
  const [barHeights, setBarHeights] = useState(Array(18).fill(20));

  useEffect(() => {
    if (!isOpen) { handleEndCall(); setCovertMode(false); }
  }, [isOpen]);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      animateWave();
    } else {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      setElapsed(0);
    }
    return () => { clearInterval(timerRef.current); cancelAnimationFrame(animFrameRef.current); };
  }, [callActive]);

  const animateWave = () => {
    const tick = () => {
      setBarHeights(prev => prev.map(() => 10 + Math.random() * (alertFired ? 80 : 40)));
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const startMic = () => {
    if (!speechConsent) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition unavailable. Use the test buttons below.'); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
      const words = userProfile?.configuredCodeWords || ['blue umbrella'];
      for (const w of words) {
        if (t.toLowerCase().includes(w)) {
          setCodeword(w); setAlertFired(true); setPitch(268); setBreathing(35); break;
        }
      }
    };
    r.start(); recognRef.current = r; setMicOn(true);
  };

  const stopMic = () => { recognRef.current?.stop(); recognRef.current = null; setMicOn(false); };

  const handleStartCall = () => {
    setCallActive(true); setAlertFired(false); setCodeword(null);
    setTranscript(''); setPitch(181); setBreathing(16);
    startMic();
  };

  const handleEndCall = () => { setCallActive(false); stopMic(); };

  const simCodeword = () => {
    const w = userProfile?.configuredCodeWords?.[0] || 'blue umbrella';
    setTranscript(`"I'm heading back now… remember that ${w}… yeah."`);
    setCodeword(w); setAlertFired(true); setPitch(264); setBreathing(34);
  };

  const simBreathing = () => {
    setTranscript('(heavy breathless gasps — unable to speak freely)');
    setCodeword(null); setAlertFired(true); setPitch(252); setBreathing(39);
  };

  if (!isOpen) return null;

  // ── Covert "lockscreen" mode ──
  if (covertMode) return (
    <div className="modal-overlay" style={{ zIndex:1200, background:'#000' }}>
      <div style={{ width:'100%', maxWidth:400, textAlign:'center', padding:40 }}>
        <div style={{ fontSize:'3rem', fontWeight:200, color:'#475569', marginBottom:8, fontFamily:'var(--font-mono)' }}>
          {fmt(elapsed)}
        </div>
        <div style={{ fontSize:'0.85rem', color:'#334155' }}>Simulated call in progress</div>
        {alertFired && <div style={{ marginTop:16, fontSize:'0.72rem', color:'#14b8a6', background:'rgba(20,184,166,0.08)', padding:'4px 14px', borderRadius:20, display:'inline-block' }}>
          Local test pattern only · no message sent
        </div>}
        <button onClick={() => setCovertMode(false)} style={{ marginTop:32, background:'none', border:'none', color:'#334155', fontSize:'0.76rem', cursor:'pointer' }}>
          tap to return to guardian view
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" style={{ zIndex:1200 }}>
      <div style={{
        background:'var(--bg-secondary)', border:'1px solid var(--border-highlight)',
        borderRadius:22, padding:'28px 30px',
        maxWidth:700, width:'100%',
        boxShadow:'0 24px 64px rgba(0,0,0,0.8), 0 0 28px rgba(45,212,191,0.15)',
        animation:'slideUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span className="glass-pill">Call Scenario Simulator</span>
              <span className="glass-pill" style={{ background:'rgba(244,63,94,0.08)', borderColor:'rgba(244,63,94,0.25)', color:'#f43f5e', fontSize:'0.7rem' }}>
                Test Mode
              </span>
            </div>
            <h3 style={{ fontSize:'1.15rem', margin:0 }}>Phone Call Scenario Test</h3>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setCovertMode(true)} className="btn btn-outline" style={{ padding:'7px 13px', fontSize:'0.78rem', gap:6 }}>
              <EyeOff size={14} /> Covert Screen
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ padding:'7px 13px', fontSize:'0.78rem' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        <p style={{ fontSize:'0.76rem', color:'var(--text-muted)', lineHeight:1.5, margin:'-8px 0 18px' }}>
          This is not connected to phone-call audio. Triggered pitch and breathing values are illustrative. No contact message is sent.
        </p>
        <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:'0.76rem', color:'var(--text-muted)', marginBottom:16 }}>
          <input type="checkbox" checked={speechConsent} onChange={event => setSpeechConsent(event.target.checked)} />
          Enable browser speech recognition for this test. Audio processing may follow your browser provider’s privacy policy.
        </label>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:20 }}>
          {/* Left: Phone call panel */}
          <div style={{
            background:'var(--bg-tertiary)', borderRadius:16,
            border:`1px solid ${alertFired ? 'rgba(244,63,94,0.4)' : 'var(--border-glass)'}`,
            padding:'22px 20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:14,
          }}>
            {/* Avatar */}
            <div style={{
              width:60, height:60, borderRadius:'50%',
              background: callActive ? 'linear-gradient(135deg,#14b8a6,#0891b2)' : 'var(--bg-secondary)',
              display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
              boxShadow: callActive ? '0 0 22px rgba(20,184,166,0.4)' : 'none',
              fontSize:'1.5rem',
            }}>
              {callActive ? <Phone size={26} /> : '📱'}
            </div>

            <div>
              <div style={{ fontWeight:700, fontSize:'0.95rem' }}>
                {callActive ? 'Night Commute Ride' : 'Simulate Phone Call'}
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>
                {callActive ? fmt(elapsed) : 'Click to begin passive monitoring'}
              </div>
            </div>

            {/* Sound wave */}
            {callActive && (
              <div style={{ display:'flex', alignItems:'center', gap:2, height:36, width:'100%', padding:'0 8px' }}>
                {barHeights.map((h, i) => (
                  <div key={i} className="wave-bar" style={{
                    flex:1, height:`${h}%`,
                    background: alertFired ? '#f43f5e' : 'var(--teal-400)',
                    transition:'height 0.1s',
                  }} />
                ))}
              </div>
            )}

            {!callActive
              ? <button onClick={handleStartCall} className="btn btn-primary" style={{ width:'100%', padding:'11px' }}>
                  <Phone size={17} /> Start Simulated Call
                </button>
              : <button onClick={handleEndCall} className="btn btn-danger" style={{ width:'100%', padding:'11px' }}>
                  <PhoneOff size={17} /> End Call
                </button>
            }

            {/* 1-click triggers */}
            {callActive && (
              <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Quick test triggers:</div>
                <button onClick={simCodeword} className="btn btn-outline" style={{ fontSize:'0.78rem', padding:'8px', borderColor:'var(--teal-400)', color:'var(--teal-300)' }}>
                  Say "{userProfile?.configuredCodeWords?.[0] || 'blue umbrella'}"
                </button>
                <button onClick={simBreathing} className="btn btn-outline" style={{ fontSize:'0.78rem', padding:'8px', borderColor:'#f43f5e', color:'#f43f5e' }}>
                  Simulate Hyperventilation / Gasps
                </button>
              </div>
            )}
          </div>

          {/* Right: Guardian HUD */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Status header */}
            <div style={{
              background: alertFired ? 'rgba(244,63,94,0.1)' : 'rgba(52,211,153,0.07)',
              border:`1px solid ${alertFired ? 'rgba(244,63,94,0.4)' : 'rgba(52,211,153,0.25)'}`,
              padding:'12px 16px', borderRadius:12,
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span style={{ fontWeight:700, fontSize:'0.88rem', color: alertFired ? '#f43f5e' : '#34d399' }}>
                {alertFired ? 'Potential Pattern · Test' : 'Scenario Ready'}
              </span>
              {micOn && <span style={{ fontSize:'0.7rem', color:'var(--teal-400)', display:'flex', alignItems:'center', gap:5 }}>
                <Radio size={12} /> Live STT
              </span>}
            </div>

            {/* 3 Sensor Metrics */}
            {[
              { label:'Vocal Pitch', value:`${pitch} Hz`, sub:'Baseline: 181 Hz', danger: pitch > 210 },
              { label:'Breathing Rate', value:`${breathing} bpm`, sub:'Normal: 12–19 bpm', danger: breathing > 24 },
              { label:'Codeword Sensor', value: codeword ? `"${codeword}" matched` : 'None spoken', sub:'Listening for configured phrases', danger: !!codeword },
            ].map(({ label, value, sub, danger }) => (
              <div key={label} style={{
                background:'var(--bg-tertiary)', border:`1px solid ${danger ? 'rgba(244,63,94,0.35)' : 'var(--border-glass)'}`,
                padding:'12px 16px', borderRadius:12,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
                  <span style={{ fontSize:'0.72rem', color: danger ? '#f43f5e' : '#34d399', fontWeight:700 }}>
                    {danger ? '⚠ Anomaly' : '✓ Normal'}
                  </span>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.05rem', fontWeight:700, color: danger ? '#f43f5e' : 'var(--text-primary)' }}>
                  {value}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{sub}</div>
              </div>
            ))}

            {/* Transcript */}
            <div style={{ background:'rgba(0,0,0,0.25)', border:'1px solid var(--border-glass)', padding:'10px 14px', borderRadius:10 }}>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Live Transcript</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-primary)', fontStyle:'italic' }}>
                {transcript || '(speak or press a trigger above…)'}
              </div>
            </div>

            {/* Silent Alert CTA */}
            {alertFired && (
              <button onClick={() => { onClose(); setTimeout(() => onOpenReceiver?.(), 100); }}
                className="btn btn-danger" style={{ width:'100%', padding:'11px', fontSize:'0.88rem' }}>
                <ShieldAlert size={16} />
                Review contact options →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
