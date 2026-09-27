# SafeCall

SafeCall is a local-first web prototype for exploring personal audio patterns and potential safety events. It separates immediate safety indicators from private wellbeing summaries. Its signal weights and thresholds are experimental and are not clinically or scientifically validated.

## Requirements

- Node.js 18.17 or newer
- npm
- A modern browser with Web Audio support

Microphone recording requires browser permission and a secure context (localhost is supported). Optional browser speech recognition requires a compatible browser. Browser-provided speech recognition may process microphone audio according to the browser provider's privacy policy.

## Run Locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is occupied, start Next.js on another port:

```sh
npx next dev -p 3001
```

Production and test commands:

```sh
npm run build
npm start
npm test
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard, reference scenarios, and call-simulator UI test |
| `/inputs` | Profile and routine inputs; audio upload/recording, analysis, transcript phrase matching, and baseline calibration |
| `/safety` | Trusted contacts, primary contact, configured code phrases, safe zones, location consent, and sensitivity |
| `/history` | Locally saved session records, filters, CSV export, and history deletion |
| `/wellbeing` | 7- and 14-day summaries calculated from saved sessions |
| `/about` | Architecture, prototype weights, categories, and responsible-use limitations |
| `/contact` | Emergency-service links and feedback form |

## Audio Analysis Flow

The MVP accepts a browser-supported audio file or a microphone recording. Audio is decoded and processed in the browser; the raw recording is not saved. The analyzer derives:

- A periodic pitch estimate
- Mean active-frame energy
- Silence ratio and longest low-energy interval
- Thirteen mean MFCC coefficients

Uploaded audio is transcribed locally in the browser with a cached Whisper model. The transcript is shown in the transcript field and configured phrases are matched against it. While recording, browser speech recognition can still be enabled separately; it is off by default. Transcript contents are used for phrase matching but are not saved with session history.

An evaluation combines the available features with the saved personal baseline, routine window, configured phrases, and (only for a Level 4 candidate with saved consent) a one-time browser location lookup. Session records contain derived features and the result, not the audio file. Local session history is capped at 250 records.

## Classification

The rules-based prototype returns four categories:

1. **Level 1 – Normal:** No significant deviation in the available features.
2. **Level 2 – Stress / Workload Pattern:** A voice or speech-rate pattern without strong safety evidence. Wellbeing summaries stay separate from contact actions.
3. **Level 3 – Elevated Concern:** Multiple unusual signals below the prototype safety threshold.
4. **Level 4 – Potential Safety Event:** A configured phrase combined with supporting evidence, a non-verbal distress rule in supported scenarios, or a high fusion score.

Known casual social context suppresses a workload-only classification in the reference scenario. An isolated pitch deviation or unusual hour does not trigger Level 4. Missing measurements such as breathing, micro-tremor, or unchecked location are treated as unavailable rather than as abnormal or safe.

Weights and thresholds in `lib/safecallEngine.js` are prototype values, not validated risk estimates. A classification is not proof of danger or a diagnosis.

## Settings and Storage

Profile details, contacts, safe zones, code phrases, consent, and derived sessions are stored in this browser's `localStorage`. This storage is **not encrypted** and is not appropriate for sensitive production data or shared devices. Use the History page to delete session records. The onboarding reset also clears the profile and sessions.

Location sharing is off by default. If enabled, a location lookup occurs only after a Level 4 candidate; coordinates are retained locally with that event. No continuous background location tracking is used.

## Safety and Scope

This repository is a hackathon/browser prototype, not a production safety service. It does not:

- Monitor phone calls or provide a live telephony stream
- Send contacts automatic or silent SMS, calls, push alerts, or emails
- Provide authentication, a hosted API, or server-side database storage
- Reliably estimate breathing rate, speech rate, background-noise events, or vocal micro-tremor from recordings

The call simulator is a scripted UI test; its pitch and breathing values are illustrative. A Level 4 result is saved locally. The user can explicitly open a call or message to the configured primary contact, but SafeCall does not send it. Do not rely on this prototype in an emergency; contact local emergency services directly.

## Tests

`npm test` checks the reference scenario categories, prototype weight totals, missing-signal behavior, and the rule that a single pitch/time anomaly does not produce a Level 4 event.

## Project Layout

```text
app/          Next.js routes and global styling
components/   Onboarding, help, call-test, and contact-review UI
lib/          Audio analysis, signal fusion, and browser storage
tests/        Node.js classifier regression tests
```

See [SafeCall_Final_Architecture_and_Flow.docx](SafeCall_Final_Architecture_and_Flow.docx) for the original architecture and MVP specification.