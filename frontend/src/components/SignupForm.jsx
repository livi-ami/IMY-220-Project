import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "./FormField.jsx";
import useForm from "../hooks/useForm.js";
import { validateSignup } from "../utils/validators.js";
import { signUp } from "../api.js";

export default function SignupForm() {
  const navigate = useNavigate();
  const { values, errors, touched, valid, handleChange, handleBlur } = useForm(
    { username: "", email: "", password: "", confirm: "" },
    validateSignup
  );
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setStatus({ loading: true, error: "" });
    try {
      const { username, email, password } = values;
      const data = await signUp({ username, email, password });
      navigate("/home", { state: { user: data.user } });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Username" name="username" autoComplete="username"
        value={values.username} onChange={handleChange} onBlur={handleBlur}
        error={errors.username} touched={touched.username} />
      <FormField label="Email Address" name="email" type="email" autoComplete="email"
        value={values.email} onChange={handleChange} onBlur={handleBlur}
        error={errors.email} touched={touched.email} />
      <FormField label="Password" name="password" type="password" autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        value={values.password} onChange={handleChange} onBlur={handleBlur}
        error={errors.password} touched={touched.password} />
      <FormField label="Repeat Password" name="confirm" type="password" autoComplete="new-password"
        value={values.confirm} onChange={handleChange} onBlur={handleBlur}
        error={errors.confirm} touched={touched.confirm} />
      {status.error && <p className="form-error" role="alert">{status.error}</p>}
      <button type="submit" className="btn btn-pink auth-submit" disabled={!valid || status.loading}>
        {status.loading ? "Creating account..." : "Let\u2019s go!"}
      </button>
    </form>
  );
}