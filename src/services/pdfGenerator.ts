import { jsPDF } from 'jspdf';
import { ThreatLog, FakeNewsReport, AuditLog } from '../types';

export function downloadPdfReport(
  threatLogs: ThreatLog[],
  fakeNewsReports: FakeNewsReport[],
  tierName: string
) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(10, 14, 26); // Dark background #0a0e1a
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(0, 212, 255); // Cyan #00d4ff
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ZENITH CYBER SECURITY REPORT', 14, 20);

  doc.setTextColor(200, 220, 245);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()} | Access Tier: ${tierName.toUpperCase()}`, 14, 30);

  // Section 1: Summary Statistics
  let y = 50;
  doc.setTextColor(10, 14, 26);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Threat Summary', 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Intercepted Threats: ${threatLogs.length}`, 14, y);
  y += 6;
  doc.text(`Phishing Attacks Blocked: ${threatLogs.filter(t => t.threatType === 'phishing').length}`, 14, y);
  y += 6;
  doc.text(`Malware PE Files Quarantined: ${threatLogs.filter(t => t.threatType === 'malware').length}`, 14, y);
  y += 6;
  doc.text(`Fake News Claims Flagged: ${fakeNewsReports.length}`, 14, y);

  // Section 2: Recent Threat Events Table
  y += 14;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Intercepted Threat Log', 14, y);

  y += 8;
  doc.setFillColor(240, 244, 248);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Domain / URL', 16, y + 6);
  doc.text('Threat Category', 90, y + 6);
  doc.text('Severity', 145, y + 6);
  doc.text('Status', 175, y + 6);

  y += 10;
  doc.setFont('helvetica', 'normal');

  threatLogs.slice(0, 15).forEach((log) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const truncatedUrl = log.domain.length > 35 ? log.domain.substring(0, 35) + '...' : log.domain;
    doc.text(truncatedUrl, 16, y);
    doc.text(log.threatType.toUpperCase(), 90, y);
    doc.text(`${log.severity}%`, 145, y);
    doc.text(log.isBlocked ? 'BLOCKED' : 'LOGGED', 175, y);
    y += 7;
  });

  // Section 3: Fake News & Fact Check Audit
  if (fakeNewsReports.length > 0) {
    y += 10;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. AI Fact-Check Audit', 14, y);

    y += 8;
    fakeNewsReports.slice(0, 5).forEach((fn, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`#${idx + 1} Content: "${fn.contentText.substring(0, 60)}..."`, 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`Fake Risk Score: ${fn.fakeScore}% | Status: ${fn.isFake ? 'FAKE NEWS' : 'VERIFIED REAL'}`, 14, y);
      y += 7;
    });
  }

  // Save the PDF
  doc.save(`ZENITH_Security_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function downloadCsvReport(threatLogs: ThreatLog[], auditLogs: AuditLog[]) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  csvContent += '--- THREAT LOGS ---\n';
  csvContent += 'ID,URL,Domain,Threat Type,Severity,Is Blocked,Detected At\n';
  threatLogs.forEach(t => {
    csvContent += `"${t.id}","${t.url}","${t.domain}","${t.threatType}",${t.severity},"${t.isBlocked}","${t.detectedAt}"\n`;
  });

  csvContent += '\n--- AUDIT LOGS ---\n';
  csvContent += 'ID,User,Action,Action Type,Status,Created At\n';
  auditLogs.forEach(a => {
    csvContent += `"${a.id}","${a.userName}","${a.action}","${a.actionType}","${a.status}","${a.createdAt}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ZENITH_Threat_Audit_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
