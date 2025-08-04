# DiceTales API Reference

Complete code documentation for developers working with the DiceTales codebase.

## 📋 Table of Contents

- [Core Classes](#core-classes)
- [AI System](#ai-system) 
- [Memory System](#memory-system)
- [Character System](#character-system)
- [Dice System](#dice-system)
- [UI System](#ui-system)
- [Configuration](#configuration)
- [Events](#events)

## 🎮 Core Classes

### DiceTalesApp
**File**: `advanced/js/main.js`
**Purpose**: Main application controller and coordination of all game systems

#### Constructor
```javascript
new DiceTalesApp()
```

#### Properties
```javascript
{
    initialized: false,
    currentScreen: 'loading',
    gameLoop: null
}
```

#### Methods

##### `async init()`
Initializes all game systems and handles application flow.
```javascript
await app.init();
```

##### `async checkExistingGame()`
Checks for existing saved game state.
```javascript
const hasGame = await app.checkExistingGame();
```

##### `showCharacterCreation()`
Displays character creation interface.
```javascript
app.showCharacterCreation();
```

---

## 🤖 AI System

### AIManager
**File**: `advanced/js/ai.js`
**Purpose**: Unified AI system with HuggingFace integration for dynamic storytelling

#### Constructor
```javascript
new AIManager()
```

#### Properties
```javascript
{
    useHuggingFace: true,
    huggingFaceModelQueue: [
        'microsoft/GODEL-v1_1-large-seq2seq',
        'facebook/blenderbot-400M-distill',
        'microsoft/GODEL-v1_1-base-seq2seq',
        'facebook/blenderbot-1B-distill',
        'microsoft/DialoGPT-large',
        'microsoft/DialoGPT-medium',
        'gpt2-large',
        'distilgpt2'
    ],
    conversationConfig: {
        maxContextLength: 2048,
        temperature: 0.8,
        topP: 0.9,
        repetitionPenalty: 1.1,
        maxNewTokens: 150,
        doSample: true,
        numBeams: 3
    },
    memoryConfig: {
        maxConversationHistory: 20,
        plotContextWindow: 5,
        characterMemoryDepth: 10
    }
}
```

#### Methods

##### `async initialize()`
Initializes AI system and tests connections.
```javascript
await aiManager.initialize();
```

##### `async startCampaign()`
Starts a new campaign with initial story generation.
```javascript
await aiManager.startCampaign();
```

##### `async processPlayerAction(actionData)`
Processes player actions and generates AI responses.
```javascript
await aiManager.processPlayerAction({
    action: "Search the ancient ruins",
    type: "exploration"
});
```

##### `buildMemoryContext(character, campaign)`
Builds comprehensive memory context for AI prompts.
```javascript
const context = aiManager.buildMemoryContext(character, campaign);
```

##### `async callAI(messages)`
Makes API calls to HuggingFace models with fallback system.
```javascript
const response = await aiManager.callAI([
    { role: 'system', content: 'You are a helpful DM.' },
    { role: 'user', content: 'What happens next?' }
]);
```

---

## 🧠 Memory System

### MemoryManager
**File**: `advanced/js/memoryManager.js`
**Purpose**: Enhanced memory system for persistent storytelling and character continuity

#### Constructor
```javascript
new MemoryManager()
```

#### Properties
```javascript
{
    initialized: false,
    memoryKeys: {
        decisions: 'memory.decisions',
        relationships: 'memory.relationships',
        discoveries: 'memory.discoveries',
        skills_used: 'memory.skills_used',
        items_gained: 'memory.items_gained',
        locations_described: 'memory.locations_described',
        plot_threads: 'memory.plot_threads'
    }
}
```

#### Methods

##### `initialize()`
Initializes memory system with game state integration.
```javascript
memoryManager.initialize();
```

##### `recordDecision(decision, consequence, context)`
Records significant player decisions.
```javascript
memoryManager.recordDecision(
    "Agreed to help the village elder",
    "Gained trust of villagers",
    "Village meeting hall"
);
```

##### `updateRelationship(npcName, relationship, notes)`
Updates NPC relationship status.
```javascript
memoryManager.updateRelationship(
    "Elder Marcus",
    "friendly",
    "Grateful for helping with goblin problem"
);
```

##### `recordDiscovery(discovery, type, significance)`
Records important findings and discoveries.
```javascript
memoryManager.recordDiscovery(
    "Ancient rune stone with mystical properties",
    "artifact",
    "high"
);
```

##### `recordSkillUse(skillName, success, context)`
Tracks skill usage for character development.
```javascript
memoryManager.recordSkillUse("Stealth", true, "Sneaking past guards");
```

##### `getMemorySummary()`
Returns comprehensive memory summary for AI context.
```javascript
const summary = memoryManager.getMemorySummary();
// Returns: { recent_decisions, key_relationships, important_discoveries, ... }
```

##### `getAIContext()`
Provides plot grounding context for AI responses.
```javascript
const context = memoryManager.getAIContext();
```

##### `async generateChoices(context)`
Generates action choices for the player.
```javascript
const choices = await aiManager.generateChoices(
    "You stand before a locked door..."
);
// Returns: ["Force the door open", "Search for a key", ...]
```

##### `async makeRequest(prompt, options = {})`
Low-level API request to HuggingFace.
```javascript
const response = await aiManager.callAI(
    "Continue this story: ...",
    { max_length: 400, temperature: 0.8 }
);
```
- **Parameters**:
  - `prompt` (string): Text prompt for AI
  - `options` (object): Generation parameters
- **Returns**: Promise resolving to raw AI response

---

## 🧠 Memory System

### Character
**File**: `advanced/js/character.js`
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
**File**: `advanced/js/dice.js`
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
**File**: `advanced/js/gameState.js`
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
**File**: `advanced/js/ui.js`
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
**File**: `advanced/js/audio.js`
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
**File**: `advanced/js/utils.js`
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
**File**: `advanced/js/config.js`
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
    const result = await aiManager.callAI(context);
    return result;
} catch (error) {
    console.warn('AI service failed:', error);
    return aiManager.getHuggingFaceFallbackResponse('narrative');
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

**Need more details?** Check the source code directly or refer to the [Technical Overview](https://asleshsura.github.io/DiceTales/docs/TECHNICAL_OVERVIEW) for architectural context.
