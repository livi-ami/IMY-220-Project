import Avatar from "./Avatar.jsx";

// Banner, avatar, name, bio, stats and the main action button
export default function ProfileHeader({ user, isOwn, isFriend, postCount, onToggleFriend, onEdit, onNewPost }) {
  const [a, b] = user.banner;
  return (
    <section className="profile-header" aria-label="Profile">
      <div className="profile-banner" style={{ background: `linear-gradient(120deg, ${a}, ${b})` }} />
      <div className="profile-header__body">
        <div className="profile-header__avatar">
          <Avatar user={user} size={130} />
        </div>
        <div className="profile-header__info">
          <h1>@{user.username}</h1>
          <p className="bio">{user.bio || "No bio yet."}</p>
        </div>
        <div className="profile-header__actions">
          {isOwn ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>Edit profile</button>
              <button type="button" className="btn btn-pink btn-sm" onClick={onNewPost}>+ New post</button>
            </>
          ) : (
            <button
              type="button"
              className={`btn btn-sm ${isFriend ? "btn-ghost" : "btn-pink"}`}
              aria-pressed={isFriend}
              onClick={onToggleFriend}
            >
              {isFriend ? "Friends \u2713" : "Add friend +"}
            </button>
          )}
        </div>
      </div>

      <dl className="profile-stats">
        <div><dd>{postCount}</dd><dt>Posts</dt></div>
        <div><dd>{user.followers + (isFriend && !isOwn ? 1 : 0)}</dd><dt>Followers</dt></div>
        <div><dd>{user.following}</dd><dt>Following</dt></div>
      </dl>
    </section>
  );
}