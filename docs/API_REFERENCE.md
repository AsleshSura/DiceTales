# DiceTales API Reference

## Overview
This document provides a comprehensive API reference for all classes, methods, and functions in the DiceTales application.

---

## 🎮 Core Application

### DiceTalesApp (main.js)
Main application controller that coordinates all game systems.

#### Constructor
```javascript
new DiceTalesApp()
```

#### Methods

##### `async init()`
Initializes the application and all subsystems.
- **Returns**: `Promise<void>`
- **Throws**: Error if initialization fails

##### `showScreen(screenName)`
Transitions to a specific screen.
- **Parameters**: `screenName` (string) - Screen identifier
- **Returns**: `void`

##### `async startNewCampaign(character)`
Starts a new campaign with the provided character.
- **Parameters**: `character` (object) - Character data
- **Returns**: `Promise<void>`

##### `showError(message)`
Displays an error dialog to the user.
- **Parameters**: `message` (string) - Error message
- **Returns**: `void`

---

## 👤 Character Management

### CharacterManager (character.js)
Handles character creation and management.

#### Constructor
```javascript
new CharacterManager()
```

#### Properties
- `currentStep` (number) - Current creation step (0-3)
- `steps` (Array) - Step names ['setting', 'class', 'stats', 'details']
- `pointBuyPoints` (number) - Available stat points (27)
- `settings` (object) - Campaign settings data
- `classes` (object) - Character class data

#### Methods

##### `showCharacterCreation()`
Displays the character creation interface.
- **Returns**: `void`
- **Side Effects**: Creates UI elements, updates game state

##### `nextStep()`
Advances to the next step in character creation.
- **Returns**: `boolean` - Success status
- **Validation**: Validates current step before advancing

##### `prevStep()`
Returns to the previous step.
- **Returns**: `void`

##### `completeCreation()`
Finalizes character creation and starts the game.
- **Returns**: `void`
- **Emits**: `characterCreated` event

##### `calculateRemainingPoints()`
Calculates remaining points in point-buy system.
- **Returns**: `number` - Points remaining
- **Formula**: `27 - sum(getStatCost(statValue))`

##### `getStatCost(statValue)`
Returns point cost for a stat value.
- **Parameters**: `statValue` (number) - Stat value (8-15)
- **Returns**: `number` - Point cost (0-9)

##### `adjustStat(statName, delta)`
Adjusts a character's ability score.
- **Parameters**: 
  - `statName` (string) - Stat name ('str', 'dex', etc.)
  - `delta` (number) - Change amount (+1 or -1)
- **Returns**: `boolean` - Success status

---

## 🎲 Dice System

### DiceSystem (dice.js)
3D dice rolling system with physics and animations.

#### Constructor
```javascript
new DiceSystem()
```

#### Properties
- `availableDice` (object) - Dictionary of dice types
- `selectedDice` (Array) - Currently selected dice
- `rollHistory` (Array) - History of all rolls
- `isRolling` (boolean) - Current rolling state

#### Methods

##### `async rollDice()`
Rolls all selected dice with animations.
- **Returns**: `Promise<Array>` - Array of roll results
- **Animation**: 2-second dice rolling animation

##### `rollSingleDie(diceType)`
Rolls a single die and returns result.
- **Parameters**: `diceType` (string) - Die type ('d4', 'd6', etc.)
- **Returns**: `object` - Roll result
```javascript
{
    dice: 'd20',
    sides: 20,
    value: 15,
    timestamp: '2025-07-30T12:34:56.789Z',
    critical: false,
    fumble: false
}
```

##### `toggleDiceSelection(diceType)`
Toggles selection of a dice type.
- **Parameters**: `diceType` (string) - Die type to toggle
- **Returns**: `void`
- **Side Effects**: Updates UI, saves preferences

##### `playDiceSound(diceTypes)`
Plays audio for dice rolling.
- **Parameters**: `diceTypes` (Array) - Types of dice being rolled
- **Returns**: `void`

---

## 🤖 AI Integration

### AIManager (ai.js)
HackClub AI integration for dynamic storytelling.

#### Constructor
```javascript
new AIManager()
```

#### Properties
- `apiUrl` (string) - AI API endpoint
- `model` (string) - AI model identifier
- `conversationHistory` (Array) - Conversation context
- `maxTokens` (number) - Maximum response tokens
- `initialized` (boolean) - Initialization status

#### Methods

##### `async initialize()`
Initializes the AI system and tests connectivity.
- **Returns**: `Promise<void>`
- **Fallback**: Continues in offline mode on failure

##### `async startCampaign()`
Generates opening narrative for new campaign.
- **Returns**: `Promise<void>`
- **Context**: Uses character and campaign data
- **Fallback**: Uses `showFallbackStart()` if AI unavailable

##### `async processPlayerAction(actionData)`
Processes player actions and generates responses.
- **Parameters**: `actionData` (object) - Action information
```javascript
{
    action: "I examine the mysterious rune",
    character: characterData,
    context: situationContext
}
```
- **Returns**: `Promise<void>`

