<div align="center">

<img src="https://img.shields.io/badge/CodeSync-Real--Time%20Collaborative%20IDE-6C63FF?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="CodeSync Banner" />

# CodeSync

**A real-time collaborative code editor built for developers who code together.**

Write, run, and debug code as a team — all in the browser, no setup required.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-007ACC?logo=visual-studio-code)](https://microsoft.github.io/monaco-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🎥 Demo Video

> **Note:** Upload your demo video (e.g., to YouTube or directly via GitHub issues/assets) and embed it below!

[![Watch the demo video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_ID)

*(Replace `YOUR_VIDEO_ID` with your actual video ID, or replace this entire section with a direct video embed/gif.)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖊️ **Monaco Editor** | VS Code's engine — syntax highlighting, auto-indent, bracket matching |
| ▶️ **Run Code** | Execute JS, Python, C, C++, and Java locally — no external API needed |
| 👥 **Real-Time Collaboration** | Multiple users in the same room share one live editor via Socket.IO |
| 💬 **Live Chat** | Built-in per-room chat so your team can communicate while coding |
| 📁 **Multi-File Tabs** | Open, rename, and switch between multiple files seamlessly |
| 💾 **Snippets** | Save and reload code snippets stored persistently in MongoDB |
| 🔌 **Extension System** | Write custom JS transform functions that run on your code before execution |
| 🌗 **Dark / Light Theme** | Toggle between VS Code dark and light themes |
| ⌨️ **Keyboard Shortcut** | `Ctrl + Enter` runs your code instantly |

---

## 🏗️ Tech Stack

```
Frontend                Backend               Real-Time        Database
────────────────        ──────────────        ─────────        ────────
React 19                Node.js + Express 5   Socket.IO 4      MongoDB Atlas
Vite 8 (bundler)        Local code runner     WebSockets       Mongoose 9
Monaco Editor           child_process
socket.io-client        (no external API)
Axios (HTTP)
```

---

## 📁 Project Structure

```
codesync/
├── backend/
│   ├── config/             ← MongoDB connection setup
│   ├── controllers/        ← Route logic (execute, snippets, extensions)
│   │   ├── executeController.js
│   │   ├── snippetController.js
│   │   └── extensionController.js
│   ├── models/             ← Mongoose schemas
│   │   ├── Snippet.js
│   │   └── Extension.js
│   ├── routes/             ← Express routers
│   ├── services/
│   │   └── codeRunner.js   ← Local multi-language execution engine
│   ├── socket/
│   │   └── socketHandler.js← Socket.IO events & room management
│   ├── .env.example        ← Environment variable reference
│   └── server.js           ← Entry point
└── frontend/
    ├── src/
    │   ├── api/            ← Axios HTTP client wrappers
    │   ├── components/     ← All UI components
    │   ├── context/        ← EditorContext & RoomContext (global state)
    │   ├── socket/         ← Socket.IO singleton
    │   └── App.jsx         ← App shell & routing
    ├── .env.example        ← Environment variable reference
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) **v18+**
- [MongoDB Atlas](https://cloud.mongodb.com) account (free tier works)
- **For C/C++:** GCC via [MinGW](https://www.mingw-w64.org) (Windows) or `build-essential` (Linux)
- **For Java:** [JDK](https://adoptium.net) — `javac` must be in your `PATH`
- **For Python:** Python 3 — `python` must be in your `PATH`

---

### 1. Clone the Repository

```bash
git clone https://github.com/Jsanjeevkrishna/codesync.git
cd codesync
```

---

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create your `.env` from the example:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/codesync
ALLOWED_ORIGINS=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

> Server starts at **http://localhost:5000**

---

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> App runs at **http://localhost:5173**

The `.env` is pre-configured for local development — no changes needed.

---

## 👥 Real-Time Collaboration

1. Open the app and click the **Collab** icon in the sidebar
2. Enter a **Room ID** (any string, e.g. `my-team-room`) and a display **username**
3. Share the Room ID with teammates — they join from any device
4. **Everyone in the room shares one live editor** — all keystrokes sync instantly via WebSockets

---

## ▶️ Code Execution

Click **Run** or press `Ctrl + Enter`. The code is sent to the backend, executed using the language runtimes installed on the server, and output appears in the console panel below.

**Supported Languages:** `JavaScript` · `Python` · `C` · `C++` · `Java`

> The execution engine runs locally using `child_process` — no third-party API key required.

---

## 🔌 Extension System

Extensions are custom JavaScript transform functions applied to your code **before** it executes.

**Example — log execution timestamp:**
```js
// Script body receives `code` string, must return the transformed `code`
return code + `\nconsole.log('Executed at: ${new Date().toISOString()}')`;
```

Create and manage extensions in the **Extensions** panel in the sidebar.

---

## 🌐 Deployment

| Part | Recommended Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Railway](https://railway.app) |
| Database | [MongoDB Atlas](https://cloud.mongodb.com) |

**Deploy in 4 steps:**

1. Deploy the backend to Railway and copy the generated URL
2. Update `frontend/.env.production` →  `VITE_API_URL=https://your-backend.railway.app`
3. In Railway, add the env var: `ALLOWED_ORIGINS=https://your-app.vercel.app`
4. Deploy the frontend to Vercel (connects your GitHub repo automatically)

---

## 🤝 Contributing

Pull requests are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT — free to use, share, and modify. See [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/Jsanjeevkrishna">Jsanjeevkrishna</a>
</div>
