// Label + input/textarea + error message. Used by every form so markup isn't repeated.
export default function FormField({ label, name, error, touched, as: Tag = "input", hint, ...props }) {
  const id = `field-${name}`;
  const showError = touched && error;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} name={name} aria-invalid={showError ? "true" : "false"} {...props} />
      {hint && !showError && <p className="field-hint">{hint}</p>}
      {showError && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}