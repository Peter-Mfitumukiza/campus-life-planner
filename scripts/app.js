import * as state from './state.js';
import * as ui from './ui.js';
import * as validators from './validators.js';
import * as storage from './storage.js';

function init() {
    state.initState();

    initTheme();

    setupEventListeners();

    ui.showPage('dashboard');
    ui.renderStats();
    ui.renderTasks();

    window.app = {
        handleEditTask,
        handleDeleteTask
    };
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (isDark) {
        document.body.classList.add('dark-mode');
        updateThemeIcon('🌙');
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeIcon('☀️');
    }
}

function updateThemeIcon(icon) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = icon;
    }
}

function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', handleThemeToggle);

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    document.getElementById('add-task-btn').addEventListener('click', handleAddTaskClick);

    document.getElementById('modal-close').addEventListener('click', handleModalClose);
    document.getElementById('cancel-btn').addEventListener('click', handleModalClose);
    document.getElementById('task-modal').addEventListener('click', handleModalBackdropClick);

    document.getElementById('task-form').addEventListener('submit', handleFormSubmit);

    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('case-sensitive').addEventListener('change', handleSearch);

    document.getElementById('sort-select').addEventListener('change', handleSort);

    document.getElementById('set-target-btn').addEventListener('click', handleSetTarget);

    document.getElementById('minutes-input').addEventListener('input', handleMinutesInput);
    document.getElementById('hours-input').addEventListener('input', handleHoursInput);

    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-file').addEventListener('change', handleImport);
    document.getElementById('clear-data-btn').addEventListener('click', handleClearData);

    document.addEventListener('keydown', handleKeyboard);
}


function handleThemeToggle() {
    const isDark = document.body.classList.toggle('dark-mode');

    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    updateThemeIcon(isDark ? '🌙' : '☀️');
}


function handleNavigation(e) {
    e.preventDefault();
    const page = e.target.dataset.page;

    if (page) {
        state.setCurrentPage(page);
        ui.showPage(page);

        if (page === 'dashboard') {
            ui.renderStats();
        }
    }
}

function handleAddTaskClick() {
    state.setEditingTaskId(null);
    ui.clearForm();
    ui.showModal('Add Task');
}

function handleEditTask(taskId) {
    const task = state.getTaskById(taskId);

    if (task) {
        state.setEditingTaskId(taskId);
        ui.populateForm(task);
        ui.showModal('Edit Task');
    }
}

function handleDeleteTask(taskId) {
    const task = state.getTaskById(taskId);

    if (task && confirm(`Delete task "${task.title}"?`)) {
        state.deleteTask(taskId);
        ui.renderTasks();
        ui.renderStats();
    }
}

function handleModalClose() {
    ui.hideModal();
    state.setEditingTaskId(null);
}

function handleModalBackdropClick(e) {
    if (e.target.id === 'task-modal') {
        handleModalClose();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('task-title').value,
        dueDate: document.getElementById('task-date').value,
        duration: parseInt(document.getElementById('task-duration').value, 10),
        tag: document.getElementById('task-tag').value
    };

    const validation = validators.validateTask(taskData);

    if (!validation.valid) {
        ui.displayFormErrors(validation.errors);
        return;
    }

    const editingId = state.getEditingTaskId();

    if (editingId) {
        state.updateTask(editingId, taskData);
    } else {
        state.addTask(taskData);
    }

    ui.hideModal();
    ui.renderTasks();
    ui.renderStats();
    ui.performSearch();
}

function handleSearch() {
    const pattern = document.getElementById('search-input').value;
    const caseSensitive = document.getElementById('case-sensitive').checked;

    state.setSearchPattern(pattern);
    state.setCaseSensitive(caseSensitive);

    ui.performSearch();
}

function handleSort() {
    const sortBy = document.getElementById('sort-select').value;
    state.setSortBy(sortBy);
    ui.performSearch();
}

function handleSetTarget() {
    const target = parseInt(document.getElementById('duration-target').value, 10);

    if (isNaN(target) || target < 0) {
        ui.showStatus('Please enter a valid target', 'error');
        return;
    }

    state.updateSettings({ durationTarget: target });
    ui.renderStats();
    ui.showStatus('Target updated successfully', 'success');
}

function handleMinutesInput() {
    const minutes = parseFloat(document.getElementById('minutes-input').value);

    if (!isNaN(minutes)) {
        const hours = ui.minutesToHours(minutes);
        document.getElementById('hours-input').value = hours.toFixed(2);
    }
}

function handleHoursInput() {
    const hours = parseFloat(document.getElementById('hours-input').value);

    if (!isNaN(hours)) {
        const minutes = ui.hoursToMinutes(hours);
        document.getElementById('minutes-input').value = Math.round(minutes);
    }
}

function handleExport() {
    const tasks = state.getTasks();
    const json = storage.exportToJSON(tasks);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `campus-planner-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);

    ui.showStatus('Tasks exported successfully', 'success');
}

function handleImport(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        const result = storage.importFromJSON(event.target.result);

        if (result.success) {
            state.setTasks(result.data);
            ui.renderTasks();
            ui.renderStats();

            let message = `Imported ${result.data.length} tasks successfully`;

            if (result.warnings) {
                message += ` (${result.warnings.length} tasks skipped)`;
            }

            ui.showStatus(message, 'success');
        } else {
            ui.showStatus(result.error, 'error');
        }

        e.target.value = '';
    };

    reader.onerror = () => {
        ui.showStatus('Error reading file', 'error');
        e.target.value = '';
    };

    reader.readAsText(file);
}

function handleClearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        storage.clearAllData();
        state.clearTasks();
        state.updateSettings(storage.loadSettings());
        ui.renderTasks();
        ui.renderStats();
        ui.showStatus('All data cleared', 'success');
    }
}

function handleKeyboard(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('task-modal');
        if (!modal.hidden) {
            handleModalClose();
        }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input').focus();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
