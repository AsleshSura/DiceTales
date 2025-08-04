/**
 * DiceTales - Utility Functions
 * Common helper functions used throughout the application
 */

// ===== UTILITY FUNCTIONS =====

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a unique ID for game elements
 */
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${randomInt(1000, 9999)}`;
}

/**
 * Safely parse JSON with fallback
 */
function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('Failed to parse JSON:', e);
        return fallback;
    }
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Debounce function to limit API calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance-sensitive operations
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Calculate ability modifier from ability score (D&D 5e rules)
 */
function getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

/**
 * Format ability modifier for display
 */
function formatModifier(modifier) {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format text for display (handle line breaks, etc.)
 */
function formatText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Create HTML element with attributes and content
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'className' || key === 'class') {
            element.className = attributes[key];
        } else if (key === 'innerHTML') {
            element.innerHTML = attributes[key];
        } else if (key === 'textContent') {
            element.textContent = attributes[key];
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, attributes[key]);
        } else {
            element[key] = attributes[key];
        }
    });
    
    if (content) {
        element.innerHTML = content;
    }
    
    return element;
}

/**
 * Add event listener with automatic cleanup
 */
function addEventListenerWithCleanup(element, event, handler) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = createElement('div', {
        className: `toast toast-${type}`,
        innerHTML: `
            <div class="toast-content">
                <span class="toast-icon">${getToastIcon(type)}</span>
                <span class="toast-message">${sanitizeHtml(message)}</span>
                <button class="toast-close">&times;</button>
            </div>
        `
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    const removeToast = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };
    
    const timeoutId = setTimeout(removeToast, duration);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeoutId);
        removeToast();
    });
}

/**
 * Get icon for toast type
 */
function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random name based on setting
 */
function generateRandomName(setting = 'fantasy') {
    const nameData = {
        fantasy: {
            first: ['Aeliana', 'Bran', 'Cora', 'Dain', 'Eira', 'Finn', 'Gwen', 'Holt', 'Iris', 'Jax'],
            last: ['Brightblade', 'Stormwind', 'Ironforge', 'Goldleaf', 'Shadowmere', 'Fireborn', 'Moonwhisper', 'Starfall', 'Thornfield', 'Ravencrest']
        },
        modern: {
            first: ['Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jasper'],
            last: ['Anderson', 'Brooks', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Johnson', 'Kumar']
        },
        scifi: {
            first: ['Zara', 'Kai', 'Nova', 'Orion', 'Luna', 'Phoenix', 'Raven', 'Sage', 'Tara', 'Vex'],
            last: ['Voidwalker', 'Starforge', 'Nebula', 'Quantum', 'Cyber', 'Nexus', 'Prime', 'Vector', 'Matrix', 'Omega']
        },
        horror: {
            first: ['Agatha', 'Cornelius', 'Delphine', 'Edgar', 'Florence', 'Gideon', 'Helena', 'Ignatius', 'Josephine', 'Klaus'],
            last: ['Blackwood', 'Grimm', 'Holloway', 'Nightshade', 'Ravenscroft', 'Thorne', 'Whitmore', 'Ashford', 'Darkmore', 'Shadowheart']
        }
    };
    
    const names = nameData[setting] || nameData.fantasy;
    const firstName = names.first[randomInt(0, names.first.length - 1)];
    const lastName = names.last[randomInt(0, names.last.length - 1)];
    
    return `${firstName} ${lastName}`;
}

/**
 * Calculate experience needed for next level
 */
function getExperienceForLevel(level) {
    // Standard D&D 5e experience table (simplified)
    const expTable = [
        0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
        85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    return expTable[Math.min(level, expTable.length - 1)] || expTable[expTable.length - 1];
}

/**
 * Get level from experience points
 */
function getLevelFromExperience(exp) {
    for (let level = 1; level <= 20; level++) {
        if (exp < getExperienceForLevel(level)) {
            return level - 1;
        }
    }
    return 20; // Max level
}

/**
 * Animate element with CSS classes
 */
function animateElement(element, animationClass, duration = 1000) {
    return new Promise((resolve) => {
        element.classList.add(animationClass);
        
        const handleAnimationEnd = () => {
            element.classList.remove(animationClass);
            element.removeEventListener('animationend', handleAnimationEnd);
            resolve();
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
        
        // Fallback timeout
        setTimeout(() => {
            handleAnimationEnd();
        }, duration);
    });
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Local storage helpers with error handling
 */
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Failed to read from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove from localStorage:', e);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
            return false;
        }
    }
};

/**
 * Custom event system for decoupled communication
 */
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Error in event callback:', e);
                }
            });
        }
    }
    
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Global event bus instance
const eventBus = new EventBus();

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    constructor() {
        this.timers = new Map();
    }
    
    start(label) {
        this.timers.set(label, performance.now());
    }
    
    end(label) {
        const startTime = this.timers.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            this.timers.delete(label);
            return duration;
        }
        return null;
    }
    
    measure(label, fn) {
        this.start(label);
        const result = fn();
        this.end(label);
        return result;
    }
    
    async measureAsync(label, fn) {
        this.start(label);
        const result = await fn();
        this.end(label);
        return result;
    }
}

// Global performance monitor instance
const perf = new PerformanceMonitor();

/**
 * Error handling and logging utility
 */
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }
    
    log(level, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };
        
        this.logs.push(logEntry);
        
        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // Console output
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
        } else {
            consoleMethod(`[${level.toUpperCase()}] ${message}`);
        }
    }
    
    info(message, data) {
        this.log('info', message, data);
    }
    
    warn(message, data) {
        this.log('warn', message, data);
    }
    
    error(message, data) {
        this.log('error', message, data);
    }
    
    debug(message, data) {
        if (window.DEBUG_MODE) {
            this.log('debug', message, data);
        }
    }
    
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return [...this.logs];
    }
    
    clearLogs() {
        this.logs = [];
    }
}

// Global logger instance
const logger = new Logger();

// Production mode - disable debug logging
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG_MODE = true;
}

// Global error handler
window.addEventListener('error', (event) => {
    logger.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', {
        reason: event.reason
    });
});

// Export utilities to global scope
window.DiceTalesUtils = {
    randomInt,
    generateId,
    safeJsonParse,
    deepClone,
    debounce,
    throttle,
    getAbilityModifier,
    formatModifier,
    capitalizeFirst,
    formatText,
    sanitizeHtml,
    createElement,
    addEventListenerWithCleanup,
    showToast,
    formatTimestamp,
    isValidEmail,
    generateRandomName,
    getExperienceForLevel,
    getLevelFromExperience,
    animateElement,
    scrollToElement,
    isInViewport,
    storage,
    eventBus,
    perf,
    logger
};

// Export commonly used functions to global scope for easy access
window.randomInt = randomInt;
window.generateId = generateId;
window.safeJsonParse = safeJsonParse;
window.deepClone = deepClone;
window.getAbilityModifier = getAbilityModifier;
window.formatModifier = formatModifier;
window.capitalizeFirst = capitalizeFirst;
window.formatText = formatText;
window.sanitizeHtml = sanitizeHtml;
window.createElement = createElement;
window.showToast = showToast;
window.formatTimestamp = formatTimestamp;
window.generateRandomName = generateRandomName;
window.getExperienceForLevel = getExperienceForLevel;
window.getLevelFromExperience = getLevelFromExperience;
window.animateElement = animateElement;
window.scrollToElement = scrollToElement;
window.isInViewport = isInViewport;

// Export system instances globally
window.eventBus = eventBus;
window.perf = perf;
window.logger = logger;
