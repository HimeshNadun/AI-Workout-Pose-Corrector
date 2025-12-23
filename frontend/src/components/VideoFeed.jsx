// VideoFeed.jsx
import React from "react";

export default function VideoFeed() {
  return (
    <div>
      <h2>Live Camera Feed</h2>
      <img src="http://127.0.0.1:5000/video_feed" alt="Live Feed" />
    </div>
  );
}
