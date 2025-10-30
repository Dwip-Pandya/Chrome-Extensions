// Configuration
const CONFIG = {
    unsplash: {
        accessKey: "your_api_key",
        apiUrl: "https://api.unsplash.com/photos/random"
    },
    weather: {
        apiKey: "your_api_key",
        weatherUrl: "https://api.openweathermap.org/data/2.5/weather"
    }
};

// Global variables
let selectedBookmarks = [];
let currentBookmarkToRemove = null;
let currentWallpaperUrl = null;
let tempSelectedBookmarks = [];
let selectedThemes = [];
let currentThemeQuery = '';

// DOM Elements
const elements = {
    backgroundImage: document.getElementById('background-image'),
    backgroundOverlay: document.getElementById('background-overlay'),
    loadingScreen: document.getElementById('loading-screen'),
    weatherIcon: document.getElementById('weather-icon'),
    weatherTemp: document.getElementById('weather-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    currentTime: document.getElementById('current-time'),
    currentDate: document.getElementById('current-date'),
    addBookmarkBtn: document.getElementById('add-bookmark-btn'),
    bookmarkItems: document.getElementById('bookmark-items'),
    bookmarkModal: document.getElementById('bookmark-modal'),
    bookmarkGrid: document.getElementById('bookmark-grid'),
    closeBtn: document.querySelector('.close-btn'),
    contextMenu: document.getElementById('context-menu'),
    removeBookmark: document.getElementById('remove-bookmark'),
    downloadBtn: document.getElementById('download-btn'),
    selectAllBtn: document.getElementById('select-all-btn'),
    addSelectedBtn: document.getElementById('add-selected-btn'),
    bookmarkSearch: document.getElementById('bookmark-search'),
    // Theme selection elements
    themeSelectionBtn: document.getElementById('theme-selection-btn'),
    themeModal: document.getElementById('theme-modal'),
    themeCloseBtn: document.querySelector('.theme-close-btn'),
    saveThemeBtn: document.getElementById('save-theme-btn'),
    clearThemeBtn: document.getElementById('clear-theme-btn'),
    themeCards: document.querySelectorAll('.theme-card'),
    themeCheckboxes: document.querySelectorAll('.theme-checkbox')
};

// Weather icon mapping
const weatherIcons = {
    'clear sky': '☀️',
    'few clouds': '🌤️',
    'scattered clouds': '⛅',
    'broken clouds': '☁️',
    'overcast clouds': '☁️',
    'light rain': '🌦️',
    'moderate rain': '🌧️',
    'heavy rain': '🌧️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️'
};

// Theme to query mapping
const themeQueries = {
    'nature,landscape': 'nature landscape forest jungle',
    'mountains,peaks': 'mountains peaks landscape',
    'night,dark,nighttime': 'night dark nighttime',
    'sky,clouds': 'sky clouds blue',
    'moon,lunar': 'moon lunar night',
    'ocean,beach,sea': 'ocean beach sea water',
    'desert,sand': 'desert sand dunes',
    'city,urban,architecture': 'city urban architecture buildings',
    'countryside,rural,farm': 'countryside rural farm pastoral',
    'waterfall,cascade': 'waterfall cascade water',
    'flowers,botanical': 'flowers botanical floral',
    'winter,snow,cold': 'winter snow cold ice',
    'sunset,sunrise,golden': 'sunset sunrise golden hour',
    'space,stars,galaxy': 'space stars galaxy cosmos',
    'animals,wildlife': 'animals wildlife nature',
    'random': 'nature,landscape'
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadSelectedThemes();
    await loadBackgroundImage();
    loadSelectedBookmarks();
    setupEventListeners();
    updateTimeAndDate();
    setInterval(updateTimeAndDate, 1000);
    await loadWeatherData();
    hideLoadingScreen();
    updateThemeButton();
});

// Load selected themes from storage
async function loadSelectedThemes() {
    try {
        const result = await chrome.storage.local.get(['selectedThemes']);
        selectedThemes = result.selectedThemes || [];
        updateCurrentThemeQuery();
    } catch (error) {
        console.error('Error loading themes:', error);
        selectedThemes = [];
        currentThemeQuery = 'nature,landscape';
    }
}

// Save selected themes to storage
async function saveSelectedThemes() {
    try {
        await chrome.storage.local.set({ selectedThemes });
    } catch (error) {
        console.error('Error saving themes:', error);
    }
}

