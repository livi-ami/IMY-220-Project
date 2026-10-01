import PostPreview from "./PostPreview.jsx";

// Lists every post a user has created (profile page)
export default function PostGrid({ posts, emptyMessage = "No posts yet." }) {
  if (!posts.length) return <p className="empty">{emptyMessage}</p>;
  return (
    <section className="post-grid" aria-label="Posts">
      {posts.map((p) => (
        <PostPreview key={p.id} post={p} variant="grid" />
      ))}
    </section>
  );
}