##### `async processDiceRoll(rollData)`
Generates narrative responses to dice rolls.
- **Parameters**: `rollData` (object) - Dice roll results
- **Returns**: `Promise<void>`
- **Integration**: Interprets roll results in story context

##### `buildSystemPrompt()`
Constructs AI system prompt with game context.
- **Returns**: `string` - Complete system prompt
- **Context**: Character stats, campaign setting, difficulty

---

## 🔊 Audio System

### AudioManager (audio.js)
Web Audio API integration for music and sound effects.

#### Constructor
```javascript
new AudioManager()
```

#### Properties
- `audioContext` (AudioContext) - Web Audio API context
- `musicVolume` (number) - Background music volume (0-1)
- `sfxVolume` (number) - Sound effects volume (0-1)
- `musicEnabled` (boolean) - Music enabled state
- `initialized` (boolean) - Initialization status

#### Methods

##### `async init()`
Initializes Web Audio API after user interaction.
- **Returns**: `Promise<void>`
- **Browser Policy**: Waits for user gesture
- **Auto-start**: Begins background music if enabled

##### `playSFX(soundType)`
Plays synthesized sound effects.
- **Parameters**: `soundType` (string) - Sound type
- **Available Types**: 'click', 'dice', 'success', 'error', 'levelup'
- **Returns**: `void`

##### `startBackgroundMusic(theme = 'default')`
Starts themed background music.
- **Parameters**: `theme` (string) - Music theme
- **Themes**: 'default', 'adventure', 'combat', 'mystery', 'victory'
- **Returns**: `void`

##### `setMusicVolume(volume)`
Sets background music volume.
- **Parameters**: `volume` (number) - Volume level (0.0-1.0)
- **Returns**: `void`
- **Persistence**: Saves to game settings

##### `setSFXVolume(volume)`
Sets sound effects volume.
- **Parameters**: `volume` (number) - Volume level (0.0-1.0)
- **Returns**: `void`

---

## 💾 Game State Management

### GameState (gameState.js)
Centralized state management with persistence.

#### Constructor
```javascript
new GameState()
```

#### Properties
- `state` (object) - Complete game state
- `version` (string) - State version for migration
- `saveKey` (string) - LocalStorage key
- `autoSaveInterval` (number) - Auto-save timer

#### Methods

##### `get(path, defaultValue = null)`
Retrieves nested state values using dot notation.
- **Parameters**: 
  - `path` (string) - Dot-separated path
  - `defaultValue` (any) - Default if not found
- **Returns**: `any` - Retrieved value
- **Example**: `gameState.get('character.stats.str', 10)`

##### `set(path, value)`
Sets nested state values using dot notation.
- **Parameters**: 
  - `path` (string) - Dot-separated path
  - `value` (any) - Value to set
- **Returns**: `void`
- **Side Effects**: Triggers auto-save

##### `getCharacter()`
Returns complete character object.
- **Returns**: `object` - Character data
- **Structure**: Name, class, level, stats, health, etc.

##### `setCharacter(characterData)`
Updates character data.
- **Parameters**: `characterData` (object) - Character information
- **Returns**: `void`
- **Validation**: Validates character data structure

##### `getCampaign()`
Returns complete campaign object.
- **Returns**: `object` - Campaign data
- **Structure**: Setting, difficulty, story state, NPCs, etc.

##### `addToCampaignLog(entry)`
Adds entry to campaign history.
- **Parameters**: `entry` (object) - Log entry
```javascript
{
    type: 'story_event',
    content: 'Event description',
    timestamp: 'ISO timestamp',
    character: 'Character name'
}
```
- **Returns**: `void`

##### `save()`
Manually saves state to localStorage.
- **Returns**: `boolean` - Success status
- **Error Handling**: Graceful failure handling

##### `load()`
Loads state from localStorage.
- **Returns**: `void`
- **Migration**: Handles version migrations

---

## 🎨 UI Management

### UIManager (ui.js)
User interface management and animations.

#### Constructor
```javascript
new UIManager()
```

#### Properties
- `currentScreen` (string) - Active screen
- `animations` (Map) - Active animations
- `modals` (Map) - Open modals
- `components` (Map) - UI components

#### Methods

##### `showScreen(screenId, options = {})`
Transitions to a specific screen.
- **Parameters**: 
  - `screenId` (string) - Target screen
  - `options` (object) - Transition options
- **Returns**: `Promise<void>`
- **Animation**: Smooth screen transitions

##### `animate(element, animationType, options = {})`
Applies animation to DOM elements.
- **Parameters**: 
  - `element` (HTMLElement) - Target element
  - `animationType` (string) - Animation type
  - `options` (object) - Animation options
- **Returns**: `Promise<void>`
- **Types**: 'fadeIn', 'slideIn', 'scaleIn', 'bounce', etc.

##### `showModal(modalId, content, options = {})`
Displays modal dialog.
- **Parameters**: 
  - `modalId` (string) - Unique modal ID
  - `content` (string|HTMLElement) - Modal content
  - `options` (object) - Modal configuration
- **Returns**: `void`

