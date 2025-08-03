# DiceTales Enhanced AI Memory System

## Overview

The DiceTales AI memory system ensures the AI Dungeon Master remembers and references:
- Past decisions and their consequences
- Campaign setting and world state  
- Character class, skills, and abilities
- Inventory and equipment
- NPCs encountered and relationships
- Locations visited and described
- Quest progress and completed objectives
- Skill usage patterns and character growth

## Architecture

### Memory Manager (`memoryManager.js`)
A dedicated memory management system that tracks and organizes important game information:

- **Decisions**: Records player choices and their consequences with context
- **Relationships**: Tracks NPC interactions and relationship status over time
- **Discoveries**: Logs important findings and secrets with significance levels
- **Skills**: Monitors skill usage patterns and success rates for character development
- **Items**: Records item acquisition and usage with acquisition methods
- **Locations**: Maintains detailed location descriptions for world consistency
- **Plot Threads**: Tracks ongoing storylines and their status
- **Character Growth**: Records character development moments and personality changes

### Enhanced AI System (`ai.js`)
The AI system integrates seamlessly with the Memory Manager:

1. **Memory Integration**: Automatic integration with MemoryManager for context building
2. **Context Building**: Enhanced prompts that include comprehensive memory data
3. **Automatic Tracking**: AI response parsing to extract and store important information
4. **Skill Detection**: Analysis of player actions to detect skill usage automatically
5. **Campaign Continuity**: Maintains story consistency across sessions

### Game State Integration (`gameState.js`)
Memory data is stored in the game state system for persistence:

- Uses nested data structure under `memory.*` keys
- Automatic cleanup of old memories while preserving important information
- Integration with character and campaign data for comprehensive context

## Key Features

### 1. Persistent Character Memory
The AI now remembers:
- Character class and abilities
- Proficient skills and usage patterns
- Current inventory and equipped items
- Health status and combat experiences
- Background and personality traits
- Level progression and experience gained

### 2. Dynamic NPC Relationships
Enhanced relationship tracking includes:
- First meeting details and impressions
- Relationship progression over time
- Interaction history with timestamps
- Current relationship status (friendly, hostile, neutral, etc.)
- Detailed notes about each interaction

### 3. World State Continuity
The system maintains:
- Detailed location descriptions
- Important world events and their consequences
- Quest progress and objective completion
- Discovery of secrets and hidden information
- Changes to the world based on player actions

### 4. Intelligent Context Building
AI prompts now include:
- Recent player decisions and their consequences
- Active plot threads and story elements
- Key relationships that should influence interactions
- Frequently used skills for character consistency
- Important discoveries that shape the narrative

## Implementation Details

### Memory Context Building
The `buildMemoryContext()` method creates comprehensive context for AI:

```javascript
// Recent decisions with consequences
🧠 RECENT DECISIONS: Agreed to help the village, Chose stealth over combat

// Key relationships affecting current story
👥 KEY RELATIONSHIPS: Elder Marcus (friendly), Captain Thorne (suspicious)

// Important discoveries that shape the narrative
🔍 IMPORTANT DISCOVERIES: Ancient rune stone, Hidden passage beneath tavern

// Frequently used skills showing character development
🎯 FREQUENTLY USED SKILLS: Stealth (8/10), Investigation (6/8)

// Current equipment affecting capabilities
⚔️ EQUIPPED: Longbow, Leather Armor, Cloak of Elvenkind
```

### Automatic Information Extraction
The AI system automatically parses responses to extract:

- **New NPCs**: Character names and initial relationship status
- **Location Details**: Descriptions of new areas for consistency
- **Quest Information**: Objectives, progress, and completion
- **Item Discoveries**: New equipment and their significance
- **Character Growth**: Moments of development and change

### Memory Management
The system includes intelligent cleanup:

- **Decision Limit**: Last 20 decisions (critical ones preserved)
- **Discovery Limit**: Last 10 discoveries (high/critical significance preserved)
- **Item Limit**: Last 5 items (significant items preserved)
- **Relationships**: All relationships maintained permanently
- **Locations**: All location descriptions maintained permanently
- Health status and ability scores
- Background and personality traits

