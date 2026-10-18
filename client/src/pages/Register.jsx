import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <AuthLayout>
      <form className="auth-box" onSubmit={submitForm}>
        <p className="eyebrow">Your workspace</p>
        <h2>Join your team</h2>
        <p className="auth-description">Create your employee account to get started.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <label>
          Name
          <input
            name="name"
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
            minLength="6"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p>
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
