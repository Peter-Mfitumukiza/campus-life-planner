export const PATTERNS = {
    TITLE: {
        regex: /^\S(?:.*\S)?$/,
        message: 'Title cannot have leading or trailing spaces',
        test: (value) => PATTERNS.TITLE.regex.test(value)
    },
    DURATION: {
        regex: /^(0|[1-9]\d*)$/,
        message: 'Duration must be a positive whole number',
        test: (value) => PATTERNS.DURATION.regex.test(String(value))
    },
    DATE: {
        regex: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        message: 'Date must be in YYYY-MM-DD format',
        test: (value) => PATTERNS.DATE.regex.test(value)
    },
    TAG: {
        regex: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        message: 'Tag can only contain letters, spaces, and hyphens',
        test: (value) => PATTERNS.TAG.regex.test(value)
    },
    DUPLICATE_WORDS: {
        regex: /\b(\w+)\s+\1\b/i,
        message: 'Contains duplicate words',
        test: (value) => PATTERNS.DUPLICATE_WORDS.regex.test(value)
    }
};

export function validateTitle(title) {
    if (!title || title.trim() === '') {
        return { valid: false, message: 'Title is required' };
    }

    if (!PATTERNS.TITLE.test(title)) {
        return { valid: false, message: PATTERNS.TITLE.message };
    }

    if (PATTERNS.DUPLICATE_WORDS.test(title)) {
        return { valid: false, message: 'Title contains duplicate words' };
    }

    if (title.length > 100) {
        return { valid: false, message: 'Title must be 100 characters or less' };
    }

    return { valid: true };
}

export function validateDuration(duration) {
    const durationStr = String(duration).trim();

    if (!durationStr) {
        return { valid: false, message: 'Duration is required' };
    }

    if (!PATTERNS.DURATION.test(durationStr)) {
        return { valid: false, message: PATTERNS.DURATION.message };
    }

    const num = Number(durationStr);
    if (num < 0) {
        return { valid: false, message: 'Duration must be positive' };
    }

    if (num > 1440) {
        return { valid: false, message: 'Duration cannot exceed 1440 minutes (24 hours)' };
    }

    return { valid: true };
}

export function validateDate(date) {
    if (!date || date.trim() === '') {
        return { valid: false, message: 'Date is required' };
    }

    if (!PATTERNS.DATE.test(date)) {
        return { valid: false, message: PATTERNS.DATE.message };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return { valid: false, message: 'Invalid date' };
    }

    return { valid: true };
}

export function validateTag(tag) {
    if (!tag || tag.trim() === '') {
        return { valid: false, message: 'Tag is required' };
    }

    if (!PATTERNS.TAG.test(tag)) {
        return { valid: false, message: PATTERNS.TAG.message };
    }

    if (tag.length > 30) {
        return { valid: false, message: 'Tag must be 30 characters or less' };
    }

    return { valid: true };
}

export function validateTask(task) {
    const errors = {};

    const titleValidation = validateTitle(task.title);
    if (!titleValidation.valid) {
        errors.title = titleValidation.message;
    }

    const dateValidation = validateDate(task.dueDate);
    if (!dateValidation.valid) {
        errors.dueDate = dateValidation.message;
    }

    const durationValidation = validateDuration(task.duration);
    if (!durationValidation.valid) {
        errors.duration = durationValidation.message;
    }

    const tagValidation = validateTag(task.tag);
    if (!tagValidation.valid) {
        errors.tag = tagValidation.message;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

export function displayError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

export function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

export function clearAllErrors() {
    ['title', 'date', 'duration', 'tag'].forEach(clearError);
}
