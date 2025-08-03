/**
 * DiceTales - Game State Management
 * Centralized state management with persistence
 */

class GameState {
    constructor() {
        this.state = this.getDefaultState();
        this.version = '1.0.0';
        this.saveKey = 'dicetales_gamestate';
        this.autoSaveInterval = null;
        this.autoSaveDelay = 5000; // 5 seconds
        
        this.load();
        this.startAutoSave();
        
        // Bind methods to preserve context
        this.save = this.save.bind(this);
        this.load = this.load.bind(this);
        this.reset = this.reset.bind(this);
    }
    
    /**
     * Get default game state structure
     */
    getDefaultState() {
        return {
            version: this.version,
            character: {
                name: '',
                class: '',
                level: 1,
                experience: 0,
                background: '',
                stats: {
                    str: 10,
                    dex: 10,
                    con: 10,
                    int: 10,
                    wis: 10,
                    cha: 10
                },
                health: {
                    current: 100,
                    maximum: 100
                },
                skills: {},
                abilities: [],
                inventory: [],
                equipment: {
                    weapon: null,
                    armor: null,
                    shield: null,
                    accessories: []
                },
                notes: ''
            },
            campaign: {
                setting: '',
                dm_difficulty: 'medium',
                dm_custom_prompt: '',
                current_location: '',
                story_state: '',
                scene_context: '',
                choices_made: [],
                npcs_encountered: [],
                locations_visited: [],
                campaign_log: [],
                current_quest: null,
                completed_quests: [],
                campaign_flags: {},
                world_state: {}
            },
            settings: {
                dice_preferences: ['d20', 'd12', 'd10', 'd8', 'd6', 'd4'],
                audio_settings: {
                    master_volume: 0.7,
                    music_volume: 0.5,
                    sfx_volume: 0.8,
                    music_enabled: true,
                    sfx_enabled: true
                },
                display_preferences: {
                    theme: 'dark',
                    font_size: 'medium',
                    animation_speed: 'normal',
                    auto_scroll: true,
                    show_dice_history: true
                },
                ai_settings: {
                    response_length: 'medium',
                    creativity_level: 'balanced',
                    enable_auto_actions: false
                }
            },
            ui: {
                current_screen: 'character-creation',
                modal_state: {},
                last_roll: null,
                roll_history: [],
                input_history: [],
                selected_dice: ['d20'],
                currentTurn: null, // { id: string, hasRolled: boolean, startTime: string }
                turnCount: 0
            },
            meta: {
                created_at: new Date().toISOString(),
                last_played: new Date().toISOString(),
                total_playtime: 0,
                session_start: new Date().toISOString(),
                saves_count: 0,
                version: this.version
            }
        };
    }
    
