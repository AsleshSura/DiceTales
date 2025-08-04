/**
 * DiceTales - System Integration Verification
 * Ensures all systems are properly connected and functioning
 */

class SystemIntegration {
    constructor() {
        this.systems = {};
        this.eventMappings = new Map();
        this.initialized = false;
    }

    /**
     * Initialize system integration checks
     */
    initialize() {
        if (this.initialized) return;

        logger.info('🔗 Initializing system integration verification...');

        // Register all systems
        this.registerSystems();
        
        // Set up event monitoring
        this.setupEventMonitoring();
        
        // Verify integrations
        this.verifyIntegrations();
        
        this.initialized = true;
        logger.info('✅ System integration verification complete');
    }

    /**
     * Register all available systems
     */
    registerSystems() {
        const systemList = [
            'gameState',
            'characterManager', 
            'characterDataManager',
            'diceSystem',
            'aiManager',
            'audioManager',
            'uiManager',
            'memoryManager'
        ];

        systemList.forEach(systemName => {
            if (typeof window[systemName] !== 'undefined') {
                this.systems[systemName] = window[systemName];
                logger.debug(`✅ System registered: ${systemName}`);
            } else {
                logger.warn(`⚠️ System not found: ${systemName}`);
            }
        });
    }

    /**
     * Set up event monitoring to track system communication
     */
    setupEventMonitoring() {
        if (!eventBus) return;

        const criticalEvents = [
            'character:created',
            'character:changed',
            'gameState:loaded',
            'gameState:imported',
            'campaign:start',
            'player:action',
            'dice:rolled',
            'ui:buttonClick'
        ];

        criticalEvents.forEach(eventName => {
            eventBus.on(eventName, (data) => {
                logger.debug(`📡 Event: ${eventName}`, data);
                this.eventMappings.set(eventName, Date.now());
            });
        });
    }

    /**
     * Verify system integrations are working
     */
    verifyIntegrations() {
        const integrations = [
            this.verifyGameStateIntegration(),
            this.verifyCharacterIntegration(),
            this.verifyAIIntegration(),
            this.verifyUIIntegration(),
            this.verifyDiceIntegration()
        ];

        const failed = integrations.filter(result => !result.success);
        
        if (failed.length > 0) {
            logger.warn('⚠️ Some integrations failed:', failed);
        } else {
            logger.info('✅ All system integrations verified successfully');
        }

        return failed.length === 0;
    }

    /**
     * Verify GameState integration
     */
    verifyGameStateIntegration() {
        try {
            if (!this.systems.gameState) {
                return { success: false, system: 'gameState', error: 'System not available' };
            }

            // Test basic functionality
            const character = this.systems.gameState.getCharacter();
            const canSave = typeof this.systems.gameState.save === 'function';
            const canLoad = typeof this.systems.gameState.load === 'function';

            return { 
                success: canSave && canLoad,
                system: 'gameState',
                details: { hasCharacter: !!character, canSave, canLoad }
            };
        } catch (error) {
            return { success: false, system: 'gameState', error: error.message };
        }
    }

    /**
     * Verify Character system integration
     */
    verifyCharacterIntegration() {
        try {
            const hasManager = !!this.systems.characterManager;
            const hasDataManager = !!this.systems.characterDataManager;
            
            if (!hasManager) {
                return { success: false, system: 'character', error: 'CharacterManager not available' };
            }

            // Test if character creation is available
            const hasCreation = typeof this.systems.characterManager.showCharacterCreation === 'function';

            return {
                success: hasCreation,
                system: 'character',
                details: { hasManager, hasDataManager, hasCreation }
            };
        } catch (error) {
            return { success: false, system: 'character', error: error.message };
        }
    }

    /**
     * Verify AI system integration
     */
    verifyAIIntegration() {
        try {
            if (!this.systems.aiManager) {
                return { success: true, system: 'ai', details: 'AI system is optional' };
            }

            const hasProcessAction = typeof this.systems.aiManager.processPlayerAction === 'function';
            const hasMemoryIntegration = !!this.systems.aiManager.memoryManager;

            return {
                success: hasProcessAction,
                system: 'ai',
                details: { hasProcessAction, hasMemoryIntegration }
            };
        } catch (error) {
            return { success: false, system: 'ai', error: error.message };
        }
    }

    /**
     * Verify UI system integration
     */
    verifyUIIntegration() {
        try {
            if (!this.systems.uiManager) {
                return { success: false, system: 'ui', error: 'UIManager not available' };
            }

            const hasModalSystem = typeof this.systems.uiManager.openModal === 'function';
            const hasToast = typeof window.showToast === 'function';

            return {
                success: hasModalSystem && hasToast,
                system: 'ui',
                details: { hasModalSystem, hasToast }
            };
        } catch (error) {
            return { success: false, system: 'ui', error: error.message };
        }
    }

    /**
     * Verify Dice system integration
     */
    verifyDiceIntegration() {
        try {
            if (!this.systems.diceSystem) {
                return { success: false, system: 'dice', error: 'DiceSystem not available' };
            }

            const hasConfig = !!this.systems.diceSystem.diceConfig;
            const hasRoll = typeof this.systems.diceSystem.rollDice === 'function';

            return {
                success: hasConfig || hasRoll,
                system: 'dice',
                details: { hasConfig, hasRoll }
            };
        } catch (error) {
            return { success: false, system: 'dice', error: error.message };
        }
    }

    /**
     * Get integration status report
     */
    getStatusReport() {
        return {
            systems: Object.keys(this.systems),
            eventActivity: Object.fromEntries(this.eventMappings),
            timestamp: new Date().toISOString()
        };
    }
}

// Create global instance for debugging
const systemIntegration = new SystemIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => systemIntegration.initialize(), 500);
    });
} else {
    setTimeout(() => systemIntegration.initialize(), 500);
}

// Export to global scope
window.SystemIntegration = SystemIntegration;
window.systemIntegration = systemIntegration;
window.checkIntegration = () => systemIntegration.getStatusReport();

logger.info('📦 System Integration module loaded');
