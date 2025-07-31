# utils.js - Utility Functions Documentation

## Overview
The `utils.js` file provides a comprehensive set of utility functions, classes, and helpers used throughout the DiceTales application. It serves as the foundation for logging, DOM manipulation, data validation, performance monitoring, and common game mechanics.

## File Dependencies
- **Dependencies**: None (base module)
- **Used by**: All other JavaScript modules

## Global Objects
All utilities are exported to `window.DiceTalesUtils` and individual global variables.

---

## 📊 Core Utility Functions

### `randomInt(min, max)`
Generates a random integer between min and max (inclusive).

**Parameters:**
- `min` (number): Minimum value (inclusive)
- `max` (number): Maximum value (inclusive)

**Returns:** `number` - Random integer in range

**Example:**
```javascript
const roll = randomInt(1, 20); // Simulates d20 roll
```

### `generateId(prefix = 'id')`
Generates a unique identifier for game elements.

**Parameters:**
- `prefix` (string, optional): Prefix for the ID (default: 'id')

**Returns:** `string` - Unique identifier

**Example:**
```javascript
const characterId = generateId('char'); // "char_1627834567890_1234"
```

### `safeJsonParse(jsonString, fallback = null)`
Safely parses JSON with error handling and fallback value.

**Parameters:**
- `jsonString` (string): JSON string to parse
- `fallback` (any, optional): Value to return on parse failure (default: null)

**Returns:** `any` - Parsed object or fallback value

**Example:**
```javascript
const data = safeJsonParse(localStorage.getItem('gameData'), {});
```

### `deepClone(obj)`
Creates a deep copy of an object, handling nested objects, arrays, and dates.

**Parameters:**
- `obj` (any): Object to clone

**Returns:** `any` - Deep cloned object

**Example:**
```javascript
const characterCopy = deepClone(originalCharacter);
```

---

## ⏱️ Performance Utilities

### `debounce(func, wait)`
Creates a debounced version of a function that delays execution.

**Parameters:**
- `func` (function): Function to debounce
- `wait` (number): Delay in milliseconds

**Returns:** `function` - Debounced function

**Example:**
```javascript
const debouncedSave = debounce(saveGame, 1000);
```

### `throttle(func, limit)`
Creates a throttled version of a function that limits execution frequency.

**Parameters:**
- `func` (function): Function to throttle
- `limit` (number): Minimum time between executions (ms)

**Returns:** `function` - Throttled function

**Example:**
```javascript
const throttledUpdate = throttle(updateUI, 100);
```

---

## 🎲 D&D Game Mechanics

### `getAbilityModifier(score)`
Calculates D&D 5e ability modifier from ability score.

**Parameters:**
- `score` (number): Ability score (1-30)

**Returns:** `number` - Ability modifier (-5 to +10)

**Example:**
```javascript
const modifier = getAbilityModifier(16); // Returns +3
```

### `formatModifier(modifier)`
Formats ability modifier for display with proper sign.

**Parameters:**
- `modifier` (number): Ability modifier

**Returns:** `string` - Formatted modifier ("+3" or "-1")

**Example:**
```javascript
const display = formatModifier(3); // "+3"
```

### `getExperienceForLevel(level)`
Returns experience points required for a given level (D&D 5e).

**Parameters:**
- `level` (number): Character level (1-20)

**Returns:** `number` - Experience points required

**Example:**
```javascript
const expNeeded = getExperienceForLevel(5); // 6500
```

### `getLevelFromExperience(exp)`
Calculates character level from experience points.

**Parameters:**
- `exp` (number): Experience points

**Returns:** `number` - Character level (1-20)

**Example:**
```javascript
const level = getLevelFromExperience(1500); // 3
```

---

## 🎨 Text and HTML Utilities

### `capitalizeFirst(str)`
Capitalizes the first letter of a string.

**Parameters:**
- `str` (string): String to capitalize

**Returns:** `string` - String with first letter capitalized

### `formatText(text)`
Formats text for HTML display, converting markdown-like syntax.

**Parameters:**
- `text` (string): Text to format

