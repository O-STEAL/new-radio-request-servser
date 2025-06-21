const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

exports.extractYoutubeVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }
    return null;
  } catch (e) {
    return null;
  }
};

exports.fetchYoutubeInfo = async (videoId) => {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return { title: "", channelTitle: "", thumbnailUrl: "" };
    const data = await res.json();
    if (data.items && data.items[0]) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        thumbnailUrl:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (e) {
    console.error("YouTube fetch error:", e);
  }
  return {
    title: "",
    channelTitle: "",
    thumbnailUrl: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : "",
  };
};
