import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Splash from "./pages/Splash.jsx";
import Home from "./pages/Home.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import Profile from "./pages/Profile.jsx";
import Post from "./pages/Post.jsx";
import NotFound from "./pages/NotFound.jsx";
import { currentUser } from "./data/dummyData.js";

function Layout() {
  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Splash initialTab="login" />} />
      <Route path="/signup" element={<Splash initialTab="signup" />} />

      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/profile" element={<Navigate to={`/profile/${currentUser.id}`} replace />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}