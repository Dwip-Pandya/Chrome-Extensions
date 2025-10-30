// LockVault Password Manager - Dashboard JavaScript

// State Management
// State Management
let credentials = [];
let logs = [];
let allTags = [];
let currentFilter = 'all';
let currentSort = 'az';
let editingId = null;
let selectedTags = [];


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    renderCredentials();
    renderTags();
    updateCounts();
    applyTheme();
});

// Load data from Chrome storage
function loadData() {
    chrome.storage.local.get(['credentials', 'logs', 'theme', 'tags'], (result) => {
        credentials = result.credentials || [];
        logs = result.logs || [];
        allTags = result.tags || [];

        // Apply saved theme
        if (result.theme) {
            document.body.classList.toggle('light-mode', result.theme === 'light');
            updateThemeButton(result.theme);
        }

        renderCredentials();
        renderTags();
        updateCounts();
    });
}

// Save tags to storage
function saveTags() {
    chrome.storage.local.set({ tags: allTags });
}

// Save credentials to storage
function saveCredentials() {
    chrome.storage.local.set({ credentials }, () => {
        renderCredentials();
        renderTags();
        updateCounts();
    });
}

// Save logs to storage
function saveLogs() {
    chrome.storage.local.set({ logs });
}

// Add log entry
function addLog(action, accountName, tags = []) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        accountName: accountName || 'Untitled',
        tags: tags.join(', '),
        readableTime: new Date().toLocaleString()
    };

    logs.unshift(logEntry);
    saveLogs();
}

