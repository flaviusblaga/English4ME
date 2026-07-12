// Thin wrapper around the browser-native Web Speech API. chat.js is the only
// caller; this module owns no chat state and never touches session/Drive.

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
const TTS_MUTE_KEY = "engleza-familie-tts-muted";
const VOICE_GENDER_KEY = "engleza-familie-voice-gender"; // "female" | "male"

let recognizer = null;
let onInterimCallback = null;
let onFinalCallback = null;
let onEndCallback = null;

export function isSpeechRecognitionSupported() {
  return !!SpeechRecognitionCtor;
}

export function isSpeechSynthesisSupported() {
  return "speechSynthesis" in window;
}

// Chrome (and others) load the voice list asynchronously in the background —
// the very first call to getVoices() in a page's lifetime commonly returns an
// empty array, before the "voiceschanged" event fires. If speak() picks a
// voice against an empty list, it silently gets no explicit voice at all and
// the browser falls back to its own default (often not the gender the user
// picked). This warms the list up as early as possible so it's ready by the
// time the first reply needs to be spoken.
let voicesReadyPromise = null;

function ensureVoicesLoaded() {
  if (!isSpeechSynthesisSupported()) return Promise.resolve();
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => resolve();
    // Fallback in case "voiceschanged" never fires on some browser — proceed
    // anyway rather than waiting forever (speak() still works, just may not
    // find a gender match if the list is genuinely still empty).
    setTimeout(resolve, 1000);
  });

  return voicesReadyPromise;
}

// Call once at boot (before any speak() call) so the voice list has a head
// start on loading instead of only starting to load on the first reply.
if (isSpeechSynthesisSupported()) {
  ensureVoicesLoaded();
}

// Call once at boot. Callbacks:
//   onInterim(text) — fired repeatedly while the user speaks (interim results)
//   onFinal(text)   — fired once with the final recognized text
//   onEnd()         — fired when recognition stops (error, silence, or manual stop)
export function initVoiceInput({ onInterim, onFinal, onEnd }) {
  if (!isSpeechRecognitionSupported()) return;

  onInterimCallback = onInterim;
  onFinalCallback = onFinal;
  onEndCallback = onEnd;

  recognizer = new SpeechRecognitionCtor();
  recognizer.lang = "en-US";
  recognizer.continuous = false;
  recognizer.interimResults = true;

  recognizer.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }
    if (interimText && onInterimCallback) onInterimCallback(interimText);
    if (finalText && onFinalCallback) onFinalCallback(finalText);
  };

  recognizer.onerror = () => {
    if (onEndCallback) onEndCallback();
  };

  recognizer.onend = () => {
    if (onEndCallback) onEndCallback();
  };
}

// Returns true if it started, false if unsupported or already running.
export function startListening() {
  if (!recognizer) return false;
  try {
    recognizer.start();
    return true;
  } catch {
    return false; // already started — browser throws InvalidStateError
  }
}

export function stopListening() {
  if (recognizer) recognizer.stop();
}

export function isTtsMuted() {
  return localStorage.getItem(TTS_MUTE_KEY) === "true";
}

export function setTtsMuted(muted) {
  localStorage.setItem(TTS_MUTE_KEY, muted ? "true" : "false");
}

// Defaults to female (matches the previous default voice) until the user
// picks a preference.
export function getVoiceGenderPreference() {
  return localStorage.getItem(VOICE_GENDER_KEY) || "female";
}

export function setVoiceGenderPreference(gender) {
  localStorage.setItem(VOICE_GENDER_KEY, gender === "male" ? "male" : "female");
}

// Kept at module scope — Chrome silently drops speech if the
// SpeechSynthesisUtterance object is garbage-collected before it finishes
// (a long-standing browser bug), which easily happens if the only reference
// is a local variable inside a function that has already returned.
let currentUtterance = null;

// The Web Speech API exposes no official gender field, so we classify by
// name against common voice names across Windows/macOS/iOS/Android/Chrome.
// Not exhaustive, but covers the voices people actually see in practice.
const FEMALE_NAME_HINTS = [
  "zira", "hazel", "susan", "catherine", "samantha", "victoria", "karen",
  "moira", "tessa", "fiona", "kate", "serena", "allison", "ava", "female",
  "aria", "jenny", "michelle", "emma", "ana", "clara", "sonia", "libby",
];
const MALE_NAME_HINTS = [
  "david", "mark", "george", "ryan", "alex", "daniel", "fred", "oliver",
  "james", "thomas", "male",
  "guy", "andrew", "brian", "christopher", "eric", "steffan", "tony",
];

function classifyVoiceGender(voice) {
  const name = voice.name.toLowerCase();
  if (name === "google us english") return "female"; // Chrome's only en-US network voice, sounds female, no "female" in its name
  if (name.includes("female")) return "female";
  if (name.includes("male")) return "male";
  if (FEMALE_NAME_HINTS.some((hint) => name.includes(hint))) return "female";
  if (MALE_NAME_HINTS.some((hint) => name.includes(hint))) return "male";
  return "unknown";
}

