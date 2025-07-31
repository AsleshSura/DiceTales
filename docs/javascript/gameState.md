# gameState.js - Game State Management Documentation

## Overview
The `gameState.js` file contains the `GameState` class, which provides centralized state management with automatic persistence for all game data. It handles character information, campaign progress, user settings, and UI state across browser sessions.

## File Dependencies
- **Dependencies**: utils.js
- **Used by**: All other modules

## Global Variables
- `gameState` - Global instance of GameState

---

## 💾 GameState Class

### Constructor Properties
- `state` - Complete game state object
- `version` - Game state version for migration
- `saveKey` - LocalStorage key ('dicetales_gamestate')
- `autoSaveInterval` - Auto-save timer
- `autoSaveDelay` - Save delay (5 seconds)

### Key Features
- **Automatic Persistence**: Saves changes to localStorage
- **Version Migration**: Handles state structure updates
- **Auto-save**: Continuous background saving
- **Deep State Access**: Nested property management
- **Event Broadcasting**: State change notifications

---

## 🏗️ State Structure

### Default State Schema
```javascript
{
    version: '1.0.0',
    character: {
        name: '',
        class: '',
        level: 1,
        experience: 0,
        background: '',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        health: { current: 100, maximum: 100 },
        skills: {},
        abilities: [],
        inventory: [],
        equipment: { weapon: null, armor: null, shield: null, accessories: [] },
        notes: ''
    },
    campaign: {
        setting: '',
        dm_difficulty: 'medium',
        dm_custom_prompt: '',
        current_location: '',
        story_state: '',
        scene_context: '',
        choices_made: [],
        npcs_encountered: [],
        locations_visited: [],
        campaign_log: [],
        current_quest: null,
        completed_quests: [],
        campaign_flags: {},
        world_state: {}
    },
    settings: {
        dice_preferences: ['d20', 'd12', 'd10', 'd8', 'd6', 'd4'],
        audio_settings: {
            master_volume: 0.7,
            music_volume: 0.5,
            sfx_volume: 0.8,
            music_enabled: true,
            sfx_enabled: true
        },
        display_preferences: {
            theme: 'dark',
            font_size: 'medium',
            animation_speed: 'normal',
            auto_scroll: true,
            show_dice_history: true
        },
        ai_settings: {
            response_length: 'medium',
            creativity_level: 'balanced',
            enable_auto_actions: false
        }
    },
    ui: {
        current_screen: 'character-creation',
        modal_state: {},
        last_roll: null,
        roll_history: []
    }
}
```

---

## 📝 Core State Methods

### `get(path, defaultValue = null)`
Retrieves nested state values using dot notation.

**Parameters:**
- `path` (string): Dot-separated path (e.g., 'character.stats.str')
- `defaultValue` - Value to return if path doesn't exist

**Example:**
```javascript
const strength = gameState.get('character.stats.str', 10);
const characterName = gameState.get('character.name', 'Unknown');
```

### `set(path, value)`
Sets nested state values using dot notation.

**Parameters:**
- `path` (string): Dot-separated path
- `value` - Value to set

**Example:**
```javascript
gameState.set('character.name', 'Aragorn');
gameState.set('character.stats.str', 16);
gameState.set('campaign.current_location', 'Rivendell');
```

### `save()`
Manually saves current state to localStorage.

### `load()`
Loads state from localStorage with migration support.

### `reset()`
Resets state to default values.

---

## 👤 Character Management

### `getCharacter()`
Returns complete character object.

### `setCharacter(characterData)`
Updates character data and triggers save.

### `updateCharacterStat(statName, value)`
Updates specific character statistic.

**Parameters:**
- `statName` (string): Stat name ('str', 'dex', etc.)
- `value` (number): New stat value

### `addExperience(amount)`
Adds experience points and handles level-up.

### `levelUpCharacter()`
Processes character level advancement.

### `updateHealth(current, maximum = null)`
Updates character health values.

---

## 🌍 Campaign Management

### `getCampaign()`
Returns complete campaign object.

### `setCampaign(campaignData)`
Updates campaign information.

### `addToCampaignLog(entry)`
Adds entry to campaign history log.

**Entry Structure:**
```javascript
{
    type: 'story_event',
    content: 'Event description',
    timestamp: '2025-07-30T12:34:56.789Z',
    character: 'Character Name',
    metadata: {}
}
```

### `addNPCEncounter(npc)`
Records NPC encounter.

**Parameters:**
- `npc` (object): NPC data
```javascript
{
    name: 'Gandalf',
    relationship: 'ally',
    first_met: 'Bag End',
    notes: 'Wise wizard'
}
```

### `updateWorldState(key, value)`
Updates persistent world state.

### `setCampaignFlag(flag, value)`
Sets campaign-specific flags for story tracking.

---

## 🎲 Dice and UI State

### `addToRollHistory(rollData)`
Adds dice roll to history.

