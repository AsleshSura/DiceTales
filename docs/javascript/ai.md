# ai.js - AI Integration System Documentation

## Overview
The `ai.js` file contains the `AIManager` class, which integrates with the HackClub AI API to provide dynamic, context-aware storytelling for DiceTales campaigns. It serves as an intelligent Dungeon Master, generating narrative content, responding to player actions, and managing campaign continuity.

## File Dependencies
- **Dependencies**: utils.js, gameState.js, character.js
- **Used by**: main.js, ui.js

## Global Variables
- `aiManager` - Global instance of AIManager
- `window.aiManager` - Debug access to AI system

---

## 🤖 AIManager Class

The main class responsible for AI-powered storytelling and narrative generation.

### Constructor
```javascript
constructor()
```

**Properties initialized:**
- `apiUrl` (string): HackClub AI API endpoint
- `model` (string): AI model identifier ('Qwen/Qwen2.5-32B-Instruct')
- `conversationHistory` (Array): Conversation context for AI
- `maxTokens` (number): Maximum tokens per AI response (4000)
- `isProcessing` (boolean): Current AI processing state
- `initialized` (boolean): AI system initialization status

**Configuration:**
```javascript
apiUrl = 'https://ai.hackclub.com/chat/completions'
model = 'Qwen/Qwen2.5-32B-Instruct'
maxTokens = 4000
```

---

## 🚀 Initialization and Connection

### `async initialize()`
Initializes the AI system and tests API connectivity.

**Process:**
1. Check if already initialized
2. Test API connection with minimal request
3. Set initialized flag on success
4. Enable fallback mode on failure

**Returns:** `Promise<void>`

**Error Handling:**
- Logs successful initialization
- Falls back to offline mode on API failure
- Continues operation without throwing errors

### `async testConnection()`
Tests API connectivity with a simple request.

**Returns:** `Promise<boolean>` - True if connection successful

**Test Request:**
```javascript
{
    model: 'Qwen/Qwen2.5-32B-Instruct',
    messages: [{ role: 'user', content: 'Test connection' }],
    max_tokens: 10
}
```

**Error Scenarios:**
- Network connectivity issues
- API service unavailable
- Authentication problems
- Rate limiting

---

## 🎭 Campaign Management

### `async startCampaign()`
Initiates a new campaign with opening narrative.

**Process:**
1. **Gather Context**: Get character and campaign data
2. **Build Prompts**: Create system and start prompts
3. **AI Request**: Call AI with context
4. **Display Response**: Show generated story
5. **Update State**: Save story to game state
6. **Log Event**: Record campaign start

**Fallback Behavior:**
- Uses `showFallbackStart()` if AI unavailable
- Provides basic narrative without AI

**Example Flow:**
```javascript
// Triggered by campaign start event
eventBus.emit('campaign:start');

// AI generates opening like:
"The ancient tavern creaks as you push open its heavy wooden door..."
```

### `buildSystemPrompt()`
Constructs comprehensive system prompt for AI context.

**Returns:** `string` - Complete system prompt

**Prompt Components:**

#### Character Information
```
PLAYER CHARACTER:
- Name: Aragorn
- Class: Fighter
- Level: 1
- Health: 100/100
- Stats: STR 15, DEX 12, CON 14, INT 10, WIS 11, CHA 8
```

#### Campaign Settings
```
SETTING: Medieval Fantasy
DIFFICULTY: Medium - Balanced challenge and story
CUSTOM PERSONALITY: Focus on heroic adventures
```

#### DM Rules and Guidelines
1. **Narrative Style**: Vivid, immersive descriptions
2. **Dice Integration**: Request rolls when appropriate
3. **Character Memory**: Reference previous events
4. **Choice Consequences**: Meaningful decision outcomes
5. **NPC Development**: Distinct character personalities
6. **Difficulty Balance**: Appropriate for chosen level
7. **Response Length**: 2-4 engaging paragraphs
8. **Player Agency**: Ask what they want to do OR provide options
9. **Setting Consistency**: Maintain genre conventions
10. **Immersion**: Stay in character as DM

#### Campaign Context
- Current location
- Recent events (last 10 log entries)
- Known NPCs and relationships
- Active quests and flags

### `buildStartPrompt(character, campaign)`
Creates opening scene prompt for new campaigns.

**Parameters:**
- `character` (object): Character data
- `campaign` (object): Campaign configuration

**Returns:** `string` - Opening scene prompt

**Prompt Requirements:**
1. Establish setting atmosphere
2. Introduce initial challenge/mystery
3. Provide clear character motivation
4. Include vivid sensory details
5. Set up meaningful choices

**Example Generated Content:**
> "The mist clings to the cobblestones of Ravenshollow as you approach the Prancing Pony tavern. Through the grimy windows, you see flickering candlelight and hear muffled voices discussing something urgent. A weathered notice board by the door displays several torn parchments - job postings, perhaps? What draws your attention most is..."

