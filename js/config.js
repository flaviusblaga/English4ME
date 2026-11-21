// Public config — none of this is secret. The real secret (Anthropic API key)
// lives only in the Cloudflare Worker, never here.
export const CONFIG = {
  // Paste your Google OAuth Web Client ID here (Google Cloud Console > Credentials).
  GOOGLE_CLIENT_ID: "742015776578-mtiboaafbv7g5j2s69cup4su51hjhro2.apps.googleusercontent.com",

  // Paste your deployed Cloudflare Worker URL here (from `wrangler deploy`).
  WORKER_URL: "https://english4me.flaviusblaga.workers.dev",

  // Use ElevenLabs voices (via the Worker's /tts endpoint) instead of the
  // browser's built-in speech. This is ON: the app will request ElevenLabs
  // audio for every spoken line. It only actually speaks with ElevenLabs once
  // the Worker /tts route is deployed with the 5 voice IDs + the ELEVENLABS_API_KEY
  // secret; until then (or if the Worker is unreachable, over its monthly cap,
  // or errors) the app automatically falls back to the browser voice, so
  // lessons are never silent. Deploy the Worker BEFORE this ships to avoid a
  // brief browser-fallback window. The API key and voice IDs live ONLY in the
  // Worker — never here.
  ELEVENLABS_TTS: true,
};
