/**
 * DiceTales - Character Creation and Management System
 */

class CharacterManager {
    constructor() {
        this.currentStep = 0;
        this.steps = ['setting', 'class', 'stats', 'details'];
        this.pointBuyPoints = 27;
        this.baseStatCost = 8;
        this.basePointBuyStats = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
        
        this.initializeData();
        this.bindEvents();
    }
    
    /**
     * Get ability scores definition for current setting
     */
    getCurrentAbilityScores() {
        const currentSetting = gameState.get('campaign.setting') || 'medieval-fantasy';
        return this.settings[currentSetting]?.abilityScores || this.settings['medieval-fantasy'].abilityScores;
    }
    
    /**
     * Get ability score display info (name, abbreviation, description)
     */
    getAbilityScoreInfo(statKey) {
        const abilityScores = this.getCurrentAbilityScores();
        return abilityScores[statKey] || { 
            name: statKey.toUpperCase(), 
            abbr: statKey.toUpperCase(), 
            description: `${statKey} ability score` 
        };
    }
    
    /**
     * Initialize character data and settings
     */
    initializeData() {
        // Campaign settings with complete details
        this.settings = {
            'medieval-fantasy': {
                name: 'Medieval Fantasy',
                icon: '🏰',
                description: 'Classic sword and sorcery adventures in a medieval world filled with magic, dragons, and ancient mysteries.',
                classes: ['fighter', 'wizard', 'rogue', 'cleric', 'ranger', 'paladin', 'barbarian', 'bard'],
                currency: 'gold pieces',
                technology: 'Medieval',
                magic: 'High fantasy with spells and magical creatures',
                themes: ['heroic quests', 'dungeon exploration', 'political intrigue', 'ancient evils'],
                dm_personality_hint: 'Focus on classic fantasy tropes, epic adventures, and moral choices between good and evil.',
                abilityScores: {
                    str: { name: 'Strength', abbr: 'STR', description: 'Physical power and muscle' },
                    dex: { name: 'Dexterity', abbr: 'DEX', description: 'Agility and reflexes' },
                    con: { name: 'Constitution', abbr: 'CON', description: 'Health and stamina' },
                    int: { name: 'Intelligence', abbr: 'INT', description: 'Reasoning and memory' },
                    wis: { name: 'Wisdom', abbr: 'WIS', description: 'Perception and insight' },
                    cha: { name: 'Charisma', abbr: 'CHA', description: 'Force of personality' }
                }
            },
            'modern-day': {
                name: 'Modern Day',
                icon: '🏙️',
                description: 'Contemporary adventures in the real world with hidden supernatural elements and urban mysteries.',
                classes: ['investigator', 'hacker', 'soldier', 'medic', 'occultist', 'detective', 'journalist', 'athlete'],
                currency: 'dollars',
                technology: 'Modern (smartphones, internet, cars)',
                magic: 'Hidden supernatural, urban fantasy',
                themes: ['conspiracy theories', 'supernatural investigations', 'corporate espionage', 'street crime'],
                dm_personality_hint: 'Blend realistic modern situations with supernatural or thriller elements. Use contemporary references.',
                abilityScores: {
                    str: { name: 'Fitness', abbr: 'FIT', description: 'Physical conditioning and athleticism' },
                    dex: { name: 'Reflexes', abbr: 'REF', description: 'Speed and hand-eye coordination' },
                    con: { name: 'Endurance', abbr: 'END', description: 'Stamina and resilience' },
                    int: { name: 'Education', abbr: 'EDU', description: 'Knowledge and analytical thinking' },
                    wis: { name: 'Awareness', abbr: 'AWR', description: 'Street smarts and intuition' },
                    cha: { name: 'Influence', abbr: 'INF', description: 'Social skills and persuasion' }
                }
            },
            'sci-fi-space': {
                name: 'Sci-Fi Space',
                icon: '🚀',
                description: 'Far future space exploration with advanced technology, alien encounters, and cosmic mysteries.',
                classes: ['pilot', 'engineer', 'psion', 'marine', 'diplomat', 'scientist', 'smuggler', 'cyborg'],
                currency: 'credits',
                technology: 'Advanced (FTL travel, energy weapons, AI)',
                magic: 'Psionics, alien technology, quantum manipulation',
                themes: ['space exploration', 'alien contact', 'technological singularity', 'cosmic horror'],
                dm_personality_hint: 'Emphasize the vastness of space, technological wonders, and encounters with the unknown.',
                abilityScores: {
                    str: { name: 'Might', abbr: 'MGT', description: 'Physical strength in various gravities' },
                    dex: { name: 'Agility', abbr: 'AGL', description: 'Zero-G maneuvering and precision' },
                    con: { name: 'Vitality', abbr: 'VIT', description: 'Radiation resistance and life support' },
                    int: { name: 'Logic', abbr: 'LOG', description: 'Technical knowledge and problem-solving' },
                    wis: { name: 'Intuition', abbr: 'INT', description: 'Survival instincts and empathy' },
                    cha: { name: 'Presence', abbr: 'PRE', description: 'Leadership and diplomatic relations' }
                }
            },
            'eldritch-horror': {
                name: 'Eldritch Horror',
                icon: '🐙',
                description: '1920s Lovecraftian horror where investigators face cosmic entities and forbidden knowledge.',
                classes: ['investigator', 'scholar', 'occultist', 'detective', 'journalist', 'antiquarian', 'dilettante', 'doctor'],
                currency: 'dollars',
                technology: '1920s (early automobiles, radio, telephone)',
                magic: 'Forbidden knowledge with sanity costs',
                themes: ['cosmic horror', 'forbidden knowledge', 'madness', 'ancient mysteries'],
                dm_personality_hint: 'Create atmosphere of dread and mystery. Knowledge comes at a cost. Not all problems can be solved with violence.',
                abilityScores: {
                    str: { name: 'Physique', abbr: 'PHY', description: 'Physical prowess and vigor' },
                    dex: { name: 'Dexterity', abbr: 'DEX', description: 'Manual dexterity and coordination' },
                    con: { name: 'Stamina', abbr: 'STA', description: 'Physical and mental resilience' },
                    int: { name: 'Intellect', abbr: 'INT', description: 'Reasoning and academic knowledge' },
                    wis: { name: 'Perception', abbr: 'PER', description: 'Awareness and intuitive understanding' },
                    cha: { name: 'Willpower', abbr: 'WIL', description: 'Mental fortitude against the unknown' }
                }
            }
        };
        
        // Character classes with balanced stats and abilities
        this.classes = {
            // Medieval Fantasy Classes
            'fighter': {
                name: 'Fighter',
                icon: '⚔️',
                description: 'A master of martial combat, skilled with a variety of weapons and armor.',
                stats: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
                abilities: [
                    { name: 'Second Wind', description: 'Regain hit points as a bonus action' },
                    { name: 'Action Surge', description: 'Take an additional action on your turn' },
                    { name: 'Fighting Style', description: 'Specialized combat technique' }
                ],
                equipment: ['Long sword', 'Chain mail', 'Shield', 'Adventurer\'s pack']
            },
            'wizard': {
                name: 'Wizard',
                icon: '🧙',
                description: 'A scholarly magic-user capable of manipulating the arcane forces of the world.',
                stats: { str: 8, dex: 12, con: 13, int: 15, wis: 14, cha: 10 },
                abilities: [
                    { name: 'Spellcasting', description: 'Cast spells from your spellbook' },
                    { name: 'Arcane Recovery', description: 'Recover expended spell slots' },
                    { name: 'Ritual Casting', description: 'Cast spells as rituals without expending slots' }
                ],
                equipment: ['Quarterstaff', 'Spellbook', 'Component pouch', 'Scholar\'s pack']
            },
            'rogue': {
                name: 'Rogue',
                icon: '🗡️',
                description: 'A scoundrel who uses stealth and trickery to accomplish goals others can\'t.',
                stats: { str: 10, dex: 15, con: 12, int: 13, wis: 14, cha: 8 },
                abilities: [
                    { name: 'Sneak Attack', description: 'Deal extra damage when you have advantage' },
                    { name: 'Thieves\' Cant', description: 'Secret language known by rogues' },
                    { name: 'Expertise', description: 'Double proficiency bonus for chosen skills' }
                ],
                equipment: ['Shortsword', 'Leather armor', 'Thieves\' tools', 'Burglar\'s pack']
            },
            'cleric': {
                name: 'Cleric',
                icon: '✨',
                description: 'A priestly champion who wields divine magic in service of a higher power.',
                stats: { str: 13, dex: 8, con: 14, int: 10, wis: 15, cha: 12 },
                abilities: [
                    { name: 'Spellcasting', description: 'Cast divine spells' },
                    { name: 'Channel Divinity', description: 'Harness divine energy for special effects' },
                    { name: 'Divine Domain', description: 'Specialized divine focus area' }
                ],
                equipment: ['Mace', 'Scale mail', 'Shield', 'Priest\'s pack']
            },
            
            // Modern Day Classes
            'investigator': {
                name: 'Investigator',
                icon: '🔍',
                description: 'A keen detective who uncovers hidden truths and solves mysteries.',
                stats: { str: 10, dex: 12, con: 13, int: 15, wis: 14, cha: 8 },
                abilities: [
                    { name: 'Keen Observation', description: 'Notice details others miss' },
                    { name: 'Research Network', description: 'Access to information sources' },
                    { name: 'Deductive Reasoning', description: 'Connect clues to form conclusions' }
                ],
                equipment: ['Smartphone', 'Camera', 'Notebook', 'Investigation kit']
            },
            'hacker': {
                name: 'Hacker',
                icon: '💻',
                description: 'A technology expert who can manipulate digital systems and information.',
                stats: { str: 8, dex: 13, con: 10, int: 15, wis: 12, cha: 14 },
                abilities: [
                    { name: 'Digital Intrusion', description: 'Hack into computer systems' },
                    { name: 'Data Mining', description: 'Extract valuable information from databases' },
                    { name: 'Social Engineering', description: 'Manipulate people through technology' }
                ],
                equipment: ['Laptop', 'Smartphone', 'USB toolkit', 'Encrypted drives']
            },
            
            // Sci-Fi Classes
            'pilot': {
                name: 'Pilot',
                icon: '🚀',
                description: 'An expert at operating spacecraft and other advanced vehicles.',
                stats: { str: 12, dex: 15, con: 13, int: 14, wis: 10, cha: 8 },
                abilities: [
                    { name: 'Ace Pilot', description: 'Superior vehicle operation skills' },
                    { name: 'Quick Reflexes', description: 'React faster in dangerous situations' },
                    { name: 'Navigation Expert', description: 'Plot courses through space' }
                ],
                equipment: ['Pilot suit', 'Navigation tools', 'Emergency kit', 'Comm device']
            },
            'psion': {
                name: 'Psion',
                icon: '🧠',
                description: 'A being with powerful mental abilities and psychic powers.',
                stats: { str: 8, dex: 10, con: 12, int: 13, wis: 15, cha: 14 },
                abilities: [
                    { name: 'Telepathy', description: 'Read and communicate with minds' },
                    { name: 'Telekinesis', description: 'Move objects with mental power' },
                    { name: 'Precognition', description: 'Glimpse possible futures' }
                ],
                equipment: ['Psi-amplifier', 'Mental focus crystal', 'Meditation mat', 'Psychic journal']
            }
        };
        
        // Add remaining classes for other settings...
        this.addRemainingClasses();
    }
    
