// Displays a post's image. Until real uploads exist, posts without an image get a gradient placeholder.
export default function PostImage({ post }) {
  if (post.image) {
    return <img className="post-image" src={post.image} alt={post.caption} />;
  }
  const [a, b] = post.colors || ["#5b5888", "#1e1e30"];
  return (
    <div
      className="post-image post-image--placeholder"
      role="img"
      aria-label={post.caption}
      style={{ aspectRatio: post.aspect || "1/1", background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <span>{post.event}</span>
    </div>
  );
}