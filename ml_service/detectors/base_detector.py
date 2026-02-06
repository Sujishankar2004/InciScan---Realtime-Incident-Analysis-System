from abc import ABC, abstractmethod

class BaseDetector(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def process_stream(self, source: str):
        """
        Process the video/audio stream from the given source.
        source: URL, file path, or camera ID (as string)
        """
        pass
    
    @abstractmethod
    def cleanup(self):
        """
        Release resources (cameras, streams, etc.)
        """
        pass
