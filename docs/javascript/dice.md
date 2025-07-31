# dice.js - Dice Rolling System Documentation

## Overview
The `dice.js` file contains the `DiceSystem` class, which provides a comprehensive 3D dice rolling system with physics animations, roll history tracking, and D&D-style dice mechanics. It supports all standard tabletop gaming dice types with visual feedback and critical hit/fumble detection.

## File Dependencies
- **Dependencies**: utils.js, gameState.js
- **Used by**: main.js, character.js, ai.js

## Global Variables
- `diceSystem` - Global instance of DiceSystem
- `window.diceSystem` - Debug access to dice system

---

## 🎲 DiceSystem Class

The main class responsible for dice rolling mechanics, animations, and result tracking.

### Constructor
```javascript
constructor()
```

**Properties initialized:**
- `availableDice` (object): Dictionary of all available dice types
- `selectedDice` (Array): Currently selected dice for rolling
- `rollHistory` (Array): History of all dice rolls
- `isRolling` (boolean): Current rolling state flag

**Initialization Process:**
1. Calls `init()` - Sets up UI and event handlers
2. Renders dice selection interface
3. Binds event listeners
4. Updates roll button state

---

## 🎯 Available Dice Types

### Dice Configuration
```javascript
availableDice = {
    'd4': { sides: 4, name: 'D4', icon: '▲' },
    'd6': { sides: 6, name: 'D6', icon: '⚀' },
    'd8': { sides: 8, name: 'D8', icon: '♦' },
    'd10': { sides: 10, name: 'D10', icon: '⬟' },
    'd12': { sides: 12, name: 'D12', icon: '⬢' },
    'd20': { sides: 20, name: 'D20', icon: '⚛' },
    'd100': { sides: 100, name: 'D%', icon: '%' }
}
```

### Dice Properties
Each dice type contains:
- **sides** (number): Number of sides on the die
- **name** (string): Display name for UI
- **icon** (string): Unicode symbol for visual representation

### Common Use Cases
- **d4**: Damage dice for small weapons
- **d6**: Standard dice for various checks
- **d8**: Medium weapon damage
- **d10**: Percentile rolls (with d100)
- **d12**: Large weapon damage
- **d20**: Primary dice for D&D checks, attacks, saves
- **d100**: Percentile rolls, random tables

---

## 🎨 User Interface Methods

### `renderDiceSelection()`
Renders the dice selection interface with clickable dice buttons.

**Generated HTML Structure:**
```html
<button class="dice-type-btn [selected]" data-dice="d20">
    <div class="dice-icon">⚛</div>
    <div class="dice-label">D20</div>
</button>
```

**Features:**
- Visual indication of selected dice
- Click handlers for dice selection
- Dynamic class management
- Accessibility-friendly buttons

### `toggleDiceSelection(diceType)`
Toggles selection state of a specific dice type.

**Parameters:**
- `diceType` (string): Dice identifier ('d4', 'd6', etc.)

**Process:**
1. Check if dice is currently selected
2. Add/remove from selectedDice array
3. Re-render dice selection UI
4. Update roll button state
5. Save preferences to game state

**Example:**
```javascript
diceSystem.toggleDiceSelection('d20'); // Toggle d20 selection
```

### `updateRollButton()`
Updates the roll button state and text based on current selections.

**Button States:**
- **Disabled**: When no dice selected or currently rolling
- **Enabled**: When dice selected and not rolling
- **Rolling State**: Shows "Rolling..." during animation

**Button Text Examples:**
- "🎲 Roll 1 Dice" (single die selected)
- "🎲 Roll 3 Dice" (multiple dice selected)
- "Rolling..." (during roll animation)

---

## 🎲 Dice Rolling Mechanics

### `async rollDice()`
Main method to execute dice rolling with animations.

**Returns:** `Promise<Array>` - Array of roll result objects

**Process Flow:**
1. **Validation**: Check if rolling is allowed
2. **State Update**: Set rolling state and update UI
3. **Individual Rolls**: Roll each selected die
4. **Animation**: Display 3D dice animations
5. **Wait**: Allow animations to complete (2 seconds)
6. **Results**: Process and display final results
7. **Cleanup**: Reset rolling state

**Animation Timing:**
- **Animation Duration**: 1.5 seconds
- **Total Wait**: 2 seconds
- **Result Display**: After animation completes

### `rollSingleDie(diceType)`
Rolls a single die and returns detailed result information.

