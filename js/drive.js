const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

function fileNameForProfile(profileId) {
  return `engleza-familie-${profileId}.json`;
}

// Fills in any feature-gated field a state object is missing, without
// touching fields that already exist. Applied both to brand-new files
// (defaultState) and to existing files loaded from Drive (getOrCreateState)
// — a returning user's file predates whichever feature was added most
// recently, so this is how older files pick up new fields without a real
// migration step (matches this app's additive-only schema philosophy).
function applyFeatureDefaults(state, features) {
  if (features && features.gamification && !state.gamification) {
    state.gamification = {
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      badges: [],
    };
  }

  if (features && features.parentVisible && !state.parentSync) {
    state.parentSync = {
      todayDate: null,
      todayTurns: [],
      lastSyncedAt: null,
    };
  }

  if (features && features.lessons && !state.lessons) {
    state.lessons = {
      lastLessonId: null,
      completed: {}, // lessonId -> { bestScore, attempts, lastCompletedAt, wordsEverCorrect: [] }
    };
  }

  // Separate from state.lessons on purpose — Intermediate's sentence lessons
  // reuse the same lesson ids (e.g. "animals") for a different content bank
  // with a different max score, so namespacing ids inside one shared object
  // would risk badge-counting collisions between tiers.
  if (features && features.lessonsIntermediate && !state.lessonsIntermediate) {
    state.lessonsIntermediate = {
      lastLessonId: null,
      completed: {}, // lessonId -> { bestScore, attempts, lastCompletedAt, itemsEverCorrect: [] }
    };
  }

  if (features && features.reading && !state.reading) {
    state.reading = {
      lastPassageId: null,
      completed: {}, // passageId -> { bestScore, attempts, lastCompletedAt }
    };
  }

  return state;
}

function defaultState({ profileId, userEmail, displayName, level, features }) {
  const now = new Date().toISOString();
  const state = {
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

  return applyFeatureDefaults(state, features);
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
export async function getOrCreateState(accessToken, { profileId, userEmail, displayName, level, features }) {
  const filename = fileNameForProfile(profileId);
  let fileId = await findFile(accessToken, filename);

  if (!fileId) {
    const initial = defaultState({ profileId, userEmail, displayName, level, features });
    fileId = await createFile(accessToken, filename, initial);
    return { fileId, data: initial };
  }

  const data = await loadFileContent(accessToken, fileId);
  applyFeatureDefaults(data, features); // patch in any fields added since this file was created
  return { fileId, data };
}

export async function saveState(accessToken, fileId, data) {
  data.lastUpdatedAt = new Date().toISOString();
  await saveFileContent(accessToken, fileId, data);
}
