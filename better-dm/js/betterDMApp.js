/**
 * Better DM - Main Application
 * Enhanced DM system with campaign roadmap management
 */

class BetterDMApp {
    constructor() {
        this.initialized = false;
        this.dmAI = null;
        this.currentCharacter = null;
        this.gameState = 'initialization';
        
        // UI Elements
        this.elements = {};
        
        // State tracking
        this.campaignStarted = false;
        this.lastResponse = null;
        
        this.logger = console;
        
        this.init();
    }
    
    async init() {
        try {
            this.logger.info('🚀 Initializing Better DM App...');
            
            // Wait for DOM
            await this.waitForDOM();
            
            // Initialize UI elements
            this.initializeUI();
            
            // Initialize Better DM AI
            this.dmAI = new BetterDMAI();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Show campaign setup screen
            this.showCampaignSetup();
            
            this.initialized = true;
            this.logger.info('✅ Better DM App initialized successfully');
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize Better DM App:', error);
            this.showError('Failed to initialize the application. Please refresh and try again.');
        }
    }
    
    /**
     * Wait for DOM to be ready
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
     * Initialize UI elements
     */
    initializeUI() {
        // Create main container if it doesn't exist
        if (!document.getElementById('better-dm-app')) {
            const container = document.createElement('div');
            container.id = 'better-dm-app';
            document.body.appendChild(container);
        }
        
        this.elements = {
            container: document.getElementById('better-dm-app'),
            setupScreen: null,
            gameScreen: null,
            roadmapPanel: null
        };
        
        // Create initial screens
        this.createSetupScreen();
        this.createGameScreen();
        this.createRoadmapPanel();
    }
    
    /**
     * Create campaign setup screen
     */
    createSetupScreen() {
        const setupHTML = `
            <div id="campaign-setup" class="screen active">
                <div class="setup-container">
                    <h1>Better DM Campaign Setup</h1>
                    <p>Create an epic adventure with intelligent campaign planning</p>
                    
                    <div class="setup-form">
                        <div class="form-section">
                            <h3>Campaign Prompt</h3>
                            <textarea id="campaign-prompt" placeholder="Describe your desired campaign (e.g., 'A dark fantasy adventure where the players must stop an ancient evil from awakening...')"></textarea>
                        </div>
                        
                        <div class="form-section">
                            <h3>Character Information</h3>
                            <textarea id="character-info" placeholder="Describe your character or party (class, background, motivations, etc.)"></textarea>
                        </div>
                        
                        <div class="form-section">
                            <h3>Campaign Settings</h3>
                            <div class="settings-grid">
                                <label>
                                    Campaign Length:
                                    <select id="campaign-length">
                                        <option value="short">Short (3-4 sessions)</option>
                                        <option value="medium" selected>Medium (6-8 sessions)</option>
                                        <option value="long">Long (10+ sessions)</option>
                                    </select>
                                </label>
                                
                                <label>
                                    Difficulty:
                                    <select id="campaign-difficulty">
                                        <option value="easy">Easy</option>
                                        <option value="normal" selected>Normal</option>
                                        <option value="hard">Hard</option>
                                        <option value="epic">Epic</option>
                                    </select>
                                </label>
                                
                                <label>
                                    Theme:
                                    <select id="campaign-theme">
                                        <option value="heroic">Heroic Fantasy</option>
                                        <option value="dark">Dark Fantasy</option>
                                        <option value="mystery">Mystery</option>
                                        <option value="political">Political Intrigue</option>
                                        <option value="exploration">Exploration</option>
                                        <option value="horror">Horror</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        
                        <button id="start-campaign" class="primary-button">Generate Campaign & Start Adventure</button>
                    </div>
                    
                    <div id="generation-progress" class="progress-container" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <p class="progress-text">Generating your epic campaign roadmap...</p>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.container.innerHTML = setupHTML;
        this.elements.setupScreen = document.getElementById('campaign-setup');
    }
    
    /**
     * Create main game screen
     */
    createGameScreen() {
        const gameHTML = `
            <div id="game-screen" class="screen" style="display: none;">
                <div class="game-layout">
                    <!-- Main story area -->
                    <div class="story-area">
                        <div id="story-content">
                            <div id="story-text"></div>
                        </div>
                        
                        <div class="input-area">
                            <textarea id="player-input" placeholder="What do you want to do?"></textarea>
                            <button id="submit-action" class="action-button">Take Action</button>
                        </div>
                    </div>
                    
                    <!-- Sidebar with roadmap and controls -->
                    <div class="sidebar">
                        <div class="roadmap-panel">
                            <h3>Campaign Progress</h3>
                            <div id="campaign-overview"></div>
                            <div id="current-objectives"></div>
                        </div>
                        
                        <div class="controls-panel">
                            <button id="show-roadmap" class="control-button">View Full Roadmap</button>
                            <button id="save-campaign" class="control-button">Save Campaign</button>
                            <button id="export-log" class="control-button">Export Log</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.container.insertAdjacentHTML('beforeend', gameHTML);
        this.elements.gameScreen = document.getElementById('game-screen');
    }
    
