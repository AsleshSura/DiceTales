# audio.js - Audio System Documentation

## Overview
The `audio.js` file contains the `AudioManager` class, which handles all audio functionality in DiceTales including background music, sound effects, and Web Audio API management. It provides immersive audio experiences while respecting browser audio policies.

## File Dependencies
- **Dependencies**: utils.js, gameState.js
- **Used by**: main.js, dice.js, ui.js

## Global Variables
- `audioManager` - Global instance of AudioManager

---

## 🔊 AudioManager Class

### Constructor Properties
- `audioContext` - Web Audio API context
- `musicVolume` - Background music volume (0.3)
- `sfxVolume` - Sound effects volume (0.7)
- `musicEnabled` - Music on/off state
- `sfxEnabled` - SFX on/off state
- `currentMusic` - Currently playing music track
- `soundCache` - Map for cached audio files
- `initialized` - Initialization state flag

### Key Features
- **User Interaction Compliance**: Waits for user interaction before initializing
- **Dynamic Sound Generation**: Web Audio API synthesized sounds
- **Volume Control**: Separate controls for music and SFX
- **Event Integration**: Responds to game events automatically
- **Settings Persistence**: Saves audio preferences

---

## 🎵 Audio Initialization

### `setupUserInteractionHandler()`
Sets up event listeners to initialize audio after first user interaction.

**Browser Policy Compliance:**
- Waits for click, keydown, or touchstart events
- Prevents autoplay policy violations
- Removes listeners after initialization

### `async init()`
Initializes the Web Audio API and audio system.

**Process:**
1. Creates AudioContext
2. Loads saved settings
3. Binds event listeners
4. Shows ready notification
5. Auto-starts background music if enabled

---

## 🎶 Background Music System

### `startBackgroundMusic(theme = 'default')`
Starts background music for the specified theme.

**Themes:**
- `'default'` - General ambient music
- `'adventure'` - Campaign/exploration music
- `'combat'` - Battle music
- `'mystery'` - Suspenseful music
- `'victory'` - Success/celebration music

### `playBackgroundMusic(theme)`
Switches to specific themed background music.

### `stopBackgroundMusic()`
Stops currently playing background music.

### `toggleMusic()`
Toggles music on/off and saves preference.

---

## 🔊 Sound Effects System

### `playSFX(soundType)`
Plays synthesized sound effects using Web Audio API.

**Available Sound Types:**
- `'click'` - UI button clicks
- `'dice'` - Dice rolling sounds
- `'success'` - Success notifications
- `'error'` - Error alerts
- `'levelup'` - Character progression
- `'default'` - Generic notification

### Dice-Specific Sounds

#### `playDiceSound(diceTypes)`
Plays sounds for dice rolling based on dice types.

**Parameters:**
- `diceTypes` (Array): Array of dice being rolled

**Sound Generation:**
- Different frequencies for different dice types
- Multiple dice create harmonic combinations
- Duration and pitch vary by dice size

### Sound Configuration Methods

#### `configureDiceSound(oscillator, gainNode, frequency)`
Configures dice rolling sound with:
- Square wave oscillator
- Frequency sweep effect
- Short duration (0.2s)

#### `configureClickSound(oscillator, gainNode)`
Configures UI click sound with:
- Sine wave at 800Hz
- Quick fade-out (0.1s)
- Low volume

#### `configureSuccessSound(oscillator, gainNode)`
Configures success notification with:
- Major chord progression (C-E-G)
- Ascending frequency pattern
- Positive, uplifting tone

#### `configureErrorSound(oscillator, gainNode)`
Configures error notification with:
- Sawtooth wave for harsh tone
- Descending frequency
- Attention-grabbing sound

#### `configureLevelUpSound(oscillator, gainNode)`
Configures level-up celebration with:
- C major scale ascension
- Extended duration (0.8s)
- Triumphant progression

---

## ⚙️ Settings and Configuration

### `loadSettings()`
Loads audio settings from game state.

**Settings Loaded:**
- Music volume level
- SFX volume level
- Music enabled state
- SFX enabled state

### `updateSettings(settings)`
Updates audio settings and saves to game state.

**Parameters:**
- `settings` (object): New audio settings

### `setMusicVolume(volume)`
Sets background music volume (0.0 - 1.0).

### `setSFXVolume(volume)`
Sets sound effects volume (0.0 - 1.0).

---

## 🔔 Event System Integration

### Events Listened To:
- `campaign:start` - Start adventure music
- `dice:rolled` - Play dice sounds
- `character:levelUp` - Play level-up sound
- `ui:buttonClick` - Play click sound
- `settings:audioChanged` - Update audio settings

### Events Emitted:
- `audio:ready` - Audio system initialized
- `audio:musicChanged` - Music track changed
- `audio:settingsChanged` - Audio settings updated

---

## 🎛️ Web Audio API Integration

### AudioContext Management
- **Context Creation**: Handles browser compatibility
- **State Management**: Suspended/running states
- **Page Visibility**: Pauses/resumes on tab changes
- **Memory Management**: Cleans up audio nodes

### Synthesized Audio Generation
All sounds are generated programmatically using:
- **Oscillators**: Various waveform types
- **Gain Nodes**: Volume and envelope control
- **Frequency Modulation**: Dynamic pitch changes
- **Envelope Shaping**: Attack, decay, sustain, release

---

## 🎯 Usage Examples

### Basic Audio Setup
```javascript
// Audio initializes automatically on user interaction
// Manual initialization if needed:
await audioManager.init();
```

### Playing Sounds
```javascript
// Play various sound effects
audioManager.playSFX('click');
audioManager.playSFX('success');
audioManager.playSFX('dice');

// Play background music
audioManager.startBackgroundMusic('adventure');
```

### Volume Control
```javascript
// Adjust volumes
audioManager.setMusicVolume(0.5);
audioManager.setSFXVolume(0.8);

// Toggle audio
audioManager.toggleMusic();
```

### Event-Driven Audio
```javascript
// Audio automatically responds to events
eventBus.emit('dice:rolled', { dice: ['d20'] });
eventBus.emit('character:levelUp');
```

---

## 🛠️ Browser Compatibility

### Web Audio API Support
- **Modern Browsers**: Full Web Audio API support
- **Safari**: webkitAudioContext fallback
- **Mobile**: Touch interaction handling
- **Older Browsers**: Graceful degradation

### Performance Optimization
- **Lazy Loading**: Audio context created on demand
- **Sound Caching**: Reuse audio nodes when possible
- **Memory Cleanup**: Proper disposal of audio resources
- **CPU Efficiency**: Minimal audio processing overhead

---

*The audio.js system provides rich, dynamic audio experiences that enhance immersion while respecting browser policies and user preferences.*
