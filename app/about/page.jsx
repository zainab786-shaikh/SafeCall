'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Workflow, 
  Scale, 
  Layers, 
  Lock, 
  HeartHandshake, 
  CheckCircle2,
  FileText,
  Code2
} from 'lucide-react';

export default function AboutArchitecturePage() {
  const signalWeights = [
    { name: 'Voice Deviation', weight: '18%', desc: 'Pitch and energy deviation from the saved personal baseline' },
    { name: 'Breathing Anomaly', weight: '18%', desc: 'Available only in test scenarios; not extracted from browser recordings' },
    { name: 'Silence / Pause Anomaly', weight: '14%', desc: 'Silence ratio and longest detected low-energy interval' },
    { name: 'Configured Code Word', weight: '30%', desc: 'Matched against an optional transcript or supported microphone transcription' },
    { name: 'Routine Anomaly', weight: '8%', desc: 'Recording time within the saved sleep window; supporting evidence only' },
    { name: 'Location Anomaly', weight: '7%', desc: 'One-time geofence comparison only after a Level 4 candidate and saved consent' },
    { name: 'Vocal Micro-Tremor', weight: '5%', desc: 'Not measured by the current browser audio analyzer' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--teal-400)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
          SafeCall <span className="gradient-text">System Architecture</span>
        </h1>
        

        {/* USP Callout */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(20, 184, 166, 0.12)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          fontStyle: 'italic',
        }}>
          &ldquo;Not every stressed voice needs an emergency alert — but not every emergency comes with a cry for help.&rdquo;
        </div>
      </div>

      {/* Two-Engine Architecture Section */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Layers size={22} color="var(--teal-400)" />
          <h2 style={{ fontSize: '1.4rem' }}>The Two-Engine Architecture</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
          A core innovation in SafeCall is the intentional separation between daily cognitive stress and immediate physical danger.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', fontWeight: 700, marginBottom: '10px' }}>
              <HeartHandshake size={20} />
              <span>Branch A: Wellbeing Engine</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              Operates over <strong>days or weeks</strong>. Discovers recurring communication-pattern shifts associated with work, study, or cognitive fatigue.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>&bull; <strong>Example:</strong> Repeated work calls showing pitch strain and prolonged pauses.</li>
              <li>&bull; <strong>Output:</strong> Private longitudinal trend &amp; reflection.</li>
              <li>&bull; <strong>Safety Protocol:</strong> <em>Zero emergency contacts alerted.</em></li>
            </ul>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(244, 63, 94, 0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 700, marginBottom: '10px' }}>
              <ShieldCheck size={20} />
              <span>Branch B: Safety Engine</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              Operates over <strong>seconds and minutes</strong>. Evaluates multi-signal combinations of acute safety indicators.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>&bull; <strong>Example:</strong> Sudden pitch deviation + prolonged silence + configured code word + 3 AM outside safe location.</li>
              <li>&bull; <strong>Output:</strong> Level 4 Potential Safety Event.</li>
              <li>&bull; <strong>Current response:</strong> Local event record with user-initiated call or message actions. Automatic dispatch is not implemented.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signal Fusion Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Cpu size={22} color="var(--teal-400)" />
          <h2 style={{ fontSize: '1.4rem' }}>Signal Fusion Matrix &amp; Prototype Weights</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
          These are prototype weights, not validated risk estimates. A single pitch or time anomaly is supporting evidence, never proof of danger.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {signalWeights.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.name}</span>
                <span className="mono" style={{ color: 'var(--teal-400)', fontWeight: 800 }}>{item.weight}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Categorization Matrix (Section 10) */}
      <div className="glass-panel" style={{ padding: '28px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Workflow size={22} color="var(--teal-400)" />
          <h2 style={{ fontSize: '1.4rem' }}>4-Level Decision Classification Matrix</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 18px' }}>Category</th>
                <th style={{ padding: '14px 18px' }}>Meaning</th>
                <th style={{ padding: '14px 18px' }}>Engine Source</th>
                <th style={{ padding: '14px 18px' }}>System Response</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '16px 18px' }}>
                  <span className="level-badge level-1">LEVEL 1 – Normal</span>
                </td>
                <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>Low deviation and no meaningful safety indicators.</td>
                <td style={{ padding: '16px 18px' }}>Baseline Engine</td>
                <td style={{ padding: '16px 18px', color: '#34d399', fontWeight: 600 }}>No action. Routine log.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '16px 18px' }}>
                  <span className="level-badge level-2">LEVEL 2 – Stress / Workload</span>
                </td>
                <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>Persistent communication deviation in contextual pattern without safety indicators.</td>
                <td style={{ padding: '16px 18px' }}>Wellbeing Engine</td>
                <td style={{ padding: '16px 18px', color: '#22d3ee', fontWeight: 600 }}>Private wellbeing insight/trend.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '16px 18px' }}>
                  <span className="level-badge level-3">LEVEL 3 – Elevated Concern</span>
                </td>
                <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>Multiple unusual signals (e.g. 3 AM + pitch jump) but insufficient evidence for danger.</td>
                <td style={{ padding: '16px 18px' }}>Safety Engine (Standby)</td>
                <td style={{ padding: '16px 18px', color: '#fbbf24', fontWeight: 600 }}>Monitor status. No emergency dispatch.</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 18px' }}>
                  <span className="level-badge level-4">LEVEL 4 – Safety Event</span>
                </td>
                <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>Strong combination of configured code words, high deviation, or location anomaly.</td>
                <td style={{ padding: '16px 18px' }}>Safety Engine (Active)</td>
                <td style={{ padding: '16px 18px', color: '#f43f5e', fontWeight: 600 }}>Local event review; no automatic contact dispatch.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsible AI Guidelines (Section 16) */}
      <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Scale size={22} color="var(--teal-400)" />
          <h2 style={{ fontSize: '1.4rem' }}>Responsible AI Design Guarantees (Section 16)</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '6px', color: 'var(--teal-300)' }}>1. Non-Diagnostic</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              SafeCall makes zero claims to diagnose medical anxiety, clinical depression, or psychological trauma. Terms used are strictly "pattern", "anomaly", and "potential safety event".
            </p>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '6px', color: 'var(--teal-300)' }}>2. Feature-First Privacy</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Raw audio is analyzed in memory and is not saved. Derived features, profile data, and authorized Level 4 coordinates are stored in browser localStorage, which is not encrypted by this prototype.
            </p>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '6px', color: 'var(--teal-300)' }}>3. Explicit Consent</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Location lookup is off by default. When enabled, the browser requests a one-time position only after an analysis reaches Level 4; any coordinates remain on this device.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
