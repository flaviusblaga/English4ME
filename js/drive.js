const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

function fileNameForProfile(profileId) {
  return `engleza-familie-${profileId}.json`;
}

function defaultState({ profileId, userEmail, displayName, level }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    profileId,
    userEmail,
    displayName,
    level,
    createdAt: now,
    lastUpdatedAt: now,
    lastScenarioId: null,
    documentContext: {},
    conversation: { summary: "", recentTurns: [] },
    progress: {
      sessionsCompleted: 0,
      totalTurns: 0,
      topicsPracticed: [],
      recurringCorrections: [],
    },
    usageSnapshot: {
      note: "Best-effort mirror of server-side usage tracking; not authoritative for budget enforcement.",
      monthKey: "",
      estimatedCostUsd: 0,
      budgetUsd: 10,
      lastSyncedAt: now,
    },
  };
}

async function findFile(accessToken, filename) {
  const query = encodeURIComponent(`name='${filename}' and trashed=false`);
  const url = `${DRIVE_FILES_URL}?spaces=appDataFolder&q=${query}&fields=files(id,name)`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Drive search failed: ${response.status}`);
  }
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

async function createFile(accessToken, filename, content) {
  const metadata = { name: filename, parents: ["appDataFolder"] };
  const boundary = "engleza-familie-boundary";
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${JSON.stringify(content)}\r\n` +
    `--${boundary}--`;

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`Drive file create failed: ${response.status}`);
  }
  const data = await response.json();
  return data.id;
}

async function loadFileContent(accessToken, fileId) {
  const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Drive file load failed: ${response.status}`);
  }
  return response.json();
}

async function saveFileContent(accessToken, fileId, content) {
  const response = await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(content),
  });
  if (!response.ok) {
    throw new Error(`Drive file save failed: ${response.status}`);
  }
}

// Returns { fileId, data } — creates the file with default content on first use.
export async function getOrCreateState(accessToken, { profileId, userEmail, displayName, level }) {
  const filename = fileNameForProfile(profileId);
  let fileId = await findFile(accessToken, filename);

  if (!fileId) {
    const initial = defaultState({ profileId, userEmail, displayName, level });
    fileId = await createFile(accessToken, filename, initial);
    return { fileId, data: initial };
  }

  const data = await loadFileContent(accessToken, fileId);
  return { fileId, data };
}

export async function saveState(accessToken, fileId, data) {
  data.lastUpdatedAt = new Date().toISOString();
  await saveFileContent(accessToken, fileId, data);
}
