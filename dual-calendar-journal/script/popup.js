class CalendarLogger {
    constructor() {
        this.workLogKey = 'workCalendarLog';
        this.personalLogKey = 'personalCalendarLog';
    }

    logAction(action, entryId, calendar, details) {
        const timestamp = new Date().toISOString();
        const dateKey = timestamp.split('T')[0];

        const logEntry = {
            timestamp,
            action,
            entryId,
            calendar,
            details
        };

        const logKey = calendar === 'work' ? this.workLogKey : this.personalLogKey;
        const logs = this.getLogs(logKey);

        if (!logs[dateKey]) {
            logs[dateKey] = [];
        }

        logs[dateKey].push(logEntry);
        this.saveLogs(logKey, logs);
    }

    getLogs(logKey) {
        const stored = localStorage.getItem(logKey);
        return stored ? JSON.parse(stored) : {};
    }

    saveLogs(logKey, logs) {
        localStorage.setItem(logKey, JSON.stringify(logs));
    }

    getAllLogs() {
        return {
            work: this.getLogs(this.workLogKey),
            personal: this.getLogs(this.personalLogKey)
        };
    }

    getLogsByDate(date) {
        const dateKey = typeof date === 'string' ? date : this.formatDate(date);
        const workLogs = this.getLogs(this.workLogKey);
        const personalLogs = this.getLogs(this.personalLogKey);

        return {
            work: workLogs[dateKey] || [],
            personal: personalLogs[dateKey] || []
        };
    }

    getLogStatistics() {
        const logs = this.getAllLogs();
        let totalActions = 0;

        Object.values(logs.work).forEach(dayLogs => {
            totalActions += dayLogs.length;
        });

        Object.values(logs.personal).forEach(dayLogs => {
            totalActions += dayLogs.length;
        });

        return { totalActions };
    }

    exportLogs(calendar = null) {
        const logs = calendar ?
            { [calendar]: this.getLogs(calendar === 'work' ? this.workLogKey : this.personalLogKey) } :
            this.getAllLogs();

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            logs: logs
        };

        return JSON.stringify(exportData, null, 2);
    }

    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Main Calendar Class
class DualCalendarJournal {
    constructor() {
        this.currentDate = new Date();
        this.currentMode = 'work';
        this.selectedDate = null;
        this.isPersonalLocked = true;
        this.selectedMood = null;
        this.selectedTags = [];

        this.workTags = [
            'meeting', 'project', 'deadline', 'review', 'planning',
            'client', 'presentation', 'research', 'development', 'testing'
        ];

        this.personalTags = [
            'mood', 'gratitude', 'reflection', 'goal', 'memory',
            'family', 'friends', 'health', 'hobby', 'travel'
        ];

        this.logger = new CalendarLogger();
        this.init();
    }

    init() {
        this.loadTheme();
        this.loadSettings();
        this.setupEventListeners();
        this.checkPersonalAccess();
        this.renderCalendar();
        this.updateStats();
    }

