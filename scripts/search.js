
export function compileRegex(pattern, caseSensitive = false) {
    if (!pattern || pattern.trim() === '') {
        return null;
    }

    try {
        const flags = caseSensitive ? 'g' : 'gi';
        return new RegExp(pattern, flags);
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return null;
    }
}


export function highlight(text, regex) {
    if (!regex || !text) {
        return escapeHtml(text);
    }
    const escaped = escapeHtml(text);

    return escaped.replace(regex, (match) => `<mark>${match}</mark>`);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function searchTasks(tasks, pattern, caseSensitive = false) {
    const specialPattern = parseSpecialPattern(pattern);

    if (specialPattern) {
        return {
            matches: filterBySpecialPattern(tasks, specialPattern),
            regex: null,
            isSpecial: true,
            pattern: specialPattern
        };
    }

    const regex = compileRegex(pattern, caseSensitive);

    if (!regex) {
        return {
            matches: tasks,
            regex: null,
            isSpecial: false
        };
    }

    const matches = tasks.filter(task => {
        return regex.test(task.title) ||
               regex.test(task.tag) ||
               regex.test(task.dueDate);
    });

    return {
        matches,
        regex,
        isSpecial: false
    };
}

function parseSpecialPattern(pattern) {
    const tagMatch = pattern.match(/^@tag:(\w+)$/i);
    if (tagMatch) {
        return {
            type: 'tag',
            value: tagMatch[1]
        };
    }

    return null;
}

function filterBySpecialPattern(tasks, pattern) {
    switch (pattern.type) {
        case 'tag':
            return tasks.filter(task =>
                task.tag.toLowerCase() === pattern.value.toLowerCase()
            );
        default:
            return tasks;
    }
}

export function getSearchStatus(totalTasks, matchCount, pattern, isValid) {
    if (!pattern || pattern.trim() === '') {
        return `Showing all ${totalTasks} tasks`;
    }

    if (!isValid) {
        return 'Invalid regex pattern';
    }

    if (matchCount === 0) {
        return 'No tasks match your search';
    }

    if (matchCount === totalTasks) {
        return `All ${totalTasks} tasks match`;
    }

    return `Found ${matchCount} of ${totalTasks} tasks`;
}


export const SEARCH_PATTERNS = {
    TAG_FILTER: {
        pattern: '@tag:Study',
        description: 'Filter by specific tag'
    },
    TIME_TOKENS: {
        pattern: '\\b\\d{2}:\\d{2}\\b',
        description: 'Find time tokens (e.g., 14:30)'
    },
    DUE_TODAY: {
        pattern: new Date().toISOString().split('T')[0],
        description: 'Tasks due today'
    },
    EXAM_KEYWORDS: {
        pattern: '(exam|test|quiz|midterm|final)',
        description: 'Find exam-related tasks'
    },
    STUDY_KEYWORDS: {
        pattern: '(study|read|review|practice)',
        description: 'Find study-related tasks'
    }
};
