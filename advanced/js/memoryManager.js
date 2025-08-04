/**
 * DiceTales - Memory Manager
 * Enhanced AI memory system for persistent storytelling
 */

class MemoryManager {
    constructor() {
        this.initialized = false;
        this.memoryKeys = {
            decisions: 'memory.decisions',
            relationships: 'memory.relationships',
            discoveries: 'memory.discoveries',
            skills_used: 'memory.skills_used',
            items_gained: 'memory.items_gained',
            locations_described: 'memory.locations_described',
            plot_threads: 'memory.plot_threads'
        };
    }
    
    /**
     * Initialize memory system
     */
    initialize() {
        if (typeof gameState === 'undefined') {
            console.error('MemoryManager: gameState not available');
            return false;
        }
        
        // Initialize memory structure if not exists
        if (!gameState.get('memory')) {
            gameState.set('memory', {
                decisions: [],
                relationships: {},
                discoveries: [],
                skills_used: {},
                items_gained: [],
                locations_described: {},
                plot_threads: [],
                character_growth: [],
                memorable_moments: []
            });
        }
        
        this.initialized = true;
        console.log('✅ Memory Manager initialized');
        return true;
    }
    
    /**
     * Record a significant decision made by the player
     */
    recordDecision(decision, consequence = null, context = null) {
        if (!this.initialized) this.initialize();
        
        const decisionRecord = {
            id: `decision_${Date.now()}`,
            decision: decision,
            consequence: consequence,
            context: context,
            timestamp: new Date().toISOString(),
            character_level: gameState.get('character.level') || 1,
            location: gameState.get('campaign.current_location') || 'Unknown'
        };
        
        gameState.push('memory.decisions', decisionRecord);
        console.log('📝 Decision recorded:', decision);
    }
    
    /**
     * Update NPC relationship memory
     */
    updateRelationship(npcName, relationship, notes = null) {
        if (!this.initialized) this.initialize();
        
        const relationships = gameState.get('memory.relationships') || {};
        
        relationships[npcName] = {
            current_relationship: relationship,
            notes: notes,
            interactions: relationships[npcName]?.interactions || [],
            first_met: relationships[npcName]?.first_met || new Date().toISOString(),
            last_updated: new Date().toISOString()
        };
        
        // Add this interaction to the history
        relationships[npcName].interactions.push({
            relationship: relationship,
            notes: notes,
            timestamp: new Date().toISOString()
        });
        
        gameState.set('memory.relationships', relationships);
        console.log('👥 Relationship updated:', npcName, '->', relationship);
    }
    
    /**
     * Record a discovery or important finding
     */
    recordDiscovery(discovery, type = 'general', significance = 'normal') {
        if (!this.initialized) this.initialize();
        
        const discoveryRecord = {
            id: `discovery_${Date.now()}`,
            discovery: discovery,
            type: type, // 'location', 'item', 'secret', 'lore', 'general'
            significance: significance, // 'low', 'normal', 'high', 'critical'
            timestamp: new Date().toISOString(),
            location: gameState.get('campaign.current_location') || 'Unknown',
            character_level: gameState.get('character.level') || 1
        };
        
        gameState.push('memory.discoveries', discoveryRecord);
        console.log('🔍 Discovery recorded:', discovery);
    }
    
    /**
     * Track skill usage for character development memory
     */
    recordSkillUse(skillName, success = true, context = null) {
        if (!this.initialized) this.initialize();
        
        const skillsUsed = gameState.get('memory.skills_used') || {};
        
        if (!skillsUsed[skillName]) {
            skillsUsed[skillName] = {
                total_uses: 0,
                successes: 0,
                failures: 0,
                notable_uses: []
            };
        }
        
        skillsUsed[skillName].total_uses++;
        if (success) {
            skillsUsed[skillName].successes++;
        } else {
            skillsUsed[skillName].failures++;
        }
        
        if (context) {
            skillsUsed[skillName].notable_uses.push({
                context: context,
                success: success,
                timestamp: new Date().toISOString()
            });
        }
        
        gameState.set('memory.skills_used', skillsUsed);
        console.log('🎯 Skill use recorded:', skillName, success ? '✓' : '✗');
    }
    
    /**
     * Record item acquisition with context
     */
    recordItemGained(itemName, how = 'found', significance = 'normal') {
        if (!this.initialized) this.initialize();
        
        const itemRecord = {
            id: `item_${Date.now()}`,
            name: itemName,
            acquisition_method: how, // 'found', 'bought', 'given', 'crafted', 'stolen'
            significance: significance,
            timestamp: new Date().toISOString(),
            location: gameState.get('campaign.current_location') || 'Unknown'
        };
        
        gameState.push('memory.items_gained', itemRecord);
        console.log('🎒 Item acquisition recorded:', itemName);
    }
    