// The default voice picked by most browsers (e.g. Windows' local SAPI voice)
// sounds noticeably robotic. Prefer a network/cloud voice — Chrome's "Google
// US English" in particular sounds far more natural — over the local OS one.
// `gender` ("female" | "male") narrows the pool before applying the rest of
// the preference order; if nothing matches that gender, falls back to any
// available voice rather than failing silently.
function pickBestVoice(gender) {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Prefer an exact en-US match (what we ask for) before falling back to any
  // English voice, then to whatever's available at all.
  const usVoices = voices.filter((v) => v.lang === "en-US");
  const englishVoices = voices.filter((v) => v.lang && v.lang.startsWith("en"));
  const langCandidates = usVoices.length ? usVoices : englishVoices.length ? englishVoices : voices;

  const genderMatches = langCandidates.filter((v) => classifyVoiceGender(v) === gender);
  const candidates = genderMatches.length ? genderMatches : langCandidates;

  // Edge (and some Windows builds of Chrome) expose "Microsoft ... Online
  // (Natural)" neural voices — dramatically less robotic than the local SAPI
  // ones, especially with the pitched-up mascot voices. Always take one of
  // those first when available.
  const naturalVoice = candidates.find((v) => /natural/i.test(v.name));
  if (naturalVoice) return naturalVoice;

  const preferredNames =
    gender === "male"
      ? ["Google UK English Male", "Microsoft David - English (United States)"]
      : ["Google US English", "Google UK English Female", "Microsoft Zira - English (United States)"];
  for (const name of preferredNames) {
    const match = candidates.find((v) => v.name === name);
    if (match) return match;
  }

  // Any other non-local (cloud-rendered) voice tends to sound better than
  // the local OS engine.
  const networkVoice = candidates.find((v) => v.localService === false);
  if (networkVoice) return networkVoice;

  return candidates[0];
}

// No-op if unsupported or muted. Cancels any in-flight utterance first so
// replies don't queue up and read out of order if the user sends fast.
// Async so it can wait for the voice list — chat.js calls this without
// awaiting it, which is fine, speaking happens in the background either way.
// `onstart`/`onend` (both optional) let the caller animate a mascot avatar
// exactly while its line is being spoken; `onend` also fires on error and
// cancel so a "talking" CSS class never gets stuck on.
export async function speak(text, { pitch = 1.0, rate = 1.0, onstart, onend } = {}) {
  if (!isSpeechSynthesisSupported() || isTtsMuted() || !text) return;

  await ensureVoicesLoaded();

  window.speechSynthesis.cancel();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "en-US";
  currentUtterance.pitch = pitch;
  currentUtterance.rate = rate;
  const voice = pickBestVoice(getVoiceGenderPreference());
  if (voice) currentUtterance.voice = voice;
  if (onstart) currentUtterance.onstart = () => onstart();
  currentUtterance.onend = () => {
    currentUtterance = null;
    if (onend) onend();
  };
  currentUtterance.onerror = () => {
    currentUtterance = null;
    if (onend) onend();
  };

  // Calling speak() immediately after cancel() can silently no-op in Chrome
  // (cancel() clears the queue asynchronously); yielding one tick first makes
  // the new utterance reliably start.
  setTimeout(() => {
    if (currentUtterance) {
      window.speechSynthesis.speak(currentUtterance);
    }
  }, 0);
}

// Kept at module scope for the same Chrome GC reason as currentUtterance.
let currentSequence = [];

// Speaks several segments back-to-back, each with its own pitch/rate — used
// for the two-mascot chat replies so Bobo and Fizz get audibly different
// voices within one reply. Cancels anything in flight once, then queues all
// segments (the browser plays queued utterances in order).
export async function speakLines(segments) {
  if (!isSpeechSynthesisSupported() || isTtsMuted() || !segments || segments.length === 0) return;

  await ensureVoicesLoaded();

  window.speechSynthesis.cancel();

  const voice = pickBestVoice(getVoiceGenderPreference());
  currentSequence = segments
    .filter((s) => s.text)
    .map((segment) => {
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = "en-US";
      utterance.pitch = segment.pitch != null ? segment.pitch : 1.0;
      utterance.rate = segment.rate != null ? segment.rate : 1.0;
      if (voice) utterance.voice = voice;
      if (segment.onstart) utterance.onstart = () => segment.onstart();
      if (segment.onend) {
        utterance.onend = () => segment.onend();
        utterance.onerror = () => segment.onend();
      }
      return utterance;
    });

  setTimeout(() => {
    for (const utterance of currentSequence) {
      window.speechSynthesis.speak(utterance);
    }
  }, 0);
}
