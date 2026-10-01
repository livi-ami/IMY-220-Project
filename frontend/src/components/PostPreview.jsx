import { useState } from "react";
import { Link } from "react-router-dom";
import PostImage from "./PostImage.jsx";
import Avatar from "./Avatar.jsx";
import { getUser } from "../data/dummyData.js";

// variant "card": image + footer (feeds). variant "grid": image only (profile grids).
export default function PostPreview({ post, variant = "card" }) {
  const author = getUser(post.userId);
  const [saved, setSaved] = useState(post.saved);
  const [liked, setLiked] = useState(post.liked);

  return (
    <article className={`post-card post-card--${variant}`}>
      <button
        type="button"
        className="post-card__save"
        aria-pressed={saved}
        aria-label={saved ? "Remove from your archive" : "Add to your archive"}
        onClick={() => setSaved((s) => !s)}
      >
        {saved ? "\u2713" : "+"}
      </button>

      <Link to={`/post/${post.id}`} className="post-card__media">
        <PostImage post={post} />
      </Link>

      {variant === "card" && (
        <footer className="post-card__footer">
          <Link to={`/profile/${author.id}`} aria-label={`${author.username}'s profile`}>
            <Avatar user={author} size={30} />
          </Link>
          <span className="post-card__caption">{post.caption}</span>
          <button
            type="button"
            className={`heart ${liked ? "liked" : ""}`}
            aria-pressed={liked}
            aria-label={liked ? "Unlike post" : "Like post"}
            onClick={() => setLiked((l) => !l)}
          >
            {liked ? "\u2665" : "\u2661"}
          </button>
        </footer>
      )}
    </article>
  );
}
