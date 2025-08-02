# DiceTales Debugging & Troubleshooting Guide

This guide provides comprehensive information for debugging common issues, understanding error patterns, and maintaining the DiceTales application.

## 🐛 Common Issues and Solutions

### 1. Application Won't Load / Blank Screen

#### Symptoms:
- Loading screen shows indefinitely
- Blank white/black screen after loading
- Console errors about missing systems

#### Diagnosis:
```javascript
// Check in browser console
console.log('App exists:', typeof app !== 'undefined');
console.log('App initialized:', app?.initialized);
console.log('Current screen:', app?.currentScreen);

// Check loading screen state
const loadingScreen = document.getElementById('loading-screen');
console.log('Loading screen active:', loadingScreen?.classList.contains('active'));

// Check required systems
const systems = ['gameState', 'characterManager', 'diceSystem', 'uiManager'];
systems.forEach(sys => {
    console.log(`${sys}:`, typeof window[sys] !== 'undefined' ? 'OK' : 'MISSING');
});
```

#### Solutions:
```javascript
// Force hide loading screen
window.debugHideLoading = function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
        loadingScreen.classList.remove('active');
    }
};

// Force show character creation
window.debugShowCharacterCreation = function() {
    if (app && app.showCharacterCreation) {
        app.showCharacterCreation();
    }
};

// Emergency recovery
window.debugForceStart = function() {
    window.debugHideLoading();
    setTimeout(() => {
        window.debugShowCharacterCreation();
    }, 500);
};
```

### 2. Character Creation Issues

#### Symptoms:
- Can't advance through creation steps
- Stats not updating properly
- Settings or classes not loading

#### Diagnosis:
```javascript
// Check character manager state
console.log('Character Manager:', window.characterManager);
console.log('Current step:', characterManager?.currentStep);
console.log('Steps:', characterManager?.steps);

// Check game state character data
console.log('Character in state:', gameState.getCharacter());

// Check point buy system
if (characterManager) {
    console.log('Points remaining:', characterManager.getRemainingPoints());
    console.log('Current stats:', characterManager.getCurrentStats());
}
```

#### Solutions:
```javascript
// Reset character creation
characterManager?.resetToStep(0);

// Fix stuck point buy
characterManager?.resetStats();

// Manual character creation bypass
const testCharacter = {
    name: 'Test Hero',
    class: 'warrior',
    setting: 'medieval-fantasy',
    level: 1,
    stats: { str: 15, dex: 12, con: 14, int: 10, wis: 13, cha: 11 }
};
app?.onCharacterCreated(testCharacter);
```

### 3. AI System Problems

#### Symptoms:
- AI responses not generating
- "AI thinking" but no response
- Error messages about HuggingFace

#### Diagnosis:
```javascript
// Check AI manager state
console.log('AI Manager:', typeof aiManager !== 'undefined');
console.log('AI initialized:', aiManager?.initialized);
console.log('Current model:', aiManager?.currentHuggingFaceModel);

// Check conversation state
console.log('Is processing:', aiManager?.isProcessing);
console.log('Conversation history:', aiManager?.conversationHistory);

// Test AI connection
aiManager?.testConnection().then(result => {
    console.log('AI connection test:', result);
});
```

#### Solutions:
```javascript
// Reset AI state
if (aiManager) {
    aiManager.isProcessing = false;
    aiManager.clearHistory();
}

// Fallback to simple responses
aiManager?.enableSimpleFallback = true;

// Force model switch
aiManager?.switchToNextModel();
```

### 4. Dice System Issues

#### Symptoms:
- Dice not showing when requested
- Can't roll dice / buttons disabled
- Roll results not displaying

#### Diagnosis:
```javascript
// Check dice system state
console.log('Dice System:', typeof diceSystem !== 'undefined');
console.log('Can roll dice:', diceSystem?.canRollDice());
console.log('Current turn:', diceSystem?.currentTurnId);
console.log('Has rolled this turn:', diceSystem?.hasRolledThisTurn);

// Check dice display
const diceContainer = document.getElementById('dice-display');
console.log('Dice container:', diceContainer);
console.log('Dice visible:', diceContainer?.style.display !== 'none');
```

