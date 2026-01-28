from ultralytics import YOLO
import cv2
import time
import requests
from .base_detector import BaseDetector

class ViolenceDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        # Load YOLOv8n model
        self.model = YOLO("yolov8n.pt") 
        self.backend_url = "http://localhost:5000/api/incidents"
        # COCO Classes: 43: knife, 34: baseball bat, 76: scissors
        # Adjust IDs based on exact model version if needed, but these are standard COCO
        self.weapon_classes = [43, 34] 

    def process_stream(self, source):
        try:
            cap_source = 0 if source == "0" else source
            cap = cv2.VideoCapture(cap_source)
            
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    break

                # Run YOLOv8 inference
                # Detect persons (0) and weapons
                classes_to_detect = [0] + self.weapon_classes
                results = self.model(frame, classes=classes_to_detect, verbose=False)

                # Check for weapons
                detected_config = results[0].boxes.cls.cpu().tolist()
                weapons_found = [cls_id for cls_id in detected_config if cls_id in self.weapon_classes]

                if weapons_found:
                    print(f"Weapon Detected! Class IDs: {weapons_found}")
                    self.send_alert("Weapon Detected", "High probability of violence: Weapon sighted")

                # TODO: Add logic for 'Fighting' based on skeletal proximity/rapid motion (Phase 2)
                
                time.sleep(0.5) 

            cap.release()
        except Exception as e:
            print(f"Error in ViolenceDetector: {e}")
        finally:
            cv2.destroyAllWindows()

    def send_alert(self, type_label, description):
        payload = {
            "type": "Violence",
            "description": description,
            "latitude": 40.7128,
            "longitude": -74.006,
            "confidence": 0.95,
            "severity": "critical",
            "status": "verified"
        }
        try:
            requests.post(self.backend_url, json=payload)
        except Exception as e:
            print(f"Failed to send alert: {e}")

    def cleanup(self):
        pass
