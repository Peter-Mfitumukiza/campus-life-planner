import { getTasks, getSettings, sortTasks, getSearchPattern, getCaseSensitive } from './state.js';
import { searchTasks, highlight, getSearchStatus } from './search.js';

export function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

export function renderTasks(tasks = null, searchRegex = null) {
    const container = document.getElementById('tasks-container');

    if (!tasks) {
        tasks = getTasks();
    }

    const sortBy = document.getElementById('sort-select')?.value || 'date-asc';
    tasks = sortTasks(tasks, sortBy);

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No tasks ${getSearchPattern() ? 'match your search' : 'yet. Add your first task to get started!'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => renderTaskCard(task, searchRegex)).join('');
    attachTaskEventListeners();
}

function renderTaskCard(task, searchRegex = null) {
    const title = searchRegex ? highlight(task.title, searchRegex) : escapeHtml(task.title);
    const tag = searchRegex ? highlight(task.tag, searchRegex) : escapeHtml(task.tag);
    const dueDate = formatDate(task.dueDate);
    const duration = formatDuration(task.duration);

    return `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${title}</h3>
                <span class="task-tag">${tag}</span>
            </div>
            <div class="task-details">
                <div class="task-detail">
                    <strong>Due:</strong> ${dueDate}
                </div>
                <div class="task-detail">
                    <strong>Duration:</strong> ${duration}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-small btn-secondary edit-task-btn" data-task-id="${task.id}" aria-label="Edit task: ${escapeHtml(task.title)}">
                    Edit
                </button>
                <button class="btn btn-small btn-danger delete-task-btn" data-task-id="${task.id}" aria-label="Delete task: ${escapeHtml(task.title)}">
                    Delete
                </button>
            </div>
        </div>
    `;
}

function attachTaskEventListeners() {
    document.querySelectorAll('.edit-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            window.app.handleEditTask(taskId);
        });
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            window.app.handleDeleteTask(taskId);
        });
    });
}

export function renderStats() {
    const tasks = getTasks();
    const settings = getSettings();

    document.getElementById('stat-total').textContent = tasks.length;

    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
    document.getElementById('stat-duration').textContent = formatDuration(totalDuration);

    const topTag = getTopTag(tasks);
    document.getElementById('stat-tag').textContent = topTag || '-';

    renderTrendChart(tasks);

    if (settings.durationTarget > 0) {
        updateTargetStatus(totalDuration, settings.durationTarget);
    }
}

function getTopTag(tasks) {
    if (tasks.length === 0) return null;

    const tagCounts = {};
    tasks.forEach(task => {
        tagCounts[task.tag] = (tagCounts[task.tag] || 0) + 1;
    });

    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
}

function renderTrendChart(tasks) {
    const chartContainer = document.getElementById('trend-chart');
    const last7Days = getLast7Days();

    const dayCounts = last7Days.map(date => {
        const count = tasks.filter(task => task.dueDate === date).length;
        return { date, count };
    });

    const maxCount = Math.max(...dayCounts.map(d => d.count), 1);

    chartContainer.innerHTML = dayCounts.map(({ date, count }) => {
        const height = (count / maxCount) * 100;
        return `
            <div class="trend-bar"
                 style="height: ${height}%"
                 title="${count} tasks on ${formatDate(date)}"
                 role="img"
                 aria-label="${count} tasks on ${formatDate(date)}">
            </div>
        `;
    }).join('');
}

function getLast7Days() {
    const dates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

function updateTargetStatus(current, target) {
    const statusEl = document.getElementById('target-status');
    const remaining = target - current;

    if (remaining > 0) {
        statusEl.textContent = `You have ${remaining} minutes remaining to reach your target.`;
        statusEl.className = 'target-status under';
        statusEl.setAttribute('aria-live', 'polite');
    } else if (remaining === 0) {
        statusEl.textContent = `Perfect! You've reached your target of ${target} minutes.`;
        statusEl.className = 'target-status under';
        statusEl.setAttribute('aria-live', 'polite');
    } else {
        statusEl.textContent = `You've exceeded your target by ${Math.abs(remaining)} minutes!`;
        statusEl.className = 'target-status exceeded';
        statusEl.setAttribute('aria-live', 'assertive');
    }
}

export function updateSearchStatus(totalTasks, matchCount, pattern, isValid) {
    const statusEl = document.getElementById('search-status');
    statusEl.textContent = getSearchStatus(totalTasks, matchCount, pattern, isValid);
}

export function showModal(title = 'Add Task') {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.textContent = title;
    modal.hidden = false;

    setTimeout(() => {
        document.getElementById('task-title').focus();
    }, 100);
}

export function hideModal() {
    const modal = document.getElementById('task-modal');
    modal.hidden = true;
}

export function populateForm(task) {
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-date').value = task.dueDate;
    document.getElementById('task-duration').value = task.duration;
    document.getElementById('task-tag').value = task.tag;
}

export function clearForm() {
    document.getElementById('task-form').reset();
    clearFormErrors();
}

function clearFormErrors() {
    ['title', 'date', 'duration', 'tag'].forEach(field => {
        document.getElementById(`${field}-error`).textContent = '';
    });
}

export function displayFormErrors(errors) {
    clearFormErrors();

    Object.entries(errors).forEach(([field, message]) => {
        const errorId = field === 'dueDate' ? 'date-error' : `${field}-error`;
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
        }
    });
}

export function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('settings-status');
    statusEl.textContent = message;
    statusEl.className = type;
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');

    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = '';
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}min`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function minutesToHours(minutes) {
    return minutes / 60;
}

export function hoursToMinutes(hours) {
    return hours * 60;
}

export function performSearch() {
    const pattern = getSearchPattern();
    const caseSensitive = getCaseSensitive();
    const allTasks = getTasks();

    const result = searchTasks(allTasks, pattern, caseSensitive);

    renderTasks(result.matches, result.regex);
    updateSearchStatus(allTasks.length, result.matches.length, pattern, result.regex !== null || !pattern);
}