    setupEventListeners() {
        // Calendar mode toggle
        document.getElementById('workCalendarBtn').addEventListener('click', () => {
            this.switchMode('work');
        });

        document.getElementById('personalCalendarBtn').addEventListener('click', () => {
            this.switchMode('personal');
        });

        // Navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
            this.updateStats();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
            this.updateStats();
        });

        // Header buttons
        document.getElementById('logsBtn').addEventListener('click', () => {
            this.showLogsModal();
        });

        document.getElementById('themeBtn').addEventListener('click', () => {
            this.showThemeModal();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal('entryModal');
        });

        document.getElementById('closeThemeModal').addEventListener('click', () => {
            this.hideModal('themeModal');
        });

        document.getElementById('closeLogsModal').addEventListener('click', () => {
            this.hideModal('logsModal');
        });

        document.getElementById('cancelEntry').addEventListener('click', () => {
            this.hideModal('entryModal');
        });

        document.getElementById('saveEntry').addEventListener('click', () => {
            this.saveEntry();
        });

        document.getElementById('deleteEntry').addEventListener('click', () => {
            this.deleteEntry();
        });

        // Password modal
        document.getElementById('cancelPassword').addEventListener('click', () => {
            this.hideModal('passwordModal');
            this.switchMode('work');
        });

        document.getElementById('unlockCalendar').addEventListener('click', () => {
            this.unlockPersonalCalendar();
        });

        document.getElementById('setPasswordBtn').addEventListener('click', () => {
            this.setNewPassword();
        });

        // Tag system
        document.getElementById('addTagBtn').addEventListener('click', () => {
            this.addCustomTag();
        });

        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCustomTag();
            }
        });

        // Mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectMood(btn.dataset.mood);
            });
        });

        // Theme options
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyTheme(btn.dataset.theme);
            });
        });

        // Password input enter key
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.unlockPersonalCalendar();
            }
        });

        // Logs functionality
        document.getElementById('logCalendarFilter').addEventListener('change', () => {
            this.updateLogsDisplay();
        });

        document.getElementById('logActionFilter').addEventListener('change', () => {
            this.updateLogsDisplay();
        });

        document.getElementById('logDateFilter').addEventListener('change', () => {
            this.updateLogsDisplay();
        });

        document.getElementById('exportLogsBtn').addEventListener('click', () => {
            this.exportLogs();
        });
    }

    switchMode(mode) {
        if (mode === 'personal' && this.isPersonalLocked) {
            this.showPasswordModal();
            return;
        }

        this.currentMode = mode;

        // Update UI
        document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode + 'CalendarBtn').classList.add('active');

        // Update theme class
        if (mode === 'personal') {
            document.body.classList.add('personal-mode');
        } else {
            document.body.classList.remove('personal-mode');
        }

        this.renderCalendar();
        this.updateStats();
    }

    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        document.getElementById('monthYear').textContent =
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        const daysContainer = document.getElementById('calendarDays');
        daysContainer.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const today = new Date();

        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            const prevMonthDay = new Date(firstDay);
            prevMonthDay.setDate(prevMonthDay.getDate() - (firstDay.getDay() - i));
            dayElement.textContent = prevMonthDay.getDate();
            daysContainer.appendChild(dayElement);
        }

        // Add days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);

            // Check if it's today
            if (this.isSameDay(currentDayDate, today)) {
                dayElement.classList.add('today');
            }

            // Check if day has entries
            if (this.hasEntry(currentDayDate)) {
                dayElement.classList.add('has-entry');
            }

            dayElement.addEventListener('click', () => {
                this.selectDate(currentDayDate);
            });

            daysContainer.appendChild(dayElement);
        }

        // Add empty cells for days after last day of month
        const remainingCells = 42 - (firstDay.getDay() + lastDay.getDate());
        for (let day = 1; day <= remainingCells && remainingCells < 7; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            daysContainer.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        this.showEntryModal(date);
    }

    showEntryModal(date) {
        const modal = document.getElementById('entryModal');
        const entry = this.getEntry(date);

        // Set modal title
        const modalTitle = document.getElementById('modalTitle');
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        modalTitle.textContent = entry ? `Edit Entry - ${dateStr}` : `Add Entry - ${dateStr}`;

        // Show/hide mood selector based on mode
        const moodSelector = document.getElementById('moodSelector');
        if (this.currentMode === 'personal') {
            moodSelector.style.display = 'block';
        } else {
            moodSelector.style.display = 'none';
        }

        // Populate form
        document.getElementById('entryTitle').value = entry ? entry.title || '' : '';
        document.getElementById('entrySummary').value = entry ? entry.summary || '' : '';

        // Reset selections
        this.selectedMood = entry ? entry.mood : null;
        this.selectedTags = entry ? [...entry.tags] : [];

        // Update mood display
        this.updateMoodDisplay();

        // Show suggested tags
        this.showSuggestedTags();
        this.updateSelectedTags();

        // Show/hide delete button
        const deleteBtn = document.getElementById('deleteEntry');
        if (entry) {
            deleteBtn.style.display = 'block';
        } else {
            deleteBtn.style.display = 'none';
        }

        this.showModal('entryModal');
    }

    showPasswordModal() {
        document.getElementById('passwordInput').value = '';
        this.showModal('passwordModal');
    }

    showThemeModal() {
        // Highlight current theme
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
        });

        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const activeBtn = document.querySelector(`[data-theme="${currentTheme}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.showModal('themeModal');
    }

    showLogsModal() {
        this.updateLogsDisplay();
        this.updateLogsStats();
        this.showModal('logsModal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    unlockPersonalCalendar() {
        const password = document.getElementById('passwordInput').value;
        const storedPassword = this.getStoredPassword();

        if (!storedPassword) {
            // No password set, create one
            if (password.length < 4) {
                alert('Password must be at least 4 characters long.');
                return;
            }
            this.setPassword(password);
            this.isPersonalLocked = false;
            this.hideModal('passwordModal');
            this.switchMode('personal');
        } else {
            // Check password
            if (this.verifyPassword(password)) {
                this.isPersonalLocked = false;
                this.hideModal('passwordModal');
                this.switchMode('personal');
            } else {
                alert('Incorrect password.');
                document.getElementById('passwordInput').value = '';
            }
        }
    }

    setNewPassword() {
        const newPassword = prompt('Enter new password (at least 4 characters):');
        if (newPassword && newPassword.length >= 4) {
            this.setPassword(newPassword);
            alert('Password updated successfully!');
        } else if (newPassword !== null) {
            alert('Password must be at least 4 characters long.');
        }
    }

    saveEntry() {
        const title = document.getElementById('entryTitle').value.trim();
        const summary = document.getElementById('entrySummary').value.trim();

        if (!summary) {
            alert('Please enter a summary.');
            return;
        }

        const existingEntry = this.getEntry(this.selectedDate);
        const entryId = existingEntry ? existingEntry.id : this.generateEntryId();

        const entry = {
            id: entryId,
            title,
            summary,
            tags: this.selectedTags,
            timestamp: new Date().toISOString()
        };

        if (this.currentMode === 'personal') {
            entry.mood = this.selectedMood;
        }

        // Log the action
        if (existingEntry) {
            // This is an edit operation
            this.logger.logAction('edit', entryId, this.currentMode, {
                changedFields: this.getChangedFields(existingEntry, entry),
                oldEntry: this.sanitizeEntryForLog(existingEntry),
                newEntry: this.sanitizeEntryForLog(entry)
            });
        } else {
            // This is a create operation
            this.logger.logAction('create', entryId, this.currentMode, this.sanitizeEntryForLog(entry));
        }

        this.setEntry(this.selectedDate, entry);
        this.hideModal('entryModal');
        this.renderCalendar();
        this.updateStats();
    }

    deleteEntry() {
        if (confirm('Are you sure you want to delete this entry?')) {
            const entry = this.getEntry(this.selectedDate);
            if (entry) {
                // Log the delete action before removing
                this.logger.logAction('delete', entry.id, this.currentMode, this.sanitizeEntryForLog(entry));
            }

            this.removeEntry(this.selectedDate);
            this.hideModal('entryModal');
            this.renderCalendar();
            this.updateStats();
        }
    }

    selectMood(mood) {
        this.selectedMood = mood;
        this.updateMoodDisplay();
    }

    updateMoodDisplay() {
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mood === this.selectedMood) {
                btn.classList.add('active');
            }
        });
    }

    showSuggestedTags() {
        const container = document.getElementById('suggestedTags');
        const tags = this.currentMode === 'work' ? this.workTags : this.personalTags;

        container.innerHTML = '';
        tags.forEach(tag => {
            if (!this.selectedTags.includes(tag)) {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = '#' + tag;
                tagElement.addEventListener('click', () => {
                    this.addTag(tag);
                });
                container.appendChild(tagElement);
            }
        });
    }

    addCustomTag() {
        const input = document.getElementById('tagInput');
        const tag = input.value.trim().toLowerCase().replace('#', '');

        if (tag && !this.selectedTags.includes(tag)) {
            this.addTag(tag);
            input.value = '';
        }
    }

    addTag(tag) {
        if (!this.selectedTags.includes(tag)) {
            this.selectedTags.push(tag);
            this.updateSelectedTags();
            this.showSuggestedTags();
        }
    }

    removeTag(tag) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
        this.updateSelectedTags();
        this.showSuggestedTags();
    }

    updateSelectedTags() {
        const container = document.getElementById('selectedTags');
        container.innerHTML = '';

        this.selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = '#' + tag;
            tagElement.addEventListener('click', () => {
                this.removeTag(tag);
            });
            container.appendChild(tagElement);
        });
    }

    applyTheme(theme) {
        if (theme === 'random') {
            const themes = ['light', 'dark', 'blue', 'green', 'purple'];
            theme = themes[Math.floor(Math.random() * themes.length)];
        }

        document.body.setAttribute('data-theme', theme);
        this.saveTheme(theme);
        this.hideModal('themeModal');

        // Update active theme button
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`)?.classList.add('active');
    }

    updateStats() {
        const entries = this.getAllEntries();
        const currentMonthEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === this.currentDate.getMonth() &&
                entryDate.getFullYear() === this.currentDate.getFullYear();
        });

        const count = currentMonthEntries.length;
        document.getElementById('monthStats').textContent =
            `${count} ${count === 1 ? 'entry' : 'entries'}`;
    }

    updateLogsDisplay() {
        const calendarFilter = document.getElementById('logCalendarFilter').value;
        const actionFilter = document.getElementById('logActionFilter').value;
        const dateFilter = document.getElementById('logDateFilter').value;

        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = '';

        const allLogs = this.logger.getAllLogs();
        const combinedLogs = [];

        // Combine logs from both calendars
        Object.entries(allLogs.work).forEach(([date, dayLogs]) => {
            dayLogs.forEach(log => {
                combinedLogs.push({ ...log, date });
            });
        });

        Object.entries(allLogs.personal).forEach(([date, dayLogs]) => {
            dayLogs.forEach(log => {
                combinedLogs.push({ ...log, date });
            });
        });

        // Sort by timestamp (newest first)
        combinedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply filters
        const filteredLogs = combinedLogs.filter(log => {
            if (calendarFilter !== 'all' && log.calendar !== calendarFilter) return false;
            if (actionFilter !== 'all' && log.action !== actionFilter) return false;
            if (dateFilter && log.date !== dateFilter) return false;
            return true;
        });

        // Display logs
        filteredLogs.forEach(log => {
            const logElement = this.createLogElement(log);
            logsContainer.appendChild(logElement);
        });

        if (filteredLogs.length === 0) {
            logsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No logs found matching the current filters.</p>';
        }
    }

    createLogElement(log) {
        const logDiv = document.createElement('div');
        logDiv.className = `log-entry ${log.calendar}`;

        const timestamp = new Date(log.timestamp);
        const timeStr = timestamp.toLocaleString();

        let detailsHtml = '';

        if (log.action === 'create') {
            detailsHtml = this.formatLogDetails(log.details);
        } else if (log.action === 'edit') {
            detailsHtml = this.formatEditDetails(log.details);
        } else if (log.action === 'delete') {
            detailsHtml = this.formatLogDetails(log.details);
        }

        logDiv.innerHTML = `
                    <div class="log-header">
                        <div>
                            <span class="log-action ${log.action}">${log.action}</span>
                            <span style="margin-left: 8px; font-size: 11px; color: var(--text-secondary);">
                                ${log.calendar.toUpperCase()} • ${log.entryId}
                            </span>
                        </div>
                        <span class="log-timestamp">${timeStr}</span>
                    </div>
                    <div class="log-details">
                        ${detailsHtml}
                    </div>
                `;

        return logDiv;
    }

    formatLogDetails(details) {
        let html = '';

        if (details.title) {
            html += `<div class="log-title">${details.title}</div>`;
        }

        if (details.summary) {
            html += `<div class="log-summary">${details.summary}</div>`;
        }

        if (details.tags && details.tags.length > 0) {
            html += `<div class="log-tags">`;
            details.tags.forEach(tag => {
                html += `<span class="log-tag">#${tag}</span>`;
            });
            html += `</div>`;
        }

        if (details.mood) {
            html += `<span class="log-mood">${details.mood}</span>`;
        }

        return html;
    }

    formatEditDetails(details) {
        let html = '';

        if (details.newEntry) {
            html += this.formatLogDetails(details.newEntry);
        }

        if (details.changedFields && details.changedFields.length > 0) {
            html += `<div class="log-changes">
                        <strong>Changed fields:</strong> 
                        ${details.changedFields.map(field => `<span class="change-field">${field}</span>`).join(', ')}
                    </div>`;
        }

        return html;
    }

    updateLogsStats() {
        const stats = this.logger.getLogStatistics();
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = this.logger.getLogsByDate(today);
        const todayCount = todayLogs.work.length + todayLogs.personal.length;

        document.getElementById('totalActions').textContent = stats.totalActions;
        document.getElementById('todayActions').textContent = todayCount;
    }

    exportLogs() {
        const calendarFilter = document.getElementById('logCalendarFilter').value;
        const calendar = calendarFilter === 'all' ? null : calendarFilter;

        const exportData = this.logger.exportLogs(calendar);

        // Create download link
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-logs-${calendar || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Logs exported successfully!');
    }

    showSettings() {
        alert('Settings panel will be available in future updates!');
    }

    checkPersonalAccess() {
        const hasPassword = this.getStoredPassword();
        this.isPersonalLocked = !!hasPassword;
    }

    // Storage methods
    getStorageKey() {
        return this.currentMode === 'work' ? 'workCalendarEntries' : 'personalCalendarEntries';
    }

    getDateKey(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    hasEntry(date) {
        const entries = this.getStoredEntries();
        const dateKey = this.getDateKey(date);
        return entries.hasOwnProperty(dateKey);
    }

    getEntry(date) {
        const entries = this.getStoredEntries();
        const dateKey = this.getDateKey(date);
        return entries[dateKey];
    }

    setEntry(date, entry) {
        const entries = this.getStoredEntries();
        const dateKey = this.getDateKey(date);

        // Ensure entry has an ID
        if (!entry.id) {
            entry.id = this.generateEntryId();
        }

        entries[dateKey] = entry;
        this.saveStoredEntries(entries);
    }

    removeEntry(date) {
        const entries = this.getStoredEntries();
        const dateKey = this.getDateKey(date);
        delete entries[dateKey];
        this.saveStoredEntries(entries);
    }

    getAllEntries() {
        const entries = this.getStoredEntries();
        return Object.keys(entries).map(dateKey => ({
            date: dateKey,
            ...entries[dateKey]
        }));
    }

    getStoredEntries() {
        const key = this.getStorageKey();
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    }

    saveStoredEntries(entries) {
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(entries));
    }

    // Password methods
    setPassword(password) {
        const encrypted = btoa(password); // Simple encoding - in production use proper encryption
        localStorage.setItem('personalCalendarPassword', encrypted);
    }

    getStoredPassword() {
        return localStorage.getItem('personalCalendarPassword');
    }

    verifyPassword(password) {
        const stored = this.getStoredPassword();
        if (!stored) return false;
        const decrypted = atob(stored);
        return decrypted === password;
    }

    // Theme methods
    loadTheme() {
        const theme = localStorage.getItem('calendarTheme') || 'light';
        document.body.setAttribute('data-theme', theme);
    }

    saveTheme(theme) {
        localStorage.setItem('calendarTheme', theme);
    }

    loadSettings() {
        // Load any other settings from localStorage
    }

    // Utility methods
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    generateEntryId() {
        return 'entry-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    getChangedFields(oldEntry, newEntry) {
        const changedFields = [];

        if (oldEntry.title !== newEntry.title) changedFields.push('title');
        if (oldEntry.summary !== newEntry.summary) changedFields.push('summary');
        if (JSON.stringify(oldEntry.tags) !== JSON.stringify(newEntry.tags)) changedFields.push('tags');
        if (oldEntry.mood !== newEntry.mood) changedFields.push('mood');

        return changedFields;
    }

    sanitizeEntryForLog(entry) {
        // Remove sensitive internal data, keep only what should be logged
        const sanitized = {
            title: entry.title || '',
            summary: entry.summary || '',
            tags: [...(entry.tags || [])],
            timestamp: entry.timestamp
        };

        if (entry.mood) {
            sanitized.mood = entry.mood;
        }

        return sanitized;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DualCalendarJournal();
});