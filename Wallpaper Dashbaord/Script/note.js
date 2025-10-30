// Notes Feature - Separate JavaScript Module

// Notes related variables
let notes = [];
let noteCounter = 0;
let draggedNote = null;
let dragOffset = { x: 0, y: 0 };
let isAnimating = false;

// Expanded color themes for notes
const noteColors = [
    { name: 'blue', bg: 'rgba(52, 120, 246, 0.15)', border: 'rgba(52, 120, 246, 0.3)', accent: 'rgba(52, 120, 246, 0.8)' },
    { name: 'green', bg: 'rgba(52, 199, 89, 0.15)', border: 'rgba(52, 199, 89, 0.3)', accent: 'rgba(52, 199, 89, 0.8)' },
    { name: 'purple', bg: 'rgba(175, 82, 222, 0.15)', border: 'rgba(175, 82, 222, 0.3)', accent: 'rgba(175, 82, 222, 0.8)' },
    { name: 'orange', bg: 'rgba(255, 149, 0, 0.15)', border: 'rgba(255, 149, 0, 0.3)', accent: 'rgba(255, 149, 0, 0.8)' },
    { name: 'red', bg: 'rgba(255, 59, 48, 0.15)', border: 'rgba(255, 59, 48, 0.3)', accent: 'rgba(255, 59, 48, 0.8)' },
    { name: 'teal', bg: 'rgba(90, 200, 250, 0.15)', border: 'rgba(90, 200, 250, 0.3)', accent: 'rgba(90, 200, 250, 0.8)' },
    { name: 'pink', bg: 'rgba(255, 45, 85, 0.15)', border: 'rgba(255, 45, 85, 0.3)', accent: 'rgba(255, 45, 85, 0.8)' },
    { name: 'yellow', bg: 'rgba(255, 204, 0, 0.15)', border: 'rgba(255, 204, 0, 0.3)', accent: 'rgba(255, 204, 0, 0.8)' },
    { name: 'indigo', bg: 'rgba(88, 86, 214, 0.15)', border: 'rgba(88, 86, 214, 0.3)', accent: 'rgba(88, 86, 214, 0.8)' },
    { name: 'mint', bg: 'rgba(102, 212, 207, 0.15)', border: 'rgba(102, 212, 207, 0.3)', accent: 'rgba(102, 212, 207, 0.8)' },
    { name: 'coral', bg: 'rgba(255, 127, 80, 0.15)', border: 'rgba(255, 127, 80, 0.3)', accent: 'rgba(255, 127, 80, 0.8)' },
    { name: 'lavender', bg: 'rgba(230, 230, 250, 0.15)', border: 'rgba(230, 230, 250, 0.3)', accent: 'rgba(230, 230, 250, 0.8)' },
    { name: 'lime', bg: 'rgba(50, 205, 50, 0.15)', border: 'rgba(50, 205, 50, 0.3)', accent: 'rgba(50, 205, 50, 0.8)' },
    { name: 'magenta', bg: 'rgba(255, 0, 255, 0.15)', border: 'rgba(255, 0, 255, 0.3)', accent: 'rgba(255, 0, 255, 0.8)' },
    { name: 'gold', bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.3)', accent: 'rgba(255, 215, 0, 0.8)' },
    { name: 'cyan', bg: 'rgba(0, 255, 255, 0.15)', border: 'rgba(0, 255, 255, 0.3)', accent: 'rgba(0, 255, 255, 0.8)' },
    { name: 'salmon', bg: 'rgba(250, 128, 114, 0.15)', border: 'rgba(250, 128, 114, 0.3)', accent: 'rgba(250, 128, 114, 0.8)' },
    { name: 'violet', bg: 'rgba(138, 43, 226, 0.15)', border: 'rgba(138, 43, 226, 0.3)', accent: 'rgba(138, 43, 226, 0.8)' },
    { name: 'turquoise', bg: 'rgba(64, 224, 208, 0.15)', border: 'rgba(64, 224, 208, 0.3)', accent: 'rgba(64, 224, 208, 0.8)' },
    { name: 'rose', bg: 'rgba(255, 192, 203, 0.15)', border: 'rgba(255, 192, 203, 0.3)', accent: 'rgba(255, 192, 203, 0.8)' },
    { name: 'emerald', bg: 'rgba(80, 200, 120, 0.15)', border: 'rgba(80, 200, 120, 0.3)', accent: 'rgba(80, 200, 120, 0.8)' },
    { name: 'amber', bg: 'rgba(255, 191, 0, 0.15)', border: 'rgba(255, 191, 0, 0.3)', accent: 'rgba(255, 191, 0, 0.8)' },
    { name: 'sky', bg: 'rgba(135, 206, 235, 0.15)', border: 'rgba(135, 206, 235, 0.3)', accent: 'rgba(135, 206, 235, 0.8)' },
    { name: 'peach', bg: 'rgba(255, 218, 185, 0.15)', border: 'rgba(255, 218, 185, 0.3)', accent: 'rgba(255, 218, 185, 0.8)' },
    { name: 'plum', bg: 'rgba(221, 160, 221, 0.15)', border: 'rgba(221, 160, 221, 0.3)', accent: 'rgba(221, 160, 221, 0.8)' },
    { name: 'charcoal', bg: 'rgba(54, 69, 79, 0.15)', border: 'rgba(54, 69, 79, 0.3)', accent: 'rgba(54, 69, 79, 0.8)' },
    { name: 'midnight', bg: 'rgba(25, 25, 112, 0.15)', border: 'rgba(25, 25, 112, 0.3)', accent: 'rgba(25, 25, 112, 0.8)' },
    { name: 'slate', bg: 'rgba(112, 128, 144, 0.15)', border: 'rgba(112, 128, 144, 0.3)', accent: 'rgba(112, 128, 144, 0.8)' },
    { name: 'graphite', bg: 'rgba(47, 79, 79, 0.15)', border: 'rgba(47, 79, 79, 0.3)', accent: 'rgba(47, 79, 79, 0.8)' },
    { name: 'obsidian', bg: 'rgba(36, 36, 36, 0.15)', border: 'rgba(36, 36, 36, 0.3)', accent: 'rgba(36, 36, 36, 0.8)' },
    { name: 'steel', bg: 'rgba(70, 130, 180, 0.15)', border: 'rgba(70, 130, 180, 0.3)', accent: 'rgba(70, 130, 180, 0.8)' },
    { name: 'burgundy', bg: 'rgba(128, 0, 32, 0.15)', border: 'rgba(128, 0, 32, 0.3)', accent: 'rgba(128, 0, 32, 0.8)' },
    { name: 'rust', bg: 'rgba(183, 65, 14, 0.15)', border: 'rgba(183, 65, 14, 0.3)', accent: 'rgba(183, 65, 14, 0.8)' },
    { name: 'bronze', bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.3)', accent: 'rgba(205, 127, 50, 0.8)' },
    { name: 'copper', bg: 'rgba(184, 115, 51, 0.15)', border: 'rgba(184, 115, 51, 0.3)', accent: 'rgba(184, 115, 51, 0.8)' },
    { name: 'terracotta', bg: 'rgba(226, 114, 91, 0.15)', border: 'rgba(226, 114, 91, 0.3)', accent: 'rgba(226, 114, 91, 0.8)' },
    { name: 'sienna', bg: 'rgba(160, 82, 45, 0.15)', border: 'rgba(160, 82, 45, 0.3)', accent: 'rgba(160, 82, 45, 0.8)' },
    { name: 'mahogany', bg: 'rgba(192, 64, 0, 0.15)', border: 'rgba(192, 64, 0, 0.3)', accent: 'rgba(192, 64, 0, 0.8)' },
    { name: 'cinnamon', bg: 'rgba(210, 180, 140, 0.15)', border: 'rgba(210, 180, 140, 0.3)', accent: 'rgba(210, 180, 140, 0.8)' },
    { name: 'chestnut', bg: 'rgba(149, 69, 53, 0.15)', border: 'rgba(149, 69, 53, 0.3)', accent: 'rgba(149, 69, 53, 0.8)' },
    { name: 'espresso', bg: 'rgba(97, 51, 24, 0.15)', border: 'rgba(97, 51, 24, 0.3)', accent: 'rgba(97, 51, 24, 0.8)' }
];

