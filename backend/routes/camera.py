"""
Camera routes — serves the Kinova vision feed to the browser.

GET /api/camera/stream   →  MJPEG stream (use in <img src="…">)
GET /api/camera/snapshot  →  single JPEG frame
GET /api/camera/status    →  JSON health check
"""

import asyncio

import cv2
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response

from services.camera_stream import camera, CAMERA_JPEG_QUALITY

router = APIRouter()

TARGET_FPS = 15
_FRAME_INTERVAL = 1.0 / TARGET_FPS


@router.get("/api/camera/stream")
async def camera_stream():
    """Continuous MJPEG stream — drop this URL into an <img> tag."""
    if not camera.is_running:
        raise HTTPException(status_code=503, detail="Camera stream not started")

    async def generate():
        while True:
            frame = camera.latest_frame()
            if frame is not None:
                ok, jpeg = cv2.imencode(
                    ".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, CAMERA_JPEG_QUALITY]
                )
                if ok:
                    yield (
                        b"--frame\r\n"
                        b"Content-Type: image/jpeg\r\n\r\n"
                        + jpeg.tobytes()
                        + b"\r\n"
                    )
            await asyncio.sleep(_FRAME_INTERVAL)

    return StreamingResponse(
        generate(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/api/camera/snapshot")
async def camera_snapshot():
    """Single JPEG frame — useful for debugging or one-shot captures."""
    if not camera.is_running:
        raise HTTPException(status_code=503, detail="Camera stream not started")

    frame = camera.latest_frame()
    if frame is None:
        raise HTTPException(status_code=503, detail="No frame available yet")

    ok, jpeg = cv2.imencode(
        ".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, CAMERA_JPEG_QUALITY]
    )
    if not ok:
        raise HTTPException(status_code=500, detail="JPEG encode failed")

    return Response(content=jpeg.tobytes(), media_type="image/jpeg")


@router.get("/api/camera/status")
async def camera_status():
    return {
        "running": camera.is_running,
        "has_frame": camera.latest_frame() is not None,
    }
