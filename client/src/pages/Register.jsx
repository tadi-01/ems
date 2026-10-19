import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

// Shows the registration form and creates a new Employee account.
// The role is not chosen here: the server makes every new user an Employee.
function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Updates one form field when the user types.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Submits registration details and opens the protected dashboard.
  async function submitForm(event) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await registerUser(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally { setSubmitting(false); }
  }

  return (
    <AuthLayout registering>
      <form className="auth-box" onSubmit={submitForm}>
        <p className="eyebrow">YOUR TEAM WORKSPACE STARTS HERE</p>
        <h2>Make yourself at home.</h2>
        <p className="auth-description">Create your employee account to get started.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <label>
          Name
          <input
            name="name"
            placeholder="Enter your full name"
            autoComplete="name"
            value={form.name}
            onChange={updateField}
            required
          />
        </label>
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
            autoComplete="new-password"
            placeholder="Create a password"
            minLength="6"
            aria-describedby="password-help"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        <p id="password-help" className="auth-helper">Use at least 6 characters.</p>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}<span aria-hidden="true">→</span>
        </button>
        <p className="auth-account-note">Once registered, Admin or HR can link your account to your employee record.</p>
      </form>
    </AuthLayout>
  );
}

export default Register;
