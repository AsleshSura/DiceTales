/**
 * DiceTales - AI Integration
 * HackClub AI API integration for dynamic storytelling
 */

class AIManager {
    constructor() {
        // HuggingFace AI Configuration (Primary and Only)
        this.useHuggingFace = window.AI_CONFIG?.USE_HUGGINGFACE !== false; // Default to true
        this.huggingFaceAI = null;
        
        // Legacy Gemini configuration (unused but kept for compatibility)
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.apiKey = window.AI_CONFIG?.GEMINI_API_KEY || null;
        this.model = 'gemini-1.5-flash';
        this.conversationHistory = [];
        this.maxTokens = 8000;
        this.isProcessing = false;
        this.initialized = false;
        
        // Initialize HuggingFace AI (Primary and Only)
        if (this.useHuggingFace && window.HuggingFaceAI) {
            this.huggingFaceAI = new HuggingFaceAI();
            console.log('🤗 HUGGINGFACE AI INITIALIZED - Primary AI system!');
        } else {
            console.error('🤗 HUGGINGFACE AI NOT AVAILABLE - Please check configuration');
        }
        
        // Separate AI processing flags
        this.isGeneratingStory = false;
        this.isGeneratingChoices = false;
        
        // Action-dice coordination system
        this.pendingAction = null;
        this.lastPlayerAction = null; // Track the last action for dice roll processing
        this.requiredDiceRoll = null;
        this.completedDiceRoll = null;
        this.actionState = 'ready'; // 'ready', 'waiting_for_dice', 'can_submit'
        
        this.init();
    }
    
