# DiceTales Memory Manager Documentation

## Overview

The Memory Manager (`advanced/js/memoryManager.js`) is a sophisticated memory system that enables the AI to maintain persistent awareness of the game world, character relationships, and story progression. This system ensures narrative consistency and allows for complex, evolving storylines that remember player choices and their consequences.

## Architecture

### Core Components

- **MemoryManager Class**: Central memory coordination and management
- **Game State Integration**: Persistent storage via localStorage
- **Automatic Information Extraction**: AI response parsing for memory updates
- **Context Building**: Comprehensive memory context for AI prompts
- **Memory Cleanup**: Intelligent pruning of old memories

### Memory Structure

The system organizes memories into distinct categories:

```javascript
memory: {
    decisions: [],           // Player choices and consequences
    relationships: {},       // NPC interaction history
    discoveries: [],         // Important findings and secrets
    skills_used: {},         // Skill usage patterns and statistics
    items_gained: [],        // Item acquisition history
    locations_described: {}, // Detailed location descriptions
    plot_threads: [],        // Active storylines and objectives
    character_growth: [],    // Character development moments
    memorable_moments: []    // Significant events and experiences
}
```

## Key Features

### 🧠 Persistent Character Memory

**Character Development Tracking**:
- Character class and abilities progression
- Proficient skills and usage patterns
- Current inventory and equipped items
- Health status and combat experiences
- Background and personality trait evolution
- Level progression and experience gained

**Example Memory Context**:
```javascript
🎭 CHARACTER PROFILE: Lyra the Rogue, Level 3, Guild Artisan Background
📊 ABILITY SCORES: STR 12, DEX 18, CON 14, INT 16, WIS 13, CHA 15
❤️ HEALTH STATUS: 24/24 HP, Healthy, No Conditions
🎒 INVENTORY: Thieves' Tools, Shortbow (equipped), Leather Armor (equipped)
```

### 👥 Dynamic NPC Relationships

**Relationship Tracking System**:
- First meeting details and initial impressions
- Relationship progression over time with timestamps
- Interaction history with detailed context
- Current relationship status (friendly, hostile, neutral, romantic, etc.)
- Influence levels and faction standings

**Automatic NPC Detection**:
- Identifies new NPCs mentioned in AI responses
- Tracks conversation topics and outcomes
- Records memorable quotes and character traits
- Monitors relationship changes based on player actions

### 🗺️ World State Continuity

**Location Memory**:
- Detailed location descriptions for consistency
- Environmental changes based on player actions
- Hidden secrets and discovered information
- Connected areas and travel routes

**World Event Tracking**:
- Important world events and their consequences
- Quest progress and objective completion
- Discovery of secrets and hidden information
- Changes to the world state based on player actions

### 🎯 Intelligent Context Building

**Memory Context Assembly**:
```javascript
🧠 RECENT DECISIONS: [Last 3 significant choices and consequences]
👥 KEY RELATIONSHIPS: [Important NPCs and relationship status]
🔍 IMPORTANT DISCOVERIES: [Recent findings with significance levels]
🎯 FREQUENTLY USED SKILLS: [Skill usage patterns for character consistency]
📖 ACTIVE PLOT THREADS: [Current storylines and their status]
🗺️ LOCATION CONTEXT: [Current area and relevant locations]
```

## API Reference

### Constructor
```javascript
const memoryManager = new MemoryManager();
```

### Core Methods

#### `initialize()`
Initializes the memory system and creates memory structure.
```javascript
const success = memoryManager.initialize();
```

#### `recordDecision(decision, consequence, context)`
Records a significant player decision and its outcome.
```javascript
memoryManager.recordDecision(
    "Helped the village elder", 
    "Gained villagers' trust", 
    "Village of Millbrook - Elder worried about missing children"
);
```

#### `updateRelationship(npcName, status, notes)`
Updates or creates an NPC relationship record.
```javascript
memoryManager.updateRelationship(
    "Captain Thorne", 
    "friendly", 
    "Grateful for help with bandits, offered reward"
);
```

#### `recordDiscovery(discovery, type, significance)`
Records an important discovery or secret.
```javascript
memoryManager.recordDiscovery(
    "Hidden passage behind bookshelf", 
    "secret", 
    "high"
);
```

