import { useState } from "react";
import Tabs from "../components/Tabs.jsx";
import Feed from "../components/Feed.jsx";
import { posts, currentUser } from "../data/dummyData.js";

export default function Home() {
  const [tab, setTab] = useState("local");

  const shown =
    tab === "local"
      ? posts.filter((p) => p.userId === currentUser.id || currentUser.friends.includes(p.userId))
      : posts;

  return (
    <>
      <Tabs
        label="Feed"
        active={tab}
        onChange={setTab}
        tabs={[{ id: "local", label: "Local feed" }, { id: "global", label: "Global Feed" }]}
      />
      <Feed posts={shown} emptyMessage="No posts yet. Add some friends or check the global feed." />
    </>
  );
}