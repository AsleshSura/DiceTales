/**
 * DiceTales - Main Application Controller
 * Central coordination of all game systems
 */

class DiceTalesApp {
    constructor() {
        this.initialized = false;
        this.currentScreen = 'loading';
        this.gameLoop = null;
        
        // Initialize systems
        this.init();
    }
    
    async init() {
        try {
            logger.info('Initializing DiceTales...');
            
            // Wait for DOM to be fully ready
            await this.waitForDOM();
            
            // Initialize all game systems
            await this.initializeSystems();
            
            // Set up application event handlers
            this.setupEventHandlers();
            
            // Check for existing game state
            const hasExistingGame = await this.checkExistingGame();
            
            logger.info('Has existing game:', hasExistingGame);
            
            // Start the appropriate flow
            if (hasExistingGame) {
                await this.loadExistingGame();
            } else {
                // Check if user wants to skip character creation with existing data
                const canSkipCreation = await this.checkCanSkipCharacterCreation();
                if (canSkipCreation) {
                    this.showCharacterSelectionScreen();
                } else {
                    this.showCharacterCreation();
                }
            }
            
            this.initialized = true;
            logger.info('DiceTales initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize DiceTales:', error);
            console.error('Initialization error details:', error);
            
            // Try to recover by forcing character creation
            try {
                logger.warn('Attempting recovery by forcing character creation...');
                this.hideLoadingScreen();
                this.showCharacterCreation();
                this.initialized = true;
            } catch (recoveryError) {
                logger.error('Recovery failed:', recoveryError);
                // Final fallback: Still try to show character creation instead of game
                try {
                    logger.warn('Final fallback: Attempting basic character creation...');
                    this.hideLoadingScreen();
                    this.showBasicCharacterCreation();
                    this.initialized = true;
                } catch (finalError) {
                    logger.error('All recovery attempts failed:', finalError);
                    // Only as last resort show game screen
                    this.forceGameStart();
                }
            }
        }
    }
    
    /**
     * Wait for DOM to be fully loaded
     */
    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    /**
     * Initialize all game systems 
     */
    async initializeSystems() {
        // Systems are already initialized via their constructors
        // We just need to ensure they're all ready
        
        logger.info('🚀 Initializing game systems...');
        
        // Give systems a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check all required systems are loaded
        const systems = [
            { name: 'gameState', instance: window.gameState || gameState, required: true },
            { name: 'characterManager', instance: window.characterManager || characterManager, required: true },
            { name: 'diceSystem', instance: window.diceSystem || diceSystem, required: true },
            { name: 'aiManager', instance: window.aiManager || aiManager, required: false },
            { name: 'audioManager', instance: window.audioManager || audioManager, required: false },
            { name: 'uiManager', instance: window.uiManager || uiManager, required: true },
            { name: 'memoryManager', instance: window.memoryManager || memoryManager, required: false },
            { name: 'characterDataManager', instance: window.characterDataManager || characterDataManager, required: false }
        ];
        
        // Verify all systems initialized properly
        systems.forEach(system => {
            const status = typeof system.instance !== 'undefined' ? 'OK' : 'MISSING';
            logger.debug(`System ${system.name}: ${status}`, system.instance);
        });
        
        const missingRequired = systems.filter(s => s.required && typeof s.instance === 'undefined');
        if (missingRequired.length > 0) {
            const missing = missingRequired.map(s => s.name).join(', ');
            logger.error('Missing required systems:', missing);
            
            // Provide helpful error info
            logger.debug('Available global objects:', Object.keys(window).filter(k => k.includes('Manager') || k.includes('System') || k.includes('State')));
            
            throw new Error(`Required systems not loaded: ${missing}. Please refresh the page.`);
        }
        
        logger.info('All required systems detected');
        
        try {
            // Wait for audio context to be ready
            if (typeof audioManager !== 'undefined' && audioManager.ensureReady) {
                await audioManager.ensureReady();
            } else {
                logger.warn('Audio manager not available or missing ensureReady method');
            }
        } catch (error) {
            logger.warn('Audio system initialization failed:', error);
            // Continue without audio
        }
        
        try {
            // Initialize AI system
            if (typeof aiManager !== 'undefined') {
                await aiManager.initialize();
            } else {
                logger.warn('AI manager not available');
            }
        } catch (error) {
            logger.warn('AI system initialization failed:', error);
            // Continue without AI (will use fallbacks)
        }
        
        try {
            // Start background music if enabled and audio is available
            const audioSettings = gameState.getSetting('audio_settings');
            if (audioSettings?.music_enabled && typeof audioManager !== 'undefined' && audioManager.initialized) {
                audioManager.startBackgroundMusic();
            }
        } catch (error) {
            logger.warn('Background music start failed:', error);
        }
        
        logger.info('All game systems initialized');
    }
    