// Get all existing tags
function getAllTags() {
    const tagSet = new Set(allTags || []);
    credentials.forEach(c => {
        (c.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
}


// Render tag selector
function renderTagSelector() {
    const tagsContainer = document.getElementById('tagsContainer');
    const existingTags = getAllTags();

    tagsContainer.innerHTML = `
        <div class="tag-selector">
            <div class="selected-tags" id="selectedTagsDisplay"></div>
            <div class="tag-input-group">
                <select id="tagDropdown" class="tag-dropdown">
                    <option value="">Select existing tag...</option>
                    ${existingTags.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join('')}
                </select>
                <input type="text" id="newTagInput" placeholder="Or type new tag..." class="new-tag-input">
                <button type="button" class="add-tag-btn" id="addTagBtn">+ Add</button>
            </div>
        </div>
    `;

    updateSelectedTagsDisplay();

    // Add event listener for dropdown
    document.getElementById('tagDropdown').addEventListener('change', (e) => {
        if (e.target.value) {
            addTagToSelection(e.target.value);
            e.target.value = '';
        }
    });

    // Add event listener for Enter key on new tag input
    document.getElementById('newTagInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagToSelection();
        }
    });

    // Add event listener for add button
    document.getElementById('addTagBtn').addEventListener('click', (e) => {
        e.preventDefault();
        addTagToSelection();
    });
}


// Add tag to selection
function addTagToSelection(tag = null) {
    const newTagInput = document.getElementById('newTagInput');
    const tagToAdd = (tag || (newTagInput ? newTagInput.value.trim() : '')).trim();
    if (!tagToAdd) return;

    // Add to selected tags
    if (!selectedTags.includes(tagToAdd)) {
        selectedTags.push(tagToAdd);
        updateSelectedTagsDisplay();
    }

    // Add to global tag pool if missing
    if (!allTags.includes(tagToAdd)) {
        allTags.push(tagToAdd);
        allTags.sort();
        saveTags();           // persist tags
    }

    // Re-render dropdown and sidebar so the new tag shows immediately
    renderTagSelector();
    renderTags();

    // Clear text input if it was typed manually
    if (!tag && newTagInput) newTagInput.value = '';
}



// Remove tag from selection
function removeTagFromSelection(tag) {
    selectedTags = selectedTags.filter(t => t !== tag);
    updateSelectedTagsDisplay();
}

// Update selected tags display
function updateSelectedTagsDisplay() {
    const display = document.getElementById('selectedTagsDisplay');
    if (selectedTags.length === 0) {
        display.innerHTML = '<span class="no-tags-text">No tags selected</span>';
    } else {
        display.innerHTML = selectedTags.map(tag => `
            <span class="selected-tag-badge">
                ${escapeHtml(tag)}
                <button type="button" class="remove-tag-btn" onclick="removeTagFromSelection('${escapeHtml(tag).replace(/'/g, "\\'")}')">×</button>
            </span>
        `).join('');
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Add New Button
    document.getElementById('addNewBtn').addEventListener('click', openAddModal);

    // Modal Controls
    document.getElementById('closeModal').addEventListener('click', closeCredentialModal);
    document.getElementById('cancelBtn').addEventListener('click', closeCredentialModal);

    // Form Submit
    document.getElementById('credentialForm').addEventListener('submit', handleFormSubmit);

    // Password Toggle
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Sort
    document.getElementById('sortSelect').addEventListener('change', handleSort);

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', exportBackup);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importBackup);

    // Delete Modal
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Logs Modal
    document.getElementById('viewLogsBtn').addEventListener('click', openLogsModal);
    document.getElementById('closeLogsModal').addEventListener('click', closeLogsModal);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    document.getElementById('downloadLogsBtn').addEventListener('click', downloadLogs);

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Open Add Modal
function openAddModal() {
    editingId = null;
    selectedTags = [];
    document.getElementById('modalTitle').textContent = 'Add New Credential';
    document.getElementById('credentialForm').reset();
    document.getElementById('credentialId').value = '';
    document.getElementById('saveBtn').textContent = 'Save Credential';
    document.getElementById('credentialModal').style.display = 'flex';
    renderTagSelector();
}

// Open Edit Modal
function openEditModal(id) {
    const credential = credentials.find(c => c.id === id);
    if (!credential) return;

    editingId = id;
    selectedTags = [...credential.tags];
    document.getElementById('modalTitle').textContent = 'Edit Credential';
    document.getElementById('credentialId').value = id;
    document.getElementById('accountName').value = credential.accountName || '';
    document.getElementById('websiteUrl').value = credential.url || '';
    document.getElementById('username').value = credential.username || '';
    document.getElementById('password').value = credential.password || '';
    document.getElementById('saveBtn').textContent = 'Update Credential';
    document.getElementById('credentialModal').style.display = 'flex';
    renderTagSelector();
}

// Close Credential Modal
function closeCredentialModal() {
    document.getElementById('credentialModal').style.display = 'none';
    document.getElementById('credentialForm').reset();
    editingId = null;
    selectedTags = [];
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();

    const accountName = document.getElementById('accountName').value.trim();
    const url = document.getElementById('websiteUrl').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (editingId) {
        // Update existing credential
        const index = credentials.findIndex(c => c.id === editingId);
        if (index !== -1) {
            credentials[index] = {
                ...credentials[index],
                accountName: accountName || 'Untitled',
                url: url || '',
                username: username || '',
                password: password || '',
                tags: selectedTags,
                updatedAt: new Date().toISOString()
            };
            addLog('UPDATE', accountName || 'Untitled', selectedTags);
        }
    } else {
        // Add new credential
        const newCredential = {
            id: generateId(),
            accountName: accountName || 'Untitled',
            url: url || '',
            username: username || '',
            password: password || '',
            tags: selectedTags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        credentials.push(newCredential);
        addLog('ADD', accountName || 'Untitled', selectedTags);
    }

    // ensure all selectedTags are in the global tag pool
    selectedTags.forEach(t => {
        if (!allTags.includes(t)) allTags.push(t);
    });
    if (allTags.length) {
        allTags.sort();
        saveTags();
    }


    saveCredentials();
    closeCredentialModal();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Render Credentials
function renderCredentials() {
    const grid = document.getElementById('credentialsGrid');
    const emptyState = document.getElementById('emptyState');

    let filteredCredentials = [...credentials];

    // Apply tag filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'undefined') {
            filteredCredentials = filteredCredentials.filter(c => c.tags.length === 0);
        } else {
            filteredCredentials = filteredCredentials.filter(c =>
                c.tags.includes(currentFilter)
            );
        }
    }

    // Apply search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredCredentials = filteredCredentials.filter(c =>
            (c.accountName || '').toLowerCase().includes(searchTerm) ||
            (c.url || '').toLowerCase().includes(searchTerm) ||
            (c.username || '').toLowerCase().includes(searchTerm) ||
            c.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // Apply sorting
    filteredCredentials.sort((a, b) => {
        switch (currentSort) {
            case 'az':
                return (a.accountName || '').localeCompare(b.accountName || '');
            case 'za':
                return (b.accountName || '').localeCompare(a.accountName || '');
            case 'recent':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'updated':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            default:
                return 0;
        }
    });

    // Show/hide empty state
    if (filteredCredentials.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
    }

    // Render credential cards
    grid.innerHTML = filteredCredentials.map(credential => `
        <div class="credential-card" data-id="${credential.id}">
            <div class="credential-header">
                <h3>${escapeHtml(credential.accountName || 'Untitled')}</h3>
                <div class="credential-actions">
                    <button class="icon-btn edit-btn" data-id="${credential.id}" title="Edit">
                        ✏️
                    </button>
                    <button class="icon-btn delete-btn" data-id="${credential.id}" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="credential-info">
                ${credential.url ? `
                <div class="info-row">
                    <span class="label">URL:</span>
                    <a href="${escapeHtml(credential.url)}" target="_blank" class="url-link">
                        ${escapeHtml(credential.url)}
                    </a>
                </div>
                ` : ''}
                
                ${credential.username ? `
                <div class="info-row">
                    <span class="label">Username:</span>
                    <span class="value">${escapeHtml(credential.username)}</span>
                    <button class="copy-btn" data-text="${escapeHtml(credential.username)}" data-type="username" title="Copy username">
                        📋
                    </button>
                </div>
                ` : ''}
                
                ${credential.password ? `
                <div class="info-row">
                    <span class="label">Password:</span>
                    <span class="value password-hidden" id="pwd-${credential.id}">••••••••</span>
                    <button class="copy-btn" data-text="${escapeHtml(credential.password)}" data-type="password" title="Copy password">
                        📋
                    </button>
                    <button class="toggle-btn" data-id="${credential.id}" title="Show/Hide password">
                        👁️
                    </button>
                </div>
                ` : ''}
            </div>
            
            ${credential.tags.length > 0 ? `
                <div class="credential-tags">
                    ${credential.tags.map(tag => `
                        <span class="tag-badge filter-tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="credential-footer">
                <small>Updated: ${new Date(credential.updatedAt).toLocaleString()}</small>
            </div>
        </div>
    `).join('');

    // Add event listeners to dynamically created buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            openEditModal(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            openDeleteModal(id);
        });
    });

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = btn.getAttribute('data-text');
            const type = btn.getAttribute('data-type');
            copyToClipboard(text, type);
        });
    });

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            togglePassword(id);
        });
    });

    document.querySelectorAll('.filter-tag').forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = badge.getAttribute('data-tag');
            filterByTag(tag);
        });
    });
}

