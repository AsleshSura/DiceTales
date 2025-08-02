# DiceTales Data Flow & API Reference

This document details the data structures, API patterns, and information flow throughout the DiceTales application.

## 📊 Core Data Structures

### Game State Schema
```javascript
// Complete game state structure stored in localStorage
const GameStateSchema = {
    version: "1.0.0",                    // Schema version for migrations
    
    // Character Information
    character: {
        name: "",                        // Player's character name
        class: "",                       // Character class (warrior, scholar, etc.)
        level: 1,                        // Current character level
        experience: 0,                   // Experience points
        background: "",                  // Character background story
        
        // Ability Scores (D&D-style stats)
        stats: {
            str: 10,                     // Strength
            dex: 10,                     // Dexterity  
            con: 10,                     // Constitution
            int: 10,                     // Intelligence
            wis: 10,                     // Wisdom
            cha: 10                      // Charisma
        },
        
        // Health System
        health: {
            current: 100,                // Current hit points
            maximum: 100                 // Maximum hit points
        },
        
        // Character Progression
        skills: {},                      // Learned skills and proficiencies
        abilities: [],                   // Special abilities and features
        inventory: [],                   // Items and equipment
        equipment: {
            weapon: null,                // Equipped weapon
            armor: null,                 // Equipped armor
            shield: null,                // Equipped shield
            accessories: []              // Rings, amulets, etc.
        },
        
        notes: ""                        // Player notes about character
    },
    
    // Campaign Information
    campaign: {
        setting: "",                     // Campaign setting (medieval-fantasy, etc.)
        dm_difficulty: "medium",         // AI difficulty level
        dm_custom_prompt: "",            // Custom DM personality instructions
        
        // World State
        current_location: "",            // Where the character currently is
        story_state: "",                 // Current narrative state
        scene_context: "",               // Current scene description
        
        // History and Progress
        choices_made: [],                // Player choices and consequences
        npcs_encountered: [],            // NPCs met and their relationships
        locations_visited: [],           // Places the character has been
        campaign_log: [],                // Chronicle of events
        current_quest: null,             // Active quest information
        completed_quests: [],            // Finished quests
        
        // Flags and Variables
        campaign_flags: {},              // Story flags and variables
        world_state: {}                  // World conditions and changes
    },
    
    // User Settings
    settings: {
        // Dice Preferences
        dice_preferences: ["d20", "d12", "d10", "d8", "d6", "d4"],
        
        // Audio Settings
        audio_settings: {
            master_volume: 0.7,          // Overall volume
            music_volume: 0.5,           // Background music volume
            sfx_volume: 0.8,             // Sound effects volume
            music_enabled: true,         // Music on/off
            sfx_enabled: true            // Sound effects on/off
        },
        
        // Display Preferences
        display_preferences: {
            theme: "dark",               // UI theme
            font_size: "medium",         // Text size
            animation_speed: "normal",   // Animation timing
            auto_scroll: true,           // Auto-scroll new content
            show_dice_history: true      // Show dice roll history
        },
        
        // AI Settings
        ai_settings: {
            response_length: "medium",   // AI response length preference
            creativity_level: "balanced", // AI creativity setting
            enable_auto_actions: false   // Auto-generate some actions
        }
    },
    
    // UI State
    ui: {
        current_screen: "character-creation", // Active screen
        modal_state: {},                 // Open modals and their state
        last_roll: null,                 // Most recent dice roll
        roll_history: [],                // History of dice rolls
        input_history: [],               // History of player inputs
        selected_dice: ["d20"],          // Currently selected dice types
        
        // Turn Management
        currentTurn: null,               // Current turn information
        turnCount: 0                     // Total turns played
    },
    
    // Metadata
    meta: {
        created_at: "2024-01-01T00:00:00.000Z", // Game creation timestamp
        last_played: "2024-01-01T00:00:00.000Z", // Last play session
        total_playtime: 0,               // Total time played (minutes)
        session_start: "2024-01-01T00:00:00.000Z", // Current session start
        saves_count: 0,                  // Number of saves performed
        version: "1.0.0"                 // Data version
    }
};
```

