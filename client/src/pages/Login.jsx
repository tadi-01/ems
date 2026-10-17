import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

// Shows the login form and sends valid details to the backend.
function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Updates one form field when the user types.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Submits login details and opens the protected dashboard.
  async function submitForm(event) {
    event.preventDefault();
    setError("");
    try {
      await loginUser(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    }
  }

  return (
    <main className="page">
      <form className="auth-box" onSubmit={submitForm}>
        <p className="eyebrow">Employee Management System</p>
        <h1>Log in</h1>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        <button className="button" type="submit">
          Log in
        </button>
        <p>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
