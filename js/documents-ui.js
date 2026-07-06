// Manages the "documents for this scenario" panel: showing what's saved,
// letting the user add/remove files for the active scenario, and triggering
// the one-time extraction call. chat.js owns session/state; this module only
// reports back a finished { text, files, extractedAt } entry via onSaved.

import { extractDocuments } from "./worker-client.js";

const EXTENSION_MEDIA_TYPES = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  txt: "text/plain",
};

let userEmail = null;
let getScenarioId = null;
let getScenarioLabel = null;
let onSavedCallback = null;
let pendingFiles = []; // File objects added during the current open edit session

function el(id) {
  return document.getElementById(id);
}

export function initDocumentsUi({ userEmail: email, getScenarioId: getId, getScenarioLabel: getLabel, onSaved }) {
  userEmail = email;
  getScenarioId = getId;
  getScenarioLabel = getLabel;
  onSavedCallback = onSaved;

  el("scenario-documents-manage-btn").addEventListener("click", openPanel);
  el("scenario-documents-cancel-btn").addEventListener("click", closePanel);
  el("scenario-documents-file-input").addEventListener("change", handleFilesAdded);
  el("scenario-documents-save-btn").addEventListener("click", handleSave);
}

// Call whenever the active scenario changes or on initial load, passing the
// current Drive entry for that scenario (or null/undefined if none saved yet).
export function refreshDocumentsSummary(entry) {
  const scenarioId = getScenarioId();
  const container = el("scenario-documents");

  if (!scenarioId) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  closePanel();

  const label = el("scenario-documents-label");
  if (entry && entry.files && entry.files.length > 0) {
    const names = entry.files.map((f) => f.filename).join(", ");
    const date = new Date(entry.extractedAt).toLocaleDateString();
    label.textContent = `Using your saved documents: ${names} (added ${date})`;
  } else {
    label.textContent = "No documents added for this scenario yet.";
  }
}

function openPanel() {
  pendingFiles = [];
  renderPendingList();
  setStatus("", false);
  el("scenario-documents-panel").hidden = false;
}

function closePanel() {
  pendingFiles = [];
  el("scenario-documents-file-input").value = "";
  el("scenario-documents-panel").hidden = true;
  setStatus("", false);
}

function handleFilesAdded(event) {
  for (const file of event.target.files) {
    pendingFiles.push(file);
  }
  event.target.value = "";
  renderPendingList();
}

function renderPendingList() {
  const list = el("scenario-documents-list");
  list.innerHTML = "";
  pendingFiles.forEach((file, index) => {
    const item = document.createElement("li");
    item.textContent = file.name + " ";
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.className = "btn btn-small";
    removeBtn.addEventListener("click", () => {
      pendingFiles.splice(index, 1);
      renderPendingList();
    });
    item.appendChild(removeBtn);
    list.appendChild(item);
  });
}

function setStatus(message, isError) {
  const status = el("scenario-documents-status");
  status.textContent = message;
  status.hidden = !message;
  status.classList.toggle("error", !!isError);
}

function detectMediaType(file) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop().toLowerCase();
  return EXTENSION_MEDIA_TYPES[ext] || "";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleSave() {
  const scenarioId = getScenarioId();
  if (!scenarioId) return;

  if (pendingFiles.length === 0) {
    setStatus("Add at least one file first.", true);
    return;
  }

  el("scenario-documents-save-btn").disabled = true;
  el("chat-send").disabled = true;
  setStatus("Reading your documents… this can take a few seconds.", false);

  try {
    const files = await Promise.all(
      pendingFiles.map(async (file) => ({
        filename: file.name,
        mediaType: detectMediaType(file),
        dataBase64: await fileToBase64(file),
      }))
    );

    const result = await extractDocuments({ userEmail, scenarioId, files });

    const entry = {
      text: result.documentContext,
      files: pendingFiles.map((f) => ({ filename: f.name, uploadedAt: new Date().toISOString() })),
      extractedAt: new Date().toISOString(),
    };

    closePanel();
    onSavedCallback(scenarioId, entry);
  } catch (err) {
    setStatus(err.message || "Something went wrong while reading the documents.", true);
  } finally {
    el("scenario-documents-save-btn").disabled = false;
    el("chat-send").disabled = false;
  }
}
