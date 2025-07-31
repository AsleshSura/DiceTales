# DiceTales API Reference

Complete code documentation for developers working with the DiceTales codebase.

## 📋 Table of Contents

- [Core Classes](#core-classes)
- [AI System](#ai-system)
- [Game Logic](#game-logic)
- [Utility Functions](#utility-functions)
- [Configuration](#configuration)
- [Events](#events)

## 🎮 Core Classes

### GameController
**File**: `js/main.js`
**Purpose**: Main game coordinator and initialization

#### Constructor
```javascript
new GameController()
```

#### Methods

##### `async init()`
Initializes the game system and loads saved state.
```javascript
await gameController.init();
```

##### `startNewGame()`
Begins a new adventure with character creation.
```javascript
gameController.startNewGame();
```

##### `async processChoice(choiceIndex, choiceText)`
Processes player choice and generates next story segment.
```javascript
await gameController.processChoice(0, "Search the ancient ruins");
```
- **Parameters**:
  - `choiceIndex` (number): Index of chosen option
  - `choiceText` (string): Text of the chosen action
- **Returns**: Promise resolving to updated game state

##### `rollDice(statName = null)`
Performs a D20 roll with optional stat modifier.
```javascript
const result = gameController.rollDice('strength');
// Returns: { roll: 15, modifier: 3, total: 18, isCritical: false }
```

---

## 🤖 AI System

### HuggingFaceAI
**File**: `js/huggingfaceAI.js`
**Purpose**: Primary AI service using HuggingFace Inference API

#### Constructor
```javascript
new HuggingFaceAI()
```

#### Properties
```javascript
{
    baseUrl: 'https://api-inference.huggingface.co/models/',
    modelQueue: [
        'microsoft/DialoGPT-large',
        'microsoft/DialoGPT-medium',
        'gpt2-large',
        'gpt2',
        'distilgpt2'
    ],
    currentModel: 'microsoft/DialoGPT-large',
    isReady: false,
    retryCount: 0,
    maxRetries: 3
}
```

#### Methods

##### `async generateStory(context, type = 'narrative')`
Generates story continuation using AI.
```javascript
const story = await huggingfaceAI.generateStory(
    "You enter a dark forest...", 
    'narrative'
);
```
- **Parameters**:
  - `context` (string): Current story context
  - `type` (string): 'narrative', 'character', or 'choice'
- **Returns**: Promise resolving to generated story text

##### `async generateChoices(context)`
Generates action choices for the player.
```javascript
const choices = await huggingfaceAI.generateChoices(
    "You stand before a locked door..."
);
// Returns: ["Force the door open", "Search for a key", ...]
```

##### `async makeRequest(prompt, options = {})`
Low-level API request to HuggingFace.
```javascript
const response = await huggingfaceAI.makeRequest(
    "Continue this story: ...",
    { max_length: 400, temperature: 0.8 }
);
```
- **Parameters**:
  - `prompt` (string): Text prompt for AI
  - `options` (object): Generation parameters
- **Returns**: Promise resolving to raw AI response

### SimpleAI
**File**: `js/simpleAI.js`
**Purpose**: Template-based AI fallback system

#### Constructor
```javascript
new SimpleAI()
```

#### Methods

##### `generateStory(context, type, characterStats)`
Generates story using templates and context analysis.
```javascript
const story = simpleAI.generateStory(
    "Ancient temple context...",
    'narrative',
    character.stats
);
```

##### `generateChoices(context, characterStats)`
Creates contextual choices based on situation and character.
```javascript
const choices = simpleAI.generateChoices(context, character.stats);
```

##### `analyzeContext(context)`
Determines scenario type from story context.
```javascript
const scenario = simpleAI.analyzeContext("You hear footsteps approaching...");
// Returns: { type: 'danger', confidence: 0.8, keywords: ['footsteps', 'approaching'] }
```

### MockAI
**File**: `js/mockAI.js`
**Purpose**: Hardcoded fallback responses

#### Methods

##### `generateStory(context, type)`
Returns pre-written story segments.
```javascript
const story = mockAI.generateStory(context, 'narrative');
```

##### `generateChoices(context)`
Returns generic but appropriate action choices.
```javascript
const choices = mockAI.generateChoices(context);
```

---

## 🎲 Game Logic

### Character
**File**: `js/character.js`
**Purpose**: Character stats, progression, and abilities

#### Constructor
```javascript
new Character(name, initialStats = null)
```

#### Properties
```javascript
{
    name: "Hero Name",
    stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    },
    hp: 12,
    maxHP: 12,
    xp: 0,
    level: 1,
    inventory: []
}
```

#### Methods

##### `getStatModifier(statName)`
Calculates D&D-style ability modifier.
```javascript
const modifier = character.getStatModifier('strength');
// For STR 16: returns +3
```
- **Formula**: `Math.floor((stat - 10) / 2)`

##### `getMaxHP()`
Calculates maximum hit points.
```javascript
const maxHP = character.getMaxHP();
```
- **Formula**: `10 + (CON modifier * 2)`

##### `addXP(amount)`
Adds experience and handles level ups.
```javascript
character.addXP(50);
```

##### `levelUp()`
Increases level and allows stat improvement.
```javascript
character.levelUp();
```

##### `takeDamage(amount)`
Reduces hit points and handles death.
```javascript
const isAlive = character.takeDamage(8);
```

##### `heal(amount)`
Restores hit points up to maximum.
```javascript
character.heal(5);
```

##### `addItem(item)`
Adds item to inventory.
```javascript
character.addItem({
    name: "Magic Sword",
    type: "weapon",
    bonus: 2,
    description: "A glowing blade"
});
```

### DiceSystem
**File**: `js/dice.js`
**Purpose**: Dice rolling and success determination

#### Constructor
```javascript
new DiceSystem()
```

#### Methods

##### `rollD20(statModifier = 0, bonus = 0)`
Performs a D20 roll with modifiers.
```javascript
const result = diceSystem.rollD20(3, 2); // +3 stat, +2 bonus
// Returns: {
//     roll: 15,          // Natural die roll (1-20)
//     modifier: 5,       // Total modifiers applied
//     total: 20,         // Final result
//     isCritical: false, // Natural 20?
//     isFumble: false    // Natural 1?
// }
```

##### `checkSuccess(total, difficultyClass = 15)`
Determines success level against difficulty.
```javascript
const check = diceSystem.checkSuccess(18, 15);
// Returns: {
//     success: true,
//     degree: 'success',  // 'critical', 'excellent', 'success', 'partial', 'failure'
//     margin: 3           // Amount over/under target
// }
```

##### `rollMultiple(count, sides = 20)`
Rolls multiple dice.
```javascript
const rolls = diceSystem.rollMultiple(3, 6); // 3d6
// Returns: { rolls: [4, 2, 6], total: 12 }
```

##### `rollWithAdvantage(statModifier = 0)`
Rolls twice, takes higher result.
```javascript
const result = diceSystem.rollWithAdvantage(2);
```

##### `rollWithDisadvantage(statModifier = 0)`
Rolls twice, takes lower result.
```javascript
const result = diceSystem.rollWithDisadvantage(2);
```

### GameState
**File**: `js/gameState.js`
**Purpose**: Game state management and persistence

#### Constructor
```javascript
new GameState()
```

#### Properties
```javascript
{
    currentStory: "",
    storyHistory: [],
    character: null,
    currentChoices: [],
    gameStartTime: Date.now(),
    turnCount: 0,
    lastSaveTime: null
}
```

#### Methods

##### `save()`
Saves current game state to LocalStorage.
```javascript
gameState.save();
```

##### `load()`
Loads game state from LocalStorage.
```javascript
const success = gameState.load();
```

##### `addToHistory(story, choice, result)`
Records story event in history.
```javascript
gameState.addToHistory(
    "You explore the cave...",
    "Search for treasure",
    { success: true, xpGained: 25 }
);
```

##### `reset()`
Clears all game data.
```javascript
gameState.reset();
```

##### `exportSave()`
Exports save data as JSON string.
```javascript
const saveData = gameState.exportSave();
```

##### `importSave(saveData)`
Imports save data from JSON string.
```javascript
const success = gameState.importSave(jsonString);
```

---

## 🎨 User Interface

### UIManager
**File**: `js/ui.js`
**Purpose**: User interface updates and interactions

#### Constructor
```javascript
new UIManager()
```

#### Methods

##### `updateStory(storyText, animated = true)`
Updates the main story display.
```javascript
uiManager.updateStory("A new chapter begins...", true);
```

##### `updateChoices(choices)`
Renders choice buttons.
```javascript
uiManager.updateChoices([
    "Attack with sword",
    "Cast a spell",
    "Try to negotiate",
    "Flee the scene"
]);
```

##### `updateCharacterSheet(character)`
Updates character stats display.
```javascript
uiManager.updateCharacterSheet(character);
```

##### `showDiceResult(result, animated = true)`
Displays dice roll result.
```javascript
uiManager.showDiceResult({
    roll: 18,
    total: 23,
    isCritical: false
}, true);
```

##### `showNotification(message, type = 'info')`
Shows temporary notification.
```javascript
uiManager.showNotification("Level up!", 'success');
// Types: 'info', 'success', 'warning', 'error'
```

##### `showModal(title, content, buttons = [])`
Displays modal dialog.
```javascript
uiManager.showModal(
    "Character Creation",
    "Distribute your stat points...",
    [
        { text: "Confirm", callback: () => { /* ... */ } },
        { text: "Cancel", callback: () => { /* ... */ } }
    ]
);
```

### AudioManager
**File**: `js/audio.js`
**Purpose**: Sound effects and music management

#### Constructor
```javascript
new AudioManager()
```

#### Methods

##### `playSound(soundName, volume = 1.0)`
Plays a sound effect.
```javascript
audioManager.playSound('dice_roll', 0.7);
```

##### `playMusic(trackName, loop = true)`
Plays background music.
```javascript
audioManager.playMusic('tavern_theme', true);
```

##### `stopAll()`
Stops all audio.
```javascript
audioManager.stopAll();
```

##### `setMasterVolume(volume)`
Sets overall volume level.
```javascript
audioManager.setMasterVolume(0.5); // 50% volume
```

---

## 🔧 Utility Functions

### Utils
**File**: `js/utils.js`
**Purpose**: Common utility functions

#### `randomChoice(array)`
Returns random element from array.
```javascript
const element = randomChoice(['apple', 'banana', 'cherry']);
```

#### `randomInt(min, max)`
Returns random integer in range.
```javascript
const num = randomInt(1, 100); // 1-100 inclusive
```

#### `capitalize(string)`
Capitalizes first letter of string.
```javascript
const result = capitalize("hello world"); // "Hello world"
```

#### `sanitizeHTML(html)`
Removes dangerous HTML tags.
```javascript
const safe = sanitizeHTML("<script>alert('bad')</script>Hello");
// Returns: "Hello"
```

#### `formatTime(milliseconds)`
Formats time duration.
```javascript
const time = formatTime(125000); // "2m 5s"
```

#### `debounce(func, delay)`
Creates debounced function.
```javascript
const debouncedSave = debounce(() => gameState.save(), 1000);
```

#### `deepClone(object)`
Creates deep copy of object.
```javascript
const copy = deepClone(character);
```

#### `generateId(length = 8)`
Generates random ID string.
```javascript
const id = generateId(12); // "a7b2c9d1e4f8"
```

---

## ⚙️ Configuration

### CONFIG Object
**File**: `js/config.js`
**Purpose**: Global configuration settings

```javascript
const CONFIG = {
    // AI Settings
    USE_HUGGINGFACE: true,
    USE_SIMPLE_AI: true,
    USE_MOCK_AI: true,
    HUGGINGFACE_TIMEOUT: 30000,
    MAX_RETRIES: 3,
    
    // Game Settings
    BASE_HP: 10,
    XP_PER_LEVEL: 100,
    MAX_LEVEL: 20,
    STAT_POINT_POOL: 27,
    MAX_STAT_VALUE: 18,
    
    // UI Settings
    TYPEWRITER_SPEED: 50,
    AUTO_SAVE_INTERVAL: 30000,
    ANIMATION_DURATION: 300,
    
    // Audio Settings
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.5,
    
    // Debug Settings
    DEBUG_MODE: false,
    SHOW_AI_PROMPTS: false,
    MOCK_AI_ONLY: false,
    LOG_PERFORMANCE: false
};
```

---

## 📡 Events

### Custom Events
The game uses custom events for loose coupling between components.

#### Game Events
```javascript
// New game started
document.dispatchEvent(new CustomEvent('game:newGame', {
    detail: { character: character }
}));

// Story updated
document.dispatchEvent(new CustomEvent('game:storyUpdate', {
    detail: { story: newStory, source: 'ai' }
}));

// Choice made
document.dispatchEvent(new CustomEvent('game:choiceMade', {
    detail: { choice: choiceText, index: choiceIndex }
}));

// Dice rolled
document.dispatchEvent(new CustomEvent('game:diceRoll', {
    detail: { result: rollResult, stat: statUsed }
}));

// Character updated
document.dispatchEvent(new CustomEvent('character:update', {
    detail: { character: character, changes: ['hp', 'xp'] }
}));

// Level up
document.dispatchEvent(new CustomEvent('character:levelUp', {
    detail: { character: character, newLevel: level }
}));
```

#### UI Events
```javascript
// Theme changed
document.dispatchEvent(new CustomEvent('ui:themeChange', {
    detail: { theme: 'dark' }
}));

// Modal opened/closed
document.dispatchEvent(new CustomEvent('ui:modalToggle', {
    detail: { isOpen: true, modalType: 'character' }
}));
```

#### Audio Events
```javascript
// Sound played
document.dispatchEvent(new CustomEvent('audio:soundPlay', {
    detail: { sound: 'dice_roll', volume: 0.7 }
}));

// Music changed
document.dispatchEvent(new CustomEvent('audio:musicChange', {
    detail: { track: 'combat_theme', fadeIn: true }
}));
```

### Event Listeners
```javascript
// Listen for game events
document.addEventListener('game:storyUpdate', (event) => {
    console.log('New story:', event.detail.story);
});

// Listen for character changes
document.addEventListener('character:update', (event) => {
    uiManager.updateCharacterSheet(event.detail.character);
});
```

---

## 🔍 Error Handling

### Error Types
```javascript
// AI Service Errors
class AIServiceError extends Error {
    constructor(service, message) {
        super(`${service}: ${message}`);
        this.service = service;
    }
}

// Game Logic Errors
class GameLogicError extends Error {
    constructor(action, message) {
        super(`Game Logic (${action}): ${message}`);
        this.action = action;
    }
}

// UI Errors
class UIError extends Error {
    constructor(component, message) {
        super(`UI (${component}): ${message}`);
        this.component = component;
    }
}
```

### Error Handling Patterns
```javascript
// AI Service error handling
try {
    const result = await huggingfaceAI.generateStory(context);
    return result;
} catch (error) {
    console.warn('Primary AI failed, trying fallback:', error);
    return await simpleAI.generateStory(context);
}

// Game logic error handling
try {
    character.takeDamage(damage);
} catch (error) {
    console.error('Character damage error:', error);
    // Graceful degradation
    character.hp = Math.max(0, character.hp - 1);
}
```

---

## 📊 Performance Monitoring

### Performance Metrics
```javascript
// Track AI response times
const startTime = performance.now();
const result = await ai.generateStory(context);
const duration = performance.now() - startTime;
console.log(`AI response time: ${duration}ms`);

// Monitor memory usage
const memInfo = performance.memory;
console.log(`Memory: ${memInfo.usedJSHeapSize / 1024 / 1024}MB`);

// Track render performance
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration}ms`);
    });
});
observer.observe({ entryTypes: ['measure'] });
```

---

**Need more details?** Check the source code directly or refer to the [Technical Overview](TECHNICAL_OVERVIEW.md) for architectural context.
