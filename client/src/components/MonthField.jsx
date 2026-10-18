// A labelled text field works consistently even in browsers without a month picker.
function MonthField({ value, onChange, disabled = false, required = false }) {
  return <label className="field">Month (YYYY-MM)
    <input name="month" type="text" placeholder="2026-10" pattern="[0-9]{4}-(0[1-9]|1[0-2])"
      value={value} onChange={onChange} disabled={disabled} required={required} />
  </label>;
}

export default MonthField;