#### Solutions:
```javascript
// Reset dice system
if (diceSystem) {
    diceSystem.hasRolledThisTurn = false;
    diceSystem.testMode = true; // Allow unlimited rolls
}

// Force show dice
diceSystem?.showDiceDisplay('d20');

// Manual dice roll
const rollResult = diceSystem?.rollDice(20, 1, 0);
console.log('Manual roll result:', rollResult);
```

### 5. State Management Problems

#### Symptoms:
- Settings not saving
- Game progress lost
- Character data corrupted

#### Diagnosis:
```javascript
// Check localStorage
console.log('LocalStorage available:', typeof Storage !== 'undefined');
console.log('Game state size:', gameState?.getStateSize());
console.log('Save count:', gameState?.get('meta.saves_count'));

// Check state validity
console.log('State info:', gameState?.getStateInfo());

// Check localStorage directly
const savedState = localStorage.getItem('dicetales_gamestate');
console.log('Raw saved state:', savedState ? 'EXISTS' : 'MISSING');
```

#### Solutions:
```javascript
// Force save game state
gameState?.save();

// Clear corrupted state
localStorage.removeItem('dicetales_gamestate');
gameState?.reset();

// Export/backup current state
const exportedState = gameState?.export();
console.log('Exported state for backup:', exportedState);

// Manual state repair
gameState?.set('character.name', 'Recovered Hero');
gameState?.set('campaign.setting', 'medieval-fantasy');
```

## 🔧 Development Debug Tools

### Global Debug Functions
```javascript
// Add to browser console for debugging

// System Status Check
window.debugSystemStatus = function() {
    const systems = {
        app: typeof app !== 'undefined',
        gameState: typeof gameState !== 'undefined',
        characterManager: typeof characterManager !== 'undefined',
        aiManager: typeof aiManager !== 'undefined',
        diceSystem: typeof diceSystem !== 'undefined',
        uiManager: typeof uiManager !== 'undefined',
        audioManager: typeof audioManager !== 'undefined'
    };
    
    console.table(systems);
    
    // Check initialization status
    Object.entries(systems).forEach(([name, exists]) => {
        if (exists && window[name]?.initialized !== undefined) {
            console.log(`${name} initialized:`, window[name].initialized);
        }
    });
};

// Screen Debug
window.debugScreens = function() {
    const screens = document.querySelectorAll('.screen');
    console.log('Total screens found:', screens.length);
    
    screens.forEach(screen => {
        console.log(`Screen ${screen.id}:`, {
            display: screen.style.display,
            visible: screen.style.display !== 'none',
            active: screen.classList.contains('active')
        });
    });
};

// State Debug
window.debugState = function() {
    console.log('=== GAME STATE DEBUG ===');
    console.log('Character:', gameState?.getCharacter());
    console.log('Campaign:', gameState?.getCampaign());
    console.log('Settings:', gameState?.get('settings'));
    console.log('UI State:', gameState?.get('ui'));
    console.log('Metadata:', gameState?.get('meta'));
};

// AI Debug
window.debugAI = function() {
    if (typeof aiManager === 'undefined') {
        console.log('AI Manager not available');
        return;
    }
    
    console.log('=== AI SYSTEM DEBUG ===');
    console.log('Initialized:', aiManager.initialized);
    console.log('Processing:', aiManager.isProcessing);
    console.log('Current model:', aiManager.currentHuggingFaceModel);
    console.log('Conversation length:', aiManager.conversationHistory?.length || 0);
    console.log('Evaluation enabled:', aiManager.enableEvaluation);
};

// Force Recovery
window.debugRecovery = function() {
    console.log('🚨 Starting emergency recovery...');
    
    // Stop any running processes
    if (aiManager) aiManager.isProcessing = false;
    if (diceSystem) diceSystem.hasRolledThisTurn = false;
    
    // Hide loading screen
    window.debugHideLoading();
    
    // Show character creation or game screen
    if (gameState?.isCharacterCreated()) {
        app?.showScreen('game');
        console.log('✅ Recovered to game screen');
    } else {
        app?.showCharacterCreation();
        console.log('✅ Recovered to character creation');
    }
};
```

