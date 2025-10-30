// Chrome Extension - SnapVault
// Main popup functionality

class ScreenshotManager {
    constructor() {
        this.currentScreenshot = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadScreenshots();
    }

    // Navigation between sections
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetSection = item.dataset.section;

                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update active section
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');

                // Load screenshots if switching to screenshots section
                if (targetSection === 'screenshots') {
                    this.loadScreenshots();
                }
            });
        });
    }

    setupEventListeners() {
        // Capture screenshot button
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.captureScreenshot();
        });

        // Save screenshot + note button
        document.getElementById('saveNoteBtn').addEventListener('click', () => {
            this.saveScreenshotWithNote();
        });

        // Date filter
        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.filterScreenshotsByDate(e.target.value);
        });

        // Clear filter button
        document.getElementById('clearFilter').addEventListener('click', () => {
            document.getElementById('dateFilter').value = '';
            this.loadScreenshots();
        });
    }

    // Capture screenshot of current tab
    async captureScreenshot() {
        const captureBtn = document.getElementById('captureBtn');
        const captureMessage = document.getElementById('captureMessage');

        try {
            captureBtn.disabled = true;
            captureMessage.textContent = 'Capturing screenshot...';
            captureMessage.className = 'message';

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Capture visible tab
            const screenshotUrl = await chrome.tabs.captureVisibleTab(null, {
                format: 'png',
                quality: 100
            });

            this.currentScreenshot = {
                url: screenshotUrl,
                tabUrl: tab.url,
                title: tab.title,
                timestamp: new Date().toISOString()
            };

            captureMessage.textContent = 'Screenshot captured! Add a note and save.';
            captureMessage.className = 'message success';

            // Enable the save button
            document.getElementById('saveNoteBtn').disabled = false;

        } catch (error) {
            console.error('Error capturing screenshot:', error);
            captureMessage.textContent = 'Failed to capture screenshot. Please try again.';
            captureMessage.className = 'message error';
        } finally {
            captureBtn.disabled = false;
        }
    }

    // Save screenshot with note
    async saveScreenshotWithNote() {
        const saveBtn = document.getElementById('saveNoteBtn');
        const saveMessage = document.getElementById('saveMessage');
        const noteInput = document.getElementById('noteInput');

        if (!this.currentScreenshot) {
            saveMessage.textContent = 'Please capture a screenshot first.';
            saveMessage.className = 'message error';
            return;
        }

        try {
            saveBtn.disabled = true;
            saveMessage.textContent = 'Saving screenshot...';
            saveMessage.className = 'message';

            const note = noteInput.value.trim();
            const screenshotData = {
                ...this.currentScreenshot,
                note: note,
                id: Date.now().toString()
            };

            // Get existing screenshots
            const result = await chrome.storage.local.get(['screenshots']);
            const screenshots = result.screenshots || [];

            // Add new screenshot
            screenshots.unshift(screenshotData);

            // Save to storage
            await chrome.storage.local.set({ screenshots: screenshots });

            saveMessage.textContent = 'Screenshot and note saved successfully!';
            saveMessage.className = 'message success';

            // Reset form
            noteInput.value = '';
            this.currentScreenshot = null;
            document.getElementById('captureMessage').textContent = '';

        } catch (error) {
            console.error('Error saving screenshot:', error);
            saveMessage.textContent = 'Failed to save screenshot. Please try again.';
            saveMessage.className = 'message error';
        } finally {
            saveBtn.disabled = false;
        }
    }

    // Load and display all screenshots
    async loadScreenshots() {
        try {
            const result = await chrome.storage.local.get(['screenshots']);
            const screenshots = result.screenshots || [];

            const screenshotsList = document.getElementById('screenshotsList');
            const noScreenshots = document.getElementById('noScreenshots');

            if (screenshots.length === 0) {
                screenshotsList.style.display = 'none';
                noScreenshots.style.display = 'flex';
                return;
            }

            screenshotsList.style.display = 'block';
            noScreenshots.style.display = 'none';

            screenshotsList.innerHTML = '';

            screenshots.forEach(screenshot => {
                const screenshotElement = this.createScreenshotElement(screenshot);
                screenshotsList.appendChild(screenshotElement);
            });

        } catch (error) {
            console.error('Error loading screenshots:', error);
        }
    }

    // Create screenshot element
    createScreenshotElement(screenshot) {
        const div = document.createElement('div');
        div.className = 'screenshot-item';
        div.dataset.id = screenshot.id;
        div.dataset.date = screenshot.timestamp.split('T')[0];

        const formatDate = (timestamp) => {
            return new Date(timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const truncateUrl = (url, maxLength = 40) => {
            if (url.length <= maxLength) return url;
            return url.substring(0, maxLength) + '...';
        };

        div.innerHTML = `
            <div class="screenshot-info">
                <div class="screenshot-details">
                    <h4>${screenshot.title || 'Untitled'}</h4>
                    <a href="${screenshot.tabUrl}" class="url" target="_blank" title="${screenshot.tabUrl}">
                        ${truncateUrl(screenshot.tabUrl)}
                    </a>
                    <div class="timestamp">${formatDate(screenshot.timestamp)}</div>
                </div>
                <div class="screenshot-actions">
                    <button class="btn ghost view-btn" title="View Full Size">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn ghost download-btn" title="Download PNG">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    <button class="btn danger delete-btn" title="Delete">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${screenshot.note ? `<div class="screenshot-note">${screenshot.note}</div>` : ''}
        `;

        // Add event listeners
        const viewBtn = div.querySelector('.view-btn');
        const downloadBtn = div.querySelector('.download-btn');
        const deleteBtn = div.querySelector('.delete-btn');

        viewBtn.addEventListener('click', () => {
            this.viewScreenshot(screenshot.url);
        });

        downloadBtn.addEventListener('click', () => {
            this.downloadScreenshot(screenshot);
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteScreenshot(screenshot.id);
        });

        return div;
    }

    // View screenshot in new tab
    viewScreenshot(screenshotUrl) {
        chrome.tabs.create({ url: screenshotUrl });
    }

    // Download screenshot as PNG
    downloadScreenshot(screenshot) {
        const link = document.createElement('a');
        link.href = screenshot.url;

        // Create filename from title and timestamp
        const date = new Date(screenshot.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        const title = (screenshot.title || 'screenshot').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        link.download = `${title}_${dateStr}_${timeStr}.png`;
        link.click();
    }

    // Delete screenshot
    async deleteScreenshot(screenshotId) {
        try {
            const result = await chrome.storage.local.get(['screenshots']);
            const screenshots = result.screenshots || [];

            const filteredScreenshots = screenshots.filter(s => s.id !== screenshotId);

            await chrome.storage.local.set({ screenshots: filteredScreenshots });

            // Remove element from DOM
            const element = document.querySelector(`[data-id="${screenshotId}"]`);
            if (element) {
                element.remove();
            }

            // Check if no screenshots remain
            if (filteredScreenshots.length === 0) {
                document.getElementById('screenshotsList').style.display = 'none';
                document.getElementById('noScreenshots').style.display = 'flex';
            }

        } catch (error) {
            console.error('Error deleting screenshot:', error);
        }
    }

    // Filter screenshots by date
    async filterScreenshotsByDate(selectedDate) {
        if (!selectedDate) {
            this.loadScreenshots();
            return;
        }

        try {
            const result = await chrome.storage.local.get(['screenshots']);
            const screenshots = result.screenshots || [];

            const filteredScreenshots = screenshots.filter(screenshot => {
                const screenshotDate = screenshot.timestamp.split('T')[0];
                return screenshotDate === selectedDate;
            });

            const screenshotsList = document.getElementById('screenshotsList');
            const noScreenshots = document.getElementById('noScreenshots');

            if (filteredScreenshots.length === 0) {
                screenshotsList.style.display = 'none';
                noScreenshots.style.display = 'flex';
                noScreenshots.innerHTML = `
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <p>No screenshots found for this date</p>
                    <p class="sub-text">Try selecting a different date or clear the filter</p>
                `;
                return;
            }

            screenshotsList.style.display = 'block';
            noScreenshots.style.display = 'none';

            screenshotsList.innerHTML = '';

            filteredScreenshots.forEach(screenshot => {
                const screenshotElement = this.createScreenshotElement(screenshot);
                screenshotsList.appendChild(screenshotElement);
            });

        } catch (error) {
            console.error('Error filtering screenshots:', error);
        }
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScreenshotManager();
});