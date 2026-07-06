// Public config — none of this is secret. The real secret (Anthropic API key)
// lives only in the Cloudflare Worker, never here.
export const CONFIG = {
  // Paste your Google OAuth Web Client ID here (Google Cloud Console > Credentials).
  GOOGLE_CLIENT_ID: "742015776578-mtiboaafbv7g5j2s69cup4su51hjhro2.apps.googleusercontent.com",

  // Paste your deployed Cloudflare Worker URL here (from `wrangler deploy`).
  WORKER_URL: "https://english4me.flaviusblaga.workers.dev",
};
