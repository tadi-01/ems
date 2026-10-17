import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

// Sends registration details to the server and saves the returned login.
async function registerUser(userDetails) {
  const response = await api.post("/auth/register", userDetails);
  saveLogin(response.data);
  return response.data;
}

// Sends login details to the server and saves the returned login.
async function loginUser(loginDetails) {
  const response = await api.post("/auth/login", loginDetails);
  saveLogin(response.data);
  return response.data;
}

// Saves the token and safe user details for protected pages.
function saveLogin(loginData) {
  localStorage.setItem("token", loginData.token);
  localStorage.setItem("user", JSON.stringify(loginData.user));
}

export { registerUser, loginUser };
