'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  DEFAULT_USER_BASELINE, REAL_WORLD_SCENARIOS, evaluateSession,
} from '../lib/safecallEngine';
import { getSessions, getUserProfile } from '../lib/userStorage';
import CallSimulatorModal from '../components/CallSimulatorModal';
import ReceiverModal      from '../components/ReceiverModal';
import Link from 'next/link';
import {
  ShieldCheck, ShieldAlert, PhoneCall, Mic, MicOff,
  HelpCircle, CheckCircle2, Sparkles, ArrowRight, SlidersHorizontal,
} from 'lucide-react';

/* ── small primitives ── */
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontSize:'1.05rem', fontWeight:700, margin:0 }}>{children}</h2>
    {sub && <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:3 }}>{sub}</p>}
  </div>
);

const LevelColors = { 1:'#34d399', 2:'#22d3ee', 3:'#fbbf24', 4:'#f43f5e' };

/* ── Circular gauge ── */
function Gauge({ value, max, color, label, valLabel, subLabel }) {
  const pct = Math.min(1, value / max);
  const r = 34, circ = 2 * Math.PI * r;
  const dash = circ * pct, gap = circ - dash;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <div style={{ position:'relative', width:90, height:90 }}>
        <svg width={90} height={90} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
          <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            style={{ transition:'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex',
          flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'1rem', fontWeight:700, color, lineHeight:1 }}>{valLabel}</span>
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:1 }}>{subLabel}</div>
      </div>
    </div>
  );
}

