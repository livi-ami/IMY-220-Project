import { Link } from "react-router-dom";
import CreatePost from "../components/CreatePost.jsx";

export default function CreatePostPage() {
  return (
    <section className="narrow">
      <Link to="/home" className="back-link">&larr; Back</Link>
      <CreatePost />
    </section>
  );
}
