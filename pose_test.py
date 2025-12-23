import cv2
import mediapipe as mp
import math
import time

# ------------------ Angle Calculation ------------------
def calculate_angle(a, b, c):
    """Calculate the angle at point b (in degrees) given points a, b, c"""
    a = [a.x, a.y]
    b = [b.x, b.y]
    c = [c.x, c.y]

    radians = math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(a[1] - b[1], a[0] - b[0])
    angle = abs(radians * 180.0 / math.pi)
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
mp_draw = mp.solutions.drawing_utils
# custom drawing specs to make skeleton very visible
landmark_spec = mp_draw.DrawingSpec(color=(0, 255, 0), thickness=3, circle_radius=4)
connection_spec = mp_draw.DrawingSpec(color=(255, 0, 0), thickness=2, circle_radius=2)

pose = mp_pose.Pose(static_image_mode=False,
                    model_complexity=1,
                    enable_segmentation=False,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5)

# ------------------ Default Camera ------------------
cap = cv2.VideoCapture(0)  # default laptop camera
if not cap.isOpened():
    print("Cannot open default camera")
    exit()

# set a reasonable resolution (optional)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 960)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# ------------------ Push-Up Settings ------------------
pushup_count = 0
pushup_stage = None
PUSHUP_ELBOW_MIN = 70
PUSHUP_ELBOW_MAX = 160
ANGLE_HISTORY_WINDOW = 8
angle_history = []

# ------------------ Dumbbell Curl Settings ------------------
curl_count_r = 0
curl_count_l = 0
curl_stage_r = None
curl_stage_l = None
CURL_ELBOW_MIN = 50
CURL_ELBOW_MAX = 160
angle_history_r = []
angle_history_l = []

# ------------------ Mode ------------------
mode = "Push-Up"  # default

# debug counters
frame_idx = 0
last_landmark_print = 0

print("Starting pose detection. Press 1 = Push-Up, 2 = Curl, q = quit")

# ------------------ Main Loop ------------------
while True:
    success, img = cap.read()
    if not success or img is None:
        print("Failed to grab frame")
        break

    frame_idx += 1
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)

    feedback_r = ""
    feedback_l = ""
    feedback = ""

    # Mode switching
    key = cv2.waitKey(1) & 0xFF
    if key == ord('1'):
        mode = "Push-Up"
    elif key == ord('2'):
        mode = "Curl"
    elif key == ord('q'):
        break

    if results.pose_landmarks:
        # Print occasional debug message so terminal confirms detection
        now = time.time()
        if now - last_landmark_print > 2.0:  # every ~2 seconds
            print("Landmarks detected (frame {}).".format(frame_idx))
            last_landmark_print = now

        landmarks = results.pose_landmarks.landmark

        # --- draw skeleton with visible specs ---
        mp_draw.draw_landmarks(img, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                               landmark_drawing_spec=landmark_spec,
                               connection_drawing_spec=connection_spec)

        # --- Common joints ---
        r_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        r_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        r_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        l_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        l_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        l_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

        # draw big circles on key joints (explicit so you can see even if draw_landmarks fails visually)
        h, w = img.shape[:2]
        for p in (r_shoulder, r_elbow, r_wrist, l_shoulder, l_elbow, l_wrist):
            cx = int(p.x * w)
            cy = int(p.y * h)
            cv2.circle(img, (cx, cy), 6, (0, 255, 255), -1)  # yellow filled

        # --- Calculate elbow angles ---
        r_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)
        l_angle = calculate_angle(l_shoulder, l_elbow, l_wrist)

        # --- Push-Up Mode ---
        if mode == "Push-Up":
            r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
            l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            mid_hip = Point((r_hip.x + l_hip.x) / 2, (r_hip.y + l_hip.y) / 2)
            spine_angle = calculate_angle(r_shoulder, mid_hip, l_shoulder)

            elbow_angle = (r_angle + l_angle) / 2

            # Smooth elbow angle
            angle_history.append(elbow_angle)
            if len(angle_history) > ANGLE_HISTORY_WINDOW:
                angle_history.pop(0)
            smoothed_angle = sum(angle_history) / len(angle_history)

            # Stage detection
            if smoothed_angle <= PUSHUP_ELBOW_MIN and spine_angle > 150:
                pushup_stage = "down"
                feedback = "Go down further"
            elif smoothed_angle >= PUSHUP_ELBOW_MAX and pushup_stage == "down" and spine_angle > 150:
                pushup_stage = "up"
                pushup_count += 1
                feedback = "Push up!"
            else:
                feedback = "Good posture"

            # Display info
            cv2.putText(img, f"Mode: Push-Up", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (180, 180, 255), 2)
            cv2.putText(img, f"Elbow Angle: {int(smoothed_angle)}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                        (0, 200, 255), 2)
            cv2.putText(img, f"Spine Angle: {int(spine_angle)}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                        (0, 255, 0), 2)
            cv2.putText(img, feedback, (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.putText(img, f"Push-Ups: {pushup_count}", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                        (0, 180, 255), 2)

        # --- Dumbbell Curl Mode ---
        elif mode == "Curl":
            torso_x = (l_shoulder.x + r_shoulder.x) / 2

            # Smooth right elbow
            angle_history_r.append(r_angle)
            if len(angle_history_r) > ANGLE_HISTORY_WINDOW:
                angle_history_r.pop(0)
            smoothed_r = sum(angle_history_r) / len(angle_history_r)

            # Smooth left elbow
            angle_history_l.append(l_angle)
            if len(angle_history_l) > ANGLE_HISTORY_WINDOW:
                angle_history_l.pop(0)
            smoothed_l = sum(angle_history_l) / len(angle_history_l)

            # Right Arm Stage
            if smoothed_r <= CURL_ELBOW_MIN and abs(r_elbow.x - torso_x) < 0.12:
                curl_stage_r = "up"
                feedback_r = "Curl up!"
            elif smoothed_r >= CURL_ELBOW_MAX and curl_stage_r == "up":
                curl_stage_r = "down"
                curl_count_r += 1
                feedback_r = "Lower slowly"
            else:
                feedback_r = "Good posture"

            # Left Arm Stage
            if smoothed_l <= CURL_ELBOW_MIN and abs(l_elbow.x - torso_x) < 0.12:
                curl_stage_l = "up"
                feedback_l = "Curl up!"
            elif smoothed_l >= CURL_ELBOW_MAX and curl_stage_l == "up":
                curl_stage_l = "down"
                curl_count_l += 1
                feedback_l = "Lower slowly"
            else:
                feedback_l = "Good posture"

            # Display info
            cv2.putText(img, f"Mode: Dumbbell Curl", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (180, 180, 255), 2)
            cv2.putText(img, f"R Elbow: {int(smoothed_r)}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
            cv2.putText(img, f"L Elbow: {int(smoothed_l)}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.putText(img, f"R: {feedback_r}", (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.putText(img, f"L: {feedback_l}", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.putText(img, f"R Curls: {curl_count_r}", (20, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 180, 255), 2)
            cv2.putText(img, f"L Curls: {curl_count_l}", (20, 210), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 180, 255), 2)
    else:
        # if no landmarks, print short message occasionally for debugging
        if frame_idx % 150 == 0:
            print("No landmarks detected (frame {}). Make sure your full body is visible & lighting is good.".format(frame_idx))

    # Show the image window
    cv2.imshow("Workout Pose Detector", img)

cap.release()
cv2.destroyAllWindows()
