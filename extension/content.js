// ZENITH - Advanced Cyber Security Content Script Engine
console.log("[ZENITH Content Script] Threat Engine active on page:", window.location.href);

let tooltipElement = null;
let hoverTimer = null;
let autoHideTimer = null;

// Create Floating Glassmorphism Tooltip Card
function createTooltip() {
  if (tooltipElement) return tooltipElement;

  tooltipElement = document.createElement("div");
  tooltipElement.id = "sentinel-extension-tooltip";
  tooltipElement.className = "sentinel-glass-tooltip sentinel-hidden";
  document.body.appendChild(tooltipElement);
  return tooltipElement;
}

// Show Floating Tooltip Card at specified position
function showTooltip(x, y, contentHtml, durationMs = 6000) {
  const el = createTooltip();
  el.innerHTML = contentHtml;
  
  // Calculate boundary screen limits
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const posX = Math.max(10, Math.min(x + 12, screenW - 340));
  const posY = Math.max(10, Math.min(y + 12, screenH - 180));

  el.style.left = `${posX}px`;
  el.style.top = `${posY}px`;
  el.classList.remove("sentinel-hidden");

  if (autoHideTimer) clearTimeout(autoHideTimer);
  if (durationMs > 0) {
    autoHideTimer = setTimeout(() => {
      hideTooltip();
    }, durationMs);
  }
}

// Hide Tooltip Card
function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.classList.add("sentinel-hidden");
  }
}

// -------------------------------------------------------------
// FEATURE 1: Instant Website Auto-Scan on Page Load
// -------------------------------------------------------------
function performAutoPageScan() {
  const currentUrl = window.location.href;
  if (!currentUrl.startsWith("http")) return;

  // Send request to background worker for domain check
  chrome.runtime.sendMessage({ type: "CHECK_URL", url: currentUrl, source: "auto_page_scan" });
}

// Execute on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", performAutoPageScan);
} else {
  performAutoPageScan();
}

// -------------------------------------------------------------
// FEATURE 2: Hover Link Deep Inspector (Messenger / Social / Web)
// -------------------------------------------------------------
document.addEventListener("mouseover", (e) => {
  const link = e.target.closest("a");
  if (link && link.href && link.href.startsWith("http")) {
    const href = link.href;

    if (hoverTimer) clearTimeout(hoverTimer);

    // Show instant deep inspecting status badge (300ms delay)
    hoverTimer = setTimeout(() => {
      showTooltip(e.pageX, e.pageY, `
        <div class="sentinel-tooltip-header">
          <span class="sentinel-logo-badge">🛡️ ZENITH HOVER GUARD</span>
          <span class="sentinel-status-scanning">Deep Analyzing URL...</span>
        </div>
        <p class="sentinel-tooltip-domain">Target: <strong style="color: #38bdf8;">${href.substring(0, 45)}...</strong></p>
        <p class="sentinel-tooltip-desc">Evaluating SSL, domain trust & fake news content...</p>
      `, 3000);

      chrome.runtime.sendMessage({ type: "CHECK_URL", url: href, source: "hover" });
    }, 300);
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target.closest("a")) {
    if (hoverTimer) clearTimeout(hoverTimer);
  }
});

// -------------------------------------------------------------
// FEATURE 3: Text & Link Selection Inspector
// -------------------------------------------------------------
document.addEventListener("mouseup", (e) => {
  if (e.target.closest("#sentinel-extension-tooltip")) return;

  const selection = window.getSelection()?.toString().trim() || "";
  if (selection.length >= 8) {
    const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    const x = rect ? rect.left + window.scrollX : e.pageX;
    const y = rect ? rect.bottom + window.scrollY : e.pageY;

    showTooltip(x, y, `
      <div class="sentinel-tooltip-header">
        <span class="sentinel-logo-badge">🛡️ ZENITH SELECTION GUARD</span>
        <span class="sentinel-status-scanning">Evaluating Selection...</span>
      </div>
      <p class="sentinel-tooltip-text">"${selection.substring(0, 70)}..."</p>
    `, 4000);

    // Check if selection is URL or text claim
    if (selection.startsWith("http://") || selection.startsWith("https://")) {
      chrome.runtime.sendMessage({ type: "CHECK_URL", url: selection, source: "selection" });
    } else {
      chrome.runtime.sendMessage({ type: "CHECK_TEXT", text: selection, source: "selection" });
    }
  }
});

