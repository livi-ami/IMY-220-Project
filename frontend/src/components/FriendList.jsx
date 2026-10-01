import ProfilePreview from "./ProfilePreview.jsx";

export default function FriendList({ friends }) {
  if (!friends.length) return <p className="empty">No friends yet. Find people on the search page.</p>;
  return (
    <section className="friend-list" aria-label="Friends">
      {friends.map((f) => (
        <ProfilePreview key={f.id} user={f} />
      ))}
    </section>
  );
}