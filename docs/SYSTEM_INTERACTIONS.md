# DiceTales System Interactions Guide

This document details how each system in DiceTales interacts with others, including data flow, dependencies, and communication patterns.

## 🔄 System Interaction Matrix

| System | Depends On | Provides To | Communication Method |
|--------|------------|-------------|---------------------|
| main.js | All systems | Global coordination | Direct calls, EventBus |
| gameState.js | utils.js, localStorage | All systems | Direct access, Events |
| character.js | gameState.js, utils.js | main.js, ui.js | Events, Direct calls |
| ai.js | gameState.js, dmEvaluator.js | main.js, ui.js | Events, Promises |
| dice.js | gameState.js, utils.js | ai.js, ui.js | Events, Direct calls |
| ui.js | All systems | User interactions | Events, DOM manipulation |
| audio.js | gameState.js | All systems | Events, Global methods |
| dmEvaluator.js | utils.js | ai.js | Direct integration |
| evaluationUI.js | dmEvaluator.js, ai.js | ui.js | Direct calls |

## 🎮 Application Lifecycle

### 1. Initialization Phase
```
Browser Load → index.html
    ↓
Script Loading (in order):
    config.js → AI configuration constants
    utils.js → Helper functions
    gameState.js → State management initialization
    character.js → CharacterManager creation
    dice.js → DiceSystem initialization
    dmEvaluator.js → DMEvaluator class definition
    ai.js → AIManager with evaluation integration
    audio.js → AudioManager setup
    ui.js → UIManager initialization
    main.js → DiceTalesApp creation and init()
```

### 2. System Validation
```javascript
// main.js checks all required systems
const systems = [
    { name: 'gameState', required: true },
    { name: 'characterManager', required: true },
    { name: 'diceSystem', required: true },
    { name: 'uiManager', required: true },
    { name: 'aiManager', required: false },
    { name: 'audioManager', required: false }
];
```

### 3. Flow Decision
```
checkExistingGame()
    ↓
Has Saved Game? → Yes → loadExistingGame() → Show Game Screen
    ↓
    No → showCharacterCreation() → Character Creation Flow
```

## 👤 Character Creation Flow

### Step-by-Step Interaction
```
1. main.js calls characterManager.showCharacterCreation()
2. characterManager renders multi-step wizard
3. User completes each step:
   - Setting Selection (medieval-fantasy, modern-day, etc.)
   - Class Selection (warrior, scholar, scout, etc.)
   - Stat Allocation (point-buy system)
   - Character Details (name, background)
4. characterManager.validateCharacter() ensures completeness
5. characterManager emits 'character:created' event
6. main.js receives event and calls startNewCampaign()
7. gameState.setCharacter() persists character data
8. Transition to game screen
```

### Character Data Flow
```javascript
// Character creation data structure
const characterData = {
    name: "Hero Name",
    class: "warrior",
    setting: "medieval-fantasy",
    level: 1,
    stats: {
        str: 15, dex: 12, con: 14,
        int: 10, wis: 13, cha: 11
    },
    background: "Chosen background story",
    // ... additional character data
};

// Flow: characterManager → main.js → gameState → localStorage
```

## 🤖 AI System Integration

### AI Response Generation Flow
```
Player Action Input
    ↓
ui.js captures input
    ↓
main.js.handlePlayerAction()
    ↓
aiManager.processPlayerAction()
    ↓
aiManager.makeHuggingFaceRequest()
    ↓
HuggingFace API Response
    ↓
dmEvaluator.evaluateResponse() (if enabled)
    ↓
AI response processed and formatted
    ↓
Event: 'ai:response' emitted
    ↓
ui.js displays response
    ↓
diceSystem.detectAndShowDiceRequest() checks for dice needs
```

### AI Context Building
```javascript
// aiManager builds context from multiple sources
const context = {
    character: gameState.getCharacter(),
    campaign: gameState.getCampaign(),
    location: gameState.get('campaign.current_location'),
    recentHistory: gameState.get('campaign.campaign_log').slice(-5),
    playerAction: currentAction,
    rollResult: completedDiceRoll || null
};
```

## 🎲 Dice System Interactions

