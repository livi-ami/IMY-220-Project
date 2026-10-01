import { ObjectId } from "mongodb";
import { Users } from "../db/users.js";
import { Posts } from "../db/posts.js";

export const imageUrl = (id) => (id ? `/api/images/${id}` : null);

export const presentUser = (u, { self = false } = {}) => ({
  id: u._id.toString(),
  username: u.username,
  bio: u.bio || "",
  avatarUrl: imageUrl(u.avatarImageId),
  role: u.role,
  createdAt: u.createdAt,
  ...(self && { email: u.email }),
});

const presentAuthor = (u) =>
  u ? { id: u._id.toString(), username: u.username, avatarUrl: imageUrl(u.avatarImageId) }
    : { id: null, username: "[deleted]", avatarUrl: null };

async function authorMap(ids) {
  const unique = [...new Set(ids.map(String))].map((id) => new ObjectId(id));
  const users = await Users.findByIds(unique);
  return new Map(users.map((u) => [u._id.toString(), u]));
}

export async function presentPosts(posts, viewerId) {
  const authors = await authorMap(posts.map((p) => p.userId));
  return posts.map((p) => ({
    id: p._id.toString(),
    author: presentAuthor(authors.get(p.userId.toString())),
    imageUrl: imageUrl(p.imageId),
    caption: p.caption,
    hashtags: p.hashtags,
    eventName: p.eventName,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    likeCount: (p.likes || []).length,
    likedByMe: (p.likes || []).some((l) => l.equals(viewerId)),
    commentCount: p.commentCount || 0,
  }));
}
export const presentPost = async (post, viewerId) => (await presentPosts([post], viewerId))[0];

export async function presentComments(comments) {
  const authors = await authorMap(comments.map((c) => c.userId));
  return comments.map((c) => ({
    id: c._id.toString(),
    postId: c.postId.toString(),
    author: presentAuthor(authors.get(c.userId.toString())),
    text: c.text,
    createdAt: c.createdAt,
    edited: Boolean(c.editedAt),
  }));
}
export const presentComment = async (c) => (await presentComments([c]))[0];

//album summaries + Cover image = first post in the album.
export async function presentAlbums(albums) {
  const authors = await authorMap(albums.map((a) => a.userId));
  const firstIds = albums.map((a) => a.postIds[0]).filter(Boolean);
  const firstPosts = new Map((await Posts.findByIds(firstIds)).map((p) => [p._id.toString(), p]));
  return albums.map((a) => ({
    id: a._id.toString(),
    owner: presentAuthor(authors.get(a.userId.toString())),
    name: a.name,
    description: a.description,
    hashtags: a.hashtags,
    postCount: a.postIds.length,
    coverImageUrl: a.postIds[0] ? imageUrl(firstPosts.get(a.postIds[0].toString())?.imageId) : null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
}

//album with its posts included
export async function presentAlbum(album, viewerId) {
  const [summary] = await presentAlbums([album]);
  const found = await Posts.findByIds(album.postIds);
  const order = new Map(album.postIds.map((id, i) => [id.toString(), i]));
  found.sort((a, b) => order.get(a._id.toString()) - order.get(b._id.toString()));
  return { ...summary, posts: await presentPosts(found, viewerId) };
}