**Parameters:**
- `diceType` (string): Type of die to roll

**Returns:** `object` - Roll result object
```javascript
{
    dice: 'd20',           // Die type rolled
    sides: 20,             // Number of sides
    value: 15,             // Rolled value
    timestamp: '2025-07-30T12:34:56.789Z',
    critical: false,       // True if maximum roll
    fumble: false          // True if 1 on d20
}
```

**Special Results:**
- **Critical Hit**: Rolling maximum value on any die
- **Fumble**: Rolling 1 on a d20 specifically
- **Timestamp**: ISO string for roll tracking

**Example:**
```javascript
const result = diceSystem.rollSingleDie('d20');
console.log(`Rolled ${result.value} on a d20`);
```

---

## 🎭 Animation System

### `renderDiceAnimation(container, diceType, result)`
Creates and displays 3D dice rolling animation.

**Parameters:**
- `container` (HTMLElement): Element to contain the animation
- `diceType` (string): Type of die being animated
- `result` (number): Final roll result

**Animation Features:**
- **3D Appearance**: CSS-based 3D dice representation
- **Rolling Motion**: Animated rotation and movement
- **Result Reveal**: Final value displayed after animation
- **Critical Styling**: Special styling for critical hits/fumbles

**CSS Classes Applied:**
- `dice-3d`: Base 3D dice styling
- `rolling`: Animation state class
- `critical-success`: Maximum roll styling
- `critical-failure`: Minimum roll (fumble) styling

### `getDiceFaces(diceType, result)`
Generates HTML for dice faces (simplified implementation).

**Parameters:**
- `diceType` (string): Type of die
- `result` (number): Roll result

**Returns:** `string` - HTML for dice faces

**Note:** Current implementation is simplified. Full version would render proper 3D geometry for each die type with accurate face positioning.

---

## 📊 Result Processing

### `processRollResults(results)`
Processes roll results and updates game state.

**Parameters:**
- `results` (Array): Array of individual roll results

**Processing Steps:**
1. **Calculate Total**: Sum all individual roll values
2. **Detect Specials**: Check for critical hits and fumbles
3. **Create Roll Data**: Generate comprehensive roll record
4. **Update History**: Add to roll history and game state
5. **Emit Events**: Notify other systems of the roll
6. **Show Notification**: Display toast with results

**Roll Data Structure:**
```javascript
{
    id: 'roll_1627834567890_1234',  // Unique roll ID
    timestamp: '2025-07-30T12:34:56.789Z',
    dice: ['d20', 'd6'],            // Dice types rolled
    results: [/* individual results */],
    total: 18,                      // Sum of all rolls
    critical: false,                // Any critical hits
    fumble: false                   // Any fumbles
}
```

### Roll History Management
- **Storage**: Maintained in memory and persistent storage
- **Ordering**: Most recent rolls first
- **Integration**: Automatically saved to game state
- **Event Broadcasting**: Other systems notified of new rolls

---

## 🔔 Event System Integration

### Event Emission
The dice system emits events for other game systems:

#### `dice:rolled` Event
Emitted after each roll completion.

**Event Data:**
```javascript
{
    id: 'roll_id',
    timestamp: 'ISO_timestamp',
    dice: ['d20'],
    results: [/* roll results */],
    total: 15,
    critical: false,
    fumble: false
}
```

**Usage Example:**
```javascript
eventBus.on('dice:rolled', (rollData) => {
    if (rollData.critical) {
        console.log('Critical hit!');
        triggerCriticalAnimation();
    }
});
```

### Event Listening
The dice system listens for game state changes:

#### `gameState:loaded` Event
Restores dice preferences when game state loads.

**Process:**
1. Retrieve saved dice preferences
2. Update selectedDice array
3. Re-render dice selection UI
4. Update button states

---

## 🎯 Integration with Game Systems

### Character System Integration
```javascript
// Roll ability check
const abilityRoll = await diceSystem.rollDice(); // d20 selected
const modifier = getAbilityModifier(character.stats.dex);
const total = abilityRoll[0].value + modifier;
```

### Combat System Integration
```javascript
// Roll weapon damage
diceSystem.selectedDice = ['d8']; // Longsword damage
const damageRoll = await diceSystem.rollDice();
const damage = damageRoll[0].value + strengthModifier;
```

