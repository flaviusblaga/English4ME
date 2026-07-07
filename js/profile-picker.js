// A single browser/device preference (not account data — a shared family
// laptop may have different people picking different profiles), used only to
// pre-highlight a default on the picker screen. The picker screen itself is
// never skipped, so switching profiles always stays one click away.
const LAST_PROFILE_KEY = "engleza-familie:lastProfileId";

export function getRememberedProfileId() {
  return localStorage.getItem(LAST_PROFILE_KEY);
}

export function rememberProfileId(profileId) {
  localStorage.setItem(LAST_PROFILE_KEY, profileId);
}
