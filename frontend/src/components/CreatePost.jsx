import { useEffect, useState } from "react";
import FormField from "./FormField.jsx";
import useForm from "../hooks/useForm.js";
import { validatePost } from "../utils/validators.js";

//form for adding a post - backend coming
export default function CreatePost({ onCreated }) {
  const { values, errors, touched, valid, handleChange, handleBlur, reset } = useForm(
    { image: null, caption: "", event: "", tags: "" },
    validatePost
  );
  const [preview, setPreview] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!values.image || !values.image.type.startsWith("image/")) \
    {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(values.image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [values.image]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onCreated?.(values);
    reset();
    setFormKey((k) => k + 1);
    setDone(true);
  };

  return (
    <form key={formKey} className="panel post-form" onSubmit={handleSubmit} noValidate>
      <h2>Create a post</h2>
      {done && <p className="form-success" role="status">Post created. It will be saved once the backend is connected.</p>}

      <FormField label="Photo" name="image" type="file" accept="image/*"
        onChange={(e) => { setDone(false); handleChange(e); }} onBlur={handleBlur}
        error={errors.image} touched={touched.image} />
      {preview && <img className="upload-preview" src={preview} alt="Selected upload preview" />}

      <FormField label="Caption" name="caption" as="textarea" rows={3} maxLength={320}
        value={values.caption} onChange={handleChange} onBlur={handleBlur}
        error={errors.caption} touched={touched.caption} />
      <FormField label="Event name" name="event" placeholder="e.g. Enhypen - Fate Tour"
        value={values.event} onChange={handleChange} onBlur={handleBlur}
        error={errors.event} touched={touched.event} />
      <FormField label="Hashtags" name="tags" placeholder="#enhypen #fatetour" hint="Optional. Separate with spaces."
        value={values.tags} onChange={handleChange} onBlur={handleBlur}
        error={errors.tags} touched={touched.tags} />

      <button type="submit" className="btn btn-pink" disabled={!valid}>Publish post</button>
    </form>
  );
}