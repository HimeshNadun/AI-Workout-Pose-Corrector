export default function LiveStats({ angles, reps, mode }) {
  const getAngleLabel = () => {
    if (mode === "Squat") return "Knee Angle";
    if (mode === "Plank") return "Time";
    return "Elbow Angle";
  };

  const getAngleValue = () => {
    if (mode === "Plank") return `${angles?.elbow || 0}s`;
    return `${angles?.elbow || 0}°`;
  };

  const getRepsLabel = () => {
    if (mode === "Plank") return "Time (seconds)";
    return "Reps Count";
  };

  return (
    <div className="grid grid-cols-2 gap-6 mt-8 px-4 max-w-4xl mx-auto">
      
      {/* Angle/Time Card */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/40 via-blue-700/40 to-blue-900/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        <div className="relative bg-zinc-950 rounded-2xl border border-blue-900/40 overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-600/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-600/50" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="relative p-6 text-center">
            {/* Label with icon */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-sm font-medium text-blue-400/70 uppercase tracking-wider">
                {getAngleLabel()}
              </h3>
            </div>
            
            {/* Value */}
            <div className="relative">
              <p className="text-5xl font-bold bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                {getAngleValue()}
              </p>
              
              {/* Subtle glow under value */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-blue-500/20 blur-xl" />
            </div>
            
            {/* Bottom indicator bar */}
            <div className="mt-4 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Reps Card */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/40 via-blue-700/40 to-blue-900/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        <div className="relative bg-zinc-950 rounded-2xl border border-blue-900/40 overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-600/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-600/50" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="relative p-6 text-center">
            {/* Label with icon */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75" />
              <h3 className="text-sm font-medium text-blue-400/70 uppercase tracking-wider">
                {getRepsLabel()}
              </h3>
            </div>
            
            {/* Value */}
            <div className="relative">
              <p className="text-5xl font-bold bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                {reps || 0}
              </p>
              
              {/* Subtle glow under value */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-blue-500/20 blur-xl" />
            </div>
            
            {/* Bottom indicator bar */}
            <div className="mt-4 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}