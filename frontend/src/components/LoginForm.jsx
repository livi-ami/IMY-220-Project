import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "./FormField.jsx";
import useForm from "../hooks/useForm.js";
import { validateLogin } from "../utils/validators.js";
import { signIn } from "../api.js";

export default function LoginForm() {
  const navigate = useNavigate();
  const { values, errors, touched, valid, handleChange, handleBlur } = useForm(
    { email: "", password: "" },
    validateLogin
  );
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setStatus({ loading: true, error: "" });
    try {
      const data = await signIn(values);
      navigate("/home", { state: { user: data.user } });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Email Address" name="email" type="email" autoComplete="email"
        value={values.email} onChange={handleChange} onBlur={handleBlur}
        error={errors.email} touched={touched.email} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password"
        value={values.password} onChange={handleChange} onBlur={handleBlur}
        error={errors.password} touched={touched.password} />
      {status.error && <p className="form-error" role="alert">{status.error}</p>}
      <button type="submit" className="btn btn-pink auth-submit" disabled={!valid || status.loading}>
        {status.loading ? "Logging in..." : "Let\u2019s go!"}
      </button>
    </form>
  );
}
