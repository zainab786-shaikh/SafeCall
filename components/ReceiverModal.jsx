'use client';
import React, { useEffect, useState } from 'react';
import { ShieldAlert, MapPin, PhoneCall, CheckCircle2, X } from 'lucide-react';

export default function ReceiverModal({ isOpen, onClose, userProfile, event }) {
  const [acked, setAcked] = useState(false);
  useEffect(() => setAcked(false), [event?.id]);
  if (!isOpen) return null;

  const contact = userProfile?.trustedContacts?.find(item => item.isPrimary) || userProfile?.trustedContacts?.[0];
  const session = event?.evaluation?.sessionMetadata;
  const location = session?.coordinates;
  const timestamp = event?.timestamp ? new Date(event.timestamp).toLocaleString() : 'No saved event';
  const message = `SafeCall: ${userProfile?.name || 'A trusted person'} may need help. Please contact them. ${location ? `Location: https://maps.google.com/?q=${location.lat},${location.lng}` : 'Location was not shared.'}`;

  return (
    <div className="modal-overlay" style={{ zIndex:1300 }}>
      {/* Phone chassis */}
      <div style={{
        background:'#04070c', border:'3px solid #1a2535',
        borderRadius:42, padding:'14px 14px 24px',
        maxWidth:360, width:'100%',
        boxShadow:'0 30px 80px rgba(0,0,0,0.95), 0 0 44px rgba(244,63,94,0.35)',
        position:'relative',
      }}>
        {/* Speaker notch */}
        <div style={{ width:100, height:16, background:'#0a1420', borderRadius:'0 0 12px 12px', margin:'0 auto 14px' }} />

        {/* Status bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 8px 12px', fontSize:'0.68rem', color:'#475569', fontFamily:'var(--font-mono)' }}>
          <span>{new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', padding:'0 2px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Emergency alert banner */}
        <div style={{
          background:'linear-gradient(135deg, rgba(244,63,94,0.22), rgba(10,18,28,0.9))',
          border:'1.5px solid rgba(244,63,94,0.55)',
          borderRadius:18, padding:'16px 18px', marginBottom:14,
          animation:'pulseGlow 2s infinite',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, color:'#f43f5e', fontWeight:800, fontSize:'0.82rem', marginBottom:5 }}>
            <ShieldAlert size={16} /> POTENTIAL EVENT REVIEW
          </div>
          <p style={{ fontSize:'0.82rem', color:'#f1f5f9', lineHeight:1.45, margin:'0 0 6px' }}>
            {event ? <><strong>{userProfile?.name || 'Profile owner'}</strong> has a locally recorded potential safety event.</> : 'No analyzed safety event is available to review.'}
          </p>
          <div style={{ fontSize:'0.68rem', color:'#94a3b8' }}>
            {timestamp}{event?.level ? ` · Level ${event.level}` : ''}
          </div>
        </div>

        {/* Location is shown only when it was collected with permission. */}
        <div style={{ background:'#081018', borderRadius:14, overflow:'hidden', marginBottom:12, border:'1px solid #1e2d3d' }}>
          <div style={{ padding:'10px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.82rem', fontWeight:700, color:'#f1f5f9' }}><MapPin size={15} /> Location</div>
            <div style={{ fontSize:'0.76rem', color:'#94a3b8', marginTop:5 }}>
              {session?.currentLocationName || event?.locationStatus || 'Not shared or unavailable'}
            </div>
            {location && <a href={`https://maps.google.com/?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer" style={{ display:'inline-block', fontSize:'0.7rem', color:'#38bdf8', marginTop:5 }}>Open authorized location</a>}
          </div>
        </div>

        {/* Acoustic indicators */}
        <div style={{ background:'#081018', border:'1px solid #1e2d3d', borderRadius:14, padding:'12px 14px', marginBottom:14, fontSize:'0.76rem' }}>
          <div style={{ fontWeight:700, color:'#64748b', textTransform:'uppercase', fontSize:'0.62rem', letterSpacing:'0.07em', marginBottom:8 }}>Detected Acoustic Signals</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#64748b' }}>Codeword matched:</span>
              <strong style={{ color:'#f43f5e' }}>&quot;{session?.matchedCodeWord || 'Not detected'}&quot;</strong>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#64748b' }}>Breathing:</span>
              <strong style={{ color:'#fbbf24' }}>{Number.isFinite(session?.breathingRpm) ? `${session.breathingRpm} bpm` : 'Not measured'}</strong>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#64748b' }}>Vocal pitch delta:</span>
              <strong style={{ color:'#94a3b8' }}>{Number.isFinite(session?.pitchDeltaHz) ? `${session.pitchDeltaHz > 0 ? '+' : ''}${session.pitchDeltaHz} Hz` : 'Not measured'}</strong>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {contact?.phone && <a href={`tel:${contact.phone}`} className="btn btn-danger" style={{ width:'100%', padding:'12px', fontSize:'0.88rem', justifyContent:'center', textAlign:'center' }}>
            <PhoneCall size={15} /> Call {contact.name}
          </a>}
          {contact?.phone && <a href={`sms:${contact.phone}?body=${encodeURIComponent(message)}`} className="btn btn-outline" style={{ width:'100%', padding:'10px', fontSize:'0.82rem', justifyContent:'center', textAlign:'center' }}>
            <PhoneCall size={15} /> Open message to {contact.name}
          </a>}
          {!acked
            ? <button onClick={() => setAcked(true)} className="btn btn-outline" style={{ width:'100%', padding:'10px', fontSize:'0.82rem', borderColor:'#34d399', color:'#34d399' }}>
                <CheckCircle2 size={15} /> Mark Reviewed
              </button>
            : <div style={{ textAlign:'center', fontSize:'0.78rem', color:'#34d399', padding:'6px' }}>
                Marked reviewed on this device. No message was sent.
              </div>
          }
        </div>
      </div>
    </div>
  );
}