### 2. Dynamic NPC Relationships
- Automatic detection of new NPCs mentioned in AI responses
- Relationship tracking with status updates
- Historical interaction records
- Contextual relationship references in future encounters

### 3. Location and World Consistency
- Automatic extraction of location names from AI responses
- Detailed location descriptions for consistency
- World state tracking for environmental changes
- Location-based memory triggers

### 4. Quest and Decision Tracking
- Automatic quest progression detection
- Decision consequence tracking
- Campaign flag system for important choices
- Plot thread management for ongoing storylines

### 5. Skill and Character Development
- Automatic skill usage detection from player actions
- Success/failure rate tracking
- Character growth moment recording
- Memorable experience logging

## Implementation Details

### Memory Context Building
The `buildMemoryContext()` function creates comprehensive context for the AI by combining:

```javascript
// Recent decisions and their consequences
🧠 RECENT DECISIONS: [player choices]

// Key NPC relationships
👥 KEY RELATIONSHIPS: [NPC names and relationships]

// Important discoveries
🔍 IMPORTANT DISCOVERIES: [significant findings]

// Frequently used skills
🎯 FREQUENTLY USED SKILLS: [skill usage statistics]

// Active plot threads
📖 ACTIVE PLOT THREADS: [ongoing storylines]

// Character abilities and equipment
💪 CLASS ABILITIES: [character abilities]
🎒 INVENTORY: [current items]
⚔️ EQUIPPED: [equipped gear]
```

### Automatic Information Extraction
The AI system automatically extracts information from responses using pattern matching:

- **NPCs**: Detects character names and interaction patterns
- **Locations**: Identifies new places mentioned in descriptions
- **Items**: Tracks item acquisition and inventory changes
- **Decisions**: Records important choices and flags
- **Skills**: Maps player actions to skill usage

### Memory Management
The system includes:

- **Memory Cleanup**: Automatic removal of old, less important memories
- **Priority System**: Important memories are preserved longer
- **Context Optimization**: Memory is organized for optimal AI context building

## Usage

### For Players
The memory system works automatically in the background. Players will notice:
- More consistent storytelling
- NPCs who remember past interactions
- References to previous decisions and consequences
- Appropriate use of character abilities and skills
- Consistent world and location descriptions

### For Developers
Access memory functions through:

```javascript
// Test memory system
window.testMemory();

// Access memory manager
memoryManager.recordDecision(decision, consequence);
memoryManager.updateRelationship(npcName, relationship);
memoryManager.recordDiscovery(discovery, type, significance);

// Get memory summary for AI context
const summary = memoryManager.getMemorySummary();
```

## Configuration

### Memory Limits
- Decisions: 20 most recent (critical decisions preserved)
- Discoveries: 10 most recent (critical discoveries preserved)
- Items: 5 most recent (significant items preserved)
- Relationships: No limit (all relationships maintained)
- Locations: No limit (all locations maintained)

### Automatic Cleanup
The system automatically cleans up old memories to prevent bloat while preserving important information based on significance levels.

## Benefits

1. **Consistent Storytelling**: AI maintains continuity across sessions
2. **Character Development**: Realistic character growth and skill progression
3. **Immersive Experience**: NPCs remember interactions and relationships
4. **Dynamic World**: World state persists and evolves with player actions
5. **Strategic Depth**: Past decisions have lasting consequences
6. **Personalized Narrative**: Stories adapt to character abilities and choices

## Testing

Use the built-in test functions to verify memory system functionality:

```javascript
// Test AI memory integration
window.testMemory();

// Test AI response system
window.testAI();

// Test full action processing
window.testPlayerAction("examine the ancient tome");
```

The enhanced memory system ensures that every adventure in DiceTales builds upon previous experiences, creating rich, interconnected narratives that respond intelligently to player choices and character development.
