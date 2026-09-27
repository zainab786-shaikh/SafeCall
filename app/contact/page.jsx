'use client';

import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  Send, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  LifeBuoy, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function ContactSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Feedback / Hackathon Inquiries', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: 'Feedback / Hackathon Inquiries', message: '' });
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--teal-400)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="glass-pill" style={{ color: 'var(--teal-300)', borderColor: 'var(--teal-400)' }}>
            <PhoneCall size={14} /> Contact, Emergency &amp; Support Hub
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Support, Feedback &amp; <span className="gradient-text">Emergency Services</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '780px', fontSize: '0.95rem' }}>
          SafeCall is designed as a companion safety system. In any situation of immediate physical danger, always call local emergency response authorities directly.
        </p>
      </div>

      {/* Primary Emergency Contact - Priya Gupta */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        borderLeft: '4px solid #34d399',
        background: 'linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(15,23,42,0.6) 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#34d399'
          }}>
            <PhoneCall size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Designated Primary Emergency Contact
              </span>
              <span className="glass-pill" style={{ fontSize: '0.7rem', color: 'var(--teal-300)', borderColor: 'var(--teal-400)' }}>
                Registered
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', margin: '4px 0 2px', fontWeight: 800 }}>
              Priya Gupta
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Primary responder for user <strong style={{ color: 'var(--text-primary)' }}>Zainab Shaikh</strong> &bull; Direct: <span className="mono" style={{ color: '#34d399', fontWeight: 700 }}>+91 93249 57234</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="tel:+919324957234" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            <PhoneCall size={18} />
            <span>Call Priya Gupta (+91 93249 57234)</span>
          </a>
        </div>
      </div>

      {/* Emergency Crisis Callout Banner */}
      <div style={{
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.4)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <ShieldAlert size={36} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#f43f5e', marginBottom: '6px' }}>
              Immediate Emergency Services Direct Access
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              If you or someone around you is in imminent danger, do not wait for automated AI analysis.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="tel:911" className="btn btn-danger" style={{ padding: '10px 20px' }}>
            <PhoneCall size={16} />
            <span>Call 911 (US / Canada)</span>
          </a>
          <a href="tel:112" className="btn btn-danger" style={{ padding: '10px 20px', background: '#e11d48' }}>
            <PhoneCall size={16} />
            <span>Call 112 (India National Emergency)</span>
          </a>
        </div>
      </div>

      {/* Grid: Contact Form & FAQ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        
        {/* Contact & Feedback Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <MessageSquare size={20} color="var(--teal-400)" />
            <h3 style={{ fontSize: '1.2rem' }}>Send Feedback or Inquire</h3>
          </div>

          {submitted ? (
            <div style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid #34d399',
              color: '#34d399',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Message Received!</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Thank you for your feedback on the SafeCall prototype. The hackathon team will review your message.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Topic</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="Feedback / Hackathon Inquiries">Feedback / Hackathon Inquiries</option>
                  <option value="Signal Fusion Engine Testing">Signal Fusion Engine Testing</option>
                  <option value="Hardware / Telephony Integration">Hardware / Telephony Integration</option>
                  <option value="Privacy & Responsible AI">Privacy &amp; Responsible AI</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your thoughts on the SafeCall architecture or implementation..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                <Send size={16} />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

        {/* Quick FAQ / Prototype Notes */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={20} color="var(--teal-400)" />
            <h3 style={{ fontSize: '1.2rem' }}>Frequently Asked Questions</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--teal-300)' }}>
                Does SafeCall record all my phone calls?
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                No. Following Section 16 of the architecture doc, derived acoustic features (pitch, pause duration, silence ratio) are computed on-device or in volatile memory, avoiding mass raw audio surveillance.
              </p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--teal-300)' }}>
                Why does an excited friendly call not trigger an alert?
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Even though pitch rises during excitement, there is no prolonged silence, no distress code-word, and the location is recognized. The Signal Fusion Matrix scores remain below danger thresholds.
              </p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--teal-300)' }}>
                How do I calibrate my personal voice baseline?
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Navigate to the Live Studio tab and click "Calibrate Baseline". Speak normally for 5 seconds to establish your unique frequency band and cadence.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