---

## 🎮 Player Interaction Processing

### `async processPlayerAction(actionData)`
Processes player actions and generates AI responses.

**Parameters:**
- `actionData` (object): Player action information
```javascript
{
    action: "I examine the mysterious rune",
    character: characterData,
    context: additionalContext
}
```

**Process:**
1. **Build Context**: Gather current game state
2. **Create Prompt**: Format action with context
3. **AI Request**: Send to AI API
4. **Process Response**: Handle AI-generated content
5. **Update State**: Save new story state
6. **Log Action**: Record in campaign log

**Response Handling:**
- Displays AI response in story area
- Updates campaign state
- Triggers follow-up events
- Handles dice roll requests

### `buildActionContext(character, campaign, actionData)`
Constructs context for action processing.

**Parameters:**
- `character` (object): Current character data
- `campaign` (object): Campaign state
- `actionData` (object): Action details

**Returns:** `string` - Formatted action context

**Context Elements:**
- Player's stated action
- Current scene description
- Recent story events
- Character's current status
- Environmental factors

---

## 🎲 Dice Roll Integration

### `async processDiceRoll(rollData)`
Processes dice rolls and generates narrative responses.

**Parameters:**
- `rollData` (object): Dice roll results
```javascript
{
    dice: ['d20'],
    results: [{ value: 15, critical: false }],
    total: 15,
    critical: false,
    fumble: false
}
```

**Process:**
1. **Analyze Roll**: Determine success/failure
2. **Context Integration**: Combine with current situation
3. **Generate Response**: AI creates outcome narrative
4. **Apply Consequences**: Update game state based on result
5. **Continue Story**: Advance narrative

**Roll Interpretation:**
- **Critical Success (Natural 20)**: Exceptional outcomes
- **High Rolls (15-19)**: Successful with flair
- **Moderate Rolls (10-14)**: Basic success
- **Low Rolls (5-9)**: Partial success or complications
- **Critical Failure (Natural 1)**: Dramatic failures
- **Fumbles**: Humorous or problematic outcomes

**Example Responses:**
```javascript
// For a critical success perception roll:
"Your keen eyes immediately spot the hidden lever behind the tapestry. Not only do you find the secret passage, but you also notice the ancient runes warning of the guardian that lies beyond..."

// For a fumble:
"As you attempt to pick the lock, your tools slip from your sweaty fingers and clatter loudly on the stone floor. The echo seems to travel much farther than it should in these ancient halls..."
```

---

## 🌐 API Communication

### `async callAI(messages)`
Core method for communicating with the HackClub AI API.

**Parameters:**
- `messages` (Array): Conversation messages array
```javascript
[
    { role: 'system', content: 'System prompt...' },
    { role: 'user', content: 'User input...' },
    { role: 'assistant', content: 'AI response...' }
]
```

**Returns:** `Promise<string>` - AI-generated response text

**Request Configuration:**
```javascript
{
    model: 'Qwen/Qwen2.5-32B-Instruct',
    messages: messages,
    max_tokens: 4000,
    temperature: 0.8,
    top_p: 0.9
}
```

**Error Handling:**
- Network timeout handling
- API rate limit management
- Fallback response generation
- Conversation history preservation

### API Response Processing
1. **Parse Response**: Extract AI-generated text
2. **Validate Content**: Check for appropriate content
3. **Format Display**: Prepare for UI presentation
4. **Update History**: Add to conversation context
5. **Trigger Events**: Notify other systems

---

## 💾 Conversation Management

### Conversation History
The AI maintains conversation context to ensure narrative consistency:

```javascript
conversationHistory = [
    { role: 'system', content: 'DM system prompt...' },
    { role: 'user', content: 'I enter the tavern' },
    { role: 'assistant', content: 'The tavern welcomes you...' },
    { role: 'user', content: 'I approach the bartender' },
    { role: 'assistant', content: 'The burly dwarf looks up...' }
]
```

### Context Management
- **Memory Limit**: Maintains reasonable context window
- **Summarization**: Condenses old conversations when needed
- **State Persistence**: Saves important story elements
- **Character Continuity**: Remembers NPCs and relationships

---

## 🎨 Content Display and UI

### `displayStoryContent(content, type)`
Displays AI-generated content in the game interface.

**Parameters:**
- `content` (string): Story content to display
- `type` (string): Content type ('dm-response', 'player-action', etc.)

**Display Features:**
- **Markdown Support**: Bold, italic, lists
- **Typing Animation**: Gradual text reveal
- **Syntax Highlighting**: Special formatting for dice rolls
- **Scroll Management**: Auto-scroll to new content
- **Sound Effects**: Audio cues for different content types

### Content Formatting
- **Dice Requests**: Highlighted in special format
- **NPC Dialogue**: Distinct styling and quotes
- **Environmental Descriptions**: Atmospheric formatting
- **Action Results**: Clear outcome presentation

