import { useSearchParams, useNavigate } from "react-router-dom";
import SearchInput from "../components/SearchInput.jsx";
import ProfilePreview from "../components/ProfilePreview.jsx";
import Feed from "../components/Feed.jsx";
import { users, posts } from "../data/dummyData.js";

// Basic client-side search over the dummy data (real search comes with the backend)
export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get("q") || "").trim();
  const needle = q.replace(/^#/, "").toLowerCase();

  const matchedUsers = needle
    ? users.filter((u) => u.username.toLowerCase().includes(needle) || u.bio.toLowerCase().includes(needle))
    : [];
  const matchedPosts = needle
    ? posts.filter(
        (p) =>
          p.caption.toLowerCase().includes(needle) ||
          p.event.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.toLowerCase().includes(needle))
      )
    : [];

  return (
    <section className="search-page">
      <h1>Search</h1>
      <SearchInput key={q} initial={q} onSearch={(term) => navigate(`/search?q=${encodeURIComponent(term)}`)} />

      {!q && <p className="empty">Search for people, events or hashtags.</p>}
      {q && (
        <>
          <h2>People</h2>
          {matchedUsers.length ? (
            <div className="friend-list">{matchedUsers.map((u) => <ProfilePreview key={u.id} user={u} />)}</div>
          ) : (
            <p className="empty">No people found for "{q}".</p>
          )}
          <h2>Posts</h2>
          <Feed posts={matchedPosts} emptyMessage={`No posts found for "${q}".`} />
        </>
      )}
    </section>
  );
}
