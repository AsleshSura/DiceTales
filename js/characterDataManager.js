/**
 * DiceTales - Character Data Manager
 * Handles loading, saving, and manipulating character.json data
 */

class CharacterDataManager {
    constructor() {
        this.character = null;
        this.filePath = './character.json';
        this.backupPath = './character_backup.json';
        this.autoSaveEnabled = true;
        this.autoSaveDelay = 2000; // 2 seconds
        this.autoSaveTimeout = null;
    }

    /**
     * Load character data from JSON file
     */
    async loadCharacter(filePath = null) {
        try {
            const path = filePath || this.filePath;
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`Failed to load character: ${response.status}`);
            }
            
            const characterData = await response.json();
            this.character = this.validateCharacterData(characterData);
            
            console.log('Character loaded successfully:', this.character.basic_info.name);
            return this.character;
            
        } catch (error) {
            console.error('Error loading character:', error);
            throw error;
        }
    }

    /**
     * Save character data to JSON file (browser storage fallback)
     */
    saveCharacter(characterData = null, filePath = null) {
        try {
            const dataToSave = characterData || this.character;
            if (!dataToSave) {
                throw new Error('No character data to save');
            }

            // Update metadata
            dataToSave.metadata.last_updated = new Date().toISOString();
            
            // In browser environment, save to localStorage
            const jsonString = JSON.stringify(dataToSave, null, 2);
            localStorage.setItem('dicetales_character_data', jsonString);
            
            // Also integrate with existing gameState
            if (typeof gameState !== 'undefined') {
                this.syncToGameState(dataToSave);
            }
            
            console.log('Character saved successfully');
            return true;
            
        } catch (error) {
            console.error('Error saving character:', error);
            return false;
        }
    }

    /**
     * Create backup of current character
     */
    createBackup() {
        if (this.character) {
            const backup = JSON.parse(JSON.stringify(this.character));
            backup.metadata.backup_created = new Date().toISOString();
            localStorage.setItem('dicetales_character_backup', JSON.stringify(backup, null, 2));
            console.log('Character backup created');
        }
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCharacter();
        }, this.autoSaveDelay);
    }

    /**
     * Validate character data structure
     */
    validateCharacterData(data) {
        const required = [
            'version', 'metadata', 'basic_info', 'campaign_setting',
            'ability_scores', 'health_and_vitals', 'class_features',
            'skills', 'equipment', 'progression'
        ];
        
        for (const field of required) {
            if (!data[field]) {
                console.warn(`Missing required field: ${field}`);
            }
        }
        
        return data;
    }

    /**
     * Get character basic info
     */
    getBasicInfo() {
        return this.character?.basic_info || null;
    }

    /**
     * Get character stats with modifiers
     */
    getStats() {
        if (!this.character) return null;
        
        return {
            ...this.character.ability_scores.final_stats,
            modifiers: this.character.ability_scores.modifiers
        };
    }

    /**
     * Get character health information
     */
    getHealth() {
        return this.character?.health_and_vitals?.hit_points || null;
    }

    /**
     * Update health points
     */
    updateHealth(current, maximum = null) {
        if (!this.character) return false;
        
        this.character.health_and_vitals.hit_points.current = Math.max(0, current);
        if (maximum !== null) {
            this.character.health_and_vitals.hit_points.maximum = Math.max(1, maximum);
        }
        
        this.scheduleAutoSave();
        return true;
    }

    /**
     * Add experience points
     */
    addExperience(amount) {
        if (!this.character) return false;
        
        const oldXP = this.character.progression.experience_points;
        const oldLevel = this.character.basic_info.level;
        const newXP = oldXP + amount;
        
        this.character.progression.experience_points = newXP;
        
        // Check for level up
        const newLevel = this.calculateLevel(newXP);
        if (newLevel > oldLevel) {
            this.levelUp(newLevel);
        }
        
        this.scheduleAutoSave();
        return { oldXP, newXP, oldLevel, newLevel: this.character.basic_info.level };
    }

    /**
     * Calculate level from experience points
     */
    calculateLevel(xp) {
        // Standard D&D 5e progression
        const levels = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
        
        for (let i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    /**
     * Handle level up
     */
    levelUp(newLevel) {
        const oldLevel = this.character.basic_info.level;
        this.character.basic_info.level = newLevel;
        
        // Update proficiency bonus
        this.character.health_and_vitals.proficiency_bonus = Math.ceil(newLevel / 4) + 1;
        
        // Increase HP (using class hit die)
        const conModifier = this.character.ability_scores.modifiers.con;
        const hitDieAverage = 6; // d10 average for warrior
        const hpIncrease = hitDieAverage + conModifier;
        
        this.character.health_and_vitals.hit_points.maximum += hpIncrease;
        this.character.health_and_vitals.hit_points.current += hpIncrease;
        
        console.log(`Level up! ${oldLevel} → ${newLevel}`);
        
        // Emit level up event if event system exists
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('character:levelUp', { oldLevel, newLevel, character: this.character });
        }
    }

    /**
     * Add item to inventory
     */
    addItem(item) {
        if (!this.character) return false;
        
        const newItem = {
            id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            acquired_at: new Date().toISOString(),
            source: item.source || 'unknown',
            ...item
        };
        
        // Determine which category to add to
        const category = this.determineItemCategory(newItem);
        
        if (category && this.character.equipment[category]) {
            if (Array.isArray(this.character.equipment[category])) {
                this.character.equipment[category].push(newItem);
            } else {
                // For single items like shield
                this.character.equipment[category] = newItem;
            }
        } else {
            // Default to tools_and_kits for miscellaneous items
            this.character.equipment.tools_and_kits.push(newItem);
        }
        
        this.scheduleAutoSave();
        return newItem;
    }

    /**
     * Remove item from inventory
     */
    removeItem(itemId) {
        if (!this.character) return false;
        
        const categories = ['weapons', 'armor', 'consumables', 'tools_and_kits'];
        
        for (const category of categories) {
            const items = this.character.equipment[category];
            if (Array.isArray(items)) {
                const index = items.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    const removedItem = items.splice(index, 1)[0];
                    this.scheduleAutoSave();
                    return removedItem;
                }
            }
        }
        
        // Check shield
        if (this.character.equipment.shield?.id === itemId) {
            const removedItem = this.character.equipment.shield;
            this.character.equipment.shield = null;
            this.scheduleAutoSave();
            return removedItem;
        }
        
        return null;
    }

    /**
     * Determine item category based on type
     */
    determineItemCategory(item) {
        const typeMap = {
            'weapon': 'weapons',
            'armor': 'armor',
            'shield': 'shield',
            'consumable': 'consumables',
            'potion': 'consumables',
            'tool': 'tools_and_kits',
            'equipment_pack': 'tools_and_kits'
        };
        
        return typeMap[item.type] || 'tools_and_kits';
    }

    /**
     * Get all items in inventory
     */
    getAllItems() {
        if (!this.character) return [];
        
        const allItems = [];
        const eq = this.character.equipment;
        
        // Collect from all categories
        if (eq.weapons) allItems.push(...eq.weapons);
        if (eq.armor) allItems.push(...eq.armor);
        if (eq.shield) allItems.push(eq.shield);
        if (eq.consumables) allItems.push(...eq.consumables);
        if (eq.tools_and_kits) allItems.push(...eq.tools_and_kits);
        if (eq.accessories) allItems.push(...eq.accessories);
        
        return allItems.filter(item => item); // Remove null entries
    }

    /**
     * Update character stat
     */
    updateStat(stat, value) {
        if (!this.character) return false;
        
        this.character.ability_scores.final_stats[stat] = Math.max(1, Math.min(30, value));
        this.character.ability_scores.modifiers[stat] = Math.floor((value - 10) / 2);
        
        // Recalculate dependent values
        this.recalculateDependentValues();
        this.scheduleAutoSave();
        return true;
    }

    /**
     * Recalculate values that depend on stats
     */
    recalculateDependentValues() {
        if (!this.character) return;
        
        const stats = this.character.ability_scores.final_stats;
        const modifiers = this.character.ability_scores.modifiers;
        
        // Update passive perception
        const wisModifier = modifiers.wis || 0;
        const proficient = this.character.skills.all_skills.Perception?.proficient ? 
            this.character.health_and_vitals.proficiency_bonus : 0;
        this.character.health_and_vitals.passive_perception = 10 + wisModifier + proficient;
        
        // Update skill modifiers
        for (const [skillName, skillData] of Object.entries(this.character.skills.all_skills)) {
            const abilityMod = modifiers[skillData.ability] || 0;
            const profBonus = skillData.proficient ? this.character.health_and_vitals.proficiency_bonus : 0;
            skillData.modifier = abilityMod + profBonus;
        }
        
        // Update carrying capacity (if strength-based)
        if (stats.str) {
            this.character.equipment.carrying_capacity.maximum = stats.str * 15;
            this.character.equipment.carrying_capacity.encumbered_at = stats.str * 10;
            this.character.equipment.carrying_capacity.heavily_encumbered_at = stats.str * 15;
        }
    }

    /**
     * Add quest to character
     */
    addQuest(quest) {
        if (!this.character) return false;
        
        const newQuest = {
            id: quest.id || `quest_${Date.now()}`,
            status: 'active',
            added_at: new Date().toISOString(),
            ...quest
        };
        
        this.character.campaign_data.active_quests.push(newQuest);
        this.scheduleAutoSave();
        return newQuest;
    }

    /**
     * Complete quest
     */
    completeQuest(questId, outcome = null) {
        if (!this.character) return false;
        
        const activeQuests = this.character.campaign_data.active_quests;
        const questIndex = activeQuests.findIndex(q => q.id === questId);
        
        if (questIndex !== -1) {
            const quest = activeQuests.splice(questIndex, 1)[0];
            quest.status = 'completed';
            quest.completed_at = new Date().toISOString();
            if (outcome) quest.outcome = outcome;
            
            this.character.campaign_data.completed_quests.push(quest);
            this.scheduleAutoSave();
            return quest;
        }
        
        return null;
    }

    /**
     * Add campaign flag
     */
    setCampaignFlag(flag, value) {
        if (!this.character) return false;
        
        this.character.campaign_data.campaign_flags[flag] = value;
        this.scheduleAutoSave();
        return true;
    }

    /**
     * Get campaign flag
     */
    getCampaignFlag(flag) {
        return this.character?.campaign_data?.campaign_flags?.[flag] || false;
    }

    /**
     * Sync character data to existing gameState system
     */
    syncToGameState(characterData) {
        if (typeof gameState === 'undefined') return;
        
        // Map our detailed character data to gameState format
        const character = characterData.basic_info;
        const stats = characterData.ability_scores.final_stats;
        const health = characterData.health_and_vitals.hit_points;
        
        gameState.set('character.name', character.name);
        gameState.set('character.class', character.class);
        gameState.set('character.level', character.level);
        gameState.set('character.experience', characterData.progression.experience_points);
        gameState.set('character.background', character.background);
        gameState.set('character.stats', stats);
        gameState.set('character.health', health);
        gameState.set('character.skills', characterData.skills.all_skills);
        gameState.set('character.abilities', characterData.class_features.class_abilities);
        gameState.set('character.inventory', this.getAllItems());
        
        // Campaign data
        gameState.set('campaign.setting', characterData.campaign_setting.setting);
        gameState.set('campaign.current_location', characterData.campaign_data.current_location);
        
        console.log('Character data synced to gameState');
    }

    /**
     * Import from gameState system
     */
    importFromGameState() {
        if (typeof gameState === 'undefined') return null;
        
        const gameCharacter = gameState.getCharacter();
        const gameCampaign = gameState.getCampaign();
        
        if (!gameCharacter) return null;
        
        // Create basic character structure from gameState
        const importedCharacter = {
            version: "2.0.0",
            metadata: {
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
                character_id: `char_imported_${Date.now()}`,
                schema_version: "2.0.0"
            },
            basic_info: {
                name: gameCharacter.name || 'Unnamed Hero',
                class: gameCharacter.class || 'warrior',
                level: gameCharacter.level || 1,
                experience: gameCharacter.experience || 0,
                background: gameCharacter.background || '',
                // Add default values for missing fields
                alignment: 'neutral',
                age: 25,
                gender: 'unknown',
                race: 'human',
                description: 'An adventurer seeking their destiny'
            },
            // ... continue mapping other fields with defaults
        };
        
        this.character = importedCharacter;
        return importedCharacter;
    }

    /**
     * Export character data for sharing/backup
     */
    exportCharacter(format = 'json') {
        if (!this.character) return null;
        
        switch (format) {
            case 'json':
                return JSON.stringify(this.character, null, 2);
            case 'gamestate':
                // Export in a format compatible with current gameState
                return {
                    character: {
                        name: this.character.basic_info.name,
                        class: this.character.basic_info.class,
                        level: this.character.basic_info.level,
                        experience: this.character.progression.experience_points,
                        background: this.character.basic_info.background,
                        stats: this.character.ability_scores.final_stats,
                        health: this.character.health_and_vitals.hit_points,
                        skills: this.character.skills.all_skills,
                        abilities: this.character.class_features.class_abilities,
                        inventory: this.getAllItems()
                    },
                    campaign: {
                        setting: this.character.campaign_setting.setting,
                        current_location: this.character.campaign_data.current_location
                    }
                };
            default:
                return null;
        }
    }

    /**
     * Get AI context for the character
     */
    getAIContext() {
        if (!this.character) return null;
        
        return {
            ...this.character.ai_context,
            current_stats: this.character.ability_scores.final_stats,
            current_health: this.character.health_and_vitals.hit_points,
            equipment_summary: this.getAllItems().map(item => item.name),
            active_quests: this.character.campaign_data.active_quests.map(q => q.title),
            campaign_flags: this.character.campaign_data.campaign_flags
        };
    }
}

// Create global instance
const characterDataManager = new CharacterDataManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterDataManager;
}
