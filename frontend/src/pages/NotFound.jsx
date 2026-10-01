import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="narrow not-found">
      <h1>Page not found</h1>
      <p>That page doesn't exist. Head back to your feed.</p>
      <Link to="/home" className="btn btn-pink">Go to home</Link>
    </section>
  );
}