    /**
     * Create roadmap panel modal
     */
    createRoadmapPanel() {
        const roadmapHTML = `
            <div id="roadmap-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Campaign Roadmap</h2>
                        <button class="close-button">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="roadmap-content"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.container.insertAdjacentHTML('beforeend', roadmapHTML);
        this.elements.roadmapPanel = document.getElementById('roadmap-modal');
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Campaign setup
        const startButton = document.getElementById('start-campaign');
        if (startButton) {
            startButton.addEventListener('click', () => this.startCampaign());
        }
        
        // Player input
        const submitButton = document.getElementById('submit-action');
        if (submitButton) {
            submitButton.addEventListener('click', () => this.submitPlayerAction());
        }
        
        const playerInput = document.getElementById('player-input');
        if (playerInput) {
            playerInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitPlayerAction();
                }
            });
        }
        
        // Roadmap panel
        const showRoadmapButton = document.getElementById('show-roadmap');
        if (showRoadmapButton) {
            showRoadmapButton.addEventListener('click', () => this.showRoadmapModal());
        }
        
        const closeButton = this.elements.roadmapPanel?.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideRoadmapModal());
        }
        
        // Save/export functions
        const saveButton = document.getElementById('save-campaign');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCampaign());
        }
        
        const exportButton = document.getElementById('export-log');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportLog());
        }
    }
    
    /**
     * Start campaign with user settings
     */
    async startCampaign() {
        try {
            const campaignPrompt = document.getElementById('campaign-prompt')?.value;
            const characterInfo = document.getElementById('character-info')?.value;
            
            if (!campaignPrompt.trim()) {
                this.showError('Please provide a campaign prompt.');
                return;
            }
            
            if (!characterInfo.trim()) {
                this.showError('Please provide character information.');
                return;
            }
            
            // Show progress
            this.showGenerationProgress();
            
            // Get additional settings
            const settings = {
                length: document.getElementById('campaign-length')?.value || 'medium',
                difficulty: document.getElementById('campaign-difficulty')?.value || 'normal',
                theme: document.getElementById('campaign-theme')?.value || 'heroic'
            };
            
            // Enhanced prompt with settings
            const enhancedPrompt = `
${campaignPrompt}

Campaign Settings:
- Length: ${settings.length}
- Difficulty: ${settings.difficulty}
- Theme: ${settings.theme}
            `.trim();
            
            // Initialize the Better DM AI
            const result = await this.dmAI.initialize(enhancedPrompt, {
                info: characterInfo,
                settings: settings
            });
            
            if (result.success) {
                // Store campaign data
                this.campaignStarted = true;
                this.currentCharacter = characterInfo;
                
                // Switch to game screen
                this.showGameScreen();
                
                // Display opening story
                this.displayStoryText(result.openingStory);
                
                // Update roadmap display
                this.updateRoadmapDisplay();
                
                this.logger.info('🎉 Campaign started successfully!');
            } else {
                throw new Error('Failed to initialize campaign');
            }
            
        } catch (error) {
            this.logger.error('❌ Failed to start campaign:', error);
            this.hideGenerationProgress();
            this.showError('Failed to start campaign. Please try again.');
        }
    }
    
    /**
     * Submit player action
     */
    async submitPlayerAction() {
        const input = document.getElementById('player-input');
        const submitButton = document.getElementById('submit-action');
        
        if (!input || !submitButton) return;
        
        const action = input.value.trim();
        if (!action) return;
        
        try {
            // Disable input during processing
            input.disabled = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            
            // Clear input
            input.value = '';
            
            // Display player action
            this.displayPlayerAction(action);
            
            // Process with Better DM AI
            const result = await this.dmAI.processPlayerAction(action);
            
            if (!result.error) {
                // Display DM response
                this.displayStoryText(result.response);
                
                // Update roadmap if changed
                if (result.signals?.sceneComplete || result.signals?.chapterAdvance) {
                    this.updateRoadmapDisplay();
                }
                
                // Handle special signals
                this.handleSignals(result.signals);
            } else {
                this.showError('Failed to process action. Please try again.');
            }
            
        } catch (error) {
            this.logger.error('❌ Failed to process player action:', error);
            this.showError('An error occurred processing your action.');
        } finally {
            // Re-enable input
            input.disabled = false;
            submitButton.disabled = false;
            submitButton.textContent = 'Take Action';
            input.focus();
        }
    }
    
    /**
     * Display story text in the game area
     */
    displayStoryText(text) {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'story-message dm-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>DM:</strong> ${this.formatStoryText(text)}
            </div>
            <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        
        storyContent.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Display player action in the game area
     */
    displayPlayerAction(action) {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'story-message player-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>You:</strong> ${action}
            </div>
            <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        
        storyContent.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Format story text with basic markdown-like formatting
     */
    formatStoryText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
    
    /**
     * Update roadmap display in sidebar
     */
    updateRoadmapDisplay() {
        const overview = document.getElementById('campaign-overview');
        const objectives = document.getElementById('current-objectives');
        
        if (!overview || !objectives || !this.dmAI) return;
        
        const campaignState = this.dmAI.getCampaignState();
        
        // Update overview
        overview.innerHTML = `
            <div class="campaign-title">${campaignState.roadmap?.title || 'Unknown Campaign'}</div>
            <div class="progress-info">
                Chapter ${campaignState.currentChapter + 1}/${campaignState.progress.totalChapters}: 
                ${campaignState.chapterInfo?.title || 'Unknown'}
            </div>
            <div class="scene-info">
                Scene ${campaignState.currentScene + 1}/${campaignState.progress.scenesInChapter}:
                ${campaignState.sceneInfo?.title || 'Unknown'}
            </div>
        `;
        
        // Update objectives
        const currentObjectives = campaignState.sceneInfo?.objectives || [];
        objectives.innerHTML = `
            <h4>Current Objectives:</h4>
            <ul>
                ${currentObjectives.map(obj => `<li>${obj}</li>`).join('')}
            </ul>
        `;
    }
    
    /**
     * Handle special signals from AI
     */
    handleSignals(signals) {
        if (!signals) return;
        
        if (signals.sceneComplete) {
            this.logger.info('📝 Scene completed');
            // Could add visual feedback here
        }
        
        if (signals.chapterAdvance) {
            this.logger.info('📚 Chapter advanced');
            // Could add chapter transition animation
        }
        
        if (signals.emergencyMode) {
            this.logger.warn('🚨 Emergency mode activated');
            // Could show special UI indication
        }
    }
    
    /**
     * Show/hide various screens and modals
     */
    showCampaignSetup() {
        this.hideAllScreens();
        this.elements.setupScreen.style.display = 'block';
    }
    
    showGameScreen() {
        this.hideAllScreens();
        this.elements.gameScreen.style.display = 'block';
        
        // Focus input
        const input = document.getElementById('player-input');
        if (input) input.focus();
    }
    
    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.style.display = 'none');
    }
    
    showGenerationProgress() {
        const progress = document.getElementById('generation-progress');
        const button = document.getElementById('start-campaign');
        
        if (progress) progress.style.display = 'block';
        if (button) button.disabled = true;
    }
    
    hideGenerationProgress() {
        const progress = document.getElementById('generation-progress');
        const button = document.getElementById('start-campaign');
        
        if (progress) progress.style.display = 'none';
        if (button) button.disabled = false;
    }
    
    showRoadmapModal() {
        if (!this.elements.roadmapPanel || !this.dmAI) return;
        
        const content = document.getElementById('roadmap-content');
        const campaignState = this.dmAI.getCampaignState();
        
        content.innerHTML = this.generateRoadmapHTML(campaignState.roadmap);
        this.elements.roadmapPanel.style.display = 'block';
    }
    
    hideRoadmapModal() {
        if (this.elements.roadmapPanel) {
            this.elements.roadmapPanel.style.display = 'none';
        }
    }
    
    /**
     * Generate HTML for full roadmap display
     */
    generateRoadmapHTML(roadmap) {
        if (!roadmap) return '<p>No roadmap available</p>';
        
        return `
            <div class="roadmap-overview">
                <h3>${roadmap.title}</h3>
                <p><strong>Theme:</strong> ${roadmap.theme}</p>
                <p><strong>Goal:</strong> ${roadmap.overallGoal}</p>
            </div>
            
            <div class="chapters-list">
                ${roadmap.chapters.map((chapter, index) => `
                    <div class="chapter ${index === this.dmAI.roadmapManager.currentChapter ? 'current' : ''}">
                        <h4>Chapter ${index + 1}: ${chapter.title}</h4>
                        <p>${chapter.description}</p>
                        <div class="scenes">
                            ${chapter.scenes?.map((scene, sceneIndex) => `
                                <div class="scene ${index === this.dmAI.roadmapManager.currentChapter && sceneIndex === this.dmAI.roadmapManager.currentScene ? 'current' : ''}">
                                    <strong>${scene.title}</strong> (${scene.type})
                                    <p>${scene.description}</p>
                                </div>
                            `).join('') || ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Save campaign state
     */
    saveCampaign() {
        if (!this.dmAI || !this.campaignStarted) {
            this.showError('No campaign to save');
            return;
        }
        
        try {
            const saveData = {
                version: '1.0',
                timestamp: Date.now(),
                campaignState: this.dmAI.exportState(),
                character: this.currentCharacter
            };
            
            const dataStr = JSON.stringify(saveData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `better-dm-campaign-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.logger.info('💾 Campaign saved successfully');
            
        } catch (error) {
            this.logger.error('❌ Failed to save campaign:', error);
            this.showError('Failed to save campaign');
        }
    }
    
    /**
     * Export conversation log
     */
    exportLog() {
        if (!this.dmAI || !this.campaignStarted) {
            this.showError('No log to export');
            return;
        }
        
        try {
            const storyContent = document.getElementById('story-content');
            const messages = Array.from(storyContent.querySelectorAll('.story-message'));
            
            const logText = messages.map(msg => {
                const content = msg.querySelector('.message-content').textContent;
                const timestamp = msg.querySelector('.message-timestamp').textContent;
                return `[${timestamp}] ${content}`;
            }).join('\n\n');
            
            const blob = new Blob([logText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaign-log-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.logger.info('📄 Log exported successfully');
            
        } catch (error) {
            this.logger.error('❌ Failed to export log:', error);
            this.showError('Failed to export log');
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        // Simple error display - could be enhanced with a proper modal
        alert(`Error: ${message}`);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.betterDMApp = new BetterDMApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BetterDMApp;
}
