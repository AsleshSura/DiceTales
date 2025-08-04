/**
 * Better DM Demo Script
 * Quick demonstration and testing script for the Better DM system
 */

class BetterDMDemo {
    constructor() {
        this.demoSteps = [];
        this.currentStep = 0;
        this.isRunning = false;
        this.logger = window.logger || console;
    }
    
    /**
     * Initialize demo scenarios
     */
    initializeDemo() {
        this.demoSteps = [
            {
                name: 'Setup Campaign',
                description: 'Create a sample campaign for demonstration',
                action: () => this.setupDemoCampaign(),
                waitForUser: false
            },
            {
                name: 'First Player Action',
                description: 'Simulate a player examining their surroundings',
                action: () => this.simulatePlayerAction("I carefully examine my surroundings, looking for any signs of danger or clues about what's happening."),
                waitForUser: true
            },
            {
                name: 'Follow Up Action',
                description: 'Player approaches an NPC',
                action: () => this.simulatePlayerAction("I approach the village elder cautiously and ask about the strange events that have been occurring."),
                waitForUser: true
            },
            {
                name: 'Combat Scenario',
                description: 'Player encounters a threat',
                action: () => this.simulatePlayerAction("I draw my weapon and prepare to defend myself against the approaching creature."),
                waitForUser: true
            },
            {
                name: 'Show Results',
                description: 'Display campaign roadmap and progress',
                action: () => this.showDemoResults(),
                waitForUser: false
            }
        ];
        
        this.logger.info('📋 Demo scenarios initialized');
    }
    
