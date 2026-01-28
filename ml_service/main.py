from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import uvicorn
from detectors.crowd import CrowdDetector
# will import others as they are created:
from detectors.violence import ViolenceDetector
from detectors.suspicious import SuspiciousDetector
from detectors.audio import AudioDetector

app = FastAPI()

# Initialize Detectors
crowd_detector = CrowdDetector()
violence_detector = ViolenceDetector()
suspicious_detector = SuspiciousDetector()
audio_detector = AudioDetector()

class VideoStream(BaseModel):
    source: str # URL or Camera ID

@app.get("/")
def read_root():
    return {"status": "ML Service Running"}

@app.post("/analyze/crowd")
async def analyze_crowd(stream: VideoStream, background_tasks: BackgroundTasks):
    background_tasks.add_task(crowd_detector.process_stream, stream.source)
    return {"message": "Crowd analysis started", "source": stream.source}

@app.post("/analyze/violence")
async def analyze_violence(stream: VideoStream, background_tasks: BackgroundTasks):
    background_tasks.add_task(violence_detector.process_stream, stream.source)
    return {"message": "Violence analysis started", "source": stream.source}

@app.post("/analyze/suspicious")
async def analyze_suspicious(stream: VideoStream, background_tasks: BackgroundTasks):
    background_tasks.add_task(suspicious_detector.process_stream, stream.source)
    return {"message": "Suspicious activity analysis started", "source": stream.source}

@app.post("/analyze/audio")
async def analyze_audio(stream: VideoStream, background_tasks: BackgroundTasks):
    background_tasks.add_task(audio_detector.process_stream, stream.source)
    return {"message": "Audio analysis started", "source": stream.source}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
