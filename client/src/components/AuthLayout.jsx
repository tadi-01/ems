// Gives login and registration a shared identity and a focused form area.
function AuthLayout({ children }) {
  return <main className="auth-layout">
    <section className="auth-intro" aria-label="About Employee Management">
      <div className="brand"><span className="brand-mark">EM</span><span>Employee<br />Management</span></div>
      <div className="auth-story">
        <p className="section-label">Your people. One workspace.</p>
        <h1>A simpler way to<br />manage the workday.</h1>
        <p>Keep your team, time off and payroll organised, with the information you need in one place.</p>
        <div className="auth-features">
          <div><span>01</span><p><strong>People & departments</strong><br />A clear view of your organisation.</p></div>
          <div><span>02</span><p><strong>Attendance & leave</strong><br />Every workday accounted for.</p></div>
          <div><span>03</span><p><strong>Payroll & payslips</strong><br />Monthly records, easy to access.</p></div>
        </div>
      </div>
      <p className="auth-footer">Employee Management System</p>
    </section>
    <section className="auth-form-area">{children}</section>
  </main>;
}

export default AuthLayout;