// Update current theme query based on selected themes
function updateCurrentThemeQuery() {
    if (selectedThemes.length === 0) {
        currentThemeQuery = 'nature,landscape';
    } else if (selectedThemes.length === 1) {
        currentThemeQuery = selectedThemes[0];
    } else {
        // If multiple themes selected, randomly pick one for each image load
        const randomIndex = Math.floor(Math.random() * selectedThemes.length);
        currentThemeQuery = selectedThemes[randomIndex];
    }
}

// Load background image from Unsplash
async function loadBackgroundImage() {
    try {
        updateCurrentThemeQuery();
        const query = themeQueries[currentThemeQuery] || 'nature,landscape';

        const response = await fetch(`${CONFIG.unsplash.apiUrl}?query=${query}&orientation=landscape&w=1920&h=1080&client_id=${CONFIG.unsplash.accessKey}`);
        const data = await response.json();

        // Store the original URL for download
        currentWallpaperUrl = data.urls.full;

        const img = new Image();
        img.onload = () => {
            elements.backgroundImage.src = data.urls.full;
            elements.backgroundImage.style.opacity = '1';
        };
        img.src = data.urls.full;
    } catch (error) {
        console.error('Error loading background image:', error);
        // Fallback gradient background
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// Get user location and load weather data
async function loadWeatherData() {
    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;

        const response = await fetch(
            `${CONFIG.weather.weatherUrl}?lat=${latitude}&lon=${longitude}&appid=${CONFIG.weather.apiKey}&units=metric`
        );
        const data = await response.json();

        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error loading weather data:', error);
        elements.weatherDesc.textContent = 'Weather unavailable';
        elements.weatherTemp.textContent = '--°C';
        elements.weatherIcon.textContent = '🌡️';
    }
}

// Get current position promise wrapper
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Update weather display
function updateWeatherDisplay(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description.toLowerCase();
    const icon = weatherIcons[description] || '🌡️';

    elements.weatherTemp.textContent = `${temp}°C`;
    elements.weatherDesc.textContent = capitalize(description);
    elements.weatherIcon.textContent = icon;
}

// Update time and date
function updateTimeAndDate() {
    const now = new Date();

    // Time
    const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    elements.currentTime.textContent = now.toLocaleTimeString('en-US', timeOptions);

    // Date
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    elements.currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);

    // Auto-switch theme based on time
    const hour = now.getHours();
    const isNightTime = hour < 6 || hour > 18;
    document.body.classList.toggle('night-mode', isNightTime);
}

// Load selected bookmarks from storage
async function loadSelectedBookmarks() {
    try {
        const result = await chrome.storage.local.get(['selectedBookmarks']);
        selectedBookmarks = result.selectedBookmarks || [];
        renderBookmarkBar();
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        selectedBookmarks = [];
    }
}

// Save selected bookmarks to storage
async function saveSelectedBookmarks() {
    try {
        await chrome.storage.local.set({ selectedBookmarks });
    } catch (error) {
        console.error('Error saving bookmarks:', error);
    }
}

// Render bookmark bar
function renderBookmarkBar() {
    elements.bookmarkItems.innerHTML = '';

    selectedBookmarks.forEach((bookmark, index) => {
        const bookmarkElement = createBookmarkElement(bookmark, index);
        elements.bookmarkItems.appendChild(bookmarkElement);
    });
}

// Create bookmark element
function createBookmarkElement(bookmark, index) {
    const element = document.createElement('div');
    element.className = 'bookmark-item';
    element.setAttribute('data-index', index);

    const favicon = getFaviconUrl(bookmark.url);
    element.innerHTML = `
        <img src="${favicon}" alt="${bookmark.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%23999\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>
        <span class="bookmark-title">${bookmark.title}</span>
    `;

    element.addEventListener('click', () => {
        window.open(bookmark.url, '_self');
    });

    element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, index);
    });

    return element;
}

// Get favicon URL
function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    }
}

// Show context menu
function showContextMenu(e, index) {
    currentBookmarkToRemove = index;
    elements.contextMenu.style.display = 'block';
    elements.contextMenu.style.left = e.pageX + 'px';
    elements.contextMenu.style.top = e.pageY + 'px';
}

// Hide context menu
function hideContextMenu() {
    elements.contextMenu.style.display = 'none';
    currentBookmarkToRemove = null;
}

// Load all bookmarks for modal
async function loadAllBookmarks() {
    try {
        const bookmarkTree = await chrome.bookmarks.getTree();
        const allBookmarks = [];

        function extractBookmarks(nodes) {
            nodes.forEach(node => {
                if (node.url) {
                    allBookmarks.push({
                        id: node.id,
                        title: node.title,
                        url: node.url
                    });
                }
                if (node.children) {
                    extractBookmarks(node.children);
                }
            });
        }

        extractBookmarks(bookmarkTree);
        displayBookmarksInGrid(allBookmarks);
    } catch (error) {
        console.error('Error loading bookmarks:', error);
    }
}