### Turn-Based Dice Management
```
AI Response Generated
    ↓
diceSystem.startNewTurn() - creates unique turn ID
    ↓
diceSystem.detectAndShowDiceRequest() - parses AI text for dice needs
    ↓
If dice needed: diceSystem.showDiceDisplay()
    ↓
Player rolls dice (if eligible)
    ↓
diceSystem.markDiceRolled() - prevents duplicate rolls
    ↓
Roll result sent to aiManager for next response
```

### Dice Request Detection
```javascript
// AI responses are parsed for dice patterns
const dicePatterns = [
    /(?:roll|make|attempt).*?(?:d20|D20|twenty-sided)/i,
    /(?:strength|dexterity|constitution).*?(?:check|save)/i,
    /(?:skill|ability).*?(?:check|test)/i,
    // ... more patterns
];
```

## 💾 State Management Flow

### Data Persistence Pattern
```
User Action/System Change
    ↓
System calls gameState.set(path, value)
    ↓
gameState validates and updates internal state
    ↓
gameState.save() triggered (auto-save or manual)
    ↓
JSON.stringify(state) → localStorage['dicetales_gamestate']
    ↓
Event: 'gameState:changed' emitted
    ↓
Dependent systems update displays/behavior
```

### State Structure Access
```javascript
// Direct path access
gameState.get('character.stats.str');
gameState.set('campaign.current_location', 'Tavern');

// Helper methods
gameState.getCharacter();
gameState.setCharacter(characterData);
gameState.getCampaign();
gameState.setCampaign(campaignData);

// Settings management
gameState.getSetting('audio_settings.music_volume');
gameState.setSetting('display_preferences.theme', 'dark');
```

## 🖥️ UI System Coordination

### Modal Management
```
User Clicks Navigation Button
    ↓
uiManager.setupNavigation() event handler
    ↓
uiManager.openModal(modalId)
    ↓
Modal-specific content rendering:
    - Settings: uiManager.renderSettingsForm()
    - Character Sheet: uiManager.openCharacterSheetModal()
    - Campaign Log: uiManager.openCampaignLogModal()
    ↓
User interactions within modal
    ↓
uiManager.saveSettings() / other save methods
    ↓
gameState updates and persistence
    ↓
uiManager.closeModal(modalId)
```

### Screen Management
```javascript
// Screen transitions coordinated by main.js
showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenName);
    targetScreen.style.display = 'flex';
    targetScreen.classList.add('active');
    
    // Initialize screen-specific functionality
    this.initializeScreen(screenName);
}
```

## 🔊 Audio System Integration

### Event-Driven Audio
```javascript
// Audio system listens for game events
eventBus.on('campaign:start', () => audioManager.playBackgroundMusic('adventure'));
eventBus.on('dice:rolled', (data) => audioManager.playDiceSound(data.dice));
eventBus.on('character:levelUp', () => audioManager.playSFX('levelup'));
eventBus.on('ui:buttonClick', () => audioManager.playSFX('click'));

// Settings integration
eventBus.on('settings:audioChanged', (settings) => {
    audioManager.updateSettings(settings);
});
```

### Web Audio API Management
```
User First Interaction
    ↓
audioManager.setupUserInteractionHandler() detects
    ↓
audioManager.init() creates AudioContext
    ↓
audioManager.loadSettings() from gameState
    ↓
audioManager.startBackgroundMusic() if enabled
    ↓
Procedural audio generation and playback
```

## 📊 DM Evaluation System

### AI Quality Assessment Flow
```
aiManager generates response
    ↓
If evaluation enabled:
    dmEvaluator.evaluateResponse(response, context)
    ↓
    Score calculation across 6 criteria:
    - Immersion & Atmosphere (25%)
    - DM Personality (20%)
    - Player Engagement (20%)
    - Narrative Flow (15%)
    - D&D Authenticity (10%)
    - Creative Flair (10%)
    ↓
    dmEvaluator.generateFeedback() creates suggestions
    ↓
    dmEvaluator.addToHistory() stores evaluation
    ↓
    If auto-improvement enabled: adjust future prompts
```

