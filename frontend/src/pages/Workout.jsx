import { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import WebcamFeed from "../components/WebcamFeed";
import ModeSelector from "../components/ModeSelector";
import LiveStats from "../components/LiveStats";
import FeedbackCard from "../components/FeedbackCard";

export default function Workout() {
  const webcamRef = useRef(null);
  const [mode, setMode] = useState("Push-Up");
  const [angles, setAngles] = useState({ elbow: 0 });
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("Ready to begin");
  const [poseData, setPoseData] = useState({});

  // Start workout session
  useEffect(() => {
    fetch("http://127.0.0.1:5000/start_session", { method: "POST" }).catch(
      () => {}
    );

    return () => {
      fetch("http://127.0.0.1:5000/end_session", { method: "POST" }).catch(
        () => {}
      );
    };
  }, []);

  // Fetch pose data
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:5000/pose_data")
        .then((res) => res.json())
        .then((data) => {
          setPoseData(data);

          // Angle updates
          if (data.mode === "Squat" && data.knee_angle !== undefined) {
            setAngles({ elbow: data.knee_angle });
          } else if (data.mode === "Plank" && data.plank_time !== undefined) {
            setAngles({ elbow: data.plank_time });
          } else if (data.elbow_angle !== undefined) {
            setAngles({ elbow: data.elbow_angle });
          }

          // Mode-based reps & feedback
          if (data.mode === "Push-Up") {
            setReps(data.pushup_count || 0);
            setFeedback(
              data.pushup_stage === "down"
                ? "Go lower"
                : data.pushup_stage === "up"
                ? "Push up"
                : "Good posture"
            );
          } 
          
          else if (data.mode === "Curl") {
            const total =
              (data.curl_count_r || 0) + (data.curl_count_l || 0);
            setReps(total);

            const right =
              data.curl_stage_r === "up"
                ? "Curl"
                : data.curl_stage_r === "down"
                ? "Slow down"
                : "Good posture";

            const left =
              data.curl_stage_l === "up"
                ? "Curl"
                : data.curl_stage_l === "down"
                ? "Slow down"
                : "Good posture";

            if (right === left) {
              setFeedback(right);
            } else {
              setFeedback(`${right} / ${left}`);
            }
          } 
          
          else if (data.mode === "Squat") {
            setReps(data.squat_count || 0);
            setFeedback(
              data.squat_stage === "down"
                ? "Go lower"
                : data.squat_stage === "up"
                ? "Stand up"
                : "Good posture"
            );
          } 
          
          else if (data.mode === "Plank") {
            setReps(data.plank_time || 0);
            setFeedback(
              data.plank_time > 0
                ? `Hold steady (${data.plank_time}s)`
                : "Start plank position"
            );
          }
        })
        .catch(() => {
          setFeedback("Connecting to backend...");
        });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Update backend mode
  useEffect(() => {
    fetch("http://127.0.0.1:5000/set_mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    }).catch(() => {});
  }, [mode]);

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle professional background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b0f14] via-black to-[#0b0f14]" />

      <Navbar />

      <div className="px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-semibold text-white text-center">
            {mode} Mode
          </h1>

          {/* Mode selector */}
          <div className="flex justify-center">
            <ModeSelector mode={mode} setMode={setMode} />
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Webcam */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4">
              <WebcamFeed webcamRef={webcamRef} />
            </div>

            {/* Stats & feedback */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <LiveStats angles={angles} reps={reps} mode={mode} />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <FeedbackCard feedback={feedback} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
