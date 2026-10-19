import { Link } from "react-router-dom";
import { ArrowRight, Checkmark } from "@carbon/icons-react";

// Shares the reference's split layout while keeping the existing account forms.
function AuthLayout({ children, registering = false }) {
  return <div className="auth-shell">
    <a className="skip-link" href="#account-form">Skip to form</a>
    <header className="auth-header">
      <Link to="/login" className="shell-brand">EMS <span>Employee Management</span></Link>
      <span className="auth-header-label">Your team workspace</span>
    </header>
    <main className="auth-layout">
      <section className="auth-intro" aria-labelledby="auth-story-title">
        <div className="auth-story">
          <p className="eyebrow"><span className="auth-dot" aria-hidden="true" />YOUR PEOPLE. ONE WORKSPACE.</p>
          <h1 id="auth-story-title">A little structure.<br />A clearer workday.</h1>
          <p>Keep your people, time off and payroll together, with space to focus on the work ahead.</p>
        </div>
        <div className="auth-art" aria-hidden="true">
          <div className="auth-orbit" /><div className="auth-orbit auth-orbit-second" />
          <div className="auth-tile auth-tile-back" /><div className="auth-tile auth-tile-middle" />
          <div className="auth-tile auth-tile-front"><span>+</span></div>
          <div className="auth-art-caption"><span>PEOPLE & ORGANISATION</span><span>TIME & PAY ↗</span></div>
        </div>
        <div className="auth-benefits">
          <p><Checkmark size={16} aria-hidden="true" /> A clear view of your team and departments</p>
          <p><Checkmark size={16} aria-hidden="true" /> Attendance, leave and payslips in one place</p>
          <p className="auth-story-note">Everything you need for the working day.</p>
        </div>
      </section>
      <section className="auth-form-area" aria-label={registering ? "Create an account" : "Sign in"}>
        <div id="account-form" className="auth-form-content" tabIndex="-1">
          {children}
        <p className="auth-switch">{registering ? "Already have an account?" : "New to your team workspace?"}{" "}
          <Link to={registering ? "/login" : "/register"}>{registering ? "Log in" : "Create an account"} <ArrowRight size={16} aria-hidden="true" /></Link>
        </p>
        </div>
        <footer className="auth-panel-footer"><span>Employee Management System</span><span>Need help? Contact Admin or HR.</span></footer>
      </section>
    </main>
  </div>;
}

export default AuthLayout;
