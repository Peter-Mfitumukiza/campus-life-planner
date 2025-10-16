const STORAGE_KEYS = {
    TASKS: 'campus-planner:tasks',
    SETTINGS: 'campus-planner:settings'
};

export function loadTasks() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TASKS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

export function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error('Error saving tasks:', error);
        return false;
    }
}

export function loadSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : getDefaultSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
        return getDefaultSettings();
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

function getDefaultSettings() {
    return {
        durationTarget: 0,
        defaultUnit: 'minutes'
    };
}

export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

export function exportToJSON(tasks) {
    return JSON.stringify(tasks, null, 2);
}

export function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        if (!Array.isArray(data)) {
            return {
                success: false,
                error: 'Invalid JSON: Expected an array of tasks'
            };
        }

        const errors = [];
        const validTasks = [];

        data.forEach((task, index) => {
            const validation = validateTaskStructure(task);
            if (validation.valid) {
                validTasks.push(task);
            } else {
                errors.push(`Task ${index + 1}: ${validation.error}`);
            }
        });

        if (errors.length > 0 && validTasks.length === 0) {
            return {
                success: false,
                error: 'No valid tasks found:\n' + errors.join('\n')
            };
        }

        return {
            success: true,
            data: validTasks,
            warnings: errors.length > 0 ? errors : null
        };
    } catch (error) {
        return {
            success: false,
            error: 'Invalid JSON format: ' + error.message
        };
    }
}

function validateTaskStructure(task) {
    if (!task || typeof task !== 'object') {
        return { valid: false, error: 'Task must be an object' };
    }

    const requiredFields = ['id', 'title', 'dueDate', 'duration', 'tag', 'createdAt', 'updatedAt'];

    for (const field of requiredFields) {
        if (!(field in task)) {
            return { valid: false, error: `Missing required field: ${field}` };
        }
    }

    if (typeof task.id !== 'string') {
        return { valid: false, error: 'id must be a string' };
    }
    if (typeof task.title !== 'string') {
        return { valid: false, error: 'title must be a string' };
    }
    if (typeof task.dueDate !== 'string') {
        return { valid: false, error: 'dueDate must be a string' };
    }
    if (typeof task.duration !== 'number') {
        return { valid: false, error: 'duration must be a number' };
    }
    if (typeof task.tag !== 'string') {
        return { valid: false, error: 'tag must be a string' };
    }

    return { valid: true };
}