**Returns:** `string` - HTML-formatted text

**Conversions:**
- `\\n` → `<br>`
- `**text**` → `<strong>text</strong>`
- `*text*` → `<em>text</em>`

### `sanitizeHtml(html)`
Sanitizes HTML to prevent XSS attacks.

**Parameters:**
- `html` (string): HTML string to sanitize

**Returns:** `string` - Sanitized HTML

---

## 🏗️ DOM Manipulation

### `createElement(tag, attributes = {}, content = '')`
Creates HTML element with attributes and content.

**Parameters:**
- `tag` (string): HTML tag name
- `attributes` (object, optional): Element attributes
- `content` (string, optional): Inner HTML content

**Returns:** `HTMLElement` - Created element

**Example:**
```javascript
const button = createElement('button', {
    className: 'dice-button',
    onclick: 'rollDice()',
    'data-dice': 'd20'
}, 'Roll d20');
```

### `addEventListenerWithCleanup(element, event, handler)`
Adds event listener and returns cleanup function.

**Parameters:**
- `element` (HTMLElement): Target element
- `event` (string): Event name
- `handler` (function): Event handler

**Returns:** `function` - Cleanup function to remove listener

**Example:**
```javascript
const cleanup = addEventListenerWithCleanup(button, 'click', handleClick);
// Later: cleanup();
```

---

## 💾 Storage Utilities

### `storage` Object
Provides safe localStorage operations with error handling.

