import speech_recognition as sr
import time
import requests
from .base_detector import BaseDetector

class AudioDetector(BaseDetector):
    def __init__(self):
        super().__init__()
        self.recognizer = sr.Recognizer()
        self.backend_url = "http://localhost:5000/api/incidents"
        self.keywords = ["help", "fire", "gun", "stop", "emergency", "attack", "bomb"]

    def process_stream(self, source):
        # NOTE: cv2 does not capture audio. 
        # Ideally, we'd use FFmpeg to split stream or PyAudio for mic.
        # For this implementation, we focus on Microphone (RT) if source is "0"
        # or just exit if it's a file (simplified for now).
        
        if source == "0":
            self.listen_to_mic()
        else:
            print("Audio analysis for video files/streams requires FFmpeg integration.")
            print("Running in dummy mode for file source...")
            time.sleep(2)

    def listen_to_mic(self):
        try:
            with sr.Microphone() as source:
                print("Adjusting for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source)
                print("Listening for audio incidents...")
                
                # Infinite loop handling
                while True:
                    try:
                        audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=5)
                        # Recognize
                        try:
                            # Using Google Web Speech API (online, free tier)
                            text = self.recognizer.recognize_google(audio).lower()
                            print(f"Heard: {text}")
                            
                            if any(keyword in text for keyword in self.keywords):
                                print(f"Inciting Word/Threat Detected: {text}")
                                self.send_alert(text)
                                
                        except sr.UnknownValueError:
                            pass # No speech detected
                        except sr.RequestError as e:
                            print(f"Could not request results; {e}")
                            time.sleep(1)
                            
                    except Exception as e:
                        # Timeout or other error, just continue
                        pass
                        
        except Exception as e:
            print(f"Microphone error: {e}")

    def send_alert(self, text):
        payload = {
            "type": "Inciting Violence",
            "description": f"Threatening audio detected: '{text}'",
            "latitude": 40.7128,
            "longitude": -74.006,
            "confidence": 0.9,
            "severity": "critical",
            "status": "verified"
        }
        try:
            requests.post(self.backend_url, json=payload)
        except Exception as e:
            print(f"Failed to send alert: {e}")

    def cleanup(self):
        pass
