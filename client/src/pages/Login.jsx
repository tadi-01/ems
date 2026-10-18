import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

// Shows the login form and sends valid details to the backend.
function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Updates one form field when the user types.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Submits login details and opens the protected dashboard.
  async function submitForm(event) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await loginUser(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally { setSubmitting(false); }
  }

  return (
    <AuthLayout>
      <form className="auth-box" onSubmit={submitForm}>
        <p className="eyebrow">Your workspace</p>
        <h2>Welcome back</h2>
        <p className="auth-description">Log in to continue to your workspace.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
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
            autoComplete="current-password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
        <p>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
