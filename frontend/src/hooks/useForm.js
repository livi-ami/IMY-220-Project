import { useState } from "react";

// Small reusable form hook: tracks values, touched fields and validation errors.
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});

  const errors = validate(values);
  const valid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    setValues((v) => ({ ...v, [name]: type === "file" ? files[0] || null : value }));
    if (type === "file") setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const reset = () => {
    setValues(initialValues);
    setTouched({});
  };

  return { values, errors, touched, valid, handleChange, handleBlur, reset, setValues };
}
