'use client';

import React, { useEffect, useState } from 'react';
import { 
  HeartHandshake, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Smile, 
  Meh, 
  Frown, 
  Coffee, 
  BrainCircuit, 
  Lock, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getSessions } from '../../lib/userStorage';

export default function WellbeingPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const dayCount = selectedTimeframe === '14d' ? 14 : 7;
  const today = new Date();
  const rangeStart = new Date(today);
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setDate(rangeStart.getDate() - dayCount + 1);
  const periodSessions = sessions.filter(session => new Date(session.timestamp) >= rangeStart);
  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (dayCount - index - 1));
    const dateKey = date.toLocaleDateString();
    const daily = sessions.filter(session => new Date(session.timestamp).toLocaleDateString() === dateKey);
    const pitches = daily.map(session => session.pitchHz).filter(Number.isFinite);
    const stressValues = daily.map(session => Math.min(100, Math.round((session.evaluation?.fusionScore || 0) * 100)));
    return {
      day: date.toLocaleDateString(undefined, { weekday: dayCount > 7 ? 'narrow' : 'short' }),
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      calls: daily.length,
      avgPitch: pitches.length ? Math.round(pitches.reduce((sum, pitch) => sum + pitch, 0) / pitches.length) : null,
      stressIndex: stressValues.length ? Math.round(stressValues.reduce((sum, value) => sum + value, 0) / stressValues.length) : 0,
    };
  });
  const evaluatedScores = periodSessions.map(session => session.evaluation?.fusionScore).filter(Number.isFinite);
  const weeklyStressIndex = evaluatedScores.length
    ? Math.round(evaluatedScores.reduce((sum, score) => sum + score, 0) / evaluatedScores.length * 100)
    : null;
  const elevatedSessions = periodSessions.filter(session => session.level === 2 || session.level === 3);
  const insights = elevatedSessions.length >= 2
    ? [{
      title: `${elevatedSessions.length} sessions showed elevated patterns`,
      category: 'Pattern to review',
      description: 'Several analyzed sessions were classified above the normal range. This is an acoustic pattern, not a diagnosis or proof of stress.',
      action: 'Compare the session dates and contexts in History, and consider whether workload or recording conditions changed.',
      severity: 'moderate',
    }]
    : sessions.length
      ? [{
        title: 'More sessions needed for a trend',
        category: 'Early data',
        description: `${sessions.length} analyzed session${sessions.length === 1 ? '' : 's'} saved locally. A longitudinal pattern needs repeated observations over time.`,
        action: 'Continue only with recordings you choose to analyze; wellbeing data stays on this browser.',
        severity: 'info',
      }]
      : [];
  const weeklyData = days;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--cyan-400)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="glass-pill" style={{ color: 'var(--cyan-400)', borderColor: 'var(--cyan-400)' }}>
                <HeartHandshake size={14} /> Engine A: Wellbeing &amp; Workload Intelligence
              </span>
              <span className="glass-pill" style={{ fontSize: '0.75rem' }}>
                <Lock size={12} /> Stored in This Browser
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              Longitudinal <span className="gradient-text">Stress &amp; Workload</span> Patterns
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '780px', fontSize: '0.95rem' }}>
              Operating over days and weeks, the Wellbeing Engine discovers acoustic fatigue trends without ever triggering emergency contacts.
            </p>
          </div>

          <div style={{
            background: 'rgba(34, 211, 238, 0.1)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <BrainCircuit size={28} color="var(--cyan-400)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mean concern score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan-400)' }}>
                {weeklyStressIndex == null ? 'No sessions yet' : `${weeklyStressIndex} / 100`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session history chart */}
      <div className="glass-panel" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{dayCount}-Day Session Concern Score</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Bars show mean prototype fusion score per day; labels show mean measured pitch when available. These are not clinical scores.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setSelectedTimeframe('7d')} className="btn btn-outline" aria-pressed={selectedTimeframe === '7d'} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>7 Days</button>
            <button onClick={() => setSelectedTimeframe('14d')} className="btn btn-outline" aria-pressed={selectedTimeframe === '14d'} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>14 Days</button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeklyData.length}, minmax(0, 1fr))`,
          gap: '6px',
          alignItems: 'flex-end',
          height: '240px',
          padding: '20px 10px',
          background: 'var(--bg-tertiary)',
          borderRadius: '14px',
          position: 'relative'
        }}>
          {weeklyData.map((d) => {
            const isHigh = d.stressIndex > 65;
            return (
              <div key={d.date} title={`${d.date}: ${d.calls} sessions`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px', minWidth: 0 }}>
                <span className="mono" style={{ fontSize: '0.68rem', fontWeight: 700, color: isHigh ? '#f43f5e' : 'var(--text-secondary)' }}>
                  {d.avgPitch == null ? '—' : `${d.avgPitch}Hz`}
                </span>

                <div style={{
                  width: '100%',
                  maxWidth: '48px',
                  height: `${Math.max(d.calls ? 4 : 0, d.stressIndex)}%`,
                  background: isHigh ? 'linear-gradient(180deg, #f43f5e 0%, #fbbf24 100%)' : 'linear-gradient(180deg, #22d3ee 0%, #0d9488 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  transition: 'height 0.3s ease',
                  boxShadow: isHigh ? '0 0 12px rgba(244, 63, 94, 0.4)' : 'none',
                }} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.day}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.calls} sessions</div>
                </div>
              </div>
            );
          })}
          {!sessions.length && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>
              Analyze an audio session to begin a private trend.
            </div>
          )}
        </div>
      </div>

      {/* Longitudinal Insights Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Private Acoustic Reflections &amp; Trends</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {insights.map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: item.severity === 'moderate' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(34, 211, 238, 0.15)',
                  color: item.severity === 'moderate' ? '#fbbf24' : '#22d3ee',
                }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Longitudinal</span>
              </div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '14px' }}>
                {item.description}
              </p>
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                borderLeft: '3px solid var(--teal-400)'
              }}>
                <strong>Suggested Action:</strong> {item.action}
              </div>
            </div>
          ))}
          {!insights.length && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No analyzed sessions yet. Trends will appear only after repeated sessions are saved.</p>
          )}
        </div>
      </div>

    </div>
  );
}
