# Informare pentru familiile invitate

Textul de mai jos e de trimis **fiecărei familii înainte** de a le adăuga adresele.
E scris ca să poată fi copiat ca atare într-un mesaj.

---

## Ce e „Socatei"

O aplicație de învățat engleza pe care am făcut-o pentru copiii mei. O găzduiesc eu,
pe cont propriu, și o ofer gratuit. Nu e un produs comercial și nu are în spate o firmă.

## Ce date se salvează și unde

**În Google Drive-ul fiecărui copil (privat)**
Progresul, punctajul și nivelul se salvează într-un folder ascuns din contul Google
**al copilului**. Eu nu am acces la el — nici tehnic, nici altfel.

**Cum vezi tu ce a exersat copilul**
Aplicația creează automat un document Google numit **„Socatei — Progres [nume]"**,
îl păstrează în Drive-ul copilului și **ți-l partajează ție**. Primești un email cu
linkul, o singură dată. Documentul se actualizează singur, o dată pe zi, și conține
punctajul, șirul de zile, câte cuvinte știe și ce mai are de exersat.

✅ **Acest document circulă doar între contul copilului tău și al tău.
La mine nu ajunge nimic.** Nu am cum să văd progresul copilului tău.

**Ce NU se salvează:** conversațiile copilului (nu se stochează nicăieri în afara
dispozitivului lui), parole (autentificarea e făcută integral de Google — eu nu văd
nicio parolă), date de plată, adrese, numere de telefon.

## Cine poate vedea ce

- Tu vezi **doar copiii din familia ta**.
- Alte familii **nu văd nimic** despre voi, iar voi nu vedeți nimic despre ele.
- Copiii nu văd progresul altor copii, nici măcar al fraților.
- Eu văd doar familia mea. Documentul de progres al copilului tău e partajat exclusiv
  cu adresele părinților din familia ta.

## Conversațiile trec prin Anthropic

Personajele sunt animate de Claude, un serviciu al companiei Anthropic. Mesajele
copilului se trimit acolo ca să primească răspuns. Se aplică politica lor de
confidențialitate. Eu plătesc pentru utilizare; vouă nu vi se cere nimic.

## La prima conectare

Google va afișa un avertisment: *„Google hasn't verified this app"*. E normal —
aplicația e privată și nu a trecut prin procesul de verificare Google, care e gândit
pentru aplicații publice. Apăsați **Advanced** → **Go to Socatei**.

## Dacă vrei să te retragi

Spune-mi și îți șterg adresele. Documentul de progres e în Drive-ul copilului — îl
puteți șterge oricând, ca pe orice alt fișier. Nu rămâne nimic la mine.

## Dacă NU vrei nici documentul de progres

Se poate. Aplicația merge identic pentru copil, doar că nu se mai generează raportul.
Spune-mi și îl dezactivez pentru familia ta.

---

# Note tehnice (pentru administrator, nu de trimis)

Două comutatoare independente, per familie:

**`driveReport`** în `js/profile.js` — raportul Google Doc.
- `true` — aplicația copilului creează documentul în Drive-ul LUI și îl partajează cu
  adulții familiei. Nu se stochează nimic la administrator.
- `false` / absent — nu se generează nimic.

**`progressMirror`** în `worker/src/families.js` — oglinda din Cloudflare KV.
- `true` — se stochează conversațiile în contul administratorului; părinții le pot citi
  din tabloul de bord al aplicației.
- `false` — nu se scrie nimic. `handleProgressSync` răspunde `{ ok: true, stored: false }`,
  deci aplicația copilului merge normal, fără erori.

**Pentru familii din afara gospodăriei administratorului**, combinația corectă este
`driveReport: true` + `progressMirror: false` — părintele își vede copilul, iar
administratorul nu găzduiește datele nimănui.

`progressMirror` e verificat **pe server**, la fiecare cerere, pe baza emailului validat
la Google — nu poate fi ocolit din browser. `driveReport` rulează în browser: nu e o
barieră de securitate, ci doar comutatorul funcției (partajarea o face Google, iar
destinatarii sunt exclusiv adresele din familia acelui copil).