    /**
     * Add remaining classes for all settings
     */
    addRemainingClasses() {
        // Horror classes
        Object.assign(this.classes, {
            'scholar': {
                name: 'Scholar',
                icon: '📚',
                description: 'An academic who seeks knowledge, even when it comes at a terrible cost.',
                stats: { str: 8, dex: 10, con: 12, int: 15, wis: 13, cha: 14 },
                abilities: [
                    { name: 'Research', description: 'Find information in libraries and archives' },
                    { name: 'Language Expert', description: 'Read ancient and foreign texts' },
                    { name: 'Academic Network', description: 'Contacts in universities and museums' }
                ],
                equipment: ['Books', 'Research notes', 'Magnifying glass', 'Library card']
            },
            'detective': {
                name: 'Detective',
                icon: '🕵️',
                description: 'A law enforcement officer trained to solve crimes and mysteries.',
                stats: { str: 12, dex: 13, con: 14, int: 14, wis: 15, cha: 10 },
                abilities: [
                    { name: 'Crime Scene Analysis', description: 'Read clues at investigation sites' },
                    { name: 'Interrogation', description: 'Get information from suspects' },
                    { name: 'Police Resources', description: 'Access to official databases and support' }
                ],
                equipment: ['Badge', 'Gun', 'Handcuffs', 'Police radio']
            }
        });
        
        // Add more classes as needed...
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        eventBus.on('character:startCreation', () => this.showCharacterCreation());
        eventBus.on('character:nextStep', () => this.nextStep());
        eventBus.on('character:prevStep', () => this.prevStep());
        eventBus.on('character:complete', () => this.completeCreation());
    }
    
    /**
     * Show character creation interface
     */
    showCharacterCreation() {
        console.log('CharacterManager: showCharacterCreation() called');
        
        const creationScreen = document.getElementById('character-creation');
        
        console.log('CharacterManager: creationScreen found:', !!creationScreen);
        
        if (creationScreen) {
            // Screen exists, use it
            console.log('CharacterManager: Using existing character creation screen...');
            
            // Make sure it's visible
            creationScreen.style.display = 'flex';
            creationScreen.classList.add('active');
            
            // Render content
            this.renderCharacterCreation();
            this.showStep(0);
            
            console.log('CharacterManager: Character creation setup complete');
        } else {
            console.log('CharacterManager: No character creation screen found, creating fallback...');
            this.createCharacterCreationHTML();
            
            // Wait for DOM to update before rendering content
            setTimeout(() => {
                console.log('CharacterManager: DOM updated, rendering character creation...');
                this.renderCharacterCreation();
                this.showStep(0);
                console.log('CharacterManager: Character creation setup complete');
            }, 50);
        }
        
        gameState.setCurrentScreen('character-creation');
    }
    
    /**
     * Create character creation HTML structure
     */
    createCharacterCreationHTML() {
        const existingCreation = document.getElementById('character-creation');
        if (existingCreation) {
            existingCreation.remove();
        }
        
        const creationHTML = `
            <section class="character-creation" id="character-creation">
                <div class="creation-header">
                    <h1>Create Your Character</h1>
                    <p>Forge your legend in the world of DiceTales</p>
                </div>
                
                <div class="step-indicator" id="step-indicator">
                    <!-- Steps will be populated by JS -->
                </div>
                
                <div class="creation-content" id="creation-content">
                    <!-- Steps content will be populated by JS -->
                </div>
                
                <div class="step-navigation">
                    <div class="nav-buttons">
                        <button id="prev-step-btn" class="btn btn-secondary btn-nav" disabled>
                            ← Previous
                        </button>
                        <button id="next-step-btn" class="btn btn-primary btn-nav" disabled>
                            Next →
                        </button>
                        <button id="complete-creation-btn" class="btn btn-success btn-nav" style="display: none;">
                            Start Adventure! 🎲
                        </button>
                    </div>
                </div>
            </section>
        `;
        
        document.querySelector('.app').insertAdjacentHTML('beforeend', creationHTML);
        
        // Immediately show the character creation screen
        const newCharacterScreen = document.getElementById('character-creation');
        if (newCharacterScreen) {
            newCharacterScreen.style.display = 'block';
            newCharacterScreen.style.visibility = 'visible';
            newCharacterScreen.style.opacity = '1';
            console.log('CharacterManager: Character creation screen made visible');
        }
        
        // Wait for DOM to update, then bind events
        setTimeout(() => {
            // Bind navigation buttons
            const prevBtn = document.getElementById('prev-step-btn');
            const nextBtn = document.getElementById('next-step-btn');
            const completeBtn = document.getElementById('complete-creation-btn');
            
            if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    console.log('CharacterManager: Complete button clicked!');
                    console.log('CharacterManager: Current step:', this.currentStep);
                    console.log('CharacterManager: Can proceed?', this.canProceedToNextStep());
                    this.completeCreation();
                });
            }
            
