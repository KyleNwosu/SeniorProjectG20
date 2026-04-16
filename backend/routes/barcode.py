from fastapi import APIRouter, HTTPException

from services.camera_stream import camera
from services.barcode_scanner import barcode_scanner

router = APIRouter()


@router.post("/api/barcode/start")
async def start_barcode_scanner():
    if not camera.is_running:
        raise HTTPException(status_code=503, detail="Camera stream is not running")
    barcode_scanner.start()
    return {"ok": True, "running": barcode_scanner.is_running}


@router.post("/api/barcode/stop")
async def stop_barcode_scanner():
    barcode_scanner.stop()
    return {"ok": True, "running": barcode_scanner.is_running}


@router.get("/api/barcode/latest")
async def get_latest_barcode():
    return {"scan": barcode_scanner.latest_confirmed()}


@router.get("/api/barcode/status")
async def get_barcode_status():
    return barcode_scanner.status()
