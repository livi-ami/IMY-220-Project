import { Link } from "react-router-dom";
import PostImage from "./PostImage.jsx";
import Avatar from "./Avatar.jsx";
import Comments from "./Comments.jsx";
import { getUser, getComments, currentUser } from "../data/dummyData.js";

//image, author, caption, tags, event, comments
export default function PostDetail({ post, onEdit }) {
  const author = getUser(post.userId);
  const isOwner = author.id === currentUser.id;

  return (
    <article className="post-detail">
      <div className="post-detail__media">
        <PostImage post={post} />
      </div>

      <div className="post-detail__side">
        <header className="post-detail__author">
          <Link to={`/profile/${author.id}`} className="post-detail__user">
            <Avatar user={author} size={44} />
            <strong>@{author.username}</strong>
          </Link>
          {isOwner && <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>Edit post</button>}
        </header>

        <p className="post-detail__caption">{post.caption}</p>
        {post.tags.length > 0 && (
          <p className="tags">{post.tags.map((t) => <span key={t}>#{t}</span>)}</p>
        )}
        <p className="post-detail__meta">
          <span className="event-pill">{post.event}</span>
          <time>posted {post.createdAt}</time>
        </p>

        <Comments key={post.id} initialComments={getComments(post.id)} />
      </div>
    </article>
  );
}
