// Public config — none of this is secret. The real secret (Anthropic API key)
// lives only in the Cloudflare Worker, never here.
export const CONFIG = {
  // Paste your Google OAuth Web Client ID here (Google Cloud Console > Credentials).
  GOOGLE_CLIENT_ID: "742015776578-mtiboaafbv7g5j2s69cup4su51hjhro2.apps.googleusercontent.com",

  // Paste your deployed Cloudflare Worker URL here (from `wrangler deploy`).
  WORKER_URL: "https://english4me.flaviusblaga.workers.dev",

  // Use ElevenLabs voices (via the Worker's /tts endpoint) instead of the
  // browser's built-in speech. Leave false until the Worker /tts route is
  // deployed AND the 5 voice IDs are set in the Worker; flip to true to switch
  // the app over. The browser voice always remains the automatic fallback (if
  // the Worker is unreachable, over its monthly cap, or errors), so lessons are
  // never silent. The ElevenLabs API key and voice IDs live ONLY in the Worker.
  ELEVENLABS_TTS: false,
};
