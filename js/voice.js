// Thin wrapper around the browser-native Web Speech API. chat.js is the only
// caller; this module owns no chat state and never touches session/Drive.

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
const TTS_MUTE_KEY = "engleza-familie-tts-muted";

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

// No-op if unsupported or muted. Cancels any in-flight utterance first so
// replies don't queue up and read out of order if the user sends fast.
export function speak(text) {
  if (!isSpeechSynthesisSupported() || isTtsMuted() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
