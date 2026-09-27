'use client';

import React, { useEffect, useState } from 'react';
import { 
  DEFAULT_USER_BASELINE 
} from '../../lib/safecallEngine';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Key, 
  Clock, 
  Sliders, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Lock,
  AlertTriangle
} from 'lucide-react';
import { getUserProfile, saveUserProfile } from '../../lib/userStorage';

const fieldStyle = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-glass)',
  padding: '8px 10px',
  borderRadius: '6px',
  color: 'var(--text-primary)',
  fontSize: '0.84rem',
};

export default function SafetySettingsPage() {
  const [contacts, setContacts] = useState(DEFAULT_USER_BASELINE.trustedContacts);
  const [locations, setLocations] = useState(DEFAULT_USER_BASELINE.safeLocations);
  const [codeWords, setCodeWords] = useState(DEFAULT_USER_BASELINE.configuredCodeWords);
  const [newCodeWord, setNewCodeWord] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationLat, setNewLocationLat] = useState('');
  const [newLocationLng, setNewLocationLng] = useState('');
  const [newLocationRadius, setNewLocationRadius] = useState('300');
  const [locationPermission, setLocationPermission] = useState(DEFAULT_USER_BASELINE.locationPermissionGranted);
  const [sensitivity, setSensitivity] = useState(DEFAULT_USER_BASELINE.alertSensitivity);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    setContacts(profile.trustedContacts || []);
    setLocations(profile.safeLocations || []);
    setCodeWords(profile.configuredCodeWords || []);
    setLocationPermission(Boolean(profile.locationPermissionGranted));
    setSensitivity(profile.alertSensitivity || DEFAULT_USER_BASELINE.alertSensitivity);
  }, []);

  const handleAddCodeWord = (e) => {
    e.preventDefault();
    if (!newCodeWord.trim()) return;
    setCodeWords([...codeWords, newCodeWord.trim().toLowerCase()]);
    setNewCodeWord('');
  };

  const handleRemoveCodeWord = (word) => {
    setCodeWords(codeWords.filter(w => w !== word));
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts([
      ...contacts,
      {
        id: `c_${Date.now()}`,
        name: newContactName.trim(),
        relation: newContactRel.trim() || 'Trusted Contact',
        phone: newContactPhone.trim(),
        isPrimary: false,
      }
    ]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRel('');
  };

  const handleRemoveContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleContactChange = (id, field, value) => {
    setContacts(current => current.map(contact => contact.id === id ? { ...contact, [field]: value } : contact));
  };

  const setPrimaryContact = (id) => {
    setContacts(current => current.map(contact => ({ ...contact, isPrimary: contact.id === id })));
  };

  const handleAddLocation = (event) => {
    event.preventDefault();
    const lat = Number(newLocationLat);
    const lng = Number(newLocationLng);
    const radiusMeters = Number(newLocationRadius);
    if (!newLocationName.trim() || !Number.isFinite(lat) || Math.abs(lat) > 90
      || !Number.isFinite(lng) || Math.abs(lng) > 180 || !Number.isFinite(radiusMeters) || radiusMeters < 50) return;
    setLocations(current => [...current, {
      name: newLocationName.trim(),
      coords: { lat, lng },
      radiusMeters,
    }]);
    setNewLocationName('');
    setNewLocationLat('');
    setNewLocationLng('');
    setNewLocationRadius('300');
  };

  const handleSave = () => {
    const profile = getUserProfile();
    saveUserProfile({
      ...profile,
      trustedContacts: contacts,
      safeLocations: locations,
      configuredCodeWords: codeWords,
      locationPermissionGranted: locationPermission,
      alertSensitivity: sensitivity,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--teal-400)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="glass-pill" style={{ color: 'var(--teal-300)', borderColor: 'var(--teal-400)' }}>
                <ShieldCheck size={14} /> Engine B: Safety Profile &amp; Preferences
              </span>
              <span className="glass-pill" style={{ fontSize: '0.75rem' }}>
                <Lock size={12} /> Stored in This Browser
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              Safety Parameters &amp; <span className="gradient-text">Geofence Setup</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '780px', fontSize: '0.95rem' }}>
              Configure trusted contacts, safe location zones, and secret distress code-words according to the SafeCall architecture specification.
            </p>
          </div>

          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <Save size={18} />
            <span>{savedSuccess ? 'Changes Saved!' : 'Save Safety Profile'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid #34d399',
          color: '#34d399',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={20} />
          <span>Safety profile, authorized contacts, and secret code-words updated successfully!</span>
        </div>
      )}

      {/* Grid: Contacts & Secret Code Words */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Trusted Contacts Panel */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Users size={20} color="var(--teal-400)" />
            <h3 style={{ fontSize: '1.2rem' }}>Trusted Emergency Contacts</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Contact details stay in this browser. A potential event never sends a message automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {contacts.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input aria-label={`Contact ${c.id} name`} value={c.name} onChange={event => handleContactChange(c.id, 'name', event.target.value)} style={{ ...fieldStyle, maxWidth: 210, fontWeight: 700 }} />
                    {c.isPrimary && (
                      <span style={{
                        background: 'rgba(45, 212, 191, 0.15)',
                        color: 'var(--teal-400)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Primary
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 7 }}>
                    <input aria-label={`Contact ${c.id} relationship`} value={c.relation} onChange={event => handleContactChange(c.id, 'relation', event.target.value)} style={fieldStyle} />
                    <input aria-label={`Contact ${c.id} phone`} type="tel" value={c.phone} onChange={event => handleContactChange(c.id, 'phone', event.target.value)} style={fieldStyle} />
                  </div>
                  {!c.isPrimary && <button type="button" onClick={() => setPrimaryContact(c.id)} style={{ background: 'none', border: 'none', color: 'var(--teal-300)', cursor: 'pointer', padding: '4px 0', fontSize: '0.73rem' }}>Set as primary</button>}
                </div>

                {!c.isPrimary && (
                  <button
                    onClick={() => handleRemoveContact(c.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Contact Form */}
          <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Add Contact:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newContactRel}
                onChange={(e) => setNewContactRel(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="tel"
                placeholder="Phone Number (e.g. +1 555-0192)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
              <button type="submit" className="btn btn-outline" style={{ padding: '10px 18px' }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </form>
        </div>

        {/* Secret Code Words & Trigger Keywords */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Key size={20} color="var(--teal-400)" />
            <h3 style={{ fontSize: '1.2rem' }}>Configured Secret Code-Words</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            Phrases that sound ordinary in conversation (e.g. <em>"blue umbrella"</em> or <em>"weather is cold"</em>) that act as immediate safety indicators when uttered during a call.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {codeWords.map((word) => (
              <span
                key={word}
                style={{
                  background: 'rgba(20, 184, 166, 0.12)',
                  border: '1px solid rgba(45, 212, 191, 0.35)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-primary)'
                }}
              >
                <span>&ldquo;{word}&rdquo;</span>
                <button
                  onClick={() => handleRemoveCodeWord(word)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCodeWord} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g. 'check the ledger', 'blue umbrella'"
              value={newCodeWord}
              onChange={(e) => setNewCodeWord(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-glass)',
                padding: '10px 14px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            <button type="submit" className="btn btn-outline">
              <Plus size={16} /> Add Phrase
            </button>
          </form>

          {/* Privacy Notice Box */}
          <div style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            <strong>Section 16 Responsible Design:</strong> Raw audio is processed locally or in memory to extract phoneme/STT matches and discarded. Derived acoustic feature vectors are prioritized over persistent voice recordings.
          </div>
        </div>

      </div>

      {/* Geofence & Routine Configuration */}
      <div className="glass-panel" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <MapPin size={20} color="var(--teal-400)" />
          <h3 style={{ fontSize: '1.2rem' }}>Safe Geofence Locations &amp; Routine Hours</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {locations.map((loc, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{loc.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Radius: {loc.radiusMeters}m geofence
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--teal-400)' }}>
                  {loc.coords.lat}, {loc.coords.lng}
                </div>
                <button type="button" onClick={() => setLocations(current => current.filter((_, locationIndex) => locationIndex !== idx))} aria-label={`Remove ${loc.name}`} title={`Remove ${loc.name}`} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddLocation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          <input aria-label="Safe location name" placeholder="Location name" value={newLocationName} onChange={event => setNewLocationName(event.target.value)} required />
          <input aria-label="Latitude" type="number" step="any" min="-90" max="90" placeholder="Latitude" value={newLocationLat} onChange={event => setNewLocationLat(event.target.value)} required />
          <input aria-label="Longitude" type="number" step="any" min="-180" max="180" placeholder="Longitude" value={newLocationLng} onChange={event => setNewLocationLng(event.target.value)} required />
          <input aria-label="Geofence radius in meters" type="number" min="50" step="50" value={newLocationRadius} onChange={event => setNewLocationRadius(event.target.value)} required />
          <button type="submit" className="btn btn-outline"><Plus size={16} /> Add Safe Location</button>
        </form>

        {/* Location Permission & Sensitivity Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Explicit Geolocation Permission</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Attach live coordinates only when Level 4 threshold is crossed.
              </div>
            </div>
            <input
              type="checkbox"
              checked={locationPermission}
              onChange={(e) => setLocationPermission(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--teal-500)', cursor: 'pointer' }}
            />
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Emergency Threshold Sensitivity</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--teal-400)' }}>{sensitivity}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="85"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{ accentColor: 'var(--teal-500)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Current: Triggers Level 4 when Signal Fusion score exceeds {(sensitivity / 100).toFixed(2)}.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