// Display bookmarks in grid layout
function displayBookmarksInGrid(bookmarks) {
    elements.bookmarkGrid.innerHTML = '';
    tempSelectedBookmarks = [];
    updateAddSelectedButton();

    bookmarks.forEach(bookmark => {
        const isAlreadySelected = selectedBookmarks.some(selected => selected.id === bookmark.id);
        if (isAlreadySelected) return;

        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'grid-bookmark-item';
        bookmarkElement.setAttribute('data-bookmark-id', bookmark.id);

        const favicon = getFaviconUrl(bookmark.url);
        bookmarkElement.innerHTML = `
            <div class="bookmark-checkbox">
                <input type="checkbox" id="bookmark-${bookmark.id}">
            </div>
            <img src="${favicon}" alt="${bookmark.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%23999\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>
            <div class="bookmark-info">
                <span class="bookmark-title">${bookmark.title}</span>
                <span class="bookmark-url">${bookmark.url}</span>
            </div>
        `;

        const checkbox = bookmarkElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (selectedBookmarks.length + tempSelectedBookmarks.length < 10) {
                    tempSelectedBookmarks.push(bookmark);
                    bookmarkElement.classList.add('selected');
                } else {
                    e.target.checked = false;
                    showToast('Maximum 10 bookmarks allowed');
                }
            } else {
                tempSelectedBookmarks = tempSelectedBookmarks.filter(b => b.id !== bookmark.id);
                bookmarkElement.classList.remove('selected');
            }
            updateAddSelectedButton();
        });

        bookmarkElement.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                checkbox.click();
            }
        });

        elements.bookmarkGrid.appendChild(bookmarkElement);
    });

    if (selectedBookmarks.length >= 10) {
        const limitMessage = document.createElement('div');
        limitMessage.className = 'limit-message';
        limitMessage.textContent = 'Maximum 10 bookmarks reached. Remove some to add new ones.';
        elements.bookmarkGrid.insertBefore(limitMessage, elements.bookmarkGrid.firstChild);
    }
}

// Add multiple bookmarks to bar
function addSelectedBookmarksToBar() {
    tempSelectedBookmarks.forEach(bookmark => {
        if (selectedBookmarks.length < 10) {
            selectedBookmarks.push(bookmark);
        }
    });
    saveSelectedBookmarks();
    renderBookmarkBar();
    hideBookmarkModal();
    showToast(`${tempSelectedBookmarks.length} bookmark(s) added successfully!`);
}

// Update add selected button
function updateAddSelectedButton() {
    const count = tempSelectedBookmarks.length;
    elements.addSelectedBtn.textContent = `Add Selected (${count})`;
    elements.addSelectedBtn.disabled = count === 0;
}

// Select all visible bookmarks
function selectAllBookmarks() {
    const checkboxes = elements.bookmarkGrid.querySelectorAll('input[type="checkbox"]:not(:checked)');
    const availableSlots = 10 - selectedBookmarks.length - tempSelectedBookmarks.length;

    let count = 0;
    checkboxes.forEach(checkbox => {
        if (count < availableSlots) {
            checkbox.click();
            count++;
        }
    });
}

