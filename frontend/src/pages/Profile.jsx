import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader.jsx";
import EditProfile from "../components/EditProfile.jsx";
import CreatePost from "../components/CreatePost.jsx";
import PostGrid from "../components/PostGrid.jsx";
import FriendList from "../components/FriendList.jsx";
import Tabs from "../components/Tabs.jsx";
import { users, currentUser, getUser, getUserPosts } from "../data/dummyData.js";

export default function Profile() {
  const { id } = useParams();
  // Any id works for now: unknown ids fall back to a sample profile
  const base = getUser(id) || users[1];

  const [overrides, setOverrides] = useState({});
  const [tab, setTab] = useState("posts");
  const [panel, setPanel] = useState(null); // "edit" | "create" | null
  const [isFriend, setIsFriend] = useState(currentUser.friends.includes(base.id));

  useEffect(() => {
    setTab("posts");
    setPanel(null);
    setIsFriend(currentUser.friends.includes(base.id));
  }, [base.id]);

  const user = { ...base, ...(base.id === currentUser.id ? overrides : {}) };
  const isOwn = user.id === currentUser.id;
  const userPosts = getUserPosts(user.id);
  const friends = user.friends.map(getUser).filter(Boolean);

  return (
    <>
      <ProfileHeader
        user={user}
        isOwn={isOwn}
        isFriend={isFriend}
        postCount={userPosts.length}
        onToggleFriend={() => setIsFriend((f) => !f)}
        onEdit={() => setPanel(panel === "edit" ? null : "edit")}
        onNewPost={() => setPanel(panel === "create" ? null : "create")}
      />

      {panel === "edit" && (
        <div className="narrow">
          <EditProfile
            user={user}
            onSave={(changes) => { setOverrides(changes); setPanel(null); }}
            onCancel={() => setPanel(null)}
          />
        </div>
      )}
      {panel === "create" && (
        <div className="narrow">
          <CreatePost />
        </div>
      )}

      <Tabs
        label="Profile sections"
        active={tab}
        onChange={setTab}
        tabs={[{ id: "posts", label: "Posts" }, { id: "friends", label: `Friends (${friends.length})` }]}
      />
      {tab === "posts" ? (
        <PostGrid posts={userPosts} emptyMessage={isOwn ? "You haven't posted yet." : "No posts yet."} />
      ) : (
        <FriendList friends={friends} />
      )}
    </>
  );
}
