import { initAuth, signIn, signOut, getAccessToken, getUserInfo } from "./auth.js";
import { getOrCreateState } from "./drive.js";
import { initChat } from "./chat.js";
import { ACTIVE_PROFILE } from "./profile.js";

function el(id) {
  return document.getElementById(id);
}

function showScreen(name) {
  el("screen-login").hidden = name !== "login";
  el("screen-chat").hidden = name !== "chat";
}

async function handleLogin() {
  el("login-error").hidden = true;
  el("login-btn").disabled = true;

  try {
    const user = await signIn();
    const accessToken = getAccessToken();

    const { fileId, data } = await getOrCreateState(accessToken, {
      profileId: ACTIVE_PROFILE.id,
      userEmail: user.email,
      displayName: user.name,
      level: ACTIVE_PROFILE.level,
    });

    el("current-user-name").textContent = user.name;
    el("current-profile-name").textContent = ACTIVE_PROFILE.displayName;

    initChat({
      accessToken,
      userEmail: user.email,
      displayName: user.name,
      fileId,
      state: data,
    });

    showScreen("chat");
  } catch (err) {
    el("login-error").textContent = `Sign-in failed: ${err.message}`;
    el("login-error").hidden = false;
  } finally {
    el("login-btn").disabled = false;
  }
}

function handleLogout() {
  signOut();
  showScreen("login");
}

window.addEventListener("DOMContentLoaded", () => {
  initAuth();
  el("login-btn").addEventListener("click", handleLogin);
  el("logout-btn").addEventListener("click", handleLogout);
  showScreen("login");
});
