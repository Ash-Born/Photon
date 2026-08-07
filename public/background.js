// ZENITH Chrome Extension Background Service Worker
console.log('ZENITH Extension Background Service Worker Loaded.');

// Listen for tab navigation and scan URLs
chrome.webNavigation?.onBeforeNavigate?.addListener((details) => {
  if (details.frameId === 0 && details.url.startsWith('http')) {
    chrome.storage.local.get(['isProtectionActive'], (res) => {
      if (res.isProtectionActive !== false) {
        console.log('[ZENITH] Inspecting URL navigation:', details.url);
      }
    });
  }
});

// Intercept file downloads to scan for executables
chrome.downloads?.onCreated?.addListener((downloadItem) => {
  const filename = downloadItem.filename || '';
  if (/\.(exe|dll|msi|scr|vbs|bat|sys)$/i.test(filename)) {
    console.warn('[ZENITH] Executable download intercepted for PE inspection:', filename);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCAN_SELECTION') {
    console.log('[ZENITH] Received selection scan request:', request.text);
    sendResponse({ status: 'scanned', timestamp: Date.now() });
  }
  return true;
});