### Evaluation UI Integration
```
evaluationUI.initialize(aiManager)
    ↓
evaluationUI.setupUI() syncs toggle states
    ↓
User opens DM Evaluation modal
    ↓
evaluationUI.updateStats() displays current metrics
    ↓
evaluationUI.updateRecentEvaluations() shows history
    ↓
User toggles evaluation/auto-improvement settings
    ↓
Settings saved to aiManager and gameState
```

## 🔄 Event Bus Communication

### Global Event System
```javascript
// Central event bus for inter-system communication
const eventBus = {
    events: {},
    on(event, callback) { /* register listener */ },
    emit(event, data) { /* notify all listeners */ },
    off(event, callback) { /* remove listener */ }
};
```

### Common Events
```javascript
// Character System Events
'character:created' → { character: characterData }
'character:updated' → { character: characterData }
'character:levelUp' → { level: newLevel, gains: [...] }

// Campaign System Events  
'campaign:start' → { campaign: campaignData }
'campaign:update' → { campaign: campaignData }

// AI System Events
'ai:response' → { content: responseText, type: 'story'|'action' }
'ai:thinking' → { status: 'processing'|'complete' }
'ai:error' → { error: errorMessage }

// Dice System Events
'dice:rolled' → { dice: 'd20', result: 15, modifier: +3 }
'dice:request' → { type: 'd20', reason: 'skill check' }

// UI System Events
'ui:screenChange' → { from: 'character-creation', to: 'game' }
'ui:modalOpen' → { modal: 'settings' }
'ui:buttonClick' → { button: 'save-game' }

// Game State Events
'gameState:loaded' → { state: gameStateData }
'gameState:saved' → { success: true }
'gameState:changed' → { path: 'character.stats.str', value: 15 }

// Audio System Events
'audio:ready' → { initialized: true }
'audio:musicStart' → { track: 'adventure' }
'audio:volumeChange' → { music: 0.5, sfx: 0.7 }
```

## 🔧 Error Handling and Recovery

### System Recovery Patterns
```
System Initialization Failure
    ↓
main.js catches error in initializeSystems()
    ↓
Attempt recovery: showCharacterCreation() as fallback
    ↓
If character manager fails: showBasicCharacterCreation()
    ↓
If all fails: forceGameStart() with minimal functionality
    ↓
Display error message with reload option
```

### Graceful Degradation
```javascript
// Each system checks for dependencies
if (typeof aiManager !== 'undefined' && aiManager.initialized) {
    // Full AI functionality
    await aiManager.generateResponse(prompt);
} else {
    // Fallback to simple responses
    this.displayFallbackResponse(action);
}

// Audio system optional
if (typeof audioManager !== 'undefined' && audioManager.initialized) {
    audioManager.playSFX('dice');
} // No audio if not available - silent degradation
```

## 📱 Responsive Design Integration

### CSS-JS Coordination
```
responsive.css defines breakpoints
    ↓
JavaScript detects screen size changes
    ↓
uiManager.handleResize() adjusts layouts
    ↓
Modal sizing and positioning updates
    ↓
Touch event handling for mobile
    ↓
Keyboard vs touch input detection
```

### Mobile-Specific Behaviors
```javascript
// Touch-friendly interface adjustments
if ('ontouchstart' in window) {
    // Mobile-specific event handlers
    document.addEventListener('touchstart', handleTouch);
    // Adjust button sizes, spacing
    document.body.classList.add('touch-device');
}

// Screen orientation handling
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        uiManager.adjustForOrientation();
    }, 100);
});
```

## 🔐 Security and Data Validation

### Input Sanitization
```javascript
// utils.js provides safe parsing
function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('Failed to parse JSON:', e);
        return fallback;
    }
}

// Character validation
characterManager.validateCharacter(character) {
    // Ensure required fields
    // Validate stat ranges
    // Sanitize text inputs
    // Prevent injection attacks
}
```

### State Validation
```javascript
// gameState validates all updates
set(path, value) {
    // Path validation
    // Type checking
    // Range validation for numeric values
    // String sanitization
    this.state = setNestedProperty(this.state, path, value);
    this.validate();
}
```

This interaction guide demonstrates how DiceTales maintains clean separation of concerns while enabling rich inter-system communication through events, direct calls, and shared state management.
