// Shortcuts functionality
class ShortcutsManager {
    constructor() {
        this.shortcuts = this.loadShortcuts();
        this.init();
    }

    init() {
        this.renderShortcuts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add shortcut button
        document.getElementById('add-shortcut-btn').addEventListener('click', () => {
            this.openShortcutModal();
        });

        // Modal close button
        document.querySelector('.shortcut-close-btn').addEventListener('click', () => {
            this.closeShortcutModal();
        });

        // Save shortcut button
        document.getElementById('save-shortcut-btn').addEventListener('click', () => {
            this.saveShortcut();
        });

        // Close modal when clicking outside
        document.getElementById('shortcut-modal').addEventListener('click', (e) => {
            if (e.target.id === 'shortcut-modal') {
                this.closeShortcutModal();
            }
        });

        // Enter key to save shortcut
        document.getElementById('shortcut-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveShortcut();
            }
        });

        document.getElementById('shortcut-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveShortcut();
            }
        });
    }

    loadShortcuts() {
        try {
            // For Claude.ai artifacts - use in-memory storage
            if (typeof localStorage === 'undefined') {
                return this.shortcuts || [];
            }
            // For real browser extension - use localStorage
            const saved = localStorage.getItem('dashboard-shortcuts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('localStorage not available, using in-memory storage');
            return this.shortcuts || [];
        }
    }

    saveShortcuts() {
        try {
            // For real browser extension - save to localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('dashboard-shortcuts', JSON.stringify(this.shortcuts));
            }
            // For Claude.ai artifacts - data persists only during session
        } catch (e) {
            console.warn('localStorage not available');
        }
    }

    openShortcutModal() {
        document.getElementById('shortcut-modal').style.display = 'flex';
        document.getElementById('shortcut-name').focus();
    }

    closeShortcutModal() {
        document.getElementById('shortcut-modal').style.display = 'none';
        document.getElementById('shortcut-name').value = '';
        document.getElementById('shortcut-url').value = '';
    }

    async saveShortcut() {
        const name = document.getElementById('shortcut-name').value.trim();
        const url = document.getElementById('shortcut-url').value.trim();

        if (!name || !url) {
            this.showToast('Please fill in both fields');
            return;
        }

        // Validate URL
        if (!this.isValidUrl(url)) {
            this.showToast('Please enter a valid URL');
            return;
        }

        const shortcut = {
            id: Date.now().toString(),
            name,
            url: this.normalizeUrl(url),
            favicon: await this.getFavicon(url),
            createdAt: new Date().toISOString()
        };

        this.shortcuts.push(shortcut);
        this.saveShortcuts();
        this.renderShortcuts();
        this.closeShortcutModal();
        this.showToast('Shortcut added successfully');
    }

    isValidUrl(string) {
        try {
            new URL(this.normalizeUrl(string));
            return true;
        } catch (_) {
            return false;
        }
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    async getFavicon(url) {
        try {
            const domain = new URL(this.normalizeUrl(url)).hostname;

            // Multiple favicon sources for better icon retrieval
            const faviconSources = [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                `https://${domain}/favicon.ico`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`,
                `https://api.faviconkit.com/${domain}/32`
            ];

            // Try to load the first available favicon
            for (const faviconUrl of faviconSources) {
                if (await this.testImageLoad(faviconUrl)) {
                    return faviconUrl;
                }
            }

            // Fallback to a generic globe icon
            return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0ibTEyIDJhMTUuMyAxNS4zIDAgMCAxIDQgMTBjLTEgNC0yLjUgOC00IDEwIi8+PHBhdGggZD0ibTEyIDJhMTUuMyAxNS4zIDAgMCAwLTQgMTBjMSA0IDIuNSA4IDQgMTAiLz48cGF0aCBkPSJtOCAxNGE0MCA0MiAwIDAgMSA4IDAiLz48cGF0aCBkPSJtOCAxMGE0MCA0MiAwIDAgMCA4IDAiLz48L3N2Zz4=';
        } catch (e) {
            return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0ibTEyIDJhMTUuMyAxNS4zIDAgMCAxIDQgMTBjLTEgNC0yLjUgOC00IDEwIi8+PHBhdGggZD0ibTEyIDJhMTUuMyAxNS4zIDAgMCAwLTQgMTBjMSA0IDIuNSA4IDQgMTAiLz48cGF0aCBkPSJtOCAxNGE0MCA0MiAwIDAgMSA4IDAiLz48cGF0aCBkPSJtOCAxMGE0MCA0MiAwIDAgMCA4IDAiLz48L3N2Zz4=';
        }
    }

    testImageLoad(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;

            // Timeout after 3 seconds
            setTimeout(() => resolve(false), 3000);
        });
    }

    renderShortcuts() {
        const shortcutsList = document.getElementById('shortcuts-list');

        if (this.shortcuts.length === 0) {
            shortcutsList.innerHTML = '<div class="shortcuts-empty">No shortcuts yet. Click + to add one!</div>';
            return;
        }

        shortcutsList.innerHTML = this.shortcuts.map(shortcut => `
            <div class="shortcut-item" data-id="${shortcut.id}">
                <img src="${shortcut.favicon}" alt="${shortcut.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/><path d=\\"m9 12 2 2 4-4\\"/></svg>
                <div class="shortcut-info">
                    <div class="shortcut-title">${this.escapeHtml(shortcut.name)}</div>
                    <div class="shortcut-url">${this.escapeHtml(this.getDisplayUrl(shortcut.url))}</div>
                </div>
                <button class="shortcut-remove" data-id="${shortcut.id}" title="Remove shortcut">×</button>
            </div>
        `).join('');

        // Add event listeners for shortcut items
        shortcutsList.querySelectorAll('.shortcut-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('shortcut-remove')) {
                    const shortcut = this.shortcuts.find(s => s.id === item.dataset.id);
                    if (shortcut) {
                        window.open(shortcut.url, '_blank');
                    }
                }
            });
        });

        // Add event listeners for remove buttons
        shortcutsList.querySelectorAll('.shortcut-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeShortcut(btn.dataset.id);
            });
        });
    }

    removeShortcut(id) {
        this.shortcuts = this.shortcuts.filter(shortcut => shortcut.id !== id);
        this.saveShortcuts();
        this.renderShortcuts();
        this.showToast('Shortcut removed');
    }

    getDisplayUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return url;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }
}

// Initialize shortcuts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shortcutsManager = new ShortcutsManager();
});

// Also add to your main newtab.js file or initialize after other components
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.shortcutsManager) {
            window.shortcutsManager = new ShortcutsManager();
        }
    });
} else {
    if (!window.shortcutsManager) {
        window.shortcutsManager = new ShortcutsManager();
    }
}