// -------------------------------------------------------------
// FEATURE 4: Clipboard Copy Monitor (Intercepts copied text/link)
// -------------------------------------------------------------
document.addEventListener("copy", () => {
  const selection = window.getSelection()?.toString().trim() || "";
  if (selection.length >= 6) {
    showTooltip(window.innerWidth - 340, 25, `
      <div class="sentinel-tooltip-header">
        <span class="sentinel-logo-badge">📋 CLIPBOARD GUARD</span>
        <span class="sentinel-status-scanning">Inspecting Copied Item...</span>
      </div>
      <p class="sentinel-tooltip-text">Intercepted copied item: "${selection.substring(0, 50)}..."</p>
    `, 5000);

    if (selection.startsWith("http://") || selection.startsWith("https://")) {
      chrome.runtime.sendMessage({ type: "CHECK_URL", url: selection, source: "copy" });
    } else {
      chrome.runtime.sendMessage({ type: "CHECK_TEXT", text: selection, source: "copy" });
    }
  }
});

// -------------------------------------------------------------
// Message Listener for Deep Inspection Results
// -------------------------------------------------------------
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ZENITH_SCAN_RESULT" || message.type === "SENTINEL_SCAN_RESULT") {
    const { scanType, data, source } = message;

    if (scanType === "url") {
      const isDangerous = data.status === "dangerous" || (data.threatScore && data.threatScore > 50);
      const isSuspicious = data.status === "suspicious" || (data.threatScore && data.threatScore > 30 && data.threatScore <= 50);
      const badgeClass = isDangerous ? "sentinel-badge-danger" : (isSuspicious ? "sentinel-badge-danger" : "sentinel-badge-success");
      const statusLabel = isDangerous ? "🔴 DANGEROUS PHISHING LINK" : (isSuspicious ? "🟡 SUSPICIOUS UNVERIFIED LINK" : "🟢 SECURE OFFICIAL LINK");

      showTooltip(window.innerWidth - 360, 20, `
        <div class="sentinel-tooltip-header">
          <span class="sentinel-logo-badge">🛡️ ZENITH ${source === 'auto_page_scan' ? 'PAGE GUARD' : 'LINK INSPECT'}</span>
          <span class="${badgeClass}">${statusLabel}</span>
        </div>
        <p class="sentinel-tooltip-domain">Domain: <strong style="color: #38bdf8;">${data.domain || data.url || 'Target URL'}</strong></p>
        <p class="sentinel-tooltip-desc">1. Security: <strong>${isDangerous ? 'High Phishing Risk' : (isSuspicious ? 'Suspicious SSL/Structure' : 'Safe & SSL Verified')}</strong></p>
        <p class="sentinel-tooltip-desc">2. Content Trust: <strong>${isDangerous ? 'Untrusted Source / Scam' : 'Verified Factual News / Official Web Domain'}</strong></p>
        <p class="sentinel-tooltip-desc">${data.recommendation || 'Analyzed via ML heuristics & live threat databases.'}</p>
        <div class="sentinel-tooltip-footer">
          <span>Threat Score: <strong>${data.threatScore || 0}%</strong></span>
        </div>
      `, source === 'auto_page_scan' ? 8000 : 6000);

    } else if (scanType === "text") {
      const isFake = data.isFake || (data.fakeScore && data.fakeScore > 50);
      const badgeClass = isFake ? "sentinel-badge-danger" : "sentinel-badge-success";

      showTooltip(window.innerWidth - 360, 20, `
        <div class="sentinel-tooltip-header">
          <span class="sentinel-logo-badge">🛡️ ZENITH FACT EVALUATOR</span>
          <span class="${badgeClass}">${isFake ? "🔴 FAKE NEWS / MISLEADING" : "🟢 VERIFIED FACTUAL NEWS"}</span>
        </div>
        <p class="sentinel-tooltip-verdict">Verdict: <strong>${data.verdict || (isFake ? "Fake / Rumor Claim" : "Factual Report")}</strong></p>
        <p class="sentinel-tooltip-desc">${data.explanation || 'Evaluated against multi-source AI news & fact databases.'}</p>
        <div class="sentinel-tooltip-footer">
          <span>Probability: <strong>${data.fakeScore || 0}% Fake Score</strong></span>
        </div>
      `, 7000);
    }
  }
});

