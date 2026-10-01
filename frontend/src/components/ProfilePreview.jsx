import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";

// Small profile summary used in friend lists and search results
export default function ProfilePreview({ user }) {
  return (
    <article className="profile-preview">
      <Link to={`/profile/${user.id}`} className="profile-preview__link">
        <Avatar user={user} size={52} />
        <div className="profile-preview__info">
          <h3>@{user.username}</h3>
          <p>{user.bio}</p>
          <span>{user.followers} followers</span>
        </div>
      </Link>
    </article>
  );
}