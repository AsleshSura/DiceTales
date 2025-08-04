/**
 * DiceTales - Audio System
 * Background music and sound effects
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        this.currentMusic = null;
        this.soundCache = new Map();
        this.initialized = false;
        
        // Don't initialize audio context until user interaction
        this.setupUserInteractionHandler();
    }
    
    /**
     * Setup handler to initialize audio on first user interaction
     */
    setupUserInteractionHandler() {
        const initializeAudio = () => {
            if (!this.initialized) {
                this.init();
                document.removeEventListener('click', initializeAudio);
                document.removeEventListener('keydown', initializeAudio);
                document.removeEventListener('touchstart', initializeAudio);
            }
        };
        
        document.addEventListener('click', initializeAudio);
        document.addEventListener('keydown', initializeAudio);
        document.addEventListener('touchstart', initializeAudio);
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load settings from game state
            this.loadSettings();
            
            // Bind events
            this.bindEvents();
            
            this.initialized = true;
            logger.info('Audio system initialized after user interaction');
            
            // Show user that audio is now available
            if (typeof showToast !== 'undefined') {
                showToast('🔊 Audio system ready!', 'success');
            }
            
            // Emit event that audio is ready
            if (typeof eventBus !== 'undefined') {
                eventBus.emit('audio:ready');
            }
            
            // Auto-start background music if enabled
            const audioSettings = gameState.getSetting('audio_settings');
            if (audioSettings?.music_enabled !== false) {
                this.startBackgroundMusic();
            }
            
        } catch (error) {
            logger.error('Failed to initialize audio system:', error);
        }
    }
    
    loadSettings() {
        const audioSettings = gameState.getSetting('audio_settings');
        if (audioSettings) {
            this.musicVolume = audioSettings.music_volume || 0.3;
            this.sfxVolume = audioSettings.sfx_volume || 0.7;
            this.musicEnabled = audioSettings.music_enabled !== false;
            this.sfxEnabled = audioSettings.sfx_enabled !== false;
        }
    }
    
    bindEvents() {
        // Listen for game events
        eventBus.on('campaign:start', () => this.playBackgroundMusic('adventure'));
        eventBus.on('dice:rolled', (data) => this.playDiceSound(data.dice));
        eventBus.on('character:levelUp', () => this.playSFX('levelup'));
        eventBus.on('ui:buttonClick', () => this.playSFX('click'));
        
        // Settings changes
        eventBus.on('settings:audioChanged', (settings) => {
            this.updateSettings(settings);
        });
        
        // Handle page visibility for audio context
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAll();
            } else {
                this.resumeAll();
            }
        });
    }
    
    /**
     * Play background music
     */
    async playBackgroundMusic(track) {
        if (!this.initialized || !this.musicEnabled || !this.audioContext) return;
        
        try {
            // Stop current music
            if (this.currentMusic) {
                this.fadeOut(this.currentMusic);
            }
            
            // For now, create a simple ambient sound
            // In a full implementation, this would load actual music files
            this.currentMusic = this.createAmbientSound();
            
            logger.info(`Playing background music: ${track}`);
        } catch (error) {
            logger.warn('Failed to play background music:', error);
        }
    }
    
    /**
     * Start background music (alias for playBackgroundMusic)
     */
    startBackgroundMusic(track = 'adventure') {
        return this.playBackgroundMusic(track);
    }
    
    /**
     * Pause background music
     */
    pauseBackgroundMusic() {
        if (!this.initialized || !this.currentMusic) return;
        
        try {
            if (this.currentMusic.source) {
                this.currentMusic.source.stop();
                this.currentMusic = null;
            }
        } catch (error) {
            logger.warn('Failed to pause background music:', error);
        }
    }
    
    /**
     * Resume background music
     */
    resumeBackgroundMusic() {
        if (!this.initialized || !this.musicEnabled) return;
        
        this.startBackgroundMusic();
    }
    
    /**
     * Play dice rolling sound
     */
    playDiceSound(diceTypes) {
        if (!this.sfxEnabled) return;
        
        // Create different sounds for different dice
        diceTypes.forEach((dice, index) => {
            setTimeout(() => {
                this.playSFX('dice', this.getDiceFrequency(dice));
            }, index * 100);
        });
    }
    
    /**
     * Play sound effect
     */
    playSFX(soundType, frequency = 440) {
        if (!this.initialized || !this.sfxEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configure sound based on type
            switch (soundType) {
                case 'dice':
                    this.configureDiceSound(oscillator, gainNode, frequency);
                    break;
                case 'click':
                    this.configureClickSound(oscillator, gainNode);
                    break;
                case 'success':
                    this.configureSuccessSound(oscillator, gainNode);
                    break;
                case 'error':
                    this.configureErrorSound(oscillator, gainNode);
                    break;
                case 'levelup':
                    this.configureLevelUpSound(oscillator, gainNode);
                    break;
                default:
                    this.configureDefaultSound(oscillator, gainNode);
            }
            
            oscillator.start();
            
        } catch (error) {
            logger.warn('Failed to play SFX:', error);
        }
    }
    
    /**
     * Configure dice rolling sound
     */
    configureDiceSound(oscillator, gainNode, frequency) {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * 0.5, 
            this.audioContext.currentTime + 0.1
        );
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * Configure click sound
     */
    configureClickSound(oscillator, gainNode) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * Configure success sound
     */
    configureSuccessSound(oscillator, gainNode) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    /**
     * Configure error sound
     */
    configureErrorSound(oscillator, gainNode) {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Configure level up sound
     */
    configureLevelUpSound(oscillator, gainNode) {
        oscillator.type = 'sine';
        
        // Play ascending scale
        const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale
        let time = this.audioContext.currentTime;
        
        notes.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, time + index * 0.1);
        });
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
        
        oscillator.stop(this.audioContext.currentTime + 0.8);
    }
    
    /**
     * Configure default sound
     */
    configureDefaultSound(oscillator, gainNode) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * Get frequency for dice type
     */
    getDiceFrequency(diceType) {
        const frequencies = {
            'd4': 880,   // High pitch for small die
            'd6': 660,   // Medium-high
            'd8': 523,   // Medium
            'd10': 440,  // Medium-low
            'd12': 330,  // Low
            'd20': 220,  // Lower
            'd100': 165  // Lowest
        };
        return frequencies[diceType] || 440;
    }
    
    /**
     * Create ambient background sound
     */
    createAmbientSound() {
        if (!this.audioContext) return null;
        
        try {
            // Create a simple ambient drone
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(65, this.audioContext.currentTime); // Low C
            
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(98, this.audioContext.currentTime); // Low G
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            
            oscillator1.connect(filter);
            oscillator2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 2);
            
            oscillator1.start();
            oscillator2.start();
            
            return { oscillator1, oscillator2, gainNode };
            
        } catch (error) {
            logger.warn('Failed to create ambient sound:', error);
            return null;
        }
    }
    
    /**
     * Fade out audio
     */
    fadeOut(audioNodes) {
        if (!audioNodes || !this.audioContext) return;
        
        try {
            const { gainNode, oscillator1, oscillator2 } = audioNodes;
            
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
            
            setTimeout(() => {
                oscillator1.stop();
                oscillator2.stop();
            }, 1000);
            
        } catch (error) {
            logger.warn('Failed to fade out audio:', error);
        }
    }
    
    /**
     * Update audio settings
     */
    updateSettings(settings) {
        this.musicVolume = settings.music_volume ?? this.musicVolume;
        this.sfxVolume = settings.sfx_volume ?? this.sfxVolume;
        this.musicEnabled = settings.music_enabled ?? this.musicEnabled;
        this.sfxEnabled = settings.sfx_enabled ?? this.sfxEnabled;
        
        // Update current music volume
        if (this.currentMusic && this.currentMusic.gainNode) {
            this.currentMusic.gainNode.gain.setValueAtTime(
                this.musicEnabled ? this.musicVolume * 0.1 : 0,
                this.audioContext.currentTime
            );
        }
        
        // Save to game state
        gameState.setSetting('audio_settings', {
            music_volume: this.musicVolume,
            sfx_volume: this.sfxVolume,
            music_enabled: this.musicEnabled,
            sfx_enabled: this.sfxEnabled
        });
    }
    
    /**
     * Pause all audio
     */
    pauseAll() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }
    
    /**
     * Resume all audio
     */
    resumeAll() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Ensure audio context is ready
     */
    async ensureReady() {
        try {
            // If not initialized yet, audio will be initialized on first user interaction
            if (!this.initialized) {
                logger.info('Audio system waiting for user interaction');
                return true;
            }
            
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                logger.info('Audio context resumed');
            }
            return true;
        } catch (error) {
            logger.error('Failed to ensure audio ready:', error);
            return false;
        }
    }
    
    /**
     * Cleanup audio resources
     */
    cleanup() {
        try {
            if (this.backgroundMusic && this.backgroundMusic.source) {
                this.backgroundMusic.source.stop();
            }
            
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            
            logger.info('Audio manager cleaned up');
        } catch (error) {
            logger.warn('Audio cleanup failed:', error);
        }
    }
    
    /**
     * Get current settings
     */
    getSettings() {
        return {
            music_volume: this.musicVolume,
            sfx_volume: this.sfxVolume,
            music_enabled: this.musicEnabled,
            sfx_enabled: this.sfxEnabled
        };
    }
}

// Initialize audio manager
const audioManager = new AudioManager();

// Export to global scope
window.AudioManager = AudioManager;
window.audioManager = audioManager;
