import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Results() {
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary"); // "summary" or "history"

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, sessionsRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/get_summary"),
        fetch("http://127.0.0.1:5000/get_sessions")
      ]);
      
      const summaryData = await summaryRes.json();
      const sessionsData = await sessionsRes.json();
      
      const sess = sessionsData.sessions || [];
      setSessions(sess);

      // compute a derived, up-to-date summary from sessions for more accurate UI
      const derived = computeSummaryFromSessions(sess);

      // merge backend summary with derived, preferring derived totals
      const merged = Object.assign({}, summaryData || {}, derived);
      setSummary(merged);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching results:", err);
      setLoading(false);
    }
  };

  // derive summary values from sessions array to ensure accuracy
  const computeSummaryFromSessions = (sessionsArr) => {
    const summaryOut = {
      total_sessions: 0,
      total_reps: 0,
      average_reps: 0,
      active_sessions: 0,
      current_session: null,
      by_exercise: {},
      by_mode: {}
    };

    if (!Array.isArray(sessionsArr) || sessionsArr.length === 0) return summaryOut;

    summaryOut.total_sessions = sessionsArr.length;
    summaryOut.total_reps = sessionsArr.reduce((acc, s) => acc + (s.total_reps || 0), 0);
    summaryOut.average_reps = summaryOut.total_sessions ? summaryOut.total_reps / summaryOut.total_sessions : 0;
    summaryOut.active_sessions = sessionsArr.filter(s => s.is_active).length;
    summaryOut.current_session = sessionsArr.find(s => s.is_active) || null;

    sessionsArr.forEach(s => {
      const mode = s.mode || "Unknown";

      // by_mode aggregation
      if (!summaryOut.by_mode[mode]) summaryOut.by_mode[mode] = { total_reps: 0, sessions: 0 };
      summaryOut.by_mode[mode].total_reps += (s.total_reps || 0);
      summaryOut.by_mode[mode].sessions += 1;

      // by_exercise aggregation (use mode as exercise key as well)
      if (!summaryOut.by_exercise[mode]) summaryOut.by_exercise[mode] = { total_reps: 0, good_posture: 0, bad_posture: 0 };
      summaryOut.by_exercise[mode].total_reps += (s.total_reps || 0);

      // accumulate posture counts if available
      // pushup fields
      if (s.pushup_good_posture) summaryOut.by_exercise[mode].good_posture += s.pushup_good_posture;
      if (s.pushup_bad_posture) summaryOut.by_exercise[mode].bad_posture += s.pushup_bad_posture;

      // curl fields
      if (s.curl_r_good_posture) summaryOut.by_exercise[mode].good_posture += s.curl_r_good_posture;
      if (s.curl_l_good_posture) summaryOut.by_exercise[mode].good_posture += s.curl_l_good_posture;
      if (s.curl_r_bad_posture) summaryOut.by_exercise[mode].bad_posture += s.curl_r_bad_posture;
      if (s.curl_l_bad_posture) summaryOut.by_exercise[mode].bad_posture += s.curl_l_bad_posture;

      // squat fields
      if (s.squat_good_posture) summaryOut.by_exercise[mode].good_posture += s.squat_good_posture;
      if (s.squat_bad_posture) summaryOut.by_exercise[mode].bad_posture += s.squat_bad_posture;

      // plank fields (time-based)
      if (s.plank_good_posture_time) summaryOut.by_exercise[mode].good_posture += s.plank_good_posture_time;
      if (s.plank_bad_posture_time) summaryOut.by_exercise[mode].bad_posture += s.plank_bad_posture_time;
    });

    return summaryOut;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Active";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDuration = (startTime, endTime) => {
    if (!startTime) return "Ongoing";
    if (!endTime) return "Active";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.floor((end - start) / 1000); // seconds
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="app-shell bg-black min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell bg-black min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text"
        >
          Workout Summary
        </motion.h1>

        {/* Tab Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "summary"
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-white/5 backdrop-blur-xl text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "history"
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-white/5 backdrop-blur-xl text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            History
          </button>
        </div>

        {activeTab === "summary" && summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Sessions */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition"
              >
                <h3 className="text-lg text-gray-300 mb-2">Total Sessions</h3>
                <p className="text-4xl font-bold text-blue-400">
                  {summary.total_sessions}
                </p>
                {summary.active_sessions > 0 && (
                  <p className="text-sm text-green-400 mt-2">1 Active</p>
                )}
              </motion.div>

              {/* Total Reps */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-xl p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition"
              >
                <h3 className="text-lg text-gray-300 mb-2">Total Reps</h3>
                <p className="text-4xl font-bold text-emerald-400">
                  {summary.total_reps}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Avg: {Math.round(summary.average_reps)} reps/session
                </p>
              </motion.div>

              {/* Current Session */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-violet-500/10 to-violet-600/10 backdrop-blur-xl p-6 rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition"
              >
                <h3 className="text-lg text-gray-300 mb-2">Current Session</h3>
                {summary.current_session ? (
                  <>
                    <p className="text-2xl font-bold text-violet-400">
                      {summary.current_session.reps} reps
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {summary.current_session.mode}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">No active session</p>
                )}
              </motion.div>
            </div>

            {/* By Exercise Type Breakdown */}
            {Object.keys(summary.by_exercise || {}).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl p-6 rounded-xl border border-blue-500/20"
              >
                <h2 className="text-2xl font-bold mb-4 text-white">Exercise Details</h2>
                <div className="space-y-4">
                  {Object.entries(summary.by_exercise).map(([exercise, stats]) => {
                    const totalReps = stats.total_reps || 0;
                    const goodPosture = stats.good_posture || 0;
                    const badPosture = stats.bad_posture || 0;
                    const goodPercentage = totalReps > 0 ? Math.round((goodPosture / totalReps) * 100) : 0;
                    
                    return (
                      <div key={exercise} className="bg-white/5 backdrop-blur-xl p-5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-semibold text-blue-300">
                            {exercise}
                          </h3>
                          <span className="text-2xl font-bold text-emerald-400">
                            {totalReps} reps
                          </span>
                        </div>
                        
                        {/* Posture Statistics */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-emerald-300">✓ Good Posture</span>
                              <span className="text-lg font-bold text-emerald-400">{goodPosture}</span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${goodPercentage}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{goodPercentage}% of reps</p>
                          </div>
                          
                          <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-red-300">✗ Bad Posture</span>
                              <span className="text-lg font-bold text-red-400">{badPosture}</span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - goodPercentage}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-red-500"
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{100 - goodPercentage}% of reps</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            
            {/* By Mode Breakdown (Summary) */}
            {Object.keys(summary.by_mode || {}).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl p-6 rounded-xl border border-blue-500/20"
              >
                <h2 className="text-2xl font-bold mb-4 text-white">Session Summary</h2>
                <div className="space-y-3">
                  {Object.entries(summary.by_mode).map(([mode, stats]) => (
                    <div key={mode} className="bg-white/5 backdrop-blur-xl p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-blue-300">
                          {mode}
                        </h3>
                        <div className="text-right">
                          <span className="text-xl font-bold text-emerald-400">
                            {stats.total_reps}
                          </span>
                          <span className="text-sm text-gray-400 block">
                            {stats.sessions} session{stats.sessions !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {sessions.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-xl border border-blue-500/20">
                <p className="text-xl text-gray-400">No workout history yet</p>
                <p className="text-gray-500 mt-2">Start a workout to see your progress!</p>
              </div>
            ) : (
              sessions.map((session, index) => (
                <motion.div
                  key={session.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`backdrop-blur-xl p-6 rounded-xl border ${
                    session.is_active
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "bg-white/5 border-blue-500/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-400">
                        {session.mode}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(session.start_time)}
                      </p>
                    </div>
                    {session.is_active && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold">
                        Active
                      </span>
                    )}
                  </div>

                  <div className={`grid gap-4 ${
                    session.mode === "Push-Up" 
                      ? "grid-cols-2 md:grid-cols-5" 
                      : "grid-cols-2 md:grid-cols-4"
                  }`}>
                    <div>
                      <p className="text-sm text-gray-400">Total Reps</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {session.total_reps}
                      </p>
                    </div>
                    {session.mode === "Push-Up" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-400">Push-Ups</p>
                          <p className="text-xl font-semibold">{session.pushup_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Good Posture</p>
                          <p className="text-lg font-semibold text-emerald-400">
                            {session.pushup_good_posture || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Bad Posture</p>
                          <p className="text-lg font-semibold text-red-400">
                            {session.pushup_bad_posture || 0}
                          </p>
                        </div>
                      </>
                    )}
                    {session.mode === "Curl" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-400">Right Arm</p>
                          <p className="text-xl font-semibold">{session.curl_count_r}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ✓ {session.curl_r_good_posture || 0} | ✗ {session.curl_r_bad_posture || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Left Arm</p>
                          <p className="text-xl font-semibold">{session.curl_count_l}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ✓ {session.curl_l_good_posture || 0} | ✗ {session.curl_l_bad_posture || 0}
                          </p>
                        </div>
                      </>
                    )}
                    {session.mode === "Squat" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-400">Squats</p>
                          <p className="text-xl font-semibold">{session.squat_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Good Posture</p>
                          <p className="text-lg font-semibold text-emerald-400">
                            {session.squat_good_posture || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Bad Posture</p>
                          <p className="text-lg font-semibold text-red-400">
                            {session.squat_bad_posture || 0}
                          </p>
                        </div>
                      </>
                    )}
                    {session.mode === "Plank" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-400">Time (s)</p>
                          <p className="text-xl font-semibold">{session.plank_time || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Good Posture</p>
                          <p className="text-lg font-semibold text-emerald-400">
                            {session.plank_good_posture_time || 0}s
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Bad Posture</p>
                          <p className="text-lg font-semibold text-red-400">
                            {session.plank_bad_posture_time || 0}s
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-xl font-semibold">
                        {getDuration(session.start_time, session.end_time)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