    /**
     * Start the demo
     */
    async startDemo() {
        if (this.isRunning) {
            this.logger.warn('Demo is already running');
            return;
        }
        
        this.isRunning = true;
        this.currentStep = 0;
        
        this.logger.info('🎬 Starting Better DM Demo...');
        
        try {
            await this.runDemoSteps();
            this.logger.info('✅ Demo completed successfully!');
        } catch (error) {
            this.logger.error('❌ Demo failed:', error);
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * Run demo steps sequentially
     */
    async runDemoSteps() {
        for (let i = 0; i < this.demoSteps.length; i++) {
            const step = this.demoSteps[i];
            this.currentStep = i;
            
            this.logger.info(`📍 Demo Step ${i + 1}: ${step.name}`);
            this.logger.info(`   Description: ${step.description}`);
            
            try {
                await step.action();
                
                if (step.waitForUser) {
                    await this.waitForAIResponse();
                }
                
                // Brief pause between steps
                await this.delay(1000);
                
            } catch (error) {
                this.logger.error(`Step ${i + 1} failed:`, error);
                throw error;
            }
        }
    }
    
    /**
     * Setup a demo campaign
     */
    async setupDemoCampaign() {
        const app = window.betterDMApp;
        if (!app) {
            throw new Error('Better DM App not found');
        }
        
        // Fill in demo data
        const campaignPrompt = `A mysterious plague of shadows has begun consuming the peaceful village of Millbrook. 
        Crops wither overnight, animals flee in terror, and strange whispers echo from the ancient forest. 
        The village elder speaks of an old curse and a forgotten tomb that may hold the key to salvation.
        This is a classic heroic fantasy adventure with mystery and exploration elements.`;
        
        const characterInfo = `Sir Marcus Lightbringer - Level 3 Human Paladin
        Background: Former city guard who left his post to help those in need
        Motivation: Protecting innocent people from supernatural threats
        Personality: Brave, compassionate, sometimes impulsive
        Equipment: Longsword, shield, chain mail, holy symbol
        Goals: Become a champion of good and justice
        Fears: Failing to protect those who depend on him`;
        
        // Set form values
        const promptField = document.getElementById('campaign-prompt');
        const characterField = document.getElementById('character-info');
        const lengthSelect = document.getElementById('campaign-length');
        const difficultySelect = document.getElementById('campaign-difficulty');
        const themeSelect = document.getElementById('campaign-theme');
        
        if (promptField) promptField.value = campaignPrompt;
        if (characterField) characterField.value = characterInfo;
        if (lengthSelect) lengthSelect.value = 'medium';
        if (difficultySelect) difficultySelect.value = 'normal';
        if (themeSelect) themeSelect.value = 'heroic';
        
        this.logger.info('📝 Demo campaign data filled in');
        
        // Trigger campaign creation
        await app.startCampaign();
        
        this.logger.info('🎯 Demo campaign created');
    }
    
    /**
     * Simulate a player action
     */
    async simulatePlayerAction(action) {
        const app = window.betterDMApp;
        if (!app) {
            throw new Error('Better DM App not found');
        }
        
        const inputField = document.getElementById('player-input');
        if (inputField) {
            inputField.value = action;
            
            // Highlight the input to show it's demo content
            inputField.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            inputField.style.border = '2px solid #ffd700';
            
            this.logger.info(`🎭 Demo Action: "${action}"`);
            
            // Submit the action
            await app.submitPlayerAction();
            
            // Reset input styling after a moment
            setTimeout(() => {
                if (inputField) {
                    inputField.style.backgroundColor = '';
                    inputField.style.border = '';
                }
            }, 2000);
        }
    }
    
    /**
     * Wait for AI response to complete
     */
    async waitForAIResponse() {
        const maxWait = 30000; // 30 seconds max
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            const app = window.betterDMApp;
            if (app && app.dmAI && !app.dmAI.isProcessing) {
                break;
            }
            await this.delay(500);
        }
        
        // Additional delay to let user see the response
        await this.delay(2000);
    }
    
    /**
     * Show demo results
     */
    showDemoResults() {
        const app = window.betterDMApp;
        if (!app || !app.dmAI) {
            this.logger.warn('Cannot show results - app not available');
            return;
        }
        
        // Show roadmap modal
        app.showRoadmapModal();
        
        // Log campaign state
        const campaignState = app.dmAI.getCampaignState();
        
        this.logger.info('📊 Demo Results:');
        this.logger.info('   Campaign:', campaignState.roadmap?.title);
        this.logger.info('   Current Chapter:', campaignState.chapterInfo?.title);
        this.logger.info('   Current Scene:', campaignState.sceneInfo?.title);
        this.logger.info('   Progress:', `${campaignState.progress.chaptersCompleted + 1}/${campaignState.progress.totalChapters} chapters`);
        
        // Show success message
        this.showDemoComplete();
    }
    
    /**
     * Show demo completion message
     */
    showDemoComplete() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 10001;
            border: 2px solid #ffd700;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        `;
        
        message.innerHTML = `
            <h2 style="color: #ffd700; margin-bottom: 15px;">🎉 Demo Complete!</h2>
            <p style="margin-bottom: 20px;">The Better DM demo has finished successfully.</p>
            <p style="margin-bottom: 20px;">You've seen:</p>
            <ul style="text-align: left; margin-bottom: 20px;">
                <li>Campaign generation with detailed roadmap</li>
                <li>AI responses that reference the campaign context</li>
                <li>Automatic progress tracking and scene advancement</li>
                <li>Roadmap adaptation based on player actions</li>
            </ul>
            <button onclick="this.parentElement.remove()" style="
                background: linear-gradient(45deg, #ff6b6b, #ffd700);
                color: #1a1a2e;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
            ">Close</button>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 10000);
    }
    
    /**
     * Stop the current demo
     */
    stopDemo() {
        this.isRunning = false;
        this.logger.info('🛑 Demo stopped');
    }
    
    /**
     * Reset demo state
     */
    resetDemo() {
        this.stopDemo();
        this.currentStep = 0;
        this.logger.info('🔄 Demo reset');
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get demo status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            currentStep: this.currentStep,
            totalSteps: this.demoSteps.length,
            stepName: this.demoSteps[this.currentStep]?.name || 'None'
        };
    }
}

// Auto-initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for other systems to initialize
    setTimeout(() => {
        window.betterDMDemo = new BetterDMDemo();
        window.betterDMDemo.initializeDemo();
        
        // Add demo controls to the page
        addDemoControls();
        
        window.logger?.info('🎬 Better DM Demo ready! Use window.betterDMDemo.startDemo() to begin.');
    }, 2000);
});

/**
 * Add demo control buttons to the page
 */
function addDemoControls() {
    // Only add controls in development mode
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return;
    }
    
    const controls = document.createElement('div');
    controls.id = 'demo-controls';
    controls.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px;
        border-radius: 10px;
        z-index: 1000;
        border: 1px solid #ffd700;
    `;
    
    controls.innerHTML = `
        <div style="color: #ffd700; font-weight: bold; margin-bottom: 10px;">Demo Controls</div>
        <button onclick="window.betterDMDemo?.startDemo()" style="
            background: #ffd700;
            color: black;
            border: none;
            padding: 5px 10px;
            margin: 2px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        ">Start Demo</button>
        <button onclick="window.betterDMDemo?.stopDemo()" style="
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 5px 10px;
            margin: 2px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        ">Stop Demo</button>
        <button onclick="window.betterDMDemo?.resetDemo()" style="
            background: #6b6bff;
            color: white;
            border: none;
            padding: 5px 10px;
            margin: 2px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        ">Reset Demo</button>
        <button onclick="this.parentElement.style.display='none'" style="
            background: #666;
            color: white;
            border: none;
            padding: 5px 10px;
            margin: 2px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        ">Hide</button>
    `;
    
    document.body.appendChild(controls);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BetterDMDemo;
}
