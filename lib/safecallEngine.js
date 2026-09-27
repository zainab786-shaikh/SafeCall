// SafeCall Core Engine: Signal Fusion, Personal Baseline & Two-Engine Decision Classifier
// Enhanced for PSWB03: Breathing Irregularities, Micro-Tremor, and Simplified Explanations

export const PROTOTYPE_WEIGHTS = {
  voiceDeviation: 0.18,
  breathingAnomaly: 0.18, // PSWB03 explicitly requires breathing changes
  silenceAnomaly: 0.14,
  keywordCodeWord: 0.30,  // Predefined codewords spoken naturally
  routineAnomaly: 0.08,
  locationAnomaly: 0.07,
  microTremorAnomaly: 0.05,
};

export const DEFAULT_USER_BASELINE = {
  userId: "usr_safe_9921",
  name: "Zainab Shaikh",
  phone: "9892058858",
  calibratedAt: "2026-09-15",
  avgPitchHz: 182,
  pitchRange: [155, 205], // normal baseline range
  avgEnergyDb: -22,
  speakingRateWpm: 135,
  avgBreathingRpm: 16,     // normal resting respiratory rate: 12-18 breaths/min
  breathingRange: [12, 19],
  microTremorJitterPct: 1.2, // vocal stability: < 1.5% normal
  avgPauseDurationMs: 420,
  silenceRatioPct: 18,
  configuredCodeWords: ["blue umbrella", "weather is cold today", "check the ledger"],
  configuredKeywords: ["help", "stop", "let me go", "hurry"],
  safeLocations: [
    { name: "Home - Residence", coords: { lat: 28.6139, lng: 77.2090 }, radiusMeters: 300 },
    { name: "Workplace / Campus", coords: { lat: 28.5450, lng: 77.1926 }, radiusMeters: 500 },
    { name: "City Library", coords: { lat: 28.6289, lng: 77.2185 }, radiusMeters: 400 },
  ],
  typicalRoutine: {
    sleep: { start: "23:00", end: "07:00" },
    active: { start: "07:00", end: "23:00" },
  },
  trustedContacts: [
    { id: "c1", name: "Priya Gupta", relation: "Primary Emergency Contact", phone: "+91 93249 57234", isPrimary: true },
    { id: "c2", name: "Isha Narvekar", relation: "Emergency Contact", phone: "+91 9324402673", isPrimary: false },
    { id: "c3", name: "Jiya Talreja", relation: "Emergency Contact", phone: "+91 95292 95915", isPrimary: false },
  ],
  locationPermissionGranted: false,
  alertSensitivity: 65,
};

