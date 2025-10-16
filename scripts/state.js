import { loadTasks, saveTasks, loadSettings, saveSettings } from './storage.js';

let state = {
    tasks: [],
    settings: {},
    currentPage: 'dashboard',
    editingTaskId: null,
    searchPattern: '',
    caseSensitive: false,
    sortBy: 'date-asc'
};

export function initState() {
    state.tasks = loadTasks();
    state.settings = loadSettings();
}

export function getState() {
    return { ...state };
}

export function getTasks() {
    return [...state.tasks];
}

export function getTaskById(id) {
    return state.tasks.find(task => task.id === id) || null;
}

export function addTask(taskData) {
    const now = new Date().toISOString();
    const task = {
        id: generateTaskId(),
        ...taskData,
        createdAt: now,
        updatedAt: now
    };

    state.tasks.push(task);
    saveTasks(state.tasks);

    return task;
}

export function updateTask(id, updates) {
    const index = state.tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return null;
    }

    state.tasks[index] = {
        ...state.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    saveTasks(state.tasks);

    return state.tasks[index];
}

export function deleteTask(id) {
    const initialLength = state.tasks.length;
    state.tasks = state.tasks.filter(task => task.id !== id);

    if (state.tasks.length < initialLength) {
        saveTasks(state.tasks);
        return true;
    }

    return false;
}

export function setTasks(tasks) {
    state.tasks = tasks;
    saveTasks(state.tasks);
}

export function clearTasks() {
    state.tasks = [];
    saveTasks(state.tasks);
}

function generateTaskId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `task_${timestamp}_${random}`;
}

export function getSettings() {
    return { ...state.settings };
}

export function updateSettings(updates) {
    state.settings = {
        ...state.settings,
        ...updates
    };
    saveSettings(state.settings);
}

export function setCurrentPage(page) {
    state.currentPage = page;
}

export function getCurrentPage() {
    return state.currentPage;
}

export function setEditingTaskId(id) {
    state.editingTaskId = id;
}

export function getEditingTaskId() {
    return state.editingTaskId;
}

export function setSearchPattern(pattern) {
    state.searchPattern = pattern;
}

export function getSearchPattern() {
    return state.searchPattern;
}

export function setCaseSensitive(sensitive) {
    state.caseSensitive = sensitive;
}

export function getCaseSensitive() {
    return state.caseSensitive;
}

export function setSortBy(sortBy) {
    state.sortBy = sortBy;
}

export function getSortBy() {
    return state.sortBy;
}

export function sortTasks(tasks, sortBy = state.sortBy) {
    const sorted = [...tasks];

    switch (sortBy) {
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'duration-asc':
            sorted.sort((a, b) => a.duration - b.duration);
            break;
        case 'duration-desc':
            sorted.sort((a, b) => b.duration - a.duration);
            break;
        default:
            break;
    }

    return sorted;
}
