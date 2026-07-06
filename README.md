# Engleza Familie — V1 (Business English, Conversational)

Aplicație privată de familie pentru exersat engleza. V1 acoperă un singur profil complet funcțional: **adulți — Business English, nivel conversational**. Vezi planul complet în `C:\Users\BlagaFlaviusVasian\.claude\plans\tidy-tinkering-kazoo.md`.

## Ce trebuie configurat înainte de prima rulare

### 1. Google Cloud — OAuth Client ID (pentru Sign-In + Drive)

1. Mergi pe [Google Cloud Console](https://console.cloud.google.com/) → creează un proiect nou (sau refolosește unul existent).
2. **APIs & Services → Library** → activează **Google Drive API**.
3. **APIs & Services → Credentials** → **Create Credentials → OAuth client ID** → tip **Web application**.
4. La **Authorized JavaScript origins**, adaugă URL-ul unde va fi găzduit GitHub Pages, de ex. `https://<username-github>.github.io`. Pentru testare locală, adaugă și `http://localhost:PORT` (portul folosit de serverul local).
5. Copiază **Client ID**-ul generat (arată ca `123...apps.googleusercontent.com`) și pune-l în [`js/config.js`](js/config.js), câmpul `GOOGLE_CLIENT_ID`.
6. **Nu ai nevoie de Client Secret** — fluxul folosit (token client) e sigur din browser fără el.

### 2. Cheia API Anthropic

Ai deja o cheie API Anthropic (Claude Console). O punem doar ca secret în Cloudflare Worker (pasul următor) — niciodată în codul frontend.

### 3. Deploy Cloudflare Worker

```sh
cd worker
npm install
npx wrangler login                        # deschide browser, autentificare unică

npx wrangler kv namespace create USAGE_KV  # copiază id-ul returnat în wrangler.toml, câmpul kv_namespaces[0].id

npx wrangler secret put ANTHROPIC_API_KEY  # lipește cheia API Anthropic când e cerută
```

Editează `worker/wrangler.toml`:
- `ALLOWED_ORIGIN` → URL-ul GitHub Pages (ex. `https://<username-github>.github.io`)
- `kv_namespaces[0].id` → id-ul returnat mai sus

Apoi:

```sh
npx wrangler deploy
```

Va afișa un URL de forma `https://engleza-familie-worker.<subdomain>.workers.dev` — pune-l în [`js/config.js`](js/config.js), câmpul `WORKER_URL`.

### 4. Deploy frontend pe GitHub Pages

1. Creează un repo GitHub nou, push conținutul acestui folder.
2. **Settings → Pages** → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Așteaptă 1-2 minute, apoi accesează URL-ul afișat de GitHub Pages.

## Verificare pas cu pas

1. **Worker funcționează izolat** — din terminal:
   ```sh
   curl -X POST https://engleza-familie-worker.<subdomain>.workers.dev/chat \
     -H "content-type: application/json" \
     -d '{"userEmail":"test@example.com","profileId":"business-conversational","messages":[{"role":"user","content":"Hello"}]}'
   ```
   Trebuie să primești un JSON cu un câmp `reply`.

2. **Pagina se încarcă** — deschide URL-ul GitHub Pages, verifică (F12 → Console) că nu apar erori.

3. **Google Sign-In** — click "Sign in with Google", confirmă accesul cerut (Drive appdata + email/profil). Trebuie să apară ecranul de chat cu numele tău.

4. **O conversație reală** — scrie un mesaj, trimite. Trebuie să apară un răspuns în câteva secunde. (F12 → Network → confirmă `POST /chat` cu status 200.)

5. **Confirmare salvare Drive** — fișierele `appDataFolder` sunt ascunse din Drive UI normal (așa e menit — nu-ți încarcă Drive-ul vizibil). Click pe butonul "Show saved data" din chat ca să vezi JSON-ul salvat direct pe pagină.

6. **Confirmare buget** — indicatorul "Usage this month: $X.XX / $10" din header crește după fiecare mesaj. Test soft-block (opțional, fără cost real): în `worker/src/budget.js`, schimbă temporar `BUDGET_USD_PER_MONTH` la `0.01`, `npx wrangler deploy`, trimite un mesaj — trebuie să vezi mesajul de buget depășit și (Network tab) nicio cerere reală către Claude. Restaurează la `10` și redeploy.

7. **Confirmare prompt caching** (opțional) — trimite 2 mesaje în aceeași sesiune, rulează `npx wrangler tail` în timp ce testezi, verifică `usage.cache_read_input_tokens` în răspunsul Claude logat. Dacă e 0 la al doilea mesaj, promptul de sistem (`worker/src/prompts/business-conversational.js`) e sub pragul minim de cache al modelului — spune-mi și îl extindem.

## Ce urmează după ce V1 e validat

- Celelalte 3 profiluri (primar, gimnazial, liceal pentru copii) — inclusiv mascota "Socatei" și gamification.
- Input vocal (Web Speech API, gratuit, din browser).
- Ecran de selecție profil (necesar când apare profilul #2).