#### `storage.set(key, value)`
**Parameters:**
- `key` (string): Storage key
- `value` (any): Value to store (will be JSON.stringify'd)

**Returns:** `boolean` - Success status

#### `storage.get(key, defaultValue = null)`
**Parameters:**
- `key` (string): Storage key
- `defaultValue` (any, optional): Default value if key doesn't exist

**Returns:** `any` - Retrieved value or default

#### `storage.remove(key)`
**Parameters:**
- `key` (string): Storage key to remove

**Returns:** `boolean` - Success status

#### `storage.clear()`
Clears all localStorage data.

**Returns:** `boolean` - Success status

---

## 📢 Event System

### `EventBus` Class
Provides decoupled event communication between modules.

#### `eventBus.on(event, callback)`
Subscribe to an event.

**Parameters:**
- `event` (string): Event name
- `callback` (function): Event handler

#### `eventBus.emit(event, data)`
Emit an event with data.

**Parameters:**
- `event` (string): Event name
- `data` (any): Event data

#### `eventBus.off(event, callback)`
Unsubscribe from an event.

#### `eventBus.once(event, callback)`
Subscribe to an event for one-time execution.

**Example:**
```javascript
// Subscribe
eventBus.on('characterCreated', (character) => {
    console.log('New character:', character.name);
});

// Emit
eventBus.emit('characterCreated', newCharacter);
```

---

## 📊 Performance Monitoring

### `PerformanceMonitor` Class
Provides performance timing utilities.

#### `perf.start(label)`
Start timing operation.

**Parameters:**
- `label` (string): Operation identifier

#### `perf.end(label)`
End timing and log duration.

**Parameters:**
- `label` (string): Operation identifier

**Returns:** `number` - Duration in milliseconds

#### `perf.measure(label, fn)`
Time a synchronous function execution.

**Parameters:**
- `label` (string): Operation identifier
- `fn` (function): Function to time

**Returns:** `any` - Function return value

#### `perf.measureAsync(label, fn)`
Time an asynchronous function execution.

**Parameters:**
- `label` (string): Operation identifier
- `fn` (function): Async function to time

**Returns:** `Promise` - Function return value

**Example:**
```javascript
const result = perf.measure('characterCreation', () => {
    return createNewCharacter(data);
});

const asyncResult = await perf.measureAsync('aiRequest', async () => {
    return await aiManager.generateStory(prompt);
});
```

---

## 📝 Logging System

### `Logger` Class
Comprehensive logging system with level filtering and persistence.

#### `logger.info(message, data)`
Log informational message.

**Parameters:**
- `message` (string): Log message
- `data` (any, optional): Additional data

#### `logger.warn(message, data)`
Log warning message.

#### `logger.error(message, data)`
Log error message.

#### `logger.debug(message, data)`
Log debug message (only in development mode).

#### `logger.getLogs(level = null)`
Retrieve logged messages.

**Parameters:**
- `level` (string, optional): Filter by log level

**Returns:** `Array` - Array of log entries

#### `logger.clearLogs()`
Clear all stored logs.

**Log Entry Structure:**
```javascript
{
    timestamp: "2025-07-30T12:34:56.789Z",
    level: "info",
    message: "Game initialized",
    data: { /* optional additional data */ }
}
```

---

## 🎭 UI Helper Functions

### `showToast(message, type = 'info', duration = 3000)`
Display toast notification.

**Parameters:**
- `message` (string): Notification message
- `type` (string): Toast type ('info', 'success', 'warning', 'error')
- `duration` (number): Display duration in milliseconds

**Example:**
```javascript
showToast('Character saved!', 'success', 2000);
```

### `animateElement(element, animationClass, duration = 1000)`
Animate element with CSS class.

**Parameters:**
- `element` (HTMLElement): Element to animate
- `animationClass` (string): CSS animation class
- `duration` (number): Animation duration in milliseconds

**Returns:** `Promise` - Resolves when animation completes

### `scrollToElement(element, offset = 0)`
Smooth scroll to element.

**Parameters:**
- `element` (HTMLElement): Target element
- `offset` (number): Scroll offset in pixels

### `isInViewport(element)`
Check if element is visible in viewport.

**Parameters:**
- `element` (HTMLElement): Element to check

**Returns:** `boolean` - True if element is in viewport

---

## 🎯 Random Generators

### `generateRandomName(setting = 'fantasy')`
Generate random character name based on campaign setting.

**Parameters:**
- `setting` (string): Campaign setting ('fantasy', 'modern', 'scifi', 'horror')

**Returns:** `string` - Generated name

**Example:**
```javascript
const name = generateRandomName('fantasy'); // "Aeliana Brightblade"
```

---

## 🛠️ Validation Utilities

### `isValidEmail(email)`
Validate email address format.

**Parameters:**
- `email` (string): Email address to validate

**Returns:** `boolean` - True if valid email format

### `formatTimestamp(timestamp)`
Format timestamp for human-readable display.

**Parameters:**
- `timestamp` (number): Unix timestamp

**Returns:** `string` - Formatted time ("2m ago", "1h ago", etc.)

---

## 🌐 Global Configuration

### Debug Mode
Debug mode is automatically enabled in development environments:
- Enables debug logging
- Activates additional console output
- Provides development-specific features

**Detection:**
```javascript
window.DEBUG_MODE = (hostname === 'localhost' || hostname === '127.0.0.1')
```

### Global Error Handling
Automatic error capturing for:
- JavaScript runtime errors
- Unhandled promise rejections
- All errors logged to Logger instance

---

## 💡 Usage Examples

### Basic Utility Usage
```javascript
// Generate random stats
const strength = randomInt(8, 18);
const modifier = getAbilityModifier(strength);
const displayMod = formatModifier(modifier);

// Safe data operations
const character = deepClone(baseCharacter);
const saved = storage.set('character', character);

// UI notifications
showToast('Character created!', 'success');
```

### Event-Driven Architecture
```javascript
// Module A: Listen for events
eventBus.on('diceRolled', (result) => {
    logger.info('Dice result:', result);
    updateGameState(result);
});

// Module B: Emit events
const rollResult = rollDice('1d20');
eventBus.emit('diceRolled', rollResult);
```

### Performance Monitoring
```javascript
// Time critical operations
const character = perf.measure('characterGeneration', () => {
    return generateCompleteCharacter(stats);
});

// Monitor async operations
const story = await perf.measureAsync('storyGeneration', async () => {
    return await aiManager.generateStory(prompt);
});
```

---

*This documentation covers all utility functions and classes in utils.js. These utilities form the foundation for all other DiceTales modules.*
