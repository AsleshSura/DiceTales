# main.js - Application Controller Documentation

## Overview
The `main.js` file contains the `DiceTalesApp` class, which serves as the central application controller. It coordinates all game systems, manages application lifecycle, handles screen transitions, and provides the main event coordination for the entire DiceTales game.

## File Dependencies
- **Dependencies**: utils.js, gameState.js, character.js, dice.js, ai.js, audio.js, ui.js
- **Used by**: index.html (as main entry point)

## Global Variables
- `app` - Global instance of DiceTalesApp
- `window.app` - Debug access to app instance

---

## 🎮 DiceTalesApp Class

The main application controller class that orchestrates all game systems.

### Constructor
```javascript
constructor()
```

**Properties initialized:**
- `initialized` (boolean): Application initialization status
- `currentScreen` (string): Current active screen ('loading', 'character-creation', 'game')
- `gameLoop` (number|null): Game loop interval ID
- Additional properties set during initialization

**Side Effects:**
- Automatically calls `init()` method
- Sets up basic application state

---

## 🚀 Initialization Methods

### `async init()`
Main initialization method that sets up the entire application.

**Process Flow:**
1. Configure Python environment (development only)
2. Initialize all game systems
3. Set up event handlers
4. Check for existing game data
5. Route to appropriate screen (character creation or game)

**Error Handling:**
- Catches all initialization errors
- Shows error dialog on failure
- Logs detailed error information

**Example Usage:**
```javascript
// Called automatically in constructor
// Manual re-initialization:
await app.init();
```

### `async configurePythonEnvironment()`
Configures Python environment for development purposes.

**Purpose:**
- Development/debugging support
- Currently skipped as game runs purely in browser

**Returns:** `Promise<void>`

**Note:** This method is maintained for future backend integration possibilities.

### `async initializeSystems()`
Initializes all game subsystems in proper order.

**Systems Initialized:**
1. **Audio System**: Web Audio API initialization
2. **AI System**: HackClub AI API setup
3. **Background Music**: Starts if enabled in settings

**Error Handling:**
- Each system initialization is wrapped in try/catch
- Failures are logged but don't stop other systems
- Graceful degradation for missing systems

**Returns:** `Promise<void>`

---

## 🎛️ Event Management

### `setupEventHandlers()`
Establishes all global event listeners for the application.

**Event Types Handled:**
- **Game State Events**: `gameStateChange`, `characterCreated`, `campaignStarted`
- **User Interaction**: Click for audio initialization
- **Keyboard Shortcuts**: Global keyboard navigation
- **Window Events**: `beforeunload`, `unload` for cleanup
- **Error Events**: Global error and promise rejection handling

**Keyboard Shortcuts:**
- `Escape`: Show main menu
- `Ctrl+I`: Show inventory
- `Ctrl+C`: Show character sheet  
- `Ctrl+D`: Show dice roller
- `Ctrl+M`: Toggle music

### `handleKeyboardShortcut(event)`
Processes keyboard shortcut events.

**Parameters:**
- `event` (KeyboardEvent): Keyboard event object

**Input Handling:**
- Ignores shortcuts when user is typing in inputs
- Prevents default browser behavior for handled shortcuts

**Available Shortcuts:**
| Key Combination | Action |
|----------------|--------|
| `Escape` | Show main menu |
| `Ctrl+I` | Show inventory |
| `Ctrl+C` | Show character sheet |
| `Ctrl+D` | Show dice roller |
| `Ctrl+M` | Toggle music |

---

## 💾 Game State Management

### `async checkExistingGame()`
Checks for existing game data to determine startup flow.

**Checks Performed:**
1. Looks for complete game state in storage
2. Checks for character data in localStorage
3. Validates data integrity

**Returns:** `boolean` - True if existing game found

**Data Sources:**
- Primary: `gameState.loadGameState()`
- Fallback: `localStorage.getItem('dicetales_character')`

