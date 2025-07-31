# character.js - Character Management System Documentation

## Overview
The `character.js` file contains the `CharacterManager` class, which handles all aspects of character creation, management, and progression in DiceTales. It provides a comprehensive point-buy character creation system supporting multiple campaign settings and character classes.

## File Dependencies
- **Dependencies**: utils.js, gameState.js
- **Used by**: main.js, ui.js

## Global Variables
- `characterManager` - Global instance of CharacterManager

---

## 🎭 CharacterManager Class

The main class responsible for character creation workflow and character data management.

### Constructor
```javascript
constructor()
```

**Properties initialized:**
- `currentStep` (number): Current step in character creation (0-3)
- `steps` (Array): Step names ['setting', 'class', 'stats', 'details']
- `pointBuyPoints` (number): Available points for stat allocation (27)
- `baseStatCost` (number): Base cost for minimum stats (8)

**Initialization Process:**
1. Calls `initializeData()` - Sets up campaign settings and character classes
2. Calls `bindEvents()` - Registers event listeners

---

## 🌍 Campaign Settings System

### `initializeData()`
Initializes all campaign settings and character class data.

**Campaign Settings Available:**

#### Medieval Fantasy 🏰
- **Classes**: Fighter, Wizard, Rogue, Cleric, Ranger, Paladin, Barbarian, Bard
- **Technology**: Medieval weapons and armor
- **Magic**: High fantasy with spells and magical creatures
- **Currency**: Gold pieces
- **Themes**: Heroic quests, dungeon exploration, political intrigue

#### Modern Day 🏙️
- **Classes**: Investigator, Hacker, Soldier, Medic, Occultist, Detective, Journalist, Athlete
- **Technology**: Modern (smartphones, internet, vehicles)
- **Magic**: Hidden supernatural, urban fantasy
- **Currency**: Dollars
- **Themes**: Conspiracy theories, supernatural investigations, corporate espionage

#### Sci-Fi Space 🚀
- **Classes**: Pilot, Engineer, Psion, Marine, Diplomat, Scientist, Smuggler, Cyborg
- **Technology**: Advanced (FTL travel, energy weapons, AI)
- **Magic**: Psionics, alien technology, quantum manipulation
- **Currency**: Credits
- **Themes**: Space exploration, alien contact, technological singularity

#### Eldritch Horror 🐙
- **Classes**: Investigator, Scholar, Occultist, Detective, Journalist, Antiquarian, Dilettante, Doctor
- **Technology**: 1920s (automobiles, radio, telephone)
- **Magic**: Forbidden knowledge with sanity costs
- **Currency**: Dollars
- **Themes**: Cosmic horror, forbidden knowledge, madness

### Setting Data Structure
```javascript
{
    name: 'Campaign Name',
    icon: '🏰',
    description: 'Detailed campaign description',
    classes: ['available', 'character', 'classes'],
    currency: 'currency type',
    technology: 'Technology level description',
    magic: 'Magic system description',
    themes: ['theme1', 'theme2', 'theme3'],
    dm_personality_hint: 'AI personality guidance'
}
```

---

## ⚔️ Character Classes System

### Class Data Structure
Each character class contains:

```javascript
{
    name: 'Class Name',
    icon: '⚔️',
    description: 'Class description',
    stats: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
    abilities: [
        { name: 'Ability Name', description: 'Ability description' }
    ],
    equipment: ['Starting', 'Equipment', 'List']
}
```

### Example Classes

#### Fighter ⚔️
- **Primary Stats**: Strength (15), Constitution (14), Dexterity (13)
- **Key Abilities**: Second Wind, Action Surge, Fighting Style
- **Equipment**: Long sword, Chain mail, Shield, Adventurer's pack

#### Wizard 🧙
- **Primary Stats**: Intelligence (15), Wisdom (14), Constitution (13)
- **Key Abilities**: Spellcasting, Arcane Recovery, Ritual Casting
- **Equipment**: Quarterstaff, Spellbook, Component pouch, Scholar's pack

#### Rogue 🗡️
- **Primary Stats**: Dexterity (15), Wisdom (14), Intelligence (13)
- **Key Abilities**: Sneak Attack, Thieves' Cant, Expertise
- **Equipment**: Shortsword, Thieves' tools, Leather armor, Burglar's pack

---

## 🎯 Character Creation Workflow

### `showCharacterCreation()`
Initiates the character creation process.

**Process:**
1. Hides game screen
2. Creates character creation HTML if needed
3. Renders character creation interface
4. Shows first step (setting selection)
5. Updates game state to 'character-creation'

### `createCharacterCreationHTML()`
Generates the complete HTML structure for character creation.

**UI Components:**
- **Creation Header**: Title and subtitle
- **Step Indicator**: Visual progress indicator
- **Creation Content**: Dynamic step content area
- **Step Navigation**: Previous/Next/Complete buttons

