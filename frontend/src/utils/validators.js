// Client-side validation. Each validator returns an object of { fieldName: errorMessage }.
// An empty object means the form is valid.

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const parseTags = (str) =>
  str.split(/[\s,]+/).filter(Boolean).map((t) => t.replace(/^#/, ""));

export function validateLogin({ email, password }) {
  const e = {};
  if (!email.trim()) e.email = "Email is required.";
  else if (!isEmail(email)) e.email = "Enter a valid email address.";
  if (!password) e.password = "Password is required.";
  return e;
}

export function validateSignup({ username, email, password, confirm }) {
  const e = {};
  if (!username.trim()) e.username = "Username is required.";
  else if (!/^[A-Za-z0-9_.]{3,20}$/.test(username))
    e.username = "3-20 characters: letters, numbers, _ or . only.";

  if (!email.trim()) e.email = "Email is required.";
  else if (!isEmail(email)) e.email = "Enter a valid email address.";

  if (!password) e.password = "Password is required.";
  else if (password.length < 8) e.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    e.password = "Include at least one letter and one number.";

  if (!confirm) e.confirm = "Please repeat your password.";
  else if (confirm !== password) e.confirm = "Passwords do not match.";
  return e;
}

export function validatePostDetails({ caption, event, tags }) {
  const e = {};
  if (!caption.trim()) e.caption = "Add a caption.";
  else if (caption.length > 300) e.caption = "Caption must be 300 characters or fewer.";
  if (!event.trim()) e.event = "Tell us which event this is from.";
  else if (event.length > 60) e.event = "Event name must be 60 characters or fewer.";
  if (tags.length > 100) e.tags = "Tags must be 100 characters or fewer.";
  return e;
}

export function validatePost(values) {
  const e = validatePostDetails(values);
  const { image } = values;
  if (!image) e.image = "Choose a photo to upload.";
  else if (!image.type.startsWith("image/")) e.image = "That file is not an image.";
  else if (image.size > 5 * 1024 * 1024) e.image = "Image must be smaller than 5MB.";
  return e;
}

export function validateProfile({ username, bio }) {
  const e = {};
  if (!username.trim()) e.username = "Username is required.";
  else if (!/^[A-Za-z0-9_.]{3,20}$/.test(username))
    e.username = "3-20 characters: letters, numbers, _ or . only.";
  if (bio.length > 160) e.bio = "Bio must be 160 characters or fewer.";
  return e;
}