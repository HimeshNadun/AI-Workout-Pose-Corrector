# app.py
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import mediapipe as mp
import math
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# ------------------ Angle Calculation ------------------
def calculate_angle(a, b, c):
    a = [a.x, a.y]
    b = [b.x, b.y]
    c = [c.x, c.y]
    radians = math.atan2(c[1]-b[1], c[0]-b[0]) - math.atan2(a[1]-b[1], a[0]-b[0])
    angle = abs(radians*180.0/math.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

# ------------------ Helper Class ------------------
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# ------------------ Mediapipe Setup ------------------
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False,
                    model_complexity=2,
                    enable_segmentation=False,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

# ------------------ Camera ------------------
cap = cv2.VideoCapture(0)  # Default laptop camera
if not cap.isOpened():
    raise RuntimeError("Cannot open default camera")

# ------------------ State Variables ------------------
pushup_count = 0
pushup_stage = None
curl_count_r = 0
curl_count_l = 0
curl_stage_r = None
curl_stage_l = None
squat_count = 0
squat_stage = None
plank_time = 0  # Time in seconds
plank_start_time = None

# Posture quality tracking
pushup_good_posture = 0
pushup_bad_posture = 0
curl_r_good_posture = 0
curl_r_bad_posture = 0
curl_l_good_posture = 0
curl_l_bad_posture = 0
squat_good_posture = 0
squat_bad_posture = 0
plank_good_posture_time = 0  # Time in good posture (seconds)
plank_bad_posture_time = 0  # Time in bad posture (seconds)

PUSHUP_ELBOW_MIN = 70
PUSHUP_ELBOW_MAX = 160
CURL_ELBOW_MIN = 50
CURL_ELBOW_MAX = 160
SQUAT_KNEE_MIN = 80  # Minimum knee angle for squat down
SQUAT_KNEE_MAX = 160  # Maximum knee angle for squat up
PLANK_ALIGNMENT_THRESHOLD = 0.15  # Threshold for body alignment
ANGLE_HISTORY_WINDOW = 8
angle_history = []
angle_history_r = []
angle_history_l = []
knee_angle_history = []

mode = "Push-Up"  # Default mode

# Current angles for display
current_elbow_angle = 0  # For Push-Up mode (average)
current_elbow_angle_r = 0  # For Curl mode (right)
current_elbow_angle_l = 0  # For Curl mode (left)
current_knee_angle = 0  # For Squat mode (average)

# Workout session tracking
workout_sessions = []  # Store all workout sessions
current_session_start = None
current_session_mode = None

# ------------------ Video Generator ------------------
def gen_frames():
    global pushup_count, pushup_stage
    global curl_count_r, curl_count_l, curl_stage_r, curl_stage_l
    global angle_history, angle_history_r, angle_history_l
    global current_elbow_angle, current_elbow_angle_r, current_elbow_angle_l
    global pushup_good_posture, pushup_bad_posture
    global curl_r_good_posture, curl_r_bad_posture, curl_l_good_posture, curl_l_bad_posture

    while True:
        success, img = cap.read()
        # Skip bad frames so MediaPipe doesn't receive empty packets
        if not success or img is None or img.size == 0:
            continue

        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = pose.process(imgRGB)

        feedback_r = ""
        feedback_l = ""
        feedback = ""

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            # --- Common joints ---
            r_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            r_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
            r_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

            l_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            l_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
            l_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

            r_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)
            l_angle = calculate_angle(l_shoulder, l_elbow, l_wrist)

            if mode == "Push-Up":
                r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                mid_hip = Point((r_hip.x + l_hip.x)/2, (r_hip.y + l_hip.y)/2)
                spine_angle = calculate_angle(r_shoulder, mid_hip, l_shoulder)

                elbow_angle = (r_angle + l_angle) / 2
                angle_history.append(elbow_angle)
                if len(angle_history) > ANGLE_HISTORY_WINDOW:
                    angle_history.pop(0)
                smoothed_angle = sum(angle_history)/len(angle_history)
                current_elbow_angle = int(smoothed_angle)

                if smoothed_angle <= PUSHUP_ELBOW_MIN and spine_angle > 150:
                    pushup_stage = "down"
                    feedback = "Go down further"
                elif smoothed_angle >= PUSHUP_ELBOW_MAX and pushup_stage == "down" and spine_angle > 150:
                    pushup_stage = "up"
                    pushup_count += 1
                    # Track posture quality: good if spine is straight (spine_angle > 150)
                    if spine_angle > 150:
                        pushup_good_posture += 1
                    else:
                        pushup_bad_posture += 1
                    feedback = "Push up!"
                else:
                    feedback = "Good posture"

            elif mode == "Curl":
                torso_x = (l_shoulder.x + r_shoulder.x)/2

                angle_history_r.append(r_angle)
                if len(angle_history_r) > ANGLE_HISTORY_WINDOW:
                    angle_history_r.pop(0)
                smoothed_r = sum(angle_history_r)/len(angle_history_r)
                current_elbow_angle_r = int(smoothed_r)

                angle_history_l.append(l_angle)
                if len(angle_history_l) > ANGLE_HISTORY_WINDOW:
                    angle_history_l.pop(0)
                smoothed_l = sum(angle_history_l)/len(angle_history_l)
                current_elbow_angle_l = int(smoothed_l)

                if smoothed_r <= CURL_ELBOW_MIN and abs(r_elbow.x - torso_x) < 0.1:
                    curl_stage_r = "up"
                    feedback_r = "Curl up!"
                elif smoothed_r >= CURL_ELBOW_MAX and curl_stage_r == "up":
                    curl_stage_r = "down"
                    curl_count_r += 1
                    # Track posture quality: good if elbow stays close to torso
                    if abs(r_elbow.x - torso_x) < 0.1:
                        curl_r_good_posture += 1
                    else:
                        curl_r_bad_posture += 1
                    feedback_r = "Lower slowly"
                else:
                    feedback_r = "Good posture"

                if smoothed_l <= CURL_ELBOW_MIN and abs(l_elbow.x - torso_x) < 0.1:
                    curl_stage_l = "up"
                    feedback_l = "Curl up!"
                elif smoothed_l >= CURL_ELBOW_MAX and curl_stage_l == "up":
                    curl_stage_l = "down"
                    curl_count_l += 1
                    # Track posture quality: good if elbow stays close to torso
                    if abs(l_elbow.x - torso_x) < 0.1:
                        curl_l_good_posture += 1
                    else:
                        curl_l_bad_posture += 1
                    feedback_l = "Lower slowly"
                else:
                    feedback_l = "Good posture"

            elif mode == "Squat":
                # Get hip, knee, and ankle landmarks
                r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                r_knee = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
                r_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
                
                l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                l_knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
                l_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                
                # Calculate knee angles
                r_knee_angle = calculate_angle(r_hip, r_knee, r_ankle)
                l_knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
                knee_angle = (r_knee_angle + l_knee_angle) / 2
                
                # Smooth knee angle
                knee_angle_history.append(knee_angle)
                if len(knee_angle_history) > ANGLE_HISTORY_WINDOW:
                    knee_angle_history.pop(0)
                smoothed_knee_angle = sum(knee_angle_history) / len(knee_angle_history)
                current_knee_angle = int(smoothed_knee_angle)
                
                # Check spine alignment for posture
                mid_hip = Point((r_hip.x + l_hip.x)/2, (r_hip.y + l_hip.y)/2)
                spine_angle = calculate_angle(r_shoulder, mid_hip, l_shoulder)
                
                # Squat detection
                if smoothed_knee_angle <= SQUAT_KNEE_MIN:
                    squat_stage = "down"
                    feedback = "Go lower"
                elif smoothed_knee_angle >= SQUAT_KNEE_MAX and squat_stage == "down":
                    squat_stage = "up"
                    squat_count += 1
                    # Track posture quality: good if spine is relatively straight
                    if spine_angle > 140:
                        squat_good_posture += 1
                    else:
                        squat_bad_posture += 1
                    feedback = "Stand up!"
                else:
                    feedback = "Good posture"

            elif mode == "Plank":
                # Get key points for plank alignment
                r_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
                l_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
                r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                r_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
                l_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                
                # Calculate alignment - check if shoulders, hips, and ankles are aligned
                shoulder_y = (r_shoulder.y + l_shoulder.y) / 2
                hip_y = (r_hip.y + l_hip.y) / 2
                ankle_y = (r_ankle.y + l_ankle.y) / 2
                
                # Calculate deviation from straight line
                alignment_deviation = abs(shoulder_y - hip_y) + abs(hip_y - ankle_y)
                
                # Start tracking time if not started
                if plank_start_time is None:
                    import time
                    plank_start_time = time.time()
                
                # Update plank time
                import time
                current_time = time.time()
                elapsed = current_time - plank_start_time
                
                # Track posture quality based on alignment
                if alignment_deviation < PLANK_ALIGNMENT_THRESHOLD:
                    plank_good_posture_time += 0.5  # Add 0.5 seconds per frame (assuming ~2 FPS processing)
                    feedback = "Perfect plank!"
                else:
                    plank_bad_posture_time += 0.5
                    feedback = "Keep body straight"
                
                plank_time = int(elapsed)
                current_elbow_angle = int(alignment_deviation * 1000)  # Use as display metric

            # Draw skeleton
            mp_draw.draw_landmarks(img, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# ------------------ Flask Routes ------------------
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/pose_data')
def pose_data():
    # Determine which angle to send based on mode
    if mode == "Push-Up":
        angle = current_elbow_angle
    elif mode == "Curl":
        # For curl, use average of both arms
        angle = int((current_elbow_angle_r + current_elbow_angle_l) / 2)
    elif mode == "Squat":
        angle = current_knee_angle
    elif mode == "Plank":
        angle = current_elbow_angle  # Using alignment deviation
    else:
        angle = current_elbow_angle
    
    data = {
        "pushup_count": pushup_count,
        "pushup_stage": pushup_stage,
        "curl_count_r": curl_count_r,
        "curl_count_l": curl_count_l,
        "curl_stage_r": curl_stage_r,
        "curl_stage_l": curl_stage_l,
        "squat_count": squat_count,
        "squat_stage": squat_stage,
        "plank_time": plank_time,
        "mode": mode,
        "elbow_angle": angle,  # Generic angle display
        "knee_angle": current_knee_angle,
        "elbow_angle_r": current_elbow_angle_r,
        "elbow_angle_l": current_elbow_angle_l,
        "pushup_good_posture": pushup_good_posture,
        "pushup_bad_posture": pushup_bad_posture,
        "curl_r_good_posture": curl_r_good_posture,
        "curl_r_bad_posture": curl_r_bad_posture,
        "curl_l_good_posture": curl_l_good_posture,
        "curl_l_bad_posture": curl_l_bad_posture,
        "squat_good_posture": squat_good_posture,
        "squat_bad_posture": squat_bad_posture,
        "plank_good_posture_time": int(plank_good_posture_time),
        "plank_bad_posture_time": int(plank_bad_posture_time)
    }
    return jsonify(data)

@app.route('/set_mode', methods=['POST'])
def set_mode():
    global mode, current_session_start, current_session_mode
    data = request.get_json()
    if 'mode' in data:
        # Save previous session if mode changed
        if current_session_start and current_session_mode and current_session_mode != data['mode']:
            save_current_session()
        mode = data['mode']
        # Start new session if not already started
        if not current_session_start:
            current_session_start = datetime.now().isoformat()
            current_session_mode = mode
        return jsonify({"status": "success", "mode": mode})
    return jsonify({"status": "error", "message": "Mode not provided"}), 400

def save_current_session():
    """Save the current workout session"""
    global pushup_count, curl_count_r, curl_count_l, squat_count, plank_time
    global current_session_start, current_session_mode
    global pushup_good_posture, pushup_bad_posture
    global curl_r_good_posture, curl_r_bad_posture, curl_l_good_posture, curl_l_bad_posture
    global squat_good_posture, squat_bad_posture
    global plank_good_posture_time, plank_bad_posture_time
    if not current_session_start:
        return
    
    # Calculate total reps based on mode
    if current_session_mode == "Push-Up":
        total_reps = pushup_count
    elif current_session_mode == "Curl":
        total_reps = curl_count_r + curl_count_l
    elif current_session_mode == "Squat":
        total_reps = squat_count
    elif current_session_mode == "Plank":
        total_reps = plank_time  # For plank, use time as "reps"
    else:
        total_reps = 0
    
    session_data = {
        "id": len(workout_sessions) + 1,
        "mode": current_session_mode,
        "start_time": current_session_start,
        "end_time": datetime.now().isoformat(),
        "pushup_count": pushup_count,
        "curl_count_r": curl_count_r,
        "curl_count_l": curl_count_l,
        "squat_count": squat_count,
        "plank_time": plank_time,
        "total_reps": total_reps,
        "pushup_good_posture": pushup_good_posture,
        "pushup_bad_posture": pushup_bad_posture,
        "curl_r_good_posture": curl_r_good_posture,
        "curl_r_bad_posture": curl_r_bad_posture,
        "curl_l_good_posture": curl_l_good_posture,
        "curl_l_bad_posture": curl_l_bad_posture,
        "squat_good_posture": squat_good_posture,
        "squat_bad_posture": squat_bad_posture,
        "plank_good_posture_time": int(plank_good_posture_time),
        "plank_bad_posture_time": int(plank_bad_posture_time)
    }
    workout_sessions.append(session_data)
    return session_data

@app.route('/start_session', methods=['POST'])
def start_session():
    """Start a new workout session"""
    global current_session_start, current_session_mode
    global pushup_count, curl_count_r, curl_count_l, squat_count, plank_time, plank_start_time
    global pushup_good_posture, pushup_bad_posture
    global curl_r_good_posture, curl_r_bad_posture, curl_l_good_posture, curl_l_bad_posture
    global squat_good_posture, squat_bad_posture
    global plank_good_posture_time, plank_bad_posture_time
    # Save previous session if exists
    if current_session_start:
        save_current_session()
    
    # Reset counters
    pushup_count = 0
    curl_count_r = 0
    curl_count_l = 0
    squat_count = 0
    plank_time = 0
    plank_start_time = None
    pushup_good_posture = 0
    pushup_bad_posture = 0
    curl_r_good_posture = 0
    curl_r_bad_posture = 0
    curl_l_good_posture = 0
    curl_l_bad_posture = 0
    squat_good_posture = 0
    squat_bad_posture = 0
    plank_good_posture_time = 0
    plank_bad_posture_time = 0
    
    # Start new session
    current_session_start = datetime.now().isoformat()
    current_session_mode = mode
    
    return jsonify({"status": "success", "session_started": current_session_start})

@app.route('/end_session', methods=['POST'])
def end_session():
    """End current workout session and save it"""
    global current_session_start
    if current_session_start:
        session_data = save_current_session()
        current_session_start = None
        return jsonify({"status": "success", "session": session_data})
    return jsonify({"status": "error", "message": "No active session"}), 400

@app.route('/get_sessions', methods=['GET'])
def get_sessions():
    """Get all workout sessions"""
    # Include current session if active
    sessions = workout_sessions.copy()
    if current_session_start:
        current_data = {
            "id": len(sessions) + 1,
            "mode": current_session_mode,
            "start_time": current_session_start,
            "end_time": None,
            "pushup_count": pushup_count,
            "curl_count_r": curl_count_r,
            "curl_count_l": curl_count_l,
            "squat_count": squat_count,
            "plank_time": plank_time,
            "total_reps": pushup_count if current_session_mode == "Push-Up" else (
                (curl_count_r + curl_count_l) if current_session_mode == "Curl" else (
                    squat_count if current_session_mode == "Squat" else plank_time
                )
            ),
            "is_active": True,
            "pushup_good_posture": pushup_good_posture,
            "pushup_bad_posture": pushup_bad_posture,
            "curl_r_good_posture": curl_r_good_posture,
            "curl_r_bad_posture": curl_r_bad_posture,
            "curl_l_good_posture": curl_l_good_posture,
            "curl_l_bad_posture": curl_l_bad_posture,
            "squat_good_posture": squat_good_posture,
            "squat_bad_posture": squat_bad_posture,
            "plank_good_posture_time": int(plank_good_posture_time),
            "plank_bad_posture_time": int(plank_bad_posture_time)
        }
        sessions.append(current_data)
    return jsonify({"sessions": sessions})

@app.route('/get_summary', methods=['GET'])
def get_summary():
    """Get workout summary statistics"""
    all_sessions = workout_sessions.copy()
    if current_session_start:
        all_sessions.append({
            "mode": current_session_mode,
            "pushup_count": pushup_count,
            "curl_count_r": curl_count_r,
            "curl_count_l": curl_count_l,
            "total_reps": pushup_count if current_session_mode == "Push-Up" else (curl_count_r + curl_count_l),
            "pushup_good_posture": pushup_good_posture,
            "pushup_bad_posture": pushup_bad_posture,
            "curl_r_good_posture": curl_r_good_posture,
            "curl_r_bad_posture": curl_r_bad_posture,
            "curl_l_good_posture": curl_l_good_posture,
            "curl_l_bad_posture": curl_l_bad_posture
        })
    
    if not all_sessions:
        return jsonify({
            "total_sessions": 0,
            "total_reps": 0,
            "by_mode": {},
            "by_exercise": {},
            "average_reps": 0
        })
    
    total_reps = sum(s.get("total_reps", 0) for s in all_sessions)
    by_mode = {}
    by_exercise = {}
    
    for session in all_sessions:
        mode_name = session.get("mode", "Unknown")
        reps = session.get("total_reps", 0)
        if mode_name not in by_mode:
            by_mode[mode_name] = {"sessions": 0, "total_reps": 0}
        by_mode[mode_name]["sessions"] += 1
        by_mode[mode_name]["total_reps"] += reps
        
        # Track by individual exercise type
        if mode_name == "Push-Up":
            if "Push-Up" not in by_exercise:
                by_exercise["Push-Up"] = {
                    "total_reps": 0,
                    "good_posture": 0,
                    "bad_posture": 0
                }
            by_exercise["Push-Up"]["total_reps"] += session.get("pushup_count", 0)
            by_exercise["Push-Up"]["good_posture"] += session.get("pushup_good_posture", 0)
            by_exercise["Push-Up"]["bad_posture"] += session.get("pushup_bad_posture", 0)
        elif mode_name == "Curl":
            if "Curl (Right Arm)" not in by_exercise:
                by_exercise["Curl (Right Arm)"] = {
                    "total_reps": 0,
                    "good_posture": 0,
                    "bad_posture": 0
                }
            if "Curl (Left Arm)" not in by_exercise:
                by_exercise["Curl (Left Arm)"] = {
                    "total_reps": 0,
                    "good_posture": 0,
                    "bad_posture": 0
                }
            by_exercise["Curl (Right Arm)"]["total_reps"] += session.get("curl_count_r", 0)
            by_exercise["Curl (Right Arm)"]["good_posture"] += session.get("curl_r_good_posture", 0)
            by_exercise["Curl (Right Arm)"]["bad_posture"] += session.get("curl_r_bad_posture", 0)
            by_exercise["Curl (Left Arm)"]["total_reps"] += session.get("curl_count_l", 0)
            by_exercise["Curl (Left Arm)"]["good_posture"] += session.get("curl_l_good_posture", 0)
            by_exercise["Curl (Left Arm)"]["bad_posture"] += session.get("curl_l_bad_posture", 0)
        elif mode_name == "Squat":
            if "Squat" not in by_exercise:
                by_exercise["Squat"] = {
                    "total_reps": 0,
                    "good_posture": 0,
                    "bad_posture": 0
                }
            by_exercise["Squat"]["total_reps"] += session.get("squat_count", 0)
            by_exercise["Squat"]["good_posture"] += session.get("squat_good_posture", 0)
            by_exercise["Squat"]["bad_posture"] += session.get("squat_bad_posture", 0)
        elif mode_name == "Plank":
            if "Plank" not in by_exercise:
                by_exercise["Plank"] = {
                    "total_reps": 0,
                    "good_posture": 0,
                    "bad_posture": 0
                }
            # For plank, use time as "reps" and posture time as posture counts
            by_exercise["Plank"]["total_reps"] += session.get("plank_time", 0)
            by_exercise["Plank"]["good_posture"] += session.get("plank_good_posture_time", 0)
            by_exercise["Plank"]["bad_posture"] += session.get("plank_bad_posture_time", 0)
    
    return jsonify({
        "total_sessions": len(workout_sessions),
        "active_sessions": 1 if current_session_start else 0,
        "total_reps": total_reps,
        "by_mode": by_mode,
        "by_exercise": by_exercise,
        "average_reps": total_reps / len(all_sessions) if all_sessions else 0,
        "current_session": {
            "mode": current_session_mode,
            "reps": pushup_count if current_session_mode == "Push-Up" else (curl_count_r + curl_count_l),
            "start_time": current_session_start,
            "pushup_good_posture": pushup_good_posture,
            "pushup_bad_posture": pushup_bad_posture,
            "curl_r_good_posture": curl_r_good_posture,
            "curl_r_bad_posture": curl_r_bad_posture,
            "curl_l_good_posture": curl_l_good_posture,
            "curl_l_bad_posture": curl_l_bad_posture
        } if current_session_start else None
    })

@app.route('/')
def index():
    return "Workout Pose Detection Running!"

if __name__ == '__main__':
    print("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True)
