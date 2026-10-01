import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { currentUser, getUser } from "../data/dummyData.js";

const PREVIEW_COUNT = 3;

export default function Comments({ initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? comments : comments.slice(0, PREVIEW_COUNT);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setComments([{ id: Date.now(), userId: currentUser.id, text: trimmed }, ...comments]);
    setText("");
  };

  return (
    <section className="comments" aria-label="Comments">
      <h2>Comments ({comments.length})</h2>
      <form className="comment-form" onSubmit={handleSubmit}>
        <Avatar user={currentUser} size={36} />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Comment..."
          maxLength={300} aria-label="Write a comment" />
        <button type="submit" className="btn btn-pink btn-sm" disabled={!text.trim()}>Post</button>
      </form>

      <ul className="comment-list">
        {visible.map((c) => {
          const author = getUser(c.userId);
          return (
            <li key={c.id} className="comment">
              <Avatar user={author} size={36} />
              <div>
                <Link to={`/profile/${author.id}`} className="comment__user">@{author.username}</Link>
                <p>{c.text}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {!showAll && comments.length > PREVIEW_COUNT && (
        <button type="button" className="link-btn" onClick={() => setShowAll(true)}>view more...</button>
      )}
    </section>
  );
}