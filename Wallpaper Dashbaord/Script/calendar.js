// Calendar Widget JavaScript
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        this.renderCalendar();
        this.attachEventListeners();
    }

    attachEventListeners() {
        const prevBtn = document.getElementById('calendar-prev-btn');
        const nextBtn = document.getElementById('calendar-next-btn');
        const closeBtn = document.getElementById('calendar-close-btn');
        const calendarBtn = document.getElementById('calendar-btn');

        prevBtn.addEventListener('click', () => this.changeMonth(-1));
        nextBtn.addEventListener('click', () => this.changeMonth(1));
        closeBtn.addEventListener('click', () => this.toggleCalendar());
        calendarBtn.addEventListener('click', () => this.toggleCalendar());
    }

    toggleCalendar() {
        const widget = document.getElementById('calendar-widget');
        this.isVisible = !this.isVisible;

        if (this.isVisible) {
            widget.classList.remove('calendar-hidden');
        } else {
            widget.classList.add('calendar-hidden');
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('calendar-month-year').textContent =
            `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Get today's date for highlighting
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        // Clear previous days
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';

        // Add previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElement(day, 'other-month');
            daysContainer.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === todayDate;
            const dayElement = this.createDayElement(day, isToday ? 'today' : '');
            daysContainer.appendChild(dayElement);
        }

        // Add next month's days to fill the grid
        const totalCells = daysContainer.children.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, 'other-month');
            daysContainer.appendChild(dayElement);
        }
    }

    createDayElement(day, className) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        dayElement.textContent = day;

        if (!className.includes('other-month')) {
            dayElement.addEventListener('click', () => this.selectDate(dayElement, day));
        }

        return dayElement;
    }

    selectDate(element, day) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Add selection to clicked day (unless it's today)
        if (!element.classList.contains('today')) {
            element.classList.add('selected');
        }

        this.selectedDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
    }
}

// Initialize calendar when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Calendar());
} else {
    new Calendar();
}