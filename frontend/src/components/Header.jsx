import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import SearchInput from "./SearchInput.jsx";
import Avatar from "./Avatar.jsx";
import { currentUser } from "../data/dummyData.js";

// Navigation shown on every page except the splash page
export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main">
        <Logo />
        <NavLink to="/home" className="nav-link">Home</NavLink>
        <NavLink to="/search" className="nav-link">Search</NavLink>
        <SearchInput onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
        <div className="nav-right">
          <Link to="/create" className="btn btn-ghost btn-sm">+ New Post</Link>
          <Link to={`/profile/${currentUser.id}`} aria-label="Your profile">
            <Avatar user={currentUser} size={40} />
          </Link>
        </div>
      </nav>
    </header>
  );
}
