import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitForm(event) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await loginUser(form);
      const from = location.state?.from;
      navigate(typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally { setSubmitting(false); }
  }

  return (
    <AuthLayout>
      <form className="auth-box" onSubmit={submitForm}>
        <p className="eyebrow">YOUR WORKDAY STARTS HERE</p>
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
            placeholder="Enter your password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}<span aria-hidden="true">→</span>
        </button>
        <p className="auth-account-note">Use the email address registered with your team.</p>
      </form>
    </AuthLayout>
  );
}

export default Login;