// Search bookmarks
function searchBookmarks() {
    const searchTerm = elements.bookmarkSearch.value.toLowerCase();
    const bookmarkItems = elements.bookmarkGrid.querySelectorAll('.grid-bookmark-item');

    bookmarkItems.forEach(item => {
        const title = item.querySelector('.bookmark-title').textContent.toLowerCase();
        const url = item.querySelector('.bookmark-url').textContent.toLowerCase();

        if (title.includes(searchTerm) || url.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Theme Selection Functions
function showThemeModal() {
    elements.themeModal.style.display = 'flex';
    loadCurrentThemeSelection();
}

function hideThemeModal() {
    elements.themeModal.style.display = 'none';
}

function loadCurrentThemeSelection() {
    // Reset all checkboxes
    document.querySelectorAll('.theme-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Check currently selected themes
    selectedThemes.forEach(theme => {
        const checkbox = document.querySelector(`[data-theme="${theme}"] .theme-checkbox`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    updateSaveThemeButton();
}

function updateSaveThemeButton() {
    const checkedBoxes = document.querySelectorAll('.theme-checkbox:checked');
    elements.saveThemeBtn.disabled = checkedBoxes.length === 0;
    elements.saveThemeBtn.textContent = `Save Theme${checkedBoxes.length > 1 ? 's' : ''} (${checkedBoxes.length})`;
}

function saveSelectedTheme() {
    const checkedBoxes = document.querySelectorAll('.theme-checkbox:checked');
    selectedThemes = Array.from(checkedBoxes).map(checkbox =>
        checkbox.closest('.theme-card').getAttribute('data-theme')
    );

    saveSelectedThemes();
    updateThemeButton();
    hideThemeModal();
    showToast(`Theme${selectedThemes.length > 1 ? 's' : ''} saved successfully!`);

    // Load new background with selected theme
    loadBackgroundImage();
}

function clearTheme() {
    selectedThemes = [];
    saveSelectedThemes();
    updateThemeButton();
    hideThemeModal();
    showToast('Theme cleared! Using random images.');

    // Load new background with default theme
    loadBackgroundImage();
}

function updateThemeButton() {
    if (selectedThemes.length > 0) {
        elements.themeSelectionBtn.classList.add('theme-active');
        const themeCount = selectedThemes.length;
        elements.themeSelectionBtn.title = `${themeCount} theme${themeCount > 1 ? 's' : ''} selected`;
    } else {
        elements.themeSelectionBtn.classList.remove('theme-active');
        elements.themeSelectionBtn.title = 'Choose Theme';
    }
}

// Show toast notification
function showToast(message) {
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
    }, 3000);
}

// Download current wallpaper
async function downloadWallpaper() {
    if (!currentWallpaperUrl) {
        showToast('No wallpaper available to download');
        return;
    }

    try {
        const response = await fetch(currentWallpaperUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `wallpaper-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Wallpaper downloaded successfully!');
    } catch (error) {
        console.error('Error downloading wallpaper:', error);
        showToast('Failed to download wallpaper');
    }
}

// Remove bookmark from bar
function removeBookmarkFromBar(index) {
    selectedBookmarks.splice(index, 1);
    saveSelectedBookmarks();
    renderBookmarkBar();
    hideContextMenu();
}

// Show bookmark modal
function showBookmarkModal() {
    elements.bookmarkModal.style.display = 'flex';
    loadAllBookmarks();
}

// Hide bookmark modal
function hideBookmarkModal() {
    elements.bookmarkModal.style.display = 'none';
}

// Hide loading screen
function hideLoadingScreen() {
    setTimeout(() => {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Add bookmark button
    elements.addBookmarkBtn.addEventListener('click', showBookmarkModal);

    // Close modal
    elements.closeBtn.addEventListener('click', hideBookmarkModal);

    // Close modal on backdrop click
    elements.bookmarkModal.addEventListener('click', (e) => {
        if (e.target === elements.bookmarkModal) {
            hideBookmarkModal();
        }
    });

    // Modal action buttons
    elements.selectAllBtn.addEventListener('click', selectAllBookmarks);
    elements.addSelectedBtn.addEventListener('click', addSelectedBookmarksToBar);

    // Search functionality
    elements.bookmarkSearch.addEventListener('input', searchBookmarks);

    // Download button
    elements.downloadBtn.addEventListener('click', downloadWallpaper);

    // Theme selection events
    elements.themeSelectionBtn.addEventListener('click', showThemeModal);
    elements.themeCloseBtn.addEventListener('click', hideThemeModal);
    elements.saveThemeBtn.addEventListener('click', saveSelectedTheme);
    elements.clearThemeBtn.addEventListener('click', clearTheme);

    // Theme modal backdrop click
    elements.themeModal.addEventListener('click', (e) => {
        if (e.target === elements.themeModal) {
            hideThemeModal();
        }
    });

    // Theme checkbox change events
    document.querySelectorAll('.theme-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSaveThemeButton);
    });

    // Theme card click events (to toggle checkbox)
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const checkbox = card.querySelector('.theme-checkbox');
                checkbox.checked = !checkbox.checked;
                updateSaveThemeButton();
            }
        });
    });

    // Context menu actions
    elements.removeBookmark.addEventListener('click', () => {
        if (currentBookmarkToRemove !== null) {
            removeBookmarkFromBar(currentBookmarkToRemove);
        }
    });

    // Hide context menu on click outside
    document.addEventListener('click', hideContextMenu);

    // Prevent context menu from closing when clicking on it
    elements.contextMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideBookmarkModal();
            hideContextMenu();
            hideThemeModal();
        }
    });
}

// Utility function to capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Search input functionality
document.getElementById("search-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        const query = this.value.trim();
        if (query) {
            const engine = document.getElementById("search-engine").value;
            window.open(engine + encodeURIComponent(query), "_blank");
            this.value = ""; // clear input after search
        }
    }
});
