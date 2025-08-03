# DiceTales Character System

This document explains the enhanced character system using `character.json` for storing comprehensive character data.

## Overview

The character system consists of three main components:

1. **`character.json`** - The master character data file
2. **`characterDataManager.js`** - JavaScript class for managing character data
3. **`characterIntegration.js`** - Integration utilities for existing systems

## Files

### character.json

A comprehensive JSON file that stores all character details including:

- **Basic Info**: Name, class, level, experience, background
- **Campaign Setting**: Setting type, icons, currency, technology level
- **Ability Scores**: Base stats, point-buy allocations, final values, modifiers
- **Health & Vitals**: HP, AC, initiative, speed, proficiency bonus
- **Class Features**: Abilities, spellcasting info, saving throws
- **Skills**: All skills with proficiencies and modifiers
- **Equipment**: Weapons, armor, consumables, tools, currency
- **Progression**: XP tracking, level progression, ability improvements  
- **Personality**: Traits, ideals, bonds, flaws, languages
- **Backstory**: Background details, personal history, connections
- **Campaign Data**: Quests, locations, NPCs, story beats, flags
- **AI Context**: Personality summary, preferences for AI interactions

### characterDataManager.js

JavaScript class providing methods to:

- Load/save character data from JSON or localStorage
- Update character stats, health, experience
- Add/remove inventory items
- Manage quests and campaign flags
- Handle level progression
- Export/import character data
- Sync with existing gameState system

### characterIntegration.js

Utility functions that:

- Initialize the character system on page load
- Convert existing gameState data to new format
- Enhance character creation with detailed data
- Hook into inventory and progression systems
- Handle automatic syncing between systems

## Usage

### Basic Usage

```javascript
// The system auto-initializes, but you can also manually initialize
await initializeCharacterSystem();

// Access the character data manager
const character = characterDataManager.character;
console.log(character.basic_info.name); // Character name

// Update character stats
characterDataManager.updateStat('str', 16);
characterDataManager.updateHealth(85, 120);
characterDataManager.addExperience(250);

// Manage inventory
const sword = {
    name: "Magic Sword +1",
    type: "weapon",
    damage: "1d8+1",
    magical: true
};
characterDataManager.addItem(sword);

// Quest management
const quest = {
    title: "Save the Village",
    description: "Rescue villagers from bandits",
    objectives: [
        { description: "Find the bandit camp", completed: false },
        { description: "Defeat the bandit leader", completed: false }
    ]
};
characterDataManager.addQuest(quest);
```

### Integration with Existing Systems

The system automatically integrates with your existing DiceTales code:

```javascript
// Character creation is automatically enhanced
// When character creation completes, detailed data is created

// AI system gets enhanced context
const aiContext = characterDataManager.getAIContext();
// Returns comprehensive character info for AI interactions

// Inventory tracking is enhanced
// When AI adds items, they're automatically stored in detailed format

// Experience and leveling work seamlessly
// Level ups automatically update all dependent values
```

### Data Access Methods

```javascript
// Get character information
const basicInfo = characterDataManager.getBasicInfo();
const stats = characterDataManager.getStats();
const health = characterDataManager.getHealth();
const items = characterDataManager.getAllItems();

// Update character data
characterDataManager.updateStat('dex', 14);
characterDataManager.addExperience(100);
characterDataManager.updateHealth(currentHP, maxHP);

// Quest management
characterDataManager.addQuest(questData);
characterDataManager.completeQuest('quest_id', 'success');

// Campaign flags
characterDataManager.setCampaignFlag('met_king', true);
const hasMetKing = characterDataManager.getCampaignFlag('met_king');

// Save/load
characterDataManager.saveCharacter();
await characterDataManager.loadCharacter();
```

## Data Structure

The character.json follows this high-level structure:

```json
{
  "version": "2.0.0",
  "metadata": { /* Creation/update info */ },
  "basic_info": { /* Name, class, level, etc. */ },
  "campaign_setting": { /* Setting type and details */ },
  "ability_scores": { /* Stats, modifiers, setting names */ },
  "health_and_vitals": { /* HP, AC, initiative, etc. */ },
  "class_features": { /* Class abilities and features */ },
  "skills": { /* All skills with proficiencies */ },
  "equipment": { /* Detailed item tracking */ },
  "progression": { /* XP, level progression */ },
  "personality": { /* Traits, ideals, bonds, flaws */ },
  "backstory": { /* Background and personal history */ },
  "roleplay_notes": { /* Voice, motivations, quirks */ },
  "campaign_data": { /* Quests, NPCs, locations */ },
  "game_mechanics": { /* Initiative, saves, conditions */ },
  "ai_context": { /* AI personality hints */ },
  "import_export": { /* Compatibility settings */ }
}
```

## Benefits

1. **Comprehensive**: Stores all character details in one place
2. **Persistent**: Data survives browser sessions and can be exported
3. **Compatible**: Works with existing DiceTales systems
4. **Extensible**: Easy to add new fields and features
5. **AI-Enhanced**: Provides rich context for AI interactions
6. **Portable**: Can be exported/imported between different systems

## Migration

If you have an existing character in the old system:

1. The integration script automatically detects and converts old data
2. Your existing character will be preserved and enhanced
3. All current functionality continues to work
4. New features become available automatically

## Customization

You can customize the character data by:

1. Editing `character.json` directly for detailed changes
2. Using the `characterDataManager` methods in your code
3. Adding custom fields to the JSON structure
4. Extending the `CharacterDataManager` class with new methods

## Export/Import

The system supports exporting character data for:

- Backup purposes
- Sharing with other players
- Importing into other D&D tools
- Migrating between different systems

```javascript
// Export character
const exportData = characterDataManager.exportCharacter('json');

// Save to file (in a full application)
const blob = new Blob([exportData], { type: 'application/json' });
// ... handle file download

// Import character (from file input)
await characterDataManager.loadCharacter('./path/to/character.json');
```

The character system is designed to be powerful yet easy to use, providing a comprehensive foundation for character management in DiceTales.
