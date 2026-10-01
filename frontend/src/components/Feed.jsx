import PostPreview from "./PostPreview.jsx";

export default function Feed({ posts, emptyMessage = "Nothing here yet." }) {
  if (!posts.length) return <p className="empty">{emptyMessage}</p>;
  return (
    <section className="masonry" aria-label="Posts">
      {posts.map((p) => (
        <PostPreview key={p.id} post={p} />
      ))}
    </section>
  );
}