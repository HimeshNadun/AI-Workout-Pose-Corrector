import React, { useEffect, useState } from "react";

export default function PoseData() {
  const [data, setData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:5000/pose_data")
        .then(res => res.json())
        .then(json => {
          setData(json);
          setIsConnected(true);
        })
        .catch(() => setIsConnected(false));
    }, 500); // update every 0.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 px-4 max-w-4xl mx-auto">
      <div className="relative group">
        {/* Outer glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/30 via-blue-700/30 to-blue-900/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
        
        <div className="relative bg-zinc-950 rounded-2xl border border-blue-900/40 overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-600/50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-600/50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-600/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-600/50" />
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-950 px-6 py-4 border-b border-blue-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'} shadow-lg ${isConnected ? 'shadow-blue-500/50' : ''}`} />
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Workout Stats
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-500/60">
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
                <div className="flex gap-0.5">
                  <div className={`w-1 h-3 rounded-full ${isConnected ? 'bg-blue-600/70' : 'bg-zinc-700'}`} />
                  <div className={`w-1 h-4 rounded-full ${isConnected ? 'bg-blue-600/80' : 'bg-zinc-700'}`} />
                  <div className={`w-1 h-3 rounded-full ${isConnected ? 'bg-blue-600/70' : 'bg-zinc-700'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6">
            {/* Subtle grid pattern background */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
            
            {/* Data display */}
            <div className="relative">
              <pre className="text-blue-300/80 text-sm font-mono overflow-x-auto bg-black/30 p-4 rounded-lg border border-blue-900/30 scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
                {Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '{\n  "status": "waiting for data..."\n}'}
              </pre>
            </div>

            {/* Bottom status indicator */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-500/50">
                <span className="font-mono">Update Rate: 500ms</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-500/50 font-mono">
                <div className="w-1 h-1 rounded-full bg-blue-600/50" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}