#### `recordSkillUsage(skill, success, context)`
Tracks skill usage for character development.
```javascript
memoryManager.recordSkillUsage(
    "Stealth", 
    true, 
    "Successfully snuck past guards"
);
```

#### `recordItemGained(item, acquisitionMethod, significance)`
Records item acquisition with context.
```javascript
memoryManager.recordItemGained(
    "Ancient Elven Sword", 
    "found in ruins", 
    "legendary"
);
```

#### `recordLocationDescription(location, description, significance)`
Stores detailed location descriptions.
```javascript
memoryManager.recordLocationDescription(
    "Whispering Woods", 
    "Ancient forest with glowing mushrooms and ethereal voices", 
    "mystical"
);
```

#### `buildMemoryContext(character, campaign)`
Builds comprehensive memory context for AI prompts.
```javascript
const context = memoryManager.buildMemoryContext(character, campaign);
```

#### `getMemorySummary()`
Returns a summary of all stored memories.
```javascript
const summary = memoryManager.getMemorySummary();
```

### Memory Retrieval Methods

#### `getRecentDecisions(limit = 5)`
Retrieves recent player decisions with consequences.
```javascript
const decisions = memoryManager.getRecentDecisions(3);
```

#### `getRelationshipSummary()`
Gets a summary of all NPC relationships.
```javascript
const relationships = memoryManager.getRelationshipSummary();
```

#### `getImportantDiscoveries(limit = 5)`
Retrieves significant discoveries.
```javascript
const discoveries = memoryManager.getImportantDiscoveries();
```

#### `getSkillUsageStats()`
Returns skill usage statistics.
```javascript
const stats = memoryManager.getSkillUsageStats();
```

## Memory Management Features

### 🔄 Automatic Cleanup System

**Memory Limits**:
- **Decisions**: Last 20 decisions (critical ones preserved)
- **Discoveries**: Last 10 discoveries (high/critical significance preserved)
- **Items**: Last 5 items (significant items preserved)
- **Relationships**: All relationships maintained permanently
- **Locations**: All location descriptions maintained permanently

**Intelligent Pruning**:
- Preserves memories marked as critical or high significance
- Maintains character development milestones
- Keeps relationship progression history
- Retains plot-relevant information

### 📊 Memory Significance Levels

**Significance Rating System**:
- **Critical**: Major plot points, character death/life decisions
- **High**: Important discoveries, major relationship changes
- **Medium**: Useful information, minor discoveries
- **Low**: General interactions, routine activities

### 🔍 Automatic Information Extraction

**AI Response Parsing**:
- **NPC Detection**: Identifies new characters mentioned in responses
- **Location Tracking**: Extracts new location names and descriptions
- **Quest Monitoring**: Tracks quest progression and completion
- **Item Discovery**: Records item mentions and acquisitions
- **Skill Detection**: Maps player actions to skill usage

**Pattern Recognition**:
```javascript
// Example patterns for automatic extraction
const npcPatterns = [
    /(?:you (?:meet|encounter|see|find|speak to|talk to)) (?:a|an|the)? ?([A-Z][a-z]+(?: [A-Z][a-z]+)*)/gi,
    /([A-Z][a-z]+(?: [A-Z][a-z]+)*) (?:says?|tells? you|asks?|responds?|replies?)/gi
];
```

## Integration Points

### 🤖 AI System Integration

**Context Injection**:
- Automatic memory context building for AI prompts
- Real-time information extraction from AI responses
- Memory-grounded response generation

**Response Enhancement**:
- AI responses reference past decisions and relationships
- Consistent NPC behavior based on relationship history
- World state continuity across sessions

### 🎮 Game State Integration

**Persistent Storage**:
- Memory data stored in game state system
- Automatic save/load with memory preservation
- Cross-session memory continuity

**Character System Integration**:
- Character progression tracking
- Skill development monitoring
- Equipment and inventory awareness

## Usage Examples

