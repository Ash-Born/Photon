from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models import BlocklistAddRequest, FeatureToggleRequest, UpdateTierRequest, ApiResponse
from backend.database import get_db_connection

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

@router.get("/users")
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, username, full_name, tier, status, created_at, last_login_at FROM users ORDER BY id DESC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return ApiResponse(success=True, message="Users retrieved", data=users)

@router.post("/update-tier")
def update_user_tier(req: UpdateTierRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (req.tier, req.user_id))
    conn.commit()
    conn.close()
    return ApiResponse(success=True, message=f"User tier updated to {req.tier}")

@router.get("/suspicious-users")
def get_suspicious_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.username, u.email, u.tier, COUNT(t.id) as threat_count
        FROM users u
        JOIN threats_log t ON u.id = t.user_id
        WHERE t.severity >= 80
        GROUP BY u.id
        ORDER BY threat_count DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return ApiResponse(success=True, message="Suspicious users list", data=rows)

@router.get("/features")
def get_feature_toggles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT setting_key, setting_value, description FROM system_settings WHERE setting_group = 'features'")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return ApiResponse(success=True, message="Feature toggles", data=rows)

@router.post("/toggle-feature")
def toggle_feature(req: FeatureToggleRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO system_settings (setting_key, setting_value, setting_group, description)
        VALUES (?, ?, 'features', 'Dynamic feature flag')
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP
    """, (req.key, str(req.value)))
    conn.commit()
    conn.close()
    return ApiResponse(success=True, message=f"Feature '{req.key}' updated to {req.value}")

@router.get("/blocklist")
def get_blocklist():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM blocklist ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return ApiResponse(success=True, message="Blocklist retrieved", data=rows)

@router.post("/blocklist")
def add_to_blocklist(req: BlocklistAddRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO blocklist (domain, threat_type, severity, source, reason)
        VALUES (?, ?, ?, ?, ?)
    """, (req.domain, req.threat_type, req.severity, req.source, req.reason))
    conn.commit()
    conn.close()
    return ApiResponse(success=True, message=f"Domain '{req.domain}' added to blocklist")

@router.delete("/blocklist/{domain}")
def remove_from_blocklist(domain: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM blocklist WHERE domain = ?", (domain,))
    conn.commit()
    conn.close()
    return ApiResponse(success=True, message=f"Domain '{domain}' removed from blocklist")

@router.get("/audit-logs")
def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100")
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return ApiResponse(success=True, message="Audit logs retrieved", data=logs)
