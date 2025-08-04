/**
 * Better DM Configuration
 * Centralized configuration for the Better DM system
 */

const BetterDMConfig = {
    // AI System Configuration
    ai: {
        // Primary AI models to use (in order of preference)
        models: [
            'microsoft/GODEL-v1_1-large-seq2seq',
            'facebook/blenderbot-400M-distill',
            'microsoft/GODEL-v1_1-base-seq2seq',
            'facebook/blenderbot-1B-distill',
            'microsoft/DialoGPT-large',
            'microsoft/DialoGPT-medium',
            'gpt2-large',
            'distilgpt2'
        ],
        
        // API Configuration
        baseUrl: 'https://api-inference.huggingface.co/models/',
        maxRetries: 3,
        retryDelay: 1000, // milliseconds
        timeout: 30000, // 30 seconds
        
        // Response Parameters
        defaultParams: {
            temperature: 0.8,
            maxTokens: 300,
            topP: 0.9,
            repetitionPenalty: 1.1,
            doSample: true
        },
        
        // Context Management
        maxHistoryLength: 15,
        contextWindow: 2048,
        qualityThreshold: 0.7
    },
    
    // Campaign Roadmap Configuration
    roadmap: {
        // Default campaign structure
        defaultStructure: {
            estimatedSessions: 6,
            chaptersPerCampaign: 4,
            scenesPerChapter: 3,
            difficultyProgression: 'gradual' // 'gradual', 'steep', 'plateau'
        },
        
        // Scene types and their properties
        sceneTypes: {
            story: { minDifficulty: 1, maxDifficulty: 3, avgLength: 200 },
            exploration: { minDifficulty: 2, maxDifficulty: 6, avgLength: 250 },
            social: { minDifficulty: 2, maxDifficulty: 7, avgLength: 300 },
            combat: { minDifficulty: 3, maxDifficulty: 9, avgLength: 350 },
            puzzle: { minDifficulty: 4, maxDifficulty: 8, avgLength: 280 },
            climax: { minDifficulty: 6, maxDifficulty: 10, avgLength: 400 }
        },
        
        // Adaptation sensitivity
        adaptationTriggers: {
            majorDeviation: ['abandon', 'refuse', 'instead', 'different', 'leave'],
            minorDeviation: ['maybe', 'but', 'however', 'although'],
            emergencyKeywords: ['quit', 'stop', 'end', 'done']
        },
        
        // Emergency scenario settings
        emergencyScenarios: {
            maxGenerated: 5,
            activationThreshold: 3, // number of major deviations
            fallbackEnabled: true
        }
    },
    
    // User Interface Configuration
    ui: {
        // Timing and animations
        animationDuration: 300, // milliseconds
        typingSpeed: 50, // characters per second
        autoScrollEnabled: true,
        loadingMinDuration: 1000,
        
        // Input handling
        actionDebounceTime: 2000,
        maxInputLength: 1000,
        minInputLength: 3,
        
        // Display settings
        maxVisibleMessages: 50,
        messageTimestamps: true,
        progressBarAnimation: true,
        
        // Responsive breakpoints
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        }
    },
    
    // Performance and Optimization
    performance: {
        // Caching
        enableCaching: true,
        cacheExpiry: 300000, // 5 minutes
        maxCacheSize: 100,
        
        // Auto-save
        autoSaveEnabled: true,
        autoSaveInterval: 300000, // 5 minutes
        maxAutoSaves: 5,
        
        // Memory management
        maxConversationHistory: 100,
        cleanupInterval: 600000, // 10 minutes
        memoryThreshold: 0.8
    },
    
    // Development and Debugging
    development: {
        enableLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        enablePerformanceMonitoring: true,
        showDebugPanel: false,
        enableHotReload: false
    },
    
    // Features and Capabilities
    features: {
        // Core features
        campaignGeneration: true,
        adaptiveRoadmap: true,
        emergencyScenarios: true,
        qualityAssurance: true,
        
        // Advanced features
        multiCharacterSupport: false, // Future feature
        voiceInterface: false, // Future feature
        collaborativeMode: false, // Future feature
        advancedAnalytics: false, // Future feature
        
        // Export/Import
        campaignExport: true,
        logExport: true,
        roadmapSharing: false // Future feature
    },
    
    // Content and Tone Settings
    content: {
        // Default themes and their characteristics
        themes: {
            'heroic': {
                tone: 'inspiring',
                difficultyBias: 0,
                morality: 'clear',
                examples: ['save the kingdom', 'defeat evil', 'protect innocents']
            },
            'dark': {
                tone: 'ominous',
                difficultyBias: 1,
                morality: 'complex',
                examples: ['survival horror', 'moral ambiguity', 'hard choices']
            },
            'mystery': {
                tone: 'intriguing',
                difficultyBias: 0,
                morality: 'neutral',
                examples: ['investigation', 'clues', 'revelation']
            },
            'political': {
                tone: 'sophisticated',
                difficultyBias: 1,
                morality: 'complex',
                examples: ['intrigue', 'diplomacy', 'consequences']
            },
            'exploration': {
                tone: 'adventurous',
                difficultyBias: 0,
                morality: 'neutral',
                examples: ['discovery', 'unknown lands', 'wonder']
            },
            'horror': {
                tone: 'frightening',
                difficultyBias: 2,
                morality: 'dark',
                examples: ['fear', 'supernatural', 'survival']
            }
        },
        
        // Content filtering and appropriateness
        contentRating: 'PG-13', // 'G', 'PG', 'PG-13', 'R'
        violenceLevel: 'moderate', // 'none', 'mild', 'moderate', 'high'
        languageFilter: true,
        adultContentFilter: true
    },
    
    // Error Handling and Recovery
    errorHandling: {
        enableGracefulDegradation: true,
        fallbackResponses: [
            "I need a moment to think about that. Could you try a different action?",
            "The situation is complex. What would you like to focus on?",
            "Let me reconsider the current situation. Please try again.",
            "Something unexpected happened. How would you like to proceed?"
        ],
        maxConsecutiveErrors: 3,
        errorReportingEnabled: false, // Set to true for production analytics
        recoveryStrategies: {
            'ai_failure': 'fallback_response',
            'roadmap_corruption': 'emergency_scenario',
            'network_error': 'retry_with_backoff',
            'memory_overflow': 'cleanup_and_continue'
        }
    },
    
    // Localization (Future feature)
    localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en'], // Future: ['en', 'es', 'fr', 'de']
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    },
    
    // Analytics and Metrics (Future feature)
    analytics: {
        enabled: false,
        trackingId: '', // Add your analytics ID
        events: {
            campaignStart: true,
            sceneComplete: true,
            playerAction: false, // Privacy consideration
            errorOccurrence: true,
            featureUsage: true
        }
    }
};