export const REAL_WORLD_SCENARIOS = [
  {
    id: "phone-emergency",
    title: "Suspicious Cab / Night Distress (Level 4)",
    badge: "PSWB03 Core Scenario",
    callerName: "Priya Gupta (Incoming Call)",
    description: "Passenger under acute distress in a detour cab. Uses secret code-word 'blue umbrella' with hyperventilation & breathless pauses.",
    sessionData: {
      audioName: "night_cab_call.wav",
      pitchHz: 265,
      energyDb: -28,
      speakingRateWpm: 74,
      breathingRpm: 34, // Hyperventilation (34 bpm vs normal 16)
      breathingStatus: "Hyperventilation & Sharp Gasps",
      microTremorJitterPct: 4.8, // Vocal tremor under threat
      silenceRatioPct: 65,
      pauseDurationMs: 2400,
      detectedKeywords: ["hurry"],
      codeWordDetected: true,
      matchedCodeWord: "blue umbrella",
      transcriptSnippet: "Yes I'm on the call now... remember that blue umbrella... please hurry.",
      timeOfDay: "02:45",
      isOutsideRoutine: true,
      currentLocationName: "Industrial Outer Ring (Unrecognized Route)",
      isOutsideSafeLocation: true,
      sessionType: "Night Commute Phone Call",
    },
  },
  {
    id: "office-workload",
    title: "Workday Stress Call (Level 2)",
    badge: "Wellbeing Branch",
    callerName: "Project Lead (Standup Call)",
    description: "Exhausted work call. Vocal strain and rapid speaking, but calm breathing, normal location, and NO code-words.",
    sessionData: {
      audioName: "work_standup_call.wav",
      pitchHz: 218,
      energyDb: -19,
      speakingRateWpm: 158,
      breathingRpm: 17, // Normal breathing
      breathingStatus: "Steady, regular breathing",
      microTremorJitterPct: 1.6,
      silenceRatioPct: 28,
      pauseDurationMs: 760,
      detectedKeywords: [],
      codeWordDetected: false,
      transcriptSnippet: "We need to fix the deployment pipeline before the sprint demo tonight.",
      timeOfDay: "15:30",
      isOutsideRoutine: false,
      currentLocationName: "Workplace / Campus",
      isOutsideSafeLocation: false,
      sessionType: "Work Call",
    },
  },
  {
    id: "excited-friend",
    title: "Excited Normal Chat (Level 1)",
    badge: "Safe Baseline",
    callerName: "Sarah (Catchup Call)",
    description: "High pitch and fast speech because of joyful news. Safe location and relaxed respiratory rhythm.",
    sessionData: {
      audioName: "friend_catchup.wav",
      pitchHz: 238,
      energyDb: -16,
      speakingRateWpm: 178,
      breathingRpm: 18,
      breathingStatus: "Normal, laughter pauses",
      microTremorJitterPct: 1.1,
      silenceRatioPct: 14,
      pauseDurationMs: 320,
      detectedKeywords: [],
      codeWordDetected: false,
      transcriptSnippet: "Guess what! We won the grand prize! We have to meet up and celebrate!",
      timeOfDay: "19:15",
      isOutsideRoutine: false,
      currentLocationName: "Home - Residence",
      isOutsideSafeLocation: false,
      sessionType: "Casual Phone Call",
    },
  },
  {
    id: "breathless-coercion",
    title: "Breathless Silence / Freeze (Level 4)",
    badge: "PSWB03 Non-Verbal",
    callerName: "Unknown / Home Check",
    description: "Aggressor present. User is unable to speak freely; rapid shallow breathing with 75% silence.",
    sessionData: {
      audioName: "freeze_silent_gasp.wav",
      pitchHz: 252,
      energyDb: -36,
      speakingRateWpm: 42,
      breathingRpm: 38, // Severe hyperventilation
      breathingStatus: "Shallow rapid gasps / Short of breath",
      microTremorJitterPct: 5.2,
      silenceRatioPct: 78,
      pauseDurationMs: 3200,
      detectedKeywords: [],
      codeWordDetected: false,
      transcriptSnippet: "I... I can't... talk right now... (heavy gasping)",
      timeOfDay: "23:40",
      isOutsideRoutine: true,
      currentLocationName: "Outside Safe Zone (Alleyway)",
      isOutsideSafeLocation: true,
      sessionType: "Silent Distress Call",
    },
  },
];

/**
 * Evaluates current audio session against the personal baseline and contextual parameters.
 * Combines voice stress, breathing irregularities, silences, and codewords.
 */
