import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from robot.session import robot
from services.camera_stream import camera
from services.barcode_scanner import barcode_scanner
from routes.status import router as status_router
from routes.commands import router as commands_router
from routes.sequences import router as sequences_router
from routes.websocket import router as ws_router
from routes.camera import router as camera_router
from routes.barcode import router as barcode_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the robot on startup
    try:
        robot.connect()
    except Exception as e:
        print(f"[Startup] Could not connect to robot: {e}")
        print("[Startup] Server running in offline mode — robot endpoints will return 503")

    # Start the RTSP camera reader
    try:
        camera.start()
    except Exception as e:
        print(f"[Startup] Could not start camera stream: {e}")

    yield

    # Shutdown cleanly
    barcode_scanner.stop()
    camera.stop()
    robot.disconnect()


app = FastAPI(title="RoboControl Bridge", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(status_router)
app.include_router(commands_router)
app.include_router(sequences_router)
app.include_router(ws_router)
app.include_router(camera_router)
app.include_router(barcode_router)


@app.get("/health")
def health():
    return {"ok": True, "robot_connected": robot.connected}
