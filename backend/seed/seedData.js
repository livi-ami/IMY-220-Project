import { ObjectId, Binary } from "mongodb";
import bcrypt from "bcryptjs";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function makeSvg([a, b], aspect, label) {
  const [x, y] = aspect.split("/").map(Number);
  const w = 800;
  const h = Math.round((w * y) / x);
  const bars = [0.3, 0.55, 0.85, 1, 0.7, 0.5, 0.35]
    .map((v, i) => `<rect x="${w / 2 - 105 + i * 30}" y="${h - 60 - v * 70}" width="14" height="${v * 70}" rx="7" fill="#fff" opacity=".85"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<polygon points="${w * 0.2},0 ${w * 0.4},0 ${w * 0.7},${h} ${w * 0.1},${h}" fill="#fff" opacity=".07"/>
<polygon points="${w * 0.6},0 ${w * 0.8},0 ${w * 1.0},${h} ${w * 0.5},${h}" fill="#fff" opacity=".07"/>
${bars}
<text x="24" y="${h - 22}" font-family="sans-serif" font-size="22" fill="#fff" opacity=".9">${esc(label)}</text>
</svg>`;
}

const userDefs = [
  { username: "concertkid", email: "concertkid@encore.test", bio: "Front barrier or nothing. Collecting setlists since 2019." },
  { username: "engene_lens", email: "engene@encore.test", bio: "Enhypen fancams and fan-eye views from every tour stop." },
  { username: "livia.lens", email: "livia@encore.test", bio: "GUTS tour, section 112. Yes, I cried." },
  { username: "moshpit_mia", email: "mia@encore.test", bio: "Loud shows, louder friends." },
  { username: "front_row_frank", email: "frank@encore.test", bio: "If I can see the sweat, it's a good seat." },
  { username: "setlist.sarah", email: "sarah@encore.test", bio: "Festival season all year round." },
];
//index pairs (0-based into userDefs) that are friends
const friendPairs = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 4], [4, 5]];

const postDefs = [
  { u: 1, caption: "Golden hour on the barricade before Enhypen took the stage.", tags: ["enhypen", "fatetour"], event: "Enhypen - Fate Tour", ago: 5, aspect: "4/5", colors: ["#40e0c5", "#0f4b57"], likes: [0, 2, 3] },
  { u: 2, caption: "Confetti during Vampire. Still got chills.", tags: ["oliviarodrigo", "guts"], event: "Olivia Rodrigo - GUTS World Tour", ago: 7, aspect: "4/3", colors: ["#ffb236", "#7a3b0c"], likes: [1] },
  { u: 0, caption: "Wristbands glowing across the whole stadium.", tags: ["lightsticks", "nightout"], event: "Enhypen - Fate Tour", ago: 14, aspect: "3/5", colors: ["#e83e9e", "#3b1a5c"], likes: [0, 1] },
  { u: 3, caption: "Pit view. Zero regrets, one lost shoe.", tags: ["moshpit", "livemusic"], event: "Slipknot - Knotfest", ago: 21, aspect: "1/1", colors: ["#8b7cf6", "#1c1a4a"], likes: [] },
  { u: 4, caption: "Row A and I could see every expression.", tags: ["frontrow", "guts"], event: "Olivia Rodrigo - GUTS World Tour", ago: 22, aspect: "16/10", colors: ["#f0578a", "#2a1030"], likes: [2] },
  { u: 0, caption: "Soundcheck leaks from the very back of the hall.", tags: ["soundcheck", "backstage"], event: "Enhypen - Fate Tour", ago: 30, aspect: "4/5", colors: ["#3fe0c5", "#5b5888"], likes: [1, 3] },
  { u: 5, caption: "Sunset set at the main stage. Perfect ending.", tags: ["festival", "sunset"], event: "Rocking the Daisies", ago: 33, aspect: "4/3", colors: ["#5cc8ff", "#0f2b4d"], likes: [4] },
  { u: 1, caption: "The encore. Voices gone, hearts full.", tags: ["encore", "enhypen"], event: "Enhypen - Fate Tour", ago: 38, aspect: "3/4", colors: ["#ffb236", "#e83e9e"], likes: [0, 2, 4] },
  { u: 0, caption: "Ticket stubs and setlist, my favourite souvenirs.", tags: ["souvenirs", "setlist"], event: "Olivia Rodrigo - GUTS World Tour", ago: 60, aspect: "1/1", colors: ["#40e0c5", "#e83e9e"], likes: [] },
  { u: 2, caption: "Side-stage view of the band running out.", tags: ["sidestage", "live"], event: "Olivia Rodrigo - GUTS World Tour", ago: 62, aspect: "4/5", colors: ["#8b7cf6", "#ffb236"], likes: [0] },
];