export function evaluateSession(sessionData, baseline = DEFAULT_USER_BASELINE) {
  // 1. Voice Deviation Score
  const [minNormal, maxNormal] = baseline.pitchRange || [155, 205];
  const pitchHz = Number.isFinite(sessionData.pitchHz) ? sessionData.pitchHz : baseline.avgPitchHz;
  const energyDb = Number.isFinite(sessionData.energyDb) ? sessionData.energyDb : baseline.avgEnergyDb;
  let pitchDev = 0;
  if (pitchHz > maxNormal) {
    pitchDev = Math.min(1.0, (pitchHz - maxNormal) / 60);
  } else if (pitchHz < minNormal) {
    pitchDev = Math.min(1.0, (minNormal - pitchHz) / 40);
  }
  const energyDev = Math.min(1.0, Math.abs(energyDb - baseline.avgEnergyDb) / 20);
  const voiceDevScore = Number(((pitchDev * 0.7) + (energyDev * 0.3)).toFixed(3));

  // 2. Breathing Anomaly Score (PSWB03 focus)
  const normalBreathingMax = baseline.breathingRange ? baseline.breathingRange[1] : 19;
  let breathScore = 0;
  if (Number.isFinite(sessionData.breathingRpm) && sessionData.breathingRpm > normalBreathingMax) {
    breathScore = Math.min(1.0, (sessionData.breathingRpm - normalBreathingMax) / 18);
  } else if (Number.isFinite(sessionData.breathingRpm) && sessionData.breathingRpm < 10) {
    breathScore = 0.5; // Abnormally shallow or held breath
  }

  // 3. Silence / Pause Anomaly
  const silenceRatioPct = Number.isFinite(sessionData.silenceRatioPct) ? sessionData.silenceRatioPct : baseline.silenceRatioPct;
  const pauseDurationMs = Number.isFinite(sessionData.pauseDurationMs) ? sessionData.pauseDurationMs : baseline.avgPauseDurationMs;
  const silenceDiff = Math.max(0, silenceRatioPct - baseline.silenceRatioPct);
  const pauseDiff = Math.max(0, pauseDurationMs - baseline.avgPauseDurationMs);
  const silenceScore = Math.min(1.0, (silenceDiff / 40) * 0.6 + (pauseDiff / 1500) * 0.4);

  // 4. Keyword / Predefined Codeword Score
  let keywordScore = 0;
  if (sessionData.codeWordDetected) {
    keywordScore = 1.0; // Configured Code Word is a definitive deliberate safety indicator
  } else if (sessionData.detectedKeywords && sessionData.detectedKeywords.length > 0) {
    keywordScore = Math.min(0.85, sessionData.detectedKeywords.length * 0.4);
  }

  // 5. Routine Anomaly
  const routineScore = sessionData.isOutsideRoutine ? 0.85 : 0.05;

  // 6. Location Geofence Anomaly
  const locationKnown = typeof sessionData.locationChecked === 'boolean'
    ? sessionData.locationChecked
    : typeof sessionData.isOutsideSafeLocation === 'boolean';
  const locationScore = !locationKnown ? 0 : sessionData.isOutsideSafeLocation ? 0.90 : 0.05;

  // 7. Micro-Tremor / Jitter
  const jitterVal = Number.isFinite(sessionData.microTremorJitterPct) ? sessionData.microTremorJitterPct : null;
  const tremorScore = jitterVal == null ? 0 : Math.min(1.0, Math.max(0, (jitterVal - 1.5) / 3.5));

  // FUSION SCORE
  const fusionScore = Number((
    voiceDevScore * PROTOTYPE_WEIGHTS.voiceDeviation +
    breathScore * PROTOTYPE_WEIGHTS.breathingAnomaly +
    silenceScore * PROTOTYPE_WEIGHTS.silenceAnomaly +
    keywordScore * PROTOTYPE_WEIGHTS.keywordCodeWord +
    routineScore * PROTOTYPE_WEIGHTS.routineAnomaly +
    locationScore * PROTOTYPE_WEIGHTS.locationAnomaly +
    tremorScore * PROTOTYPE_WEIGHTS.microTremorAnomaly
  ).toFixed(3));

  // CLASSIFICATION
  let level = 1;
  let levelTitle = "LEVEL 1 – Normal & Safe";
  let levelDescription = "No significant deviation detected in the available audio features.";
  let actionResponse = "Routine guardian monitoring active. No action needed.";
  let engineSource = "Baseline Engine";
  let triggerSilentAlert = false;
  let humanSummary = "Everything looks safe and normal.";

  const sensitivityThreshold = (baseline.alertSensitivity || 65) / 100;
  const knownBenignContext = sessionData.knownContext === "social"
    || sessionData.sessionType === "Casual Phone Call";

  if (sessionData.codeWordDetected && (locationScore > 0.4 || breathScore > 0.4 || voiceDevScore > 0.35 || silenceScore > 0.4)) {
    level = 4;
    levelTitle = "LEVEL 4 – Potential Safety Event";
    levelDescription = "Predefined secret code-word spoken naturally alongside high vocal stress or breathing distress.";
    actionResponse = "Potential safety event identified. Review the local event details and contact a trusted person if help is needed.";
    engineSource = "Safety Engine";
    triggerSilentAlert = true;
    humanSummary = "Potential safety event recorded locally; no contact message was sent.";
  } else if (breathScore > 0.7 && silenceScore > 0.6 && (locationScore > 0.5 || routineScore > 0.5)) {
    // Non-verbal distress without words (freezing/gasping)
    level = 4;
    levelTitle = "LEVEL 4 – Non-Verbal Distress Event";
    levelDescription = "Severe breathing irregularity (hyperventilation/gasping) + prolonged silence outside safe location.";
    actionResponse = "Potential non-verbal distress pattern identified. Review the local event details and contact a trusted person if help is needed.";
    engineSource = "Safety Engine";
    triggerSilentAlert = true;
    humanSummary = "Potential non-verbal distress pattern recorded locally.";
  } else if (fusionScore >= sensitivityThreshold) {
    level = 4;
    levelTitle = "LEVEL 4 – Potential Safety Event";
    levelDescription = "Multi-signal fusion crossed emergency threshold. Indicators suggest potential threat.";
    actionResponse = "Potential safety event identified. Review the local event details and contact a trusted person if help is needed.";
    engineSource = "Safety Engine";
    triggerSilentAlert = true;
    humanSummary = "Potential safety event recorded locally; no contact message was sent.";
  } else if (fusionScore >= 0.38) {
    level = 3;
    levelTitle = "LEVEL 3 – Elevated Concern";
    levelDescription = "Unusual signals detected (late hour or vocal jump), but insufficient proof for emergency.";
    actionResponse = "Standby monitoring. Conversation continues with zero interruption.";
    engineSource = "Safety Engine (Standby)";
    triggerSilentAlert = false;
    humanSummary = "Elevated Concern: Monitoring quietly.";
  } else if (!knownBenignContext && (voiceDevScore > 0.35 || (Number.isFinite(sessionData.speakingRateWpm) && sessionData.speakingRateWpm > 150))) {
    level = 2;
    levelTitle = "LEVEL 2 – Stress / Workload Pattern";
    levelDescription = "Daily communication fatigue detected without physical threat or breathing distress.";
    actionResponse = "Logged privately to Wellbeing Hub. Emergency contacts NEVER alerted.";
    engineSource = "Wellbeing Engine";
    triggerSilentAlert = false;
    humanSummary = "Daily Workload / Speech Fatigue (Private only).";
  }

  return {
    fusionScore,
    level,
    levelTitle,
    levelDescription,
    actionResponse,
    engineSource,
    triggerSilentAlert,
    humanSummary,
    confidence: Math.round(fusionScore * 100),
    signals: {
      voiceDeviation: { value: voiceDevScore, label: "Vocal Pitch & Stress", detail: Number.isFinite(sessionData.pitchHz) ? `${pitchHz} Hz (${pitchHz > maxNormal ? 'Elevated' : 'Within range'})` : "Pitch unavailable; baseline used neutrally" },
      breathingAnomaly: { value: breathScore, label: "Breathing Rate & Gasps", detail: Number.isFinite(sessionData.breathingRpm) ? `${sessionData.breathingRpm} bpm (${sessionData.breathingStatus || 'Measured'})` : "Not measured" },
      silenceAnomaly: { value: silenceScore, label: "Silence & Speech Gaps", detail: `${silenceRatioPct}% silence, ${pauseDurationMs}ms pauses` },
      keywordCodeWord: { value: keywordScore, label: "Predefined Secret Code-Word", detail: sessionData.codeWordDetected ? `TRIGGERED: "${sessionData.matchedCodeWord}"` : "None detected" },
      locationAnomaly: { value: locationScore, label: "Location Geofence", detail: !locationKnown ? "Not checked" : sessionData.isOutsideSafeLocation ? `Outside Safe Area (${sessionData.currentLocationName})` : "Within Safe Area" },
      routineAnomaly: { value: routineScore, label: "Routine & Schedule", detail: sessionData.isOutsideRoutine ? `Unusual Hour (${sessionData.timeOfDay})` : "Normal Hours" },
      microTremorAnomaly: { value: tremorScore, label: "Vocal Micro-Tremor (Jitter)", detail: jitterVal == null ? "Not measured" : `${jitterVal}% jitter (${jitterVal > 3.0 ? 'Acoustic Instability' : 'Stable'})` },
    },
    sessionMetadata: sessionData,
    evaluatedAt: new Date().toISOString(),
  };
}
