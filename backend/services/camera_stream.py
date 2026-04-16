"""
Background RTSP camera reader for the Kinova Gen3 vision module.

Runs a daemon thread that continuously grabs the latest frame.
Consumers call ``latest_frame()`` to get a copy of the most recent image
(numpy array, BGR) or ``None`` if no frame has arrived yet.
"""

import os
import threading
import time

import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv()

ROBOT_IP = os.getenv("ROBOT_IP", "192.168.1.10")
CAMERA_RTSP_PATH = os.getenv("CAMERA_RTSP_PATH", "/color")
CAMERA_WIDTH = int(os.getenv("CAMERA_WIDTH", "1280"))
CAMERA_HEIGHT = int(os.getenv("CAMERA_HEIGHT", "720"))
CAMERA_JPEG_QUALITY = int(os.getenv("CAMERA_JPEG_QUALITY", "80"))

RTSP_URL = f"rtsp://{ROBOT_IP}{CAMERA_RTSP_PATH}"

_RECONNECT_DELAY = 2.0  # seconds between reconnect attempts


class CameraStream:
    """Thread-safe RTSP frame reader with automatic reconnection."""

    def __init__(self, url: str = RTSP_URL):
        self._url = url
        self._frame: np.ndarray | None = None
        self._lock = threading.Lock()
        self._stopped = True
        self._thread: threading.Thread | None = None
        self._cap: cv2.VideoCapture | None = None

    # ── public API ────────────────────────────────────────────────────

    def start(self) -> None:
        if not self._stopped:
            return
        self._stopped = False
        self._thread = threading.Thread(target=self._read_loop, daemon=True)
        self._thread.start()
        print(f"[Camera] Stream reader started for {self._url}")

    def stop(self) -> None:
        self._stopped = True
        if self._thread is not None:
            self._thread.join(timeout=5)
        if self._cap is not None:
            self._cap.release()
            self._cap = None
        print("[Camera] Stream reader stopped")

    def latest_frame(self) -> np.ndarray | None:
        with self._lock:
            return self._frame.copy() if self._frame is not None else None

    @property
    def is_running(self) -> bool:
        return not self._stopped

    # ── internals ─────────────────────────────────────────────────────

    def _open(self) -> cv2.VideoCapture | None:
        cap = cv2.VideoCapture(self._url, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            cap.release()
            return None
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        return cap

    def _read_loop(self) -> None:
        while not self._stopped:
            cap = self._open()
            if cap is None:
                print(f"[Camera] Cannot open {self._url}, retrying in {_RECONNECT_DELAY}s …")
                time.sleep(_RECONNECT_DELAY)
                continue

            self._cap = cap
            while not self._stopped:
                ok, frame = cap.read()
                if not ok:
                    print("[Camera] Frame read failed, reconnecting …")
                    break
                with self._lock:
                    self._frame = frame

            cap.release()
            self._cap = None
            if not self._stopped:
                time.sleep(_RECONNECT_DELAY)


# Singleton — import and use from routes / other services
camera = CameraStream()