### `getRollHistory(limit = 50)`
Retrieves recent dice rolls.

### `setCurrentScreen(screenName)`
Updates current UI screen.

### `updateModalState(modalId, state)`
Manages modal dialog states.

---

## ⚙️ Settings Management

### `getSetting(path, defaultValue = null)`
Retrieves setting value using dot notation.

**Example:**
```javascript
const musicVolume = gameState.getSetting('audio_settings.music_volume', 0.5);
const theme = gameState.getSetting('display_preferences.theme', 'dark');
```

### `setSetting(path, value)`
Updates setting value and saves.

### `updateAudioSettings(settings)`
Bulk update audio settings.

### `updateDisplaySettings(settings)`
Bulk update display preferences.

---

## 🔄 Auto-Save System

### `startAutoSave()`
Begins automatic state saving.

### `stopAutoSave()`
Stops automatic saving.

### `triggerSave()`
Queues a save operation with debouncing.

**Features:**
- **Debounced Saving**: Prevents excessive saves
- **Background Operation**: Non-blocking saves
- **Error Handling**: Graceful save failures
- **Performance Optimized**: Minimal impact on gameplay

---

## 📊 Data Migration

### `migrateState(oldState)`
Migrates state between versions.

**Migration Features:**
- **Version Detection**: Automatically detects old versions
- **Data Preservation**: Maintains user data during updates
- **Structure Updates**: Adds new fields with defaults
- **Backward Compatibility**: Handles missing properties

### Migration Process
1. Detect version difference
2. Apply migration transforms
3. Update version number
4. Save migrated state
5. Log migration completion

---

## 🔔 Event System Integration

### State Change Events
Automatically emits events on state changes:
- `gameState:loaded` - State loaded from storage
- `gameState:saved` - State saved to storage
- `gameState:changed` - Any state modification
- `character:updated` - Character data changed
- `campaign:updated` - Campaign data changed
- `settings:changed` - Settings modified

### Event Broadcasting
```javascript
// Listen for state changes
eventBus.on('gameState:changed', (changes) => {
    console.log('State updated:', changes);
});

// Emit custom state events
gameState.emit('character:levelUp', { newLevel: 5 });
```

---

## 💾 Persistence and Storage

### LocalStorage Integration
- **Automatic Saving**: Changes saved immediately
- **Compression**: Large states compressed for storage
- **Error Recovery**: Handles storage quota exceeded
- **Cross-Tab Sync**: Detects changes from other tabs

### Data Validation
- **Schema Validation**: Ensures data integrity
- **Type Checking**: Validates data types
- **Required Fields**: Ensures essential data exists
- **Sanitization**: Cleans potentially harmful data

---

## 🛠️ Development Features

### Debug Mode
```javascript
if (window.DEBUG_MODE) {
    // Expose state for debugging
    window.debugGameState = gameState;
    
    // State inspection methods
    gameState.inspectState = () => console.table(gameState.state);
    gameState.exportState = () => JSON.stringify(gameState.state, null, 2);
}
```

### State Backup and Restore
```javascript
// Export state for backup
const backup = gameState.exportState();

// Restore from backup
gameState.importState(backup);
```

---

## 🎯 Usage Examples

### Character Creation
```javascript
// Set up new character
gameState.setCharacter({
    name: 'Legolas',
    class: 'ranger',
    level: 1,
    stats: { str: 13, dex: 17, con: 14, int: 12, wis: 15, cha: 11 }
});

// Update specific stats
gameState.updateCharacterStat('dex', 18);
gameState.addExperience(1000);
```

### Campaign Progress
```javascript
// Start new campaign
gameState.setCampaign({
    setting: 'medieval-fantasy',
    dm_difficulty: 'medium'
});

// Record story events
gameState.addToCampaignLog({
    type: 'story_event',
    content: 'Party entered the Mines of Moria',
    character: 'Legolas'
});

// Track NPCs
gameState.addNPCEncounter({
    name: 'Gimli',
    relationship: 'ally',
    first_met: 'Council of Elrond'
});
```

### Settings Management
```javascript
// Update audio settings
gameState.setSetting('audio_settings.music_volume', 0.8);
gameState.setSetting('audio_settings.music_enabled', true);

// Update display preferences
gameState.updateDisplaySettings({
    theme: 'light',
    font_size: 'large',
    animation_speed: 'fast'
});
```

---

## 🔧 Performance Optimization

### Memory Management
- **Lazy Loading**: Load state sections on demand
- **Garbage Collection**: Clean up unused references
- **Size Limits**: Prevent unlimited data growth
- **Efficient Serialization**: Optimized JSON operations

### Storage Optimization
- **Compression**: Large objects compressed
- **Selective Saving**: Only save changed data
- **Batch Operations**: Group multiple changes
- **Background Processing**: Non-blocking operations

---

*The gameState.js system provides robust, persistent state management that ensures player progress is never lost while maintaining optimal performance.*