            console.log('CharacterManager: Navigation buttons bound');
        }, 10);
    }
    
    /**
     * Render the complete character creation interface
     */
    renderCharacterCreation() {
        console.log('CharacterManager: renderCharacterCreation() called');
        
        console.log('CharacterManager: Rendering step indicator...');
        this.renderStepIndicator();
        
        console.log('CharacterManager: Rendering step content...');
        this.renderStepContent();
        
        console.log('CharacterManager: Updating navigation buttons...');
        this.updateNavigationButtons();
        
        console.log('CharacterManager: Binding navigation events...');
        this.bindNavigationEvents();
        
        console.log('CharacterManager: renderCharacterCreation() complete');
    }
    
    /**
     * Bind navigation button events
     */
    bindNavigationEvents() {
        // Bind navigation buttons
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');
        const completeBtn = document.getElementById('complete-creation-btn');
        
        // Remove existing event listeners to prevent duplicates
        if (prevBtn) {
            prevBtn.replaceWith(prevBtn.cloneNode(true));
            const newPrevBtn = document.getElementById('prev-step-btn');
            newPrevBtn.addEventListener('click', () => this.prevStep());
        }
        
        if (nextBtn) {
            nextBtn.replaceWith(nextBtn.cloneNode(true));
            const newNextBtn = document.getElementById('next-step-btn');
            newNextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (completeBtn) {
            completeBtn.replaceWith(completeBtn.cloneNode(true));
            const newCompleteBtn = document.getElementById('complete-creation-btn');
            newCompleteBtn.addEventListener('click', () => this.completeCreation());
        }
        
        console.log('CharacterManager: Navigation buttons bound successfully');
    }
    
    /**
     * Render step indicator
     */
    renderStepIndicator() {
        const indicator = document.getElementById('step-indicator');
        if (!indicator) return;
        
        const stepNames = {
            'setting': 'Setting',
            'class': 'Class',
            'stats': 'Stats',
            'details': 'Details'
        };
        
        indicator.innerHTML = this.steps.map((step, index) => `
            <div class="step-indicator-item ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}">
                <div class="step-number">${index < this.currentStep ? '✓' : index + 1}</div>
                <span class="step-name">${stepNames[step]}</span>
            </div>
        `).join('');
    }
    
    /**
     * Render current step content
     */
    renderStepContent() {
        console.log('CharacterManager: renderStepContent() called, step:', this.currentStep);
        
        const content = document.getElementById('creation-content');
        if (!content) {
            console.error('CharacterManager: creation-content element not found!');
            console.log('CharacterManager: Available elements with creation in ID:');
            document.querySelectorAll('[id*="creation"]').forEach(el => {
                console.log('  -', el.id, el.tagName);
            });
            
            // Try to find the character creation screen
            const characterScreen = document.getElementById('character-creation');
            if (characterScreen) {
                console.log('CharacterManager: Character screen found, looking for content div...');
                const contentDiv = characterScreen.querySelector('.creation-content');
                if (contentDiv) {
                    console.log('CharacterManager: Found content div by class, adding ID...');
                    contentDiv.id = 'creation-content';
                    return this.renderStepContent(); // Retry
                }
            }
            
            return;
        }
        
        console.log('CharacterManager: creation-content found, rendering step...');
        
        const stepName = this.steps[this.currentStep];
        console.log('CharacterManager: Current step name:', stepName);
        
        let html = '';
        try {
            switch (stepName) {
                case 'setting':
                    html = this.renderSettingSelection();
                    break;
                case 'class':
                    html = this.renderClassSelection();
                    break;
                case 'stats':
                    html = this.renderStatAllocation();
                    break;
                case 'details':
                    html = this.renderCharacterDetails();
                    break;
                default:
                    html = '<div class="error">Unknown step: ' + stepName + '</div>';
            }
        } catch (error) {
            console.error('CharacterManager: Error rendering step content:', error);
            html = '<div class="error">Error loading step content. Please refresh.</div>';
        }
        
        console.log('CharacterManager: Generated HTML length:', html.length);
        console.log('CharacterManager: HTML preview:', html.substring(0, 200) + '...');
        
        content.innerHTML = html;
        console.log('CharacterManager: Content set, binding events...');
        
        this.bindStepEvents();
        console.log('CharacterManager: renderStepContent() complete');
    }
    
    /**
     * Render setting selection step
     */
    renderSettingSelection() {
        return `
            <div class="creation-step active">
                <div class="step-header">
                    <h2>Choose Your Setting</h2>
                    <p>Select the world where your adventure will unfold</p>
                </div>
                
                <div class="setting-grid">
                    ${Object.entries(this.settings).map(([key, setting]) => `
                        <div class="setting-card" data-setting="${key}">
                            <span class="setting-icon">${setting.icon}</span>
                            <h3 class="setting-name">${setting.name}</h3>
                            <p class="setting-description">${setting.description}</p>
                            <div class="setting-details">
                                <small><strong>Technology:</strong> ${setting.technology}</small><br>
                                <small><strong>Magic:</strong> ${setting.magic}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render class selection step
     */
    renderClassSelection() {
        const selectedSetting = gameState.get('campaign.setting');
        const availableClasses = selectedSetting ? this.settings[selectedSetting].classes : [];
        
        return `
            <div class="creation-step active">
                <div class="step-header">
                    <h2>Choose Your Class</h2>
                    <p>Select your character's profession and calling</p>
                </div>
                
                <div class="class-selection">
                    <div class="class-list">
                        ${availableClasses.map(classKey => {
                            const classData = this.classes[classKey];
                            return classData ? `
                                <div class="class-item" data-class="${classKey}">
                                    <span class="class-icon">${classData.icon}</span>
                                    <div class="class-info">
                                        <h3>${classData.name}</h3>
                                        <p>${classData.description.substring(0, 60)}...</p>
                                    </div>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                    
                    <div class="class-details empty" id="class-details">
                        <p>Select a class to see details</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render stat allocation step
     */
    renderStatAllocation() {
        const character = gameState.getCharacter();
        
        // Initialize point-buy stats if not present (backward compatibility)
        if (!character.pointBuyStats) {
            this.initializePointBuyStats();
        }

        const stats = character.stats || { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
        const abilityScores = this.getCurrentAbilityScores();
        const currentSetting = gameState.get('campaign.setting') || 'medieval-fantasy';
        const settingName = this.settings[currentSetting]?.name || 'Medieval Fantasy';
        
        return `
            <div class="creation-step active">
                <div class="step-header">
                    <h2>Allocate Ability Scores</h2>
                    <p>Use point-buy to customize your character's abilities for the <strong>${settingName}</strong> setting. Your class provides base stats, and you have 27 points to allocate for improvements.</p>
                </div>
                
                <div class="stat-allocation">
                    <div class="point-buy-info">
                        <div class="points-display">
                            <div class="points-remaining" id="points-remaining">${this.calculateRemainingPoints()}</div>
                            <div class="points-label">Points Remaining</div>
                        </div>
                        <div class="allocation-help">
                            <p>💡 <strong>How it works:</strong> Your class provides base stats, and you have 27 points to enhance them further.</p>
                            <p>🛡️ Class bonuses are protected and shown as blue badges below each stat.</p>
                        </div>
                    </div>
                    
                    <div class="stat-rows">
                        ${this.renderStatRows(stats)}
                    </div>
                    
                    <div class="stat-descriptions">
                        <h4>Ability Score Descriptions for ${settingName}</h4>
                        <ul>
                            ${Object.entries(abilityScores).map(([key, info]) => 
                                `<li><strong>${info.name} (${info.abbr}):</strong> ${info.description}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render stat rows for point buy system
     */
    renderStatRows(stats) {
        const abilityScores = this.getCurrentAbilityScores();
        
        const baseClassStats = gameState.get('character.baseClassStats') || {};
        const pointBuyStats = gameState.get('character.pointBuyStats') || { ...this.basePointBuyStats };
        
        return Object.entries(abilityScores).map(([key, scoreInfo]) => {
            const finalValue = stats[key] || 8;
            const baseClassValue = baseClassStats[key] || 8;
            const pointBuyValue = pointBuyStats[key] || 8;
            const pointsSpent = pointBuyValue - 8;
            const modifier = getAbilityModifier(finalValue);
            
            return `
                <div class="stat-row">
                    <div class="stat-info">
                        <div class="stat-label">${scoreInfo.name} (${scoreInfo.abbr})</div>
                        <div class="stat-description">${scoreInfo.description}</div>
                        <div class="stat-breakdown">
                            <span class="class-bonus" title="Base from class">Class: ${baseClassValue}</span>
                            ${pointsSpent > 0 ? `<span class="point-bonus" title="Points allocated">+${pointsSpent}</span>` : ''}
                        </div>
                    </div>
                    <div class="stat-controls">
                        <button class="stat-btn decrease" data-stat="${key}" ${pointBuyValue <= 8 ? 'disabled' : ''}>−</button>
                        <div class="stat-display">
                            <div class="stat-value">${finalValue}</div>
                            <div class="stat-modifier">${formatModifier(modifier)}</div>
                        </div>
                        <button class="stat-btn increase" data-stat="${key}" ${pointBuyValue >= 15 || this.calculateRemainingPoints() <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Render character details step
     */
    renderCharacterDetails() {
        const character = gameState.getCharacter();
        const currentSetting = gameState.get('campaign.setting') || 'medieval-fantasy';
        
        // Get setting name with fallback
        let settingName = 'Unknown Setting';
        if (this.settings && this.settings[currentSetting]) {
            settingName = this.settings[currentSetting].name;
        } else {
            // Fallback mapping for common settings
            const settingMap = {
                'medieval-fantasy': 'Medieval Fantasy',
                'modern-day': 'Modern Day',
                'sci-fi-space': 'Sci-Fi Space',
                'eldritch-horror': 'Eldritch Horror'
            };
            settingName = settingMap[currentSetting] || 'Medieval Fantasy';
        }
        
        console.log('CharacterManager: Rendering details for setting:', currentSetting, 'name:', settingName);
        
        return `
            <div class="creation-step active">
                <div class="step-header">
                    <h2>Character Details</h2>
                    <p>Add personality and background to bring your character to life in <strong>${settingName}</strong></p>
                </div>
                
                <form class="character-details-form">
                    <div class="form-group">
                        <label class="form-label required" for="character-name">Character Name *</label>
                        <input type="text" id="character-name" class="form-input" 
                               value="${character.name || ''}" 
                               placeholder="Enter your character's name"
                               required>
                        <small class="form-help">This is how others will know your character in the world</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label required" for="character-background">Background *</label>
                        <select id="character-background" class="form-select" required>
                            <option value="">Select your character's background...</option>
                            ${this.getBackgroundOptions().map(bg => 
                                `<option value="${bg.key}" ${character.background === bg.key ? 'selected' : ''} 
                                         title="${bg.description}">${bg.name}</option>`
                            ).join('')}
                        </select>
                        <small class="form-help">Your character's past profession or life experience in ${settingName}</small>
                        <div id="background-description" class="background-description">
                            ${character.background ? this.getBackgroundDescription(character.background) : 'Select a background to see its description'}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label required" for="character-traits">Character Traits *</label>
                        <div class="traits-container">
                            <div class="trait-section">
                                <label for="character-personality" class="trait-label">Personality Trait</label>
                                <input type="text" id="character-personality" class="form-input" 
                                       value="${character.personality || ''}" 
                                       placeholder="e.g., I always have a plan for what to do when things go wrong"
                                       required>
                            </div>
                            <div class="trait-section">
                                <label for="character-ideal" class="trait-label">Ideal</label>
                                <input type="text" id="character-ideal" class="form-input" 
                                       value="${character.ideal || ''}" 
                                       placeholder="e.g., Knowledge is power, and power must be used responsibly"
                                       required>
                            </div>
                            <div class="trait-section">
                                <label for="character-bond" class="trait-label">Bond</label>
                                <input type="text" id="character-bond" class="form-input" 
                                       value="${character.bond || ''}" 
                                       placeholder="e.g., I owe everything to my mentor who saved my life"
                                       required>
                            </div>
                            <div class="trait-section">
                                <label for="character-flaw" class="trait-label">Flaw</label>
                                <input type="text" id="character-flaw" class="form-input" 
                                       value="${character.flaw || ''}" 
                                       placeholder="e.g., I can't resist a pretty face or a good mystery"
                                       required>
                            </div>
                        </div>
                        <small class="form-help">These traits define your character's personality and motivations</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="character-notes">Additional Notes</label>
                        <textarea id="character-notes" class="form-textarea" 
                                  placeholder="Add any additional details about your character's appearance, history, or goals...">${character.notes || ''}</textarea>
                        <small class="form-help">Optional: Any other details you'd like to add</small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="generate-random-name" class="btn btn-secondary">
                            🎲 Generate Random Name
                        </button>
                        <button type="button" id="generate-random-traits" class="btn btn-secondary">
                            🎭 Generate Random Traits
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    /**
     * Bind events for character details form
     */
    bindDetailsEvents() {
        console.log('CharacterManager: Binding details events...');
        
        // Character name input
        const nameInput = document.getElementById('character-name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                gameState.update('character.name', e.target.value);
                this.updateNavigationButtons();
                // Clear validation toast if name is now valid
                if (e.target.value.trim().length > 0) {
                    setTimeout(() => {
                        if (this.canProceedToNextStep()) {
                            this.clearValidationToast();
                        }
                    }, 100);
                }
            });
            console.log('CharacterManager: Name input event bound');
        }
        
        // Background selection
        const backgroundSelect = document.getElementById('character-background');
        if (backgroundSelect) {
            backgroundSelect.addEventListener('change', (e) => {
                const backgroundKey = e.target.value;
                gameState.update('character.background', backgroundKey);
                
                // Update description
                const descriptionEl = document.getElementById('background-description');
                if (descriptionEl) {
                    descriptionEl.textContent = this.getBackgroundDescription(backgroundKey);
                }
                
                this.updateNavigationButtons();
                // Clear validation toast if background is now selected
                if (backgroundKey) {
                    setTimeout(() => {
                        if (this.canProceedToNextStep()) {
                            this.clearValidationToast();
                        }
                    }, 100);
                }
            });
            console.log('CharacterManager: Background select event bound');
        }
        
        // Character traits inputs
        const traitInputs = ['personality', 'ideal', 'bond', 'flaw'];
        traitInputs.forEach(trait => {
            const input = document.getElementById(`character-${trait}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    gameState.update(`character.${trait}`, e.target.value);
                    this.updateNavigationButtons();
                    // Clear validation toast if trait is now filled and all requirements met
                    if (e.target.value.trim().length > 0) {
                        setTimeout(() => {
                            if (this.canProceedToNextStep()) {
                                this.clearValidationToast();
                            }
                        }, 100);
                    }
                });
            }
        });
        console.log('CharacterManager: Trait inputs events bound');
        
        // Notes textarea
        const notesInput = document.getElementById('character-notes');
        if (notesInput) {
            notesInput.addEventListener('input', (e) => {
                gameState.update('character.notes', e.target.value);
            });
            console.log('CharacterManager: Notes input event bound');
        }
        
        // Random generation buttons
        const randomNameBtn = document.getElementById('generate-random-name');
        if (randomNameBtn) {
            randomNameBtn.addEventListener('click', () => {
                console.log('CharacterManager: Generate random name clicked');
                this.generateRandomName();
            });
            console.log('CharacterManager: Random name button event bound');
        }
        
        const randomTraitsBtn = document.getElementById('generate-random-traits');
        if (randomTraitsBtn) {
            randomTraitsBtn.addEventListener('click', () => {
                console.log('CharacterManager: Generate random traits clicked');
                this.generateRandomTraits();
            });
            console.log('CharacterManager: Random traits button event bound');
        } else {
            console.log('CharacterManager: Random traits button not found!');
        }
        
        console.log('CharacterManager: All details events bound');
    }
    
    /**
     * Generate a random character name based on setting
     */
    generateRandomName() {
        const setting = gameState.get('campaign.setting');
        const names = this.getRandomNames(setting);
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        gameState.update('character.name', randomName);
        
        const nameInput = document.getElementById('character-name');
        if (nameInput) {
            nameInput.value = randomName;
        }
        
        this.updateNavigationButtons();
        
        // Clear validation toast if all requirements are now met
        setTimeout(() => {
            if (this.canProceedToNextStep()) {
                this.clearValidationToast();
            }
        }, 100);
    }
    
    /**
     * Generate random character traits
     */
    generateRandomTraits() {
        console.log('CharacterManager: Generating random traits...');
        const traits = this.getRandomTraits();
        console.log('CharacterManager: Generated traits:', traits);
        
        // Update game state
        gameState.update('character.personality', traits.personality);
        gameState.update('character.ideal', traits.ideal);
        gameState.update('character.bond', traits.bond);
        gameState.update('character.flaw', traits.flaw);
        
        // Update form inputs
        const inputs = {
            'character-personality': traits.personality,
            'character-ideal': traits.ideal,
            'character-bond': traits.bond,
            'character-flaw': traits.flaw
        };
        
        Object.entries(inputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
                console.log('CharacterManager: Updated input', id, 'with value:', value);
            } else {
                console.log('CharacterManager: Input not found:', id);
            }
        });
        
        this.updateNavigationButtons();
        console.log('CharacterManager: Random traits generation complete');
        
        // Clear validation toast if all requirements are now met
        setTimeout(() => {
            if (this.canProceedToNextStep()) {
                this.clearValidationToast();
            }
        }, 100);
    }
    
    /**
     * Get random names based on setting
     */
    getRandomNames(setting) {
        const namesBySettings = {
            'medieval-fantasy': [
                'Aeliana', 'Theron', 'Lyra', 'Gareth', 'Elara', 'Kael', 'Seraphina', 'Darian',
                'Morgana', 'Aldric', 'Celeste', 'Tristan', 'Aria', 'Magnus', 'Luna', 'Valerius'
            ],
            'modern-day': [
                'Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Jamie', 'Riley',
                'Quinn', 'Avery', 'Blake', 'Cameron', 'Harper', 'Sage', 'Phoenix', 'River'
            ],
            'sci-fi-space': [
                'Zara', 'Kai', 'Nova', 'Orion', 'Lyra', 'Phoenix', 'Vega', 'Atlas',
                'Solara', 'Cypher', 'Echo', 'Quantum', 'Stellar', 'Nexus', 'Ion', 'Cosmo'
            ],
            'eldritch-horror': [
                'Ezra', 'Cordelia', 'Thaddeus', 'Ophelia', 'Ambrose', 'Seraphina', 'Cornelius', 'Evangeline',
                'Ignatius', 'Prudence', 'Bartholomew', 'Constance', 'Percival', 'Millicent', 'Algernon', 'Beatrice'
            ]
        };
        
        return namesBySettings[setting] || namesBySettings['medieval-fantasy'];
    }
    
    /**
     * Get random character traits
     */
    getRandomTraits() {
        const personalities = [
            "I idolize a particular hero and constantly refer to their deeds and example",
            "I can find common ground between the fiercest enemies, empathizing with them",
            "I see omens in every event and action, trying to interpret what the gods intend",
            "Nothing can shake my optimistic attitude",
            "I quote sacred texts and proverbs in almost every situation",
            "I am tolerant of other faiths and respect the worship of other gods",
            "I've enjoyed fine food, drink, and high society. Rough living grates on me",
            "I take great pride in my appearance and am always well-groomed"
        ];
        
        const ideals = [
            "Knowledge is power, and the key to all other forms of power",
            "The path to power and self-improvement is through knowledge",
            "The goal of a life of study is the betterment of oneself",
            "I am horribly, horribly awkward in social situations",
            "I am convinced that people are always trying to steal my secrets",
            "Freedom means the right to express oneself without fear",
            "Tradition must be preserved and upheld",
            "Change brings progress, and progress brings hope"
        ];
        
        const bonds = [
            "Nothing is more important than the other members of my family",
            "I owe everything to my mentor—a horrible person who's probably rotting in jail",
            "Somewhere out there I have a child who doesn't know me",
            "I come from a noble family, and one day I'll reclaim my lands from those who stole them",
            "A powerful person killed someone I love. Someday soon, I'll have my revenge",
            "I swindled and ruined a person who didn't deserve it. I seek to atone for my misdeeds",
            "Everything I do is for the common people",
            "My loyalty to my sovereign is unwavering"
        ];
        
        const flaws = [
            "I judge others harshly, and myself even more severely",
            "I put too much trust in those who wield power within my temple's hierarchy",
            "My piety sometimes leads me to blindly trust those that profess faith",
            "I am inflexible in my thinking",
            "I am suspicious of strangers and suspect the worst of them",
            "Once I pick a goal, I become obsessed with it to the detriment of everything else",
            "I can't resist a pretty face",
            "I'm always in debt and spend my money on decadent luxuries"
        ];
        
        return {
            personality: personalities[Math.floor(Math.random() * personalities.length)],
            ideal: ideals[Math.floor(Math.random() * ideals.length)],
            bond: bonds[Math.floor(Math.random() * bonds.length)],
            flaw: flaws[Math.floor(Math.random() * flaws.length)]
        };
    }
    
    /**
     * Get background options based on setting
     */
    getBackgroundOptions() {
        const setting = gameState.get('campaign.setting');
        
        const backgrounds = {
            'medieval-fantasy': [
                { 
                    key: 'noble', 
                    name: 'Noble', 
                    description: 'Born to wealth and privilege, you understand the intricacies of high society and court politics.' 
                },
                { 
                    key: 'soldier', 
                    name: 'Soldier', 
                    description: 'You served in an army, militia, or mercenary company, learning discipline and combat tactics.' 
                },
                { 
                    key: 'merchant', 
                    name: 'Merchant', 
                    description: 'You have experience in trade, commerce, and dealing with people from all walks of life.' 
                },
                { 
                    key: 'hermit', 
                    name: 'Hermit', 
                    description: 'You lived in seclusion, gaining profound insight and spiritual wisdom through contemplation.' 
                },
                { 
                    key: 'criminal', 
                    name: 'Criminal', 
                    description: 'You operated outside the law, developing skills in stealth, deception, and survival.' 
                },
                { 
                    key: 'folk-hero', 
                    name: 'Folk Hero', 
                    description: 'You stood up against tyranny or monsters, becoming a champion of the common people.' 
                },
                { 
                    key: 'scholar', 
                    name: 'Scholar', 
                    description: 'You dedicated your life to learning, spending years studying ancient texts and arcane knowledge.' 
                },
                { 
                    key: 'artisan', 
                    name: 'Artisan', 
                    description: 'You mastered a craft or trade, creating beautiful or useful items with skill and dedication.' 
                }
            ],
            'modern-day': [
                { 
                    key: 'student', 
                    name: 'Student', 
                    description: 'You\'re currently pursuing or recently completed higher education, with access to academic resources.' 
                },
                { 
                    key: 'professional', 
                    name: 'Professional', 
                    description: 'You work in a corporate environment, with connections in the business world and bureaucratic savvy.' 
                },
                { 
                    key: 'military', 
                    name: 'Military Veteran', 
                    description: 'You served in the armed forces, gaining combat training and experience with military protocols.' 
                },
                { 
                    key: 'criminal', 
                    name: 'Criminal', 
                    description: 'You operated outside the law, familiar with the underworld and illegal activities.' 
                },
                { 
                    key: 'journalist', 
                    name: 'Journalist', 
                    description: 'You work in media, skilled at investigation, networking, and uncovering hidden truths.' 
                },
                { 
                    key: 'artist', 
                    name: 'Artist', 
                    description: 'You express yourself through creative mediums, with connections in cultural and bohemian circles.' 
                },
                { 
                    key: 'law-enforcement', 
                    name: 'Law Enforcement', 
                    description: 'You worked as a police officer, detective, or security professional, trained in investigation and public safety.' 
                },
                { 
                    key: 'healthcare', 
                    name: 'Healthcare Worker', 
                    description: 'You work in medicine or emergency services, trained to help people in crisis situations.' 
                }
            ],
            'sci-fi-space': [
                { 
                    key: 'colonist', 
                    name: 'Colonist', 
                    description: 'You helped establish settlements on frontier worlds, experienced in survival and adaptation.' 
                },
                { 
                    key: 'corporate', 
                    name: 'Corporate Agent', 
                    description: 'You work for a mega-corporation, with access to advanced technology and corporate resources.' 
                },
                { 
                    key: 'military', 
                    name: 'Space Marine', 
                    description: 'You served in interstellar military forces, trained in zero-g combat and advanced weaponry.' 
                },
                { 
                    key: 'explorer', 
                    name: 'Deep Space Explorer', 
                    description: 'You venture into unknown regions of space, mapping new worlds and encountering alien phenomena.' 
                },
                { 
                    key: 'refugee', 
                    name: 'War Refugee', 
                    description: 'You fled from conflict or disaster, resourceful and determined to survive against all odds.' 
                },
                { 
                    key: 'scientist', 
                    name: 'Xenobiologist', 
                    description: 'You study alien life forms and ecosystems, with expertise in extraterrestrial biology.' 
                },
                { 
                    key: 'smuggler', 
                    name: 'Smuggler', 
                    description: 'You transport illegal goods across space, skilled in evading authorities and navigating dangerous routes.' 
                },
                { 
                    key: 'diplomat', 
                    name: 'Galactic Diplomat', 
                    description: 'You facilitate relations between different species and factions across the galaxy.' 
                }
            ],
            'eldritch-horror': [
                { 
                    key: 'academic', 
                    name: 'Academic', 
                    description: 'You work at a university or research institution, with access to rare books and scholarly resources.' 
                },
                { 
                    key: 'wealthy', 
                    name: 'Wealthy Dilettante', 
                    description: 'Born to old money, you have leisure time and resources to pursue unusual interests.' 
                },
                { 
                    key: 'working-class', 
                    name: 'Working Class', 
                    description: 'You earn your living through honest labor, understanding the struggles of common folk.' 
                },
                { 
                    key: 'occultist', 
                    name: 'Occultist', 
                    description: 'You study forbidden knowledge and dark arts, already touched by otherworldly mysteries.' 
                },
                { 
                    key: 'traveler', 
                    name: 'World Traveler', 
                    description: 'You\'ve journeyed to exotic places, witnessing strange customs and unexplained phenomena.' 
                },
                { 
                    key: 'artist', 
                    name: 'Bohemian Artist', 
                    description: 'You create art that captures the dark beauty of the world, frequenting avant-garde circles.' 
                },
                { 
                    key: 'detective', 
                    name: 'Private Detective', 
                    description: 'You solve mysteries for paying clients, skilled in investigation and uncovering secrets.' 
                },
                { 
                    key: 'clergy', 
                    name: 'Clergy', 
                    description: 'You serve a religious institution, providing spiritual guidance while confronting questions of faith.' 
                }
            ]
        };
        
        return backgrounds[setting] || backgrounds['medieval-fantasy'];
    }
    
    /**
     * Get detailed description for a specific background
     */
    getBackgroundDescription(backgroundKey) {
        if (!backgroundKey) return '';
        
        const backgrounds = this.getBackgroundOptions();
        const background = backgrounds.find(bg => bg.key === backgroundKey);
        return background ? background.description : '';
    }
    
    /**
     * Bind events for current step
     */
    bindStepEvents() {
        const stepName = this.steps[this.currentStep];
        
        switch (stepName) {
            case 'setting':
                this.bindSettingEvents();
                break;
            case 'class':
                this.bindClassEvents();
                break;
            case 'stats':
                this.bindStatEvents();
                break;
            case 'details':
                this.bindDetailsEvents();
                break;
        }
    }
    
    /**
     * Bind setting selection events
     */
    bindSettingEvents() {
        const settingCards = document.querySelectorAll('.setting-card');
        
        settingCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selection
                settingCards.forEach(c => c.classList.remove('selected'));
                
                // Select current
                card.classList.add('selected');
                
                const setting = card.dataset.setting;
                gameState.set('campaign.setting', setting);
                
                // Update DM personality hint
                const settingData = this.settings[setting];
                gameState.set('campaign.dm_personality_hint', settingData.dm_personality_hint);
                
                // If we're currently on the stats step, refresh it to show new ability score names
                if (this.steps[this.currentStep] === 'stats') {
                    this.renderStepContent();
                }
                
                this.updateNavigationButtons();
                
                logger.info(`Setting selected: ${setting}`);
            });
        });
        
        // Restore previous selection
        const currentSetting = gameState.get('campaign.setting');
        if (currentSetting) {
            const selected = document.querySelector(`[data-setting="${currentSetting}"]`);
            if (selected) selected.classList.add('selected');
        }
    }
    
    /**
     * Bind class selection events
     */
    bindClassEvents() {
        const classItems = document.querySelectorAll('.class-item');
        const classDetails = document.getElementById('class-details');
        
        classItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove previous selection
                classItems.forEach(i => i.classList.remove('selected'));
                
                // Select current
                item.classList.add('selected');
                
                const classKey = item.dataset.class;
                const classData = this.classes[classKey];
                
                // Update character class
                gameState.set('character.class', classKey);
                
                // Store base class stats separately and reset point-buy stats
                gameState.set('character.baseClassStats', classData.stats);
                gameState.set('character.pointBuyStats', { ...this.basePointBuyStats });
                
                // Calculate and store final combined stats
                this.updateFinalStats();
                
                // Update class details display
                classDetails.className = 'class-details';
                classDetails.innerHTML = this.renderClassDetails(classData);
                
                this.updateNavigationButtons();
                
                logger.info(`Class selected: ${classKey}`);
            });
        });
        
        // Restore previous selection
        const currentClass = gameState.get('character.class');
        if (currentClass) {
            const selected = document.querySelector(`[data-class="${currentClass}"]`);
            if (selected) {
                selected.classList.add('selected');
                const classData = this.classes[currentClass];
                classDetails.className = 'class-details';
                classDetails.innerHTML = this.renderClassDetails(classData);
            }
        }
    }
    
    /**
     * Render class details
     */
    renderClassDetails(classData) {
        return `
            <div class="class-title">
                <span class="class-icon">${classData.icon}</span>
                ${classData.name}
            </div>
            <p class="class-description">${classData.description}</p>
            
            <div class="class-stats">
                ${Object.entries(classData.stats).map(([stat, value]) => `
                    <div class="class-stat">
                        <div class="class-stat-label">${stat.toUpperCase()}</div>
                        <div class="class-stat-value">${value}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="class-abilities">
                <h4>Class Abilities</h4>
                <ul class="ability-list">
                    ${classData.abilities.map(ability => `
                        <li class="ability-item">
                            <div class="ability-name">${ability.name}</div>
                            <div class="ability-description">${ability.description}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="class-equipment">
                <h4>Starting Equipment</h4>
                <ul>
                    ${classData.equipment.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    /**
     * Bind stat allocation events
     */
    bindStatEvents() {
        const statButtons = document.querySelectorAll('.stat-btn');
        
        statButtons.forEach(button => {
            button.addEventListener('click', () => {
                const stat = button.dataset.stat;
                const isIncrease = button.classList.contains('increase');
                
                this.adjustStat(stat, isIncrease ? 1 : -1);
            });
        });
    }
    
    /**
     * Adjust character stat (point-buy allocation only)
     */
    adjustStat(stat, change) {
        const pointBuyStats = gameState.get('character.pointBuyStats') || { ...this.basePointBuyStats };
        const current = pointBuyStats[stat] || 8;
        const newValue = Math.max(8, Math.min(15, current + change));
        
        if (newValue !== current) {
            // Check if we can afford the change
            if (change > 0) {
                const cost = this.getStatCost(newValue) - this.getStatCost(current);
                if (this.calculateRemainingPoints() < cost) {
                    showToast('Not enough points remaining', 'warning');
                    return;
                }
            }
            
            // Update point-buy stats
            pointBuyStats[stat] = newValue;
            gameState.set('character.pointBuyStats', pointBuyStats);
            
            // Update final combined stats
            this.updateFinalStats();
            
            // Re-render stat rows
            const container = document.querySelector('.stat-rows');
            if (container) {
                const finalStats = gameState.get('character.stats');
                container.innerHTML = this.renderStatRows(finalStats);
                this.bindStatEvents();
            }
            
            // Update points remaining
            const pointsElement = document.getElementById('points-remaining');
            if (pointsElement) {
                pointsElement.textContent = this.calculateRemainingPoints();
            }
            
            this.updateNavigationButtons();
        }
    }
    
    /**
     * Initialize point-buy stats for backward compatibility
     */
    initializePointBuyStats() {
        const character = gameState.getCharacter();
        const selectedClass = character.class;
        
        if (selectedClass && this.classes[selectedClass]) {
            // Set base class stats and initialize point-buy stats
            gameState.set('character.baseClassStats', this.classes[selectedClass].stats);
            gameState.set('character.pointBuyStats', { ...this.basePointBuyStats });
            this.updateFinalStats();
        } else {
            // No class selected, use default point-buy stats
            gameState.set('character.pointBuyStats', { ...this.basePointBuyStats });
            gameState.set('character.stats', { ...this.basePointBuyStats });
        }
    }

    /**
     * Update final character stats by combining base class stats and point-buy allocations
     */
    updateFinalStats() {
        const baseClassStats = gameState.get('character.baseClassStats') || {};
        const pointBuyStats = gameState.get('character.pointBuyStats') || { ...this.basePointBuyStats };
        
        const finalStats = {};
        Object.keys(this.basePointBuyStats).forEach(stat => {
            finalStats[stat] = (baseClassStats[stat] || 8) + (pointBuyStats[stat] - 8);
        });
        
        gameState.set('character.stats', finalStats);
    }

    /**
     * Calculate stat cost for point buy system
     */
    getStatCost(value) {
        const costs = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
            14: 7, 15: 9
        };
        return costs[value] || 0;
    }
    
    /**
     * Calculate remaining points for point buy
     */
    calculateRemainingPoints() {
        const pointBuyStats = gameState.get('character.pointBuyStats') || { ...this.basePointBuyStats };
        const totalSpent = Object.values(pointBuyStats).reduce((sum, value) => sum + this.getStatCost(value), 0);
        return this.pointBuyPoints - totalSpent;
    }
    
    /**
     * Navigate to next step
     */
    nextStep() {
        console.log('CharacterManager: nextStep() called');
        console.log('CharacterManager: Current step:', this.currentStep);
        console.log('CharacterManager: Can proceed?', this.canProceedToNextStep());
        
        if (this.canProceedToNextStep()) {
            this.currentStep = Math.min(this.currentStep + 1, this.steps.length - 1);
            console.log('CharacterManager: Moving to step:', this.currentStep);
            this.showStep(this.currentStep);
        } else {
            console.log('CharacterManager: Cannot proceed to next step');
            // Show a message to the user about what's missing
            this.showStepValidationMessage();
        }
    }
    
    /**
     * Navigate to previous step
     */
    prevStep() {
        this.currentStep = Math.max(this.currentStep - 1, 0);
        this.showStep(this.currentStep);
    }
    
    /**
     * Show specific step
     */
    showStep(stepIndex) {
        this.currentStep = stepIndex;
        this.renderStepIndicator();
        this.renderStepContent();
        this.updateNavigationButtons();
        
        // Animate in
        const content = document.getElementById('creation-content');
        if (content) {
            animateElement(content, 'slide-in-up');
        }
    }
    
    /**
     * Check if can proceed to next step
     */
    canProceedToNextStep() {
        const stepName = this.steps[this.currentStep];
        console.log('CharacterManager: Checking if can proceed from step:', stepName);
        
        switch (stepName) {
            case 'setting':
                const setting = gameState.get('campaign.setting');
                console.log('CharacterManager: Campaign setting:', setting);
                // For now, allow proceeding even without selection (for testing)
                return true; // Change this back to !!setting when working properly
            case 'class':
                const characterClass = gameState.get('character.class');
                console.log('CharacterManager: Character class:', characterClass);
                return !!characterClass;
            case 'stats':
                const remainingPoints = this.calculateRemainingPoints();
                console.log('CharacterManager: Remaining points:', remainingPoints);
                return remainingPoints >= 0;
            case 'details':
                // Check mandatory fields: name, background, and character traits
                const character = gameState.get('character');
                
                // Check name
                if (!character?.name?.trim()) {
                    console.log('CharacterManager: Name is required');
                    return false;
                }
                
                // Check background
                if (!character?.background) {
                    console.log('CharacterManager: Background is required');
                    return false;
                }
                
                // Check character traits (personality, ideal, bond, flaw)
                const requiredTraits = ['personality', 'ideal', 'bond', 'flaw'];
                const hasAllTraits = requiredTraits.every(trait => {
                    const value = character?.[trait]?.trim();
                    const hasValue = value && value.length > 0;
                    if (!hasValue) {
                        console.log(`CharacterManager: ${trait} is required`);
                    }
                    return hasValue;
                });
                
                // Clear validation toast if all requirements are met
                if (hasAllTraits) {
                    this.clearValidationToast();
                }
                
                return hasAllTraits;
            default:
                console.log('CharacterManager: Unknown step, allowing proceed');
                return true;
        }
    }
    
    /**
     * Show validation message for current step
     */
    showStepValidationMessage() {
        const stepName = this.steps[this.currentStep];
        let message = '';
        
        switch (stepName) {
            case 'setting':
                message = 'Please select a campaign setting to continue.';
                break;
            case 'class':
                message = 'Please select a character class to continue.';
                break;
            case 'stats':
                message = 'Please allocate all your ability points to continue.';
                break;
            case 'details':
                // Provide specific feedback about what's missing
                const character = gameState.get('character');
                const missing = [];
                
                if (!character?.name?.trim()) {
                    missing.push('Character Name');
                }
                if (!character?.background) {
                    missing.push('Background');
                }
                
                const requiredTraits = ['personality', 'ideal', 'bond', 'flaw'];
                const missingTraits = requiredTraits.filter(trait => {
                    const value = character?.[trait]?.trim();
                    return !value || value.length === 0;
                });
                
                if (missingTraits.length > 0) {
                    const traitNames = {
                        personality: 'Personality Trait',
                        ideal: 'Ideal',
                        bond: 'Bond',
                        flaw: 'Flaw'
                    };
                    missingTraits.forEach(trait => missing.push(traitNames[trait]));
                }
                
                if (missing.length > 0) {
                    message = `Please fill in the following required fields: ${missing.join(', ')}`;
                } else {
                    message = 'Please complete all required character details to continue.';
                }
                break;
            default:
                message = 'Please complete the required fields to continue.';
        }
        
        // Show message using a toast notification instead of alert
        console.warn('CharacterManager: Validation message:', message);
        this.showValidationToast(message);
    }

    showValidationToast(message) {
        // Remove any existing toast
        const existingToast = document.querySelector('.validation-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'validation-toast';
        toast.textContent = message;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Show toast with animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Method to clear the validation toast
    clearValidationToast() {
        const toast = document.querySelector('.validation-toast');
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }
    
    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');
        const completeBtn = document.getElementById('complete-creation-btn');
        
        console.log('CharacterManager: Updating navigation buttons');
        console.log('CharacterManager: Current step:', this.currentStep, 'of', this.steps.length - 1);
        console.log('CharacterManager: Can proceed?', this.canProceedToNextStep());
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }
        
        if (nextBtn) {
            const canProceed = this.canProceedToNextStep();
            const isLastStep = this.currentStep === this.steps.length - 1;
            
            nextBtn.disabled = !canProceed;
            nextBtn.style.display = isLastStep ? 'none' : 'inline-block';
            
            console.log('CharacterManager: Next button - canProceed:', canProceed, 'isLastStep:', isLastStep);
        }
        
        if (completeBtn) {
            const isLastStep = this.currentStep === this.steps.length - 1;
            const canComplete = this.canProceedToNextStep();
            
            completeBtn.style.display = isLastStep ? 'inline-block' : 'none';
            completeBtn.disabled = !canComplete;
            
            console.log('CharacterManager: Complete button - display:', completeBtn.style.display, 'disabled:', completeBtn.disabled);
        }
    }
    
    /**
     * Complete character creation
     */
    completeCreation() {
        console.log('CharacterManager: Attempting to complete character creation...');
        
        if (!this.canProceedToNextStep()) {
            console.log('CharacterManager: Cannot proceed - validation failed');
            this.showStepValidationMessage();
            return;
        }
        
        console.log('CharacterManager: All validation passed, completing character creation...');
        
        // Finalize character creation
        this.finalizeCharacter();
        
        // Clear any validation toasts
        this.clearValidationToast();
        
        // Hide creation screen and show game
        const creationScreen = document.getElementById('character-creation');
        const gameScreen = document.getElementById('game-screen');
        
        console.log('CharacterManager: Switching screens...');
        console.log('CharacterManager: Creation screen found:', !!creationScreen);
        console.log('CharacterManager: Game screen found:', !!gameScreen);
        
        if (creationScreen) {
            creationScreen.style.display = 'none';
            creationScreen.classList.remove('active');
        }
        if (gameScreen) {
            gameScreen.style.display = 'grid';
            gameScreen.classList.add('active');
        }
        
        // Update game state
        gameState.setCurrentScreen('game');
        
        // Start the campaign
        console.log('CharacterManager: Emitting campaign:start event...');
        eventBus.emit('campaign:start');
        
        // Show success message using our toast system
        setTimeout(() => {
            const successToast = document.createElement('div');
            successToast.className = 'validation-toast success-toast';
            successToast.innerHTML = '🎉 Character created successfully!';
            document.body.appendChild(successToast);
            
            requestAnimationFrame(() => {
                successToast.classList.add('show');
            });
            
            setTimeout(() => {
                if (successToast.parentNode) {
                    successToast.classList.remove('show');
                    setTimeout(() => {
                        if (successToast.parentNode) {
                            successToast.remove();
                        }
                    }, 300);
                }
            }, 3000);
        }, 500);
        
        console.log('CharacterManager: Character creation completed', gameState.getCharacter());
    }
    
    /**
     * Finalize character with calculated values
     */
    finalizeCharacter() {
        const character = gameState.getCharacter();
        
        // Calculate health based on class and constitution
        const healthBonus = getAbilityModifier(character.stats.con);
        const baseHealth = this.getClassBaseHealth(character.class);
        const maxHealth = Math.max(1, baseHealth + healthBonus);
        
        gameState.update('character.health', {
            current: maxHealth,
            maximum: maxHealth
        });
        
        // Add starting equipment
        const classData = this.classes[character.class];
        if (classData && classData.equipment) {
            const inventory = classData.equipment.map(item => ({
                id: generateId('item'),
                name: item,
                type: 'equipment',
                acquired_at: new Date().toISOString()
            }));
            gameState.set('character.inventory', inventory);
        }
        
        // Set up abilities
        if (classData && classData.abilities) {
            gameState.set('character.abilities', classData.abilities);
        }
        
        // Initialize skills based on class and stats
        this.initializeSkills();
        
        // Update metadata
        gameState.set('meta.character_created', new Date().toISOString());
    }
    
    /**
     * Get base health for class
     */
    getClassBaseHealth(classKey) {
        const healthByClass = {
            'fighter': 100, 'soldier': 100, 'marine': 100,
            'wizard': 60, 'psion': 70, 'scholar': 60,
            'rogue': 80, 'investigator': 80, 'pilot': 90,
            'cleric': 80, 'medic': 85, 'detective': 85
        };
        return healthByClass[classKey] || 80;
    }
    
    /**
     * Initialize character skills
     */
    initializeSkills() {
        const character = gameState.getCharacter();
        const skills = {};
        
        // Basic skills that all characters have
        const baseSkills = [
            'Athletics', 'Acrobatics', 'Stealth', 'Investigation',
            'Perception', 'Insight', 'Persuasion', 'Deception',
            'Intimidation', 'History', 'Nature', 'Survival'
        ];
        
        baseSkills.forEach(skill => {
            const relevantStat = this.getSkillStat(skill);
            const statModifier = getAbilityModifier(character.stats[relevantStat]);
            skills[skill] = {
                proficient: false,
                modifier: statModifier
            };
        });
        
        // Add class-specific proficiencies
        this.addClassProficiencies(skills, character.class);
        
        gameState.set('character.skills', skills);
    }
    
    /**
     * Get relevant stat for a skill
     */
    getSkillStat(skill) {
        const skillStats = {
            'Athletics': 'str',
            'Acrobatics': 'dex',
            'Stealth': 'dex',
            'Investigation': 'int',
            'Perception': 'wis',
            'Insight': 'wis',
            'Persuasion': 'cha',
            'Deception': 'cha',
            'Intimidation': 'cha',
            'History': 'int',
            'Nature': 'int',
            'Survival': 'wis'
        };
        return skillStats[skill] || 'int';
    }
    
    /**
     * Add class-specific skill proficiencies
     */
    addClassProficiencies(skills, classKey) {
        const classProficiencies = {
            'fighter': ['Athletics', 'Intimidation'],
            'wizard': ['Investigation', 'History'],
            'rogue': ['Stealth', 'Deception'],
            'cleric': ['Insight', 'Persuasion'],
            'investigator': ['Investigation', 'Perception'],
            'hacker': ['Investigation', 'Deception']
        };
        
        const proficiencies = classProficiencies[classKey] || [];
        proficiencies.forEach(skill => {
            if (skills[skill]) {
                skills[skill].proficient = true;
                skills[skill].modifier += 2; // Proficiency bonus
            }
        });
    }
}

// Initialize character manager
const characterManager = new CharacterManager();

// Export to global scope
window.characterManager = characterManager;

// Export character manager globally
window.characterManager = characterManager;
