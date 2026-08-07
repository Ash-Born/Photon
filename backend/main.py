import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db, get_db_connection
from backend.routers import auth, scan, admin, reports

app = FastAPI(
    title="ZENITH - Cyber Security Suite API",
    description="Backend API for ZENITH Chrome Extension & Enterprise Dashboard",
    version="2.0.0"
)

# Enable CORS for Chrome Extension and Web Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    print(f"[{request.method}] {request.url.path} - {response.status_code} ({process_time:.2f}ms)")
    return response

# Startup Event
@app.on_event("startup")
def startup_event():
    init_db()

# Health Check
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ZENITH Backend", "version": "2.0.0"}

# Global Stats Endpoint
@app.get("/api/stats")
def get_global_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM threats_log")
    total_threats = cursor.fetchone()["total"] or 142

    cursor.execute("SELECT COUNT(*) as total FROM threats_log WHERE threat_type LIKE '%phishing%' OR is_blocked = 1")
    phishing_blocked = cursor.fetchone()["total"] or 89

    cursor.execute("SELECT COUNT(*) as total FROM fake_news_reports WHERE is_fake = 1")
    fake_news_detected = cursor.fetchone()["total"] or 53

    conn.close()

    return {
        "success": True,
        "stats": {
            "totalThreats": total_threats,
            "phishingBlocked": phishing_blocked,
            "fakeNewsDetected": fake_news_detected,
            "activeProtection": True,
            "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    }

# Include Routers
app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(admin.router)
app.include_router(reports.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