### Error Monitoring Setup
```javascript
// Enhanced error logging
window.addEventListener('error', (event) => {
    const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    console.error('🚨 Global Error:', errorInfo);
    
    // Store error for debugging
    const errors = JSON.parse(localStorage.getItem('dicetales_errors') || '[]');
    errors.push(errorInfo);
    errors.splice(0, Math.max(0, errors.length - 10)); // Keep last 10 errors
    localStorage.setItem('dicetales_errors', JSON.stringify(errors));
});

// Promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
    });
});

// Debug error retrieval
window.getStoredErrors = function() {
    const errors = JSON.parse(localStorage.getItem('dicetales_errors') || '[]');
    console.table(errors);
    return errors;
};
```

## 📊 Performance Monitoring

### Performance Debug Tools
```javascript
// Performance monitoring
window.debugPerformance = function() {
    const perfData = {
        // Memory usage (if available)
        memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
        } : 'Not available',
        
        // Navigation timing
        navigation: {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            rendering: performance.timing.loadEventEnd - performance.timing.domContentLoadedEventEnd
        },
        
        // Game state size
        stateSize: gameState ? gameState.getStateSize() + ' characters' : 'N/A',
        
        // Active timers and intervals
        timers: {
            autoSave: gameState?.autoSaveInterval ? 'Active' : 'Inactive',
            audio: audioManager?.initialized ? 'Active' : 'Inactive'
        }
    };
    
    console.log('=== PERFORMANCE DEBUG ===');
    console.table(perfData);
};

// FPS monitoring
window.startFPSMonitor = function() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            console.log(`FPS: ${fps}`);
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
    console.log('FPS monitoring started');
};
```

## 🧪 Testing Utilities

### Manual Testing Functions
```javascript
// Character creation testing
window.testCharacterCreation = function() {
    console.log('🧪 Testing character creation...');
    
    // Test setting selection
    const setting = 'medieval-fantasy';
    characterManager?.selectSetting(setting);
    console.log('✓ Setting selected:', setting);
    
    // Test class selection
    const characterClass = 'warrior';
    characterManager?.selectClass(characterClass);
    console.log('✓ Class selected:', characterClass);
    
    // Test stat allocation
    characterManager?.resetStats();
    characterManager?.increaseStat('str');
    characterManager?.increaseStat('str');
    console.log('✓ Stats modified');
    
    // Test character completion
    characterManager?.setCharacterName('Test Hero');
    characterManager?.setBackground('Test background');
    console.log('✓ Character details set');
    
    const character = characterManager?.validateCharacter();
    console.log('✓ Character validation:', character ? 'PASSED' : 'FAILED');
};

// AI system testing
window.testAI = function() {
    console.log('🧪 Testing AI system...');
    
    if (!aiManager) {
        console.log('❌ AI Manager not available');
        return;
    }
    
    // Test connection
    aiManager.testConnection().then(result => {
        console.log('✓ AI connection test:', result ? 'PASSED' : 'FAILED');
    });
    
    // Test simple prompt
    const testPrompt = "You are a friendly dungeon master. Say hello.";
    aiManager.generateResponse(testPrompt).then(response => {
        console.log('✓ AI response test:', response ? 'PASSED' : 'FAILED');
        console.log('Response:', response);
    }).catch(error => {
        console.log('❌ AI response test failed:', error);
    });
};

// Dice system testing
window.testDice = function() {
    console.log('🧪 Testing dice system...');
    
    if (!diceSystem) {
        console.log('❌ Dice System not available');
        return;
    }
    
    // Test dice roll
    const result = diceSystem.rollDice(20, 1, 0);
    console.log('✓ Dice roll test:', result);
    
    // Test turn management
    diceSystem.startNewTurn();
    console.log('✓ New turn started:', diceSystem.currentTurnId);
    
    // Test roll eligibility
    console.log('✓ Can roll dice:', diceSystem.canRollDice());
    
    // Test dice display
    diceSystem.showDiceDisplay('d20');
    console.log('✓ Dice display shown');
};

// Full system test
window.testAllSystems = function() {
    console.log('🧪 Running full system test...');
    
    window.debugSystemStatus();
    window.testCharacterCreation();
    window.testAI();
    window.testDice();
    window.debugPerformance();
    
    console.log('✅ Full system test completed');
};
```

