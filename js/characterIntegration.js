/**
 * DiceTales - Character Integration Utilities
 * Helper functions to integrate character.json with existing systems
 */

/**
 * Initialize character data system
 */
async function initializeCharacterSystem() {
    logger.info('🎭 Initializing character data system');
    
    try {
        // Ensure characterDataManager is available
        if (typeof characterDataManager === 'undefined') {
            logger.error('⚠️ CharacterDataManager not available');
            return false;
        }
        
        // Try to load existing character from localStorage first
        const savedCharacter = localStorage.getItem('dicetales_character_data');
        
        if (savedCharacter) {
            logger.info('Loading character from localStorage...');
            characterDataManager.character = JSON.parse(savedCharacter);
        } else {
            // Try to load from character.json file
            logger.info('Loading character from character.json...');
            await characterDataManager.loadCharacter();
        }
        
        // Sync with existing gameState if available
        if (typeof gameState !== 'undefined') {
            const existingCharacter = gameState.getCharacter();
            if (existingCharacter && existingCharacter.name) {
                logger.info('🔄 Syncing existing character with enhanced system');
                characterDataManager.syncToGameState(characterDataManager.character);
            }
        }
        
        logger.info('✅ Character system initialized successfully');
        return true;
        
    } catch (error) {
        logger.warn('Could not load character.json, will create from gameState or defaults', error);
        
        // Try to import from existing gameState
        if (typeof gameState !== 'undefined') {
            const imported = characterDataManager.importFromGameState();
            if (imported) {
                logger.info('Character imported from gameState');
                return true;
            }
        }
        
        // Create default character
        createDefaultCharacter();
        return false;
    }
}

/**
 * Create default character when no data is available
 */
function createDefaultCharacter() {
    const defaultCharacter = {
        version: "2.0.0",
        metadata: {
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            character_id: `char_default_${Date.now()}`,
            schema_version: "2.0.0"
        },
        basic_info: {
            name: "New Hero",
            class: "warrior",
            level: 1,
            experience: 0,
            background: "An adventurer ready for their first quest",
            alignment: "neutral good",
            age: 25,
            gender: "unknown",
            race: "human",
            description: "A brave soul ready to face the unknown"
        },
        campaign_setting: {
            setting: "medieval-fantasy",
            setting_name: "Medieval Fantasy",
            setting_icon: "🏰",
            currency: "gold pieces",
            technology_level: "Medieval",
            magic_system: "High fantasy with spells and magical creatures"
        },
        ability_scores: {
            base_stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            point_buy_allocations: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
            final_stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            modifiers: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
            setting_specific_names: {
                str: { name: "Strength", abbr: "STR", description: "Physical power and muscle" },
                dex: { name: "Dexterity", abbr: "DEX", description: "Agility and reflexes" },
                con: { name: "Constitution", abbr: "CON", description: "Health and stamina" },
                int: { name: "Intelligence", abbr: "INT", description: "Reasoning and memory" },
                wis: { name: "Wisdom", abbr: "WIS", description: "Perception and insight" },
                cha: { name: "Charisma", abbr: "CHA", description: "Force of personality" }
            }
        },
        health_and_vitals: {
            hit_points: { current: 100, maximum: 100, temporary: 0 },
            armor_class: 10,
            initiative_bonus: 0,
            speed: 30,
            proficiency_bonus: 2,
            passive_perception: 10,
            inspiration: false
        },
        class_features: {
            primary_class: "warrior",
            class_icon: "⚔️",
            class_description: "A brave fighter skilled in combat and protection of others.",
            hit_die: "d10",
            primary_abilities: ["str", "con"],
            saving_throw_proficiencies: ["str", "con"],
            class_abilities: [],
            spellcasting: {
                is_spellcaster: false,
                spell_ability: null,
                spell_save_dc: null,
                spell_attack_bonus: null,
                cantrips_known: 0,
                spells_known: [],
                spell_slots: {}
            }
        },
        skills: {
            proficient_skills: [],
            all_skills: {}
        },
        equipment: {
            weapons: [],
            armor: [],
            shield: null,
            accessories: [],
            consumables: [],
            tools_and_kits: [],
            currency: { platinum: 0, gold: 0, electrum: 0, silver: 0, copper: 0 },
            carrying_capacity: { maximum: 150, current: 0, encumbered_at: 100, heavily_encumbered_at: 150 }
        },
        progression: {
            experience_points: 0,
            next_level_at: 300,
            level_progression: [],
            ability_score_improvements: { available_at_levels: [4, 6, 8, 12, 14, 16, 19], used: [] },
            multiclass: { enabled: false, classes: [] }
        },
        personality: {
            personality_traits: [],
            ideals: [],
            bonds: [],
            flaws: [],
            languages: ["Common"],
            proficiencies: { armor: [], weapons: [], tools: [], other: [] }
        },
        backstory: {
            background: "Folk Hero",
            feature: "",
            feature_description: "",
            background_skills: [],
            background_languages: [],
            background_equipment: [],
            personal_history: "",
            connections: []
        },
        roleplay_notes: {
            voice_and_mannerisms: "",
            motivations: "",
            fears: "",
            aspirations: "",
            quirks: [],
            relationships: { party_members: [], npcs: [], reputation: { factions: {}, locations: {} } }
        },
        campaign_data: {
            current_location: "",
            active_quests: [],
            completed_quests: [],
            important_locations: [],
            known_npcs: [],
            campaign_flags: {},
            story_beats: []
        },
        game_mechanics: {
            initiative_modifier: 0,
            spell_save_dc: null,
            spell_attack_bonus: null,
            passive_skills: { passive_perception: 10, passive_investigation: 10, passive_insight: 10 },
            conditions: { current: [], immunities: [], resistances: [], vulnerabilities: [] },
            death_saves: { successes: 0, failures: 0 },
            inspiration_dice: 0,
            legendary_actions: 0,
            legendary_resistances: 0
        },
        ai_context: {
            personality_summary: "A new adventurer ready to make their mark on the world",
            combat_preferences: "Adaptable combat style",
            roleplay_style: "Eager and curious",
            decision_making: "Thoughtful but willing to take risks",
            relationships: "Open to new friendships and alliances",
            goals: "Discover their true calling and make a difference"
        },
        import_export: {
            compatible_formats: ["dnd_beyond", "roll20", "fantasy_grounds", "dicetales_native"],
            export_settings: { include_backstory: true, include_campaign_data: true, include_roleplay_notes: true, format_version: "2.0.0" },
            last_exported: null,
            import_source: "default_creation",
            import_date: new Date().toISOString()
        }
    };
    
    characterDataManager.character = defaultCharacter;
    characterDataManager.saveCharacter();
    
    console.log('Default character created');
}

