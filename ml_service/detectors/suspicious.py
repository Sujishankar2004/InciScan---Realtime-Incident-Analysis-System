from ultralytics import YOLO
import cv2
import time
import requests
from .base_detector import BaseDetector

class SuspiciousDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        self.model = YOLO("yolov8n.pt") 
        self.backend_url = "http://localhost:5000/api/incidents"
        self.track_history = {} # track_id -> {start_time, last_seen_time, alerted}
        self.loitering_threshold = 10 # seconds

    def process_stream(self, source):
        try:
            cap_source = 0 if source == "0" else source
            cap = cv2.VideoCapture(cap_source)
            
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    break

                # Run YOLOv8 Tracking
                # persist=True is crucial for tracking
                results = self.model.track(frame, classes=[0], persist=True, verbose=False)

                if results and results[0].boxes.id is not None:
                    track_ids = results[0].boxes.id.int().cpu().tolist()
                    current_time = time.time()

                    for track_id in track_ids:
                        if track_id not in self.track_history:
                            self.track_history[track_id] = {
                                "start_time": current_time,
                                "last_seen_time": current_time,
                                "alerted": False
                            }
                        else:
                            self.track_history[track_id]["last_seen_time"] = current_time
                            
                            # Check duration
                            duration = current_time - self.track_history[track_id]["start_time"]
                            if duration > self.loitering_threshold and not self.track_history[track_id]["alerted"]:
                                print(f"Suspicious Activity (Loitering) Detected: ID {track_id} for {int(duration)}s")
                                self.send_alert(track_id, duration)
                                self.track_history[track_id]["alerted"] = True
                
                # Cleanup old tracks (optional, to save memory)
                # self.cleanup_old_tracks()
                
                time.sleep(0.1) # track slightly faster than crowd

            cap.release()
        except Exception as e:
            print(f"Error in SuspiciousDetector: {e}")
        finally:
            cv2.destroyAllWindows()

    def send_alert(self, track_id, duration):
        payload = {
            "type": "Suspicious Activity",
            "description": f"Person (ID: {track_id}) loitering for {int(duration)} seconds",
            "latitude": 40.7128,
            "longitude": -74.006,
            "confidence": 0.85,
            "severity": "medium",
            "status": "pending"
        }
        try:
            requests.post(self.backend_url, json=payload)
        except Exception as e:
            print(f"Failed to send alert: {e}")

    def cleanup(self):
        pass