### Basic Memory Operations
```javascript
// Initialize memory system
const memoryManager = new MemoryManager();
memoryManager.initialize();

// Record a player decision
memoryManager.recordDecision(
    "Chose to spare the bandit leader",
    "Bandit group disbanded peacefully", 
    "Forest encounter - showed mercy"
);

// Update NPC relationship
memoryManager.updateRelationship(
    "Merchant Gareth",
    "grateful",
    "Saved his caravan from bandits"
);

// Record important discovery
memoryManager.recordDiscovery(
    "Map to hidden treasure vault",
    "secret",
    "high"
);
```

### Advanced Memory Context
```javascript
// Build comprehensive context for AI
const character = gameState.getCharacter();
const campaign = gameState.getCampaign();
const memoryContext = memoryManager.buildMemoryContext(character, campaign);

// Use context in AI prompt
const prompt = `
${memoryContext}

The player wants to: ${playerAction}
`;
```

### Memory Statistics and Analysis
```javascript
// Get skill usage patterns
const skillStats = memoryManager.getSkillUsageStats();
console.log(`Most used skill: ${skillStats.mostUsed}`);

// Analyze relationship network
const relationships = memoryManager.getRelationshipSummary();
const friendlyNPCs = relationships.filter(npc => npc.status === 'friendly');

// Review character growth
const growthMoments = memoryManager.getCharacterGrowthMoments();
```

## Configuration Options

### Memory Limits
```javascript
const memoryLimits = {
    maxDecisions: 20,
    maxDiscoveries: 10,
    maxItems: 5,
    preserveSignificant: true,
    cleanupInterval: 100 // actions
};
```

### Significance Thresholds
```javascript
const significanceConfig = {
    criticalKeywords: ['death', 'betrayal', 'romance', 'major quest'],
    highKeywords: ['discovery', 'secret', 'important', 'valuable'],
    autoPromote: true // promote based on frequency
};
```

## Best Practices

### Memory Recording
1. **Be Specific**: Include context and consequences for decisions
2. **Use Consistent Names**: Maintain NPC and location name consistency
3. **Mark Significance**: Properly categorize memory importance
4. **Include Timestamps**: Automatic timestamping for progression tracking

### Memory Context
1. **Relevance Filtering**: Include only relevant memories for current context
2. **Balance Detail**: Provide sufficient context without overwhelming AI
3. **Recent Priority**: Prioritize recent events while maintaining important history
4. **Character Focus**: Emphasize memories relevant to character development

### Performance Optimization
1. **Regular Cleanup**: Allow automatic memory cleanup to run
2. **Significance Marking**: Properly mark important memories for preservation
3. **Context Optimization**: Build efficient memory contexts for AI prompts
4. **Storage Management**: Monitor localStorage usage for large campaigns

## Troubleshooting

### Common Issues

**Memory Not Persisting**:
- Check localStorage permissions and capacity
- Verify game state integration
- Ensure proper memory initialization

**Missing Context in AI Responses**:
- Verify memory context building
- Check memory data structure integrity
- Validate context injection in AI prompts

**Inconsistent NPC Behavior**:
- Review relationship tracking accuracy
- Check NPC name consistency
- Verify relationship update patterns

### Debug Functions
```javascript
// Test memory system
memoryManager.debugMemorySystem();

// Validate memory integrity
memoryManager.validateMemoryStructure();

// Export memory for analysis
const memoryExport = memoryManager.exportMemoryData();
```

## Future Enhancements

### Planned Features
1. **Emotional Memory**: Track character emotional responses to events
2. **Faction Systems**: Complex faction relationship tracking
3. **Memory Visualization**: Graphical memory network display
4. **Memory Export/Import**: Campaign memory sharing capabilities
5. **Advanced Analytics**: Detailed memory usage statistics

### Technical Improvements
1. **Memory Compression**: Efficient storage for large campaigns
2. **Semantic Search**: AI-powered memory retrieval
3. **Memory Validation**: Automatic consistency checking
4. **Performance Optimization**: Faster context building and retrieval

## Conclusion

The Memory Manager is essential for creating immersive, persistent RPG experiences in DiceTales. By maintaining comprehensive awareness of character development, relationships, and world state, it enables the AI to deliver consistent, engaging storytelling that evolves naturally based on player choices and experiences.