/**
 * Convert existing gameState character to new format
 */
function convertGameStateToCharacterJSON() {
    if (!gameState || !characterDataManager) {
        console.error('Required systems not available');
        return null;
    }
    
    const gameCharacter = gameState.getCharacter();
    const gameCampaign = gameState.getCampaign();
    
    if (!gameCharacter) {
        console.warn('No character in gameState to convert');
        return null;
    }
    
    // Import from gameState
    const converted = characterDataManager.importFromGameState();
    
    if (converted) {
        characterDataManager.saveCharacter();
        console.log('Successfully converted gameState character to new format');
    }
    
    return converted;
}

/**
 * Enhanced character creation integration
 */
function enhanceCharacterCreation() {
    if (!window.characterManager) return;
    
    // Hook into character creation completion
    const originalCompleteCreation = window.characterManager.completeCreation;
    
    window.characterManager.completeCreation = function() {
        // Call original method
        originalCompleteCreation.call(this);
        
        // Convert to new character format
        setTimeout(() => {
            const gameCharacter = gameState.getCharacter();
            if (gameCharacter) {
                // Create detailed character data
                const detailedCharacter = createDetailedCharacterFromGameState(gameCharacter);
                characterDataManager.character = detailedCharacter;
                characterDataManager.saveCharacter();
                
                console.log('Character creation enhanced with detailed data');
            }
        }, 1000);
    };
}

/**
 * Create detailed character data from gameState character
 */