### AI System Integration
```javascript
// AI requests dice roll for story
eventBus.on('ai:requestRoll', (rollType) => {
    if (rollType === 'perception') {
        diceSystem.selectedDice = ['d20'];
        diceSystem.rollDice();
    }
});
```

---

## 📱 User Experience Features

### Visual Feedback
- **Selection Highlighting**: Selected dice visually distinct
- **Animation**: Smooth 3D rolling animations
- **Result Emphasis**: Critical hits and fumbles specially styled
- **Toast Notifications**: Immediate feedback on roll results

### Accessibility
- **Keyboard Support**: Dice selection via keyboard
- **Screen Reader**: Proper ARIA labels and descriptions
- **High Contrast**: Clear visual distinctions
- **Motion Sensitivity**: Option to reduce animations (future feature)

### Performance
- **Efficient Rendering**: Minimal DOM manipulation
- **Animation Optimization**: CSS-based animations for smooth performance
- **Memory Management**: Automatic cleanup of old roll history
- **Responsive Design**: Works on mobile and desktop

---

## 🔧 Configuration and Customization

### Dice Preferences
```javascript
// Set preferred dice selection
diceSystem.selectedDice = ['d20', 'd4'];
diceSystem.renderDiceSelection();

// Save preferences
gameState.setSetting('dice_preferences', diceSystem.selectedDice);
```

### Custom Dice Types
```javascript
// Add custom dice type
diceSystem.availableDice['d3'] = {
    sides: 3,
    name: 'D3',
    icon: '△'
};
diceSystem.renderDiceSelection();
```

### Roll History Configuration
```javascript
// Limit roll history size
const MAX_HISTORY = 100;
if (diceSystem.rollHistory.length > MAX_HISTORY) {
    diceSystem.rollHistory = diceSystem.rollHistory.slice(0, MAX_HISTORY);
}
```

---

## 🎲 Advanced Rolling Features

### Multiple Dice Rolls
```javascript
// Roll multiple dice at once
diceSystem.selectedDice = ['d20', 'd20']; // Advantage roll
const rolls = await diceSystem.rollDice();
const higherRoll = Math.max(rolls[0].value, rolls[1].value);
```

### Conditional Rolling
```javascript
// Automatic reroll on fumbles
eventBus.on('dice:rolled', (rollData) => {
    if (rollData.fumble && autoRerollFumbles) {
        setTimeout(() => {
            diceSystem.rollDice(); // Reroll
        }, 3000);
    }
});
```

### Roll Modifiers (Future Enhancement)
```javascript
// Roll with modifier display
const rollWithModifier = {
    base: rollResult.value,
    modifier: characterModifier,
    total: rollResult.value + characterModifier,
    advantage: false,
    disadvantage: false
};
```

---

## 🔍 Debugging and Development

### Debug Methods
```javascript
// Force specific roll result (development only)
if (window.DEBUG_MODE) {
    diceSystem.forceResult = (diceType, value) => {
        return { dice: diceType, value: value, /* ... */ };
    };
}
```

### Roll Statistics
```javascript
// Analyze roll history
const getStats = () => {
    const d20Rolls = diceSystem.rollHistory
        .flatMap(r => r.results)
        .filter(r => r.dice === 'd20');
    
    const average = d20Rolls.reduce((sum, r) => sum + r.value, 0) / d20Rolls.length;
    const criticals = d20Rolls.filter(r => r.critical).length;
    
    return { average, criticals, total: d20Rolls.length };
};
```

---

## 💡 Usage Examples

### Basic Dice Rolling
```javascript
// Select and roll a d20
diceSystem.selectedDice = ['d20'];
const results = await diceSystem.rollDice();
console.log(`Rolled: ${results[0].value}`);
```

### Multiple Dice Combat Roll
```javascript
// Roll attack and damage
diceSystem.selectedDice = ['d20', 'd8']; // Attack + damage
const rolls = await diceSystem.rollDice();
const attackRoll = rolls[0].value;
const damageRoll = rolls[1].value;
```

### Skill Check with Feedback
```javascript
eventBus.on('dice:rolled', (rollData) => {
    if (rollData.total >= 15) {
        showToast('Skill check succeeded!', 'success');
    } else {
        showToast('Skill check failed.', 'error');
    }
});

diceSystem.selectedDice = ['d20'];
diceSystem.rollDice();
```

---

*The dice.js system provides immersive, realistic dice rolling that enhances the tabletop gaming experience with visual flair and accurate D&D mechanics.*