    /**
     * Initialize the AI system
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('🔥 STARTING AI SYSTEM INITIALIZATION...');
        console.log('🔥 Available AI systems:', {
            huggingFaceAI: !!this.huggingFaceAI,
            hasGeminiKey: !!(this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY')
        });
        
        try {
            // Test AI system connections (non-blocking)
            console.log('🔥 Testing AI connections...');
            await this.testConnection();
            this.initialized = true;
            logger.info('✅ AI system initialized successfully');
            console.log('✅ AI SYSTEM READY FOR USE');
        } catch (error) {
            logger.warn('⚠️ AI system initialization had issues, but continuing with fallbacks:', error);
            console.warn('⚠️ AI initialization warning (continuing anyway):', error);
            this.initialized = true; // Still mark as initialized to use fallbacks
        }
    }
    
    /**
     * Test API connection - Updated to use available AI systems
     */
    async testConnection() {
        // Don't test Gemini API anymore - we have better alternatives
        console.log('🔥 TESTING AI SYSTEM CONNECTION...');
        
        // Test in order of preference: HuggingFace -> Simple -> Mock -> Gemini
        
        // Test HuggingFace AI first (best option)
        if (this.useHuggingFace && this.huggingFaceAI) {
            try {
                console.log('🤗 Testing HuggingFace AI connection...');
                const testResponse = await this.huggingFaceAI.generateStory('Testing connection', 'narrative');
                if (testResponse && testResponse.length > 20) {
                    console.log('🤗 HUGGINGFACE AI CONNECTION SUCCESSFUL');
                    return true;
                }
            } catch (error) {
                console.warn('🤗 HuggingFace AI test failed:', error);
            }
        }
        
        // Only HuggingFace AI is used now - no fallbacks
        console.log('🔥 Only HuggingFace AI configured - no fallback systems');
        return false; // Will show appropriate error to user
        
        // Only test Gemini if we have a proper API key
        if (this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY') {
            console.log('🔑 Testing Gemini API connection...');
            const testRequest = {
                contents: [{
                    parts: [{
                        text: 'Test connection - respond with just "OK"'
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 10,
                    temperature: 0.1
                }
            };
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testRequest)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.warn('🔑 Gemini API test failed:', response.status, errorText);
                throw new Error(`Gemini API test failed: ${response.status} - ${errorText}`);
            }
            
            console.log('🔑 GEMINI API CONNECTION SUCCESSFUL');
            return true;
        } else {
            console.log('🔑 No Gemini API key configured - using alternative AI systems');
        }
        
        // If we get here, at least one AI system should be working
        console.log('🔥 AI SYSTEM CONNECTION TEST COMPLETED - using available fallbacks');
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
            // Emit thinking state for dice system  
            eventBus.emit('ai:thinking');
            
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            const systemPrompt = this.buildSystemPrompt();
            const startPrompt = this.buildStartPrompt(character, campaign);
            
            const response = await this.callAI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: startPrompt },
                { role: 'user', content: '🚨 CRITICAL REMINDER: Start immediately with in-world story content. NO meta-commentary, NO analysis, NO "Okay so..." or "Let me..." - pure story only!' }
            ]);
            
            if (response) {
                this.displayStoryContent(response, 'dm-response');
                gameState.set('campaign.story_state', response);
                gameState.addToCampaignLog({
                    type: 'story_start',
                    content: response,
                    character: character.name
                });
                
                // Emit event for dice system to detect rolls
                eventBus.emit('ai:response', response);
                
                // Generate initial action options
                setTimeout(() => {
                    this.generateActionOptions();
                }, 1000);
            }
            
            // Emit complete state
            eventBus.emit('ai:complete');
            
        } catch (error) {
            logger.error('Failed to start campaign:', error);
            this.showFallbackStart();
            eventBus.emit('ai:complete');
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
        
        // Store the last player action for reference
        this.lastPlayerAction = actionData.action;
        console.log('🎯 Processing action with dice roll:', actionData);
        
        // Check if this is the new combined format (action + dice roll)
        if (actionData.diceRoll) {
            console.log('🎲 New format: Action + Dice Roll received together');
            await this.processActionWithDiceRoll(actionData);
            return;
        }
        
        // Legacy format handling (for backward compatibility)
        console.log('🎯 Legacy format: Action only');
        
        // If we're waiting for a dice roll, store the action and check requirements
        if (this.actionState === 'waiting_for_dice') {
            this.pendingAction = actionData;
            this.updateActionButtonStates();
            showToast('Action selected. Please roll the required dice to continue.', 'info');
            return;
        }
        
        // If we have a completed dice roll and this is the same action, proceed
        if (this.actionState === 'can_submit' && this.pendingAction?.action === actionData.action) {
            return this.submitActionWithDice();
        }
        
        // Normal action processing - check if AI will request a dice roll
        await this.processNormalAction(actionData);
    }
    
    /**
     * Process a normal action (may or may not require dice)
     */
    async processNormalAction(actionData) {
        this.isProcessing = true;
        this.showTypingIndicator();
        this.showProgressiveLoadingText();
        
        // Emit thinking state for dice system
        eventBus.emit('ai:thinking');
        
        console.log('🚀 Processing action with specialized AI methods:', actionData.action);
        
        // TEMPORARY: Test if API is working, enable fallback if not
        console.log('🔥 Checking if we should force fallback mode...');
        // Skip the old fallback mode check since we only use HuggingFace now
        
        // Test API with a simple call first (but with timeout for faster error handling)
        try {
            console.log('🔥 Testing HuggingFace API connection before story generation...');
            await Promise.race([
                this.testConnection(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
            ]);
            console.log('🔥 API connection test passed');
        } catch (error) {
            console.error('🔥 HuggingFace API connection test failed:', error);
            this.displayError('HuggingFace AI is not available. Please check your configuration or try again later.');
            this.isProcessing = false;
            this.hideTypingIndicator();
            return;
        }
        
        try {
            // Step 1: Generate story response using STORY AI
            console.log('🎭 Step 1: Generating story content...');
            const storyResponse = await this.generateStoryResponse(actionData);
            
            if (storyResponse) {
                // Check if story response requests a dice roll
                const diceRequest = this.detectDiceRequest(storyResponse);
                
                if (diceRequest) {
                    // Store the action and AI response, wait for dice roll
                    this.pendingAction = actionData;
                    this.pendingAIResponse = storyResponse;
                    this.requiredDiceRoll = diceRequest;
                    this.actionState = 'waiting_for_dice';
                    
                    // Display the story content that requests the dice roll
                    this.displayStoryContent(actionData.action, 'player-action');
                    setTimeout(async () => {
                        this.displayStoryContent(storyResponse, 'dm-response');
                        // Emit event for dice system to detect and show dice
                        eventBus.emit('ai:response', storyResponse);
                        
                        // Always prompt for dice roll after story response
                        this.promptForDiceRoll(storyResponse);
                        
                        // Action buttons removed - players now type their actions directly
                        console.log('🎯 Players can now type their actions instead of using buttons');
                        
                        this.updateActionButtonStates();
                    }, 1000);
                } else {
                    // No dice required, proceed with story and choices
                    this.displayStoryContent(actionData.action, 'player-action');
                    
                    setTimeout(async () => {
                        this.displayStoryContent(storyResponse, 'dm-response');
                        eventBus.emit('ai:response', storyResponse);
                        
                        // Always prompt for dice roll after story response
                        this.promptForDiceRoll(storyResponse);
                        
                        // Action buttons removed - players now type their actions directly
                        console.log('🎯 Players can now type their actions instead of using buttons');
                    }, 1000);
                    
                    this.updateGameState(actionData, storyResponse);
                }
            } else {
                console.error('No story response from HuggingFace AI');
                this.displayError('Failed to generate story content. Please try again.');
            }
            
        } catch (error) {
            console.error('Failed to process player action with HuggingFace AI:', error);
            this.displayError('AI system encountered an error. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideTypingIndicator();
            
            // Emit complete state for dice system
            eventBus.emit('ai:complete');
        }
    }
    
    /**
     * Submit action after dice roll is completed
     */
    async submitActionWithDice() {
        if (!this.pendingAction || !this.completedDiceRoll) {
            showToast('Missing action or dice roll data', 'error');
            return;
        }
        
        this.isProcessing = true;
        this.showTypingIndicator();
        
        try {
            console.log('🎲 Submitting action with dice using specialized AI methods');
            
            // Create action data with dice result
            const actionDataWithDice = {
                ...this.pendingAction,
                diceResult: this.completedDiceRoll
            };
            
            // Step 1: Generate story response using STORY AI (with dice result)
            console.log('🎭 Step 1: Generating story with dice result...');
            const storyResponse = await this.generateStoryResponse(actionDataWithDice);
            
            if (storyResponse) {
                // Display the dice roll result first, then story response
                this.displayStoryContent(`🎲 Rolled ${this.completedDiceRoll.result || this.completedDiceRoll.total}`, 'dice-result');
                
                setTimeout(async () => {
                    this.displayStoryContent(storyResponse, 'dm-response');
                    eventBus.emit('ai:response', storyResponse);
                    
                    // Always prompt for dice roll after dice resolution
                    this.promptForDiceRoll(storyResponse);
                    
                    // Action buttons removed - players now type their actions directly
                    console.log('🎯 Players can now type their next action instead of using buttons');
                }, 500);
                
                this.updateGameState(this.pendingAction, storyResponse);
            } else {
                console.error('No story response from HuggingFace AI after dice roll');
                this.displayError('Failed to process dice roll result. Please try again.');
            }
            
        } catch (error) {
            console.error('Failed to submit action with dice using HuggingFace AI:', error);
            this.displayError('AI system encountered an error processing your dice roll. Please try again.');
        } finally {
            // Reset state
            this.resetActionState();
            this.isProcessing = false;
            this.hideTypingIndicator();
        }
    }
    
    /**
     * Process action that comes with dice roll (new combined format)
     */
    async processActionWithDiceRoll(actionData) {
        console.log('🎲 Processing combined action + dice roll:', actionData);
        
        this.isProcessing = true;
        this.showTypingIndicator();
        this.showProgressiveLoadingText();
        
        const { action, diceRoll } = actionData;
        const character = gameState.getCharacter();
        const campaign = gameState.getCampaign();
        
        // Determine success level based on dice result
        const result = diceRoll.result;
        const diceNumber = diceRoll.max;
        
        let successLevel = 'partial';
        let outcomeType = 'neutral';
        
        if (diceRoll.critical || result === diceNumber) {
            successLevel = 'critical_success';
            outcomeType = 'great_success';
        } else if (diceRoll.fumble || (result === 1 && diceNumber === 20)) {
            successLevel = 'critical_failure';
            outcomeType = 'dramatic_failure';
        } else if (result >= diceNumber * 0.8) {
            successLevel = 'success';
            outcomeType = 'success';
        } else if (result >= diceNumber * 0.5) {
            successLevel = 'partial';
            outcomeType = 'mixed';
        } else {
            successLevel = 'failure';
            outcomeType = 'failure';
        }
        
        console.log('🎲 Dice evaluation:', { result, diceNumber, successLevel, outcomeType });
        
        // Create a comprehensive prompt for the AI
        const combinedPrompt = `The player declares: "${action}"

They rolled a ${diceRoll.dice.toUpperCase()} and got ${result} out of ${diceNumber} possible.

DICE RESULT ANALYSIS:
- Roll: ${result}/${diceNumber}
- Outcome: ${successLevel.toUpperCase()}
${diceRoll.critical ? '- CRITICAL SUCCESS: Maximum possible result!' : ''}
${diceRoll.fumble ? '- CRITICAL FAILURE: Worst possible result!' : ''}

Based on this dice result, describe what happens as a direct consequence of their action:

${outcomeType === 'great_success' ? '- Make this an exceptional success with significant positive benefits' : ''}
${outcomeType === 'success' ? '- The action succeeds as intended with good results' : ''}
${outcomeType === 'mixed' ? '- Partial success with some complications or unexpected twists' : ''}
${outcomeType === 'failure' ? '- The action fails but in an interesting way that moves the story forward' : ''}
${outcomeType === 'dramatic_failure' ? '- Dramatic failure with serious consequences but not story-ending' : ''}

Describe the outcome and continue the story. Then ask for another dice roll for their next action.`;

        try {
            const response = await this.callAI([
                { role: 'system', content: this.buildSystemPrompt() },
                { role: 'user', content: combinedPrompt }
            ]);
            
            if (response) {
                // Display the outcome
                this.displayStoryContent(response, 'dm-response');
                
                // Update game state
                gameState.set('campaign.story_state', response);
                
                // Add to campaign log
                gameState.addToCampaignLog({
                    type: 'player_action',
                    content: action,
                    dice: diceRoll.dice,
                    result: result,
                    success_level: successLevel,
                    timestamp: new Date().toISOString()
                });
                
                gameState.addToCampaignLog({
                    type: 'dm_response',
                    content: response,
                    timestamp: new Date().toISOString()
                });
                
                console.log('🎲 Combined action + dice processed successfully');
                
            } else {
                console.error('🎲 No response from AI for combined action + dice');
                this.showFallbackDiceOutcome(diceRoll, successLevel);
            }
            
        } catch (error) {
            logger.error('Failed to process combined action + dice:', error);
            this.showFallbackDiceOutcome(diceRoll, successLevel);
        } finally {
            this.isProcessing = false;
            this.hideTypingIndicator();
        }
    }
    
    /**
     * Detect if AI response requests a dice roll
     */
    detectDiceRequest(content) {
        if (!content) return null;
        
        const dicePatterns = [
            /roll\s+a?\s*(d\d+)/gi,
            /make\s+a?\s*(d\d+)\s+roll/gi,
            /(d\d+)\s+check/gi,
            /(d\d+)\s+saving\s+throw/gi,
        ];
        
        for (let pattern of dicePatterns) {
            const matches = content.matchAll(pattern);
            for (let match of matches) {
                if (match[1]) {
                    return {
                        type: match[1].toLowerCase(),
                        fullMatch: match[0]
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Update game state with action and response
     */
    updateGameState(actionData, response) {
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
    
    /**
     * Reset the action-dice coordination state
     */
    resetActionState() {
        this.pendingAction = null;
        this.pendingAIResponse = null;
        this.requiredDiceRoll = null;
        this.completedDiceRoll = null;
        this.actionState = 'ready';
    }
    
    /**
     * Update action button states - DISABLED (no more action buttons)
     */
    updateActionButtonStates() {
        // Action buttons removed - this function is now a no-op
        console.log('updateActionButtonStates called but action buttons are disabled');
        return;
    }
    
    /**
     * Process dice roll results
     */
    async processDiceRoll(rollData) {
        console.log('🎲 Processing dice roll:', rollData);
        
        // If we're waiting for a dice roll as part of an action sequence, handle it properly
        if (this.actionState === 'waiting_for_dice' && this.pendingAction) {
            this.completedDiceRoll = rollData;
            this.actionState = 'can_submit';
            
            // Automatically submit the action with dice result
            await this.submitActionWithDice();
            return;
        }
        
        // Handle dice rolls that come after AI responses (our current flow)
        console.log('🎲 Handling dice roll from AI-prompted roll');
        
        // Get the last player action from stored action
        const lastAction = this.lastPlayerAction || this.pendingAction?.action || "continue the adventure";
        console.log('🎲 Using last action for dice outcome:', lastAction);
        const character = gameState.getCharacter();
        const campaign = gameState.getCampaign();
        
        // Determine success level based on dice result
        const diceNumber = parseInt(rollData.dice?.substring(1) || rollData.type?.substring(1) || '20');
        const result = rollData.result || rollData.total;
        
        let successLevel = 'partial';
        let outcomeType = 'neutral';
        
        if (rollData.critical || result === diceNumber) {
            successLevel = 'critical_success';
            outcomeType = 'great_success';
        } else if (rollData.fumble || (result === 1 && diceNumber === 20)) {
            successLevel = 'critical_failure';
            outcomeType = 'dramatic_failure';
        } else if (result >= diceNumber * 0.8) {
            successLevel = 'success';
            outcomeType = 'success';
        } else if (result >= diceNumber * 0.5) {
            successLevel = 'partial';
            outcomeType = 'mixed';
        } else {
            successLevel = 'failure';
            outcomeType = 'failure';
        }
        
        console.log('🎲 Dice evaluation:', { result, diceNumber, successLevel, outcomeType });
        
        // Create a comprehensive prompt for the AI based on the dice result
        const diceOutcomePrompt = `The player's last action was: "${lastAction}"

You asked them to roll a ${rollData.dice || rollData.type}, and they rolled ${result} out of ${diceNumber} possible.

DICE RESULT ANALYSIS:
- Roll: ${result}/${diceNumber}
- Outcome: ${successLevel.toUpperCase()}
${rollData.critical ? '- CRITICAL SUCCESS: Maximum possible result!' : ''}
${rollData.fumble ? '- CRITICAL FAILURE: Worst possible result!' : ''}

Based on this dice result, describe what happens as a direct consequence of their action. The dice roll should clearly influence the outcome:

${outcomeType === 'great_success' ? '- Make this an exceptional success with significant positive benefits' : ''}
${outcomeType === 'success' ? '- The action succeeds as intended with good results' : ''}
${outcomeType === 'mixed' ? '- Partial success with some complications or unexpected twists' : ''}
${outcomeType === 'failure' ? '- The action fails but in an interesting way that moves the story forward' : ''}
${outcomeType === 'dramatic_failure' ? '- Dramatic failure with serious consequences but not story-ending' : ''}

Continue the story based on this dice result. Be specific about how the roll affected the action's outcome.`;

        try {
            this.isProcessing = true;
            this.showTypingIndicator();
            
            const response = await this.callAI([
                { role: 'system', content: this.buildSystemPrompt() },
                { role: 'user', content: diceOutcomePrompt }
            ]);
            
            if (response) {
                // Display the outcome based on the dice roll
                this.displayStoryContent(response, 'dm-response');
                
                // Update game state with the new story development
                gameState.set('campaign.story_state', response);
                
                // Add the dice roll and outcome to campaign log
                gameState.addToCampaignLog({
                    type: 'dice_roll',
                    action: lastAction,
                    dice: rollData.dice || rollData.type,
                    result: result,
                    success_level: successLevel,
                    content: `Rolled ${result} on ${rollData.dice || rollData.type}: ${successLevel}`,
                    timestamp: new Date().toISOString()
                });
                
                gameState.addToCampaignLog({
                    type: 'dm_response',
                    content: response,
                    timestamp: new Date().toISOString()
                });
                
                // Always prompt for another dice roll after the outcome
                this.promptForDiceRoll(response);
                
                console.log('🎲 Dice roll outcome processed successfully');
                
            } else {
                console.error('🎲 No response from AI for dice outcome');
                this.showFallbackDiceOutcome(rollData, successLevel);
            }
            
        } catch (error) {
            logger.error('Failed to process dice roll outcome:', error);
            this.showFallbackDiceOutcome(rollData, successLevel);
        } finally {
            this.isProcessing = false;
            this.hideTypingIndicator();
        }
    }
    
    /**
     * Build action context including dice roll results
     */
    buildActionContextWithDice(character, campaign, actionData, diceRoll) {
        const currentStory = campaign.story_state || 'The adventure begins...';
        const recentLog = campaign.campaign_log?.slice(-5) || [];
        
        return `
            CONTINUING STORY WITH DICE RESULT:
            
            Player Action: "${actionData.action}"
            Dice Roll: ${diceRoll.dice || diceRoll.type} = ${diceRoll.result || diceRoll.total}
            ${diceRoll.critical ? '🌟 CRITICAL SUCCESS! Make this exceptionally positive.' : ''}
            ${diceRoll.fumble ? '💀 CRITICAL FAILURE! Add interesting complications.' : ''}
            
            Current Story Context: ${currentStory}
            
            CHARACTER: ${character.name} (${character.race} ${character.class})
            Background: ${character.background}
            
            RECENT EVENTS:
            ${recentLog.map(entry => `- ${entry.content?.substring(0, 100)}...`).join('\n')}
            
            Interpret the dice roll result for the player's action and continue the story. 
            The dice result should directly influence the outcome of "${actionData.action}".
        `;
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
        
        return `You are the Dungeon Master for ${character.name || 'the adventurer'}, a ${character.class || 'character'} in a ${settingData.name || 'fantasy'} campaign.

CHARACTER STATS: STR ${character.stats?.str || 10}, DEX ${character.stats?.dex || 10}, CON ${character.stats?.con || 10}, INT ${character.stats?.int || 10}, WIS ${character.stats?.wis || 10}, CHA ${character.stats?.cha || 10}

CAMPAIGN: ${settingData.description || 'Fantasy adventure'} - ${difficulty} difficulty

DM STYLE:
- Describe what happens directly, like a real DM would
- Be concise but vivid - set the scene, describe consequences
- Focus on the immediate situation and what the player sees/hears/feels
- Don't overthink or over-describe - just tell them what happens
- Use second person ("you see...", "you hear...")
- At least 100 words, but don't drag it out

The player will provide both their action and dice roll together. Use the dice result to determine the outcome of their action, then continue the story and ask them to declare their next action and roll dice for it.

Example: "Your action succeeds/fails based on your roll. [story continues]. What do you want to do next? Choose a die (D4-D20) based on the difficulty and roll it along with your action."

Start describing what happens immediately based on their action and dice result.`;
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
     * Always prompt for dice roll after AI response
     */
    promptForDiceRoll(aiResponse) {
        console.log('🎲 Always prompting for dice roll after AI response');
        
        // Detect dice requirement from AI response (D4, D6, D8, D10, D12, D20)
        const diceMatches = aiResponse.match(/(?:roll|make).*?[ad]?\s*(d4|d6|d8|d10|d12|d20)/gi);
        let diceType = 'd20'; // Default to D20
        
        if (diceMatches && diceMatches.length > 0) {
            const match = diceMatches[0].toLowerCase();
            if (match.includes('d4')) diceType = 'd4';
            else if (match.includes('d6')) diceType = 'd6';
            else if (match.includes('d8')) diceType = 'd8';
            else if (match.includes('d10')) diceType = 'd10';
            else if (match.includes('d12')) diceType = 'd12';
            else if (match.includes('d20')) diceType = 'd20';
        }
        
        console.log('🎲 Detected dice type from AI response:', diceType);
        console.log('🎲 AI response dice matches:', diceMatches);
        
        // Force dice system to show for this dice type with a delay to ensure dice system is ready
        setTimeout(() => {
            if (typeof eventBus !== 'undefined' && window.diceSystem) {
                console.log('🎲 Emitting force:dice:show event for:', diceType);
                eventBus.emit('force:dice:show', {
                    diceType: diceType,
                    reason: 'AI response requires dice roll'
                });
                
                // Also directly call the dice system as backup
                if (window.diceSystem && window.diceSystem.showDiceRequest) {
                    console.log('🎲 Directly calling diceSystem.showDiceRequest as backup');
                    window.diceSystem.showDiceRequest([diceType]);
                }
            } else {
                console.warn('🎲 EventBus or diceSystem not available');
            }
        }, 500);
        
        console.log(`🎲 Scheduled dice UI to show for ${diceType.toUpperCase()} roll`);
    }
    
    /**
     * Validate response length meets minimum word count requirement
     */
    validateResponseLength(response, minWords = 100) {
        if (!response || typeof response !== 'string') {
            console.warn('📏 LENGTH VALIDATION: Invalid response type:', typeof response);
            return false;
        }
        
        // Count words by splitting on whitespace and filtering out empty strings
        const words = response.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        console.log(`📏 LENGTH VALIDATION: ${wordCount} words (minimum: ${minWords})`);
        
        if (wordCount < minWords) {
            console.warn(`📏 LENGTH VALIDATION FAILED: Response only has ${wordCount} words, needs ${minWords} minimum`);
            return false;
        }
        
        console.log('📏 LENGTH VALIDATION PASSED: Response meets minimum word count');
        return true;
    }
    
    /**
     * Debug function to test AI system from browser console
     */
    async debugTest() {
        console.log('🔧 DEBUG: Testing AI system...');
        console.log('🔧 AI Manager state:', {
            initialized: this.initialized,
            isProcessing: this.isProcessing,
            huggingFaceAI: !!this.huggingFaceAI
        });
        
        try {
            const testResponse = await this.callAI([
                { role: 'system', content: 'You are a helpful test assistant.' },
                { role: 'user', content: 'Say hello and confirm you are working!' }
            ]);
            
            console.log('🔧 DEBUG TEST SUCCESS:', testResponse);
            return testResponse;
        } catch (error) {
            console.error('🔧 DEBUG TEST FAILED:', error);
            return null;
        }
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

CRITICAL: Jump straight into the story. Do NOT explain what you're doing or provide any meta-commentary. Begin immediately with vivid, immersive storytelling in the world.

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

CRITICAL: Respond immediately with the story outcome. NO meta-commentary, NO explanations of what you're planning. Jump straight into describing what happens as a result of the player's action.

Respond with the outcome of this action and what happens next.`;
    }

    /**
     * STORY AI - Handles narrative responses and story progression
     */
    async generateStoryResponse(actionData) {
        if (this.isGeneratingStory) {
            console.log('Story AI already processing, ignoring duplicate request');
            return null;
        }

        this.isGeneratingStory = true;
        console.log('🎭 STORY AI: Generating narrative response for action:', actionData.action);

        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            // Build context specifically for story generation
            const storyContext = this.buildActionContext(character, campaign, actionData);
            
            // Story-specific system prompt
            const storySystemPrompt = `🎭 STORY AI - PURE NARRATIVE GENERATION

You are the storytelling engine for a ${campaign.setting} campaign. Your ONLY job is to generate immersive story content.

🚨 CRITICAL RULES:
❌ NO meta-commentary, planning, or thinking out loud
❌ NO action options or choices - that's handled separately  
❌ NO dice requests - dice are handled separately
❌ NO game mechanics discussion
✅ ONLY pure story narrative describing what happens

RESPONSE FORMAT:
- 4-8 detailed paragraphs of immersive story content (MINIMUM 100 words)
- Rich sensory details and atmospheric description
- Character emotions and reactions
- Consequences of the player's action
- Natural story progression
- End with the scene resolution (no choices needed)

📏 CRITICAL: Your response must be AT LEAST 100 words long. Short responses are not acceptable.

START IMMEDIATELY WITH STORY CONTENT - NO PREAMBLE!`;

            const response = await this.callAI([
                { role: 'system', content: storySystemPrompt },
                { role: 'user', content: storyContext }
            ]);

            console.log('🎭 STORY AI: Generated response length:', response?.length || 0);
            return response;

        } catch (error) {
            console.error('🎭 STORY AI: Error generating story response:', error);
            return this.getStoryFallback(actionData.action);
        } finally {
            this.isGeneratingStory = false;
        }
    }

    /**
     * CHOICE AI - Generates contextual action buttons based on current situation
     */
    async generateActionChoices(currentStory = '') {
        if (this.isGeneratingChoices) {
            console.log('Choice AI already processing, ignoring duplicate request');
            return this.getGenericOptions();
        }

        this.isGeneratingChoices = true;
        console.log('🎯 CHOICE AI: Using rule-based contextual generation (AI bypass)');

        try {
            // TEMPORARY: Skip AI entirely and use rule-based generation
            const contextualOptions = this.generateContextualFallbackOptions(currentStory);
            console.log('🎯 CHOICE AI: Generated', contextualOptions.length, 'contextual options:', contextualOptions);
            return contextualOptions;

            // TODO: Re-enable AI generation when we can get it to stop meta-commenting
            /*
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            // Build context for choice generation
            const choiceContext = `CURRENT SITUATION:
${currentStory || this.buildCampaignContext()}

CHARACTER: ${character.name} (${character.class})
STATS: STR ${character.stats?.str}, DEX ${character.stats?.dex}, CON ${character.stats?.con}, INT ${character.stats?.int}, WIS ${character.stats?.wis}, CHA ${character.stats?.cha}

Generate 4-6 contextual action options that make sense for this situation.`;

            // Choice-specific system prompt
            const choiceSystemPrompt = `🎯 RESPOND WITH ONLY A LIST OF ACTIONS - NO OTHER TEXT

You generate action options. NO talking, NO explanations, NO thinking out loud.

FORBIDDEN:
❌ "Okay, let's see..." 
❌ "The user wants..."
❌ "So first, I need to..."
❌ "Let me think..."
❌ ANY commentary whatsoever

REQUIRED FORMAT - RESPOND WITH EXACTLY THIS:
Hack the police van's systems
Trace the anonymous caller
Approach the van stealthily  
Search for another exit
Call for backup
Hide deeper in shadows

RULES:
- 4-6 actions only
- 2-8 words each
- No explanations
- Fit the current scene
- Start response immediately with first action`;

            const response = await this.callAI([
                { role: 'system', content: choiceSystemPrompt },
                { role: 'user', content: choiceContext }
            ]);

            if (response) {
                // Check if response contains meta-commentary
                const hasMetaCommentary = response.toLowerCase().includes('okay') || 
                                        response.toLowerCase().includes('user wants') ||
                                        response.toLowerCase().includes('let me') ||
                                        response.toLowerCase().includes('so first');
                
                if (hasMetaCommentary) {
                    console.warn('🎯 CHOICE AI: Response contains meta-commentary, using contextual fallback');
                    return this.generateContextualFallbackOptions(choiceContext);
                }
                
                // Parse the response into individual options
                let cleanResponse = response;
                
                // Remove any meta-commentary that might have slipped through
                cleanResponse = cleanResponse
                    .replace(/^Okay,.*?(?=\n[A-Z])/s, '') // Remove "Okay, let's see..." paragraphs
                    .replace(/^So.*?(?=\n[A-Z])/s, '')   // Remove "So first..." paragraphs
                    .replace(/^The user.*?(?=\n[A-Z])/s, '') // Remove "The user wants..." paragraphs
                    .replace(/^Let me.*?(?=\n[A-Z])/s, '') // Remove "Let me think..." paragraphs
                    .replace(/^First,.*?(?=\n[A-Z])/s, '') // Remove "First, since..." paragraphs
                    .trim();
                
                const options = cleanResponse
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => {
                        // Filter out meta-commentary lines
                        if (line.length === 0) return false;
                        if (line.startsWith('-')) line = line.substring(1).trim();
                        if (line.toLowerCase().includes('user wants')) return false;
                        if (line.toLowerCase().includes('let me')) return false;
                        if (line.toLowerCase().includes('okay,')) return false;
                        if (line.toLowerCase().includes('so first')) return false;
                        if (line.toLowerCase().includes('variety is key')) return false;
                        return line.length > 0 && line.length < 100; // Reasonable action length
                    })
                    .slice(0, 6); // Limit to 6 options max

                console.log('🎯 CHOICE AI: Parsed', options.length, 'clean options:', options);
                return options.length > 0 ? options : this.getGenericOptions();
            }

            return this.getGenericOptions();
            */

        } catch (error) {
            console.error('🎯 CHOICE AI: Error generating choices:', error);
            return this.getGenericOptions();
        } finally {
            this.isGeneratingChoices = false;
        }
    }

    /**
     * Get fallback story content
     */
    getStoryFallback(action) {
        const fallbacks = [
            `You ${action.toLowerCase()} with careful consideration. The environment around you shifts subtly in response to your actions. New details become apparent as you focus your attention on the task at hand. The atmosphere grows more intense as possibilities unfold before you.`,
            `Your decision to ${action.toLowerCase()} proves significant. The world around you responds in unexpected ways, revealing hidden aspects of your surroundings. You sense that your choice has set events in motion that will shape what comes next.`,
            `As you ${action.toLowerCase()}, the scene around you evolves. Your senses pick up new information about your environment. The consequences of your action begin to manifest, creating new opportunities and challenges that demand your attention.`
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    /**
     * Generate contextual fallback options when AI produces meta-commentary
     */
    generateContextualFallbackOptions(context) {
        console.log('🎯 generateContextualFallbackOptions called with context type:', typeof context);
        console.log('🎯 Context content (first 200 chars):', String(context).substring(0, 200));
        
        const contextLower = String(context || '').toLowerCase();
        const options = [];
        
        console.log('🎯 Generating contextual options for context:', contextLower.substring(0, 200));
        
        // CYBERPUNK/HACKER CONTEXT
        if (contextLower.includes('hacker') || contextLower.includes('morgan')) {
            // Technology/Hacking options
            if (contextLower.includes('police') || contextLower.includes('van')) {
                options.push('Hack the police van systems', 'Intercept police communications', 'Disable van security');
            }
            if (contextLower.includes('phone') || contextLower.includes('call') || contextLower.includes('signal')) {
                options.push('Trace the signal source', 'Block incoming calls', 'Decrypt the message');
            }
            if (contextLower.includes('tablet') || contextLower.includes('computer') || contextLower.includes('data')) {
                options.push('Access encrypted files', 'Run network scan', 'Check system logs');
            }
            // Always add core hacker options
            options.push('Search for vulnerabilities', 'Monitor digital traffic', 'Access security cameras');
        }
        
        // STEALTH/HIDING CONTEXT
        if (contextLower.includes('hiding') || contextLower.includes('abandoned') || contextLower.includes('shadows')) {
            options.push('Move to better cover', 'Search for escape routes', 'Hide deeper in shadows');
            if (contextLower.includes('laundromat') || contextLower.includes('building')) {
                options.push('Explore the building', 'Look for useful items', 'Check other rooms');
            }
        }
        
        // INVESTIGATION CONTEXT
        if (contextLower.includes('mystery') || contextLower.includes('investigation') || contextLower.includes('asset')) {
            options.push('Examine the evidence', 'Look for more clues', 'Analyze the situation');
        }
        
        // URBAN/STREET CONTEXT
        if (contextLower.includes('street') || contextLower.includes('rain') || contextLower.includes('city')) {
            options.push('Survey the area', 'Move to higher ground', 'Find shelter from rain');
        }
        
        // COMMUNICATION CONTEXT
        if (contextLower.includes('caller') || contextLower.includes('contact') || contextLower.includes('message')) {
            options.push('Establish secure contact', 'Verify caller identity', 'Send coded message');
        }
        
        // DANGER/THREAT CONTEXT  
        if (contextLower.includes('danger') || contextLower.includes('threat') || contextLower.includes('pursued')) {
            options.push('Plan escape route', 'Create diversion', 'Call for backup');
        }
        
        // If we don't have enough specific options, add character-appropriate generics
        if (options.length < 4) {
            const character = gameState.getCharacter();
            const characterClass = character?.class?.toLowerCase() || '';
            
            if (characterClass.includes('hacker') || characterClass.includes('tech')) {
                options.push('Scan for networks', 'Check device security', 'Access local systems');
            } else if (characterClass.includes('investigator') || characterClass.includes('detective')) {
                options.push('Search for evidence', 'Interview witnesses', 'Follow leads');
            } else {
                // Generic adventure options
                options.push('Examine surroundings', 'Listen carefully', 'Plan next move');
            }
        }
        
        // Always ensure we have basic action variety
        const hasInvestigation = options.some(opt => opt.toLowerCase().includes('examine') || opt.toLowerCase().includes('search') || opt.toLowerCase().includes('look'));
        const hasMovement = options.some(opt => opt.toLowerCase().includes('move') || opt.toLowerCase().includes('go') || opt.toLowerCase().includes('approach'));
        const hasInteraction = options.some(opt => opt.toLowerCase().includes('contact') || opt.toLowerCase().includes('call') || opt.toLowerCase().includes('talk'));
        
        if (!hasInvestigation) options.push('Examine the area');
        if (!hasMovement) options.push('Move to safer position');
        if (!hasInteraction) options.push('Try to make contact');
        
        // Remove duplicates and limit to 6
        const uniqueOptions = [...new Set(options)];
        const finalOptions = uniqueOptions.slice(0, 6);
        
        // ABSOLUTE SAFETY CHECK - never return empty array
        if (finalOptions.length === 0) {
            console.warn('🎯 WARNING: No options generated, using absolute fallback');
            return [
                'Survey the immediate area carefully', 
                'Listen for any signs of activity', 
                'Consider all possible approaches', 
                'Prepare for the next challenge'
            ];
        }
        
        console.log('🎯 Generated contextual options:', finalOptions);
        console.log('🎯 Final options count:', finalOptions.length);
        return finalOptions;
    }

    /**
     * Get contextual emergency options based on character and current situation
     */
    getContextualEmergencyOptions() {
        console.log('🎯 Getting contextual emergency options');
        
        const character = gameState.getCharacter();
        const campaign = gameState.getCampaign();
        const currentStory = campaign.story_state || '';
        
        const characterClass = character?.class?.toLowerCase() || '';
        const characterName = character?.name || 'Adventurer';
        const storyLower = currentStory.toLowerCase();
        
        let options = [];
        
        // Add character-class specific options
        if (characterClass.includes('hacker') || characterClass.includes('tech')) {
            options.push(
                'Scan for electronic signatures',
                'Check network connectivity', 
                'Access available systems',
                'Monitor digital communications'
            );
        } else if (characterClass.includes('detective') || characterClass.includes('investigator')) {
            options.push(
                'Search for evidence',
                'Question nearby witnesses',
                'Follow the trail of clues',
                'Document the scene'
            );
        } else if (characterClass.includes('rogue') || characterClass.includes('thief')) {
            options.push(
                'Search for hidden passages',
                'Pick any available locks',
                'Move silently through shadows',
                'Look for valuable items'
            );
        } else if (characterClass.includes('warrior') || characterClass.includes('fighter')) {
            options.push(
                'Assess potential threats',
                'Secure the perimeter',
                'Ready weapons for combat',
                'Take defensive position'
            );
        } else if (characterClass.includes('mage') || characterClass.includes('wizard')) {
            options.push(
                'Sense magical energies',
                'Cast detection spells',
                'Study arcane patterns',
                'Prepare magical defenses'
            );
        }
        
        // Add story-context specific options
        if (storyLower.includes('tavern') || storyLower.includes('inn')) {
            options.push('Question the bartender', 'Eavesdrop on conversations', 'Order a drink to blend in');
        } else if (storyLower.includes('forest') || storyLower.includes('woods')) {
            options.push('Follow animal tracks', 'Climb a tree for better view', 'Gather useful herbs');
        } else if (storyLower.includes('dungeon') || storyLower.includes('cave')) {
            options.push('Check for traps ahead', 'Light a torch for visibility', 'Listen for sounds in the darkness');
        } else if (storyLower.includes('city') || storyLower.includes('town')) {
            options.push('Ask locals for information', 'Explore the market square', 'Find the local authorities');
        } else if (storyLower.includes('abandoned') || storyLower.includes('ruins')) {
            options.push('Search through the debris', 'Look for signs of recent activity', 'Test the structural integrity');
        }
        
        // Always ensure we have core exploration/interaction options
        const coreOptions = [
            'Examine the immediate surroundings',
            'Listen for any sounds or movement',
            'Consider all available options',
            'Take a moment to think strategically'
        ];
        
        // Combine and ensure variety
        const allOptions = [...options, ...coreOptions];
        const uniqueOptions = [...new Set(allOptions)];
        
        // Take up to 4-5 options for emergency fallback
        const finalOptions = uniqueOptions.slice(0, Math.min(5, uniqueOptions.length));
        
        // Safety check - ensure we always have at least some options
        if (finalOptions.length === 0) {
            console.warn('🎯 No contextual options generated, using absolute emergency fallback');
            return [
                'Survey the current situation',
                'Plan the next course of action',
                'Stay alert for any changes',
                'Prepare for what comes next'
            ];
        }
        
        console.log('🎯 Generated contextual emergency options:', finalOptions);
        return finalOptions;
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
        console.log('🔥 AI CALL STARTED');
        
        // Use HuggingFace AI (Primary - prompt-engineered for RPG)
        if (this.useHuggingFace && this.huggingFaceAI) {
            console.log('🤗 USING HUGGINGFACE AI - Prompt-engineered for RPG storytelling');
            
            try {
                // Get character and setting data for enhanced context
                const character = gameState.getCharacter();
                const campaign = gameState.getCampaign();
                let settingData = null;
                
                // Get setting details from character manager if available
                if (typeof characterManager !== 'undefined' && campaign.setting) {
                    settingData = characterManager.settings[campaign.setting];
                }
                
                const lastMessage = messages[messages.length - 1]?.content || '';
                const isChoiceGeneration = lastMessage.includes('action choices') || 
                                         lastMessage.includes('choice options') ||
                                         lastMessage.includes('what can') ||
                                         lastMessage.includes('options are');
                
                let response;
                if (isChoiceGeneration) {
                    const choices = await this.huggingFaceAI.generateChoices(lastMessage, character, settingData);
                    response = Array.isArray(choices) ? choices.join('\n') : choices;
                } else {
                    response = await this.huggingFaceAI.generateStory(lastMessage, 'narrative', character, settingData);
                }
                
                if (response && response.length > 20 && this.validateResponseLength(response, 100)) {
                    console.log('🤗 HUGGINGFACE SUCCESS:', response.length, 'chars,', response.trim().split(/\s+/).length, 'words');
                    return response;
                }
                
                throw new Error('HuggingFace response too short or failed word count validation');
                
            } catch (error) {
                console.error('🤗 HUGGINGFACE FAILED:', error);
                throw new Error(`HuggingFace AI failed: ${error.message}`);
            }
        }
        
        // No fallbacks - only HuggingFace
        throw new Error('HuggingFace AI is not available or disabled');
    }
    
    generateFallbackResponse(userMessage = '') {
        // Try to detect user intent from their message
        const message = userMessage.toLowerCase();
        
        if (message.includes('sleep') || message.includes('rest')) {
            const sleepResponses = [
                "You find a safe spot to rest. The fatigue in your body is real, and sleep comes quickly. Your dreams are filled with strange visions of the adventure ahead. You wake refreshed and ready for what comes next. Roll a D6 to see how your rest affects your next actions!",
                "Finding shelter, you settle down for some much-needed rest. Sleep brings clarity to your thoughts and strength to your body. As dawn breaks, you feel renewed and prepared for the challenges ahead. Roll a D8 to determine what you discover upon waking!",
                "You decide rest is the wisest choice. As you sleep, your subconscious processes the events of your journey. You wake with new insights and restored energy. The path forward seems clearer now. Roll a D10 to see what opportunities await!"
            ];
            return sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
        }
        
        if (message.includes('attack') || message.includes('fight') || message.includes('battle')) {
            const combatResponses = [
                "You leap into action with determined resolve. Your weapon feels steady in your hands as you engage. The outcome will depend on both skill and fortune. Roll a D12 to determine the result of your attack!",
                "Combat erupts as you make your move. Time slows as you focus on your opponent's weaknesses. Your training guides your actions, but victory is never guaranteed. Roll a D20 to see how the battle unfolds!",
                "You strike with precision and courage. The clash of battle fills the air as you fight for your goal. Success or failure hangs in the balance. Roll a D8 to determine your combat effectiveness!"
            ];
            return combatResponses[Math.floor(Math.random() * combatResponses.length)];
        }
        
        if (message.includes('explore') || message.includes('search') || message.includes('investigate')) {
            const exploreResponses = [
                "You begin your careful exploration of the area. Your senses are alert as you search for clues, treasures, or hidden dangers. What you discover could change everything. Roll a D10 to see what you find!",
                "Your investigation reveals more than you expected. The space holds secrets waiting to be uncovered. Your thorough approach pays off as you notice details others might miss. Roll a D12 to determine what you discover!",
                "You search methodically, leaving no stone unturned. The environment responds to your careful attention, revealing its hidden aspects. Knowledge gained here will serve you well. Roll a D6 to see what secrets are revealed!"
            ];
            return exploreResponses[Math.floor(Math.random() * exploreResponses.length)];
        }
        
        if (message.includes('talk') || message.includes('speak') || message.includes('negotiate') || message.includes('convince')) {
            const socialResponses = [
                "You choose your words carefully, reading the situation before speaking. Communication can open doors that force cannot. Your approach will determine how others respond to you. Roll a D8 to see how your words are received!",
                "Your attempt at diplomacy shows wisdom. Sometimes the right words at the right time can resolve what weapons cannot. The response you receive will guide your next steps. Roll a D10 to determine the outcome of your conversation!",
                "You engage in meaningful dialogue, hoping to find common ground. Your sincerity and tact could make all the difference here. The power of words should not be underestimated. Roll a D6 to see how your approach works!"
            ];
            return socialResponses[Math.floor(Math.random() * socialResponses.length)];
        }
        
        // Default generic responses if no specific action detected
        const genericResponses = [
            "Your decision leads to new developments. The situation responds to your choice in ways you couldn't have predicted. Adventure awaits around every corner. Roll a D8 to see what happens next!",
            "You take action with confidence. The world around you shifts in response to your choices. Your path forward becomes clearer with each step. Roll a D10 to determine the outcome!",
            "Your bold move sets events in motion. The consequences of your actions will soon become apparent. Fortune favors those who act decisively. Roll a D6 to see how things unfold!",
            "You proceed with determination. Your choices shape the adventure as it unfolds around you. Each decision brings new possibilities and challenges. Roll a D12 to discover what awaits!"
        ];
        
        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    /**
     * Show fallback dice outcome when AI fails
     */
    showFallbackDiceOutcome(rollData, successLevel) {
        const result = rollData.result || rollData.total;
        const diceType = rollData.dice || rollData.type;
        
        let outcomeText = '';
        
        if (successLevel === 'critical_success') {
            outcomeText = `Your exceptional roll of ${result} leads to outstanding success! Everything goes better than you could have hoped, opening up new opportunities and possibilities. The favorable outcome puts you in an advantageous position moving forward.`;
        } else if (successLevel === 'success') {
            outcomeText = `Your solid roll of ${result} allows you to succeed in your endeavor. Things work out as you intended, and you can proceed with confidence. The positive result gives you momentum to continue.`;
        } else if (successLevel === 'partial') {
            outcomeText = `Your roll of ${result} produces mixed results. You achieve some of what you set out to do, but there are complications or unexpected developments that require your attention. Success comes with a twist.`;
        } else if (successLevel === 'failure') {
            outcomeText = `Your roll of ${result} doesn't quite get you where you wanted to go. The attempt doesn't work out as planned, forcing you to reconsider your approach or deal with the consequences of the setback.`;
        } else if (successLevel === 'critical_failure') {
            outcomeText = `Your unfortunate roll of ${result} leads to significant complications. Not only does your attempt fail, but it creates new challenges that you'll need to overcome. However, even failures can lead to interesting developments.`;
        }
        
        const fullResponse = `${outcomeText} The adventure continues, and your next actions will be crucial in determining how things unfold. Roll a D10 to see what happens next!`;
        
        this.displayStoryContent(fullResponse, 'dm-response');
        this.promptForDiceRoll(fullResponse);
        
        console.log('🎲 Fallback dice outcome displayed');
    }
    
    async callGeminiAPI(messages) {
        
        try {
            // Convert OpenAI-style messages to Gemini format
            const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
            const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
            
            const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${userMessages}` : userMessages;
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: combinedPrompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: this.maxTokens,
                    temperature: 0.4,
                    topP: 0.8,
                    topK: 40
                }
            };
            
            console.log('🔥 Request body size:', JSON.stringify(requestBody).length);
            console.log('🔥 Combined prompt (first 200 chars):', combinedPrompt.substring(0, 200));
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('🔥 API Response Status:', response.status);
            console.log('🔥 API Response OK:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔥 API Error Response:', errorText);
                throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('🔥 API Response Data Keys:', Object.keys(data));
            console.log('🔥 API Response Candidates Count:', data.candidates?.length);
            
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('🔥 API Response Content Length:', content?.length);
            console.log('🔥 API Response Content (first 200 chars):', content?.substring(0, 200));
            console.log('🔥 API Response Content (last 200 chars):', content?.substring(Math.max(0, (content?.length || 0) - 200)));
            
            if (!content) {
                console.error('🔥 No content in Gemini response, full data:', data);
                throw new Error('No content in Gemini response');
            }
            
            // Add to conversation history (keep original format for compatibility)
            this.conversationHistory.push(...messages, {
                role: 'assistant',
                content: content
            });
            
            // Trim history if too long
            this.trimConversationHistory();
            
            console.log('🔥 GEMINI API CALL COMPLETED SUCCESSFULLY');
            return content;
            
        } catch (error) {
            console.error('🔥 GEMINI API CALL FAILED:', error);
            logger.error('Gemini API call failed:', error);
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
        
        let displayContent = content;
        
        // Only apply filtering to AI responses, not player actions or dice results
        if (type === 'dm-response' && content && content.length > 0) {
            console.log('=== DISPLAY STORY CONTENT DEBUG ===');
            console.log('Original AI content length:', content.length);
            console.log('Original AI content (first 100 chars):', content.substring(0, 100));
            console.log('Original AI content (last 100 chars):', content.substring(Math.max(0, content.length - 100)));
            
            // TEMPORARY: Skip all filtering to test if that's causing truncation
            console.log('SKIPPING FILTERING FOR TRUNCATION TEST');
            displayContent = content;
            
            // Only do basic cleanup
            displayContent = displayContent.trim();
            
            console.log('Display content length:', displayContent.length);
            console.log('Display content (first 100 chars):', displayContent.substring(0, 100));
            console.log('Display content (last 100 chars):', displayContent.substring(Math.max(0, displayContent.length - 100)));
            console.log('=== END DISPLAY DEBUG ===');
        }
        
        const messageElement = createElement('div', {
            className: type,
            innerHTML: formatText(displayContent)
        });
        
        console.log('Created message element innerHTML length:', messageElement.innerHTML.length);
        console.log('Created message element innerHTML (first 100 chars):', messageElement.innerHTML.substring(0, 100));
        
        storyContent.appendChild(messageElement);
        
        console.log('After appending - storyContent children count:', storyContent.children.length);
        console.log('After appending - last child innerHTML length:', storyContent.lastElementChild?.innerHTML.length);
        
        // Scroll to bottom
        const storyDisplay = document.getElementById('story-display');
        if (storyDisplay) {
            storyDisplay.scrollTop = storyDisplay.scrollHeight;
        }
        
        // Animate in
        animateElement(messageElement, 'slide-in-up');
    }
    
    /**
     * Check if content starts with meta-language
     */
    startsWithMetaLanguage(content) {
        if (!content) return false;
        
        const lowerContent = content.toLowerCase().trim();
        
        // Only check for the most obvious meta-commentary starters
        const metaStarts = [
            'okay, so',
            'let me',
            'i should',
            'i need to',
            'the user wants',
            'the player wants'
        ];
        
        return metaStarts.some(meta => lowerContent.startsWith(meta));
    }
    
    /**
     * Emergency story extraction - find the first sentence that looks like story content
     */
    emergencyStoryExtraction(content) {
        if (!content) return null;
        
        // Split into sentences and find the first one that sounds like story
        const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
        
        for (let sentence of sentences) {
            // Look for story indicators
            if (
                /^(the|a|an)\s+\w+\s+(fills|drowns|casts|flickers|hums|echoes|glows|shimmers)/i.test(sentence) ||
                /^you\s+(see|hear|feel|smell|taste|notice|find|discover|stand|sit|walk)/i.test(sentence) ||
                /^[a-z]+\s+(appears|emerges|steps|walks|runs|speaks|whispers|shouts)/i.test(sentence) ||
                /^suddenly,/i.test(sentence) ||
                /neon|rain|shadow|light|darkness|sound|voice|door|window|street/i.test(sentence)
            ) {
                // Found potential story content, return from this point
                const storyStart = content.indexOf(sentence);
                if (storyStart >= 0) {
                    return content.substring(storyStart);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Filter out meta-commentary from AI responses
     */
    filterMetaCommentary(content) {
        if (!content || typeof content !== 'string') return content;
        
        console.log('Filter input - Original content length:', content.length);
        console.log('Filter input - Full original content:', content);
        
        // Re-enable smart filtering now that AI is generating good content
        // First, try to find the actual story content and extract everything from that point
        const storyStart = this.findStoryStart(content);
        if (storyStart && storyStart.index >= 0) {
            const extractedContent = content.substring(storyStart.index).trim();
            console.log('Found story content at index:', storyStart.index);
            console.log('Extracted story content length:', extractedContent.length);
            console.log('Extracted story content:', extractedContent);
            
            // Clean up the extracted content by removing any remaining meta sentences
            let cleaned = extractedContent;
            
            // Remove specific meta sentences that might be mixed in
            const quickFilters = [
                /^Okay,.*$/gm,
                /^So,.*$/gm,
                /^Wait,.*$/gm,
                /^Also,.*$/gm,
                /^Maybe.*$/gm,
                /^I should.*$/gm,
                /^I need.*$/gm,
                /^Need to.*$/gm,
                /^Don't forget.*$/gm,
                /^Consider.*$/gm,
                /.*?(the player|the user).*$/gm,
            ];
            
            quickFilters.forEach(pattern => {
                cleaned = cleaned.replace(pattern, '');
            });
            
            cleaned = cleaned
                .replace(/\n\s*\n\s*\n+/g, '\n\n')
                .trim();
            
            if (cleaned.length > 50) {
                console.log('Final cleaned content length:', cleaned.length);
                console.log('Final cleaned content:', cleaned);
                return cleaned;
            }
        }
        
        // If story extraction failed, fall back to aggressive filtering
        console.warn('Story extraction failed, using aggressive filtering');
        
        let filtered = content;
        
        // Remove entire paragraphs that contain planning/meta language
        const metaPatterns = [
            // Remove paragraphs starting with meta language
            /^Okay,[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^So,[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^Wait,[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^Also,[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^Maybe[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^I should[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^I need[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^Need to[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^Don't forget[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^Consider[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^The player[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
            /^The story[\s\S]*?(?=\n\n|\n[A-Z][a-z]|$)/gm,
        ];
        
        // Apply filters
        metaPatterns.forEach(pattern => {
            filtered = filtered.replace(pattern, '');
        });
        
        // Clean up extra whitespace
        filtered = filtered
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            .trim();
        
        // If nothing readable remains, return fallback
        if (!filtered || filtered.length < 50) {
            console.warn('Content was mostly meta-commentary, using fallback');
            filtered = "You examine the situation carefully. The environment around you holds secrets waiting to be discovered. What do you do next?";
        }
        
        console.log('Final filtered content length:', filtered.length);
        console.log('Final filtered content:', filtered);
        return filtered;
    }
    
    /**
     * Find where the actual story content starts
     */
    findStoryStart(content) {
        const storyMarkers = [
            // Look for story beginnings
            { pattern: /The neon glow/i, priority: 1 },
            { pattern: /The (heavy|wooden|metal|steel|old|ancient) (door|gate|entrance)/i, priority: 1 },
            { pattern: /As you (examine|look|approach|move|step)/i, priority: 1 },
            { pattern: /You (see|hear|feel|smell|taste|notice|find|discover)/i, priority: 1 },
            { pattern: /The (air|room|space|corridor|hallway) (smells|feels|sounds)/i, priority: 1 },
            { pattern: /^(The|A|An) [a-z]+ (fills|drowns|casts|flickers|hums|echoes|glows|shimmers)/i, priority: 2 },
            { pattern: /^Suddenly,/i, priority: 2 },
            { pattern: /[A-Z][a-z]+ (appears|emerges|steps|walks|runs|speaks|whispers|shouts)/i, priority: 3 },
        ];
        
        let bestMatch = null;
        
        for (let marker of storyMarkers) {
            const match = content.match(marker.pattern);
            if (match) {
                const index = content.indexOf(match[0]);
                if (!bestMatch || marker.priority < bestMatch.priority || index < bestMatch.index) {
                    bestMatch = {
                        index: index,
                        match: match[0],
                        priority: marker.priority
                    };
                }
            }
        }
        
        return bestMatch;
    }
    
    /**
     * Generate action options based on current context (LEGACY METHOD - now uses Choice AI)
     */
    async generateActionOptions() {
        console.log('🔄 Legacy generateActionOptions called - redirecting to Choice AI...');
        
        const actionButtons = document.getElementById('action-buttons');
        if (!actionButtons) return;
        
        // Show loading state
        actionButtons.innerHTML = '<div class="generating-options">Generating new options...</div>';
        
        try {
            // Get current story context
            const campaign = gameState.getCampaign();
            const currentStory = campaign.story_state || '';

            // Action buttons removed - players now type their actions directly
            console.log('🎯 Action choice generation disabled - players type actions');
            
        } catch (error) {
            console.error('Failed to generate action options via Choice AI:', error);
            
            // Action buttons removed - no need for fallback options
            console.log('🎯 Fallback action buttons disabled - players type actions');
        }
    }
    
    /**
     * Generate contextual options based on story content
     */
    async generateContextualOptions(storyContent, character, campaign) {
        if (!storyContent || storyContent.length < 20) {
            return this.getGenericOptions();
        }
        
        // Analyze the story content for contextual clues
        const contextualOptions = [];
        const storyLower = storyContent.toLowerCase();
        
        // Environment-based options
        if (storyLower.includes('door') || storyLower.includes('entrance')) {
            contextualOptions.push('Examine the door', 'Listen at the door', 'Try to open the door');
        }
        
        if (storyLower.includes('window') || storyLower.includes('glass')) {
            contextualOptions.push('Look through the window', 'Check if the window is locked');
        }
        
        if (storyLower.includes('computer') || storyLower.includes('screen') || storyLower.includes('terminal')) {
            contextualOptions.push('Access the computer', 'Check recent activity', 'Search for files');
        }
        
        if (storyLower.includes('person') || storyLower.includes('figure') || storyLower.includes('someone')) {
            contextualOptions.push('Approach carefully', 'Call out to them', 'Observe from a distance');
        }
        
        if (storyLower.includes('sound') || storyLower.includes('noise') || storyLower.includes('hear')) {
            contextualOptions.push('Investigate the sound', 'Move quietly', 'Listen more carefully');
        }
        
        if (storyLower.includes('dark') || storyLower.includes('shadow') || storyLower.includes('dim')) {
            contextualOptions.push('Turn on lights', 'Use phone flashlight', 'Move cautiously');
        }
        
        // Setting-specific options
        if (campaign.setting === 'cyberpunk') {
            contextualOptions.push('Check for surveillance', 'Hack nearby systems', 'Scan for wireless signals');
        } else if (campaign.setting === 'horror') {
            contextualOptions.push('Stay alert for danger', 'Look for an escape route', 'Check your surroundings');
        } else if (campaign.setting === 'fantasy') {
            contextualOptions.push('Cast a spell', 'Check for magical auras', 'Draw your weapon');
        }
        
        // Always include some universal options
        const universalOptions = [
            'Look around carefully',
            'Think about your next move',
            'Search the area',
            'Move forward cautiously'
        ];
        
        // Combine contextual and universal options, remove duplicates
        const allOptions = [...new Set([...contextualOptions, ...universalOptions])];
        
        // Return 4-6 options max
        return allOptions.slice(0, 6);
    }
    
    /**
     * Get generic fallback options
     */
    getGenericOptions() {
        return [
            'Look around carefully',
            'Talk to someone nearby',
            'Search for clues',
            'Move forward cautiously',
            'Wait and observe',
            'Check your equipment'
        ];
    }
    
    /**
     * Generate fallback options when AI generation fails
     */
    generateFallbackOptions(actionButtons) {
        const options = this.getGenericOptions();
        
        actionButtons.innerHTML = options.map(option => `
            <button class="action-btn" data-action="${option}">
                ${option}
            </button>
        `).join('');
        
        // Bind click events
        actionButtons.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                
                // Don't disable all buttons - let the coordination system handle state
                eventBus.emit('player:action', { action });
            });
        });
        
        // Apply current action state styling after buttons are created
        this.updateActionButtonStates();
    }
    
    /**
     * Show typing indicator
     */
    showProgressiveLoadingText() {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;
        
        // Remove any existing loading messages
        const existingLoading = storyContent.querySelectorAll('.loading-message');
        existingLoading.forEach(msg => msg.remove());
        
        // Create loading message element
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'story-entry loading-message';
        loadingDiv.innerHTML = `
            <div class="entry-content loading-text">
                <span class="loading-dots">🎲</span>
                <span id="loading-text-content">The story unfolds...</span>
            </div>
        `;
        
        storyContent.appendChild(loadingDiv);
        storyContent.scrollTop = storyContent.scrollHeight;
        
        // Progressive loading messages
        const loadingMessages = [
            "The story unfolds...",
            "Consulting the ancient tomes...",
            "The dice are rolling...",
            "Magic weaves through reality...",
            "Your fate takes shape...",
            "The adventure continues...",
            "Epic moments await..."
        ];
        
        let messageIndex = 0;
        this.loadingInterval = setInterval(() => {
            const textElement = document.getElementById('loading-text-content');
            if (textElement && messageIndex < loadingMessages.length - 1) {
                messageIndex++;
                textElement.textContent = loadingMessages[messageIndex];
            }
        }, 1500);
    }
    
    hideProgressiveLoadingText() {
        // Clear the loading interval
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
        
        // Remove loading messages
        const storyContent = document.getElementById('story-content');
        if (storyContent) {
            const loadingMessages = storyContent.querySelectorAll('.loading-message');
            loadingMessages.forEach(msg => msg.remove());
        }
    }

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
        
        // Also hide progressive loading text
        this.hideProgressiveLoadingText();
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
     * Display error message to user
     */
    displayError(message) {
        console.error('� AI Error:', message);
        
        // Display error message in the story area
        this.displayStoryContent(`⚠️ ${message}`, 'system-message');
        
        // Show toast notification
        if (typeof showToast !== 'undefined') {
            showToast(message, 'error');
        }
    }
}

// Initialize AI manager
const aiManager = new AIManager();

// Add global debug function for browser console testing
window.testAI = async function() {
    console.log('🔧 GLOBAL AI TEST FUNCTION CALLED');
    if (aiManager) {
        return await aiManager.debugTest();
    } else {
        console.error('🔧 AI Manager not available');
        return null;
    }
};

// Also add direct access to aiManager for debugging
window.aiManager = aiManager;

console.log('🔧 AI SYSTEM LOADED - Type testAI() in console to test');

// Export to global scope
window.aiManager = aiManager;

// Add global function to toggle fallback mode for testing
window.enableFallbackMode = () => {
    aiManager.forceFallbackMode = true;
    console.log('Fallback mode enabled - AI responses disabled');
};

window.disableFallbackMode = () => {
    aiManager.forceFallbackMode = false;
    console.log('Fallback mode disabled - AI responses enabled');
};