    /**
     * Get current state or specific path
     */
    get(path = null) {
        if (!path) return deepClone(this.state);
        
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : null;
        }, this.state);
    }
    
    /**
     * Set state value at specific path
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state);
        
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        // Update metadata
        this.state.meta.last_played = new Date().toISOString();
        
        // Emit change event
        eventBus.emit('gameState:changed', {
            path,
            oldValue,
            newValue: value
        });
        
        // Trigger autosave
        this.scheduleAutoSave();
        
        logger.debug(`State updated: ${path}`, { oldValue, newValue: value });
    }
    
    /**
     * Update state by merging objects
     */
    update(path, updates) {
        const current = this.get(path);
        if (typeof current === 'object' && typeof updates === 'object') {
            this.set(path, { ...current, ...updates });
        } else {
            this.set(path, updates);
        }
    }
    
    /**
     * Add item to array at path
     */
    push(path, item) {
        const array = this.get(path) || [];
        array.push(item);
        this.set(path, array);
    }
    
    /**
     * Remove item from array at path
     */
    remove(path, predicate) {
        const array = this.get(path) || [];
        const filtered = array.filter(item => !predicate(item));
        this.set(path, filtered);
    }
    
    /**
     * Save state to localStorage
     */
    save() {
        try {
            this.state.meta.saves_count++;
            this.state.meta.last_played = new Date().toISOString();
            
            const stateToSave = {
                ...this.state,
                meta: {
                    ...this.state.meta,
                    total_playtime: this.calculateTotalPlaytime()
                }
            };
            
            const success = storage.set(this.saveKey, stateToSave);
            
            if (success) {
                logger.info('Game state saved successfully');
                eventBus.emit('gameState:saved', stateToSave);
                return true;
            } else {
                throw new Error('Failed to save to localStorage');
            }
        } catch (error) {
            logger.error('Failed to save game state:', error);
            showToast('Failed to save game progress', 'error');
            return false;
        }
    }
    
    /**
     * Load state from localStorage
     */
    load() {
        try {
            const saved = storage.get(this.saveKey);
            
            if (saved) {
                // Validate and migrate if necessary
                const migrated = this.migrateState(saved);
                this.state = { ...this.getDefaultState(), ...migrated };
                
                // Update session start time
                this.state.meta.session_start = new Date().toISOString();
                
                logger.info('Game state loaded successfully');
                eventBus.emit('gameState:loaded', this.state);
                return true;
            } else {
                logger.info('No saved game state found, using defaults');
                return false;
            }
        } catch (error) {
            logger.error('Failed to load game state:', error);
            showToast('Failed to load game progress, using defaults', 'warning');
            return false;
        }
    }
    
    /**
     * Reset state to defaults
     */
    reset() {
        this.state = this.getDefaultState();
        this.save();
        logger.info('Game state reset to defaults');
        eventBus.emit('gameState:reset', this.state);
    }
    
    /**
     * Export state as JSON string
     */
    export() {
        try {
            const exportData = {
                ...this.state,
                exported_at: new Date().toISOString(),
                export_version: this.version
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            logger.error('Failed to export game state:', error);
            throw error;
        }
    }
    
    /**
     * Import state from JSON string
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            // Validate import
            if (!imported.version) {
                throw new Error('Invalid save file format');
            }
            
            // Migrate if necessary
            const migrated = this.migrateState(imported);
            this.state = { ...this.getDefaultState(), ...migrated };
            
            // Update metadata
            this.state.meta.session_start = new Date().toISOString();
            this.state.meta.last_played = new Date().toISOString();
            
            this.save();
            
            logger.info('Game state imported successfully');
            eventBus.emit('gameState:imported', this.state);
            
            return true;
        } catch (error) {
            logger.error('Failed to import game state:', error);
            showToast('Failed to import save file', 'error');
            throw error;
        }
    }
    
    /**
     * Migrate state from older versions
     */
    migrateState(oldState) {
        let migrated = deepClone(oldState);
        
        // Version-specific migrations
        if (!migrated.version || migrated.version < '1.0.0') {
            // Migrate from pre-1.0.0
            migrated = this.migrateFromLegacy(migrated);
        }
        
        // Ensure all required properties exist
        migrated = this.ensureStateStructure(migrated);
        
        migrated.version = this.version;
        return migrated;
    }
    
    /**
     * Migrate from legacy state format
     */
    migrateFromLegacy(legacyState) {
        // Handle migration from older formats
        const migrated = this.getDefaultState();
        
        // Copy over any existing data that matches current structure
        if (legacyState.character) {
            migrated.character = { ...migrated.character, ...legacyState.character };
        }
        
        if (legacyState.campaign) {
            migrated.campaign = { ...migrated.campaign, ...legacyState.campaign };
        }
        
        if (legacyState.settings) {
            migrated.settings = { ...migrated.settings, ...legacyState.settings };
        }
        
        return migrated;
    }
    
    /**
     * Ensure state has all required properties
     */
    ensureStateStructure(state) {
        const defaultState = this.getDefaultState();
        
        function ensureProperties(target, source) {
            for (const key in source) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    ensureProperties(target[key], source[key]);
                } else if (target[key] === undefined) {
                    target[key] = source[key];
                }
            }
        }
        
        ensureProperties(state, defaultState);
        return state;
    }
    
    /**
     * Calculate total playtime
     */
    calculateTotalPlaytime() {
        const sessionStart = new Date(this.state.meta.session_start);
        const currentSession = Date.now() - sessionStart.getTime();
        return (this.state.meta.total_playtime || 0) + currentSession;
    }
    
    /**
     * Start autosave timer
     */
    startAutoSave() {
        this.stopAutoSave();
        this.scheduleAutoSave();
    }
    
    /**
     * Stop autosave timer
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearTimeout(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    /**
     * Schedule autosave
     */
    scheduleAutoSave() {
        this.stopAutoSave();
        this.autoSaveInterval = setTimeout(() => {
            this.save();
        }, this.autoSaveDelay);
    }
    
    /**
     * Character-specific helper methods
     */
    getCharacter() {
        return this.get('character');
    }
    
    updateCharacter(updates) {
        this.update('character', updates);
    }
    
    getCharacterStat(stat) {
        return this.get(`character.stats.${stat}`) || 10;
    }
    
    setCharacterStat(stat, value) {
        this.set(`character.stats.${stat}`, Math.max(1, Math.min(30, value)));
    }
    
    getCharacterModifier(stat) {
        return getAbilityModifier(this.getCharacterStat(stat));
    }
    
    addExperience(amount) {
        const current = this.get('character.experience') || 0;
        const newExp = current + amount;
        const oldLevel = this.get('character.level');
        const newLevel = getLevelFromExperience(newExp);
        
        this.set('character.experience', newExp);
        
        if (newLevel > oldLevel) {
            this.set('character.level', newLevel);
            eventBus.emit('character:levelUp', { oldLevel, newLevel, experience: newExp });
        }
    }
    
    addToInventory(item) {
        this.push('character.inventory', {
            id: generateId('item'),
            ...item,
            acquired_at: new Date().toISOString()
        });
    }
    
    removeFromInventory(itemId) {
        this.remove('character.inventory', item => item.id === itemId);
    }
    
    /**
     * Campaign-specific helper methods
     */
    getCampaign() {
        return this.get('campaign');
    }
    
    updateCampaign(updates) {
        this.update('campaign', updates);
    }
    
    addToCampaignLog(entry) {
        this.push('campaign.campaign_log', {
            id: generateId('log'),
            timestamp: new Date().toISOString(),
            ...entry
        });
    }
    
    addChoice(choice, outcome = null) {
        this.push('campaign.choices_made', {
            id: generateId('choice'),
            timestamp: new Date().toISOString(),
            choice,
            outcome
        });
    }
    
    /**
     * Memory helper methods for AI
     */
    
    /**
     * Add or update an NPC relationship
     */
    updateNPCRelationship(npcName, relationship, description = null) {
        const npcs = this.get('campaign.npcs_encountered') || [];
        const existingNPC = npcs.find(npc => npc.name === npcName);
        
        if (existingNPC) {
            existingNPC.relationship = relationship;
            if (description) existingNPC.description = description;
            existingNPC.last_interaction = new Date().toISOString();
        } else {
            npcs.push({
                name: npcName,
                relationship: relationship,
                description: description || 'NPC encountered during adventure',
                met_at: new Date().toISOString(),
                last_interaction: new Date().toISOString()
            });
        }
        
        this.set('campaign.npcs_encountered', npcs);
    }
    
    /**
     * Add important location to memory
     */
    addImportantLocation(locationName, description = null) {
        const locations = this.get('campaign.important_locations') || [];
        const existingLocation = locations.find(loc => loc.name === locationName);
        
        if (!existingLocation) {
            locations.push({
                name: locationName,
                description: description || 'Important location visited',
                discovered_at: new Date().toISOString()
            });
            this.set('campaign.important_locations', locations);
        }
    }
    
    /**
     * Set campaign flag for memory tracking
     */
    setCampaignFlag(key, value) {
        this.set(`campaign.campaign_flags.${key}`, {
            value: value,
            set_at: new Date().toISOString()
        });
    }
    
    /**
     * Get campaign flag value
     */
    getCampaignFlag(key) {
        const flag = this.get(`campaign.campaign_flags.${key}`);
        return flag ? flag.value : null;
    }
    
    /**
     * Update current quest
     */
    updateQuest(questData) {
        const currentQuest = this.get('campaign.current_quest');
        if (currentQuest) {
            this.set('campaign.current_quest', { ...currentQuest, ...questData });
        } else {
            this.set('campaign.current_quest', {
                ...questData,
                started_at: new Date().toISOString()
            });
        }
    }
    
    /**
     * Complete current quest
     */
    completeCurrentQuest() {
        const currentQuest = this.get('campaign.current_quest');
        if (currentQuest) {
            const completedQuest = {
                ...currentQuest,
                completed_at: new Date().toISOString()
            };
            this.push('campaign.completed_quests', completedQuest);
            this.set('campaign.current_quest', null);
            return completedQuest;
        }
        return null;
    }
    
    /**
     * Update world state for memory persistence
     */
    updateWorldState(key, value) {
        this.set(`campaign.world_state.${key}`, {
            value: value,
            updated_at: new Date().toISOString()
        });
    }
    
    /**
     * Get world state value
     */
    getWorldState(key) {
        const state = this.get(`campaign.world_state.${key}`);
        return state ? state.value : null;
    }
    
    addNPCEncounter(npc) {
        const existing = this.get('campaign.npcs_encountered').find(n => n.name === npc.name);
        if (existing) {
            // Update existing NPC
            existing.last_interaction = new Date().toISOString();
            existing.relationship = npc.relationship || existing.relationship;
        } else {
            // Add new NPC
            this.push('campaign.npcs_encountered', {
                id: generateId('npc'),
                first_met: new Date().toISOString(),
                last_interaction: new Date().toISOString(),
                ...npc
            });
        }
    }
    
    setCampaignFlag(flag, value) {
        const flags = this.get('campaign.campaign_flags') || {};
        flags[flag] = value;
        this.set('campaign.campaign_flags', flags);
    }
    
    getCampaignFlag(flag) {
        return this.get(`campaign.campaign_flags.${flag}`);
    }
    
    /**
     * UI-specific helper methods
     */
    setCurrentScreen(screen) {
        this.set('ui.current_screen', screen);
    }
    
    getCurrentScreen() {
        return this.get('ui.current_screen');
    }
    
    addToRollHistory(roll) {
        const history = this.get('ui.roll_history') || [];
        history.push({
            id: generateId('roll'),
            timestamp: new Date().toISOString(),
            ...roll
        });
        
        // Keep only last 50 rolls
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        this.set('ui.roll_history', history);
        this.set('ui.last_roll', roll);
    }
    
    addToInputHistory(input) {
        const history = this.get('ui.input_history') || [];
        
        // Don't add duplicates
        if (history[history.length - 1] !== input) {
            history.push(input);
            
            // Keep only last 20 inputs
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }
            
            this.set('ui.input_history', history);
        }
    }
    
    /**
     * Settings helper methods
     */
    getSetting(path) {
        return this.get(`settings.${path}`);
    }
    
    setSetting(path, value) {
        this.set(`settings.${path}`, value);
    }
    
    /**
     * Validation methods
     */
    isCharacterCreated() {
        const character = this.getCharacter();
        return character.name && character.class && character.level >= 1;
    }
    
    isCampaignStarted() {
        const campaign = this.getCampaign();
        return campaign.setting && campaign.story_state;
    }
    
    canStartGame() {
        return this.isCharacterCreated() && this.getCampaign().setting;
    }
    
    /**
     * Debug methods
     */
    getStateSize() {
        return JSON.stringify(this.state).length;
    }
    
    getStateInfo() {
        return {
            version: this.state.version,
            created: this.state.meta.created_at,
            lastPlayed: this.state.meta.last_played,
            playtime: this.calculateTotalPlaytime(),
            saves: this.state.meta.saves_count,
            size: this.getStateSize(),
            character: this.state.character.name || 'Unnamed',
            level: this.state.character.level,
            setting: this.state.campaign.setting || 'None'
        };
    }

    /**
     * Set campaign data
     */
    setCampaign(campaignData) {
        this.set('campaign', campaignData);
        this.save();
        logger.info('Campaign data updated', campaignData);
    }

    /**
     * Load game state (alias for load method for compatibility)
     */
    loadGameState() {
        return this.load();
    }

    /**
     * Add choice to campaign log
     */
    addChoice(action, response) {
        this.push('campaign.choices', {
            timestamp: new Date().toISOString(),
            action: action,
            response: response
        });
        this.save();
    }

    /**
     * Add entry to campaign log
     */
    addToCampaignLog(entry) {
        if (!this.state.campaign.campaign_log) {
            this.state.campaign.campaign_log = [];
        }
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...entry
        };
        
        this.push('campaign.campaign_log', logEntry);
        this.save();
    }
}

// Create global game state instance
const gameState = new GameState();

// Handle page visibility changes for playtime tracking
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameState.save(); // Save when tab becomes hidden
    } else {
        // Reset session start when tab becomes visible again
        gameState.set('meta.session_start', new Date().toISOString());
    }
});

// Save before page unload
window.addEventListener('beforeunload', () => {
    gameState.save();
});

// Export to global scope
window.GameState = GameState;
window.gameState = gameState;

logger.info('Game state system initialized', gameState.getStateInfo());