**Generated Structure:**
```html
<section class="character-creation">
    <div class="creation-header">...</div>
    <div class="step-indicator">...</div>
    <div class="creation-content">...</div>
    <div class="step-navigation">...</div>
</section>
```

---

## 📋 Step System

### Step Navigation

#### `nextStep()`
Advances to the next step in character creation.

**Validation:**
- Validates current step data before advancing
- Updates navigation button states
- Triggers step-specific rendering

#### `prevStep()`
Returns to the previous step.

**Features:**
- Preserves entered data
- Updates navigation states
- Re-renders previous step content

#### `showStep(stepIndex)`
Displays a specific step in the creation process.

**Parameters:**
- `stepIndex` (number): Step index (0-3)

**Steps:**
0. **Setting Selection**: Choose campaign setting
1. **Class Selection**: Choose character class
2. **Stat Allocation**: Distribute ability points
3. **Character Details**: Name, background, notes

### Step Validation

#### `validateStep(stepIndex)`
Validates data for a specific step.

**Parameters:**
- `stepIndex` (number): Step to validate

**Returns:** `boolean` - True if step data is valid

**Validation Rules:**
- **Step 0**: Must select campaign setting
- **Step 1**: Must select character class
- **Step 2**: Must allocate all available points
- **Step 3**: Must provide character name

---

## 📊 Point Buy System

### `calculateRemainingPoints()`
Calculates points remaining in point-buy system.

**Returns:** `number` - Points available for allocation

**Calculation:**
```javascript
const totalUsed = Object.values(stats).reduce((sum, stat) => 
    sum + this.getStatCost(stat), 0);
return this.pointBuyPoints - totalUsed;
```

### `getStatCost(statValue)`
Calculates point cost for a specific stat value.

**Parameters:**
- `statValue` (number): Ability score value (8-15)

**Returns:** `number` - Point cost for that stat value

**Cost Table:**
| Stat Value | Point Cost |
|------------|------------|
| 8          | 0          |
| 9          | 1          |
| 10         | 2          |
| 11         | 3          |
| 12         | 4          |
| 13         | 5          |
| 14         | 7          |
| 15         | 9          |

### `adjustStat(statName, delta)`
Adjusts a character's ability score.

**Parameters:**
- `statName` (string): Ability name ('str', 'dex', 'con', 'int', 'wis', 'cha')
- `delta` (number): Change amount (+1 or -1)

**Constraints:**
- Minimum value: 8
- Maximum value: 15
- Must have points available for increases

---

## 🎨 Rendering System

### `renderCharacterCreation()`
Renders the complete character creation interface.

**Process:**
1. Renders step indicator
2. Renders current step content
3. Updates navigation button states

### Step-Specific Renderers

#### `renderSettingSelection()`
Renders campaign setting selection step.

**Features:**
- Setting cards with icons and descriptions
- Detailed setting information
- Class availability preview
- Technology and magic level indicators

#### `renderClassSelection()`
Renders character class selection step.

**Features:**
- Class cards with stats and abilities
- Detailed class information panel
- Starting equipment display
- Ability descriptions

#### `renderStatAllocation()`
Renders ability score point-buy interface.

**Features:**
- Interactive stat adjustment controls
- Real-time point tracking
- Ability modifier calculations
- Stat descriptions and explanations

#### `renderCharacterDetails()`
Renders final character customization step.

**Features:**
- Character name input
- Background selection
- Character notes/backstory
- Final character summary

### `renderStatRows(stats)`
Generates HTML for stat allocation controls.

**Parameters:**
- `stats` (object): Current ability scores

**Returns:** `string` - HTML for stat control rows

**Features per Row:**
- Stat name and description
- Decrease/increase buttons
- Current value display
- Ability modifier display
- Point cost indication

---

## 🎯 Event Handling

### `bindEvents()`
Registers event listeners for character creation.

**Events Handled:**
- `character:startCreation`: Begin character creation
- `character:nextStep`: Advance to next step
- `character:prevStep`: Return to previous step
- `character:complete`: Finalize character creation

### UI Event Handlers

#### Setting Selection Events
- Setting card clicks
- Setting details expansion

#### Class Selection Events
- Class card clicks
- Class information display

#### Stat Allocation Events
- Stat increase/decrease buttons
- Point validation

#### Character Details Events
- Form input validation
- Name availability checking

---

## ✅ Character Completion

### `completeCreation()`
Finalizes character creation and starts the game.

**Process:**
1. Validates all step data
2. Generates final character object
3. Saves character to game state
4. Emits character creation event
5. Transitions to game screen

**Character Object Structure:**
```javascript
{
    name: 'Character Name',
    class: 'selected-class',
    setting: 'campaign-setting',
    level: 1,
    experience: 0,
    stats: { str: 14, dex: 12, con: 13, int: 10, wis: 11, cha: 8 },
    health: { current: 100, maximum: 100 },
    abilities: [/* class abilities */],
    equipment: [/* starting equipment */],
    background: 'character background',
    notes: 'character notes'
}
```