**Example:**
```javascript
const hasGame = await app.checkExistingGame();
if (hasGame) {
    await app.loadExistingGame();
} else {
    app.showCharacterCreation();
}
```

### `async loadExistingGame()`
Loads and restores existing game state.

**Loading Process:**
1. Retrieve saved game data
2. Load character information
3. Restore campaign progress
4. Route to appropriate screen

**Screen Routing:**
- **Has Campaign**: Route to game screen
- **Character Only**: Route to character creation (campaign selection)
- **No Data**: Fallback to character creation

**Error Handling:**
- Graceful fallback to character creation on any error
- Preserves partial data when possible

---

## 🎭 Screen Management

### `showScreen(screenName)`
Handles screen transitions throughout the application.

**Parameters:**
- `screenName` (string): Target screen identifier

**Available Screens:**
- `'loading'`: Initial loading screen
- `'character-creation'`: Character creation interface
- `'game'`: Main game interface
- `'main-menu'`: Main menu screen

**Transition Process:**
1. Hide all existing screens
2. Show target screen
3. Update current screen tracking
4. Initialize screen-specific functionality

**Example:**
```javascript
app.showScreen('character-creation');
```

### `initializeScreen(screenName)`
Performs screen-specific initialization after transition.

**Parameters:**
- `screenName` (string): Screen being initialized

**Screen-Specific Actions:**
- **character-creation**: Debug character system, call characterManager
- **game**: Initialize game UI components

### Navigation Methods

#### `showMainMenu()`
Navigate to main menu screen.

#### `showCharacterCreation()`
Navigate to character creation with proper initialization.

**Process:**
1. Switch to character-creation screen
2. Initialize character manager if available
3. Fallback to basic character creation if manager missing

#### `showInventory()`
Show inventory interface (placeholder).

#### `showCharacterSheet()`
Show character sheet interface (placeholder).

#### `showDiceRoller()`
Show dice rolling interface.

**Integration:**
- Uses `diceManager.showRoller()` if available

---

## 🎲 Character and Campaign Management

### `onCharacterCreated(character)`
Handles character creation completion event.

**Parameters:**
- `character` (object): Completed character data

**Process:**
1. Store character data
2. Initiate campaign start process
3. Route to game screen

**Example Event Data:**
```javascript
{
    name: "Aragorn",
    class: "fighter",
    level: 1,
    stats: { /* ability scores */ },
    campaign: "medieval-fantasy"
}
```

### `async startNewCampaign(character)`
Initiates a new campaign with the created character.

**Parameters:**
- `character` (object): Character data

**Process:**
1. Store character in application state
2. Save character to persistent storage
3. Transition to game screen
4. Initialize campaign with AI manager

**AI Integration:**
- Uses `aiManager.startCampaign()` if available
- Fallbacks to `startBasicCampaign()` without AI

**Error Handling:**
- Shows error dialog on campaign start failure
- Preserves character data for retry

### `startBasicCampaign(character)`
Fallback campaign starter without AI integration.

**Parameters:**
- `character` (object): Character data

**Features:**
- Basic story introduction
- Simple action buttons (Enter Tavern, Look Around, Roll Dice)
- Manual story progression
- Basic dice integration

### `takeAction(action)`
Handles player actions in basic campaign mode.

**Parameters:**
- `action` (string): Action identifier

**Available Actions:**
- `'enter_tavern'`: Enter the starting tavern
- `'look_around'`: Survey surroundings
- `'roll_dice'`: Perform dice roll

### `updateStory(text)`
Updates story display with new narrative text.

**Parameters:**
- `text` (string): New story text to display

---

## 🎵 Audio and UI Controls

### `toggleMusic()`
Toggles background music on/off.

**Integration:**
- Uses `audioManager.toggleMusic()` if available
- Respects user audio preferences

---

## 📊 Event Handlers

### `onGameStateChange(state)`
Handles game state change events.

**Parameters:**
- `state` (object): State change data

**Handled State Types:**
- `screen_change`: Updates current screen
- `character_update`: Updates character data
- `campaign_update`: Updates campaign data

