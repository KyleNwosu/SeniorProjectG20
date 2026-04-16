"""
Background barcode scanner service.

Uses:
- pyzbar as primary decoder (1D + 2D barcode support)
- OpenCV QRCodeDetector as fallback for QR-only decoding

Reads frames from the shared camera stream and emits confirmed scan payloads
with deduplication/cooldown logic to avoid repeated spam.
"""

import os
import threading
import time
from datetime import datetime, timezone

import cv2
import numpy as np
from dotenv import load_dotenv

from services.camera_stream import camera

load_dotenv()

BARCODE_SCAN_FPS = float(os.getenv("BARCODE_SCAN_FPS", "10"))
BARCODE_CONFIRM_FRAMES = int(os.getenv("BARCODE_CONFIRM_FRAMES", "3"))
BARCODE_COOLDOWN_SEC = float(os.getenv("BARCODE_COOLDOWN_SEC", "1.5"))
BARCODE_ENABLE_CLAHE = os.getenv("BARCODE_ENABLE_CLAHE", "true").lower() == "true"
BARCODE_ENABLE_ADAPTIVE = os.getenv("BARCODE_ENABLE_ADAPTIVE", "true").lower() == "true"
BARCODE_ENABLE_SHARPEN = os.getenv("BARCODE_ENABLE_SHARPEN", "false").lower() == "true"

_SCAN_INTERVAL = max(0.01, 1.0 / max(1.0, BARCODE_SCAN_FPS))

try:
    from pyzbar.pyzbar import decode as pyzbar_decode  # type: ignore
    _PYZBAR_AVAILABLE = True
except Exception:
    pyzbar_decode = None
    _PYZBAR_AVAILABLE = False


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_scan_payload(
    *,
    code: str,
    symbology: str,
    bbox: list[int],
    frame_id: int,
    source: str,
    preprocess: str,
) -> dict:
    return {
        "code": code,
        "type": symbology,
        "timestamp": _now_iso(),
        "bbox": bbox,  # [x, y, width, height]
        "frame_id": frame_id,
        "source": source,
        "preprocess": preprocess,
    }


class BarcodeScanner:
    def __init__(self):
        self._running = False
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()
        self._latest_confirmed: dict | None = None

        self._candidate_code: str | None = None
        self._candidate_count = 0
        self._candidate_scan: dict | None = None

        self._last_emitted_code: str | None = None
        self._last_emitted_time = 0.0
        self._frame_id = 0

        self._qr_detector = cv2.QRCodeDetector()

    @property
    def is_running(self) -> bool:
        return self._running

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        print("[Barcode] Scanner started")

    def stop(self) -> None:
        self._running = False
        if self._thread is not None:
            self._thread.join(timeout=5)
        print("[Barcode] Scanner stopped")

    def latest_confirmed(self) -> dict | None:
        with self._lock:
            return dict(self._latest_confirmed) if self._latest_confirmed else None

    def status(self) -> dict:
        return {
            "running": self._running,
            "pyzbar_available": _PYZBAR_AVAILABLE,
            "scan_fps": BARCODE_SCAN_FPS,
            "confirm_frames": BARCODE_CONFIRM_FRAMES,
            "cooldown_sec": BARCODE_COOLDOWN_SEC,
            "latest": self.latest_confirmed(),
        }

    def _loop(self) -> None:
        while self._running:
            frame = camera.latest_frame()
            if frame is None:
                time.sleep(_SCAN_INTERVAL)
                continue

            self._frame_id += 1
            detected = self._decode_frame(frame, self._frame_id)
            if detected is None:
                self._candidate_code = None
                self._candidate_count = 0
                self._candidate_scan = None
                time.sleep(_SCAN_INTERVAL)
                continue

            self._process_candidate(detected)
            time.sleep(_SCAN_INTERVAL)

    def _variants(self, frame: np.ndarray) -> list[tuple[str, np.ndarray]]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        variants: list[tuple[str, np.ndarray]] = [("raw", frame), ("gray", gray)]

        if BARCODE_ENABLE_CLAHE:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            variants.append(("gray_clahe", clahe.apply(gray)))

        if BARCODE_ENABLE_ADAPTIVE:
            adaptive = cv2.adaptiveThreshold(
                gray,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                31,
                5,
            )
            variants.append(("gray_adaptive", adaptive))

        if BARCODE_ENABLE_SHARPEN:
            kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            variants.append(("gray_sharpen", cv2.filter2D(gray, -1, kernel)))

        return variants

    def _decode_frame(self, frame: np.ndarray, frame_id: int) -> dict | None:
        for preprocess, image in self._variants(frame):
            by_pyzbar = self._decode_with_pyzbar(image, frame_id, preprocess)
            if by_pyzbar:
                return by_pyzbar

            by_qr = self._decode_with_qr_fallback(image, frame_id, preprocess)
            if by_qr:
                return by_qr
        return None

    def _decode_with_pyzbar(self, image: np.ndarray, frame_id: int, preprocess: str) -> dict | None:
        if not _PYZBAR_AVAILABLE or pyzbar_decode is None:
            return None

        decoded = pyzbar_decode(image)
        if not decoded:
            return None

        best = decoded[0]
        raw = best.data.decode("utf-8", errors="ignore").strip()
        if not raw:
            return None

        rect = best.rect
        bbox = [int(rect.left), int(rect.top), int(rect.width), int(rect.height)]
        return _to_scan_payload(
            code=raw,
            symbology=str(best.type),
            bbox=bbox,
            frame_id=frame_id,
            source="pyzbar",
            preprocess=preprocess,
        )

    def _decode_with_qr_fallback(self, image: np.ndarray, frame_id: int, preprocess: str) -> dict | None:
        text, points, _ = self._qr_detector.detectAndDecode(image)
        if not text:
            return None

        bbox = [0, 0, 0, 0]
        if points is not None and len(points) > 0:
            pts = points.reshape(-1, 2)
            x_min = int(np.min(pts[:, 0]))
            y_min = int(np.min(pts[:, 1]))
            x_max = int(np.max(pts[:, 0]))
            y_max = int(np.max(pts[:, 1]))
            bbox = [x_min, y_min, max(0, x_max - x_min), max(0, y_max - y_min)]

        return _to_scan_payload(
            code=text.strip(),
            symbology="QRCODE",
            bbox=bbox,
            frame_id=frame_id,
            source="opencv_qr_fallback",
            preprocess=preprocess,
        )

    def _process_candidate(self, scan: dict) -> None:
        code = scan["code"]
        now = time.time()

        # Cooldown: suppress repeated scans of same code for a short period.
        if self._last_emitted_code == code and (now - self._last_emitted_time) < BARCODE_COOLDOWN_SEC:
            return

        if self._candidate_code == code:
            self._candidate_count += 1
            self._candidate_scan = scan
        else:
            self._candidate_code = code
            self._candidate_count = 1
            self._candidate_scan = scan

        if self._candidate_count < BARCODE_CONFIRM_FRAMES:
            return

        confirmed = self._candidate_scan
        with self._lock:
            self._latest_confirmed = confirmed

        self._last_emitted_code = code
        self._last_emitted_time = now

        self._candidate_code = None
        self._candidate_count = 0
        self._candidate_scan = None

        print(f"[Barcode] Confirmed scan: {code}")


barcode_scanner = BarcodeScanner()