/* ── Signal bar row ── */
function SignalRow({ label, pct, danger }) {
  const c = danger ? '#f43f5e' : 'var(--teal-400)';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.76rem', marginBottom:5 }}>
        <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{label}</span>
        <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color: danger ? '#f43f5e' : 'var(--text-muted)' }}>{pct}%</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{
          width: `${pct}%`,
          background: danger
            ? 'linear-gradient(90deg,#fbbf24,#f43f5e)'
            : 'linear-gradient(90deg,var(--teal-600),var(--teal-400))',
        }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [profile, setProfile]   = useState(DEFAULT_USER_BASELINE);
  const [scenario, setScenario] = useState(REAL_WORLD_SCENARIOS[1]); // workload (level 2 default)
  const [eval_,   setEval]      = useState(null);

  const [callSim,     setCallSim]     = useState(false);
  const [receiver,    setReceiver]    = useState(false);
  const [latestSession, setLatestSession] = useState(null);
  const [reviewEvent, setReviewEvent] = useState(null);
  const [micLive,     setMicLive]     = useState(false);
  const [liveText,    setLiveText]    = useState('');

  const recognRef = useRef(null);

  /* First-load: load saved profile */
  useEffect(() => {
    const p = getUserProfile();
    setProfile(p);
    const latest = getSessions()[0] || null;
    setLatestSession(latest);
    if (latest?.evaluation?.sessionMetadata) {
      setScenario({
        ...REAL_WORLD_SCENARIOS[1],
        title: `Latest analysis · ${latest.audioName || latest.sessionType}`,
        sessionData: latest.evaluation.sessionMetadata,
      });
    }
  }, []);

  /* Re-evaluate whenever scenario or profile changes */
  useEffect(() => {
    setEval(evaluateSession(scenario.sessionData, profile));
  }, [scenario, profile]);

  const level   = eval_?.level ?? 1;
  const lvlColor = LevelColors[level] ?? '#34d399';
  const isAlarm  = level === 4;

  /* Live mic */
  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Speech recognition not supported. Use scenario buttons below.');
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = e => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setLiveText(t);
      const words = profile.configuredCodeWords || ['blue umbrella'];
      for (const w of words) {
        if (t.toLowerCase().includes(w)) {
          setScenario({
            ...REAL_WORLD_SCENARIOS[0],
            sessionData: {
              ...REAL_WORLD_SCENARIOS[0].sessionData,
              codeWordDetected: true,
              matchedCodeWord: w,
              transcriptSnippet: t,
            },
          });
          break;
        }
      }
    };
    r.start(); recognRef.current = r; setMicLive(true);
  };

  const stopMic = () => { recognRef.current?.stop(); recognRef.current = null; setMicLive(false); setLiveText(''); };

  if (!eval_) return null;

  /* Signal rows for fusion matrix */
  const sigRows = [
    { label:'Vocal Pitch & Stress',      pct: Math.round(eval_.signals.voiceDeviation.value   * 100), danger: eval_.signals.voiceDeviation.value   > 0.55 },
    { label:'Breathing Rate & Gasps',    pct: Math.round(eval_.signals.breathingAnomaly.value  * 100), danger: eval_.signals.breathingAnomaly.value  > 0.55 },
    { label:'Silence & Pauses',          pct: Math.round(eval_.signals.silenceAnomaly.value    * 100), danger: eval_.signals.silenceAnomaly.value    > 0.55 },
    { label:'Covert Code-Word Trigger',  pct: Math.round(eval_.signals.keywordCodeWord.value   * 100), danger: eval_.signals.keywordCodeWord.value   > 0.55 },
    { label:'Location Geofence',         pct: Math.round(eval_.signals.locationAnomaly.value   * 100), danger: eval_.signals.locationAnomaly.value   > 0.55 },
    { label:'Routine & Schedule',        pct: Math.round(eval_.signals.routineAnomaly.value    * 100), danger: eval_.signals.routineAnomaly.value    > 0.55 },
    { label:'Vocal Micro-Tremor',        pct: Math.round(eval_.signals.microTremorAnomaly.value* 100), danger: eval_.signals.microTremorAnomaly.value > 0.55 },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* ── Modals ── */}
      <CallSimulatorModal isOpen={callSim}      onClose={() => setCallSim(false)}
              userProfile={profile} onOpenReceiver={() => { setReviewEvent(null); setReceiver(true); }} />
      <ReceiverModal      isOpen={receiver}     onClose={() => setReceiver(false)} userProfile={profile} event={reviewEvent} />

      {/* ── STATUS BANNER ── */}
      <div className="glass-panel animate-slide-up" style={{
        padding:'26px 28px',
        border: `1.5px solid ${isAlarm ? 'rgba(244,63,94,0.5)' : 'var(--border-highlight)'}`,
        background: isAlarm
          ? 'linear-gradient(135deg,rgba(244,63,94,0.12) 0%,rgba(10,18,28,0.95) 100%)'
          : 'linear-gradient(135deg,rgba(12,24,36,0.95) 0%,rgba(15,28,42,0.88) 100%)',
        boxShadow: isAlarm ? 'var(--shadow-danger)' : 'var(--shadow-teal)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
          {/* Left: status text */}
          <div style={{ flex:1, minWidth:260 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span className={`level-badge level-${level}`}>
                {isAlarm ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                {eval_.levelTitle}
              </span>
              <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                User: {profile.name}
              </span>
            </div>

            <h1 style={{ fontSize:'1.8rem', marginBottom:8, lineHeight:1.2 }}>
              {isAlarm
                ? <span style={{ color:'#f43f5e' }}>Potential Safety Event</span>
                : level === 2
                  ? <span style={{ color:'var(--cyan-400)' }}>Workload Stress Noticed</span>
                  : level === 3
                    ? <span style={{ color:'#fbbf24' }}>Elevated Concern</span>
                    : <span>Everything is <span className="gradient-text">Safe & Normal</span></span>
              }
            </h1>

            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:1.6, maxWidth:660, marginBottom:0 }}>
              {eval_.actionResponse}
            </p>
          </div>

          {/* Right: CTA buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:210 }}>
            <button onClick={() => setCallSim(true)} className="btn btn-primary" style={{ padding:'11px 18px' }}>
              <PhoneCall size={17} /> Simulate Phone Call
            </button>
            {isAlarm
              ? <button onClick={() => { setReviewEvent(latestSession?.level === 4 ? latestSession : null); setReceiver(true); }} className="btn btn-danger" style={{ padding:'10px 18px' }}>
                  <ShieldAlert size={16} /> Review Potential Event
                </button>
              : <Link href="/about" className="btn btn-outline" style={{ padding:'10px 18px' }}>
                  <HelpCircle size={16} /> How SafeCall Works
                </Link>
            }
            <Link href="/inputs" className="btn btn-outline" style={{ padding:'9px 18px', borderColor:'var(--teal-400)', color:'var(--teal-300)', textAlign:'center', justifyContent:'center' }}>
              <SlidersHorizontal size={100} /> System Inputs (Doc Sec 3)
            </Link>
            <Link href="/inputs" style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'0.73rem', cursor:'pointer', textAlign:'center', padding:'2px 0', textDecoration:'none' }}>
              Edit My Profile &amp; Code-Words →
            </Link>
          </div>
          {/* ── ROW 2: 3 Gauges + AI Result ── */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'stretch' }}>

        {/* 3 circular gauges */}
        <div className="glass-panel" style={{ padding:'22px 26px', display:'flex', gap:28, alignItems:'center', flexShrink:0 }}>
          <Gauge
            value={Number.isFinite(scenario.sessionData.pitchHz) ? scenario.sessionData.pitchHz : 0}
            max={280}
            color={Number.isFinite(scenario.sessionData.pitchHz) && scenario.sessionData.pitchHz > 210 ? '#f43f5e' : 'var(--teal-400)'}
            label="Vocal Stress"
            valLabel={Number.isFinite(scenario.sessionData.pitchHz) ? `${scenario.sessionData.pitchHz}Hz` : '—'}
            subLabel={Number.isFinite(scenario.sessionData.pitchHz) ? `Baseline: ${profile.pitchRange[0]}–${profile.pitchRange[1]} Hz` : 'Pitch not measured'}
          />
          <div style={{ width:1, height:80, background:'var(--border-glass)' }} />
          <Gauge
            value={Number.isFinite(scenario.sessionData.breathingRpm) ? scenario.sessionData.breathingRpm : 0}
            max={45}
            color={Number.isFinite(scenario.sessionData.breathingRpm) && scenario.sessionData.breathingRpm > 24 ? '#f43f5e' : 'var(--cyan-400)'}
            label="Breathing Rate"
            valLabel={Number.isFinite(scenario.sessionData.breathingRpm) ? `${scenario.sessionData.breathingRpm}` : '—'}
            subLabel={Number.isFinite(scenario.sessionData.breathingRpm) ? 'bpm · Baseline: 12–19' : 'Not measured'}
          />
          <div style={{ width:1, height:80, background:'var(--border-glass)' }} />
          <Gauge
            value={scenario.sessionData.codeWordDetected ? 100 : 0}
            max={100}
            color={scenario.sessionData.codeWordDetected ? '#f43f5e' : '#34d399'}
            label="Code-Word"
            valLabel={scenario.sessionData.codeWordDetected ? '!!!' : 'Clear'}
            subLabel={scenario.sessionData.codeWordDetected ? `"${scenario.sessionData.matchedCodeWord}"` : 'None spoken'}
          />
        </div>

        {/* Signal Fusion Result */}
        <div className="glass-panel" style={{ padding:'22px 26px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
            <div>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
                Signal Fusion Score
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'2.2rem', fontWeight:800, color:lvlColor, lineHeight:1 }}>
                  {eval_.confidence}%
                </span>
                <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>concern index</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', textAlign:'right', marginBottom:4 }}>Engine</div>
              <span className={`level-badge level-${level}`}>{eval_.engineSource}</span>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {sigRows.map(r => <SignalRow key={r.label} {...r} />)}
          </div>
        </div>
      </div>
        </div>
      </div>

     



        

      

    </div>
  );
}