### `onCharacterUpdated(character)`
Handles character data updates.

**Parameters:**
- `character` (object): Updated character data

**Process:**
1. Update application character reference
2. Save to persistent storage

### `onCampaignStarted(campaignData)`
Handles campaign initialization events.

**Parameters:**
- `campaignData` (object): Campaign configuration

**Process:**
1. Store campaign data in application state
2. Save to persistent storage

---

## 🛠️ Development and Debug Features

### `createBasicCharacterCreation()`
Creates fallback character creation interface.

**Purpose:**
- Provides basic character creation when characterManager unavailable
- Development/testing fallback
- Minimal viable character creation flow

**Form Fields:**
- Character Name (text input)
- Character Class (dropdown: Fighter, Wizard, Rogue, Cleric)
- Campaign Setting (dropdown: 4 available settings)
- Start Adventure button

### `startTestCharacter()`
Creates test character from basic form data.

**Process:**
1. Extract form data
2. Create character object with default stats
3. Trigger character creation event

**Default Stats:**
All ability scores set to 10 (no modifiers)

### `debugCharacterCreation()`
Comprehensive debug output for character creation system.

**Debug Information:**
- Manager availability status
- Method availability
- DOM element presence
- Visibility states

**Usage:**
```javascript
app.debugCharacterCreation(); // Console output
```

---

## ⚠️ Error Handling

### `showError(message)`
Displays error dialog to user.

**Parameters:**
- `message` (string): Error message to display

**Features:**
- Modal overlay interface
- User-dismissible dialog
- Automatic DOM cleanup

**Example:**
```javascript
app.showError('Failed to load character data. Please try again.');
```

---

## 🧹 Cleanup and Lifecycle

### `saveGameState()`
Saves current game state to persistent storage.

**Process:**
1. Calls `gameState.saveGameState()`
2. Logs save operation
3. Handles save errors gracefully

**Trigger Points:**
- Window beforeunload event
- Manual save operations
- Critical state changes

### `cleanup()`
Performs application cleanup on shutdown.

**Cleanup Operations:**
1. Clear game loop interval
2. Cleanup audio system
3. Remove event listeners
4. Log cleanup completion

**Trigger Points:**
- Window unload event
- Application shutdown
- Error recovery

---

## 🌐 Global Initialization

### Application Startup
```javascript
// Wait for DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new DiceTalesApp();
    });
} else {
    app = new DiceTalesApp();
}

// Debug access
window.app = app;
```

**DOM Ready Handling:**
- Waits for DOM content loaded if still loading
- Immediately initializes if DOM already ready
- Ensures all HTML elements are available

---

## 💡 Usage Examples

### Basic Application Flow
```javascript
// Application automatically initializes
const app = new DiceTalesApp();

// Manual screen transitions
app.showScreen('character-creation');

// Handle character creation
app.onCharacterCreated({
    name: "Legolas",
    class: "ranger",
    campaign: "medieval-fantasy"
});
```

### Event Integration
```javascript
// Listen for custom events
document.addEventListener('characterCreated', (event) => {
    app.onCharacterCreated(event.detail);
});

// Emit events
document.dispatchEvent(new CustomEvent('gameStateChange', {
    detail: { type: 'screen_change', screen: 'game' }
}));
```

### Error Handling
```javascript
try {
    await app.init();
} catch (error) {
    app.showError('Initialization failed: ' + error.message);
}
```

---

## 🔧 Configuration

### Application Properties
- `initialized`: Tracks initialization status
- `currentScreen`: Current active screen
- `currentCharacter`: Active character data
- `currentCampaign`: Active campaign data
- `gameLoop`: Game loop timer reference

### Screen Identifiers
- `'loading'`: Initial loading screen
- `'character-creation'`: Character creation flow
- `'game'`: Main gameplay interface
- `'main-menu'`: Navigation menu

---

*The main.js file serves as the central nervous system of DiceTales, coordinating all other modules and managing the overall application lifecycle.*
