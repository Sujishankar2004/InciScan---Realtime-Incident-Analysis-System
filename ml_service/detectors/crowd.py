from ultralytics import YOLO
import cv2
import time
import requests
from .base_detector import BaseDetector

class CrowdDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        # Load a pretrained YOLOv8n model
        self.model = YOLO("yolov8n.pt") 
        self.backend_url = "http://localhost:5000/api/incidents" # Node.js Backend

    def process_stream(self, source):
        # Handle webcam (0) or video file/url
        try:
            cap_source = 0 if source == "0" else source
            cap = cv2.VideoCapture(cap_source)
            
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    break

                # Run YOLOv8 inference on the frame
                results = self.model(frame, classes=[0], verbose=False) # 0 is 'person' class in COCO

                # Count people
                person_count = len(results[0].boxes)
                
                # Simple Logic: If > 10 people -> Crowd Incident
                if person_count > 10:
                    print(f"High Density Detected: {person_count} people")
                    self.send_alert(person_count)
                
                # Rate limit processing to avoid flooding
                time.sleep(1) 

            cap.release()
        except Exception as e:
            print(f"Error in CrowdDetector: {e}")
        finally:
            cv2.destroyAllWindows()

    def send_alert(self, count):
        payload = {
            "type": "Crowd Density",
            "description": f"High crowd density detected: {count} people",
            "latitude": 40.7128, # Placeholder
            "longitude": -74.006, # Placeholder
            "confidence": 0.9,
            "severity": "high" if count > 20 else "medium"
        }
        try:
            requests.post(self.backend_url, json=payload)
        except Exception as e:
            print(f"Failed to send alert: {e}")

    def cleanup(self):
        pass

