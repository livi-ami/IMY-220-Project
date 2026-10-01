import { useEffect, useState } from "react";
import FormField from "./FormField.jsx";
import Avatar from "./Avatar.jsx";
import useForm from "../hooks/useForm.js";
import { validateProfile } from "../utils/validators.js";

export default function EditProfile({ user, onSave, onCancel }) {
  const { values, errors, touched, valid, handleChange, handleBlur } = useForm(
    { username: user.username, bio: user.bio || "", avatar: null },
    validateProfile
  );
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || null);

  useEffect(() => {
    if (!values.avatar) return;
    const url = URL.createObjectURL(values.avatar);
    setAvatarUrl(url);
  }, [values.avatar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({ username: values.username.trim(), bio: values.bio.trim(), avatar: avatarUrl });
  };

  return (
    <form className="panel post-form" onSubmit={handleSubmit} noValidate>
      <h2>Edit profile</h2>
      <div className="edit-avatar">
        <Avatar user={{ ...user, avatar: avatarUrl }} size={72} />
        <FormField label="Profile picture" name="avatar" type="file" accept="image/*"
          onChange={handleChange} onBlur={handleBlur} />
      </div>
      <FormField label="Username" name="username"
        value={values.username} onChange={handleChange} onBlur={handleBlur}
        error={errors.username} touched={touched.username} />
      <FormField label="Bio" name="bio" as="textarea" rows={3} maxLength={180}
        hint={`${values.bio.length}/160`}
        value={values.bio} onChange={handleChange} onBlur={handleBlur}
        error={errors.bio} touched={touched.bio} />
      <div className="form-actions">
        <button type="submit" className="btn btn-pink" disabled={!valid}>Save changes</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