##### `createButton(text, options = {})`
Creates styled button component.
- **Parameters**: 
  - `text` (string) - Button text
  - `options` (object) - Button options
- **Returns**: `HTMLElement` - Button element
- **Options**: type, size, disabled, icon, onClick

---

## 🛠️ Utility Functions

### Core Utilities (utils.js)
Common helper functions used throughout the application.

#### Random Generation
```javascript
randomInt(min, max)                    // Random integer in range
generateId(prefix)                     // Unique identifier
generateRandomName(setting)            // Random name for setting
```

#### Data Manipulation
```javascript
deepClone(obj)                         // Deep object cloning
safeJsonParse(jsonString, fallback)    // Safe JSON parsing
debounce(func, wait)                   // Function debouncing
throttle(func, limit)                  // Function throttling
```

#### D&D Mechanics
```javascript
getAbilityModifier(score)              // Calculate ability modifier
formatModifier(modifier)               // Format modifier for display
getExperienceForLevel(level)           // Experience required for level
getLevelFromExperience(exp)            // Calculate level from XP
```

#### DOM Utilities
```javascript
createElement(tag, attributes, content) // Create HTML elements
sanitizeHtml(html)                     // XSS prevention
showToast(message, type, duration)     // Toast notifications
animateElement(element, class, duration) // CSS animations
```

#### Storage Utilities
```javascript
storage.set(key, value)                // Safe localStorage write
storage.get(key, defaultValue)         // Safe localStorage read
storage.remove(key)                    // Remove from localStorage
storage.clear()                        // Clear all localStorage
```

### Event System
```javascript
eventBus.on(event, callback)           // Subscribe to event
eventBus.emit(event, data)             // Emit event
eventBus.off(event, callback)          // Unsubscribe
eventBus.once(event, callback)         // One-time subscription
```

### Performance Monitoring
```javascript
perf.start(label)                      // Start timing
perf.end(label)                        // End timing and log
perf.measure(label, fn)                // Time function execution
perf.measureAsync(label, asyncFn)      // Time async function
```

### Logging System
```javascript
logger.info(message, data)             // Info logging
logger.warn(message, data)             // Warning logging
logger.error(message, data)            // Error logging
logger.debug(message, data)            // Debug logging (dev only)
logger.getLogs(level)                  // Retrieve logs
```

---

## 🔔 Event System

### Global Events
Events that can be listened to throughout the application:

#### Game State Events
- `gameState:loaded` - Game state loaded from storage
- `gameState:saved` - Game state saved to storage
- `gameState:changed` - Any state modification

#### Character Events
- `character:created` - Character creation completed
- `character:updated` - Character data changed
- `character:levelUp` - Character gained a level

#### Campaign Events
- `campaign:started` - New campaign began
- `campaign:updated` - Campaign data changed
- `story:updated` - Story content updated

#### Dice Events
- `dice:rolled` - Dice roll completed
- `dice:selected` - Dice selection changed

#### UI Events
- `ui:screenChanged` - Screen transition completed
- `ui:modalShown` - Modal dialog opened
- `ui:modalHidden` - Modal dialog closed

#### Audio Events
- `audio:ready` - Audio system initialized
- `audio:musicChanged` - Background music changed

### Event Data Structures

#### Dice Roll Event Data
```javascript
{
    id: 'roll_id',
    timestamp: 'ISO_timestamp',
    dice: ['d20', 'd6'],
    results: [
        { dice: 'd20', value: 15, critical: false, fumble: false },
        { dice: 'd6', value: 4, critical: false, fumble: false }
    ],
    total: 19,
    critical: false,
    fumble: false
}
```

#### Character Creation Event Data
```javascript
{
    character: {
        name: 'Aragorn',
        class: 'fighter',
        level: 1,
        stats: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
        campaign: 'medieval-fantasy'
    }
}
```

---

## 🎯 Integration Examples

### Custom Event Handling
```javascript
// Listen for dice rolls
eventBus.on('dice:rolled', (rollData) => {
    if (rollData.critical) {
        showToast('Critical Hit!', 'success');
        audioManager.playSFX('success');
    }
});

// Character level up handling
eventBus.on('character:levelUp', (levelData) => {
    uiManager.showModal('levelup', `
        <h2>Level Up!</h2>
        <p>Welcome to level ${levelData.newLevel}!</p>
    `);
});
```

### State Management Integration
```javascript
// Save character progress
gameState.set('character.experience', newExperience);
gameState.addToCampaignLog({
    type: 'experience_gained',
    content: `Gained ${expAmount} experience`,
    character: character.name
});

// Load and use character data
const character = gameState.getCharacter();
const healthPercentage = character.health.current / character.health.maximum;
```

### AI Integration
```javascript
// Process player action
const actionData = {
    action: "I search for traps",
    character: gameState.getCharacter(),
    context: gameState.get('campaign.scene_context')
};

await aiManager.processPlayerAction(actionData);
```

---

*This API reference provides comprehensive documentation for integrating with and extending the DiceTales system. All methods include error handling and follow consistent patterns for ease of use.*
