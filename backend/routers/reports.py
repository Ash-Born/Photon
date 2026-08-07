from fastapi import APIRouter
from fastapi.responses import Response
from backend.models import ApiResponse
from backend.database import get_db_connection
from backend.utils.helpers import generate_pdf_summary_bytes, generate_csv_summary_bytes

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/download/pdf")
def download_pdf_report():
    pdf_bytes = generate_pdf_summary_bytes()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ZENITH_Security_Report.pdf"}
    )

@router.get("/download/csv")
def download_csv_report():
    csv_bytes = generate_csv_summary_bytes()
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ZENITH_Threat_Logs.csv"}
    )

@router.get("/summary")
def get_report_summary():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM threats_log")
    total_scans = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM threats_log WHERE is_blocked = 1")
    total_blocked = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM fake_news_reports WHERE is_fake = 1")
    total_fake_news = cursor.fetchone()["total"]

    conn.close()

    return ApiResponse(
        success=True,
        message="Report summary retrieved",
        data={
            "total_scans": total_scans,
            "total_blocked_phishing": total_blocked,
            "total_fake_news": total_fake_news,
            "system_health": "100% OPERATIONAL",
            "security_index": 98.4
        }
    )
