// Reads saved user details safely, including after storage was cleared or damaged.
function getSavedUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

// Removes both saved values so an expired login cannot keep rendering protected pages.
function clearLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Reads only the expiry for navigation; the server still verifies the signature.
function hasActiveToken() {
  try {
    const token = localStorage.getItem("token");
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return Number.isFinite(exp) && exp * 1000 > Date.now();
  } catch { return false; }
}

export { getSavedUser, clearLogin, hasActiveToken };