// Render Tags
// Render Tags (sidebar)
function renderTags() {
    const tagsList = document.getElementById('tagsList');

    const existingTags = getAllTags(); // uses merged set now

    const customTagsHtml = existingTags.map(tag => {
        const count = credentials.filter(c => (c.tags || []).includes(tag)).length;
        return `
            <button class="tag-item" data-tag="${escapeHtml(tag)}">
                <span class="tag-name">${escapeHtml(tag)}</span>
                <span class="tag-count">${count}</span>
            </button>
        `;
    }).join('');

    tagsList.innerHTML = `
        <button class="tag-item ${currentFilter === 'all' ? 'active' : ''}" data-tag="all">
            <span class="tag-name">All Credentials</span>
            <span class="tag-count" id="countAll">${credentials.length}</span>
        </button>
        <button class="tag-item ${currentFilter === 'undefined' ? 'active' : ''}" data-tag="undefined">
            <span class="tag-name">Undefined</span>
            <span class="tag-count" id="countUndefined">${credentials.filter(c => (c.tags || []).length === 0).length}</span>
        </button>
        ${customTagsHtml}
    `;

    // Add click listeners to tag items
    document.querySelectorAll('.tag-item').forEach(item => {
        item.addEventListener('click', () => {
            const tag = item.getAttribute('data-tag');
            filterByTag(tag);
        });
    });
}


