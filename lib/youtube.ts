// Helpers to derive a thumbnail image from a YouTube video URL.
// The API's `thumbnailurl` field actually carries the video link
// (youtube.com/shorts/ID, youtube.com/watch?v=ID, youtu.be/ID).

export function youtubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Returns a thumbnail image URL (hqdefault works for both regular & shorts).
export function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function isYoutube(url: string): boolean {
  return youtubeId(url) !== null;
}
