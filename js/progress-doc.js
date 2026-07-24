// Parent-visible progress WITHOUT the app owner holding the data.
//
// The Cloudflare mirror (worker/src/progress.js) keeps a copy of a child's
// practice in the app owner's own account, which is fine for the owner's
// household but means hosting other people's children's transcripts. This
// module is the alternative: the child's device publishes a Google Doc report
// into the CHILD's own Drive and shares it with their parents. Nothing touches
// the app owner.
//
// WHY THIS DIRECTION (child shares out) rather than the more obvious "parent
// makes a folder, child writes into it":
//   The drive.file scope is granted PER USER. A folder created by the parent's
//   session is authorised for the parent only — the child's app can neither
//   list it nor write into it, and the child has no way to be granted access
//   short of the Google Picker. A file the CHILD's app creates is authorised
//   for the child, and the app may then hand out permissions on it. So the
//   only direction that works within drive.file is outward from the child.
//
// Consequence worth knowing: the doc lives in the child's Drive, so a child
// could delete it. It regenerates on their next practice session.

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function todayLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatRoDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = String(isoDate).slice(0, 10).split("-");
  return day && month && year ? `${day}.${month}.${year}` : isoDate;
}

// Counts SRS items by how well they're known. Deliberately derived from the
// state alone (no word-list import) so the report can't break when the lesson
// content changes underneath it.
function srsSummary(state) {
  const buckets = state && state.srs ? state.srs : {};
  let seen = 0;
  let mastered = 0;
  for (const tier of Object.keys(buckets)) {
    const items = buckets[tier] || {};
    for (const label of Object.keys(items)) {
      seen++;
      const level = Number(items[label] && items[label].level) || 0;
      if (level >= 4) mastered++; // MASTERED_LEVEL in js/srs.js
    }
  }
  return { seen, mastered };
}

const LEVEL_LABEL = {
  "kids-primar": "Începător",
  "kids-intermediate": "Intermediar",
  "kids-advanced": "Avansat",
  "kids-expert": "Expert",
};

export function buildReportHtml({ state, memberName, profileId }) {
  const game = (state && state.gamification) || {};
  const progress = (state && state.progress) || {};
  const srs = srsSummary(state);
  const practiceDays = Array.isArray(game.practiceDays) ? game.practiceDays.slice(-14).reverse() : [];
  const corrections = Array.isArray(progress.recurringCorrections)
    ? progress.recurringCorrections.slice(0, 8)
    : [];

  const rows = [
    ["Nivel", LEVEL_LABEL[profileId] || profileId || "—"],
    ["Zile la rând", `${game.currentStreak || 0}`],
    ["Cel mai lung șir", `${game.longestStreak || 0}`],
    ["Zile active în total", `${game.totalActiveDays || 0}`],
    ["Puncte", `${game.points || 0}`],
    ["Lecții terminate", `${progress.sessionsCompleted || 0}`],
    ["Cuvinte întâlnite", `${srs.seen}`],
    ["Cuvinte știute bine", `${srs.mastered}`],
    ["Ultima practică", formatRoDate(game.lastPracticeDate)],
  ];

  return `<html><body>
<h1>Progres — ${escapeHtml(memberName)}</h1>
<p><i>Raport generat automat de aplicația English4ME pe ${formatRoDate(todayLocalDate())}.
Se actualizează singur după fiecare zi de practică.</i></p>

<h2>Pe scurt</h2>
<table border="1" cellpadding="6" cellspacing="0">
${rows.map(([label, value]) => `<tr><td><b>${escapeHtml(label)}</b></td><td>${escapeHtml(value)}</td></tr>`).join("\n")}
</table>

<h2>Zilele în care a exersat</h2>
${practiceDays.length
  ? `<p>${practiceDays.map((d) => escapeHtml(formatRoDate(d))).join(" · ")}</p>`
  : "<p>Încă nicio zi înregistrată.</p>"}

<h2>De exersat în continuare</h2>
${corrections.length
  ? `<ul>${corrections.map((c) => `<li>${escapeHtml(typeof c === "string" ? c : c.note || c.text || "")}</li>`).join("")}</ul>`
  : "<p>Nimic de semnalat deocamdată.</p>"}

<hr>
<p><small>Acest raport se află în Google Drive-ul copilului și e partajat cu tine.
Nu este stocat pe niciun alt server.</small></p>
</body></html>`;
}

async function driveFetch(url, options, what) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${what} failed: ${response.status} ${detail.slice(0, 200)}`);
  }
  return response;
}

// Creates the Doc by uploading HTML and asking Drive to convert it, so the
// parent opens a properly formatted document rather than a raw file.
async function createReportDoc(accessToken, title, html) {
  const metadata = { name: title, mimeType: "application/vnd.google-apps.document" };
  const boundary = "engleza-familie-progress-boundary";
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
    `${html}\r\n` +
    `--${boundary}--`;

  const response = await driveFetch(
    `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
    "Progress doc create"
  );
  return response.json();
}

async function updateReportDoc(accessToken, fileId, html) {
  await driveFetch(
    `${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "text/html; charset=UTF-8" },
      body: html,
    },
    "Progress doc update"
  );
}

// `sendNotificationEmail` is on only for the first share, so the parent gets
// one mail with the link and never hears from it again.
async function shareDocWith(accessToken, fileId, email) {
  await driveFetch(
    `${DRIVE_FILES_URL}/${fileId}/permissions?sendNotificationEmail=true&fields=id`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "user", emailAddress: email }),
    },
    "Progress doc share"
  );
}

// Creates the doc on first use, refreshes it at most once a day, and shares it
// with any parent not already added. Best-effort by design: a Drive hiccup must
// never interrupt a child's practice, so failures are recorded in state and
// retried tomorrow rather than surfaced.
//
// Returns { changed } so the caller knows whether state needs saving.
export async function publishProgressDoc({ accessToken, state, memberName, profileId, parentEmails }) {
  if (!accessToken || !state) return { changed: false };

  const doc = state.progressDoc || (state.progressDoc = { fileId: null, sharedWith: [], updatedOn: null, webViewLink: null });
  const today = todayLocalDate();
  const pendingShares = (parentEmails || []).filter((e) => e && !doc.sharedWith.includes(e));

  if (doc.updatedOn === today && pendingShares.length === 0) return { changed: false };

  const html = buildReportHtml({ state, memberName, profileId });
  let changed = false;

  try {
    if (!doc.fileId) {
      // Only NEW reports get this name — Drive keeps a file's title when it is
      // updated, so a report created before the rename stays "Socatei — …".
      const created = await createReportDoc(accessToken, `English4ME — Progres ${memberName}`, html);
      doc.fileId = created.id;
      doc.webViewLink = created.webViewLink || null;
    } else {
      await updateReportDoc(accessToken, doc.fileId, html);
    }
    doc.updatedOn = today;
    changed = true;
  } catch (err) {
    console.warn("[progress-doc] could not publish report:", err.message);
    return { changed: false };
  }

  for (const email of pendingShares) {
    try {
      await shareDocWith(accessToken, doc.fileId, email);
      doc.sharedWith.push(email);
      changed = true;
    } catch (err) {
      // A child account managed by Family Link may be blocked from sharing
      // outside its family, and a typo'd address 400s. Either way: keep the
      // report, skip this recipient, try again next time.
      console.warn(`[progress-doc] could not share with ${email}:`, err.message);
    }
  }

  return { changed };
}
