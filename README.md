## 📥 Prerequisites

Before you start, make sure you have these installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| **Python** | 3.11+ | [python.org](https://python.org) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |
| **Chrome Browser** | Latest | [google.com/chrome](https://google.com/chrome) |

### 🔍 Check Installation:

```bash
# Check Python
python --version
# Output: Python 3.11.x

# Check Node.js
node --version
# Output: v18.x.x

# Check npm
npm --version
# Output: 9.x.x

# Check Git
git --version
# Output: git version 2.x.x
```

---

## 📁 Project Structure

```
photon/
├── backend/
│   ├── main.py                 # FastAPI Server
│   ├── detection_engine.py     # 3-Layer Detection Engine
│   ├── heuristic_rules.py      # Heuristic Rules (Layer 1)
│   ├── ml_handler.py           # ML Models (Layer 2)
│   ├── api_handler.py          # External APIs (Layer 3)
│   ├── ml_models/              # Pre-trained ML Models
│   │   ├── phishing/
│   │   ├── fake_news/
│   │   ├── malware/
│   │   └── ransomware/
│   ├── requirements.txt        # Python Dependencies
│   └── .env                    # Environment Variables
│
├── extension/                  # Chrome Extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── icons/
│   └── styles/
│
├── src/                        # React Frontend
│   ├── App.tsx
│   ├── components/
│   │   └── Dashboards/
│   │       ├── LiteDashboard.tsx
│   │       ├── ProDashboard.tsx
│   │       ├── EnterpriseDashboard.tsx
│   │       └── AdminPanel.tsx
│   ├── context/
│   └── index.css
│
├── package.json                # Frontend Dependencies
├── vite.config.ts              # Vite Configuration
└── README.md                   # Project Documentation
```

---

## 🔧 Step 1: Backend Setup

### 1.1 Navigate to Backend Folder

```bash
cd backend
```

### 1.2 Create & Activate Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 1.4 Create .env File

```bash
# Windows
notepad .env

# macOS/Linux
nano .env
```

**Copy this content:**

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=zenith

# API Keys
VIRUSTOTAL_API_KEY=Enter your Api key here 
GOOGLE_FACT_CHECK_API_KEY=Enter your api key here 
IPINFO_API_KEY=Enter you api key here 
NEWSDATA_API_KEY=Enter your api key hear

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### 1.5 Run Backend Server

```bash
uvicorn main:app --reload --port 8000
```

### ✅ Success Output:

```bash
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process [12345]
✅ API Keys Loaded!
✅ Phishing Model Loaded
✅ Fake News Model Loaded
✅ All ML Models Loaded!
INFO:     Application startup complete.
```

---

## 🎨 Step 2: Frontend Setup

### 2.1 Open New Terminal (Don't close backend)

### 2.2 Navigate to Project Root

```bash
cd ..
```

### 2.3 Install Dependencies

```bash
npm install
```

### 2.4 Fix Vite Config (if needed)

```bash
notepad vite.config.ts
```

**Replace with:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### 2.5 Run Frontend Server

```bash
npm run dev
```

### ✅ Success Output:

```bash
VITE v5.4.21  ready in 1500 ms
➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

---

## 🧩 Step 3: Chrome Extension Setup

### 3.1 Open Chrome Browser

### 3.2 Go to Extensions Page

```
chrome://extensions/
```

### 3.3 Enable Developer Mode

- Toggle **"Developer mode"** switch (top right corner)

### 3.4 Load Unpacked Extension

1. Click **"Load unpacked"**
2. Select the folder: `C:\Users\LAPTOP GADGET\Downloads\photon\extension`
3. Click **"Select Folder"**

### 3.5 Verify Installation

- ZENITH extension icon should appear in Chrome toolbar
- Click the icon → Popup should open

---

## 🚀 Step 4: Running Everything Together

### 🖥️ **You need 3 terminals:**

#### **Terminal 1: Backend Server**

```bash
cd C:\Users\LAPTOP GADGET\Downloads\photon\backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

#### **Terminal 2: Frontend Server**

```bash
cd C:\Users\LAPTOP GADGET\Downloads\photon
npm run dev
```

#### **Terminal 3: MySQL Database (Optional)**

```bash
# XAMPP
C:\xampp\mysql\bin\mysqld.exe

# OR
net start MySQL
```

---

## 🔗 Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://127.0.0.1:8000 | FastAPI Server |
| **API Docs** | http://127.0.0.1:8000/docs | Swagger UI |
| **Frontend Dashboard** | http://localhost:5173 | React App |
| **Extension** | chrome://extensions/ | Chrome Extension |

---

## 📋 Quick Commands Reference

### **One-Click Setup (Windows PowerShell)**

```powershell
# 1. Clone & Enter
git clone https://github.com/yourusername/zenith.git
cd zenith

# 2. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Frontend Setup (New Terminal)
cd ..
npm install
npm run dev
```

### **Backend Commands**

```bash
# Activate venv
venv\Scripts\activate

# Run server
uvicorn main:app --reload --port 8000

# Deactivate venv
deactivate

# Install new package
pip install package_name
pip freeze > requirements.txt
```

### **Frontend Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Extension Commands**

```bash
# Reload extension after changes
chrome://extensions/ → Click Reload icon

# Open extension popup
Ctrl + Shift + Z (shortcut)
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: Python Not Found**

```bash
❌ 'python' is not recognized
```

**Solution:**
```bash
# Use python3 instead
python3 -m venv venv

# OR add Python to PATH
# Windows: System Properties → Environment Variables → Add Python path
```

### **Issue 2: uvicorn Not Found**

```bash
❌ uvicorn: command not found
```

**Solution:**
```bash
# Install uvicorn
pip install uvicorn

# OR run as module
python -m uvicorn main:app --reload --port 8000
```

### **Issue 3: Module 'joblib' Not Found**

```bash
❌ ModuleNotFoundError: No module named 'joblib'
```

**Solution:**
```bash
# Install required packages
pip install joblib scikit-learn
```

### **Issue 4: Port 8000 Already in Use**

```bash
❌ [Errno 10048] Address already in use
```

**Solution:**
```bash
# Change port
uvicorn main:app --reload --port 8001

# OR kill process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### **Issue 5: CORS Error**

```bash
❌ Access to fetch at 'http://localhost:8000' blocked by CORS
```

**Solution:**
```bash
# main.py has CORS middleware enabled
# If not, add:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Issue 6: Extension Not Loading**

```bash
❌ Manifest file is missing or unreadable
```

**Solution:**
```bash
# Check manifest.json exists
dir extension\manifest.json

# Check JSON syntax
# Use JSON validator online
```

---

## 🧪 Testing the Application

### **Test Backend API**

```bash
# Health Check
curl http://127.0.0.1:8000/api/health

# URL Scan
curl -X POST http://127.0.0.1:8000/api/detect/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://paypal-verify.xyz"}'

# Text Scan
curl -X POST http://127.0.0.1:8000/api/detect/text \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a fake news story about aliens"}'

# Tier Unlock
curl -X POST http://127.0.0.1:8000/api/auth/verify-tier \
  -H "Content-Type: application/json" \
  -d '{"password":"porosh","tier":"pro"}'
```

### **Test Frontend**

```
1. Open http://localhost:5173
2. Check Lite Dashboard loads
3. Click Upgrade → Enter "porosh"
4. Verify redirect to /pro
5. Enter "saydi20@A" → redirect to /enterprise
6. Enter "zenith" → redirect to /admin
```

### **Test Extension**

```
1. Open any website
2. Hover on any link → Tooltip appears
3. Select any text → Tooltip appears
4. Copy any text → Clipboard notification
5. Click Extension icon → Popup opens
6. Enter URL → Scan works
```

---

## 📊 Tier System Quick Reference

| Tier | Password | Features | Redirect |
|------|----------|----------|----------|
| **Lite** | (None) | Basic URL/Text Scan | `/` |
| **Pro** | `porosh` | AI/ML + Deepfake | `/pro` |
| **Enterprise** | `saydi20@A` | Admin + Unlimited | `/enterprise` |
| **Super Admin** | `zenith` | Full Control | `/admin` |

---

## 🔑 Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=zenith

# API Keys (Get from respective services)
VIRUSTOTAL_API_KEY=your_key
GOOGLE_FACT_CHECK_API_KEY=your_key
IPINFO_API_KEY=your_key
NEWSDATA_API_KEY=your_key

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

---

## 🆘 Need Help?

### **Common Commands Summary**

```bash
# Complete Setup (First Time)
git clone [repo-url]
cd photon
npm install
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Run (After Setup)
# Terminal 1 (Backend)
cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000

# Terminal 2 (Frontend)
cd photon && npm run dev

# Terminal 3 (Extension)
# Load in Chrome manually
```

---

## ✅ Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Chrome Browser installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Extension loaded in Chrome
- [ ] All features working

---

## 📞 Support

- **GitHub Issues**: [Open Issue](https://github.com/yourusername/zenith/issues)
- **Email**: support@zenith.security
- **Discord**: [Join Discord](https://discord.gg/zenith)

---

**🛡️ ZENITH - Cyber Security Suite v2.0**

Author: Saydi Hasan Porosh 
ID:2304026
Session:2023-24
Department: Cyber Security Enginerring 
Unoversity of Frontier Technology, Bangladesh
Contact:
 Phone :01714395461
 Facebook:https://www.facebook.com/pa.ra.sh.578250
  Linkdin:https://www.linkedin.com/in/saydi-hasan-porosh-b75750376/