// Environment-specific overrides
if (typeof window !== 'undefined') {
    // Browser environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Development overrides
        BetterDMConfig.development.enableLogging = true;
        BetterDMConfig.development.logLevel = 'debug';
        BetterDMConfig.development.showDebugPanel = true;
        BetterDMConfig.ai.timeout = 60000; // Longer timeout for development
    }
    
    // Production optimizations
    if (window.location.protocol === 'https:') {
        BetterDMConfig.performance.enableCaching = true;
        BetterDMConfig.analytics.enabled = true; // Enable in production
    }
}

// Configuration validation
function validateConfig() {
    const errors = [];
    
    // Validate AI configuration
    if (!BetterDMConfig.ai.models || BetterDMConfig.ai.models.length === 0) {
        errors.push('At least one AI model must be configured');
    }
    
    if (BetterDMConfig.ai.maxRetries < 1 || BetterDMConfig.ai.maxRetries > 10) {
        errors.push('AI maxRetries must be between 1 and 10');
    }
    
    // Validate roadmap configuration
    if (BetterDMConfig.roadmap.defaultStructure.chaptersPerCampaign < 1) {
        errors.push('Must have at least 1 chapter per campaign');
    }
    
    if (BetterDMConfig.roadmap.defaultStructure.scenesPerChapter < 1) {
        errors.push('Must have at least 1 scene per chapter');
    }
    
    // Validate UI configuration
    if (BetterDMConfig.ui.actionDebounceTime < 100) {
        errors.push('Action debounce time too low, may cause performance issues');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Configuration utilities
const BetterDMConfigUtils = {
    // Get configuration for specific component
    getAIConfig: () => BetterDMConfig.ai,
    getRoadmapConfig: () => BetterDMConfig.roadmap,
    getUIConfig: () => BetterDMConfig.ui,
    
    // Update configuration at runtime
    updateConfig: (path, value) => {
        const keys = path.split('.');
        let obj = BetterDMConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    },
    
    // Get theme-specific settings
    getThemeConfig: (theme) => {
        return BetterDMConfig.content.themes[theme] || BetterDMConfig.content.themes['heroic'];
    },
    
    // Validate current configuration
    validate: validateConfig,
    
    // Export configuration for debugging
    export: () => JSON.stringify(BetterDMConfig, null, 2),
    
    // Reset to defaults
    reset: () => {
        // This would reload the default configuration
        console.warn('Configuration reset not implemented in this version');
    }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BetterDMConfig, BetterDMConfigUtils };
} else {
    window.BetterDMConfig = BetterDMConfig;
    window.BetterDMConfigUtils = BetterDMConfigUtils;
}

// Initial validation
const validation = validateConfig();
if (!validation.valid) {
    console.error('Better DM Configuration Errors:', validation.errors);
}