### Character Creation Data Flow
```javascript
// Character creation process data
const CharacterCreationFlow = {
    // Step 1: Campaign Setting Selection
    settingSelection: {
        setting: "medieval-fantasy",     // Selected campaign setting
        settingData: {
            name: "Medieval Fantasy",
            icon: "🏰",
            description: "Classic sword and sorcery...",
            classes: ["warrior", "scholar", "scout", "healer", "explorer", "merchant"],
            abilityScores: {
                str: { name: "Strength", abbr: "STR", description: "Physical power" }
                // ... other abilities
            }
        }
    },
    
    // Step 2: Character Class Selection
    classSelection: {
        selectedClass: "warrior",
        classData: {
            name: "Warrior",
            description: "Masters of combat and warfare",
            primaryStats: ["str", "con"],
            startingHP: 120,
            abilities: ["Combat Training", "Weapon Expertise"]
        }
    },
    
    // Step 3: Ability Score Assignment (Point Buy)
    statAllocation: {
        pointsRemaining: 27,             // Points left to spend
        costs: {                         // Point costs for each score
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
            14: 7, 15: 9
        },
        currentStats: {
            str: 15, dex: 12, con: 14,
            int: 10, wis: 13, cha: 11
        }
    },
    
    // Step 4: Character Details
    characterDetails: {
        name: "Hero McHeroface",
        background: "Former guard who seeks adventure"
    }
};
```

### AI System Data Structures
```javascript
// AI Manager conversation context
const AIContext = {
    // Conversation History
    conversationHistory: [
        {
            role: "system",              // system, user, assistant
            content: "You are a skilled Dungeon Master...",
            timestamp: "2024-01-01T00:00:00.000Z"
        },
        {
            role: "user",
            content: "I want to explore the tavern",
            timestamp: "2024-01-01T00:00:00.000Z"
        }
    ],
    
    // Current Context
    currentContext: {
        character: {/* character data */},
        campaign: {/* campaign data */},
        location: "The Prancing Pony Tavern",
        recentEvents: ["Entered tavern", "Spoke with bartender"],
        activeNPCs: ["Barliman the Bartender"],
        sceneDescription: "A cozy tavern filled with warmth..."
    },
    
    // AI Configuration
    modelConfig: {
        currentModel: "microsoft/DialoGPT-medium",
        maxTokens: 8000,
        temperature: 0.8,
        topP: 0.9
    },
    
    // Response State
    isProcessing: false,
    lastResponse: {
        content: "The bartender looks up as you approach...",
        evaluationScore: 7.2,
        timestamp: "2024-01-01T00:00:00.000Z"
    }
};

// DM Evaluation Data
const EvaluationData = {
    // Current Response Evaluation
    currentEvaluation: {
        response: "The tavern door creaks open...",
        scores: {
            immersion: 0.8,              // 0-1 scale
            personality: 0.7,
            engagement: 0.9,
            flow: 0.8,
            authenticity: 0.6,
            creativity: 0.7
        },
        totalScore: 7.8,                 // Out of 10
        feedback: {
            strengths: ["Great atmosphere", "Engaging description"],
            improvements: ["More specific details", "Character interaction"]
        },
        timestamp: "2024-01-01T00:00:00.000Z"
    },
    
    // Historical Data
    responseHistory: [
        /* Array of past evaluations */
    ],
    
    // Statistics
    stats: {
        averageScore: 7.2,
        totalEvaluations: 45,
        improvementTrend: 0.3,           // Positive = improving
        criteriaAverages: {
            immersion: 7.8,
            personality: 6.9,
            engagement: 7.5,
            flow: 7.1,
            authenticity: 6.8,
            creativity: 7.3
        }
    }
};
```

