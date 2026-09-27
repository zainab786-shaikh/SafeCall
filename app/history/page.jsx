'use client';

import React, { useEffect, useState } from 'react';
import { 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  MapPin,
  Volume2,
  Trash2
} from 'lucide-react';
import { clearSessions, getSessions } from '../../lib/userStorage';

export default function HistoryPage() {
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState([]);

  useEffect(() => setSessions(getSessions()), []);

  const historyRows = sessions.map(session => {
    const pitchHz = session.pitchHz;
    const pitchDelta = Number.isFinite(session.pitchDeltaHz)
      ? `${session.pitchDeltaHz > 0 ? '+' : ''}${session.pitchDeltaHz} Hz from baseline`
      : Number.isFinite(pitchHz) ? `${pitchHz} Hz` : 'Not detected';
    return {
      ...session,
      level: session.level || session.evaluation?.level || 1,
      levelTitle: session.levelTitle || session.evaluation?.levelTitle || 'Session analyzed',
      sessionType: session.audioName
        ? `${session.sessionType || 'Audio session'} · ${session.audioName}`
        : session.sessionType || 'Audio session',
      location: session.currentLocationName || session.locationStatus || 'Not checked',
      pitchDelta,
      silencePct: Number.isFinite(session.silenceRatioPct) ? `${session.silenceRatioPct}%` : 'Not measured',
      triggeredCodeWord: session.matchedCodeWord || 'None',
      response: session.notificationStatus || 'Analysis saved locally; no contact was notified.',
      status: session.level === 4 ? 'Follow-up needed' : 'Saved locally',
    };
  });

  const filtered = historyRows.filter((item) => {
    if (filterLevel !== 'all' && item.level.toString() !== filterLevel) return false;
    if (searchQuery && !item.sessionType.toLowerCase().includes(searchQuery.toLowerCase()) && !item.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const exportCsv = () => {
    const columns = ['timestamp', 'levelTitle', 'sessionType', 'location', 'pitchDelta', 'silencePct', 'triggeredCodeWord', 'response'];
    const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [columns.join(','), ...filtered.map(item => columns.map(column => escape(item[column])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'safecall-session-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (!window.confirm('Delete all locally stored analysis sessions from this browser?')) return;
    clearSessions();
    setSessions([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="glass-pill" style={{ color: 'var(--teal-300)', borderColor: 'var(--teal-400)' }}>
                <History size={14} /> Session &amp; Incident Audit Logs
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              Historical <span className="gradient-text">Analysis Records</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '780px', fontSize: '0.95rem' }}>
              Local record of analyzed audio features, prototype classifications, and potential-event reviews. Contacts are not notified automatically.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportCsv} className="btn btn-outline" disabled={!filtered.length}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button onClick={clearHistory} className="btn btn-outline" disabled={!sessions.length} aria-label="Clear local history" title="Clear local history">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-glass)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', '1', '2', '3', '4'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className="btn btn-outline"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  background: filterLevel === lvl ? 'var(--bg-tertiary)' : 'transparent',
                  borderColor: filterLevel === lvl ? 'var(--teal-400)' : 'var(--border-glass)',
                  color: filterLevel === lvl ? 'var(--teal-300)' : 'var(--text-secondary)'
                }}
              >
                {lvl === 'all' ? 'All Events' : `Level ${lvl}`}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search session or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-glass)',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 20px' }}>Event ID &amp; Time</th>
              <th style={{ padding: '16px 20px' }}>Classification</th>
              <th style={{ padding: '16px 20px' }}>Session / Location</th>
              <th style={{ padding: '16px 20px' }}>Acoustic Fingerprint</th>
              <th style={{ padding: '16px 20px' }}>Code Word</th>
              <th style={{ padding: '16px 20px' }}>System Response</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length && (
              <tr>
                <td colSpan="6" style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {sessions.length ? 'No sessions match these filters.' : 'No analyzed sessions saved on this browser yet.'}
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid var(--border-glass)',
                  transition: 'background 0.2s',
                }}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.timestamp}</div>
                </td>

                <td style={{ padding: '16px 20px' }}>
                  <span className={`level-badge level-${item.level}`}>
                    Level {item.level}
                  </span>
                </td>

                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600 }}>{item.sessionType}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={12} /> {item.location}
                  </div>
                </td>

                <td style={{ padding: '16px 20px' }}>
                  <div className="mono" style={{ fontSize: '0.82rem' }}>Pitch: {item.pitchDelta}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Silence: {item.silencePct}</div>
                </td>

                <td style={{ padding: '16px 20px' }}>
                  {item.triggeredCodeWord !== 'None' ? (
                    <span style={{ background: '#f43f5e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      "{item.triggeredCodeWord}"
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>

                <td style={{ padding: '16px 20px', maxWidth: '240px' }}>
                  <div style={{ fontSize: '0.82rem', color: item.level === 4 ? '#f43f5e' : 'var(--text-secondary)' }}>
                    {item.response}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
