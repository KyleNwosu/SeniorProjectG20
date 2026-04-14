import os
import platform
import threading
import time
from typing import Generator

import cv2
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter()

CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
CAMERA_SOURCE_URL = os.getenv("CAMERA_SOURCE_URL", "").strip()
CAMERA_WIDTH = int(os.getenv("CAMERA_WIDTH", "640"))
CAMERA_HEIGHT = int(os.getenv("CAMERA_HEIGHT", "480"))
JPEG_QUALITY = int(os.getenv("CAMERA_JPEG_QUALITY", "80"))
CAMERA_BACKEND = os.getenv("CAMERA_BACKEND", "").strip().lower()

_BACKENDS = {
    "avfoundation": "CAP_AVFOUNDATION",
    "v4l2": "CAP_V4L2",
    "dshow": "CAP_DSHOW",
    "msmf": "CAP_MSMF",
}


def _resolve_capture_backend() -> int:
    if CAMERA_BACKEND:
        backend_constant = _BACKENDS.get(CAMERA_BACKEND)
        if backend_constant and hasattr(cv2, backend_constant):
            return int(getattr(cv2, backend_constant))
    if platform.system().lower() == "darwin" and hasattr(cv2, "CAP_AVFOUNDATION"):
        return int(getattr(cv2, "CAP_AVFOUNDATION"))
    return int(getattr(cv2, "CAP_ANY", 0))


class CameraService:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._cap: cv2.VideoCapture | None = None
        self._last_error: str | None = None
        self._backend = _resolve_capture_backend()

    def _open_capture(self) -> cv2.VideoCapture:
        if CAMERA_SOURCE_URL:
            # Network camera sources (rtsp/http) should use backend auto-detection.
            return cv2.VideoCapture(CAMERA_SOURCE_URL)
        return cv2.VideoCapture(CAMERA_INDEX, self._backend)

    def _open_if_needed(self) -> cv2.VideoCapture:
        if self._cap is not None and self._cap.isOpened():
            return self._cap

        cap = self._open_capture()
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)

        if not cap.isOpened():
            cap.release()
            if CAMERA_SOURCE_URL:
                raise RuntimeError(
                    "Unable to open CAMERA_SOURCE_URL. Verify stream URL reachability/credentials "
                    "and ensure the backend machine is on the same network."
                )
            raise RuntimeError(
                "Unable to open camera index "
                f"{CAMERA_INDEX}. Verify CAMERA_INDEX, backend selection, and OS camera permissions."
            )

        self._cap = cap
        self._last_error = None
        return cap

    def read_jpeg(self) -> bytes:
        with self._lock:
            try:
                cap = self._open_if_needed()
                ok, frame = cap.read()
                if not ok or frame is None:
                    # Stale camera handles can occur after sleep/unplug; reopen once.
                    self._close_unlocked()
                    cap = self._open_if_needed()
                    ok, frame = cap.read()
                if not ok or frame is None:
                    raise RuntimeError("Failed to capture camera frame")

                encoded, jpg = cv2.imencode(
                    ".jpg",
                    frame,
                    [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY],
                )
                if not encoded:
                    raise RuntimeError("Failed to encode camera frame")
                self._last_error = None
                return jpg.tobytes()
            except Exception as exc:
                self._last_error = str(exc)
                raise

    def _close_unlocked(self) -> None:
        if self._cap is not None:
            self._cap.release()
            self._cap = None

    def close(self) -> None:
        with self._lock:
            self._close_unlocked()

    def status(self) -> dict[str, object]:
        with self._lock:
            payload: dict[str, object] = {
                "ok": False,
                "camera_source_url": CAMERA_SOURCE_URL or None,
                "camera_index": CAMERA_INDEX,
                "camera_backend": self._backend,
                "last_error": self._last_error,
            }
            try:
                self._open_if_needed()
                ok, frame = self._cap.read() if self._cap is not None else (False, None)
                payload["ok"] = bool(ok and frame is not None)
                payload["last_error"] = None if payload["ok"] else "Camera opened but no frame received"
            except Exception as exc:
                payload["last_error"] = str(exc)
            return payload


camera_service = CameraService()


def _mjpeg_generator() -> Generator[bytes, None, None]:
    while True:
        try:
            jpg = camera_service.read_jpeg()
        except Exception:
            # Short backoff avoids a tight loop if the camera disconnects.
            time.sleep(0.25)
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + jpg
            + b"\r\n"
        )


@router.get("/api/camera/frame")
def camera_frame():
    try:
        jpg = camera_service.read_jpeg()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return StreamingResponse(iter([jpg]), media_type="image/jpeg")


@router.get("/api/camera/stream")
def camera_stream():
    return StreamingResponse(
        _mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/api/camera/health")
def camera_health():
    status = camera_service.status()
    http_status = 200 if status.get("ok") else 503
    if http_status != 200:
        raise HTTPException(status_code=http_status, detail=status.get("last_error"))
    return status