const commentDefs = [
  { p: 0, u: 2, text: "This angle is unreal, I was on the other side of the arena!", ago: 4 },
  { p: 0, u: 0, text: "Adding this to my album right now.", ago: 4 },
  { p: 0, u: 3, text: "The lighting here is insane.", ago: 3 },
  { p: 0, u: 4, text: "Were you in the front pit? Looks amazing.", ago: 2 },
  { p: 0, u: 5, text: "Need the full album of this night!", ago: 1 },
  { p: 1, u: 1, text: "Confetti timing is perfect.", ago: 6 },
  { p: 1, u: 0, text: "Section 112 gang!", ago: 6 },
  { p: 7, u: 0, text: "Best encore of the tour.", ago: 30 },
];

const albumDefs = [
  { u: 0, name: "Fate Tour Memories", description: "Every angle of the Enhypen night, from soundcheck to encore.", tags: ["enhypen", "fatetour"], posts: [0, 2, 5, 7] },
  { u: 2, name: "GUTS Nights", description: "Olivia Rodrigo shows through my lens.", tags: ["guts", "oliviarodrigo"], posts: [1, 9, 4] },
  { u: 3, name: "Pit Stories", description: "Things that happen in the pit.", tags: ["moshpit"], posts: [3] },
];

const reasonLabels = ["Spam", "Inappropriate content", "Harassment or hate", "Copyright infringement", "Misleading or fake", "Other"];

export async function wipe(db) {
  const cols = ["users", "posts", "comments", "albums", "images", "friendRequests", "reports", "reportReasons"];
  await Promise.all(cols.map((c) => db.collection(c).deleteMany({})));
}

export async function seedDatabase(db) {
  const hash = await bcrypt.hash("Password123", 10);
  const adminHash = await bcrypt.hash("Admin1234", 10);
  const image = async (colors, aspect, label) => {
    const { insertedId } = await db.collection("images").insertOne({
      data: new Binary(Buffer.from(makeSvg(colors, aspect, label))), contentType: "image/svg+xml", createdAt: new Date(),
    });
    return insertedId;
  };

  //users
  const users = userDefs.map((u, i) => ({
    _id: new ObjectId(), username: u.username, usernameLower: u.username.toLowerCase(), email: u.email,
    passwordHash: hash, role: "user", bio: u.bio, avatarImageId: null, friends: [], createdAt: daysAgo(90 - i),
  }));
  for (const [a, b] of friendPairs) {
    users[a].friends.push(users[b]._id);
    users[b].friends.push(users[a]._id);
  }
  users.push({
    _id: new ObjectId(), username: "encore_admin", usernameLower: "encore_admin", email: "admin@encore.test",
    passwordHash: adminHash, role: "admin", bio: "Encore administrator.", avatarImageId: null, friends: [], createdAt: daysAgo(100),
  });
  await db.collection("users").insertMany(users);

  //pending friend request: setlist.sarah -> concertkid
  await db.collection("friendRequests").insertOne({ fromId: users[5]._id, toId: users[0]._id, createdAt: daysAgo(1) });

  //posts
  const posts = [];
  for (const p of postDefs) {
    posts.push({
      _id: new ObjectId(), userId: users[p.u]._id, imageId: await image(p.colors, p.aspect, p.event),
      caption: p.caption, hashtags: p.tags, eventName: p.event,
      likes: p.likes.map((i) => users[i]._id),
      commentCount: commentDefs.filter((c) => c.p === posts.length).length,
      createdAt: daysAgo(p.ago), updatedAt: daysAgo(p.ago),
    });
  }
  await db.collection("posts").insertMany(posts);

  //comments
  await db.collection("comments").insertMany(
    commentDefs.map((c) => ({ postId: posts[c.p]._id, userId: users[c.u]._id, text: c.text, createdAt: daysAgo(c.ago) }))
  );

  //albums
  await db.collection("albums").insertMany(
    albumDefs.map((a, i) => ({
      userId: users[a.u]._id, name: a.name, description: a.description, hashtags: a.tags,
      postIds: a.posts.map((i) => posts[i]._id), createdAt: daysAgo(20 - i), updatedAt: daysAgo(20 - i),
    }))
  );

  //report reasons
  await db.collection("reportReasons").insertMany(reasonLabels.map((label) => ({ label, createdAt: new Date() })));

  return { users: users.length, posts: posts.length, albums: albumDefs.length };
}

export async function seedIfEmpty(db) {
  if ((await db.collection("users").countDocuments()) > 0) return false;
  const counts = await seedDatabase(db);
  console.log("Database was empty, inserted sample data:", counts);
  return true;
}