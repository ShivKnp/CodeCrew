# CodeCrew

A collaborative, real-time code-pairing platform with a Monaco-based editor, ShareDB-powered Operational Transformation (OT) synchronization, server-side code execution for selected languages, and an integrated draggable/resizable WebRTC video preview. Designed for pair programming, interviews, and teaching.

**Live demo:** code-crew-nu.vercel.app

---

## Overview

CodeCrew enables multiple users to edit code in the same Monaco editor instance in real time, see peer cursors and selections, run code against custom test input on the server, and communicate via a floating WebRTC video call. Sessions are private — only users with the session URL can join.

---

## Key Features

- Collaborative Monaco editor with cursor presence and remote highlights
- Per-session input/output panels (live-synced)
- Server-side "Run Code" that compiles/executes and returns output
- Floating draggable & resizable video component (touch-friendly)
- Invite link for private sessions
- Responsive UI with mobile bottom-sheet behaviour for side panels

---

## Tech Stack

**Frontend**
- React (functional components + hooks)
- Monaco Editor (`react-monaco-editor`)
- Ant Design (`antd`) UI
- `react-draggable`, `re-resizable`
- CSS Modules

**Backend**
- Node.js + Express
- ShareDB (Operational Transformation backend)
- WebSocket (`ws`) + `@teamwork/websocket-json-stream` for ShareDB
- Child process execution (`child_process.exec`) for code runner
- Simple video signaling via WebSocket

**Dev / Infra**
- Dockerfile included for backend environment
- Optional STUN/TURN for reliable WebRTC NAT traversal

---

## Architecture & How It Works

### Real-time editing (Operational Transformation)
- Uses **ShareDB** + `json0` to represent and apply small insert/remove ops instead of full-document diffs.
- A text-binding layer (adapted `text-diff-binding` / `StringBinding`) converts Monaco editor changes → `json0` operations and applies remote ops back into Monaco while transforming cursor positions.
- Presence (peer cursors/selections) is implemented via Monaco decorations and updated after operations to preserve correctness.

### Video calling (WebRTC)
- Peer-to-peer media via WebRTC APIs:
  1. Create `RTCPeerConnection`.
  2. Acquire local media: `navigator.mediaDevices.getUserMedia()`.
  3. Offer/answer SDP exchange over a signaling WebSocket.
  4. Exchange ICE candidates over signaling.
- UI offers a draggable/resizable floating preview. On mobile, the preview defaults to a smaller anchored thumbnail and can be maximized.

### Code execution (backend runner)
- Flow:
  1. Frontend posts `{ code, input, lang, id }` to `/code/run`.
  2. Server writes ephemeral files (e.g. `Main.cpp`, `input.txt`) into `./<id>/`.
  3. Executes language-specific command (g++, javac/java, python3).
  4. Returns `stdout` or `stderr` to client, then deletes the ephemeral directory.
- **Important:** The provided runner is a demonstration. Running untrusted code requires strict sandboxing (see Security).

---

## Supported Languages

- C++ (`g++`)
- Java (`javac` + `java`)
- Python 3 (`python3`)

---

## Getting Started (Local Development)

### Prerequisites

- Node.js (v16+ recommended)
- npm
- For compiling languages locally (C++/Java): `build-essential`, `default-jre`, `default-jdk`
- (Optional) Docker for containerized backend

### Frontend (editor)

```bash
# from repository root
cd editor
npm install
npm start
# default: http://localhost:3000
```
---

### Backend (editor-backend)

cd editor-backend
npm install
npm run dev

---

### Frontend environment variables (optional)

```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_SIGNALING_WS=ws://localhost:8080/foo
```



