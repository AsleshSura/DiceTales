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
            // Continue without music
        }
        
        logger.debug('All systems initialized');
    }
    
    /**
     * Set up global event handlers
     */
    setupEventHandlers() {
        // Game state events
        eventBus.on('gameState:loaded', (data) => {
            this.onGameStateLoaded(data);
        });
        
        // Character events
        eventBus.on('character:created', (character) => {
            this.onCharacterCreated(character);
        });
        
        eventBus.on('character:updated', (character) => {
            this.onCharacterUpdated(character);
        });
        
        // Player action events
        eventBus.on('player:action', (data) => {
            this.handlePlayerAction(data.action);
        });
        
        // Dice events
        eventBus.on('dice:rolled', (data) => {
            this.onDiceRolled(data);
        });
        
        // AI events  
        eventBus.on('ai:response', (data) => {
            this.onAIResponse(data);
        });
        
        eventBus.on('ai:error', (error) => {
            this.onAIError(error);
        });
        
        // Audio events
        eventBus.on('ui:buttonClick', () => {
            if (typeof audioManager !== 'undefined' && audioManager.playSFX) {
                audioManager.playSFX('click');
            }
        });
        
        // Error handling
        window.addEventListener('error', (event) => {
            logger.error('Global error:', event.error);
            this.handleError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            logger.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
        
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    /**
     * Check if there's an existing game to load
     */
    async checkExistingGame() {
        try {
            const gameData = gameState.load();
            logger.info('Checking existing game data:', gameData);
            
            // Only consider it an existing game if we have a complete character with a campaign
            const hasCompleteCharacter = gameData && 
                                       gameData.character && 
                                       gameData.character.name && 
                                       gameData.character.class;
                                       
            const hasCampaign = gameData && 
                              gameData.campaign && 
                              gameData.campaign.conversation_history;
            
            const isExistingGame = hasCompleteCharacter && hasCampaign;
            
            logger.info('Has complete character:', hasCompleteCharacter);
            logger.info('Has campaign:', hasCampaign);
            logger.info('Is existing game:', isExistingGame);
            
            return isExistingGame;
        } catch (error) {
            logger.warn('Error checking existing game:', error);
            return false;
        }
    }
    
    /**
     * Load existing game
     */
    async loadExistingGame() {
        try {
            logger.info('Loading existing game...');
            
            const gameData = gameState.load();
            if (!gameData) {
                throw new Error('No game data found');
            }
            
            // Restore AI conversation context
            if (gameData.campaign && gameData.campaign.conversation_history) {
                aiManager.restoreConversation(gameData.campaign.conversation_history);
            }
            
            // Update UI with character data
            uiManager.updateCharacterDisplay();
            
            // Show main game screen
            this.showScreen('game');
            
            // Add welcome back message
            this.addStoryEntry({
                type: 'system',
                content: `Welcome back, ${gameData.character.name}! Your adventure continues...`
            });
            
            logger.info('Existing game loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load existing game:', error);
            showToast('Failed to load saved game. Starting new game.', 'warning');
            this.showCharacterCreation();
        }
    }
    
    /**
     * Show character creation screen
     */
    showCharacterCreation() {
        logger.info('Starting character creation...');
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
        logger.info('Creating basic character creation fallback...');
        const container = document.getElementById('character-creation');
        if (!container) {
            logger.error('Character creation container not found!');
            return;
        }
        
        container.innerHTML = `
            <div class="character-creation-container" style="padding: 2rem; text-align: center; background: var(--background-medium); border-radius: 8px; margin: 2rem;">
                <h2 style="color: var(--text-primary); margin-bottom: 1rem;">🎲 Create Your Character</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Let's get you started with a test character to explore DiceTales!</p>
                
                <div style="background: var(--background-light); padding: 1.5rem; border-radius: 6px; margin-bottom: 2rem;">
                    <h3 style="color: var(--primary-color);">Quick Start Character</h3>
                    <p style="color: var(--text-secondary); margin: 0.5rem 0;">
                        <strong>Name:</strong> Adventurer<br>
                        <strong>Class:</strong> Warrior<br>
                        <strong>Setting:</strong> Medieval Fantasy<br>
                        <strong>Background:</strong> Folk Hero
                    </p>
                </div>
                
                <button onclick="window.diceTalesApp.startTestCharacter()" 
                        style="background: var(--primary-color); color: white; padding: 1rem 2rem; border: none; border-radius: 4px; font-size: 1.1rem; cursor: pointer; margin-right: 1rem;">
                    🚀 Start Adventure
                </button>
                
                <button onclick="window.diceTalesApp.debugCharacterCreation()" 
                        style="background: var(--secondary-color); color: white; padding: 1rem 2rem; border: none; border-radius: 4px; font-size: 1.1rem; cursor: pointer;">
                    🔧 Debug Character System
                </button>
            </div>
        `;
        
        logger.info('Basic character creation UI created');
    }
    
    /**
     * Start with a test character
     */
    startTestCharacter() {
        logger.info('Starting with test character...');
        const testCharacter = {
            name: 'Adventurer',
            class: 'warrior',
            setting: 'medieval-fantasy',
            background: 'folk hero',
            level: 1,
            experience: 0,
            stats: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
            health: { current: 100, maximum: 100 },
            inventory: [],
            skills: {}
        };
        
        // Save character to game state
        gameState.set('character', testCharacter);
        
        // Start the campaign
        this.startNewCampaign(testCharacter);
    }
    
    /**
     * Debug character creation system
     */
    debugCharacterCreation() {
        logger.info('=== CHARACTER CREATION DEBUG ===');
        logger.info('characterManager exists:', typeof characterManager !== 'undefined');
        logger.info('characterManager:', characterManager);
        
        if (typeof characterManager !== 'undefined') {
            logger.info('characterManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(characterManager)));
        }
        
        const container = document.getElementById('character-creation');
        logger.info('character-creation container:', container);
        logger.info('container innerHTML length:', container ? container.innerHTML.length : 'N/A');
        
        // Try to call the actual character creation
        if (typeof characterManager !== 'undefined' && characterManager.showCharacterCreation) {
            logger.info('Attempting to call characterManager.showCharacterCreation()...');
            try {
                characterManager.showCharacterCreation();
                logger.info('Character creation called successfully');
            } catch (error) {
                logger.error('Error calling character creation:', error);
            }
        }
    }
    
    /**
     * Handle game state loaded event
     */
    onGameStateLoaded(data) {
        logger.info('Game state loaded:', data);
        
        // Update UI with loaded state
        if (typeof uiManager !== 'undefined') {
            uiManager.updateCharacterDisplay();
        }
    }
    
    /**
     * Handle character updated event
     */
    onCharacterUpdated(character) {
        logger.info('Character updated:', character.name);
        
        // Update UI
        if (typeof uiManager !== 'undefined') {
            uiManager.updateCharacterDisplay();
        }
    }
    
    /**
     * Handle character creation completion
     */
    onCharacterCreated(character) {
        logger.info('Character created:', character.name);
        
        // Start the campaign
        this.startNewCampaign(character);
    }
    
    /**
     * Start a new campaign
     */
    async startNewCampaign(character) {
        try {
            logger.info('Starting new campaign for', character.name);
            
            // Initialize campaign data
            const campaignData = {
                setting: character.setting,
                start_time: new Date().toISOString(),
                dm_difficulty: gameState.getSetting('campaign.dm_difficulty') || 'medium',
                dm_custom_prompt: gameState.getSetting('campaign.dm_custom_prompt') || '',
                conversation_history: [],
                campaign_log: [],
                choices_made: [],
                current_scene: null,
                world_state: {}
            };
            
            gameState.set('campaign', campaignData);
            
            // Show game screen
            this.showScreen('game');
            
            // Generate opening story
            await this.generateOpeningStory(character);
            
            logger.info('New campaign started successfully');
            
        } catch (error) {
            logger.error('Failed to start new campaign:', error);
            this.showError('Failed to start campaign. Please try again.');
        }
    }
    
    /**
     * Generate opening story for new campaign
     */
    async generateOpeningStory(character) {
        try {
            // Add loading message
            this.addStoryEntry({
                type: 'system',
                content: 'The Dungeon Master is preparing your adventure...'
            });
            
            // Generate opening with AI
            const prompt = this.buildOpeningPrompt(character);
            const response = await aiManager.generateResponse(prompt, 'opening');
            
            // Replace loading message with opening story
            this.replaceLastStoryEntry({
                type: 'dm',
                content: response.content
            });
            
            // Log the opening
            gameState.addToCampaignLog({
                type: 'campaign_start',
                content: `Campaign started: ${character.name} begins their adventure in ${character.setting}`,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            logger.error('Failed to generate opening story:', error);
            
            this.replaceLastStoryEntry({
                type: 'system',
                content: `Welcome to your adventure, ${character.name}! Your journey begins now. What would you like to do?`
            });
        }
    }
    
    /**
     * Build opening story prompt
     */
    buildOpeningPrompt(character) {
        const settingDescriptions = {
            'medieval-fantasy': 'a medieval fantasy world filled with magic, dragons, and ancient mysteries',
            'modern-day': 'the modern world where ancient secrets hide beneath the surface of everyday life',
            'sci-fi-space': 'a futuristic space-faring civilization among the stars',
            'eldritch-horror': 'a world where cosmic horrors lurk just beyond human understanding'
        };
        
        const classDescriptions = {
            warrior: 'a skilled fighter with prowess in combat',
            mage: 'a wielder of arcane magic and ancient knowledge',
            rogue: 'a stealthy individual skilled in stealth and cunning',
            cleric: 'a divine spellcaster blessed by the gods'
        };
        
        return `You are an expert Dungeon Master starting a new D&D adventure. Create an engaging opening scene for:

Character: ${character.name}
Class: ${classDescriptions[character.class] || 'an adventurer'}
Background: ${character.background}
Setting: ${settingDescriptions[character.setting] || 'an adventure setting'}

Requirements:
- Create an immersive opening scene that draws the player in
- Include sensory details (what they see, hear, smell)
- Present an initial choice or situation that requires action
- Stay true to the chosen setting and character background
- Keep the tone appropriate for the setting
- End with a question or situation that invites player action

Length: 2-3 paragraphs maximum.`;
    }
    
    /**
     * Show specific screen
     */
    showScreen(screenName) {
        logger.info(`Switching to screen: ${screenName}`);
        
        // Hide all screens
        const loadingScreen = document.getElementById('loading-screen');
        const gameScreen = document.getElementById('game-screen');
        const characterScreen = document.getElementById('character-creation');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('active');
        }
        
        if (gameScreen) {
            gameScreen.style.display = 'none';
            gameScreen.classList.remove('active');
        }
        
        if (characterScreen) {
            characterScreen.style.display = 'none';
            characterScreen.classList.remove('active');
        }
        
        // Show target screen
        let targetScreen = null;
        
        if (screenName === 'loading') {
            targetScreen = loadingScreen;
        } else if (screenName === 'game') {
            targetScreen = gameScreen;
        } else if (screenName === 'character-creation') {
            targetScreen = characterScreen;
        }
        
        if (targetScreen) {
            targetScreen.style.display = 'block';
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            logger.info(`Successfully switched to screen: ${screenName}`);
        } else {
            logger.error(`Screen not found: ${screenName}`);
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        logger.error('Showing error:', message);
        alert(message); // Simple fallback - you could enhance this
    }
    
    /**
     * Handle global errors
     */
    handleError(error) {
        logger.error('Application error:', error);
        
        if (!this.initialized) {
            this.showError('Failed to initialize game. Please refresh the page.');
        } else {
            showToast('An error occurred. Check the console for details.', 'error');
        }
    }
    
    /**
     * Add story entry to the display
     */
    addStoryEntry(entry) {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const entryElement = createElement('div', {
            className: `story-entry story-${entry.type}`,
            innerHTML: `
                <div class="story-content">
                    ${entry.content}
                </div>
                <div class="story-timestamp">
                    ${formatTimestamp(new Date().toISOString())}
                </div>
            `
        });
        
        storyContent.appendChild(entryElement);
        
        // Auto-scroll if enabled
        const displaySettings = gameState.getSetting('display_preferences');
        if (displaySettings?.auto_scroll !== false) {
            entryElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Add to campaign log
        if (entry.type !== 'system') {
            gameState.addToCampaignLog({
                type: entry.type,
                content: entry.content,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * Replace the last story entry
     */
    replaceLastStoryEntry(entry) {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const lastEntry = storyContent.lastElementChild;
        if (lastEntry) {
            lastEntry.querySelector('.story-content').innerHTML = entry.content;
            lastEntry.className = `story-entry story-${entry.type}`;
        } else {
            this.addStoryEntry(entry);
        }
    }
    
    /**
     * Handle page becoming hidden
     */
    onPageHidden() {
        // Pause background music
        if (typeof audioManager !== 'undefined' && audioManager.backgroundMusic) {
            audioManager.pauseBackgroundMusic();
        }
        
        // Auto-save
        gameState.save();
        
        logger.debug('Page hidden - game paused');
    }
    
    /**
     * Handle page becoming visible
     */
    onPageVisible() {
        // Resume background music if enabled
        const audioSettings = gameState.getSetting('audio_settings');
        if (audioSettings?.music_enabled && typeof audioManager !== 'undefined') {
            audioManager.resumeBackgroundMusic();
        }
        
        logger.debug('Page visible - game resumed');
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Don't interfere with typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + S: Save game
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            gameState.save();
            showToast('Game saved!', 'success');
        }
        
        // Escape: Close modals
        if (e.key === 'Escape' && uiManager.activeModal) {
            uiManager.closeModal(uiManager.activeModal);
        }
        
        // Space: Focus on player input
        if (e.key === ' ' && this.currentScreen === 'game') {
            e.preventDefault();
            const playerInput = document.getElementById('player-input');
            if (playerInput) {
                playerInput.focus();
            }
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Clean up audio
        if (typeof audioManager !== 'undefined' && audioManager.cleanup) {
            audioManager.cleanup();
        }
        
        logger.info('DiceTales app destroyed');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.diceTalesApp = new DiceTalesApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.diceTalesApp) {
        window.diceTalesApp.destroy();
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiceTalesApp;
}