// Notes DOM elements (will be created dynamically)
const notesElements = {
    addNoteBtn: null,
    notesContainer: null
};

// Get next available note number (fills gaps)
function getNextNoteNumber() {
    const existingNumbers = notes.map(note => {
        const match = note.title.match(/^Note (\d+)$/);
        return match ? parseInt(match[1]) : 0;
    }).filter(num => num > 0);

    // Find the first gap in numbering, or use next sequential number
    for (let i = 1; i <= existingNumbers.length + 1; i++) {
        if (!existingNumbers.includes(i)) {
            return i;
        }
    }
    return 1; // Fallback
}

// Initialize notes feature
function initializeNotes() {
    createAddNoteButton();
    createNotesContainer();
    loadNotesFromStorage();
    setupNotesEventListeners();
}

// Create the "Add Note" button
function createAddNoteButton() {
    const addNoteBtn = document.createElement('div');
    addNoteBtn.id = 'add-note-btn';
    addNoteBtn.className = 'add-note-button';
    addNoteBtn.title = 'Add Note';
    addNoteBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 3L20.5 9V20C20.5 20.5523 20.0523 21 19.5 21H4.5C3.94772 21 3.5 20.5523 3.5 20V4C3.5 3.44772 3.94772 3 4.5 3H14.5Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M14.5 3V9H20.5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="9.5" y1="13" x2="15.5" y2="13" stroke="currentColor" stroke-width="1.5"/>
            <line x1="9.5" y1="17" x2="13.5" y2="17" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>Add Note</span>
    `;

    document.body.appendChild(addNoteBtn);
    notesElements.addNoteBtn = addNoteBtn;
}

// Create notes container
function createNotesContainer() {
    const container = document.createElement('div');
    container.id = 'notes-container';
    container.className = 'notes-container';
    document.body.appendChild(container);
    notesElements.notesContainer = container;
}

// Load notes from storage
async function loadNotesFromStorage() {
    try {
        const result = await chrome.storage.local.get(['notes', 'noteCounter']);
        notes = result.notes || [];
        noteCounter = result.noteCounter || 0;

        notes.forEach(noteData => {
            createNoteElement(noteData);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
        notes = [];
        noteCounter = 0;
    }
}

// Save notes to storage
async function saveNotesToStorage() {
    try {
        await chrome.storage.local.set({ notes, noteCounter });
    } catch (error) {
        console.error('Error saving notes:', error);
    }
}

// Create a new note
function createNewNote() {
    if (notes.length >= 10) {
        showToast('Maximum 10 notes allowed');
        return;
    }

    // Get the next available note number
    const nextNumber = getNextNoteNumber();
    noteCounter++;

    // Assign random color
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];

    const noteData = {
        id: `note-${noteCounter}`,
        title: `Note ${nextNumber}`,
        content: '',
        position: {
            x: 100 + (notes.length * 30),
            y: 100 + (notes.length * 30)
        },
        size: {
            width: 300,
            height: 200
        },
        isMinimized: false,
        color: randomColor
    };

    notes.push(noteData);
    createNoteElement(noteData);
    saveNotesToStorage();
}

// Create note DOM element
function createNoteElement(noteData) {
    const noteElement = document.createElement('div');
    noteElement.className = `note-item ${noteData.isMinimized ? 'minimized' : ''}`;
    noteElement.id = noteData.id;
    noteElement.style.left = noteData.position.x + 'px';
    noteElement.style.top = noteData.position.y + 'px';
    noteElement.style.width = noteData.size.width + 'px';
    noteElement.style.height = noteData.size.height + 'px';

    // Apply color theme if available
    if (noteData.color) {
        noteElement.style.setProperty('--note-bg', noteData.color.bg);
        noteElement.style.setProperty('--note-border', noteData.color.border);
        noteElement.style.setProperty('--note-accent', noteData.color.accent);
        noteElement.setAttribute('data-color', noteData.color.name);
    } else {
        // Assign random color if none exists (for legacy notes)
        const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
        noteData.color = randomColor;
        noteElement.style.setProperty('--note-bg', randomColor.bg);
        noteElement.style.setProperty('--note-border', randomColor.border);
        noteElement.style.setProperty('--note-accent', randomColor.accent);
        noteElement.setAttribute('data-color', randomColor.name);
    }

    noteElement.innerHTML = `
        <div class="note-header">
            <div class="note-controls">
            <button class="note-btn add-note-btn" title="Add New Note">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 6V18M6 12H18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="note-btn minimize-btn" title="Minimize">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 12L18 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="note-btn close-btn" title="Close">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="note-content">
            <input type="text" class="note-title" placeholder="Note title..." value="${noteData.title}">
            <textarea class="note-text" placeholder="Write your note here...">${noteData.content}</textarea>
        </div>
        <div class="note-resize-handle"></div>
    `;

    setupNoteEventListeners(noteElement, noteData);
    notesElements.notesContainer.appendChild(noteElement);

    // Focus on content if it's a new note
    if (!noteData.content && !noteData.title.startsWith('Note ')) {
        const titleInput = noteElement.querySelector('.note-title');
        setTimeout(() => titleInput.focus(), 100);
    }
}

// Setup event listeners for a note
function setupNoteEventListeners(noteElement, noteData) {
    const header = noteElement.querySelector('.note-header');
    const closeBtn = noteElement.querySelector('.close-btn');
    const minimizeBtn = noteElement.querySelector('.minimize-btn');
    const addBtn = noteElement.querySelector('.add-note-btn');
    const titleInput = noteElement.querySelector('.note-title');
    const textArea = noteElement.querySelector('.note-text');
    const resizeHandle = noteElement.querySelector('.note-resize-handle');

    // Close button
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(noteData.id);
    });

    // Minimize button
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize(noteData.id);
    });

    // Add new note button
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createNewNote();
    });

    // Title and content change handlers
    titleInput.addEventListener('input', (e) => {
        updateNoteData(noteData.id, 'title', e.target.value || `Note ${noteData.id.split('-')[1]}`);
    });

    textArea.addEventListener('input', (e) => {
        updateNoteData(noteData.id, 'content', e.target.value);
    });

    // Drag functionality
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.note-btn')) return;
        startDragging(noteElement, noteData, e);
    });

    // Resize functionality
    resizeHandle.addEventListener('mousedown', (e) => {
        startResizing(noteElement, noteData, e);
    });

    // Double click to minimize/maximize
    header.addEventListener('dblclick', (e) => {
        if (e.target.closest('.note-btn')) return;
        toggleMinimize(noteData.id);
    });
}

// Start dragging a note
function startDragging(noteElement, noteData, e) {
    if (isAnimating) return;

    draggedNote = { element: noteElement, data: noteData };
    const rect = noteElement.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    noteElement.style.zIndex = '1001';
    noteElement.classList.add('dragging');

    // Disable transitions for smooth dragging
    noteElement.style.transition = 'none';

    document.addEventListener('mousemove', handleNoteDrag);
    document.addEventListener('mouseup', stopNoteDrag);

    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    e.preventDefault();
}

// Handle note dragging
function handleNoteDrag(e) {
    if (!draggedNote) return;

    e.preventDefault();

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    // Keep note within viewport with some padding
    const padding = 20;
    const maxX = window.innerWidth - draggedNote.element.offsetWidth - padding;
    const maxY = window.innerHeight - draggedNote.element.offsetHeight - padding;

    const constrainedX = Math.max(padding, Math.min(x, maxX));
    const constrainedY = Math.max(padding, Math.min(y, maxY));

    // Use transform for smoother movement
    draggedNote.element.style.transform = `translate(${constrainedX - draggedNote.data.position.x}px, ${constrainedY - draggedNote.data.position.y}px)`;
}

// Stop note dragging
function stopNoteDrag() {
    if (draggedNote) {
        // Calculate final position
        const transform = draggedNote.element.style.transform;
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);

        if (match) {
            const deltaX = parseFloat(match[1]);
            const deltaY = parseFloat(match[2]);
            const newX = draggedNote.data.position.x + deltaX;
            const newY = draggedNote.data.position.y + deltaY;

            // Update actual position
            draggedNote.element.style.left = newX + 'px';
            draggedNote.element.style.top = newY + 'px';
            draggedNote.element.style.transform = '';

            updateNoteData(draggedNote.data.id, 'position', { x: newX, y: newY });
        }

        // Re-enable transitions
        draggedNote.element.style.transition = '';
        draggedNote.element.style.zIndex = '';
        draggedNote.element.classList.remove('dragging');
        draggedNote = null;
    }

    document.removeEventListener('mousemove', handleNoteDrag);
    document.removeEventListener('mouseup', stopNoteDrag);

    // Re-enable text selection
    document.body.style.userSelect = '';
}

// Start resizing a note
function startResizing(noteElement, noteData, e) {
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(window.getComputedStyle(noteElement).width);
    const startHeight = parseInt(window.getComputedStyle(noteElement).height);

    function handleResize(e) {
        const newWidth = Math.max(250, startWidth + (e.clientX - startX));
        const newHeight = Math.max(150, startHeight + (e.clientY - startY));

        noteElement.style.width = newWidth + 'px';
        noteElement.style.height = newHeight + 'px';

        updateNoteData(noteData.id, 'size', { width: newWidth, height: newHeight });
    }

    function stopResize() {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

// Toggle minimize/maximize note
function toggleMinimize(noteId) {
    const note = notes.find(n => n.id === noteId);
    const noteElement = document.getElementById(noteId);

    if (!note || !noteElement) return;

    note.isMinimized = !note.isMinimized;
    noteElement.classList.toggle('minimized', note.isMinimized);

    if (note.isMinimized) {
        // Update minimize button icon to maximize
        const minimizeBtn = noteElement.querySelector('.minimize-btn');
        minimizeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
        minimizeBtn.title = 'Maximize';
    } else {
        // Update minimize button icon back to minimize
        const minimizeBtn = noteElement.querySelector('.minimize-btn');
        minimizeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 12L18 12" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
        minimizeBtn.title = 'Minimize';
    }

    saveNotesToStorage();
}

// Delete a note
function deleteNote(noteId) {
    const noteElement = document.getElementById(noteId);
    if (noteElement) {
        noteElement.remove();
    }

    notes = notes.filter(n => n.id !== noteId);
    saveNotesToStorage();
    showToast('Note deleted');
}

// Update note data
function updateNoteData(noteId, property, value) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        if (property === 'position' || property === 'size') {
            note[property] = value;
        } else {
            note[property] = value;
        }
        saveNotesToStorage();
    }
}

// Setup global notes event listeners
function setupNotesEventListeners() {
    // Add note button click
    notesElements.addNoteBtn.addEventListener('click', createNewNote);

    // Prevent note dragging when clicking on inputs
    document.addEventListener('mousedown', (e) => {
        if (e.target.matches('.note-title, .note-text')) {
            e.stopPropagation();
        }
    });
}

// Initialize notes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotes);
} else {
    initializeNotes();
}