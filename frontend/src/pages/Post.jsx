import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostDetail from "../components/PostDetail.jsx";
import EditPost from "../components/EditPost.jsx";
import { posts, getPost } from "../data/dummyData.js";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  //unknown ids fall back to the first post
  const [post, setPost] = useState(getPost(id) || posts[0]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setPost(getPost(id) || posts[0]);
    setEditing(false);
  }, [id]);

  return (
    <section>
      <button type="button" className="back-link" onClick={() => navigate(-1)}>&larr; Back</button>
      <PostDetail post={post} onEdit={() => setEditing((e) => !e)} />
      {editing && (
        <div className="narrow">
          <EditPost
            post={post}
            onSave={(changes) => { setPost({ ...post, ...changes }); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </section>
  );
}