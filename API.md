# Encore API reference

Base URL: `http://localhost:5000`. All bodies are JSON unless noted. Every route except `/api/health`, `/api/auth/signup`,
`/api/auth/signin` and `/api/images/:id` needs the header `Authorization: Bearer <token>`.

Errors always look like `{ "success": false, "message": "Human readable text" }` with a suitable status
(400 validation, 401 not logged in, 403 not allowed, 404 not found, 409 duplicate).

Lists are paged with `?page=1&limit=12` and return `{ items, page, limit, total, hasMore }`.
Image fields (`imageUrl`, `avatarUrl`, `coverImageUrl`) are paths like `/api/images/<id>` - prefix them with the API base URL.

| Method | Route | Body / notes |
|---|---|---|
| **Auth** | | |
| POST | /api/auth/signup | `{ username, email, password }` -> `{ token, user }` |
| POST | /api/auth/signin | `{ email, password }` -> `{ token, user }` |
| POST | /api/auth/logout | confirms logout; the client then deletes its token |
| GET | /api/auth/me | the logged-in user (restore a session on page load) |
| **Users / profiles** | | |
| GET | /api/users?search= | find users |
| GET | /api/users/:id | profile + `postsCount`, `friendsCount`, `relationship` (`self` `friends` `request_sent` `request_received` `none`), `requestId` |
| PUT | /api/users/:id | `{ username?, bio? }` or multipart with `avatar` file (owner/admin) |
| DELETE | /api/users/:id | deletes account + its posts, comments, albums (owner/admin) |
| GET | /api/users/:id/posts | paged |
| GET | /api/users/:id/albums | paged |
| GET | /api/users/:id/friends | list |
| **Friends** | | |
| GET | /api/friends/requests | `{ incoming, outgoing }` |
| POST | /api/friends/requests | `{ toUserId }` |
| POST | /api/friends/requests/:id/accept | recipient only |
| DELETE | /api/friends/requests/:id | decline (recipient) or cancel (sender) |
| DELETE | /api/friends/:userId | unfriend |
| **Posts** | | |
| POST | /api/posts | **multipart/form-data**: `image` (file, 5MB, jpg/png/webp/gif), `caption`, `eventName`, `hashtags` (`"#a #b"` or JSON array) |
| GET | /api/posts/:id | one post |
| PUT | /api/posts/:id | `{ caption?, eventName?, hashtags? }` (owner/admin) |
| DELETE | /api/posts/:id | owner/admin; also removes its comments, reports, album entries, image |
| POST / DELETE | /api/posts/:id/like | like / unlike (returns updated post) |
| GET | /api/posts/:id/comments | paged, newest first |
| POST | /api/posts/:id/comments | `{ text }` |
| POST | /api/posts/:id/report | `{ reasonId, details? }` |
| PUT | /api/comments/:id | `{ text }` (author/admin) |
| DELETE | /api/comments/:id | author, post owner or admin |
| **Albums** | | |
| POST | /api/albums | `{ name, description?, hashtags? }` |
| GET | /api/albums?search= | all albums, paged |
| GET | /api/albums/:id | album with its `posts` |
| PUT | /api/albums/:id | `{ name?, description?, hashtags? }` (owner/admin) |
| DELETE | /api/albums/:id | owner/admin (posts are kept) |
| POST | /api/albums/:id/posts | `{ postId }` |
| DELETE | /api/albums/:id/posts/:postId | remove a post from the album |
| **Feeds & search** | | |
| GET | /api/feed/local | you + friends, paged |
| GET | /api/feed/global | everyone, paged |
| GET | /api/search?q= | `{ users, posts, albums }`; `#tag` searches hashtags |
| **Reports (admin extras)** | | |
| GET | /api/report-reasons | choices for the report form |
| POST | /api/report-reasons | `{ label }` (admin) |
| GET | /api/reports | all reports (admin) |
| **Misc** | | |
| GET | /api/images/:id | the image bytes (public, so `<img>` tags work) |
| GET | /api/health | `{ status: "ok" }` |

Sample logins (created by the seed): `concertkid@encore.test` / `Password123` (also engene@, livia@, mia@, frank@, sarah@ `@encore.test`),
admin: `admin@encore.test` / `Admin1234`.
