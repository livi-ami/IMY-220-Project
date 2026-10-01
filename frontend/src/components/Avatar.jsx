export default function Avatar({ user, size = 40 }) {
  if (user?.avatar) 
  {
    return (
      <img className="avatar" style={{ width: size, height: size }} src={user.avatar} alt={`${user.username}'s avatar`} />
    );
  }
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, background: user?.color || "var(--field)" }}
      aria-hidden="true"
    >
      {user?.username?.[0]?.toUpperCase() || "?"}
    </span>
  );
}