## 🔍 Logging and Monitoring

### Enhanced Logging System
```javascript
// Enhanced logger with levels
const logger = {
    levels: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 },
    currentLevel: 2, // INFO by default
    
    log(level, message, ...args) {
        if (this.levels[level] <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level}]`;
            console.log(prefix, message, ...args);
        }
    },
    
    error(message, ...args) { this.log('ERROR', message, ...args); },
    warn(message, ...args) { this.log('WARN', message, ...args); },
    info(message, ...args) { this.log('INFO', message, ...args); },
    debug(message, ...args) { this.log('DEBUG', message, ...args); }
};

// Set debug level
window.setLogLevel = function(level) {
    logger.currentLevel = logger.levels[level.toUpperCase()] || 2;
    console.log('Log level set to:', level);
};
```

### Event Monitoring
```javascript
// Event bus monitoring
window.monitorEvents = function() {
    const originalEmit = eventBus.emit;
    const originalOn = eventBus.on;
    
    eventBus.emit = function(event, data) {
        console.log('📡 Event emitted:', event, data);
        return originalEmit.call(this, event, data);
    };
    
    eventBus.on = function(event, callback) {
        console.log('👂 Event listener added:', event);
        return originalOn.call(this, event, callback);
    };
    
    console.log('Event monitoring enabled');
};
```

## 🚨 Emergency Recovery Procedures

### Complete System Reset
```javascript
window.emergencyReset = function() {
    console.log('🚨 EMERGENCY RESET INITIATED');
    
    // 1. Clear all localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dicetales_')) {
            localStorage.removeItem(key);
        }
    });
    
    // 2. Reset game state
    if (gameState) {
        gameState.reset();
    }
    
    // 3. Stop all running processes
    if (aiManager) {
        aiManager.isProcessing = false;
        aiManager.clearHistory();
    }
    
    // 4. Reset UI state
    if (uiManager) {
        uiManager.closeAllModals();
    }
    
    // 5. Force reload
    console.log('🔄 Reloading application...');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};
```

### Data Recovery
```javascript
window.recoverData = function() {
    console.log('🔧 Attempting data recovery...');
    
    // Try to recover from different storage keys
    const possibleKeys = [
        'dicetales_gamestate',
        'dicetales_character',
        'dicetales_campaign',
        'dicetales_backup'
    ];
    
    let recovered = false;
    
    possibleKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log(`Found data in ${key}:`, parsed);
                
                if (parsed.character || parsed.campaign) {
                    // Attempt to restore
                    if (gameState) {
                        if (parsed.character) gameState.setCharacter(parsed.character);
                        if (parsed.campaign) gameState.setCampaign(parsed.campaign);
                        gameState.save();
                        recovered = true;
                    }
                }
            } catch (e) {
                console.log(`Invalid data in ${key}`);
            }
        }
    });
    
    if (recovered) {
        console.log('✅ Data recovery successful');
        window.location.reload();
    } else {
        console.log('❌ No recoverable data found');
    }
};
```

This comprehensive debugging guide provides developers and advanced users with the tools needed to diagnose and resolve issues in the DiceTales application effectively.
