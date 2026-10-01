import { useState } from "react";

// Search is not wired up yet: it just captures the term and hands it to onSearch.
export default function SearchInput({ onSearch, initial = "", placeholder = "Search users, events or #tags" }) {
  const [term, setTerm] = useState(initial);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(term.trim());
  };

  return (
    <form className="search-input" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        maxLength={60}
      />
    </form>
  );
}
