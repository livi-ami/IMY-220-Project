// Dummy data used until the backend + database exist (Deliverables 2 & 3).

export const users = [
  { id: "1", username: "livi._ami", bio: "Rocker and Lune.", color: "#e83e9e", banner: ["#e83e9e", "#3b1a5c"], followers: 128, following: 94, friends: ["2", "3", "4"] },
  { id: "2", username: "maki06", bio: "#streamBackToLife", color: "#40e0c5", banner: ["#40e0c5", "#0f4b57"], followers: 842, following: 120, friends: ["1", "3"] },
  { id: "3", username: "ljules.pret", bio: "(Taylor's Version) | Jungwon's wife", color: "#ffb236", banner: ["#ffb236", "#7a3b0c"], followers: 311, following: 201, friends: ["1", "2", "5"] },
  { id: "4", username: "marnis_a", bio: "Loud shows, louder friends.", color: "#8b7cf6", banner: ["#8b7cf6", "#1c1a4a"], followers: 97, following: 150, friends: ["1"] },
  { id: "5", username: "wenoism", bio: "Orange lover", color: "#f0578a", banner: ["#f0578a", "#2a1030"], followers: 560, following: 75, friends: ["3", "6"] },
  { id: "6", username: "engene27", bio: "Enhypen fancams and fan-eye views from every tour stop", color: "#5cc8ff", banner: ["#5cc8ff", "#0f2b4d"], followers: 204, following: 188, friends: ["5"] },
];

//pretend this is the logged-in user (real auth comes later)
export const currentUser = users[0];

export const posts = [
  { id: "1", userId: "2", caption: "Golden hour on the barricade before Enhypen took the stage.", tags: ["enhypen", "fatetour"], event: "Enhypen - Fate Tour", createdAt: "5 days ago", aspect: "4/5", colors: ["#40e0c5", "#0f4b57"], saved: true, liked: true },
  { id: "2", userId: "3", caption: "Confetti during Vampire. Still got chills.", tags: ["oliviarodrigo", "guts"], event: "Olivia Rodrigo - GUTS World Tour", createdAt: "1 week ago", aspect: "4/3", colors: ["#ffb236", "#7a3b0c"], saved: false, liked: false },
  { id: "3", userId: "1", caption: "Wristbands glowing across the whole stadium.", tags: ["lightsticks", "nightout"], event: "Enhypen - Fate Tour", createdAt: "2 weeks ago", aspect: "3/5", colors: ["#e83e9e", "#3b1a5c"], saved: false, liked: true },
  { id: "4", userId: "4", caption: "Pit view. Zero regrets, one lost shoe.", tags: ["moshpit", "livemusic"], event: "Slipknot - Knotfest", createdAt: "3 weeks ago", aspect: "1/1", colors: ["#8b7cf6", "#1c1a4a"], saved: false, liked: false },
  { id: "5", userId: "5", caption: "Row A and I could see every expression.", tags: ["frontrow", "guts"], event: "Olivia Rodrigo - GUTS World Tour", createdAt: "3 weeks ago", aspect: "16/10", colors: ["#f0578a", "#2a1030"], saved: false, liked: false },
  { id: "6", userId: "1", caption: "Soundcheck leaks from the very back of the hall.", tags: ["soundcheck", "backstage"], event: "Enhypen - Fate Tour", createdAt: "1 month ago", aspect: "4/5", colors: ["#3fe0c5", "#5b5888"], saved: true, liked: false },
  { id: "7", userId: "6", caption: "Sunset set at the main stage. Perfect ending.", tags: ["festival", "sunset"], event: "Rocking the Daisies", createdAt: "1 month ago", aspect: "4/3", colors: ["#5cc8ff", "#0f2b4d"], saved: false, liked: false },
  { id: "8", userId: "2", caption: "The encore. Voices gone, hearts full.", tags: ["encore", "enhypen"], event: "Enhypen - Fate Tour", createdAt: "1 month ago", aspect: "3/4", colors: ["#ffb236", "#e83e9e"], saved: false, liked: true },
  { id: "9", userId: "1", caption: "Ticket stubs and setlist, my favourite souvenirs.", tags: ["souvenirs", "setlist"], event: "Olivia Rodrigo - GUTS World Tour", createdAt: "2 months ago", aspect: "1/1", colors: ["#40e0c5", "#e83e9e"], saved: false, liked: false },
  { id: "10", userId: "3", caption: "Side-stage view of the band running out.", tags: ["sidestage", "live"], event: "Olivia Rodrigo - GUTS World Tour", createdAt: "2 months ago", aspect: "4/5", colors: ["#8b7cf6", "#ffb236"], saved: false, liked: false },
];

export const comments = {
  1: [
    { id: 1, userId: "3", text: "This angle is unreal, I was on the other side of the arena!" },
    { id: 2, userId: "1", text: "Adding this to my archive right now." },
    { id: 3, userId: "4", text: "The lighting here is insane." },
    { id: 4, userId: "5", text: "Were you in the front pit? Looks amazing." },
    { id: 5, userId: "6", text: "Need the full album of this night!" },
  ],
  2: [
    { id: 6, userId: "2", text: "Confetti timing is perfect." },
    { id: 7, userId: "1", text: "Front standing gang!" },
  ],
};

// ---------- helpers ----------
export const getUser = (id) => users.find((u) => u.id === String(id));
export const getPost = (id) => posts.find((p) => p.id === String(id));
export const getComments = (postId) => comments[postId] || [
  { id: 100, userId: "2", text: "Great shot!" },
  { id: 101, userId: "3", text: "Love this." },
];
export const getUserPosts = (userId) => posts.filter((p) => p.userId === String(userId));
