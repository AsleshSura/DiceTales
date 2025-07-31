/**
 * DiceTales - AI Integration
 * HackClub AI API integration for dynamic storytelling
 */

class AIManager {
    constructor() {
        this.apiUrl = 'https://ai.hackclub.com/chat/completions';
        this.model = 'Qwen/Qwen2.5-32B-Instruct';
        this.conversationHistory = [];
        this.maxTokens = 4000;
        this.isProcessing = false;
        this.initialized = false;
        
        this.init();
    }
    
    /**
     * Initialize the AI system
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Test API connection
            await this.testConnection();
            this.initialized = true;
            logger.info('AI system initialized successfully');
        } catch (error) {
            logger.warn('AI system initialization failed, using fallback mode:', error);
            // Continue in fallback mode
        }
    }
    
    /**
     * Test API connection
     */
    async testConnection() {
        const testRequest = {
            model: this.model,
            messages: [
                { role: 'user', content: 'Test connection' }
            ],
            max_tokens: 10
        };
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testRequest)
        });
        
        if (!response.ok) {
            throw new Error(`API test failed: ${response.status}`);
        }
        
        return true;
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        eventBus.on('campaign:start', () => this.startCampaign());
        eventBus.on('player:action', (data) => this.processPlayerAction(data));
        eventBus.on('dice:rolled', (data) => this.processDiceRoll(data));
    }
    
    /**
     * Start a new campaign with initial story
     */
    async startCampaign() {
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            const systemPrompt = this.buildSystemPrompt();
            const startPrompt = this.buildStartPrompt(character, campaign);
            
            const response = await this.callAI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: startPrompt }
            ]);
            
            if (response) {
                this.displayStoryContent(response, 'dm-response');
                gameState.set('campaign.story_state', response);
                gameState.addToCampaignLog({
                    type: 'story_start',
                    content: response,
                    character: character.name
                });
            }
            
        } catch (error) {
            logger.error('Failed to start campaign:', error);
            this.showFallbackStart();
        }
    }
    
    /**
     * Process player action and get AI response
     */
    async processPlayerAction(actionData) {
        if (this.isProcessing) {
            showToast('Please wait for the current action to complete', 'warning');
            return;
        }
        
        this.isProcessing = true;
        this.showTypingIndicator();
        
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            // Build context
            const context = this.buildActionContext(character, campaign, actionData);
            
            // Get AI response
            const response = await this.callAI([
                { role: 'system', content: this.buildSystemPrompt() },
                { role: 'user', content: context }
            ]);
            
            if (response) {
                // Display player action first
                this.displayStoryContent(actionData.action, 'player-action');
                
                // Then display AI response
                setTimeout(() => {
                    this.displayStoryContent(response, 'dm-response');
                    this.generateActionOptions();
                }, 1000);
                
                // Update game state
                gameState.set('campaign.story_state', response);
                gameState.addChoice(actionData.action, response);
                gameState.addToCampaignLog({
                    type: 'player_action',
                    content: actionData.action
                });
                gameState.addToCampaignLog({
                    type: 'dm_response',
                    content: response
                });
            }
            
        } catch (error) {
            logger.error('Failed to process player action:', error);
            this.showFallbackResponse(actionData.action);
        } finally {
            this.isProcessing = false;
            this.hideTypingIndicator();
        }
    }
    
    /**
     * Process dice roll results
     */
    async processDiceRoll(rollData) {
        // This would be called when dice are rolled for skill checks
        // The AI would interpret the results and continue the story
        
        const character = gameState.getCharacter();
        const currentStory = gameState.get('campaign.story_state');
        
        const rollContext = `
            DICE ROLL RESULT:
            Dice: ${rollData.dice.join(', ')}
            Total: ${rollData.total}
            ${rollData.critical ? 'CRITICAL SUCCESS!' : ''}
            ${rollData.fumble ? 'CRITICAL FAILURE!' : ''}
            
            Current situation: ${currentStory}
            
            Interpret this dice roll result and continue the story accordingly.
            ${rollData.critical ? 'Make this an exceptional success with dramatic positive consequences.' : ''}
            ${rollData.fumble ? 'Make this a dramatic failure with interesting complications.' : ''}
        `;
        
        try {
            const response = await this.callAI([
                { role: 'system', content: this.buildSystemPrompt() },
                { role: 'user', content: rollContext }
            ]);
            
            if (response) {
                this.displayStoryContent(`🎲 Rolled ${rollData.total}`, 'dice-result');
                setTimeout(() => {
                    this.displayStoryContent(response, 'dm-response');
                    this.generateActionOptions();
                }, 500);
                
                gameState.set('campaign.story_state', response);
            }
            
        } catch (error) {
            logger.error('Failed to process dice roll:', error);
        }
    }
    
    /**
     * Build system prompt based on game state
     */
    buildSystemPrompt() {
        const campaign = gameState.getCampaign();
        const character = gameState.getCharacter();
        const setting = campaign.setting;
        const difficulty = campaign.dm_difficulty;
        
        const settingData = characterManager?.settings?.[setting] || {};
        
        return `You are an expert Dungeon Master running a ${settingData.name || 'fantasy'} campaign. 

SETTING: ${settingData.description || 'Fantasy adventure'}
DIFFICULTY: ${difficulty} - ${this.getDifficultyDescription(difficulty)}
CUSTOM PERSONALITY: ${campaign.dm_custom_prompt || 'Standard DM approach'}

PLAYER CHARACTER:
- Name: ${character.name || 'Adventurer'}
- Class: ${character.class || 'Unknown'}
- Level: ${character.level || 1}
- Health: ${character.health?.current || 100}/${character.health?.maximum || 100}
- Stats: STR ${character.stats?.str || 10}, DEX ${character.stats?.dex || 10}, CON ${character.stats?.con || 10}, INT ${character.stats?.int || 10}, WIS ${character.stats?.wis || 10}, CHA ${character.stats?.cha || 10}

IMPORTANT RULES:
1. Always respond in character as the DM
2. Describe scenes vividly using all five senses
3. Ask for dice rolls when appropriate (format: "Roll d20 + [modifier] for [skill]")
4. Remember all previous events and reference them naturally
5. Create meaningful consequences for player choices
6. Generate realistic NPCs with distinct personalities
7. Balance challenge appropriately for the difficulty level
8. Keep responses engaging but concise (2-4 paragraphs)
9. End responses by either asking what the player wants to do OR providing 3-4 specific action options
10. Stay true to the ${settingData.name || 'fantasy'} setting

CAMPAIGN CONTEXT:
${this.buildCampaignContext()}

Maintain immersion and create an engaging narrative experience!`;
    }
    
    /**
     * Build campaign context from history
     */
    buildCampaignContext() {
        const campaign = gameState.getCampaign();
        const recentLog = campaign.campaign_log?.slice(-10) || [];
        
        let context = '';
        
        if (campaign.current_location) {
            context += `Current Location: ${campaign.current_location}\n`;
        }
        
        if (recentLog.length > 0) {
            context += '\nRECENT EVENTS:\n';
            recentLog.forEach(entry => {
                context += `- ${entry.content?.substring(0, 100)}...\n`;
            });
        }
        
        if (campaign.npcs_encountered?.length > 0) {
            context += '\nKNOWN NPCs:\n';
            campaign.npcs_encountered.forEach(npc => {
                context += `- ${npc.name}: ${npc.relationship || 'neutral'}\n`;
            });
        }
        
        return context || 'This is the beginning of the adventure.';
    }
    
    /**
     * Build start prompt for new campaign
     */
    buildStartPrompt(character, campaign) {
        const setting = characterManager?.settings?.[campaign.setting] || {};
        
        return `Start an epic ${setting.name} adventure for ${character.name}, a level ${character.level} ${character.class}.

Create an engaging opening scene that:
1. Establishes the setting and atmosphere
2. Introduces an initial challenge or mystery
3. Gives the character a clear motivation to act
4. Includes vivid sensory details
5. Sets up potential for interesting choices

Begin the adventure now!`;
    }
    
    /**
     * Build action context
     */
    buildActionContext(character, campaign, actionData) {
        return `PLAYER ACTION: ${actionData.action}

Current story state: ${campaign.story_state || 'Beginning of adventure'}

Process this action and respond as the DM. Consider:
- Character abilities and stats
- Current health and resources
- Setting-appropriate consequences
- Opportunities for character growth
- Ways to advance the story

Respond with the outcome of this action and what happens next.`;
    }
    
    /**
     * Get difficulty description
     */
    getDifficultyDescription(difficulty) {
        const descriptions = {
            'easy': 'Forgiving and helpful, guide players toward success',
            'medium': 'Balanced challenge, fair but not hand-holding',
            'hard': 'Unforgiving with realistic consequences and deadly encounters'
        };
        return descriptions[difficulty] || descriptions.medium;
    }
    
    /**
     * Call AI API
     */
    async callAI(messages) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: this.maxTokens,
                    temperature: 0.8,
                    stream: false
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            
            if (!content) {
                throw new Error('No content in AI response');
            }
            
            // Add to conversation history
            this.conversationHistory.push(...messages, {
                role: 'assistant',
                content: content
            });
            
            // Trim history if too long
            this.trimConversationHistory();
            
            return content;
            
        } catch (error) {
            logger.error('AI API call failed:', error);
            throw error;
        }
    }
    
    /**
     * Trim conversation history to manage token limits
     */
    trimConversationHistory() {
        // Keep system message and last 20 exchanges
        if (this.conversationHistory.length > 41) {
            const systemMessage = this.conversationHistory[0];
            const recentMessages = this.conversationHistory.slice(-40);
            this.conversationHistory = [systemMessage, ...recentMessages];
        }
    }
    
    /**
     * Display story content in the UI
     */
    displayStoryContent(content, type = 'dm-response') {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const messageElement = createElement('div', {
            className: type,
            innerHTML: formatText(content)
        });
        
        storyContent.appendChild(messageElement);
        
        // Scroll to bottom
        const storyDisplay = document.getElementById('story-display');
        if (storyDisplay) {
            storyDisplay.scrollTop = storyDisplay.scrollHeight;
        }
        
        // Animate in
        animateElement(messageElement, 'slide-in-up');
    }
    
    /**
     * Generate action options
     */
    async generateActionOptions() {
        const actionButtons = document.getElementById('action-buttons');
        if (!actionButtons) return;
        
        // For now, show generic options
        // In a full implementation, the AI would generate contextual options
        const options = [
            'Look around carefully',
            'Talk to someone nearby',
            'Search for clues',
            'Move forward cautiously'
        ];
        
        actionButtons.innerHTML = options.map(option => `
            <button class="action-btn" data-action="${option}">
                ${option}
            </button>
        `).join('');
        
        // Bind click events
        actionButtons.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                eventBus.emit('player:action', { action });
            });
        });
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        const indicator = createElement('div', {
            className: 'dm-response typing-indicator',
            innerHTML: '<em>The DM is thinking...</em> <span class="dots">...</span>'
        });
        
        indicator.id = 'typing-indicator';
        storyContent.appendChild(indicator);
        
        // Scroll to bottom
        const storyDisplay = document.getElementById('story-display');
        if (storyDisplay) {
            storyDisplay.scrollTop = storyDisplay.scrollHeight;
        }
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    /**
     * Show fallback content when AI fails
     */
    showFallbackStart() {
        const fallbackContent = `
            Welcome to your adventure! The world stretches out before you, full of mysteries and opportunities.
            
            You find yourself at the beginning of what promises to be an epic journey. The path ahead is uncertain,
            but your skills and determination will guide you through whatever challenges await.
            
            What would you like to do first?
        `;
        
        this.displayStoryContent(fallbackContent, 'dm-response');
        this.generateActionOptions();
    }
    
    /**
     * Show fallback response when AI fails
     */
    showFallbackResponse(action) {
        const fallbackContent = `
            You ${action.toLowerCase()}. The world responds to your actions in ways both expected and surprising.
            Your choice has set new events in motion.
            
            What do you do next?
        `;
        
        this.displayStoryContent(fallbackContent, 'dm-response');
        this.generateActionOptions();
        
        showToast('AI temporarily unavailable, using fallback response', 'warning');
    }
}

// Initialize AI manager
const aiManager = new AIManager();

// Export to global scope
window.aiManager = aiManager;