function createDetailedCharacterFromGameState(gameCharacter) {
    const gameCampaign = gameState.getCampaign();
    const setting = gameCampaign?.setting || 'medieval-fantasy';
    
    // Get setting data from characterManager if available
    const settingData = window.characterManager?.settings?.[setting] || {};
    const classData = window.characterManager?.classes?.[gameCharacter.class] || {};
    
    return {
        version: "2.0.0",
        metadata: {
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            schema_version: "2.0.0"
        },
        basic_info: {
            name: gameCharacter.name || 'Unnamed Hero',
            class: gameCharacter.class || 'warrior',
            level: gameCharacter.level || 1,
            experience: gameCharacter.experience || 0,
            background: gameCharacter.background || 'Folk Hero',
            alignment: 'neutral good',
            age: 25,
            gender: 'unknown',
            race: 'human',
            description: `A ${gameCharacter.class} seeking adventure and glory`
        },
        campaign_setting: {
            setting: setting,
            setting_name: settingData.name || 'Medieval Fantasy',
            setting_icon: settingData.icon || '🏰',
            currency: settingData.currency || 'gold pieces',
            technology_level: settingData.technology || 'Medieval',
            magic_system: settingData.magic || 'High fantasy'
        },
        ability_scores: {
            base_stats: gameCharacter.baseClassStats || gameCharacter.stats,
            point_buy_allocations: gameCharacter.pointBuyStats || {},
            final_stats: gameCharacter.stats || {},
            modifiers: {},
            setting_specific_names: settingData.abilityScores || {}
        },
        health_and_vitals: {
            hit_points: gameCharacter.health || { current: 100, maximum: 100, temporary: 0 },
            armor_class: 10 + (gameCharacter.stats?.dex ? Math.floor((gameCharacter.stats.dex - 10) / 2) : 0),
            initiative_bonus: gameCharacter.stats?.dex ? Math.floor((gameCharacter.stats.dex - 10) / 2) : 0,
            speed: 30,
            proficiency_bonus: Math.ceil((gameCharacter.level || 1) / 4) + 1,
            passive_perception: 10 + (gameCharacter.stats?.wis ? Math.floor((gameCharacter.stats.wis - 10) / 2) : 0),
            inspiration: false
        },
        class_features: {
            primary_class: gameCharacter.class || 'warrior',
            class_icon: classData.icon || '⚔️',
            class_description: classData.description || 'An adventurer',
            hit_die: 'd10',
            primary_abilities: ['str', 'con'],
            saving_throw_proficiencies: ['str', 'con'],
            class_abilities: gameCharacter.abilities || classData.abilities || [],
            spellcasting: {
                is_spellcaster: false,
                spell_ability: null,
                spell_save_dc: null,
                spell_attack_bonus: null,
                cantrips_known: 0,
                spells_known: [],
                spell_slots: {}
            }
        },
        skills: {
            proficient_skills: [],
            all_skills: gameCharacter.skills || {}
        },
        equipment: {
            weapons: [],
            armor: [],
            shield: null,
            accessories: [],
            consumables: [],
            tools_and_kits: [],
            currency: { platinum: 0, gold: 100, electrum: 0, silver: 0, copper: 0 },
            carrying_capacity: {
                maximum: (gameCharacter.stats?.str || 10) * 15,
                current: 0,
                encumbered_at: (gameCharacter.stats?.str || 10) * 10,
                heavily_encumbered_at: (gameCharacter.stats?.str || 10) * 15
            }
        },
        progression: {
            experience_points: gameCharacter.experience || 0,
            next_level_at: 300,
            level_progression: [],
            ability_score_improvements: { available_at_levels: [4, 6, 8, 12, 14, 16, 19], used: [] },
            multiclass: { enabled: false, classes: [] }
        },
        personality: {
            personality_traits: [],
            ideals: [],
            bonds: [],
            flaws: [],
            languages: ['Common'],
            proficiencies: { armor: [], weapons: [], tools: [], other: [] }
        },
        backstory: {
            background: gameCharacter.background || 'Folk Hero',
            feature: '',
            feature_description: '',
            background_skills: [],
            background_languages: [],
            background_equipment: [],
            personal_history: gameCharacter.background || '',
            connections: []
        },
        roleplay_notes: {
            voice_and_mannerisms: '',
            motivations: 'Seek adventure and make a difference in the world',
            fears: '',
            aspirations: 'Become a legendary hero',
            quirks: [],
            relationships: { party_members: [], npcs: [], reputation: { factions: {}, locations: {} } }
        },
        campaign_data: {
            current_location: gameCampaign?.current_location || '',
            active_quests: [],
            completed_quests: [],
            important_locations: gameCampaign?.locations_visited || [],
            known_npcs: gameCampaign?.npcs_encountered || [],
            campaign_flags: gameCampaign?.campaign_flags || {},
            story_beats: []
        },
        game_mechanics: {
            initiative_modifier: gameCharacter.stats?.dex ? Math.floor((gameCharacter.stats.dex - 10) / 2) : 0,
            spell_save_dc: null,
            spell_attack_bonus: null,
            passive_skills: {
                passive_perception: 10 + (gameCharacter.stats?.wis ? Math.floor((gameCharacter.stats.wis - 10) / 2) : 0),
                passive_investigation: 10 + (gameCharacter.stats?.int ? Math.floor((gameCharacter.stats.int - 10) / 2) : 0),
                passive_insight: 10 + (gameCharacter.stats?.wis ? Math.floor((gameCharacter.stats.wis - 10) / 2) : 0)
            },
            conditions: { current: [], immunities: [], resistances: [], vulnerabilities: [] },
            death_saves: { successes: 0, failures: 0 },
            inspiration_dice: 0,
            legendary_actions: 0,
            legendary_resistances: 0
        },
        ai_context: {
            personality_summary: `A ${gameCharacter.class} with a ${gameCharacter.background} background`,
            combat_preferences: classData.description || 'Balanced combat approach',
            roleplay_style: 'Heroic and determined',
            decision_making: 'Considers consequences but acts when needed',
            relationships: 'Values loyalty and friendship',
            goals: 'Adventure, growth, and helping others'
        },
        import_export: {
            compatible_formats: ['dnd_beyond', 'roll20', 'fantasy_grounds', 'dicetales_native'],
            export_settings: { include_backstory: true, include_campaign_data: true, include_roleplay_notes: true, format_version: '2.0.0' },
            last_exported: null,
            import_source: 'gamestate_conversion',
            import_date: new Date().toISOString()
        }
    };
}