### Dice System Data Structures
```javascript
// Dice Roll Data
const DiceRollData = {
    // Roll Configuration
    diceType: "d20",                     // Type of die rolled
    diceCount: 1,                        // Number of dice
    modifier: 3,                         // Modifier applied
    reason: "Strength check",            // Why the roll was made
    
    // Roll Results
    rawRolls: [15],                      // Individual die results
    total: 18,                           // Final result with modifiers
    
    // Context
    character: "Hero McHeroface",
    turnId: "turn_1234567890_abc123",
    timestamp: "2024-01-01T00:00:00.000Z",
    
    // Metadata
    rollId: "roll_1234567890_def456",
    wasSuccessful: true,                 // If there was a target DC
    targetDC: 15                         // Difficulty Class if applicable
};

// Turn Management
const TurnData = {
    currentTurn: {
        id: "turn_1234567890_abc123",
        hasRolled: false,                // Whether player has rolled this turn
        startTime: "2024-01-01T00:00:00.000Z",
        aiResponse: "You see a locked door. What do you do?",
        playerAction: null,              // Player's intended action
        rollRequired: {
            type: "d20",
            reason: "Lockpicking attempt",
            dc: 15
        }
    },
    
    turnHistory: [
        /* Previous turns */
    ],
    
    rollHistory: [
        /* Recent dice rolls */
    ]
};
```

## 🔄 Data Flow Patterns

### Application Initialization Flow
```
1. index.html loads → Script loading cascade
2. config.js → AI_CONFIG global
3. utils.js → Global utility functions
4. gameState.js → GameState instance creation
5. character.js → CharacterManager instance
6. dice.js → DiceSystem instance
7. dmEvaluator.js → DMEvaluator class definition
8. ai.js → AIManager with DMEvaluator integration
9. audio.js → AudioManager instance
10. ui.js → UIManager instance
11. main.js → DiceTalesApp initialization
```

### Character Creation Data Flow
```
User Input → CharacterManager → Validation → GameState → LocalStorage
    ↓              ↓               ↓            ↓            ↓
  Form Data → Step Processing → Data Validation → State Update → Persistence
    ↓              ↓               ↓            ↓            ↓
Character → Setting + Class + → Complete → gameState.set() → Auto-save
  Data        Stats + Details    Character    Character      Triggered
```

### Game Loop Data Flow
```
Player Action → UI Processing → AI Generation → Response Processing → Display Update
     ↓              ↓               ↓                ↓                ↓
Text/Dice → uiManager.submit → aiManager.process → dmEvaluator.score → UI Refresh
  Input       PlayerAction      PlayerAction       Response           + State Save
     ↓              ↓               ↓                ↓                ↓
  Validation → Action Parsing → HuggingFace → Quality Assessment → Screen Update
     ↓              ↓              Request           ↓                ↓
  Required → Context Building → API Response → Feedback Generation → Next Turn
```

### State Persistence Flow  
```
Any State Change → gameState.set() → Internal Update → Auto-save Trigger → localStorage
       ↓                ↓                 ↓               ↓                 ↓
   User Action → Path-based Update → Validation → Debounced Save → JSON Serialization
       ↓                ↓                 ↓               ↓                 ↓
  UI Interaction → Nested Property → Type Checking → 5s Delay → Browser Storage
       ↓                ↓                 ↓               ↓                 ↓
Setting Change → Deep Object Merge → Range Validation → Batch Save → Persistence
```

## 🛠️ API Reference

### GameState API
```javascript
// Core State Management
gameState.get(path)                      // Get value by path
gameState.set(path, value)               // Set value by path  
gameState.update(path, partialObject)    // Merge update
gameState.push(path, item)               // Add to array
gameState.remove(path, predicate)        // Remove from array

// Character Management
gameState.getCharacter()                 // Get character object
gameState.setCharacter(character)        // Set entire character
gameState.updateCharacterStat(stat, value) // Update single stat

// Campaign Management  
gameState.getCampaign()                  // Get campaign object
gameState.setCampaign(campaign)          // Set entire campaign
gameState.addToCampaignLog(entry)        // Add log entry

// Settings Management
gameState.getSetting(path)               // Get setting value
gameState.setSetting(path, value)        // Set setting value

// Persistence
gameState.save()                         // Manual save
gameState.load()                         // Load from storage
gameState.reset()                        // Reset to defaults
gameState.export()                       // Export as JSON
gameState.import(jsonString)             // Import from JSON

// Validation
gameState.isCharacterCreated()           // Check character exists
gameState.isCampaignStarted()           // Check campaign active
gameState.canStartGame()                // Check ready to play

// Utility
gameState.getStateSize()                // Get storage size
gameState.getStateInfo()                // Get metadata
```