    /**
     * Record detailed location descriptions for consistency
     */
    recordLocationDescription(locationName, description, features = []) {
        if (!this.initialized) this.initialize();
        
        const locations = gameState.get('memory.locations_described') || {};
        
        locations[locationName] = {
            description: description,
            features: features,
            first_visited: locations[locationName]?.first_visited || new Date().toISOString(),
            last_updated: new Date().toISOString(),
            visit_count: (locations[locationName]?.visit_count || 0) + 1
        };
        
        gameState.set('memory.locations_described', locations);
        console.log('🗺️ Location description recorded:', locationName);
    }
    
    /**
     * Track ongoing plot threads for story continuity
     */
    updatePlotThread(threadName, status, details = null) {
        if (!this.initialized) this.initialize();
        
        const plotThreads = gameState.get('memory.plot_threads') || [];
        const existingThread = plotThreads.find(thread => thread.name === threadName);
        
        if (existingThread) {
            existingThread.status = status;
            existingThread.details = details;
            existingThread.last_updated = new Date().toISOString();
        } else {
            plotThreads.push({
                name: threadName,
                status: status, // 'active', 'resolved', 'dormant', 'abandoned'
                details: details,
                created: new Date().toISOString(),
                last_updated: new Date().toISOString()
            });
        }
        
        gameState.set('memory.plot_threads', plotThreads);
        console.log('📖 Plot thread updated:', threadName, '->', status);
    }
    
    /**
     * Record character growth moments
     */
    recordCharacterGrowth(growthType, description) {
        if (!this.initialized) this.initialize();
        
        const growthRecord = {
            type: growthType, // 'skill_improvement', 'personality_change', 'relationship_development', 'moral_choice'
            description: description,
            timestamp: new Date().toISOString(),
            character_level: gameState.get('character.level') || 1
        };
        
        gameState.push('memory.character_growth', growthRecord);
        console.log('🌱 Character growth recorded:', growthType);
    }
    
    /**
     * Get AI context for current conversation - provides plot grounding
     */
    getAIContext() {
        if (!this.initialized) this.initialize();
        
        const memory = gameState.get('memory') || {};
        
        // Recent key decisions for context
        const recentDecisions = (memory.decisions || [])
            .slice(-3)
            .map(d => `Decision: ${d.decision}${d.consequence ? ` (Result: ${d.consequence})` : ''}`)
            .join('\n');
        
        // Active plot threads
        const activePlotThreads = (memory.plot_threads || [])
            .filter(t => t.status === 'active')
            .map(t => `Active Quest: ${t.name} - ${t.details}`)
            .join('\n');
        
        // Important relationships
        const relationships = memory.relationships || {};
        const keyRelationships = Object.entries(relationships)
            .filter(([_, rel]) => rel.current_relationship !== 'neutral')
            .slice(-5)
            .map(([name, rel]) => `${name}: ${rel.current_relationship}${rel.notes ? ` (${rel.notes})` : ''}`)
            .join('\n');
        
        // Recent discoveries
        const recentDiscoveries = (memory.discoveries || [])
            .filter(d => d.significance === 'high' || d.significance === 'critical')
            .slice(-3)
            .map(d => `Discovery: ${d.discovery}`)
            .join('\n');
        
        // Character growth context
        const recentGrowth = (memory.character_growth || [])
            .slice(-2)
            .map(g => `Growth: ${g.description}`)
            .join('\n');
        
        return {
            recentDecisions,
            activePlotThreads,
            keyRelationships,
            recentDiscoveries,
            recentGrowth,
            hasImportantContext: !!(recentDecisions || activePlotThreads || keyRelationships || recentDiscoveries)
        };
    }
    
    /**
     * Get conversation grounding prompt for AI consistency
     */
    getGroundingPrompt() {
        const context = this.getAIContext();
        
        if (!context.hasImportantContext) {
            return '';
        }
        
        let prompt = '\n--- Story Context for Consistency ---\n';
        
        if (context.recentDecisions) {
            prompt += `Recent Player Decisions:\n${context.recentDecisions}\n\n`;
        }
        
        if (context.activePlotThreads) {
            prompt += `Active Story Elements:\n${context.activePlotThreads}\n\n`;
        }
        
        if (context.keyRelationships) {
            prompt += `Important Relationships:\n${context.keyRelationships}\n\n`;
        }
        
        if (context.recentDiscoveries) {
            prompt += `Important Discoveries:\n${context.recentDiscoveries}\n\n`;
        }
        
        if (context.recentGrowth) {
            prompt += `Character Development:\n${context.recentGrowth}\n\n`;
        }
        
        prompt += '--- Continue the story considering this context ---\n\n';
        
        return prompt;
    }
    