/**
 * Enhance inventory system with detailed item tracking
 */
function enhanceInventorySystem() {
    if (!window.aiManager) return;
    
    // Hook into AI inventory tracking
    const originalTrackInventoryChanges = window.aiManager.trackInventoryChanges;
    
    window.aiManager.trackInventoryChanges = function(response) {
        // Call original method
        originalTrackInventoryChanges.call(this, response);
        
        // Also track in detailed character system
        if (characterDataManager.character) {
            // Sync inventory from gameState to detailed character
            const gameCharacter = gameState.getCharacter();
            if (gameCharacter?.inventory) {
                // Convert simple inventory items to detailed format
                gameCharacter.inventory.forEach(item => {
                    if (typeof item === 'string') {
                        // Convert string to detailed item
                        const detailedItem = {
                            name: item,
                            type: 'item',
                            description: `A ${item.toLowerCase()} found during the adventure`,
                            weight: 1,
                            cost: { amount: 1, currency: 'gp' }
                        };
                        characterDataManager.addItem(detailedItem);
                    } else if (item && !characterDataManager.getAllItems().find(existing => existing.id === item.id)) {
                        // Add new detailed item
                        characterDataManager.addItem(item);
                    }
                });
            }
        }
    };
}

/**
 * Initialize all character system enhancements
 */
async function initializeCharacterEnhancements() {
    console.log('Initializing character system enhancements...');
    
    // Initialize the character data system
    await initializeCharacterSystem();
    
    // Enhance existing systems
    enhanceCharacterCreation();
    enhanceInventorySystem();
    
    // Set up event listeners for character updates
    if (typeof eventBus !== 'undefined') {
        eventBus.on('character:statsChanged', (data) => {
            if (characterDataManager.character) {
                Object.entries(data.stats).forEach(([stat, value]) => {
                    characterDataManager.updateStat(stat, value);
                });
            }
        });
        
        eventBus.on('character:experienceGained', (data) => {
            if (characterDataManager.character) {
                characterDataManager.addExperience(data.amount);
            }
        });
        
        eventBus.on('character:healthChanged', (data) => {
            if (characterDataManager.character) {
                characterDataManager.updateHealth(data.current, data.maximum);
            }
        });
    }
    
    console.log('Character system enhancements initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCharacterEnhancements);
} else {
    initializeCharacterEnhancements();
}