    /**
     * Set up global event handlers
     */
    setupEventHandlers() {
        // Screen transition events
        document.addEventListener('gameStateChange', (event) => {
            this.onGameStateChange(event.detail);
        });
        
        document.addEventListener('characterCreated', (event) => {
            this.onCharacterCreated(event.detail);
        });
        
        document.addEventListener('campaignStarted', (event) => {
            this.onCampaignStarted(event.detail);
        });
        
        // EventBus listeners for inter-system communication
        eventBus.on('campaign:start', () => {
            logger.info('Campaign starting...');
            this.onCampaignStarted();
        });
        
        eventBus.on('character:created', (character) => {
            logger.info('Character created:', character);
            this.onCharacterCreated(character);
        });
        
        eventBus.on('gameState:loaded', (state) => {
            logger.info('Game state loaded:', state);
        });
        
        eventBus.on('player:action', (data) => {
            logger.info('Player action received:', data);
            // Forward player actions to AI system instead of handling locally
            if (window.aiManager && typeof window.aiManager.processPlayerAction === 'function') {
                logger.debug('🎯 Forwarding player action to AI system:', data);
                window.aiManager.processPlayerAction(data);
            } else {
                logger.warn('⚠️ AI Manager not available, falling back to local handling');
                this.handlePlayerAction(data.action);
            }
        });
        
        // Audio interaction handler
        document.addEventListener('click', () => {
            if (typeof audioManager !== 'undefined' && !audioManager.initialized) {
                audioManager.initializeFromUserInteraction();
            }
        }, { once: true });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcut(event);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
        
        window.addEventListener('unload', () => {
            this.cleanup();
        });
        
        // Error handling
        window.addEventListener('error', (event) => {
            logger.error('Global error:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            logger.error('Unhandled promise rejection:', event.reason);
        });
        
        logger.debug('Event handlers set up');
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcut(event) {
        // Don't handle shortcuts if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'Escape':
                this.showMainMenu();
                break;
            case 'i':
                if (event.ctrlKey) {
                    this.showInventory();
                    event.preventDefault();
                }
                break;
            case 'c':
                if (event.ctrlKey) {
                    this.showCharacterSheet();
                    event.preventDefault();
                }
                break;
            case 'd':
                if (event.ctrlKey) {
                    this.showDiceRoller();
                    event.preventDefault();
                }
                break;
            case 'm':
                if (event.ctrlKey) {
                    this.toggleMusic();
                    event.preventDefault();
                }
                break;
        }
    }
    
    /**
     * Check if there's an existing game to load
     */
    async checkExistingGame() {
        try {
            const savedData = gameState.loadGameState();
            
            // Check if we have valid character data AND campaign progress
            if (savedData && savedData.character && savedData.character.name && 
                savedData.campaign && (savedData.campaign.setting || savedData.campaign.story_state)) {
                logger.info('Found existing complete game data for character:', savedData.character.name);
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error('Error checking existing game:', error);
            return false;
        }
    }
    
    /**
     * Check if user has existing character data that could skip character creation
     */
    async checkCanSkipCharacterCreation() {
        try {
            // Check game state for character data
            const savedData = gameState.loadGameState();
            if (savedData && savedData.character && savedData.character.name) {
                logger.info('Found existing character in game state:', savedData.character.name);
                return true;
            }
            
            // Check localStorage for character data
            const characterData = localStorage.getItem('dicetales_character');
            if (characterData) {
                try {
                    const character = JSON.parse(characterData);
                    if (character.name) {
                        logger.info('Found existing character in localStorage:', character.name);
                        return true;
                    }
                } catch (error) {
                    logger.warn('Invalid character data in localStorage:', error);
                }
            }
            
            // Check for character data manager data
            const characterManagerData = localStorage.getItem('dicetales_character_data');
            if (characterManagerData) {
                try {
                    const characterData = JSON.parse(characterManagerData);
                    if (characterData.basic_info && characterData.basic_info.name) {
                        logger.info('Found existing character in character manager:', characterData.basic_info.name);
                        return true;
                    }
                } catch (error) {
                    logger.warn('Invalid character manager data:', error);
                }
            }
            
            return false;
        } catch (error) {
            logger.error('Error checking for existing character data:', error);
            return false;
        }
    }
    
    /**
     * Load existing game state
     */
    async loadExistingGame() {
        try {
            logger.info('Loading existing game...');
            
            const savedData = gameState.loadGameState();
            if (savedData) {
                // Load character data
                if (savedData.character) {
                    logger.info('Loading character:', savedData.character.name);
                    // Character will be loaded by the character manager
                }
                
                // Load campaign progress
                if (savedData.campaign) {
                    logger.info('Loading campaign:', savedData.campaign.setting);
                    this.showScreen('game');
                } else {
                    // Has character but no campaign - show campaign selection
                    this.showCharacterCreation();
                }
            } else {
                // Fallback to character creation
                this.showCharacterCreation();
            }
            
        } catch (error) {
            logger.error('Failed to load existing game:', error);
            this.showCharacterCreation();
        }
    }
    
    /**
     * Show character creation screen
     */
    showCharacterCreation() {
        logger.info('Showing character creation screen...');
        
        // Force hide loading screen first
        this.hideLoadingScreen();
        
        // Show the character creation screen
        this.showScreen('character-creation');
        
        // Initialize character creation system
        if (typeof characterManager !== 'undefined') {
            logger.info('Character manager found, calling showCharacterCreation...');
            characterManager.showCharacterCreation();
        } else {
            logger.warn('Character manager not available');
            // Create a basic fallback UI
            this.createBasicCharacterCreation();
        }
    }
    
    /**
     * Show character selection screen for returning users
     */
    showCharacterSelectionScreen() {
        logger.info('Showing character selection screen...');
        
        // Force hide loading screen first
        this.hideLoadingScreen();
        
        // Create character selection screen
        this.createCharacterSelectionHTML();
        
        // Show the character selection screen
        this.showScreen('character-selection');
    }
    
    /**
     * Create character selection HTML structure
     */
    createCharacterSelectionHTML() {
        // Remove existing selection screen if any
        const existingSelection = document.getElementById('character-selection');
        if (existingSelection) {
            existingSelection.remove();
        }
        
        const selectionHTML = `
            <section class="character-selection" id="character-selection">
                <div class="selection-header">
                    <h1>Welcome Back, Adventurer!</h1>
                    <p>Choose how you'd like to continue your journey</p>
                </div>
                
                <div class="selection-content">
                    <div class="existing-characters" id="existing-characters">
                        <!-- Existing characters will be populated by JS -->
                    </div>
                    
                    <div class="selection-actions">
                        <button id="continue-character-btn" class="btn btn-primary btn-large" style="display: none;">
                            Continue with Selected Character
                        </button>
                        <button id="create-new-character-btn" class="btn btn-secondary btn-large">
                            Create New Character
                        </button>
                        <button id="import-character-btn" class="btn btn-secondary btn-large">
                            Import Character
                        </button>
                    </div>
                </div>
            </section>
        `;
        
        document.querySelector('.app').insertAdjacentHTML('beforeend', selectionHTML);
        
        // Populate with existing characters
        this.populateExistingCharacters();
        
        // Bind event listeners
        this.bindCharacterSelectionEvents();
    }
    
    /**
     * Populate existing characters list
     */
    populateExistingCharacters() {
        const container = document.getElementById('existing-characters');
        if (!container) return;
        
        const characters = this.getExistingCharacters();
        
        if (characters.length === 0) {
            container.innerHTML = `
                <div class="no-characters">
                    <p>No existing characters found.</p>
                </div>
            `;
            return;
        }
        
        const charactersHTML = characters.map((character, index) => `
            <div class="character-card" data-character-index="${index}">
                <div class="character-info">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-details">
                        ${character.class ? `${character.class}` : 'Unknown Class'} • 
                        Level ${character.level || 1}
                    </p>
                    <p class="character-setting">
                        ${character.setting || 'Unknown Setting'}
                    </p>
                    ${character.lastPlayed ? `<p class="last-played">Last played: ${new Date(character.lastPlayed).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="character-actions">
                    <button class="btn btn-primary select-character-btn">Select</button>
                    <button class="btn btn-danger delete-character-btn" title="Delete Character">🗑️</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = charactersHTML;
    }
    
    /**
     * Get all existing characters from various sources
     */
    getExistingCharacters() {
        const characters = [];
        
        try {
            // Check game state
            const savedData = gameState.loadGameState();
            if (savedData && savedData.character && savedData.character.name) {
                characters.push({
                    name: savedData.character.name,
                    class: savedData.character.class,
                    level: savedData.character.level,
                    setting: savedData.campaign?.setting,
                    lastPlayed: savedData.meta?.last_played,
                    source: 'gameState',
                    data: savedData.character
                });
            }
            
            // Check localStorage character data
            const characterData = localStorage.getItem('dicetales_character');
            if (characterData) {
                try {
                    const character = JSON.parse(characterData);
                    if (character.name && !characters.find(c => c.name === character.name)) {
                        characters.push({
                            name: character.name,
                            class: character.class,
                            level: character.level,
                            setting: character.setting,
                            lastPlayed: character.lastPlayed,
                            source: 'localStorage',
                            data: character
                        });
                    }
                } catch (error) {
                    logger.warn('Invalid character data in localStorage:', error);
                }
            }
            
            // Check character data manager
            const characterManagerData = localStorage.getItem('dicetales_character_data');
            if (characterManagerData) {
                try {
                    const characterData = JSON.parse(characterManagerData);
                    if (characterData.basic_info && characterData.basic_info.name) {
                        const name = characterData.basic_info.name;
                        if (!characters.find(c => c.name === name)) {
                            characters.push({
                                name: name,
                                class: characterData.basic_info.character_class,
                                level: characterData.basic_info.level,
                                setting: characterData.basic_info.setting,
                                lastPlayed: characterData.metadata?.last_updated,
                                source: 'characterManager',
                                data: characterData
                            });
                        }
                    }
                } catch (error) {
                    logger.warn('Invalid character manager data:', error);
                }
            }
            
        } catch (error) {
            logger.error('Error getting existing characters:', error);
        }
        
        return characters;
    }
    
    /**
     * Bind character selection event listeners
     */
    bindCharacterSelectionEvents() {
        // Create new character button
        const createNewBtn = document.getElementById('create-new-character-btn');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                this.showCharacterCreation();
                // Clear existing data for new character
                if (typeof characterManager !== 'undefined') {
                    characterManager.showCharacterCreation(true);
                }
            });
        }
        
        // Import character button
        const importBtn = document.getElementById('import-character-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                if (typeof uiManager !== 'undefined') {
                    uiManager.openImportExportModal();
                } else {
                    logger.warn('UI Manager not available for import');
                    this.showCharacterCreation();
                }
            });
        }
        
        // Character selection
        const container = document.getElementById('existing-characters');
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('select-character-btn')) {
                    const card = e.target.closest('.character-card');
                    const index = parseInt(card.dataset.characterIndex);
                    this.selectExistingCharacter(index);
                } else if (e.target.classList.contains('delete-character-btn')) {
                    const card = e.target.closest('.character-card');
                    const index = parseInt(card.dataset.characterIndex);
                    this.deleteExistingCharacter(index);
                }
            });
        }
    }
    
    /**
     * Select an existing character
     */
    selectExistingCharacter(index) {
        const characters = this.getExistingCharacters();
        const character = characters[index];
        
        if (!character) {
            logger.error('Character not found at index:', index);
            return;
        }
        
        logger.info('Loading existing character:', character.name);
        
        try {
            // Load character data into game state
            if (character.source === 'gameState') {
                // Already in game state, check if we have campaign data
                const savedData = gameState.loadGameState();
                if (savedData.campaign && savedData.campaign.setting) {
                    // Complete game data, go to game
                    this.showScreen('game');
                } else {
                    // Character but no campaign, continue character creation at campaign step
                    this.showCharacterCreation();
                    if (typeof characterManager !== 'undefined') {
                        characterManager.currentStep = 0; // Start at setting selection
                    }
                }
            } else {
                // Load from other sources into game state
                this.loadCharacterIntoGameState(character);
                // Continue to campaign selection
                this.showCharacterCreation();
                if (typeof characterManager !== 'undefined') {
                    characterManager.currentStep = 0; // Start at setting selection
                }
            }
            
        } catch (error) {
            logger.error('Error loading character:', error);
            this.showCharacterCreation();
        }
    }
    
    /**
     * Load character data into game state
     */
    loadCharacterIntoGameState(character) {
        try {
            const characterData = character.data;
            
            // Map different data formats to game state format
            if (character.source === 'characterManager') {
                // Character manager format
                gameState.set('character.name', characterData.basic_info.name);
                gameState.set('character.class', characterData.basic_info.character_class);
                gameState.set('character.level', characterData.basic_info.level || 1);
                gameState.set('character.background', characterData.basic_info.background || '');
                
                if (characterData.stats) {
                    Object.keys(characterData.stats).forEach(stat => {
                        gameState.set(`character.stats.${stat}`, characterData.stats[stat]);
                    });
                }
                
                if (characterData.basic_info.setting) {
                    gameState.set('campaign.setting', characterData.basic_info.setting);
                }
                
            } else {
                // Standard format
                gameState.set('character.name', characterData.name);
                gameState.set('character.class', characterData.class);
                gameState.set('character.level', characterData.level || 1);
                gameState.set('character.background', characterData.background || '');
                
                if (characterData.stats) {
                    Object.keys(characterData.stats).forEach(stat => {
                        gameState.set(`character.stats.${stat}`, characterData.stats[stat]);
                    });
                }
                
                if (characterData.setting) {
                    gameState.set('campaign.setting', characterData.setting);
                }
            }
            
            logger.info('Character loaded into game state successfully');
            
        } catch (error) {
            logger.error('Error loading character into game state:', error);
            throw error;
        }
    }
    
    /**
     * Delete an existing character
     */
    deleteExistingCharacter(index) {
        const characters = this.getExistingCharacters();
        const character = characters[index];
        
        if (!character) return;
        
        if (confirm(`Are you sure you want to delete "${character.name}"? This action cannot be undone.`)) {
            try {
                if (character.source === 'gameState') {
                    // Clear game state
                    gameState.reset();
                } else if (character.source === 'localStorage') {
                    localStorage.removeItem('dicetales_character');
                } else if (character.source === 'characterManager') {
                    localStorage.removeItem('dicetales_character_data');
                }
                
                // Refresh the character list
                this.populateExistingCharacters();
                
                logger.info('Character deleted:', character.name);
                
            } catch (error) {
                logger.error('Error deleting character:', error);
            }
        }
    }

    /**
     * Force hide the loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('active');
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            logger.info('Loading screen forcibly hidden');
        }
    }
    
    /**
     * Show basic character creation fallback when managers fail
     */
    showBasicCharacterCreation() {
        logger.warn('Showing basic character creation fallback...');
        
        // Force hide loading screen
        this.hideLoadingScreen();
        
        // Show the character creation screen
        this.showScreen('character-creation');
        
        // Create basic fallback content
        this.createBasicCharacterCreation();
        
        logger.info('Basic character creation displayed');
    }
    
    /**
     * Create basic character creation fallback
     */
    createBasicCharacterCreation() {
        const container = document.getElementById('character-creation-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="character-creation-fallback">
                <h2>Create Your Character</h2>
                <form id="basic-character-form">
                    <div class="form-group">
                        <label for="character-name">Character Name:</label>
                        <input type="text" id="character-name" required>
                    </div>
                    <div class="form-group">
                        <label for="character-class">Class:</label>
                        <select id="character-class" required>
                            <option value="fighter">Fighter</option>
                            <option value="wizard">Wizard</option>
                            <option value="rogue">Rogue</option>
                            <option value="cleric">Cleric</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="campaign-setting">Campaign Setting:</label>
                        <select id="campaign-setting" required>
                            <option value="medieval-fantasy">Medieval Fantasy</option>
                            <option value="space-opera">Space Opera</option>
                            <option value="modern-mystery">Modern Mystery</option>
                            <option value="post-apocalyptic">Post-Apocalyptic</option>
                        </select>
                    </div>
                    <button type="button" onclick="app.startTestCharacter()">Start Adventure</button>
                </form>
            </div>
        `;
    }
    
    /**
     * Start with test character (fallback)
     */
    startTestCharacter() {
        const form = document.getElementById('basic-character-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const character = {
            name: formData.get('character-name') || 'Hero',
            class: formData.get('character-class') || 'fighter',
            level: 1,
            stats: {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10
            }
        };
        
        const campaign = {
            setting: formData.get('campaign-setting') || 'medieval-fantasy',
            name: 'New Adventure'
        };
        
        this.onCharacterCreated({ character, campaign });
    }
    
    /**
     * Event handler for game state changes
     */
    onGameStateLoaded(data) {
        logger.info('Game state loaded:', data);
        
        if (data.character) {
            this.currentCharacter = data.character;
        }
        
        if (data.campaign) {
            this.currentCampaign = data.campaign;
        }
    }
    
    /**
     * Event handler for character updates
     */
    onCharacterUpdated(character) {
        logger.info('Character updated:', character);
        this.currentCharacter = character;
        gameState.setCharacter(character);
    }
    
    /**
     * Event handler for character creation completion
     */
    onCharacterCreated(character) {
        logger.info('Character created:', character);
        this.startNewCampaign(character);
    }
    
    /**
     * Start a new campaign with the created character
     */
    async startNewCampaign(character) {
        try {
            logger.info('Starting new campaign for character:', character.name);
            
            this.currentCharacter = character;
            gameState.setCharacter(character);
            
            // Transition to game screen
            this.showScreen('game');
            
            // Initialize the campaign
            if (typeof aiManager !== 'undefined') {
                await aiManager.startCampaign(character);
            } else {
                logger.warn('AI manager not available, starting basic campaign');
                this.startBasicCampaign(character);
            }
            
        } catch (error) {
            logger.error('Failed to start campaign:', error);
            this.showError('Failed to start campaign. Please try again.');
        }
    }
    
    /**
     * Start basic campaign (fallback)
     */
    startBasicCampaign(character) {
        const gameContent = document.getElementById('game-content');
        if (gameContent) {
            gameContent.innerHTML = `
                <div class="campaign-start">
                    <h2>Welcome, ${character.name}!</h2>
                    <p>Your adventure begins...</p>
                    <p>Campaign Setting: ${character.campaign || 'Medieval Fantasy'}</p>
                    <div class="story-text">
                        <p>You find yourself at the entrance of a mysterious tavern. The wooden sign creaks in the wind, and warm light spills from the windows. What would you like to do?</p>
                    </div>
                    <div class="action-buttons">
                        <button onclick="app.takeAction('enter_tavern')">Enter the Tavern</button>
                        <button onclick="app.takeAction('look_around')">Look Around</button>
                        <button onclick="app.takeAction('roll_dice')">Roll Dice</button>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Handle player actions from the input system
     */
    handlePlayerAction(action) {
        logger.info('Handling player action:', action);
        
        // Display the player's action in the story
        this.displayStoryContent({
            content: `> ${action}`,
            type: 'player-action'
        });
        
        // Generate AI response or handle specific commands
        this.processPlayerAction(action);
    }
    
    /**
     * Process player action and generate appropriate response
     */
    processPlayerAction(action) {
        const lowercaseAction = action.toLowerCase();
        
        // Check for common commands
        if (lowercaseAction.includes('look') || lowercaseAction.includes('examine')) {
            this.handleLookAction(action);
        } else if (lowercaseAction.includes('go') || lowercaseAction.includes('move') || lowercaseAction.includes('walk')) {
            this.handleMovementAction(action);
        } else if (lowercaseAction.includes('talk') || lowercaseAction.includes('speak') || lowercaseAction.includes('say')) {
            this.handleSocialAction(action);
        } else if (lowercaseAction.includes('attack') || lowercaseAction.includes('fight') || lowercaseAction.includes('combat')) {
            this.handleCombatAction(action);
        } else if (lowercaseAction.includes('inventory') || lowercaseAction.includes('items')) {
            this.handleInventoryAction(action);
        } else {
            // General action - generate contextual response
            this.generateContextualResponse(action);
        }
    }
    
    /**
     * Handle look/examine actions
     */
    handleLookAction(action) {
        const character = gameState.getCharacter();
        const setting = character?.setting || 'medieval-fantasy';
        
        let response = '';
        switch (setting) {
            case 'medieval-fantasy':
                response = `You carefully examine your surroundings. The mystical forest around you is alive with ancient magic. Shafts of golden sunlight pierce through the canopy above, illuminating patches of colorful wildflowers. You notice strange runes carved into some of the tree trunks, glowing faintly with ethereal light.`;
                break;
            case 'sci-fi-space':
                response = `Your sensors scan the area, revealing intricate details about your environment. The space station's corridors are lined with advanced technology, holographic displays flickering with data streams. Emergency lighting casts an eerie blue glow, and you can hear the faint hum of life support systems in the distance.`;
                break;
            case 'modern-day':
                response = `You take a moment to observe your urban surroundings. The city street bustles with activity even at this late hour. Neon signs reflect off wet pavement, and you notice several interesting details: a suspicious figure in a dark alley, unusual graffiti on the wall, and what appears to be an unmarked van parked nearby.`;
                break;
            case 'eldritch-horror':
                response = `Your eyes strain against the perpetual fog as you try to make sense of your surroundings. The architecture of Millhaven seems to shift and writhe when you're not looking directly at it. Shadows move independently of their sources, and you swear you can hear whispers in a language that predates human civilization.`;
                break;
            default:
                response = `You take a careful look around, noticing details that might be important for your adventure.`;
        }
        
        this.displayStoryContent({
            content: response,
            type: 'narrative'
        });
    }
    
    /**
     * Handle movement actions
     */
    handleMovementAction(action) {
        const responses = [
            "You move forward cautiously, your footsteps echoing in the quiet air. New opportunities and dangers await ahead.",
            "You change your position, gaining a different perspective on the situation. The environment around you shifts as you move.",
            "You navigate through the area, your movement revealing new paths and possibilities.",
            "With determined steps, you advance further into the unknown, ready for whatever lies ahead."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.displayStoryContent({
            content: randomResponse,
            type: 'narrative'
        });
    }
    
    /**
     * Handle social actions
     */
    handleSocialAction(action) {
        this.displayStoryContent({
            content: "Your words echo in the air. While there may not be anyone immediately present to respond, your voice carries weight in this world. Perhaps your words will attract attention, or maybe they'll be remembered by unseen ears.",
            type: 'narrative'
        });
    }
    
    /**
     * Handle combat actions
     */
    handleCombatAction(action) {
        this.displayStoryContent({
            content: "You ready yourself for combat, adrenaline coursing through your veins. Your training kicks in as you assess potential threats and prepare to defend yourself. Roll for initiative!",
            type: 'narrative'
        });
        
        // Trigger a dice roll for combat
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 20) + 1;
            this.displayStoryContent({
                content: `Initiative Roll: ${roll}`,
                type: 'dice-result'
            });
        }, 1000);
    }
    
    /**
     * Handle inventory actions
     */
    handleInventoryAction(action) {
        const character = gameState.getCharacter();
        const inventory = character?.inventory || [];
        
        if (inventory.length === 0) {
            this.displayStoryContent({
                content: "You check your belongings. Your inventory is currently empty, save for the basic adventuring gear you started with. Perhaps you'll find useful items on your journey.",
                type: 'narrative'
            });
        } else {
            const itemList = inventory.map(item => `• ${item.name}`).join('\n');
            this.displayStoryContent({
                content: `You examine your belongings:\n\n${itemList}`,
                type: 'narrative'
            });
        }
    }
    
    /**
     * Generate contextual response for general actions
     */
    generateContextualResponse(action) {
        const responses = [
            `You attempt to ${action.toLowerCase()}. The world around you responds to your actions, creating new possibilities and challenges.`,
            `With determination, you ${action.toLowerCase()}. Your choice shapes the narrative of your adventure.`,
            `You decide to ${action.toLowerCase()}. The consequences of your actions will unfold as your story continues.`,
            `Acting on your instincts, you ${action.toLowerCase()}. The world takes note of your decision.`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.displayStoryContent({
            content: randomResponse,
            type: 'narrative'
        });
        
        // Occasionally suggest a dice roll
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.displayStoryContent({
                    content: "This action might require a skill check. Consider rolling the dice to determine the outcome!",
                    type: 'suggestion'
                });
            }, 1500);
        }
    }
    
    /**
     * Handle player actions
     */
    takeAction(action) {
        logger.info('Player action:', action);
        
        switch (action) {
            case 'enter_tavern':
                this.updateStory('You push open the heavy wooden door and step inside. The tavern is warm and inviting, filled with the sounds of conversation and clinking mugs.');
                break;
            case 'look_around':
                this.updateStory('You take a moment to survey your surroundings. The tavern sits at a crossroads, with paths leading in four directions. A weathered signpost points to various destinations.');
                break;
            case 'roll_dice':
                if (typeof diceManager !== 'undefined') {
                    diceManager.rollDice('1d20', 'Perception Check');
                } else {
                    const roll = Math.floor(Math.random() * 20) + 1;
                    this.updateStory(`You rolled a ${roll}! ${roll > 10 ? 'Success!' : 'Not quite...'}`);
                }
                break;
        }
    }
    
    /**
     * Update the story display
     */
    updateStory(text) {
        const storyElement = document.querySelector('.story-text p');
        if (storyElement) {
            storyElement.textContent = text;
        }
    }
    
    /**
     * Event handler for campaign start
     */
    onCampaignStarted(campaignData) {
        logger.info('Campaign started:', campaignData);
        this.currentCampaign = campaignData;
        gameState.setCampaign(campaignData);
        
        // Initialize the game screen
        this.initializeScreen('game');
        
        // Make sure we're showing the game screen
        this.showScreen('game');
        
        // Start the initial story
        this.startInitialStory();
    }
    
    /**
     * Start the initial story for the campaign
     */
    startInitialStory() {
        logger.info('Starting initial story...');
        
        // Get character and campaign info
        const character = gameState.getCharacter();
        const campaign = gameState.getCampaign();
        
        if (!character || !campaign) {
            logger.error('Cannot start story: missing character or campaign data');
            return;
        }
        
        // Update character name in UI
        const characterNameEl = document.getElementById('character-name');
        if (characterNameEl) {
            characterNameEl.textContent = character.name || 'Hero';
        }
        
        // Update character stats display
        this.updateCharacterStatus();
        
        // Generate initial story based on character and setting
        const storyPrompt = this.generateInitialStoryPrompt(character, campaign);
        
        // Display initial story
        this.displayStoryContent({
            content: storyPrompt,
            type: 'intro'
        });
        
        logger.info('Initial story started');
    }
    
    /**
     * Generate initial story prompt based on character and campaign
     */
    generateInitialStoryPrompt(character, campaign) {
        const setting = campaign.setting || character.setting;
        const characterClass = character.class?.name || 'Adventurer';
        const characterName = character.name || 'Hero';
        
        let storyIntro = '';
        
        switch (setting) {
            case 'medieval-fantasy':
                storyIntro = `Welcome to the realm of ${characterName} the ${characterClass}! 
                
You find yourself standing at the edge of a mystical forest, the morning mist swirling around ancient oak trees. Your ${character.background || 'adventurous'} background has prepared you for this moment. 

The path ahead splits in three directions:
- A well-worn trail leading deeper into the forest
- A rocky path climbing toward distant mountains
- A narrow bridge spanning a rushing river

What do you choose to do?`;
                break;
                
            case 'sci-fi-space':
                storyIntro = `Commander ${characterName}, your ship's sensors have detected an anomaly...
                
You're aboard the starship Horizon, drifting in the void between star systems. As a ${characterClass}, your expertise is crucial for what lies ahead. Your ${character.background || 'stellar'} background has trained you for moments like this.

The anomaly appears to be:
- An abandoned space station sending distress signals
- A mysterious energy signature from an unexplored nebula
- Strange readings from a nearby asteroid field

What are your orders?`;
                break;
                
            case 'modern-day':
                storyIntro = `${characterName}, the city never sleeps, and neither do its mysteries...
                
You're standing in the heart of downtown, neon lights reflecting off wet pavement. Your skills as a ${characterClass} and your ${character.background || 'urban'} background have brought you to this pivotal moment.

Something's not right tonight:
- Reports of strange disappearances in the warehouse district
- Unusual electromagnetic readings from the old subway tunnels
- A mysterious figure who's been asking questions about you

How do you proceed?`;
                break;
                
            case 'eldritch-horror':
                storyIntro = `The town of ${characterName} holds secrets that should never be uncovered...
                
You've arrived in the fog-shrouded town of Millhaven, drawn by rumors and your ${character.background || 'curious'} nature. As a ${characterClass}, you sense something ancient and wrong lurking beneath the surface.

The locals whisper of:
- Strange lights emanating from the abandoned mansion on the hill
- Bizarre dreams plaguing the townspeople
- Old books in the library that seem to write themselves

What draws your attention first?`;
                break;
                
            default:
                storyIntro = `Your adventure begins now, ${characterName}...
                
As a ${characterClass} with a ${character.background || 'mysterious'} past, you stand at the threshold of an epic tale. The world awaits your choices.

What do you do?`;
        }
        
        return storyIntro;
    }
    
    /**
     * Display story content in the game screen
     */
    displayStoryContent(story) {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const storyElement = document.createElement('div');
        storyElement.className = `story-entry ${story.type || 'narrative'}`;
        storyElement.innerHTML = `
            <div class="story-text">${story.content.replace(/\n/g, '<br>')}</div>
            <div class="story-timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        
        storyContent.appendChild(storyElement);
        storyContent.scrollTop = storyContent.scrollHeight;
    }
    
    /**
     * Update character status panel
     */
    updateCharacterStatus() {
        const character = gameState.getCharacter();
        if (!character) return;
        
        // Update character name
        const nameEl = document.getElementById('character-name');
        if (nameEl) nameEl.textContent = character.name || 'Hero';
        
        // Update health
        const healthText = document.getElementById('health-text');
        const healthFill = document.getElementById('health-bar-fill');
        if (healthText && healthFill) {
            const currentHealth = character.health || character.maxHealth || 100;
            const maxHealth = character.maxHealth || 100;
            healthText.textContent = `${currentHealth}/${maxHealth}`;
            healthFill.style.width = `${(currentHealth / maxHealth) * 100}%`;
        }
        
        // Update stats summary
        const statsSummary = document.getElementById('stats-summary');
        if (statsSummary && character.stats) {
            const getModifier = (score) => Math.floor((score - 10) / 2);
            statsSummary.innerHTML = `
                <div class="stat-item">
                    <span class="stat-name">STR</span>
                    <span class="stat-value">${character.stats.str || 10} (${getModifier(character.stats.str || 10) >= 0 ? '+' : ''}${getModifier(character.stats.str || 10)})</span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">DEX</span>
                    <span class="stat-value">${character.stats.dex || 10} (${getModifier(character.stats.dex || 10) >= 0 ? '+' : ''}${getModifier(character.stats.dex || 10)})</span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">CON</span>
                    <span class="stat-value">${character.stats.con || 10} (${getModifier(character.stats.con || 10) >= 0 ? '+' : ''}${getModifier(character.stats.con || 10)})</span>
                </div>
            `;
        }
    }
    
    /**
     * Event handler for game state changes
     */
    onGameStateChange(state) {
        logger.info('Game state changed:', state);
        
        switch (state.type) {
            case 'screen_change':
                this.currentScreen = state.screen;
                break;
            case 'character_update':
                this.onCharacterUpdated(state.character);
                break;
            case 'campaign_update':
                this.onCampaignStarted(state.campaign);
                break;
        }
    }
    
    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        logger.info('Switching to screen:', screenName);
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('active');
        }
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.display = 'none';
            screen.classList.remove('active');
        });
        
        // Show target screen
        let targetScreen = null;
        switch (screenName) {
            case 'game':
                targetScreen = document.getElementById('game-screen');
                if (targetScreen) {
                    targetScreen.style.display = 'grid';
                    targetScreen.classList.add('active');
                }
                break;
            case 'character-creation':
                targetScreen = document.getElementById('character-creation');
                if (targetScreen) {
                    targetScreen.style.display = 'flex';
                    targetScreen.classList.add('active');
                }
                break;
            case 'campaign-selection':
                targetScreen = document.getElementById('campaign-selection');
                if (targetScreen) {
                    targetScreen.style.display = 'flex';
                    targetScreen.classList.add('active');
                }
                break;
            default:
                targetScreen = document.getElementById(screenName);
                if (targetScreen) {
                    targetScreen.style.display = 'block';
                    targetScreen.classList.add('active');
                }
        }
        
        if (targetScreen) {
            this.currentScreen = screenName;
            // Trigger screen-specific initialization
            this.initializeScreen(screenName);
        } else {
            logger.error('Screen not found:', screenName);
        }
    }
    
    /**
     * Initialize screen-specific functionality
     */
    initializeScreen(screenName) {
        switch (screenName) {
            case 'character-creation':
                // Character creation screen is ready
                break;
            case 'game':
                // Initialize game UI
                if (typeof uiManager !== 'undefined') {
                    uiManager.initializeGameScreen();
                }
                break;
        }
    }
    
    /**
     * Show main menu
     */
    showMainMenu() {
        this.showScreen('main-menu');
    }
    
    /**
     * Show inventory
     */
    showInventory() {
        logger.info('Showing inventory');
        // Implementation depends on inventory system
    }
    
    /**
     * Show character sheet
     */
    showCharacterSheet() {
        logger.info('Showing character sheet');
        // Implementation depends on character system
    }
    
    /**
     * Show dice roller
     */
    showDiceRoller() {
        logger.info('Showing dice roller');
        if (typeof diceManager !== 'undefined') {
            diceManager.showRoller();
        }
    }
    
    /**
     * Toggle music on/off
     */
    toggleMusic() {
        if (typeof audioManager !== 'undefined') {
            audioManager.toggleMusic();
        }
    }
    
    /**
     * Force start the game if all else fails
     */
    forceGameStart() {
        logger.error('🚨 FORCE STARTING GAME - All initialization failed');
        
        try {
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Show game screen directly
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.style.display = 'flex';
                gameScreen.classList.add('active');
                
                // Add a starting story
                const storyContent = document.getElementById('story-content');
                if (storyContent) {
                    storyContent.innerHTML = `
                        <div class="story-entry dm-response">
                            <div class="entry-content">
                                Welcome, brave adventurer! Your epic tale begins now in a world of mystery and magic. 
                                Though the ancient systems are still awakening, your adventure calls to you. 
                                
                                You find yourself at the entrance to a grand adventure, with paths unknown stretching before you. 
                                The very air hums with possibility and the promise of tales yet to be told.
                                
                                What do you choose to do first?
                            </div>
                        </div>
                    `;
                }
                
                // Action buttons removed - players now type their actions directly
                logger.debug('🎯 Action buttons disabled - players type actions in text area');
                
                this.currentScreen = 'game';
                this.initialized = true;
                
                logger.info('🚨 FORCE START COMPLETE - Game should be playable now');
            }
        } catch (error) {
            console.error('🚨 FORCE START FAILED:', error);
            // Last resort - show error message
            document.body.innerHTML = `
                <div style="padding: 20px; text-align: center; color: white; background: #1a1a1a; min-height: 100vh;">
                    <h1>DiceTales</h1>
                    <p>The adventure is temporarily unavailable.</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; margin: 10px;">Reload Game</button>
                    <br><br>
                    <a href="quick-start.html" style="color: #4CAF50;">Try Quick Start Version</a>
                </div>
            `;
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        logger.error('App error:', message);
        
        // Create error overlay
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';
        errorOverlay.innerHTML = `
            <div class="error-dialog">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
    }
    
    /**
     * Save current game state
     */
    saveGameState() {
        try {
            gameState.saveGameState();
            logger.debug('Game state saved');
        } catch (error) {
            logger.error('Failed to save game state:', error);
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        try {
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            
            if (typeof audioManager !== 'undefined') {
                audioManager.cleanup();
            }
            
            logger.info('App cleanup completed');
        } catch (error) {
            logger.error('Error during cleanup:', error);
        }
    }
}

// Make DiceTalesApp available globally
window.DiceTalesApp = DiceTalesApp;

// Initialize the application
let app;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new DiceTalesApp();
        window.app = app; // Make globally available immediately after creation
    });
} else {
    app = new DiceTalesApp();
    window.app = app; // Make globally available immediately after creation
}