### CharacterManager API
```javascript
// Character Creation Flow
characterManager.showCharacterCreation() // Start creation process
characterManager.nextStep()             // Advance to next step
characterManager.previousStep()          // Go back to previous step
characterManager.goToStep(stepIndex)    // Jump to specific step

// Setting Management
characterManager.selectSetting(settingId) // Choose campaign setting
characterManager.getCurrentSetting()    // Get selected setting
characterManager.getSettingData(id)     // Get setting details

// Class Management
characterManager.selectClass(classId)   // Choose character class
characterManager.getClassData(classId)  // Get class details
characterManager.getAvailableClasses()  // Get classes for setting

// Stat Management (Point Buy)
characterManager.increaseStat(stat)     // Increase ability score
characterManager.decreaseStat(stat)     // Decrease ability score
characterManager.getStatCost(fromVal, toVal) // Get point cost
characterManager.getRemainingPoints()   // Get unspent points
characterManager.resetStats()           // Reset to base values

// Character Finalization
characterManager.setCharacterName(name) // Set character name
characterManager.setBackground(bg)      // Set background story
characterManager.validateCharacter(char) // Validate completeness
characterManager.createCharacter()      // Finalize creation

// Utility Methods
characterManager.getCurrentAbilityScores() // Get ability definitions
characterManager.getAbilityScoreInfo(stat) // Get stat details
characterManager.calculateModifier(score)   // Get D&D modifier
```

### AIManager API
```javascript
// Core AI Operations
aiManager.initialize()                   // Initialize AI systems
aiManager.generateResponse(prompt, context) // Generate AI response
aiManager.processPlayerAction(action)    // Handle player actions

// HuggingFace Integration
aiManager.makeHuggingFaceRequest(prompt, options) // Direct API call
aiManager.testConnection()               // Test API connectivity
aiManager.switchModel(modelName)         // Change AI model

// Campaign Management
aiManager.startCampaign(character)       // Begin new campaign
aiManager.generateCampaignStory(char, setting) // Create campaign narrative
aiManager.generateInitialScene(context) // Create opening scene

// Response Processing
aiManager.buildContext(action)           // Build AI context
aiManager.formatResponse(response)       // Format AI output
aiManager.detectDiceRequest(response)    // Check for dice needs

// Evaluation Integration
aiManager.evaluateResponse(response, context) // Score response quality
aiManager.getEvaluationStats()          // Get evaluation metrics
aiManager.toggleEvaluation(enabled)     // Enable/disable evaluation
aiManager.toggleAutoImprovement(enabled) // Enable/disable auto-improve

// State Management
aiManager.getConversationHistory()      // Get chat history
aiManager.clearHistory()                // Clear conversation
aiManager.addToHistory(role, content)   // Add message to history
```

### DiceSystem API
```javascript
// Dice Rolling
diceSystem.rollDice(sides, count, modifier) // Roll dice with modifier
diceSystem.rollMultiple(diceArray)      // Roll multiple dice types
diceSystem.rollWithAdvantage(sides)     // Roll with advantage
diceSystem.rollWithDisadvantage(sides)  // Roll with disadvantage

// Turn Management
diceSystem.startNewTurn()               // Begin new turn
diceSystem.canRollDice()                // Check if roll allowed
diceSystem.markDiceRolled()             // Mark turn as rolled
diceSystem.getTurnStatus()              // Get current turn info

// Display Management
diceSystem.showDiceDisplay(diceType)    // Show dice interface
diceSystem.clearDiceDisplay()           // Hide dice interface
diceSystem.updateDiceSelection(types)   // Update selected dice

// History and Tracking
diceSystem.getRollHistory()             // Get recent rolls
diceSystem.addToHistory(rollData)       // Add roll to history
diceSystem.clearHistory()               // Clear roll history

// Utility
diceSystem.detectAndShowDiceRequest(text) // Parse text for dice needs
diceSystem.formatRollResult(rollData)   // Format roll for display
diceSystem.calculateModifier(stat, skill) // Calculate roll modifier
```

