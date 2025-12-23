export default function WebcamFeed({ webcamRef }) {
  return (
    <div className="flex justify-center mt-8 px-4">
      <div className="relative group">
        {/* Outer glow container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-900/30 via-blue-700/30 to-blue-900/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Main video container */}
        <div className="relative bg-zinc-950 rounded-2xl p-1 border border-blue-900/40">
          {/* Corner decorations */}
          <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-blue-600/60 rounded-tl-2xl" />
          <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-blue-600/60 rounded-tr-2xl" />
          <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-blue-600/60 rounded-bl-2xl" />
          <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-blue-600/60 rounded-br-2xl" />
          
          {/* Top status bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                <span className="text-xs font-medium text-blue-400/80">LIVE FEED</span>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-blue-600/60 rounded-full" />
                <div className="w-1 h-4 bg-blue-600/70 rounded-full" />
                <div className="w-1 h-3 bg-blue-600/60 rounded-full" />
              </div>
            </div>
          </div>

          {/* Video feed */}
          <div className="relative overflow-hidden rounded-xl">
            <img 
              src="http://127.0.0.1:5000/video_feed" 
              alt="Live Camera Feed"
              className="w-full h-full object-cover"
              style={{ width: '640px', height: '480px' }}
              onLoad={() => {
                // #region agent log
                fetch("http://127.0.0.1:7242/ingest/2d2e2322-6b16-4dfb-8b99-4241ef6c281d", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId: "debug-session",
                    runId: "pre-fix",
                    hypothesisId: "G",
                    location: "WebcamFeed.jsx:9",
                    message: "video_feed load success",
                    data: {},
                    timestamp: Date.now(),
                  }),
                }).catch(() => {});
                // #endregion agent log
              }}
              onError={(err) => {
                // #region agent log
                fetch("http://127.0.0.1:7242/ingest/2d2e2322-6b16-4dfb-8b99-4241ef6c281d", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId: "debug-session",
                    runId: "pre-fix",
                    hypothesisId: "G",
                    location: "WebcamFeed.jsx:18",
                    message: "video_feed load error",
                    data: { error: (err && err.type) || "unknown" },
                    timestamp: Date.now(),
                  }),
                }).catch(() => {});
                // #endregion agent log
              }}
            />
            
            {/* Scanline effect overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                  <span className="text-blue-500/60">REC</span>
                </div>
                <div className="w-px h-3 bg-blue-800/50" />
                <span className="text-blue-400/50 font-mono">640x480</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400/50 font-mono">
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}