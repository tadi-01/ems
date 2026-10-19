import { useEffect, useState } from "react";
import api from "../services/api";

// Shows deadlines without presenting planned payments as executed transfers.
function PayrollSchedule() {
  const [schedule, setSchedule] = useState(null), [error, setError] = useState("");
  useEffect(() => { load(); }, []);
  // Reads the company schedule for Admin and HR.
  async function load() {
    try { const { data } = await api.get("/payroll/schedule"); setSchedule(data); setError(""); }
    catch { setError("Could not load payroll dates."); }
  }
  if (error) return <p role="alert">{error} <button onClick={load}>Retry</button></p>;
  return schedule && <p className="notice">Prepare {schedule.preparation} · Approval due {schedule.approvalDue} · Planned payment {schedule.plannedPayment}. Automatic preparation {schedule.automaticPreparation ? "enabled" : "disabled"}.</p>;
}
export default PayrollSchedule;
