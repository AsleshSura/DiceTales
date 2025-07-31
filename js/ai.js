/**
 * DiceTales - AI Integration
 * HackClub AI API integration for dynamic storytelling
 */

class AIManager {
    constructor() {
        this.apiUrl = 'https://ai.hackclub.com/chat/completions';
        this.model = 'Qwen/Qwen2.5-32B-Instruct';
        this.conversationHistory = [];
        this.maxTokens = 8000; // Increased for longer responses
        this.isProcessing = false;
        this.initialized = false;
        this.forceFallbackMode = false; // Add this for testing
        
        // Action-dice coordination system
        this.pendingAction = null;
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
        
        console.log('Processing action:', actionData.action);
        
        // Temporary: Force fallback mode for testing if AI is not working
        if (this.forceFallbackMode) {
            console.log('FALLBACK MODE: Using fallback response');
            this.showFallbackResponse(actionData.action);
            this.isProcessing = false;
            this.hideTypingIndicator();
            return;
        }
        
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            console.log('Character:', character);
            console.log('Campaign:', campaign);
            
            // Build context
            const context = this.buildActionContext(character, campaign, actionData);
            console.log('Built context:', context);
            
            // Get AI response
            console.log('Calling AI...');
            const response = await this.callAI([
                { role: 'system', content: this.buildSystemPrompt() },
                { role: 'user', content: context },
                { role: 'user', content: '🚨 RESPOND WITH PURE STORY ONLY - no meta-commentary, no analysis, just what happens in the game world!' }
            ]);
            
            console.log('AI Response received:', response);
            
            if (response) {
                // Check if response requests a dice roll
                const diceRequest = this.detectDiceRequest(response);
                
                if (diceRequest) {
                    // Store the action and AI response, wait for dice roll
                    this.pendingAction = actionData;
                    this.pendingAIResponse = response;
                    this.requiredDiceRoll = diceRequest;
                    this.actionState = 'waiting_for_dice';
                    
                    // Display the story content that requests the dice roll
                    this.displayStoryContent(actionData.action, 'player-action');
                    setTimeout(() => {
                        this.displayStoryContent(response, 'dm-response');
                        // Emit event for dice system to detect and show dice
                        eventBus.emit('ai:response', response);
                        // Generate action options first, then update their states
                        this.generateActionOptions();
                    }, 1000);
                } else {
                    // No dice required, proceed normally
                    this.displayStoryContent(actionData.action, 'player-action');
                    
                    setTimeout(() => {
                        this.displayStoryContent(response, 'dm-response');
                        eventBus.emit('ai:response', response);
                        this.generateActionOptions();
                    }, 1000);
                    
                    this.updateGameState(actionData, response);
                }
            } else {
                console.error('No response from AI');
                this.showFallbackResponse(actionData.action);
            }
            
        } catch (error) {
            console.error('Failed to process player action:', error);
            // Enable fallback mode if AI keeps failing
            this.forceFallbackMode = true;
            this.showFallbackResponse(actionData.action);
        } finally {
            this.isProcessing = false;
            this.hideTypingIndicator();
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
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            // Build context with dice roll result
            const contextWithDice = this.buildActionContextWithDice(
                character, 
                campaign, 
                this.pendingAction, 
                this.completedDiceRoll
            );
            
            // Get AI response considering the dice result
            const response = await this.callAI([
                { role: 'system', content: this.buildSystemPrompt() },
                { role: 'user', content: contextWithDice },
                { role: 'user', content: '🚨 RESPOND WITH PURE STORY ONLY - interpret the dice roll result and continue the story!' }
            ]);
            
            if (response) {
                // Display the final story response
                setTimeout(() => {
                    this.displayStoryContent(response, 'dm-response');
                    eventBus.emit('ai:response', response);
                    this.generateActionOptions();
                }, 500);
                
                this.updateGameState(this.pendingAction, response);
            }
            
        } catch (error) {
            logger.error('Failed to submit action with dice:', error);
            this.showFallbackResponse(this.pendingAction.action);
        } finally {
            // Reset state
            this.resetActionState();
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
     * Update action button states based on current workflow
     */
    updateActionButtonStates() {
        console.log('updateActionButtonStates called, actionState:', this.actionState);
        
        const actionButtons = document.getElementById('action-buttons');
        if (!actionButtons) {
            console.log('No action-buttons element found');
            return;
        }
        
        const buttons = actionButtons.querySelectorAll('.action-btn');
        console.log('Found', buttons.length, 'action buttons');
        
        if (this.actionState === 'waiting_for_dice') {
            console.log('Setting waiting_for_dice state, pendingAction:', this.pendingAction?.action);
            // Highlight the selected action, disable others
            buttons.forEach(btn => {
                if (btn.dataset.action === this.pendingAction?.action) {
                    btn.classList.add('selected-pending');
                    btn.disabled = false;
                    btn.innerHTML = `${btn.dataset.action} <span class="status">(Selected - Roll dice to continue)</span>`;
                    console.log('Set selected-pending for:', btn.dataset.action);
                } else {
                    btn.disabled = true;
                }
            });
        } else if (this.actionState === 'can_submit') {
            console.log('Setting can_submit state');
            // Show that dice has been rolled and action can be submitted
            buttons.forEach(btn => {
                if (btn.dataset.action === this.pendingAction?.action) {
                    btn.classList.add('ready-to-submit');
                    btn.innerHTML = `${btn.dataset.action} <span class="status">(Ready to submit!)</span>`;
                    btn.disabled = false;
                    console.log('Set ready-to-submit for:', btn.dataset.action);
                } else {
                    btn.disabled = true;
                }
            });
        } else {
            console.log('Setting normal state');
            // Normal state - enable all buttons
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('selected-pending', 'ready-to-submit');
                btn.innerHTML = btn.dataset.action;
            });
        }
    }
    
    /**
     * Process dice roll results
     */
    async processDiceRoll(rollData) {
        console.log('Dice rolled:', rollData);
        
        // If we're waiting for a dice roll, store it and update state
        if (this.actionState === 'waiting_for_dice') {
            this.completedDiceRoll = rollData;
            this.actionState = 'can_submit';
            
            // Update action buttons to show ready state
            this.updateActionButtonStates();
            
            showToast(`Rolled ${rollData.result}! Click your selected action to continue.`, 'success');
            return;
        }
        
        // Handle standalone dice rolls (legacy behavior)
        const character = gameState.getCharacter();
        const currentStory = gameState.get('campaign.story_state');
        
        const rollContext = `
            DICE ROLL RESULT:
            Dice: ${rollData.dice || rollData.type}
            Total: ${rollData.result || rollData.total}
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
                this.displayStoryContent(`🎲 Rolled ${rollData.result || rollData.total}`, 'dice-result');
                setTimeout(() => {
                    this.displayStoryContent(response, 'dm-response');
                    this.generateActionOptions();
                }, 500);
                
                gameState.set('campaign.story_state', response);
            }
            
        } catch (error) {
            logger.error('Failed to process dice roll:', error);
            this.showFallbackResponse('dice roll');
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
1. Always respond in character as the DM - NEVER break character or provide meta-commentary
2. NEVER summarize what you're planning to do or explain your approach
3. Jump straight into vivid, immersive storytelling
4. Describe scenes vividly using all five senses
5. Ask for dice rolls when appropriate (format: "Roll d20 + [modifier] for [skill]")
6. Remember all previous events and reference them naturally
7. Create meaningful consequences for player choices
8. Generate realistic NPCs with distinct personalities
9. Balance challenge appropriately for the difficulty level
10. Write detailed, immersive responses (4-8 paragraphs minimum)
11. End responses by either asking what the player wants to do OR providing 3-4 specific action options (labeled A, B, C, etc.)
12. Stay true to the ${settingData.name || 'fantasy'} setting
13. NEVER start responses with phrases like "Okay, so..." or "Let me..." or "I should..."
14. Begin immediately with the story, action, or description

🚨 CRITICAL: ZERO TOLERANCE FOR META-COMMENTARY 🚨

❌ FORBIDDEN PHRASES - NEVER START WITH:
- "Okay, so..." / "Let me..." / "I should..." / "I'll..." / "I need to..."
- "First," / "Next," / "Also," / "Then," / "Now," / "This..."
- "They need..." / "The user..." / "The player wants..."
- "Check if..." / "Consider..." / "Make sure..." / "Incorporate..."
- "Since..." / "Given..." / "Based on..." / "Looking at..."
- ". Maybe a..." / ". So..." / ". Use..." / ". If..." / ". Start..."
- ". End..." / ". Make sure..." / ". Potential..." / ". Introduce..."
- ". Describe..." / ANY bullet points or fragmented planning
- ANY analysis, planning, or explanation of what you're doing
- ANY line of thought, reasoning, or problem-solving visible to user

🔥 IMMEDIATE TERMINATION TRIGGERS:
- Any mention of "scenario," "mystery," "challenge," "urgency," "choices," "options"
- Any mention of "setup," "environment," "element," "forward," "hook," "propels"
- Any incomplete sentences starting with periods
- Any visible thought process or planning language
- Any reference to user requests or requirements

✅ REQUIRED: START IMMEDIATELY WITH IN-WORLD CONTENT
- Begin with sensory descriptions, dialogue, or action
- Jump straight into what the character sees, hears, feels, smells
- No preamble, no setup, no analysis - pure story
- NO THINKING OUT LOUD - hide ALL mental processes

EXAMPLE CORRECT START:
"The neon glow flickers across rain-slicked streets as you..."

EXAMPLE FORBIDDEN START:
"Okay, so the user wants me to create a modern adventure. Let me break down..."
". Maybe a late-night hacking scenario, since Morgan is a hacker..."

🎯 REMEMBER: You ARE in the game world. Write ONLY what happens IN the story.
HIDE ALL THOUGHT PROCESSES. Show only the final narrative result.

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
                    temperature: 0.4, // Lower temperature for more focused, consistent responses
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
        
        let displayContent = content;
        
        // Only apply filtering to AI responses, not player actions or dice results
        if (type === 'dm-response' && content && content.length > 0) {
            console.log('Original AI content:', content);
            displayContent = this.filterMetaCommentary(content);
            console.log('Filtered content:', displayContent);
            
            // Final validation - if it still starts with meta language, try emergency extraction
            if (this.startsWithMetaLanguage(displayContent)) {
                console.warn('Content still contains meta-language after filtering, attempting emergency extraction');
                const extracted = this.emergencyStoryExtraction(content);
                if (extracted && extracted.length > 20) {
                    displayContent = extracted;
                    console.log('Emergency extracted content:', displayContent);
                }
            }
        }
        
        const messageElement = createElement('div', {
            className: type,
            innerHTML: formatText(displayContent)
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
        
        // TEMPORARILY DISABLED - return original content to debug truncation
        console.log('Original content length:', content.length);
        console.log('Full original content:', content);
        return content;
    }
    
    /**
     * Generate action options based on current context
     */
    async generateActionOptions() {
        const actionButtons = document.getElementById('action-buttons');
        if (!actionButtons) return;
        
        // Clear existing buttons
        actionButtons.innerHTML = '<div class="generating-options">Generating new options...</div>';
        
        try {
            // Get current story context
            const campaign = gameState.getCampaign();
            const character = gameState.getCharacter();
            const currentStory = campaign.story_state || '';
            
            // Generate contextual options based on the story
            const options = await this.generateContextualOptions(currentStory, character, campaign);
            
            // Display the new options
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
            
        } catch (error) {
            console.error('Failed to generate action options:', error);
            
            // Fallback to generic options
            this.generateFallbackOptions(actionButtons);
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

// Add global function to toggle fallback mode for testing
window.enableFallbackMode = () => {
    aiManager.forceFallbackMode = true;
    console.log('Fallback mode enabled - AI responses disabled');
};

window.disableFallbackMode = () => {
    aiManager.forceFallbackMode = false;
    console.log('Fallback mode disabled - AI responses enabled');
};