    /**
     * Record conversation exchange for memory tracking
     */
    recordConversationExchange(playerInput, dmResponse) {
        if (!this.initialized) this.initialize();
        
        // Analyze the exchange for important elements
        this.analyzeExchangeForMemory(playerInput, dmResponse);
    }
    
    /**
     * Analyze conversation exchange and extract memorable elements
     */
    analyzeExchangeForMemory(playerInput, dmResponse) {
        const playerLower = playerInput.toLowerCase();
        const dmLower = dmResponse.toLowerCase();
        
        // Check for decisions
        if (playerLower.includes('i choose') || playerLower.includes('i decide') || 
            playerLower.includes('i will') || playerLower.includes('my choice')) {
            this.recordDecision(playerInput.substring(0, 100), null, 'Player choice in conversation');
        }
        
        // Check for NPC interactions
        const npcPatterns = /(?:you meet|encounter|speak with|talk to)\s+([A-Z][a-z]+)/gi;
        let match;
        while ((match = npcPatterns.exec(dmResponse)) !== null) {
            const npcName = match[1];
            this.updateRelationship(npcName, 'met', 'Encountered during conversation');
        }
        
        // Check for discoveries
        if (dmLower.includes('discover') || dmLower.includes('find') || 
            dmLower.includes('reveal') || dmLower.includes('learn')) {
            const discoveryText = dmResponse.substring(0, 150);
            this.recordDiscovery(discoveryText, 'conversation', 'normal');
        }
        
        // Check for plot developments
        if (dmLower.includes('quest') || dmLower.includes('mission') || 
            dmLower.includes('objective') || dmLower.includes('goal')) {
            const plotText = dmResponse.substring(0, 100);
            this.updatePlotThread('Conversation Plot', 'active', plotText);
        }
    }
    
    /**
     * Get memory summary for AI context
     */
    getMemorySummary() {
        if (!this.initialized) this.initialize();
        
        const memory = gameState.get('memory') || {};
        const summary = {
            recent_decisions: (memory.decisions || []).slice(-3),
            key_relationships: Object.entries(memory.relationships || {})
                .filter(([_, rel]) => rel.current_relationship !== 'neutral')
                .slice(-5),
            important_discoveries: (memory.discoveries || [])
                .filter(d => d.significance === 'high' || d.significance === 'critical')
                .slice(-5),
            frequently_used_skills: Object.entries(memory.skills_used || {})
                .sort(([_, a], [__, b]) => b.total_uses - a.total_uses)
                .slice(0, 3),
            recent_items: (memory.items_gained || []).slice(-3),
            active_plot_threads: (memory.plot_threads || [])
                .filter(thread => thread.status === 'active'),
            memorable_moments: (memory.memorable_moments || [])
                .filter(m => m.emotional_impact === 'high' || m.emotional_impact === 'life_changing')
                .slice(-3)
        };
        
        return summary;
    }
    
    /**
     * Clear old memories to prevent bloat (keep important ones)
     */
    cleanupMemories() {
        if (!this.initialized) this.initialize();
        
        const memory = gameState.get('memory') || {};
        
        // Keep only last 20 decisions
        if (memory.decisions && memory.decisions.length > 20) {
            memory.decisions = memory.decisions.slice(-20);
        }
        
        // Keep only last 10 discoveries unless they're critical
        if (memory.discoveries && memory.discoveries.length > 10) {
            const criticalDiscoveries = memory.discoveries.filter(d => d.significance === 'critical');
            const recentDiscoveries = memory.discoveries.slice(-10);
            memory.discoveries = [...criticalDiscoveries, ...recentDiscoveries];
        }
        
        // Keep only last 5 items unless significant
        if (memory.items_gained && memory.items_gained.length > 5) {
            const significantItems = memory.items_gained.filter(i => i.significance !== 'normal');
            const recentItems = memory.items_gained.slice(-5);
            memory.items_gained = [...significantItems, ...recentItems];
        }
        
        gameState.set('memory', memory);
        console.log('🧹 Memory cleanup completed');
    }
}

// Create global memory manager instance
const memoryManager = new MemoryManager();

// Export to global scope
window.MemoryManager = MemoryManager;
window.memoryManager = memoryManager;

console.log('🧠 Memory Manager loaded');
