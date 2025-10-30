// QR Code Generator Extension - popup.js

class QRGenerator {
    constructor() {
        this.currentQR = null;
        this.currentURL = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRecentQRs();
    }

    bindEvents() {
        // Generate QR button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateQR();
        });

        // Current tab button
        document.getElementById('currentTabBtn').addEventListener('click', () => {
            this.getCurrentTabURL();
        });

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadQR();
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyQRToClipboard();
        });

        document.getElementById('copyUrlBtn').addEventListener('click', () => {
            this.copyURLToClipboard();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareQR();
        });

        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Enter key on input
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateQR();
            }
        });
    }

    async getCurrentTabURL() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                document.getElementById('urlInput').value = tab.url;
                this.showStatus('Current tab URL loaded', 'success');
            }
        } catch (error) {
            this.showStatus('Could not get current tab URL', 'error');
            console.error('Error getting current tab:', error);
        }
    }

    generateQR() {
        const urlInput = document.getElementById('urlInput');
        const url = urlInput.value.trim();

        if (!url) {
            this.showStatus('Please enter a URL', 'error');
            urlInput.focus();
            return;
        }

        if (!this.isValidURL(url)) {
            this.showStatus('Please enter a valid URL', 'error');
            urlInput.focus();
            return;
        }

        this.currentURL = url;

        // Clear previous QR code
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';

        try {
            // Generate QR code using QRCode.js
            this.currentQR = new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });

            // Show QR section
            document.getElementById('qrSection').style.display = 'block';

            // Save to recent QRs
            this.saveToRecent(url);
            this.loadRecentQRs();

            this.showStatus('QR code generated successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to generate QR code', 'error');
            console.error('QR generation error:', error);
        }
    }

    isValidURL(string) {
        try {
            // Add protocol if missing
            if (!string.startsWith('http://') && !string.startsWith('https://')) {
                string = 'https://' + string;
            }
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async downloadQR() {
        if (!this.currentQR) {
            this.showStatus('Please generate a QR code first', 'error');
            return;
        }

        try {
            const canvas = document.querySelector('#qrcode canvas');
            if (!canvas) {
                this.showStatus('QR code not found', 'error');
                return;
            }

            // Create download link
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showStatus('QR code downloaded!', 'success');
        } catch (error) {
            this.showStatus('Failed to download QR code', 'error');
            console.error('Download error:', error);
        }
    }

    async copyQRToClipboard() {
        if (!this.currentQR) {
            this.showStatus('Please generate a QR code first', 'error');
            return;
        }

        try {
            const canvas = document.querySelector('#qrcode canvas');
            if (!canvas) {
                this.showStatus('QR code not found', 'error');
                return;
            }

            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]);
                    this.showStatus('QR code copied to clipboard!', 'success');
                } catch (error) {
                    // Fallback for older browsers
                    this.copyCanvasAsDataURL(canvas);
                }
            }, 'image/png');
        } catch (error) {
            this.showStatus('Failed to copy QR code', 'error');
            console.error('Copy error:', error);
        }
    }

    copyCanvasAsDataURL(canvas) {
        try {
            const dataURL = canvas.toDataURL('image/png');
            // Create a temporary textarea to copy the data URL
            const textArea = document.createElement('textarea');
            textArea.value = dataURL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('QR code data copied to clipboard!', 'success');
        } catch (error) {
            this.showStatus('Failed to copy QR code', 'error');
        }
    }

    async copyURLToClipboard() {
        if (!this.currentURL) {
            this.showStatus('No URL to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.currentURL);
            this.showStatus('URL copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentURL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('URL copied to clipboard!', 'success');
        }
    }

    shareQR() {
        if (!this.currentQR) {
            this.showStatus('Please generate a QR code first', 'error');
            return;
        }

        try {
            const canvas = document.querySelector('#qrcode canvas');
            if (!canvas) {
                this.showStatus('QR code not found', 'error');
                return;
            }

            const dataURL = canvas.toDataURL('image/png');

            // Create a new tab with the QR code image
            const newTab = window.open();
            newTab.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${this.currentURL}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .qr-container {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              text-align: center;
            }
            .url {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
              word-break: break-all;
              max-width: 400px;
            }
            img {
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${dataURL}" alt="QR Code" />
            <div class="url">${this.currentURL}</div>
          </div>
        </body>
        </html>
      `);

            this.showStatus('QR code opened in new tab!', 'success');
        } catch (error) {
            this.showStatus('Failed to share QR code', 'error');
            console.error('Share error:', error);
        }
    }

    async saveToRecent(url) {
        try {
            const result = await chrome.storage.local.get(['recentQRs']);
            let recentQRs = result.recentQRs || [];

            // Remove if already exists
            recentQRs = recentQRs.filter(item => item.url !== url);

            // Add to beginning
            recentQRs.unshift({
                url: url,
                timestamp: Date.now()
            });

            // Keep only last 10
            recentQRs = recentQRs.slice(0, 10);

            await chrome.storage.local.set({ recentQRs });
        } catch (error) {
            console.error('Error saving to recent:', error);
        }
    }

    async loadRecentQRs() {
        try {
            const result = await chrome.storage.local.get(['recentQRs']);
            const recentQRs = result.recentQRs || [];

            const container = document.getElementById('recentQRs');

            if (recentQRs.length === 0) {
                container.innerHTML = '<p class="empty-state">No recent QR codes</p>';
                return;
            }

            container.innerHTML = recentQRs.map(item => `
        <div class="recent-item" data-url="${item.url}">
          <span class="recent-url" title="${item.url}">${item.url}</span>
          <button class="recent-delete" data-url="${item.url}">×</button>
        </div>
      `).join('');

            // Add click events
            container.querySelectorAll('.recent-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('recent-delete')) {
                        const url = item.dataset.url;
                        document.getElementById('urlInput').value = url;
                        this.showStatus('URL loaded from recent', 'success');
                    }
                });
            });

            container.querySelectorAll('.recent-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const url = btn.dataset.url;
                    this.deleteFromRecent(url);
                });
            });
        } catch (error) {
            console.error('Error loading recent QRs:', error);
        }
    }

    async deleteFromRecent(url) {
        try {
            const result = await chrome.storage.local.get(['recentQRs']);
            let recentQRs = result.recentQRs || [];

            recentQRs = recentQRs.filter(item => item.url !== url);

            await chrome.storage.local.set({ recentQRs });
            this.loadRecentQRs();
            this.showStatus('Removed from recent', 'success');
        } catch (error) {
            console.error('Error deleting from recent:', error);
            this.showStatus('Failed to remove item', 'error');
        }
    }

    async clearHistory() {
        try {
            await chrome.storage.local.set({ recentQRs: [] });
            this.loadRecentQRs();
            this.showStatus('History cleared', 'success');
        } catch (error) {
            console.error('Error clearing history:', error);
            this.showStatus('Failed to clear history', 'error');
        }
    }

    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});