### UIManager API
```javascript
// Modal Management
uiManager.openModal(modalId)            // Open modal by ID
uiManager.closeModal(modalId)           // Close modal by ID
uiManager.closeAllModals()              // Close all open modals

// Navigation
uiManager.setupNavigation()             // Bind navigation events
uiManager.showScreen(screenName)        // Show specific screen
uiManager.hideScreen(screenName)        // Hide specific screen

// Settings Interface
uiManager.openSettingsModal()           // Show settings
uiManager.renderSettingsForm()          // Build settings form
uiManager.saveSettings()                // Save setting changes
uiManager.resetSettings()               // Reset to defaults

// Character Interface
uiManager.openCharacterSheetModal()     // Show character sheet
uiManager.updateCharacterDisplay()      // Refresh character info
uiManager.showLevelUpModal(data)        // Show level up screen

// Campaign Interface  
uiManager.openCampaignLogModal()        // Show campaign log
uiManager.updateCampaignLog()           // Refresh log display
uiManager.addLogEntry(entry)            // Add new log entry

// Game Interface
uiManager.submitPlayerAction()          // Process player input
uiManager.displayStoryContent(content)  // Show story text
uiManager.updateGameStatus()            // Refresh game state

// Utility
uiManager.showToast(message, type)      // Show notification
uiManager.ensureScreenVisibility()      // Fix blank screens
uiManager.debugScreenStates()           // Debug screen issues
```

### AudioManager API
```javascript
// System Management
audioManager.init()                     // Initialize audio system
audioManager.ensureReady()              // Ensure audio context ready
audioManager.cleanup()                  // Clean up resources

// Music Control
audioManager.startBackgroundMusic()     // Start ambient music
audioManager.stopBackgroundMusic()      // Stop ambient music
audioManager.setMusicVolume(volume)     // Set music volume (0-1)
audioManager.playBackgroundMusic(type)  // Play specific music type

// Sound Effects
audioManager.playSFX(type)              // Play sound effect
audioManager.playDiceSound(diceType)    // Play dice roll sound
audioManager.setSFXVolume(volume)       // Set SFX volume (0-1)

// Settings Management
audioManager.updateSettings(settings)   // Apply audio settings
audioManager.loadSettings()             // Load from game state
audioManager.toggleMusic(enabled)       // Enable/disable music
audioManager.toggleSFX(enabled)         // Enable/disable SFX

// Audio Generation
audioManager.generateTone(freq, duration) // Generate procedural tone
audioManager.generateAmbientSound(type) // Generate ambient audio
audioManager.createNote(note, octave)   // Create musical note
```

## 🔗 External API Integration

### HuggingFace API Integration
```javascript
// API Configuration
const HUGGINGFACE_CONFIG = {
    baseUrl: 'https://api-inference.huggingface.co/models/',
    models: [
        'microsoft/DialoGPT-large',
        'microsoft/DialoGPT-medium', 
        'gpt2-large',
        'gpt2',
        'microsoft/DialoGPT-small',
        'distilgpt2'
    ],
    headers: {
        'Content-Type': 'application/json'
    }
};

// Request Format
const requestPayload = {
    inputs: "You are a Dungeon Master...",
    parameters: {
        max_length: 150,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9,
        pad_token_id: 50256
    },
    options: {
        wait_for_model: true,
        use_cache: false
    }
};

// Response Format
const responseFormat = [
    {
        generated_text: "The adventure begins as you step into..."
    }
];
```

### LocalStorage API Usage
```javascript
// Storage Keys
const STORAGE_KEYS = {
    GAME_STATE: 'dicetales_gamestate',
    SETTINGS: 'dicetales_settings',
    CHARACTER: 'dicetales_character',
    CAMPAIGN: 'dicetales_campaign'
};

// Storage Operations
localStorage.setItem(key, JSON.stringify(data));
const data = JSON.parse(localStorage.getItem(key) || '{}');
localStorage.removeItem(key);
localStorage.clear();

// Storage Event Handling
window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.GAME_STATE) {
        // Handle external state changes
        gameState.load();
    }
});
```

This comprehensive data flow and API reference provides developers with complete understanding of how data moves through the DiceTales application and how to interact with each system programmatically.
