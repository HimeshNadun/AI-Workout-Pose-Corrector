export default function ModeSelector({ mode, setMode }) {
  const modes = [
    { name: "Push-Up", icon: "🏋️‍♂️", gradient: "from-blue-600 to-blue-800" },
    { name: "Curl", icon: "💪", gradient: "from-blue-700 to-blue-900" },
    { name: "Squat", icon: "🧍‍♂️", gradient: "from-blue-800 to-indigo-900" },
    { name: "Plank", icon: "🧘‍♂️", gradient: "from-indigo-800 to-blue-900" }
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 bg-black">
      {/* Subtle glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-blue-800/10 to-blue-900/10 blur-3xl" />
      
      <div className="relative">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Select Workout Mode
          </h2>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>

        {/* Mode Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modes.map((m) => {
            const isActive = mode === m.name;
            return (
              <button
                key={m.name}
                onClick={() => {
                  // #region agent log
                  fetch("http://127.0.0.1:7242/ingest/2d2e2322-6b16-4dfb-8b99-4241ef6c281d", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sessionId: "debug-session",
                      runId: "pre-fix",
                      hypothesisId: "E",
                      location: "ModeSelector.jsx:9",
                      message: "mode button clicked",
                      data: { selected: m.name },
                      timestamp: Date.now(),
                    }),
                  }).catch(() => {});
                  // #endregion agent log
                  setMode(m.name);
                }}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br ' + m.gradient + ' shadow-2xl shadow-blue-900/60 scale-105 border border-blue-400/40' 
                    : 'bg-zinc-950 hover:bg-zinc-900 border border-blue-900/40 hover:border-blue-700/50 hover:scale-102'
                  }`}
              >
                {/* Subtle animated border glow for active */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 opacity-75 blur-xl animate-pulse" />
                )}
                
                {/* Hover effect - subtle scanning line */}
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/20 to-transparent 
                  translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000 ${isActive ? 'opacity-0' : ''}`} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`text-4xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110 brightness-110' : 'brightness-75'}`}>
                    {m.icon}
                  </div>
                  
                  <div className={`font-bold text-sm md:text-base transition-colors ${
                    isActive 
                      ? 'text-blue-100' 
                      : 'text-blue-400/60 group-hover:text-blue-400'
                  }`}>
                    {m.name}
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-150" />
                    </div>
                  )}
                </div>

                {/* Corner accents for inactive buttons */}
                {!isActive && (
                  <>
                    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-blue-800/50 group-hover:border-blue-600/70 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-blue-800/50 group-hover:border-blue-600/70 transition-colors" />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950 border border-blue-900/40">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-500/70">
              Current: <span className="text-blue-400 font-semibold">{mode}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
