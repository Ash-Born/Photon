import sqlite3
import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger("sentinel_db")
logging.basicConfig(level=logging.INFO)

DB_FILE = os.path.join(os.path.dirname(__file__), "sentinel_db.sqlite")

def get_db_connection():
    """Returns a connection to the SQLite/MySQL database engine."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes all 7 core tables and seeds default admin data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        tier TEXT CHECK(tier IN ('lite','pro','enterprise')) DEFAULT 'lite',
        status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. threats_log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threats_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        domain VARCHAR(255),
        threat_type VARCHAR(50) NOT NULL,
        severity INTEGER NOT NULL DEFAULT 0,
        is_blocked BOOLEAN DEFAULT 1,
        user_id INTEGER NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 3. fake_news_reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fake_news_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_hash VARCHAR(255) UNIQUE NOT NULL,
        content_text TEXT NOT NULL,
        source_url VARCHAR(500),
        source_domain VARCHAR(255),
        fake_score INTEGER NOT NULL DEFAULT 0,
        confidence INTEGER NOT NULL DEFAULT 70,
        is_fake BOOLEAN DEFAULT 0,
        status TEXT CHECK(status IN ('pending','verified','rejected')) DEFAULT 'pending',
        user_id INTEGER NULL,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 4. blocklist table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blocklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain VARCHAR(255) UNIQUE NOT NULL,
        threat_type VARCHAR(50) NOT NULL DEFAULT 'suspicious',
        severity INTEGER DEFAULT 80,
        source VARCHAR(100) DEFAULT 'manual',
        reason TEXT,
        is_active BOOLEAN DEFAULT 1,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. audit_logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NULL,
        username VARCHAR(50),
        action VARCHAR(255) NOT NULL,
        action_type VARCHAR(50) NOT NULL DEFAULT 'system',
        details TEXT,
        ip_address VARCHAR(45),
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    # 6. system_settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        setting_group VARCHAR(50) DEFAULT 'general',
        setting_type TEXT CHECK(setting_type IN ('string','integer','boolean','json')) DEFAULT 'string',
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 7. user_sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT 1,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    conn.commit()

    # Seed Default Data
    # Default Admin
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        # Hash 'admin123' using simple bcrypt string or fallback
        cursor.execute("""
            INSERT INTO users (email, username, full_name, password_hash, tier, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ('admin@sentinel.com', 'admin', 'Zenith System Admin', '$2b$12$e0M2/u/QGf0oP4pSg/1p4.L1N.O0P4pSg/1p4.L1N', 'enterprise', 'active'))

    # Default Blocklists
    default_domains = [
        ("paypal-verify-account-security.xyz", "phishing", 95, "Phishing Credential Harvest"),
        ("free-robux-coins-claim.net", "scam", 90, "Malicious Cashback Scam"),
        ("apple-id-confirm-login.top", "phishing", 96, "Apple ID Harvest"),
        ("bank-login-secure-auth.club", "phishing", 98, "Banking Trojan & Harvest")
    ]
    for dom, tt, sev, rsn in default_domains:
        cursor.execute("SELECT id FROM blocklist WHERE domain = ?", (dom,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO blocklist (domain, threat_type, severity, source, reason)
                VALUES (?, ?, ?, 'system_seed', ?)
            """, (dom, tt, sev, rsn))

    # Default System Settings
    default_settings = [
        ("threat_score_threshold_block", "60", "security", "integer", "Score threshold to block URLs"),
        ("threat_score_threshold_red", "90", "security", "integer", "Score threshold for red screen overlay"),
        ("block_phishing", "true", "protection", "boolean", "Enable automated phishing block"),
        ("block_malware", "true", "protection", "boolean", "Enable automated malware download inspection"),
        ("feature_url_scanning", "true", "features", "boolean", "URL scanner tool active"),
        ("feature_fake_news", "true", "features", "boolean", "Fake news analyzer tool active")
    ]
    for key, val, grp, stype, desc in default_settings:
        cursor.execute("SELECT id FROM system_settings WHERE setting_key = ?", (key,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO system_settings (setting_key, setting_value, setting_group, setting_type, description)
                VALUES (?, ?, ?, ?, ?)
            """, (key, val, grp, stype, desc))

    conn.commit()
    conn.close()
    logger.info("[ZENITH DB] Database initialized and verified successfully.")

# Run database setup on module load
init_db()
