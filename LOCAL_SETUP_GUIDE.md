# 🛡️ ZENITH - Local Server & Extension Setup Guide

Welcome to **ZENITH - Cyber Security Suite**. This document explains how to run the web application, backend APIs, database, and Chrome Extension locally on your machine after downloading the source code.

---

## 🚀 Quick Start (Node.js Express Server)

1. **Extract Source Code**:
   Unzip the downloaded project folder on your machine.

2. **Install Node.js Dependencies**:
   Open a terminal inside the project folder and run:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - The web dashboard will start at: `http://localhost:3000`
   - All backend API endpoints will be active live at: `http://localhost:3000/api/*`

---

## 🐍 Alternative: Python FastAPI + MySQL Backend (XAMPP / phpMyAdmin)

If you prefer running the full Python FastAPI backend with MySQL / phpMyAdmin:

1. **Import MySQL Database**:
   - Open **XAMPP Control Panel** and start **Apache** & **MySQL**.
   - Open **phpMyAdmin**: `http://localhost/phpmyadmin`
   - Create a new database named `sentinel_db`.
   - Click **Import** and upload the file `schema.sql` located in the project root.

2. **Run Python Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
   - FastAPI server will start at: `http://localhost:8000`
   - Interactive API Documentation: `http://localhost:8000/docs`

---

## 🧩 Installing the Chrome Extension in Google Chrome

1. Open **Google Chrome** and navigate to: `chrome://extensions/`
2. Turn ON **Developer mode** (toggle in top-right corner).
3. Click **Load unpacked** (top-left button).
4. Select the `extension/` folder inside the project root directory.
5. The **ZENITH Extension** icon will appear in your Chrome toolbar!
6. Click the extension icon to test URL inspection, threat counters, and tier unlocking.

---

## 🔑 System Tier Passwords for Unlocking Features

All features are available for testing using these system keys:

- **Free Lite Tier**: Default access (URL Threat Inspector, Fact-Checker, Fake News Regional Map, 100 API Credits/day)
- **Pro Tier Key**: `porosh` (25 Features, History Logs, 500 API Credits/day)
- **Enterprise Tier Key**: `saydi20@A` (35 Features, Deepfake CNN Media Scanner, Admin Console, 1,000 API Credits/day)
- **Super Admin Key**: `zenith` (Full system access, User Management, 5,000 API Credits/day)

---

## 📊 Live API Endpoints Reference

When running `npm run dev` or `python backend/main.py`:

- **Get Extension Stats**: `GET /api/stats`
- **Inspect URL / Domain**: `POST /api/scan/url?url=https://paypal-verify.xyz`
- **Fact-Check Text Claim**: `POST /api/scan/fake-news?text=claim_text`
- **Verify Tier Passcode**: `POST /api/verify-tier?password=porosh`
- **Admin Users List**: `GET /api/admin/users`
- **Admin Blocklist**: `GET /api/admin/blocklist`
- **Download PDF Security Report**: `GET /api/reports/download/pdf`
- **Download CSV Threat Logs**: `GET /api/reports/download/csv`

---

Everything is pre-configured to work locally seamlessly out of the box!