// Update Counts
function updateCounts() {
    document.getElementById('countAll').textContent = credentials.length;
    document.getElementById('countUndefined').textContent = credentials.filter(c => c.tags.length === 0).length;
}

// Filter by Tag
function filterByTag(tag) {
    currentFilter = tag;

    // Update active state
    document.querySelectorAll('.tag-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tag') === tag);
    });

    renderCredentials();
}

// Handle Search
function handleSearch() {
    renderCredentials();
}

// Handle Sort
function handleSort(e) {
    currentSort = e.target.value;
    renderCredentials();
}

// Toggle Password Visibility in Card
function togglePassword(id) {
    const passwordEl = document.getElementById(`pwd-${id}`);
    const credential = credentials.find(c => c.id === id);

    if (passwordEl.classList.contains('password-hidden')) {
        passwordEl.textContent = credential.password || '';
        passwordEl.classList.remove('password-hidden');
    } else {
        passwordEl.textContent = '••••••••';
        passwordEl.classList.add('password-hidden');
    }
}

// Copy to Clipboard
function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Open Delete Modal
function openDeleteModal(id) {
    const credential = credentials.find(c => c.id === id);
    if (!credential) return;

    document.getElementById('deleteAccountName').textContent = credential.accountName || 'Untitled';
    document.getElementById('deleteModal').style.display = 'flex';
    document.getElementById('deleteModal').setAttribute('data-delete-id', id);
}

// Close Delete Modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Confirm Delete
function confirmDelete() {
    const id = document.getElementById('deleteModal').getAttribute('data-delete-id');
    const credential = credentials.find(c => c.id === id);

    if (credential) {
        addLog('DELETE', credential.accountName || 'Untitled', credential.tags);
        credentials = credentials.filter(c => c.id !== id);
        saveCredentials();
        showNotification('Credential deleted successfully');
    }

    closeDeleteModal();
}

// Export Backup
function exportBackup() {
    const data = {
        credentials,
        logs,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lockvault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Backup exported successfully');
}

// Import Backup
function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (data.credentials && Array.isArray(data.credentials)) {
                credentials = data.credentials;
                logs = data.logs || [];

                saveCredentials();
                saveLogs();

                addLog('IMPORT', `${credentials.length} credentials imported`, []);
                showNotification('Backup imported successfully');
            } else {
                showNotification('Invalid backup file format');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing backup');
        }
    };

    reader.readAsText(file);
    e.target.value = '';
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');

    const theme = body.classList.contains('light-mode') ? 'light' : 'dark';
    chrome.storage.local.set({ theme });
    updateThemeButton(theme);
}

function updateThemeButton(theme) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');

    if (theme === 'light') {
        icon.textContent = '🌙';
        text.textContent = 'Dark Mode';
    } else {
        icon.textContent = '☀️';
        text.textContent = 'Light Mode';
    }
}

function applyTheme() {
    chrome.storage.local.get(['theme'], (result) => {
        if (result.theme === 'light') {
            document.body.classList.add('light-mode');
        }
        updateThemeButton(result.theme || 'dark');
    });
}

// Logs Management
function openLogsModal() {
    document.getElementById('logsModal').style.display = 'flex';
    displayLogs();
}

function closeLogsModal() {
    document.getElementById('logsModal').style.display = 'none';
}

function displayLogs() {
    const logsDisplay = document.getElementById('logsDisplay');

    if (logs.length === 0) {
        logsDisplay.textContent = 'No activity logs yet.';
        return;
    }

    const logsText = logs.map(log => {
        return `[${log.readableTime}] ${log.action} - ${log.accountName}${log.tags ? ' | Tags: ' + log.tags : ''}`;
    }).join('\n');

    logsDisplay.textContent = logsText;
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
        logs = [];
        saveLogs();
        displayLogs();
        showNotification('Logs cleared successfully');
    }
}

function downloadLogs() {
    const logsText = logs.map(log => {
        return `[${log.readableTime}] ${log.action} - ${log.accountName}${log.tags ? ' | Tags: ' + log.tags : ''}`;
    }).join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lockvault-logs-${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Logs downloaded successfully');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.addTagToSelection = addTagToSelection;
window.removeTagFromSelection = removeTagFromSelection;