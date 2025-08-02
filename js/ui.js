/**
 * DiceTales - UI Management
 * User interface interactions and modal management
 */

class UIManager {
    constructor() {
        this.activeModal = null;
        this.toastContainer = null;
        
        this.init();
    }
    
    init() {
        this.setupToastContainer();
        this.bindGlobalEvents();
        this.setupModals();
        this.setupNavigation();
        this.updateCharacterDisplay();
    }
    
    /**
     * Setup toast notification container
     */
    setupToastContainer() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const container = createElement('div', {
                className: 'toast-container'
            });
            document.body.appendChild(container);
            this.toastContainer = container;
        }
    }
    
    /**
     * Bind global UI events
     */
    bindGlobalEvents() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                const modalId = e.target.dataset.modal;
                if (modalId) {
                    this.closeModal(modalId);
                }
            }
            
            // Close modal when clicking backdrop
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
            
            // Button click sounds
            if (e.target.tagName === 'BUTTON') {
                if (typeof eventBus !== 'undefined') {
                    eventBus.emit('ui:buttonClick');
                }
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal(this.activeModal);
            }
            
            // Enter key submits actions
            if (e.key === 'Enter' && e.target.id === 'player-input' && e.ctrlKey) {
                this.submitPlayerAction();
            }
        });
        
        // Game state events
        eventBus.on('gameState:changed', (data) => {
            if (data.path.startsWith('character')) {
                this.updateCharacterDisplay();
            }
        });
        
        eventBus.on('character:levelUp', (data) => {
            this.showLevelUpModal(data);
        });
    }
    
    /**
     * Setup modal system
     */
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    /**
     * Setup navigation buttons
     */
    setupNavigation() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettingsModal());
        }
        
        // Character sheet button
        const characterBtn = document.getElementById('character-sheet-btn');
        if (characterBtn) {
            characterBtn.addEventListener('click', () => this.openCharacterSheetModal());
        }
        
        // Campaign log button
        const logBtn = document.getElementById('campaign-log-btn');
        if (logBtn) {
            logBtn.addEventListener('click', () => this.openCampaignLogModal());
        }
        
        // Save game button
        const saveBtn = document.getElementById('save-game-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveGame());
        }
        
        // Import/Export button
        const importExportBtn = document.getElementById('import-export-btn');
        if (importExportBtn) {
            importExportBtn.addEventListener('click', () => this.openImportExportModal());
        }
        
        // Debug button (temporary)
        const debugBtn = document.getElementById('debug-screen-btn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                console.log('🔧 DEBUG BUTTON CLICKED');
                this.debugScreenStates();
            });
        }
        
        // Inventory button
        const inventoryBtn = document.getElementById('quick-inventory-btn');
        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', () => this.openInventoryModal());
        }
        
        // Player action submit
        const submitBtn = document.getElementById('submit-action-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitPlayerAction());
        }
        
        // Dice input selection buttons
        this.setupDiceInputHandlers();
    }
    
    /**
     * Setup dice input handlers for the new combined system
     */
    setupDiceInputHandlers() {
        const diceButtons = document.querySelectorAll('.dice-btn');
        const resultDisplay = document.getElementById('input-dice-result');
        
        // Store dice roll result for submission
        this.pendingDiceRoll = null;
        
        diceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const diceType = button.dataset.dice;
                this.rollInputDice(diceType, resultDisplay);
                
                // Highlight selected die
                diceButtons.forEach(btn => btn.style.background = 'var(--accent-primary)');
                button.style.background = 'var(--success-color)';
            });
        });
    }
    
    /**
     * Roll dice in the input section
     */
    rollInputDice(diceType, display) {
        const diceNumber = parseInt(diceType.substring(1));
        const result = Math.floor(Math.random() * diceNumber) + 1;
        
        // Store the roll result
        this.pendingDiceRoll = {
            dice: diceType,
            result: result,
            max: diceNumber,
            critical: result === diceNumber,
            fumble: result === 1 && diceNumber === 20,
            timestamp: new Date().toISOString()
        };
        
        // Determine result quality
        let resultColor = 'var(--text-primary)';
        let resultText = `Rolled ${result}`;
        let emoji = '🎯';
        
        if (this.pendingDiceRoll.critical) {
            resultColor = 'var(--success-color)';
            resultText = diceNumber === 20 ? '🌟 Critical Success!' : '🌟 Maximum Roll!';
            emoji = '🌟';
        } else if (this.pendingDiceRoll.fumble) {
            resultColor = 'var(--error-color)';
            resultText = '💀 Critical Failure!';
            emoji = '💀';
        } else if (result >= diceNumber * 0.75) {
            resultColor = 'var(--success-color)';
            resultText = '✨ Great Roll!';
            emoji = '✨';
        } else if (result <= diceNumber * 0.25) {
            resultColor = 'var(--warning-color)';
            resultText = '😅 Could be better...';
            emoji = '😅';
        }
        
        // Display the result
        display.innerHTML = `
            <div style="color: ${resultColor}; font-weight: bold; font-size: 1.2rem;">
                ${emoji} ${diceType.toUpperCase()}: ${result} / ${diceNumber}
            </div>
            <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.8;">
                ${resultText}
            </div>
        `;
        
        console.log('[UI] Input dice rolled:', this.pendingDiceRoll);
    }
    
    /**
     * Open modal by ID
     */
    openModal(modalId) {
        console.log('🔧 Opening modal:', modalId);
        
        // Debug: Check current game screen visibility before opening modal
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            console.log('🔧 Game screen before modal:', {
                display: gameScreen.style.display,
                active: gameScreen.classList.contains('active'),
                visible: gameScreen.offsetWidth > 0 && gameScreen.offsetHeight > 0
            });
        }
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            logger.warn(`Modal not found: ${modalId}`);
            console.error('🔧 Modal element not found:', modalId);
            return;
        }
        
        // Close any existing modal
        if (this.activeModal) {
            console.log('🔧 Closing existing modal:', this.activeModal);
            this.closeModal(this.activeModal);
        }
        
        modal.classList.add('active');
        this.activeModal = modalId;
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Debug: Check game screen visibility after opening modal
        if (gameScreen) {
            console.log('🔧 Game screen after modal opened:', {
                display: gameScreen.style.display,
                active: gameScreen.classList.contains('active'),
                visible: gameScreen.offsetWidth > 0 && gameScreen.offsetHeight > 0
            });
        }
        
        console.log('🔧 Modal opened successfully:', modalId);
        logger.debug(`Opened modal: ${modalId}`);
    }
    
    /**
     * Close modal by ID
     */
    closeModal(modalId) {
        console.log('🔧 Closing modal:', modalId);
        
        // Debug: Check game screen before closing modal
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            console.log('🔧 Game screen before close:', {
                display: gameScreen.style.display,
                active: gameScreen.classList.contains('active'),
                visible: gameScreen.offsetWidth > 0 && gameScreen.offsetHeight > 0
            });
        }
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            console.log('🔧 Modal classes after close:', modal.className);
        } else {
            console.error('🔧 Modal element not found when closing:', modalId);
        }
        
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
        
        // Ensure the underlying screen is still visible after closing modal
        this.ensureScreenVisibility();
        
        // Debug: Check game screen after ensuring visibility
        if (gameScreen) {
            console.log('🔧 Game screen after ensureScreenVisibility:', {
                display: gameScreen.style.display,
                active: gameScreen.classList.contains('active'),
                visible: gameScreen.offsetWidth > 0 && gameScreen.offsetHeight > 0
            });
        }
        
        console.log('🔧 Modal closed successfully:', modalId);
        logger.debug(`Closed modal: ${modalId}`);
    }
    
    /**
     * Ensure the current screen is visible (fixes blank screen issue)
     */
    ensureScreenVisibility() {
        console.log('🔧 Checking screen visibility...');
        
        // Get the current screen from gameManager if available
        const currentScreen = window.gameManager?.currentScreen || 'game';
        console.log('🔧 Current screen should be:', currentScreen);
        
        // Common screen IDs to check
        const screenIds = ['game-screen', 'character-creation', 'campaign-selection'];
        
        let visibleScreen = null;
        
        // Check current state of all screens
        screenIds.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                const isVisible = screen.style.display !== 'none' && screen.classList.contains('active');
                console.log(`🔧 Screen ${screenId}: display=${screen.style.display}, active=${screen.classList.contains('active')}, visible=${isVisible}`);
                if (isVisible) {
                    visibleScreen = screen;
                }
            }
        });
        
        // If no screen is visible, default to game screen
        if (!visibleScreen) {
            console.log('🔧 No visible screen found, restoring game screen');
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.style.display = 'grid';
                gameScreen.classList.add('active');
                console.log('🔧 Fixed blank screen - restored game screen visibility');
                
                // Also make sure the parent container is visible
                const gameContainer = gameScreen.parentElement;
                if (gameContainer) {
                    gameContainer.style.display = 'block';
                }
            } else {
                console.error('🔧 Game screen element not found!');
            }
        } else {
            console.log('🔧 Screen visibility is okay, found visible screen:', visibleScreen.id);
        }
    }
    
    /**
     * Debug function to check all screen states
     */
    debugScreenStates() {
        console.log('🔧 === SCREEN DEBUG INFO ===');
        console.log('🔧 Active Modal:', this.activeModal);
        console.log('🔧 Current Screen:', this.currentScreen);
        
        const screens = document.querySelectorAll('.screen, #game-screen, #character-creation-screen, #campaign-selection-screen, #intro-screen');
        screens.forEach(screen => {
            const isVisible = screen.offsetWidth > 0 && screen.offsetHeight > 0;
            console.log(`🔧 ${screen.id}: display=${screen.style.display}, active=${screen.classList.contains('active')}, visible=${isVisible}, classes=${screen.className}`);
        });
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const isVisible = modal.offsetWidth > 0 && modal.offsetHeight > 0;
            console.log(`🔧 ${modal.id}: active=${modal.classList.contains('active')}, visible=${isVisible}, classes=${modal.className}`);
        });
        
        // Check game state
        if (window.gameState) {
            console.log('🔧 Game State:', {
                hasCurrentCampaign: !!window.gameState.getCurrentCampaign(),
                campaignName: window.gameState.getCurrentCampaign()?.name || 'None'
            });
        }
        
        console.log('🔧 === END SCREEN DEBUG ===');
    }
    
    /**
     * Open settings modal
     */
    openSettingsModal() {
        const content = document.getElementById('settings-content');
        if (content) {
            content.innerHTML = this.renderSettingsForm();
            this.bindSettingsEvents();
        }
        this.openModal('settings-modal');
    }
    
    /**
     * Render settings form
     */
    renderSettingsForm() {
        const audioSettings = (typeof audioManager !== 'undefined' && audioManager.getSettings) ? 
            audioManager.getSettings() : {
                music_volume: 0.3,
                sfx_volume: 0.7,
                music_enabled: true,
                sfx_enabled: true
            };
        const displaySettings = gameState.getSetting('display_preferences') || {};
        const aiSettings = gameState.getSetting('ai_settings') || {};
        
        return `
            <form class="settings-form">
                <div class="settings-section">
                    <h3>Audio Settings</h3>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="music-enabled" ${audioSettings.music_enabled ? 'checked' : ''}>
                            Enable Background Music
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="music-volume">Music Volume</label>
                        <input type="range" id="music-volume" min="0" max="1" step="0.1" 
                               value="${audioSettings.music_volume}" class="form-range">
                        <span class="range-value">${Math.round(audioSettings.music_volume * 100)}%</span>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="sfx-enabled" ${audioSettings.sfx_enabled ? 'checked' : ''}>
                            Enable Sound Effects
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="sfx-volume">SFX Volume</label>
                        <input type="range" id="sfx-volume" min="0" max="1" step="0.1" 
                               value="${audioSettings.sfx_volume}" class="form-range">
                        <span class="range-value">${Math.round(audioSettings.sfx_volume * 100)}%</span>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Display Settings</h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="font-size">Font Size</label>
                        <select id="font-size" class="form-select">
                            <option value="small" ${displaySettings.font_size === 'small' ? 'selected' : ''}>Small</option>
                            <option value="medium" ${displaySettings.font_size === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="large" ${displaySettings.font_size === 'large' ? 'selected' : ''}>Large</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="animation-speed">Animation Speed</label>
                        <select id="animation-speed" class="form-select">
                            <option value="slow" ${displaySettings.animation_speed === 'slow' ? 'selected' : ''}>Slow</option>
                            <option value="normal" ${displaySettings.animation_speed === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="fast" ${displaySettings.animation_speed === 'fast' ? 'selected' : ''}>Fast</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="auto-scroll" ${displaySettings.auto_scroll !== false ? 'checked' : ''}>
                            Auto-scroll Story
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>AI Dungeon Master</h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="dm-difficulty">DM Difficulty</label>
                        <select id="dm-difficulty" class="form-select">
                            <option value="easy" ${gameState.get('campaign.dm_difficulty') === 'easy' ? 'selected' : ''}>Easy - Forgiving and helpful</option>
                            <option value="medium" ${gameState.get('campaign.dm_difficulty') === 'medium' ? 'selected' : ''}>Medium - Balanced challenge</option>
                            <option value="hard" ${gameState.get('campaign.dm_difficulty') === 'hard' ? 'selected' : ''}>Hard - Realistic consequences</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="dm-custom-prompt">Custom DM Personality</label>
                        <textarea id="dm-custom-prompt" class="form-textarea" 
                                  placeholder="Describe how you want your DM to behave...">${gameState.get('campaign.dm_custom_prompt') || ''}</textarea>
                        <small class="form-help">Optional: Customize your AI Dungeon Master's personality and style</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="response-length">AI Response Length</label>
                        <select id="response-length" class="form-select">
                            <option value="short" ${aiSettings.response_length === 'short' ? 'selected' : ''}>Short</option>
                            <option value="medium" ${aiSettings.response_length === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="long" ${aiSettings.response_length === 'long' ? 'selected' : ''}>Long</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Campaign Story</h3>
                    <div id="campaign-story-section">
                        ${this.generateCampaignStoryHTML()}
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button type="button" class="btn btn-primary" id="save-settings">Save Settings</button>
                    <button type="button" class="btn btn-secondary" id="reset-settings">Reset to Defaults</button>
                </div>
            </form>
        `;
    }
    
    /**
     * Bind settings form events
     */
    bindSettingsEvents() {
        const form = document.querySelector('.settings-form');
        if (!form) return;
        
        // Save settings
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Reset settings
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
        
        // Real-time volume updates
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const percentage = Math.round(value * 100);
                e.target.nextElementSibling.textContent = `${percentage}%`;
                
                // Update audio immediately
                if (typeof audioManager !== 'undefined' && audioManager.updateSettings) {
                    audioManager.updateSettings({ music_volume: value });
                }
            });
        }
        
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const percentage = Math.round(value * 100);
                e.target.nextElementSibling.textContent = `${percentage}%`;
                
                // Update audio immediately
                if (typeof audioManager !== 'undefined' && audioManager.updateSettings) {
                    audioManager.updateSettings({ sfx_volume: value });
                    // Play test sound
                    if (audioManager.playSFX) {
                        audioManager.playSFX('click');
                    }
                }
            });
        }
    }
    
    /**
     * Save settings
     */
    saveSettings() {
        const form = document.querySelector('.settings-form');
        if (!form) return;
        
        // Audio settings
        const audioSettings = {
            music_enabled: document.getElementById('music-enabled')?.checked ?? true,
            music_volume: parseFloat(document.getElementById('music-volume')?.value ?? 0.3),
            sfx_enabled: document.getElementById('sfx-enabled')?.checked ?? true,
            sfx_volume: parseFloat(document.getElementById('sfx-volume')?.value ?? 0.7)
        };
        
        // Display settings
        const displaySettings = {
            font_size: document.getElementById('font-size')?.value ?? 'medium',
            animation_speed: document.getElementById('animation-speed')?.value ?? 'normal',
            auto_scroll: document.getElementById('auto-scroll')?.checked ?? true
        };
        
        // AI settings
        const aiSettings = {
            response_length: document.getElementById('response-length')?.value ?? 'medium'
        };
        
        // Campaign settings
        const dmDifficulty = document.getElementById('dm-difficulty')?.value ?? 'medium';
        const dmCustomPrompt = document.getElementById('dm-custom-prompt')?.value ?? '';
        
        // Update game state
        gameState.setSetting('audio_settings', audioSettings);
        gameState.setSetting('display_preferences', displaySettings);
        gameState.setSetting('ai_settings', aiSettings);
        gameState.set('campaign.dm_difficulty', dmDifficulty);
        gameState.set('campaign.dm_custom_prompt', dmCustomPrompt);
        
        // Update audio manager
        if (typeof audioManager !== 'undefined' && audioManager.updateSettings) {
            audioManager.updateSettings(audioSettings);
        }
        
        // Apply display settings
        this.applyDisplaySettings(displaySettings);
        
        showToast('Settings saved successfully!', 'success');
        this.closeModal('settings-modal');
        
        logger.info('Settings saved', { audioSettings, displaySettings, aiSettings });
    }
    
    /**
     * Apply display settings
     */
    applyDisplaySettings(settings) {
        const root = document.documentElement;
        
        // Font size
        const fontSizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        root.style.fontSize = fontSizes[settings.font_size] || fontSizes.medium;
        
        // Animation speed (CSS custom property)
        const animationSpeeds = {
            slow: '0.6s',
            normal: '0.3s',
            fast: '0.15s'
        };
        root.style.setProperty('--transition-normal', animationSpeeds[settings.animation_speed] || animationSpeeds.normal);
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            // Reset audio
            const defaultAudio = {
                music_enabled: true,
                music_volume: 0.3,
                sfx_enabled: true,
                sfx_volume: 0.7
            };
            
            // Reset display
            const defaultDisplay = {
                font_size: 'medium',
                animation_speed: 'normal',
                auto_scroll: true
            };
            
            // Reset AI
            const defaultAI = {
                response_length: 'medium'
            };
            
            gameState.setSetting('audio_settings', defaultAudio);
            gameState.setSetting('display_preferences', defaultDisplay);
            gameState.setSetting('ai_settings', defaultAI);
            gameState.set('campaign.dm_difficulty', 'medium');
            gameState.set('campaign.dm_custom_prompt', '');
            
            if (typeof audioManager !== 'undefined' && audioManager.updateSettings) {
                audioManager.updateSettings(defaultAudio);
            }
            this.applyDisplaySettings(defaultDisplay);
            
            // Refresh settings form
            this.openSettingsModal();
            
            showToast('Settings reset to defaults', 'info');
        }
    }
    
    /**
     * Open character sheet modal
     */
    openCharacterSheetModal() {
        const content = document.getElementById('character-sheet-content');
        if (content) {
            content.innerHTML = this.renderCharacterSheet();
        }
        this.openModal('character-sheet-modal');
    }
    
    /**
     * Render character sheet
     */
    renderCharacterSheet() {
        const character = gameState.getCharacter();
        
        return `
            <div class="character-sheet-grid">
                <div class="character-info-section">
                    <h3>Character Information</h3>
                    <div class="character-summary">
                        <div class="summary-row">
                            <span class="summary-label">Name:</span>
                            <span class="summary-value">${character.name || 'Unnamed'}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Class:</span>
                            <span class="summary-value">${capitalizeFirst(character.class || 'None')}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Level:</span>
                            <span class="summary-value">${character.level || 1}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Experience:</span>
                            <span class="summary-value">${character.experience || 0} XP</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Background:</span>
                            <span class="summary-value">${capitalizeFirst(character.background || 'None')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="character-info-section">
                    <h3>Health & Status</h3>
                    <div class="health-display-large">
                        <div class="health-bar-large">
                            <div class="health-bar-fill" style="width: ${(character.health?.current / character.health?.maximum * 100) || 100}%"></div>
                        </div>
                        <div class="health-text-large">
                            ${character.health?.current || 100} / ${character.health?.maximum || 100} HP
                        </div>
                    </div>
                </div>
                
                <div class="character-info-section full-width">
                    <h3>Ability Scores</h3>
                    <div class="full-stats-grid">
                        ${this.renderFullStats(character.stats)}
                    </div>
                </div>
                
                <div class="character-info-section full-width">
                    <h3>Skills</h3>
                    <div class="skills-list">
                        ${this.renderSkills(character.skills)}
                    </div>
                </div>
                
                <div class="character-info-section equipment-section full-width">
                    <h3>Equipment & Inventory</h3>
                    <div class="equipment-grid">
                        ${this.renderEquipment(character.inventory)}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render full stats
     */
    renderFullStats(stats = {}) {
        const statNames = {
            str: 'Strength',
            dex: 'Dexterity',
            con: 'Constitution',
            int: 'Intelligence',
            wis: 'Wisdom',
            cha: 'Charisma'
        };
        
        return Object.entries(statNames).map(([key, name]) => {
            const value = stats[key] || 10;
            const modifier = getAbilityModifier(value);
            
            return `
                <div class="full-stat-card">
                    <div class="full-stat-name">${name}</div>
                    <div class="full-stat-score">${value}</div>
                    <div class="full-stat-modifier">${formatModifier(modifier)}</div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Render skills
     */
    renderSkills(skills = {}) {
        if (Object.keys(skills).length === 0) {
            return '<p class="empty-state">No skills available</p>';
        }
        
        return Object.entries(skills).map(([skill, data]) => `
            <div class="skill-item">
                <span class="skill-name ${data.proficient ? 'proficient' : ''}">${skill}</span>
                <span class="skill-modifier">${formatModifier(data.modifier)}</span>
            </div>
        `).join('');
    }
    
    /**
     * Render equipment
     */
    renderEquipment(inventory = []) {
        if (inventory.length === 0) {
            return '<div class="empty-slot"><span class="empty-slot">No items</span></div>';
        }
        
        return inventory.map(item => `
            <div class="equipment-slot occupied">
                <div class="equipment-item">
                    <div class="equipment-name">${item.name}</div>
                    <div class="equipment-type">${capitalizeFirst(item.type || 'item')}</div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Open campaign log modal
     */
    openCampaignLogModal() {
        console.log('🔧 Opening campaign log modal');
        
        const content = document.getElementById('campaign-log-content');
        if (content) {
            try {
                content.innerHTML = this.renderCampaignLog();
                console.log('🔧 Campaign log content rendered successfully');
            } catch (error) {
                console.error('🔧 Error rendering campaign log:', error);
                content.innerHTML = '<p class="error-state">Error loading campaign log. Please try again.</p>';
            }
        } else {
            console.error('🔧 Campaign log content element not found');
        }
        
        this.openModal('campaign-log-modal');
    }
    
    /**
     * Render campaign log
     */
    renderCampaignLog() {
        const log = gameState.get('campaign.campaign_log') || [];
        const choices = gameState.get('campaign.choices_made') || [];
        
        if (log.length === 0 && choices.length === 0) {
            return '<p class="empty-state">No campaign history yet. Start your adventure!</p>';
        }
        
        // Combine and sort by timestamp
        const allEntries = [
            ...log.map(entry => ({ ...entry, source: 'log' })),
            ...choices.map(choice => ({ ...choice, source: 'choice' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return `
            <div class="campaign-log-list">
                ${allEntries.map(entry => `
                    <div class="log-entry ${entry.source}">
                        <div class="log-timestamp">${formatTimestamp(entry.timestamp)}</div>
                        <div class="log-content">
                            ${entry.source === 'choice' ? 
                                `<strong>Action:</strong> ${entry.choice}${entry.outcome ? `<br><strong>Result:</strong> ${entry.outcome}` : ''}` :
                                entry.content
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Open inventory modal
     */
    openInventoryModal() {
        const content = document.getElementById('inventory-content');
        if (content) {
            content.innerHTML = this.renderInventory();
        }
        this.openModal('inventory-modal');
    }
    
    /**
     * Render inventory
     */
    renderInventory() {
        const inventory = gameState.get('character.inventory') || [];
        
        if (inventory.length === 0) {
            return '<p class="empty-state">Your inventory is empty</p>';
        }
        
        return `
            <div class="inventory-grid">
                ${inventory.map(item => `
                    <div class="inventory-item">
                        <div class="item-name">${item.name}</div>
                        <div class="item-type">${capitalizeFirst(item.type || 'item')}</div>
                        <div class="item-acquired">Acquired: ${formatTimestamp(item.acquired_at)}</div>
                        ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Submit player action
     */
    submitPlayerAction() {
        const input = document.getElementById('player-input');
        if (!input) return;
        
        const action = input.value.trim();
        if (!action) {
            showToast('Please enter an action', 'warning');
            return;
        }
        
        // Check if dice has been rolled
        if (!this.pendingDiceRoll) {
            showToast('Please roll a die first before submitting your action', 'warning');
            return;
        }
        
        // Clear input
        input.value = '';
        
        // Reset dice display
        const diceDisplay = document.getElementById('input-dice-result');
        if (diceDisplay) {
            diceDisplay.innerHTML = 'Select a die and roll to see your result';
        }
        
        // Reset dice button colors
        const diceButtons = document.querySelectorAll('.dice-btn');
        diceButtons.forEach(btn => btn.style.background = 'var(--accent-primary)');
        
        // Add to input history
        gameState.addToInputHistory(action);
        
        // Emit action event with dice roll included
        eventBus.emit('player:action', { 
            action: action,
            diceRoll: this.pendingDiceRoll
        });
        
        logger.info('Player action with dice submitted:', { action, dice: this.pendingDiceRoll });
        
        // Clear the pending dice roll
        this.pendingDiceRoll = null;
    }
    
    /**
     * Save game
     */
    saveGame() {
        const success = gameState.save();
        if (success) {
            showToast('Game saved successfully!', 'success');
        } else {
            showToast('Failed to save game', 'error');
        }
    }

    /**
     * Open import/export modal
     */
    openImportExportModal() {
        this.setupImportExportContent();
        this.openModal('import-export-modal');
    }

    /**
     * Setup import/export modal content
     */
    setupImportExportContent() {
        const character = gameState.getCharacter();
        const campaign = gameState.get('campaign');
        const meta = gameState.get('meta');

        // Update export info
        const exportCharacterName = document.getElementById('export-character-name');
        const exportCharacterLevel = document.getElementById('export-character-level');
        const exportCampaignSetting = document.getElementById('export-campaign-setting');
        const exportLastPlayed = document.getElementById('export-last-played');

        if (exportCharacterName) exportCharacterName.textContent = character.name || 'Unnamed';
        if (exportCharacterLevel) exportCharacterLevel.textContent = `Level ${character.level || 1}`;
        if (exportCampaignSetting) exportCampaignSetting.textContent = campaign.setting || 'No campaign started';
        if (exportLastPlayed) exportLastPlayed.textContent = meta.last_played ? formatTimestamp(meta.last_played) : 'Never';

        // Setup export button
        const exportBtn = document.getElementById('export-campaign-btn');
        if (exportBtn) {
            exportBtn.replaceWith(exportBtn.cloneNode(true)); // Remove existing listeners
            const newExportBtn = document.getElementById('export-campaign-btn');
            newExportBtn.addEventListener('click', () => this.exportCampaign());
        }

        // Setup import file selection
        const selectFileBtn = document.getElementById('select-import-file-btn');
        const fileInput = document.getElementById('import-file-input');
        const selectedFileName = document.getElementById('selected-file-name');
        const importPreview = document.getElementById('import-preview');
        const importBtn = document.getElementById('import-campaign-btn');

        if (selectFileBtn && fileInput) {
            selectFileBtn.replaceWith(selectFileBtn.cloneNode(true)); // Remove existing listeners
            const newSelectFileBtn = document.getElementById('select-import-file-btn');
            
            newSelectFileBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImportFileSelection(file, selectedFileName, importPreview, importBtn);
                }
            });
        }

        // Setup import button
        if (importBtn) {
            importBtn.replaceWith(importBtn.cloneNode(true)); // Remove existing listeners
            const newImportBtn = document.getElementById('import-campaign-btn');
            newImportBtn.addEventListener('click', () => this.importCampaign());
        }

        // Reset import section
        if (selectedFileName) selectedFileName.textContent = '';
        if (importPreview) importPreview.style.display = 'none';
        if (importBtn) importBtn.style.display = 'none';
        
        // Clear file input
        if (fileInput) fileInput.value = '';
    }

    /**
     * Export campaign to file
     */
    exportCampaign() {
        try {
            const exportData = gameState.export();
            const character = gameState.getCharacter();
            const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const filename = `DiceTales_${character.name || 'Campaign'}_${timestamp}.json`;

            // Create download link
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Campaign exported successfully!', 'success');
            logger.info('Campaign exported:', filename);
        } catch (error) {
            logger.error('Failed to export campaign:', error);
            showToast('Failed to export campaign', 'error');
        }
    }

    /**
     * Handle import file selection
     */
    handleImportFileSelection(file, selectedFileName, importPreview, importBtn) {
        selectedFileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.previewImportData = importData;
                this.showImportPreview(importData, importPreview, importBtn);
            } catch (error) {
                logger.error('Failed to parse import file:', error);
                showToast('Invalid save file format', 'error');
                selectedFileName.textContent = 'Invalid file selected';
                importPreview.style.display = 'none';
                importBtn.style.display = 'none';
            }
        };
        reader.readAsText(file);
    }

    /**
     * Show import preview
     */
    showImportPreview(importData, importPreview, importBtn) {
        // Update preview info
        const previewCharacterName = document.getElementById('preview-character-name');
        const previewCharacterLevel = document.getElementById('preview-character-level');
        const previewCampaignSetting = document.getElementById('preview-campaign-setting');
        const previewExportedDate = document.getElementById('preview-exported-date');

        if (previewCharacterName) previewCharacterName.textContent = importData.character?.name || 'Unnamed';
        if (previewCharacterLevel) previewCharacterLevel.textContent = `Level ${importData.character?.level || 1}`;
        if (previewCampaignSetting) previewCampaignSetting.textContent = importData.campaign?.setting || 'Unknown';
        if (previewExportedDate) previewExportedDate.textContent = importData.exported_at ? formatTimestamp(importData.exported_at) : 'Unknown';

        // Show preview and import button
        importPreview.style.display = 'block';
        importBtn.style.display = 'block';
    }

    /**
     * Import campaign from file
     */
    importCampaign() {
        if (!this.previewImportData) {
            showToast('No file selected for import', 'error');
            return;
        }

        // Show confirmation dialog
        const confirmed = confirm(
            '⚠️ This will replace your current campaign progress!\n\n' +
            'Are you sure you want to import this campaign? ' +
            'Consider exporting your current campaign first if you want to keep it.'
        );

        if (!confirmed) {
            return;
        }

        try {
            // Import the data
            gameState.import(JSON.stringify(this.previewImportData));
            
            // Update UI
            this.updateCharacterDisplay();
            
            // Close modal
            this.closeModal('import-export-modal');
            
            showToast('Campaign imported successfully!', 'success');
            logger.info('Campaign imported successfully');

            // Refresh the page to ensure all UI is updated
            setTimeout(() => {
                if (confirm('Campaign imported! The page will refresh to update all displays.')) {
                    window.location.reload();
                }
            }, 1000);
        } catch (error) {
            logger.error('Failed to import campaign:', error);
            showToast('Failed to import campaign', 'error');
        }
    }
    
    /**
     * Update character display in sidebar
     */
    updateCharacterDisplay() {
        const character = gameState.getCharacter();
        
        // Update character name
        const nameElement = document.getElementById('character-name');
        if (nameElement) {
            nameElement.textContent = character.name || 'Character';
        }
        
        // Update level badge
        const levelElement = document.getElementById('character-level');
        if (levelElement) {
            levelElement.textContent = `Level ${character.level || 1}`;
        }
        
        // Update health bar
        const healthFill = document.getElementById('health-bar-fill');
        const healthText = document.getElementById('health-text');
        if (healthFill && healthText) {
            const current = character.health?.current || 100;
            const maximum = character.health?.maximum || 100;
            const percentage = (current / maximum) * 100;
            
            healthFill.style.width = `${percentage}%`;
            healthText.textContent = `${current}/${maximum}`;
            
            // Update color based on health percentage
            if (percentage > 75) {
                healthFill.style.background = 'linear-gradient(90deg, var(--success-color), #66BB6A)';
            } else if (percentage > 25) {
                healthFill.style.background = 'linear-gradient(90deg, var(--warning-color), #FFB74D)';
            } else {
                healthFill.style.background = 'linear-gradient(90deg, var(--error-color), #E57373)';
            }
        }
        
        // Update stats summary
        const statsContainer = document.getElementById('stats-summary');
        if (statsContainer && character.stats) {
            statsContainer.innerHTML = Object.entries(character.stats).map(([stat, value]) => `
                <div class="stat-item">
                    <div class="stat-label">${stat.toUpperCase()}</div>
                    <div class="stat-value">${value}</div>
                </div>
            `).join('');
        }
    }
    
    /**
     * Show level up modal
     */
    showLevelUpModal(data) {
        // Create temporary modal for level up
        const modal = createElement('div', {
            className: 'modal active',
            innerHTML: `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🎉 Level Up! 🎉</h2>
                    </div>
                    <div class="modal-body">
                        <div class="level-up-content">
                            <h3>Congratulations!</h3>
                            <p>You have reached <strong>Level ${data.newLevel}</strong>!</p>
                            <p>Experience: ${data.experience} XP</p>
                            
                            <div class="level-up-benefits">
                                <h4>New Benefits:</h4>
                                <ul>
                                    <li>Increased health and abilities</li>
                                    <li>Access to new skills</li>
                                    <li>Enhanced character capabilities</li>
                                </ul>
                            </div>
                            
                            <button class="btn btn-primary" id="close-levelup">Continue Adventure</button>
                        </div>
                    </div>
                </div>
            `
        });
        
        document.body.appendChild(modal);
        
        // Auto close after celebration
        modal.querySelector('#close-levelup').addEventListener('click', () => {
            modal.remove();
        });
        
        // Play level up sound
        if (typeof audioManager !== 'undefined' && audioManager.playSFX) {
            audioManager.playSFX('levelup');
        }
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }
    
    /**
     * Generate campaign story HTML for settings
     */
    generateCampaignStoryHTML() {
        if (typeof aiManager === 'undefined' || !aiManager.hasCampaignStory()) {
            return `
                <div class="campaign-story-empty">
                    <p><em>No campaign story generated yet.</em></p>
                    <button type="button" class="btn btn-primary" onclick="uiManager.generateCampaignStory()">
                        📚 Generate Campaign Story
                    </button>
                </div>
            `;
        }
        
        const story = aiManager.getCampaignStory();
        return `
            <div class="campaign-story-display">
                <div class="story-header">
                    <h4>📚 ${story.title}</h4>
                    <button type="button" class="btn btn-secondary btn-small" onclick="uiManager.regenerateCampaignStory()">
                        🔄 Regenerate
                    </button>
                </div>
                
                <div class="story-content">
                    <p><strong>Plot:</strong> ${story.plot}</p>
                    <p><strong>Starting Situation:</strong> ${story.start}</p>
                    <p><strong>Key Locations:</strong> ${story.locations.join(', ')}</p>
                    <p><strong>Main Antagonist:</strong> ${story.antagonist}</p>
                    <p><strong>Stakes:</strong> ${story.stakes}</p>
                    <p><strong>Personal Hook:</strong> ${story.hook}</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate a new campaign story
     */
    async generateCampaignStory() {
        if (typeof aiManager === 'undefined') {
            showToast('AI Manager not available', 'error');
            return;
        }
        
        showToast('Generating campaign story...', 'info');
        
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            // Get setting data
            let settingData = null;
            if (typeof characterManager !== 'undefined' && campaign.setting) {
                settingData = characterManager.settings[campaign.setting];
            }
            
            await aiManager.generateCampaignStory(character, settingData);
            
            // Refresh the settings modal if it's open
            const modal = document.getElementById('settings-modal');
            if (modal && modal.classList.contains('active')) {
                this.openSettingsModal();
            }
            
            showToast('Campaign story generated!', 'success');
        } catch (error) {
            console.error('Failed to generate campaign story:', error);
            showToast('Failed to generate campaign story', 'error');
        }
    }
    
    /**
     * Regenerate the campaign story
     */
    async regenerateCampaignStory() {
        if (typeof aiManager === 'undefined') {
            showToast('AI Manager not available', 'error');
            return;
        }
        
        showToast('Regenerating campaign story...', 'info');
        
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            // Get setting data
            let settingData = null;
            if (typeof characterManager !== 'undefined' && campaign.setting) {
                settingData = characterManager.settings[campaign.setting];
            }
            
            await aiManager.regenerateCampaignStory(character, settingData);
            
            // Refresh the settings modal
            const modal = document.getElementById('settings-modal');
            if (modal && modal.classList.contains('active')) {
                this.openSettingsModal();
            }
            
            showToast('Campaign story regenerated!', 'success');
        } catch (error) {
            console.error('Failed to regenerate campaign story:', error);
            showToast('Failed to regenerate campaign story', 'error');
        }
    }
}

// Initialize UI manager
const uiManager = new UIManager();

// Export to global scope
window.UIManager = UIManager;
window.uiManager = uiManager;
window.debugScreens = () => uiManager.debugScreenStates();
