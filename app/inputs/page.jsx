'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  User, 
  ShieldCheck, 
  Clock, 
  FileAudio, 
  Radio, 
  Database, 
  Upload, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Lock, 
  PhoneCall,
  MapPin,
  Key
} from 'lucide-react';
import { getSessions, getUserProfile, saveSession, saveUserProfile } from '../../lib/userStorage';
import { DEFAULT_USER_BASELINE, evaluateSession } from '../../lib/safecallEngine';
import { analyzeAudioFile } from '../../lib/audioAnalysis';

export default function SystemInputsPage() {
  const [profile, setProfile] = useState(DEFAULT_USER_BASELINE);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);
  const [calibrationMessage, setCalibrationMessage] = useState('');

  // Audio Upload / Recording State (Section 3: Current audio – MVP)
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('No audio selected');
  const [recording, setRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedFeatures, setExtractedFeatures] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [allowBrowserSpeechRecognition, setAllowBrowserSpeechRecognition] = useState(false);
  const transcriptRef = useRef('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loaded = getUserProfile();
    setProfile(loaded);
    setSavedSessions(getSessions());
  }, []);

  const handleProfileChange = (field, val) => {
    setProfile(prev => {
      if (field === 'sleepStart' || field === 'sleepEnd') {
        return {
          ...prev,
          typicalRoutine: {
            ...prev.typicalRoutine,
            sleep: { ...prev.typicalRoutine.sleep, [field === 'sleepStart' ? 'start' : 'end']: val },
          },
        };
      }
      return { ...prev, [field]: val };
    });
  };

  const handleSaveAll = () => {
    saveUserProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const calibrateBaseline = () => {
    const samples = savedSessions.filter(session => session.level === 1 && Number.isFinite(session.pitchHz)).slice(0, 30);
    if (samples.length < 3) {
      setCalibrationMessage('At least 3 Level 1 sessions with measured pitch are needed.');
      return;
    }
    if (!window.confirm(`Use ${samples.length} recent Level 1 sessions to update your pitch, energy, pause, and silence baseline?`)) return;
    const mean = field => {
      const values = samples.map(session => session[field]).filter(Number.isFinite);
      return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
    };
    const pitches = samples.map(session => session.pitchHz);
    const avgPitchHz = Math.round(mean('pitchHz'));
    const calibratedProfile = {
      ...profile,
      avgPitchHz,
      pitchRange: [Math.floor(Math.min(...pitches) - 5), Math.ceil(Math.max(...pitches) + 5)],
      avgEnergyDb: Number(mean('energyDb')?.toFixed(1) ?? profile.avgEnergyDb),
      avgPauseDurationMs: Math.round(mean('pauseDurationMs') ?? profile.avgPauseDurationMs),
      silenceRatioPct: Math.round(mean('silenceRatioPct') ?? profile.silenceRatioPct),
      calibratedAt: new Date().toISOString().slice(0, 10),
    };
    setProfile(calibratedProfile);
    saveUserProfile(calibratedProfile);
    setCalibrationMessage(`Baseline updated from ${samples.length} recent Level 1 sessions.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      e.target.value = '';
      setAudioFileName(file.name);
      setExtractedFeatures(null);
      setAnalysisResult(null);
      setAnalysisError('');
      setTranscriptText('');
      transcriptRef.current = '';
    }
  };

  const getCurrentPosition = () => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
  });

  const distanceMeters = (first, second) => {
    const radians = value => value * Math.PI / 180;
    const latitudeDelta = radians(second.lat - first.lat);
    const longitudeDelta = radians(second.lng - first.lng);
    const value = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(radians(first.lat)) * Math.cos(radians(second.lat)) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  };

  const analyzeCurrentAudio = async (file = audioFile, transcript = transcriptText) => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisResult(null);
    try {
      const features = await analyzeAudioFile(file);
      const normalizedTranscript = transcript.trim();
      const lowerTranscript = normalizedTranscript.toLowerCase();
      const matchedCodeWord = (profile.configuredCodeWords || []).find(word => lowerTranscript.includes(word.toLowerCase())) || null;
      const detectedKeywords = (profile.configuredKeywords || []).filter(word => lowerTranscript.includes(word.toLowerCase()));
      const now = new Date();
      const timeOfDay = now.toTimeString().slice(0, 5);
      const sleep = profile.typicalRoutine?.sleep || { start: '23:00', end: '07:00' };
      const currentMinutes = Number(timeOfDay.slice(0, 2)) * 60 + Number(timeOfDay.slice(3));
      const sleepStart = Number(sleep.start.slice(0, 2)) * 60 + Number(sleep.start.slice(3));
      const sleepEnd = Number(sleep.end.slice(0, 2)) * 60 + Number(sleep.end.slice(3));
      const isOutsideRoutine = sleepStart > sleepEnd
        ? currentMinutes >= sleepStart || currentMinutes < sleepEnd
        : currentMinutes >= sleepStart && currentMinutes < sleepEnd;
      let sessionData = {
        ...features,
        timeOfDay,
        pitchDeltaHz: Number.isFinite(features.pitchHz) ? features.pitchHz - profile.avgPitchHz : null,
        isOutsideRoutine,
        currentLocationName: 'Not checked',
        isOutsideSafeLocation: false,
        locationChecked: false,
        transcriptSnippet: '',
        codeWordDetected: Boolean(matchedCodeWord),
        matchedCodeWord,
        detectedKeywords,
        sessionType: file.name.startsWith('recording-') ? 'Recorded audio' : 'Audio file analysis',
      };
      let evaluation = evaluateSession(sessionData, profile);
      let locationStatus = 'Not requested';

      if (evaluation.level === 4 && profile.locationPermissionGranted && navigator.geolocation) {
        try {
          const position = await getCurrentPosition();
          const coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
          const matchingLocation = (profile.safeLocations || []).find(location => (
            distanceMeters(coordinates, location.coords) <= location.radiusMeters
          ));
          sessionData = {
            ...sessionData,
            coordinates,
            currentLocationName: matchingLocation?.name || 'Outside configured safe locations',
            isOutsideSafeLocation: !matchingLocation,
            locationChecked: true,
          };
          evaluation = evaluateSession(sessionData, profile);
          locationStatus = matchingLocation ? `Within ${matchingLocation.name}` : 'Outside configured safe locations';
        } catch {
          locationStatus = 'Location unavailable or permission denied';
        }
      } else if (evaluation.level === 4 && !profile.locationPermissionGranted) {
        locationStatus = 'Not shared: location permission is off';
      } else if (evaluation.level === 4 && !navigator.geolocation) {
        locationStatus = 'Geolocation is unavailable in this browser';
      }

      const saved = saveSession({
        ...sessionData,
        evaluation,
        level: evaluation.level,
        levelTitle: evaluation.levelTitle,
        fusionScore: evaluation.fusionScore,
        locationStatus,
        notificationStatus: evaluation.triggerSilentAlert
          ? 'Potential event logged locally; no contact message was sent.'
          : 'No contact notification needed.',
        timestamp: now.toISOString(),
      });
      setSavedSessions(getSessions());
      setExtractedFeatures(features);
      setAnalysisResult({ sessionData, evaluation, locationStatus, sessionId: saved?.id });
    } catch (error) {
      setAnalysisError(error.message || 'Audio analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startLiveRecording = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      transcriptRef.current = '';
      setTranscriptText('');

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const recordingBlob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const recordedFile = new File([recordingBlob], `recording-${Date.now()}.webm`, { type: recordingBlob.type });
        setAudioFile(recordedFile);
        setAudioFileName(recordedFile.name);
        setRecording(false);
        recognitionRef.current?.stop();
        recognitionRef.current = null;
        stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current = null;
        analyzeCurrentAudio(recordedFile, transcriptRef.current);
      };

      const SpeechRecognitionClass = allowBrowserSpeechRecognition
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = event => {
          const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ');
          transcriptRef.current = transcript;
          setTranscriptText(transcript);
        };
        recognitionRef.current = recognition;
        recognition.start();
      }

      mr.start();
      setRecording(true);
    } catch (err) {
      stream?.getTracks().forEach(track => track.stop());
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      mediaRecorderRef.current = null;
      setRecording(false);
      setAnalysisError('Microphone recording is unavailable. Check browser permission and try uploading an audio file.');
    }
  };

  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const calibrationSampleCount = savedSessions
    .filter(session => session.level === 1 && Number.isFinite(session.pitchHz))
    .slice(0, 30).length;

  const inputCategories = [
    {
      id: 'basic',
      title: '1. Basic Profile',
      tag: 'Identity & Calibration',
      icon: User,
      desc: 'Name, user ID, contact telephone, and baseline calibration timestamp as defined in Section 3.',
    },
    {
      id: 'safety',
      title: '2. Safety Profile',
      tag: 'Critical Safeguards',
      icon: ShieldCheck,
      desc: '3 Emergency contacts (Priya Gupta, Isha Narvekar, Jiya Talreja), safe geofences, code-words, and GPS permission.',
    },
    {
      id: 'routine',
      title: '3. Routine Inputs',
      tag: 'Contextual Baseline',
      icon: Clock,
      desc: 'Broad expected timings, active working hours, sleep schedule, and expected locations without intrusive timetables.',
    },
    {
      id: 'audio-mvp',
      title: '4. Current Audio (MVP)',
      tag: 'WAV / MP3 Feature Pipeline',
      icon: FileAudio,
      desc: 'Uploaded or recorded audio analyzed locally for pitch, energy, silence, pauses, and MFCCs.',
    },
    {
      id: 'audio-future',
      title: '5. Current Audio (Future)',
      tag: 'Live Telephony Stream',
      icon: Radio,
      desc: 'Live phone-call audio stream feeding the same real-time Librosa/SciPy signal fusion engine.',
    },
    {
      id: 'historical',
      title: '6. Historical Data',
      tag: 'Longitudinal Baselines',
      icon: Database,
      desc: 'Permitted previous audio-derived acoustic vectors and session metadata used to continuously refine personal baselines.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--teal-400)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="glass-pill" style={{ color: 'var(--teal-300)', borderColor: 'var(--teal-400)' }}>
                <SlidersHorizontal size={14} /> Section 3: System Inputs Specification
              </span>
              <span className="glass-pill" style={{ fontSize: '0.75rem' }}>
                <Lock size={12} /> Local &amp; Privacy-First
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              System <span className="gradient-text">Inputs &amp; Data Pipeline</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '820px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              In strict accordance with <strong>Section 3 (System Inputs)</strong> and <strong>Section 4 (Profile &amp; Privacy Design)</strong> of the official SafeCall architecture document: Basic Profile, Safety Profile, Routine, Current Audio (MVP &amp; Live), and Historical Baseline vectors.
            </p>
          </div>

          <button onClick={handleSaveAll} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <CheckCircle2 size={18} />
            <span>{savedSuccess ? 'All Inputs Saved!' : 'Save System Inputs'}</span>
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
          <span>System input parameters saved and synchronized with the local Signal Fusion baseline!</span>
        </div>
      )}

      {/* Quick Summary Cards (Document Section 3 Overview) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {inputCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: '2px solid rgba(45,212,191,0.4)',
                background: 'linear-gradient(180deg, rgba(20,184,166,0.06) 0%, rgba(15,23,42,0.4) 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--teal-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {cat.tag}
                </span>
                <Icon size={18} color="var(--teal-300)" />
              </div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>{cat.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                {cat.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── SECTION A: Basic Profile & Routine (Inputs 1 & 3) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        
        {/* Basic Profile Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <User size={20} color="var(--teal-400)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Basic Profile Inputs</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Document specification: <em>&ldquo;Name, age, user ID, contact telephone.&rdquo;</em>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Full Name
              </label>
              <input
                type="text"
                value={profile.name || 'Zainab Shaikh'}
                onChange={e => handleProfileChange('name', e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  User Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone || '9892058858'}
                  onChange={e => handleProfileChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  System User ID
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.userId || 'usr_safe_9921'}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--teal-300)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Estimated Age
                </label>
                <input
                  type="number"
                  value={profile.age ?? ''}
                  onChange={e => handleProfileChange('age', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Calibration Timestamp
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.calibratedAt || '2026-09-15'}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Routine Inputs Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Clock size={20} color="var(--teal-400)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Routine &amp; Timing Inputs</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Document specification: <em>&ldquo;Broad expected timings, basic schedule and common/expected locations; avoid unnecessarily detailed timetables.&rdquo;</em>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Typical Sleep Window Start
                </label>
                <input
                  type="time"
                  value={profile.typicalRoutine?.sleep?.start || '23:00'}
                  onChange={e => handleProfileChange('sleepStart', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  Typical Wakeup Time
                </label>
                <input
                  type="time"
                  value={profile.typicalRoutine?.sleep?.end || '07:00'}
                  onChange={e => handleProfileChange('sleepEnd', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Primary Work / Campus Schedule
              </label>
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem' }}>Monday – Friday active window</span>
                <span className="mono" style={{ color: 'var(--teal-400)', fontWeight: 600, fontSize: '0.85rem' }}>09:00 – 18:30 IST</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.25)',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              <strong style={{ color: 'var(--cyan-300)' }}>Context Logic (Section 7):</strong> Calls occurring during expected sleep hours (e.g. 3:00 AM) receive a contextual anomaly flag. It is supporting evidence only — time itself is never treated as solitary proof of danger.
            </div>
          </div>
        </div>

      </div>

      {/* ── SECTION B: Safety Profile Inputs (Input 2) ── */}
      <div className="glass-panel" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <ShieldCheck size={22} color="var(--teal-400)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Safety Profile Inputs (3 Designated Emergency Contacts)</h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Document specification: <em>&ldquo;Emergency/trusted contacts, safe locations, configured safety keywords/code words, alert preferences and location permission.&rdquo;</em>
        </p>

        {/* 3 Configured Contacts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '22px' }}>
          {(profile.trustedContacts || [
            { id: 'c1', name: 'Priya Gupta', relation: 'Primary Emergency Contact', phone: '+91 93249 57234', isPrimary: true },
            { id: 'c2', name: 'Isha Narvekar', relation: 'Emergency Contact', phone: '+91 9324402673', isPrimary: false },
            { id: 'c3', name: 'Jiya Talreja', relation: 'Emergency Contact', phone: '+91 95292 95915', isPrimary: false },
          ]).map((contact, idx) => (
            <div
              key={contact.id || idx}
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '14px',
                padding: '16px 18px',
                border: contact.isPrimary ? '1.5px solid #34d399' : '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: contact.isPrimary ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.06)',
                  color: contact.isPrimary ? '#34d399' : 'var(--text-muted)'
                }}>
                  {contact.isPrimary ? '★ Primary Contact (Contact Page)' : `Emergency Contact #${idx + 1}`}
                </span>
                <PhoneCall size={16} color={contact.isPrimary ? '#34d399' : 'var(--text-muted)'} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {contact.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {contact.relation}
              </div>
              <div className="mono" style={{ fontSize: '0.85rem', color: contact.isPrimary ? '#34d399' : 'var(--teal-300)', fontWeight: 600 }}>
                {contact.phone}
              </div>
            </div>
          ))}
        </div>

        {/* Safe Locations & Code Words */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Configured Safe Geofences:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(profile.safeLocations || []).map((loc, i) => (
                <div key={i} style={{
                  background: 'var(--bg-tertiary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}>
                  <span><MapPin size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--teal-400)' }} />{loc.name}</span>
                  <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{loc.radiusMeters}m geofence</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Configured Safety Code-Words (Natural Speech Triggers):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(profile.configuredCodeWords || ['blue umbrella', 'weather is cold today', 'check the ledger']).map((cw, i) => (
                <span key={i} className="glass-pill" style={{ fontSize: '0.82rem', padding: '6px 14px', color: 'var(--text-primary)' }}>
                  <Key size={12} style={{ marginRight: 4, color: 'var(--teal-400)' }} /> &ldquo;{cw}&rdquo;
                </span>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Spoken naturally during an ordinary conversation without pressing any buttons.
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION C: Audio Inputs – Current MVP & Future Live (Inputs 4 & 5) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Current Audio – MVP (Upload / Record) */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileAudio size={22} color="var(--teal-400)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>4. Current Audio – MVP</h3>
            </div>
            <span className="glass-pill" style={{ fontSize: '0.7rem' }}>Local Audio Analysis</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Document specification: <em>&ldquo;Uploaded or recorded audio file such as WAV/MP3.&rdquo;</em>
          </p>

          {/* Upload & Mic Actions */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem' }}>
              <Upload size={16} />
              <span>Upload WAV / MP3</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {!recording ? (
              <button onClick={startLiveRecording} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                <Mic size={16} />
                <span>Record Audio Sample</span>
              </button>
            ) : (
              <button onClick={stopLiveRecording} className="btn btn-danger" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                <MicOff size={16} />
                <span>Stop Recording</span>
              </button>
            )}
            <button
              onClick={() => analyzeCurrentAudio()}
              disabled={!audioFile || isAnalyzing || recording}
              className="btn btn-outline"
              style={{ padding: '10px 16px', fontSize: '0.85rem', opacity: !audioFile || isAnalyzing || recording ? 0.55 : 1 }}
            >
              <CheckCircle2 size={16} />
              <span>{isAnalyzing ? 'Analyzing locally…' : 'Analyze Audio'}</span>
            </button>
          </div>

          {/* Active File Banner */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            padding: '14px 16px',
            borderRadius: '12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active Current Audio File
              </div>
              <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--teal-300)', fontWeight: 600, marginTop: 2 }}>
                {audioFileName}
              </div>
            </div>
            {recording && (
              <span className="beacon-pulse" style={{ background: '#f43f5e', width: 12, height: 12, borderRadius: '50%' }} />
            )}
          </div>

          {analysisError && (
            <div role="alert" style={{ color: '#fda4af', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.35)', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              {analysisError}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '7px' }}>
            Transcript for configured phrase matching
          </label>
          <textarea
            value={transcriptText}
            onChange={e => { transcriptRef.current = e.target.value; setTranscriptText(e.target.value); }}
            placeholder="Optional. Speech recognition fills this while recording where supported. For uploaded files, enter a transcript if you want phrase matching."
            rows={3}
            style={{ width: '100%', resize: 'vertical', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: '18px' }}
          />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: 'var(--text-muted)', margin: '-8px 0 18px' }}>
            <input type="checkbox" checked={allowBrowserSpeechRecognition} onChange={event => setAllowBrowserSpeechRecognition(event.target.checked)} />
            Use browser speech recognition while recording. Processing may follow your browser provider’s privacy policy; this is off by default.
          </label>

          {/* Extracted Features (Section 5 Extraction) */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Extracted Acoustic Features (Section 5 Audio Feature Extraction):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pitch Frequency</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: extractedFeatures?.pitchHz > 210 ? '#f43f5e' : 'var(--teal-400)' }}>
                  {extractedFeatures?.pitchHz == null ? 'Not detected' : `${extractedFeatures.pitchHz} Hz`}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Breathing Rate</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cyan-400)' }}>
                  Not measured
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Silence / Pause Ratio</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {extractedFeatures?.silenceRatioPct ?? '—'}{extractedFeatures ? '%' : ''}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Energy</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {extractedFeatures?.energyDb == null ? '—' : `${extractedFeatures.energyDb} dB`}
                </div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Speech Rate</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Not measured</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MFCC summary (13 coefficients)</div>
                <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>
                  {extractedFeatures?.mfcc?.join(', ') || 'Available after analysis'}
                </div>
              </div>
            </div>
          </div>

          {analysisResult && (
            <div style={{ marginTop: '18px', padding: '16px', border: `1px solid ${analysisResult.evaluation.level === 4 ? 'rgba(244,63,94,0.55)' : 'var(--border-highlight)'}`, borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>{analysisResult.evaluation.levelTitle}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5 }}>{analysisResult.evaluation.levelDescription}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '8px' }}>
                Concern score: {analysisResult.evaluation.fusionScore} · Location: {analysisResult.locationStatus}
              </div>
              {analysisResult.evaluation.triggerSilentAlert && (
                <div role="status" style={{ color: '#fda4af', fontSize: '0.8rem', marginTop: '9px' }}>
                  Potential safety event saved on this device. This browser prototype did not send a message to any contact.
                </div>
              )}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '8px' }}>
                {extractedFeatures.analysisNotes.join(' ')}
              </div>
            </div>
          )}
        </div>

        {/* Current Audio – Future (Live Telephony Stream) & Historical Data (Inputs 5 & 6) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live Telephony Stream */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Radio size={20} color="var(--cyan-400)" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>5. Current Audio – Future (Live Stream)</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
              Document specification: <em>&ldquo;Live phone-call audio stream feeding the same analysis pipeline.&rdquo;</em>
            </p>
            <div style={{
              background: 'rgba(8, 145, 178, 0.1)',
              border: '1px solid rgba(8, 145, 178, 0.3)',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              Live phone-call streaming is not implemented in this browser prototype. The Dashboard call simulator is a scripted UI test and does not capture or monitor a phone call.
            </div>
          </div>

          {/* Historical Baseline Data */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Database size={20} color="var(--teal-400)" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>6. Historical Data Inputs</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
              Document specification: <em>&ldquo;Permitted previous audio-derived features and session metadata used to establish the personal baseline.&rdquo;</em>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Calibrated Personal Pitch Band:</span>
                <span className="mono" style={{ color: 'var(--teal-400)', fontWeight: 600 }}>{profile.pitchRange?.[0]} – {profile.pitchRange?.[1]} Hz (Avg {profile.avgPitchHz} Hz)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Breathing (not measured by this analyzer):</span>
                <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>Reference range {profile.breathingRange?.[0]}–{profile.breathingRange?.[1]} rpm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Micro-Tremor Vocal Jitter:</span>
                <span className="mono" style={{ color: '#34d399', fontWeight: 600 }}>Not measured by current analyzer</span>
              </div>
            </div>
            <button onClick={calibrateBaseline} disabled={calibrationSampleCount < 3} className="btn btn-outline" style={{ marginTop: 14, opacity: calibrationSampleCount < 3 ? 0.55 : 1 }}>
              <Database size={15} /> Calibrate from {calibrationSampleCount} recent normal sessions
            </button>
            {calibrationMessage && <p role="status" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>{calibrationMessage}</p>}
          </div>

        </div>

      </div>

    </div>
  );
}