---

## 🛡️ Fallback Systems

### `showFallbackStart()`
Provides basic campaign start when AI is unavailable.

**Features:**
- Static but engaging opening scenarios
- Multiple setting-appropriate openings
- Basic choice presentation
- Integration with game systems

### Offline Mode
When AI is unavailable:
- **Static Responses**: Pre-written content library
- **Template Responses**: Fill-in-the-blank narratives
- **Player Prompts**: Encourage player-driven storytelling
- **Dice Integration**: Basic roll result interpretation

---

## 🔧 Configuration and Customization

### Difficulty Settings
```javascript
getDifficultyDescription(difficulty) {
    const descriptions = {
        'easy': 'Forgiving challenges, focus on story',
        'medium': 'Balanced challenge and narrative',
        'hard': 'Demanding encounters, strategic thinking required',
        'brutal': 'High stakes, meaningful consequences'
    };
    return descriptions[difficulty] || descriptions.medium;
}
```

### Custom DM Personalities
Players can customize AI behavior:
- **Narrative Style**: Descriptive, action-focused, dialogue-heavy
- **Challenge Level**: Combat focus, puzzle emphasis, social encounters
- **Tone**: Serious, humorous, dark, heroic
- **Pacing**: Fast-paced action, thoughtful exploration

### Content Filtering
- **Age Appropriate**: Configurable content guidelines
- **Violence Level**: Adjustable combat descriptions
- **Language**: Profanity filtering options
- **Themes**: Content warning system

---

## 🔔 Event System Integration

### Events Listened To:
- `campaign:start` - Begin new campaign
- `player:action` - Process player actions
- `dice:rolled` - Handle dice roll results
- `character:update` - Update character context

### Events Emitted:
- `ai:response` - AI generated content
- `ai:error` - AI system errors
- `story:update` - Narrative progression
- `npc:encountered` - New NPC introduction

---

## 📊 Performance and Optimization

### API Rate Limiting
- **Request Throttling**: Prevent API abuse
- **Queue Management**: Handle multiple requests
- **Cache Responses**: Avoid duplicate requests
- **Fallback Delays**: Graceful degradation

### Memory Management
- **History Pruning**: Limit conversation length
- **State Compression**: Efficient data storage
- **Garbage Collection**: Clean up unused references
- **Performance Monitoring**: Track response times

---

## 💡 Advanced Features

### Dynamic NPC Generation
```javascript
// AI creates persistent NPCs
const npc = {
    name: "Gareth the Innkeeper",
    personality: "Gruff but kind-hearted",
    relationship: "neutral",
    memories: ["Player helped with rat problem"],
    secrets: ["Knows about the hidden passage"]
};
```

### Quest Management
- **Dynamic Quest Creation**: AI generates missions
- **Progress Tracking**: Monitor quest completion
- **Consequence Chains**: Actions affect future content
- **Branching Narratives**: Multiple story paths

### World Building
- **Location Memory**: AI remembers visited places
- **Environmental Consistency**: Persistent world details
- **Cultural Integration**: Setting-appropriate content
- **Historical Continuity**: Events have lasting impact

---

## 🔍 Debugging and Development

### Debug Features
```javascript
if (window.DEBUG_MODE) {
    // Force AI responses for testing
    aiManager.mockResponse = (content) => {
        return Promise.resolve(content);
    };
    
    // View conversation history
    aiManager.debugHistory = () => {
        console.table(this.conversationHistory);
    };
}
```

### Testing Utilities
- **Mock AI Responses**: Test without API calls
- **Conversation Replay**: Reproduce specific scenarios
- **Performance Metrics**: Response time tracking
- **Error Simulation**: Test fallback systems

---

## 💡 Usage Examples

### Starting a New Campaign
```javascript
// Initialize and start campaign
await aiManager.initialize();
eventBus.emit('campaign:start');

// AI generates opening narrative
"The cobblestone streets of Waterdeep glisten with morning dew as you emerge from the Yawning Portal tavern..."
```

### Processing Player Actions
```javascript
// Player takes action
const action = {
    action: "I carefully examine the ancient tome",
    character: currentCharacter,
    context: currentScene
};

eventBus.emit('player:action', action);

// AI responds contextually
"As you open the leather-bound tome, the pages emit a faint blue glow. The text is written in an archaic script, but you can make out references to 'The Lost Crown of Eldara'..."
```

### Dice Roll Integration
```javascript
// Player rolls for investigation
diceSystem.selectedDice = ['d20'];
const roll = await diceSystem.rollDice(); // Rolls 17

// AI interprets success
"Your keen investigation reveals not just the hidden compartment, but also a small note tucked behind it. The message reads: 'The key lies where shadows dance at noon.'"
```

---

*The ai.js system transforms DiceTales from a static game into a living, breathing world that responds intelligently to player choices and creates unique storytelling experiences.*
