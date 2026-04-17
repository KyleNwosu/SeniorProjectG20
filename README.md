# RoboControl - Consumer Robotics Interface

RoboControl is a full-stack robotics control app with:

- a React + TypeScript frontend for operations, tasking, and scheduling
- a FastAPI backend that bridges robot commands, telemetry, camera feed, and QR/barcode scanning

## Current UI Overview

The app now uses task-based navigation:

- **Operations** - live robot operation view (camera, primary controls, status, QR text, quick actions)
- **Tasks** - build and queue command sequences
- **Schedule** - automation schedule management
- **History** - placeholder tab for future logs/event history

Operations includes:

- top **System Status** strip (connection, robot state, scanner state, last QR timestamp)
- 60/40 layout (left: live operations, right: status + QR + quick actions)
- collapsible **Advanced Controls** and **Diagnostics**
- QR text card with copy/clear/details controls

## Authentication

The frontend uses local auth state in `localStorage` for now:

- unauthenticated users are routed to `/auth`
- authenticated users are routed to `/dashboard`
- sign out is available in the top header

Storage keys:

- `robocontrol_auth_users`
- `robocontrol_auth_session`

> Note: This is demo-level auth (not production security).

## QR / Barcode Text Resolution

The scanner can detect QR codes that contain short URLs (e.g. `qrly.org/...`).
The frontend then calls a dedicated backend resolver endpoint to extract text content so users do not need to leave the site.

### Backend endpoints

- `POST /api/barcode/start`
- `POST /api/barcode/stop`
- `GET /api/barcode/status`
- `GET /api/barcode/latest`
- `POST /api/barcode/resolve` (explicit URL-to-text resolution)

### Resolution strategy

The resolver prioritizes:

1. `__NEXT_DATA__` payload text (Next.js pages)
2. matching `<pre class="TextPreview...__pre">` block
3. generic `<pre>` fallback

It also includes timeout/cert fallback options configurable via env vars.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Routing**: React Router v6
- **State**: Zustand + TanStack Query
- **Backend**: FastAPI + Uvicorn
- **Robot/vision**: Kinova bridge + OpenCV + pyzbar fallback logic

## Prerequisites

- Node.js 18+
- npm
- Python 3.11+ (recommended)

## Setup

### 1) Clone

```bash
git clone https://github.com/KyleNwosu/SeniorProjectG20.git
cd SeniorProjectG20
```

### 2) Frontend install

```bash
npm install
```

### 3) Frontend env (`.env`)

Create `.env` in repo root:

```env
VITE_BRIDGE_URL=http://localhost:8000
VITE_ROS_BRIDGE_URL=ws://localhost:9090
```

### 4) Backend env (`backend/.env`)

Copy from `backend/.env.example`, then adjust as needed:

```env
ROBOT_IP=192.168.1.10
ROBOT_PORT=10000
ROBOT_USERNAME=admin
ROBOT_PASSWORD=admin
BRIDGE_PORT=8000

CAMERA_RTSP_PATH=/color
CAMERA_WIDTH=1280
CAMERA_HEIGHT=720
CAMERA_JPEG_QUALITY=80

BARCODE_SCAN_FPS=10
BARCODE_CONFIRM_FRAMES=3
BARCODE_COOLDOWN_SEC=1.5
BARCODE_ENABLE_CLAHE=true
BARCODE_ENABLE_ADAPTIVE=true
BARCODE_ENABLE_SHARPEN=false
BARCODE_RESOLVE_URL_TEXT=true
BARCODE_RESOLVE_TIMEOUT_SEC=6.0
BARCODE_MAX_TEXT_CHARS=1200
BARCODE_ALLOW_INSECURE_SSL_FALLBACK=true
BARCODE_MAX_FETCH_BYTES=262144
```

## Run Locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

In a separate terminal (repo root):

```bash
npm run dev
```

Use the URL shown by Vite (typically `http://localhost:5173`).

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend syntax check:

```bash
python3 -m py_compile backend/services/barcode_scanner.py
```

## Project Structure (High Level)

```text
backend/
  main.py
  routes/
  services/
src/
  pages/
    Auth.tsx
    Index.tsx
  components/
  services/
  store/
```

## Notes

- If QR text still appears as raw URL, restart backend to clear in-memory resolver cache.
- If the backend cannot verify SSL certs in your local Python environment, insecure SSL fallback is available via env flag (enabled by default in example).
