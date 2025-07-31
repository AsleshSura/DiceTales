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
            
            // Configure Python environment first for any backend needs
            await this.configurePythonEnvironment();
            
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
                this.showCharacterCreation();
            }
            
            this.initialized = true;
            logger.info('DiceTales initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize DiceTales:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }
    
    /**
     * Configure Python environment for any backend functionality
     */
    async configurePythonEnvironment() {
        try {
            // This is mainly for development/debugging purposes
            // The actual game runs purely in the browser
            logger.debug('Python environment configuration skipped - browser-only game');
        } catch (error) {
            logger.warn('Python environment configuration failed:', error);
            // Continue anyway since we don't need Python for the game
        }
    }
    
    /**
     * Initialize all game systems
     */
    async initializeSystems() {
        // Systems are already initialized via their constructors
        // We just need to ensure they're all ready
        
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
            
            // Check if we have valid character data
            if (savedData && savedData.character && savedData.character.name) {
                logger.info('Found existing game data for character:', savedData.character.name);
                return true;
            }
            
            // Check if we have a character in progress
            const characterData = localStorage.getItem('dicetales_character');
            if (characterData) {
                try {
                    const character = JSON.parse(characterData);
                    if (character.name) {
                        logger.info('Found existing character:', character.name);
                        return true;
                    }
                } catch (error) {
                    logger.warn('Invalid character data in localStorage:', error);
                }
            }
            
            return false;
        } catch (error) {
            logger.error('Error checking existing game:', error);
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
     * Debug character creation process
     */
    debugCharacterCreation() {
        logger.info('=== CHARACTER CREATION DEBUG ===');
        logger.info('Character manager available:', typeof characterManager !== 'undefined');
        logger.info('UI manager available:', typeof uiManager !== 'undefined');
        logger.info('Game state available:', typeof gameState !== 'undefined');
        logger.info('AI manager available:', typeof aiManager !== 'undefined');
        
        if (typeof characterManager !== 'undefined') {
            logger.info('Character manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(characterManager)));
        }
        
        const characterScreen = document.getElementById('character-creation');
        logger.info('Character creation screen element:', characterScreen ? 'found' : 'not found');
        
        if (characterScreen) {
            logger.info('Character screen visibility:', window.getComputedStyle(characterScreen).display);
        }
        
        logger.info('=== END DEBUG ===');
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
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.style.display = 'block';
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
                this.debugCharacterCreation();
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

// Initialize the application
let app;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new DiceTalesApp();
    });
} else {
    app = new DiceTalesApp();
}

// Make app globally available for debugging
window.app = app;
