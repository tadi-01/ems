import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

// Shows the registration form and creates a new user account.
function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });
  const [error, setError] = useState("");

  // Updates one form field when the user types or selects a role.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Submits registration details and opens the protected dashboard.
  async function submitForm(event) {
    event.preventDefault();
    setError("");
    try {
      await registerUser(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    }
  }

  return (
    <main className="page">
      <form className="auth-box" onSubmit={submitForm}>
        <p className="eyebrow">Employee Management System</p>
        <h1>Create account</h1>
        {error && <p className="error">{error}</p>}
        <label>
          Name
          <input
            name="name"
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
            minLength="6"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={updateField}>
            <option>Employee</option>
            <option>HR</option>
            <option>Admin</option>
          </select>
        </label>
        <button className="button" type="submit">
          Register
        </button>
        <p>
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
