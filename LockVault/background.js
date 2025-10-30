// LockVault Password Manager - Background Service Worker

// Handle extension icon click - open dashboard in new tab
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard.html')
    });
});

// Listen for messages from content scripts or popup (if needed in future)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openDashboard') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('dashboard.html')
        });
    }

    sendResponse({ success: true });
    return true;
});

// Initialize storage on install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Set default values on first install
        chrome.storage.local.set({
            credentials: [],
            logs: [],
            theme: 'dark'
        }, () => {
            console.log('LockVault initialized successfully');
        });
    }
});

console.log('LockVault background service worker loaded');