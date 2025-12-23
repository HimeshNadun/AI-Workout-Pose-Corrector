import { useState } from "react";

export default function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div 
      className="relative min-h-screen bg-black overflow-hidden m-0 p-0"
      onMouseMove={handleMouseMove}
      style={{ margin: 0, padding: 0 }}
    >
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
        backgroundSize: '100px 100px'
      }} />

      {/* Blue Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl transition-all duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float-slower" />
      </div>

      {/* Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-full px-6 py-3 border border-blue-500/20">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
            </div>
            <span className="text-sm font-semibold text-blue-300 tracking-wide">
              Premium Beta Access Available
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-8">
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold leading-none tracking-tight">
              <span className="block text-white mb-2" style={{
                textShadow: '0 0 80px rgba(59, 130, 246, 0.3)'
              }}>
                Your Personal
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-transparent bg-clip-text" style={{
                textShadow: '0 0 100px rgba(59, 130, 246, 0.5)'
              }}>
                AI Fitness Coach
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
              Experience intelligent workout tracking with real-time form analysis, 
              automatic rep counting, and personalized insights powered by advanced AI technology.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
            <button 
              onClick={() => alert('Navigate to workout page')}
              className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                Start Training Now
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            <button className="group px-10 py-5 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-2xl text-gray-300 hover:text-white font-semibold text-lg border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <span className="flex items-center gap-3">
                Watch Demo
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Real-time Analytics",
                desc: "Track every rep with precision"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                title: "Form Analysis",
                desc: "Perfect your technique instantly"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "AI Insights",
                desc: "Personalized recommendations"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:translate-y-[-4px]"
                style={{
                  boxShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
                <div className="relative space-y-4">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000 !important;
        }

        @keyframes float-slow {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% { 
            transform: translate(-30px, -30px) scale(1.1);
            opacity: 0.25;
          }
        }

        @keyframes float-slower {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
          }
          50% { 
            transform: translate(40px, 30px) scale(1.15);
            opacity: 0.2;
          }
        }

        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 20s ease-in-out infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}