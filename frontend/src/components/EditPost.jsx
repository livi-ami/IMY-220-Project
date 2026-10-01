import FormField from "./FormField.jsx";
import useForm from "../hooks/useForm.js";
import { validatePostDetails, parseTags } from "../utils/validators.js";

export default function EditPost({ post, onSave, onCancel }) {
  const { values, errors, touched, valid, handleChange, handleBlur } = useForm(
    { caption: post.caption, event: post.event, tags: post.tags.map((t) => `#${t}`).join(" ") },
    validatePostDetails
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({ caption: values.caption.trim(), event: values.event.trim(), tags: parseTags(values.tags) });
  };

  return (
    <form className="panel post-form" onSubmit={handleSubmit} noValidate>
      <h2>Edit post</h2>
      <FormField label="Caption" name="caption" as="textarea" rows={3} maxLength={320}
        value={values.caption} onChange={handleChange} onBlur={handleBlur}
        error={errors.caption} touched={touched.caption} />
      <FormField label="Event name" name="event"
        value={values.event} onChange={handleChange} onBlur={handleBlur}
        error={errors.event} touched={touched.event} />
      <FormField label="Hashtags" name="tags" hint="Separate with spaces."
        value={values.tags} onChange={handleChange} onBlur={handleBlur}
        error={errors.tags} touched={touched.tags} />
      <div className="form-actions">
        <button type="submit" className="btn btn-pink" disabled={!valid}>Save changes</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
