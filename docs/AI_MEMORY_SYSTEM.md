# DiceTales Enhanced AI Memory System

## Overview

The DiceTales AI memory system has been significantly enhanced to ensure the AI Dungeon Master remembers and references:
- Past decisions and their consequences
- Campaign setting and world state
- User's character class, skills, and abilities
- Inventory and equipment
- NPCs encountered and relationships
- Locations visited and described
- Quest progress and completed objectives
- Skill usage patterns and character growth

## Architecture

### Memory Manager (`memoryManager.js`)
A dedicated memory management system that tracks and organizes important game information:

- **Decisions**: Records player choices and their consequences
- **Relationships**: Tracks NPC interactions and relationship status
- **Discoveries**: Logs important findings and secrets
- **Skills**: Monitors skill usage patterns and success rates
- **Items**: Records item acquisition and usage
- **Locations**: Maintains detailed location descriptions
- **Plot Threads**: Tracks ongoing storylines and their status

### Enhanced AI System (`ai.js`)
The AI system has been upgraded with:

1. **Memory Integration**: Automatic integration with the Memory Manager
2. **Context Building**: Enhanced context building that includes comprehensive memory data
3. **Automatic Tracking**: AI responses are automatically parsed to extract and store important information
4. **Skill Detection**: Player actions are analyzed to detect skill usage for character development tracking

### Game State Enhancements (`gameState.js`)
New helper methods for memory management:

- `updateNPCRelationship()`: Manage NPC relationships
- `setCampaignFlag()` / `getCampaignFlag()`: Track important decisions
- `updateQuest()` / `completeCurrentQuest()`: Manage quest progression
- `updateWorldState()` / `getWorldState()`: Maintain world consistency

## Key Features

### 1. Persistent Character Memory
The AI now remembers:
- Character class and abilities
- Proficient skills and usage patterns
- Current inventory and equipped items
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