### `calculateDerivedStats(character)`
Calculates derived statistics from base character data.

**Parameters:**
- `character` (object): Base character data

**Calculated Values:**
- Health points (class + constitution modifier)
- Armor class (base + dexterity modifier)
- Saving throw bonuses
- Skill bonuses
- Initiative modifier

---

## 💾 Data Integration

### Game State Integration

#### `saveCharacterData()`
Saves character data to persistent storage.

**Process:**
1. Gets current character from UI
2. Validates character data
3. Saves to gameState
4. Triggers auto-save

#### `loadCharacterData()`
Loads existing character data.

**Returns:** `object|null` - Character data or null if none exists

**Sources:**
1. Current game state
2. Local storage backup
3. Default character template

### Character Progression

#### `updateCharacterLevel(newLevel)`
Updates character level and recalculates derived stats.

**Parameters:**
- `newLevel` (number): New character level

**Updates:**
- Character level
- Health points
- Spell slots (if applicable)
- Class features
- Proficiency bonus

#### `addExperience(amount)`
Adds experience points and handles level-up.

**Parameters:**
- `amount` (number): Experience points to add

**Process:**
1. Add experience to total
2. Check for level advancement
3. Update character level if needed
4. Grant new class features

---

## 🎨 UI Helper Methods

### `updateNavigationButtons()`
Updates the state of navigation buttons.

**Button States:**
- **Previous**: Disabled on first step
- **Next**: Disabled if current step invalid
- **Complete**: Shown only on final step

### `showStepIndicator()`
Updates visual step progress indicator.

**Features:**
- Highlights current step
- Shows completed steps
- Indicates remaining steps

### `getCharacterSummary()`
Generates character summary for display.

**Returns:** `string` - Formatted character summary

**Includes:**
- Character name and class
- Campaign setting
- Primary stats and modifiers
- Key abilities
- Starting equipment

---

## 🔧 Utility Methods

### `getClassesForSetting(setting)`
Returns available classes for a campaign setting.

**Parameters:**
- `setting` (string): Campaign setting identifier

**Returns:** `Array` - Array of class identifiers

### `getRecommendedStatsForClass(className)`
Returns recommended stat array for a class.

**Parameters:**
- `className` (string): Class identifier

**Returns:** `object` - Recommended ability scores

### `validateCharacterName(name)`
Validates character name input.

**Parameters:**
- `name` (string): Proposed character name

**Returns:** `object` - Validation result
```javascript
{
    isValid: boolean,
    errors: ['error messages']
}
```

**Validation Rules:**
- Minimum 2 characters
- Maximum 30 characters
- No special characters except spaces, hyphens, apostrophes
- Cannot be only whitespace

---

## 🎯 Integration Examples

### Basic Character Creation Flow
```javascript
// Initialize character manager
const characterManager = new CharacterManager();

// Start character creation
characterManager.showCharacterCreation();

// Handle character completion
eventBus.on('characterCreated', (character) => {
    console.log('New character created:', character.name);
    startNewCampaign(character);
});
```

### Custom Class Addition
```javascript
// Add new class to existing setting
characterManager.classes['paladin'] = {
    name: 'Paladin',
    icon: '🛡️',
    description: 'Holy warrior with divine magic',
    stats: { str: 15, dex: 10, con: 14, int: 8, wis: 13, cha: 12 },
    abilities: [
        { name: 'Divine Sense', description: 'Detect celestial, fiend, or undead' },
        { name: 'Lay on Hands', description: 'Healing touch ability' }
    ],
    equipment: ['Longsword', 'Chain mail', 'Holy symbol', 'Explorer\'s pack']
};
```

### Stat Allocation Automation
```javascript
// Automatically allocate stats for quick creation
const quickBuildStats = {
    fighter: { str: 15, dex: 12, con: 14, int: 8, wis: 10, cha: 9 },
    wizard: { str: 8, dex: 12, con: 13, int: 15, wis: 14, cha: 10 },
    rogue: { str: 10, dex: 15, con: 12, int: 13, wis: 12, cha: 8 }
};

// Apply quick build
function applyQuickBuild(className) {
    const stats = quickBuildStats[className];
    if (stats) {
        Object.entries(stats).forEach(([stat, value]) => {
            characterManager.setStat(stat, value);
        });
    }
}
```

---

## 🎭 Character Templates

The system supports predefined character templates for quick creation:

### Template Structure
```javascript
{
    name: 'Template Name',
    class: 'class-id',
    setting: 'setting-id',
    stats: { /* balanced stats */ },
    background: 'Background description',
    notes: 'Character concept notes'
}
```

### Popular Templates
- **Classic Hero**: Balanced fighter for beginners
- **Mysterious Mage**: Intelligence-focused wizard
- **Sneaky Scout**: Dexterity-focused rogue
- **Divine Healer**: Wisdom-focused cleric

---

*The character.js system provides a comprehensive, user-friendly character creation experience that scales from simple quick-builds to detailed custom characters across multiple campaign settings.*
