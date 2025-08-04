/**
 * DiceTales - Unified AI System
 * Combined AI manager with HuggingFace integration
 * Dynamic storytelling system for adventure games
 */

class AIManager {
    constructor() {
        // Use only HuggingFace as the primary and only AI system
        this.useHuggingFace = true;
        
        // Initialize DM Response Evaluator with error handling
        try {
            if (typeof DMEvaluator !== 'undefined') {
                this.dmEvaluator = new DMEvaluator();
                this.enableEvaluation = true;
                this.autoImprove = true;
                logger.debug('🎭 DM Response Evaluator initialized');
            } else {
                logger.warn('⚠️ DMEvaluator not available, disabling evaluation features');
                this.dmEvaluator = null;
                this.enableEvaluation = false;
                this.autoImprove = false;
            }
        } catch (error) {
            logger.warn('⚠️ Failed to initialize DMEvaluator:', error);
            this.dmEvaluator = null;
            this.enableEvaluation = false;
            this.autoImprove = false;
        }
        
        logger.debug('📊 Evaluation enabled:', this.enableEvaluation);
        logger.debug('🔧 Auto-improvement enabled:', this.autoImprove);
        
        // HuggingFace configuration - enhanced human-like AI system
        this.huggingFaceBaseUrl = 'https://api-inference.huggingface.co/models/';
        this.currentHuggingFaceModel = 'microsoft/GODEL-v1_1-large-seq2seq';
        this.huggingFaceModelQueue = AI_CONFIG.HUGGINGFACE_MODELS || [
            'microsoft/GODEL-v1_1-large-seq2seq',
            'facebook/blenderbot-400M-distill',
            'microsoft/GODEL-v1_1-base-seq2seq',
            'facebook/blenderbot-1B-distill',
            'microsoft/DialoGPT-large',
            'microsoft/DialoGPT-medium',
            'gpt2-large',
            'distilgpt2'
        ];
        this.huggingFaceRetryCount = 0;
        this.maxHuggingFaceRetries = 3;
        this.huggingFaceReady = false;
        
        // Enhanced conversation settings for human-like responses
        this.conversationConfig = AI_CONFIG.CONVERSATION_SETTINGS || {
            maxContextLength: 2048,
            temperature: 0.8,
            topP: 0.9,
            repetitionPenalty: 1.1,
            maxNewTokens: 150,
            doSample: true,
            numBeams: 3
        };
        
        // Enhanced memory and context management
        this.memoryConfig = AI_CONFIG.MEMORY_SETTINGS || {
            maxConversationHistory: 20,
            plotContextWindow: 5,
            characterMemoryDepth: 10
        };
        
        // System state
        this.conversationHistory = [];
        this.plotContext = [];
        this.characterInteractions = new Map();
        this.maxTokens = 8000;
        this.isProcessing = false;
        this.initialized = false;
        this.isGeneratingStory = false;
        this.isGeneratingChoices = false;
        this.lastStoryRequest = null;
        this.pendingAction = null;
        this.lastPlayerAction = null;
        this.lastProcessedAction = null;
        this.requiredDiceRoll = null;
        this.completedDiceRoll = null;
        this.actionState = 'ready';
        this.actionDebounceTime = 2000;
        this.lastActionTime = 0;
        this.recentResponses = [];
        this.maxRecentResponses = 5;
        
        // Campaign Story System
        this.currentCampaignStory = null;
        this.campaignGenerated = false;
        this.storyGenerationInProgress = false;
        
        // Memory system integration
        this.memoryManager = null;
        
        this.bindEvents();
        
        // Initialize HuggingFace as the primary AI system for dynamic storytelling
        logger.debug('🤗 Initializing Dynamic AI storytelling system...');
        this.initHuggingFace();
        logger.debug('🤗 Dynamic AI system initialized successfully');
        
        // Initialize memory manager
        this.initializeMemoryManager();
        
        // Make test methods available globally for debugging
        if (typeof window !== 'undefined') {
            window.testAI = () => this.testAIResponse();
            window.testPlayerAction = (action) => this.testPlayerActionFlow(action);
            window.testMemory = () => this.testMemorySystem();
        }
    }
    
    /**
     * Initialize memory manager integration
     */
    initializeMemoryManager() {
        try {
            if (typeof memoryManager !== 'undefined') {
                this.memoryManager = memoryManager;
                this.memoryManager.initialize();
                logger.info('🧠 Memory Manager integrated with AI system');
            } else {
                logger.warn('🧠 Memory Manager not available - some features may be limited');
            }
        } catch (error) {
            logger.error('🧠 Failed to initialize Memory Manager:', error);
        }
    }
    
    /**
     * Test memory system functionality
     */
    testMemorySystem() {
        if (!this.memoryManager) {
            console.log('🧠 Memory Manager not available');
            return;
        }
        
        console.log('🧠 Testing Memory System...');
        
        // Test decision recording
        this.memoryManager.recordDecision('Test decision', 'Test consequence', 'Test context');
        
        // Test relationship tracking
        this.memoryManager.updateRelationship('Test NPC', 'friendly', 'A helpful character');
        
        // Test discovery recording
        this.memoryManager.recordDiscovery('Test discovery', 'secret', 'high');
        
        // Get memory summary
        const summary = this.memoryManager.getMemorySummary();
        console.log('🧠 Memory Summary:', summary);
        
        console.log('🧠 Memory System test completed');
    }

    async initialize() {
        if (this.initialized) return;
        console.log('🤗 STARTING DYNAMIC AI SYSTEM INITIALIZATION...');
        console.log('🤗 Using advanced HuggingFace AI for immersive storytelling');
        
        try {
            // Test HuggingFace connection
            console.log('🤗 Testing Dynamic AI connections...');
            await this.testConnection();
            this.initialized = true;
            console.log('✅ DYNAMIC AI SYSTEM READY FOR ADVENTURE');
        } catch (error) {
            console.warn('⚠️ AI initialization had issues, but continuing with fallbacks:', error);
            this.initialized = true;
        }
    }
    
    async testConnection() {
        console.log('🤗 TESTING DYNAMIC AI CONNECTION...');
        
        try {
            console.log('🤗 Testing advanced storytelling AI connection...');
            const testResponse = await this.makeHuggingFaceRequest('Testing connection', { max_length: 50 });
            if (testResponse && testResponse.length > 10) {
                console.log('🤗 DYNAMIC AI CONNECTION SUCCESSFUL');
                return true;
            }
        } catch (error) {
            console.warn('🤗 AI test failed:', error);
        }
        
        console.log('🤗 CONNECTION TEST COMPLETED - using AI fallbacks if needed');
        return true;
    }
    
    // HuggingFace Integration Methods
    async initHuggingFace() {
        try {
            await this.warmupHuggingFaceModel();
            this.huggingFaceReady = true;
        } catch (error) {
            console.warn('🤗 HuggingFace initialization failed:', error);
        }
    }
    
    async warmupHuggingFaceModel() {
        console.log('🤗 Warming up model:', this.currentHuggingFaceModel);
        
        try {
            const response = await this.makeHuggingFaceRequest('Test warmup', { max_length: 10 });
            console.log('🤗 Model warmup successful');
            return response;
        } catch (error) {
            console.log('🤗 Model warmup failed, trying alternative...');
            await this.tryAlternativeHuggingFaceModel();
            throw error;
        }
    }
    
    async makeHuggingFaceRequest(prompt, options = {}) {
        console.log('🤗 Making enhanced HuggingFace request with human-like conversation...');
        console.log('🤗 Prompt length:', prompt.length, 'characters');
        
        // Prepare conversation context for better coherence
        const contextualPrompt = this.prepareContextualPrompt(prompt);
        
        const requestData = {
            inputs: contextualPrompt,
            parameters: {
                max_new_tokens: options.max_length || this.conversationConfig.maxNewTokens,
                temperature: options.temperature || this.conversationConfig.temperature,
                do_sample: this.conversationConfig.doSample,
                top_p: this.conversationConfig.topP,
                repetition_penalty: this.conversationConfig.repetitionPenalty,
                num_beams: this.conversationConfig.numBeams,
                return_full_text: false,
                pad_token_id: 50256 // Standard padding token
            },
            options: {
                wait_for_model: true,
                use_cache: false
            }
        };
        
        console.log('🤗 Using enhanced human-like models:', this.huggingFaceModelQueue.slice(0, 4));
        
        for (let attempt = 0; attempt < this.huggingFaceModelQueue.length; attempt++) {
            const modelToTry = this.huggingFaceModelQueue[attempt];
            console.log(`🤗 Trying conversational model ${attempt + 1}/${this.huggingFaceModelQueue.length}:`, modelToTry);
            
            try {
                const response = await fetch(this.huggingFaceBaseUrl + modelToTry, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.HUGGINGFACE_API_KEY || ''}` // Optional API key
                    },
                    body: JSON.stringify(requestData)
                });
                
                console.log(`🤗 ${modelToTry} response status:`, response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`🤗 ${modelToTry} result structure:`, typeof result, Array.isArray(result) ? result.length : 'not array');
                    
                    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
                        this.currentHuggingFaceModel = modelToTry;
                        const generatedText = result[0].generated_text.trim();
                        
                        // Post-process for better human-like quality
                        const enhancedText = this.enhanceResponseQuality(generatedText, prompt);
                        
                        // Update conversation history for better context
                        this.updateConversationHistory(prompt, enhancedText);
                        
                        console.log('🤗 SUCCESS with conversational model', modelToTry, '- Enhanced response length:', enhancedText.length);
                        console.log('🤗 Enhanced response preview:', enhancedText.substring(0, 100) + '...');
                        return enhancedText;
                    } else {
                        console.warn(`🤗 ${modelToTry} returned unexpected format:`, result);
                    }
                } else {
                    const errorText = await response.text();
                    console.warn(`🤗 ${modelToTry} failed with status ${response.status}:`, errorText.substring(0, 200));
                }

            } catch (error) {
                console.error(`🤗 Error with ${modelToTry}:`, error.message);
            }

            // Add delay between model attempts
            if (attempt < this.huggingFaceModelQueue.length - 1) {
                console.log('🤗 Waiting 1.5 seconds before trying next conversational model...');
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        console.error('🤗 ALL CONVERSATIONAL MODELS FAILED - throwing error to trigger fallback');
        throw new Error('All HuggingFace conversational models failed or returned no content');
    }
    
    /**
     * Prepare contextual prompt with conversation history and plot grounding
     */
    prepareContextualPrompt(basePrompt) {
        let contextualPrompt = '';
        
        // Add memory-based plot grounding first for consistency
        if (this.memoryManager) {
            const groundingPrompt = this.memoryManager.getGroundingPrompt();
            if (groundingPrompt) {
                contextualPrompt += groundingPrompt;
            }
        }
        
        // Add recent conversation history for better continuity
        if (this.conversationHistory.length > 0) {
            const recentHistory = this.conversationHistory.slice(-3); // Last 3 exchanges
            contextualPrompt += "Recent conversation:\n";
            recentHistory.forEach(exchange => {
                contextualPrompt += `Player: ${exchange.player}\nDM: ${exchange.dm}\n`;
            });
            contextualPrompt += "\nCurrent situation:\n";
        }
        
        // Add character state for consistency
        if (typeof gameState !== 'undefined') {
            const characterName = gameState.get('character.name') || 'Adventurer';
            const characterClass = gameState.get('character.class') || 'Unknown';
            const currentLocation = gameState.get('campaign.current_location') || 'Unknown Location';
            const characterLevel = gameState.get('character.level') || 1;
            
            contextualPrompt += `Character: ${characterName} (Level ${characterLevel} ${characterClass}) at ${currentLocation}\n\n`;
        }
        
        // Add instruction for human-like conversation style
        contextualPrompt += "Respond as a creative, engaging dungeon master. Be conversational, descriptive, and immersive. Stay consistent with the story context above.\n\n";
        
        contextualPrompt += basePrompt;
        
        // Limit total context length
        if (contextualPrompt.length > this.conversationConfig.maxContextLength) {
            // Preserve the base prompt and character info, trim middle sections
            const baseLength = basePrompt.length;
            const characterInfo = contextualPrompt.match(/Character:.*?\n\n/s)?.[0] || '';
            const instructions = "Respond as a creative, engaging dungeon master. Be conversational, descriptive, and immersive. Stay consistent with the story context above.\n\n";
            
            const availableSpace = this.conversationConfig.maxContextLength - baseLength - characterInfo.length - instructions.length;
            const trimmedContext = contextualPrompt.substring(0, availableSpace);
            
            contextualPrompt = trimmedContext + characterInfo + instructions + basePrompt;
        }
        
        return contextualPrompt;
    }
    
    /**
     * Enhance response quality for more human-like conversation
     */
    enhanceResponseQuality(response, originalPrompt) {
        let enhanced = response;
        
        // Remove common AI artifacts and formatting issues
        enhanced = enhanced.replace(/^(AI|Assistant|DM|Bot|System):\s*/i, '');
        enhanced = enhanced.replace(/\[.*?\]/g, ''); // Remove bracketed instructions
        enhanced = enhanced.replace(/\*\*.*?\*\*/g, ''); // Remove markdown bold
        enhanced = enhanced.replace(/^\s*["']|["']\s*$/g, ''); // Remove wrapping quotes
        enhanced = enhanced.replace(/\n{3,}/g, '\n\n'); // Limit excessive line breaks
        
        // Fix common grammar and flow issues
        enhanced = enhanced.replace(/\s+/g, ' '); // Normalize spaces
        enhanced = enhanced.replace(/([.!?])\s*([a-z])/g, '$1 $2'); // Fix sentence spacing
        
        // Ensure proper sentence structure
        enhanced = enhanced.trim();
        if (enhanced.length > 0) {
            enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
        }
        
        // Add natural conclusion if response seems cut off
        if (enhanced.length > 50 && !enhanced.match(/[.!?]$/)) {
            enhanced += '.';
        }
        
        // Add variety to avoid repetitive patterns
        if (this.conversationHistory.length > 0) {
            const lastResponse = this.conversationHistory[this.conversationHistory.length - 1]?.dm || '';
            const responseStart = enhanced.substring(0, 30).toLowerCase();
            const lastStart = lastResponse.substring(0, 30).toLowerCase();
            
            if (responseStart === lastStart || 
                (responseStart.length > 10 && lastStart.includes(responseStart.substring(0, 15)))) {
                // Response seems repetitive, add natural variation
                const naturalTransitions = [
                    "As the adventure continues, ",
                    "Meanwhile, ",
                    "In response to your actions, ",
                    "The situation evolves as ",
                    "As you consider your options, ",
                    "The story unfolds further: "
                ];
                const transition = naturalTransitions[Math.floor(Math.random() * naturalTransitions.length)];
                enhanced = transition + enhanced.charAt(0).toLowerCase() + enhanced.slice(1);
            }
        }
        
        // Enhance descriptive language for immersion
        enhanced = this.addDescriptiveElements(enhanced);
        
        return enhanced.trim();
    }
    
    /**
     * Add subtle descriptive elements to make responses more immersive
     */
    addDescriptiveElements(text) {
        // Don't over-process short responses
        if (text.length < 50) return text;
        
        // Add sensory details to key action words
        const enhancements = {
            'you see': ['you notice', 'you observe', 'you spot', 'you glimpse'],
            'you hear': ['you detect', 'you pick up', 'you catch the sound of'],
            'you feel': ['you sense', 'you experience', 'you become aware of'],
            'you walk': ['you move', 'you proceed', 'you advance', 'you step forward'],
            'says': ['explains', 'mentions', 'notes', 'remarks', 'states'],
            'looks': ['appears', 'seems', 'gives the impression of being']
        };
        
        let enhanced = text;
        for (const [original, alternatives] of Object.entries(enhancements)) {
            const regex = new RegExp(`\\b${original}\\b`, 'gi');
            if (regex.test(enhanced) && Math.random() < 0.3) { // 30% chance to enhance
                const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
                enhanced = enhanced.replace(regex, replacement);
            }
        }
        
        return enhanced;
    }
    
    /**
     * Update conversation history for better context tracking
     */
    updateConversationHistory(playerInput, dmResponse) {
        const exchange = {
            player: playerInput.substring(0, 200), // Limit length
            dm: dmResponse.substring(0, 200),
            timestamp: Date.now(),
            plotRelevant: this.isPlotRelevant(dmResponse)
        };
        
        this.conversationHistory.push(exchange);
        
        // Maintain history size limit
        if (this.conversationHistory.length > this.memoryConfig.maxConversationHistory) {
            this.conversationHistory = this.conversationHistory.slice(-this.memoryConfig.maxConversationHistory);
        }
        
        // Update plot context if relevant
        if (exchange.plotRelevant) {
            this.plotContext.push(dmResponse.substring(0, 100));
            if (this.plotContext.length > this.memoryConfig.plotContextWindow) {
                this.plotContext = this.plotContext.slice(-this.memoryConfig.plotContextWindow);
            }
        }
        
        // Integrate with memory manager for persistent plot grounding
        if (this.memoryManager) {
            this.memoryManager.recordConversationExchange(playerInput, dmResponse);
        }
        
        console.log('💬 Enhanced conversation history updated - Total exchanges:', this.conversationHistory.length);
        if (exchange.plotRelevant) {
            console.log('📖 Plot-relevant exchange recorded for story consistency');
        }
    }
    
    /**
     * Determine if response contains plot-relevant information
     */
    isPlotRelevant(response) {
        const plotKeywords = [
            'quest', 'mission', 'objective', 'goal', 'discovery', 'secret', 'treasure',
            'enemy', 'ally', 'npc', 'character', 'location', 'map', 'clue', 'hint',
            'danger', 'threat', 'mystery', 'legend', 'artifact', 'magic', 'spell'
        ];
        
        const lowerResponse = response.toLowerCase();
        return plotKeywords.some(keyword => lowerResponse.includes(keyword));
    }
    
    async tryAlternativeHuggingFaceModel() {
        const currentIndex = this.huggingFaceModelQueue.indexOf(this.currentHuggingFaceModel);
        const nextIndex = (currentIndex + 1) % this.huggingFaceModelQueue.length;
        const nextModel = this.huggingFaceModelQueue[nextIndex];
        
        console.log('🤗 SWITCHING FROM', this.currentHuggingFaceModel, 'TO', nextModel);
        this.currentHuggingFaceModel = nextModel;
        
        if (nextIndex === 0 && this.huggingFaceRetryCount >= this.maxHuggingFaceRetries) {
            this.huggingFaceRetryCount = 0;
        }
    }
    
    // Setting-specific campaign stories
    getCampaignInfo(settingId) {
        console.log(`🎭 Loading campaign for setting: ${settingId}`);
        
        const campaigns = {
            'medieval-fantasy': {
                title: 'The Shadow Crown',
                plot: 'An ancient crown that grants immense power has been shattered into five pieces and scattered across the realm. Dark forces seek to reunite the crown fragments to plunge the world into eternal darkness, while heroes must find the pieces first to restore balance.',
                locations: 'The Crystal Caverns, Sunken Ruins of Thalara, The Whispering Woods, Dragonspine Mountains, The Shadowlands',
                antagonist: 'Lord Malachar the Shadow Binder, a fallen paladin who commands an army of undead and seeks the crown to merge the mortal world with the realm of shadows',
                stakes: 'The balance between light and shadow, the fate of all kingdoms, and the survival of magic itself',
                hook: 'Your village was the first to be consumed by creeping shadow magic - your family and friends are trapped in a twilight realm until the crown is restored.',
                focus: 'All adventures should connect to finding crown fragments, battling shadow creatures, uncovering ancient magic, and racing against Malachar\'s forces.',
                tone: 'epic fantasy adventure'
            },
            'modern-day': {
                title: 'The Veil Protocol',
                plot: 'A secret organization called "The Veil" has been hiding supernatural phenomena from the public for decades. Now their containment systems are failing, and supernatural entities are breaking into the real world. A conspiracy within The Veil seeks to weaponize these entities.',
                locations: 'Underground Veil facilities, abandoned subway tunnels, corporate headquarters, supernatural hotspots in major cities, secret government installations',
                antagonist: 'Director Elena Cross, a high-ranking Veil operative who believes humanity should embrace supernatural power rather than hide from it, leading a faction to unleash chaos',
                stakes: 'The secret war between supernatural and mundane worlds, the collapse of reality\'s barriers, and whether humanity can handle the truth',
                hook: 'You witnessed a supernatural event that The Veil couldn\'t contain or cover up - now you\'re either recruited as an asset or marked as a liability.',
                focus: 'All scenes should involve supernatural investigations, Veil politics, reality breaches, corporate conspiracies, and the struggle between secrecy and revelation.',
                tone: 'urban fantasy thriller'
            },
            'sci-fi-space': {
                title: 'The Quantum Relay',
                plot: 'An alien artifact called the Quantum Relay has been discovered, capable of opening wormholes across the galaxy. A rogue faction wants to use it to isolate Earth from the galactic community, while others seek to use it for invasion or exploration.',
                locations: 'Research Station Alpha, Asteroid Mining Colony, Ancient Alien Ruins, The Enemy Mothership, Deep Space Exploration Vessels',
                antagonist: 'Commander Vex of the Crimson Fleet, leading a human separatist faction allied with hostile aliens who believe Earth should rule the galaxy alone',
                stakes: 'Earth\'s place in the galactic community, the future of interstellar travel, and first contact with ancient alien civilizations',
                hook: 'Your family lives on one of the colonies that will be the first target of isolation or invasion.',
                focus: 'All scenes should connect to the Quantum Relay artifact, space stations, alien technology, the Crimson Fleet, and galactic politics.',
                tone: 'space opera adventure'
            },
            'eldritch-horror': {
                title: 'The Arkham Manuscripts',
                plot: 'A collection of forbidden texts called the Arkham Manuscripts has been discovered, containing knowledge that could tear holes in reality itself. Cultists seek to perform the final ritual described within, while investigators race to stop them before cosmic entities notice our world.',
                locations: 'Miskatonic University, abandoned mansions, underground cult temples, the decaying industrial district, forgotten graveyards',
                antagonist: 'Professor Jeremiah Blackwood, a respected academic who has been driven mad by the manuscripts and now leads a cult seeking to "enlighten" humanity with cosmic truth',
                stakes: 'The sanity of mankind, the integrity of reality, and whether some knowledge is too dangerous to possess',
                hook: 'A family member or close friend has disappeared while investigating strange occurrences around the university - their last letter mentioned finding "the truth about everything."',
                focus: 'All investigations should center on the manuscripts, creeping cosmic horror, sanity-threatening revelations, cult activities, and the price of forbidden knowledge.',
                tone: 'cosmic horror investigation'
            }
        };

        const campaign = campaigns[settingId] || campaigns['medieval-fantasy'];
        console.log(`🎭 Selected campaign: "${campaign.title}" (${campaign.tone})`);
        return campaign;
    }

    // HuggingFace Story Prompts - Dynamic based on setting
    getHuggingFaceStoryPrompt(type, settingData = null) {
        // Get current setting
        const currentSetting = settingData?.id || (typeof gameState !== 'undefined' ? gameState.getCampaign().setting : 'medieval-fantasy');
        const campaignData = this.getCampaignInfo(currentSetting);
        const settingInfo = settingData || (typeof characterManager !== 'undefined' ? characterManager.settings[currentSetting] : null);
        
        const campaignInfo = `

📚 CURRENT CAMPAIGN: "${campaignData.title}"
Main Plot: ${campaignData.plot}
Key Locations: ${campaignData.locations}
Main Antagonist: ${campaignData.antagonist}
Stakes: ${campaignData.stakes}
Character Hook: ${campaignData.hook}

🎯 STORY FOCUS: ${campaignData.focus}`;

        const settingDescription = settingInfo ? `${settingInfo.description} Technology: ${settingInfo.technology}. Magic: ${settingInfo.magic}.` : '';
        
        const basePrompts = {
            narrative: `You're a Dungeon Master running "${campaignData.title}" - an ${campaignData.tone} campaign.

SETTING: ${settingDescription}${campaignInfo}

🎭 BE A NATURAL ${campaignData.tone.toUpperCase()} DM:
You're the DM everyone wants for their ${campaignData.tone} campaign - relaxed, fun, and genuinely excited about the genre. Talk like a real person:
- Use normal language that fits the genre (avoid overly technical jargon or purple prose)
- Be enthusiastic about the setting ("Cool!" "Nice!" "Holy shit!" "Damn!")
- Talk like you're running this campaign at the table with friends
- Use contractions (you're, it's, that's, can't, won't)

📖 DESCRIBE THINGS SIMPLY:
- Use clear, direct descriptions that paint a picture without being pretentious
- Include what you see, hear, smell, feel - but keep it natural
- Avoid cliché phrases like "tapestry", "shimmering", "intricate", "ancient", "legendary"
- Say "you hear footsteps" not "the sound of approaching footsteps dances upon your ears"

🎯 KEEP THE ADVENTURE MOVING:
- Make things happen - this genre is exciting and dynamic
- End with concrete events involving the main plot elements
- Use simple transitions: "Then", "Suddenly", "Just as you do that", "A voice calls out"
- Keep responses under 200 words when possible

🚨 NEVER DO THIS:
- Don't use purple prose about the setting
- Avoid overly dramatic phrases that don't fit the genre
- Don't end with "What calls to your adventurer's spirit?" - just tell us what happens
- No overwrought descriptions - keep it grounded in the story

Current situation: `,
            
            choice: `You're a Dungeon Master presenting action options for "${campaignData.title}" ${campaignData.tone} campaign.${campaignInfo}

KEEP IT SIMPLE AND GENRE-FOCUSED:
Create exactly 4 clear, straightforward choices for this ${campaignData.tone} adventure. Each should:
- Be written in plain English appropriate to the genre
- Suggest dice rolls naturally (not force them)
- Sound like something a real GM would say
- Be specific about what the character would actually do
- Connect to the main campaign plot when possible

Based on this situation: `,
            
            character: `You're a Dungeon Master introducing a character in "${campaignData.title}" ${campaignData.tone} campaign.${campaignInfo}

BE NATURAL AND DIRECT:
Describe this character like you're telling a friend about someone interesting you encountered. Keep it:
- Simple and clear, not flowery or dramatic
- Focused on what the player would actually notice
- Under 150 words
- Conversational, like you're sitting at a gaming table
- Consider how this character might relate to the main campaign plot

Scene: `
        };
        
        return basePrompts[type] || basePrompts.narrative;
    }
    
    buildHuggingFaceEnhancedContext(baseContext, characterData = null, settingData = null) {
        let enhancedContext = baseContext;
        
        // Get current game state if not provided
        if (!characterData && typeof gameState !== 'undefined') {
            characterData = gameState.getCharacter();
        }
        if (!settingData && typeof gameState !== 'undefined') {
            const campaign = gameState.getCampaign();
            if (typeof characterManager !== 'undefined' && campaign.setting) {
                settingData = { 
                    id: campaign.setting,
                    ...characterManager.settings[campaign.setting] 
                };
            }
        }
        
        // Build campaign context with character and setting information
        let campaignContext = '';
        
        if (settingData) {
            campaignContext += `\n\n📖 CAMPAIGN SETTING: ${settingData.name}\n`;
            campaignContext += `Setting Description: ${settingData.description}\n`;
            campaignContext += `Technology Level: ${settingData.technology || 'Medieval'}\n`;
            campaignContext += `Magic System: ${settingData.magic || 'High fantasy'}\n`;
            campaignContext += `Themes: ${settingData.themes ? settingData.themes.join(', ') : 'Classic adventure'}\n`;
            
            if (settingData.dm_personality_hint) {
                campaignContext += `\n🎭 GAME MASTER GUIDANCE: ${settingData.gm_personality_hint}\n`;
            }
        }
        
        if (characterData) {
            campaignContext += `\n⚔️ PLAYER CHARACTER: ${characterData.name || 'The Hero'}\n`;
            campaignContext += `Class: ${characterData.class || 'Adventurer'} (Level ${characterData.level || 1})\n`;
            
            if (characterData.background) {
                campaignContext += `Background: ${characterData.background}\n`;
            }
            
            if (characterData.stats) {
                const stats = characterData.stats;
                campaignContext += `Ability Scores: `;
                const statNames = settingData?.abilityScores || {
                    str: {abbr: 'STR'}, dex: {abbr: 'DEX'}, con: {abbr: 'CON'},
                    int: {abbr: 'INT'}, wis: {abbr: 'WIS'}, cha: {abbr: 'CHA'}
                };
                
                const statStrings = [];
                for (const [key, value] of Object.entries(stats)) {
                    const abbr = statNames[key]?.abbr || key.toUpperCase();
                    statStrings.push(`${abbr} ${value}`);
                }
                campaignContext += statStrings.join(', ') + '\n';
            }
            
            if (characterData.health) {
                campaignContext += `Health: ${characterData.health.current}/${characterData.health.maximum}\n`;
            }
        }
        
        // Get current campaign state if available
        if (typeof gameState !== 'undefined') {
            const campaign = gameState.getCampaign();
            
            if (campaign.current_location) {
                campaignContext += `\n🗺️ CURRENT LOCATION: ${campaign.current_location}\n`;
            }
            
            // Include recent campaign history for context
            const recentLog = campaign.log ? campaign.log.slice(-3) : [];
            if (recentLog.length > 0) {
                campaignContext += `\n📖 RECENT EVENTS:\n`;
                recentLog.forEach((entry, index) => {
                    if (entry.content && entry.content.length > 50) {
                        campaignContext += `${index + 1}. ${entry.content.substring(0, 150)}...\n`;
                    }
                });
            }
        }
        
        return enhancedContext + campaignContext;
    }
    
    // Campaign Story Generation System
    async generateCampaignStory(characterData = null, settingData = null) {
        if (this.storyGenerationInProgress) {
            console.log('📚 Story generation already in progress...');
            return this.currentCampaignStory;
        }
        
        this.storyGenerationInProgress = true;
        console.log('📚 Generating campaign story...');
        
        try {
            const prompt = this.getCampaignStoryPrompt(settingData, characterData);
            console.log('📚 Using story generation prompt:', prompt.substring(0, 200) + '...');
            
            const storyResponse = await this.makeHuggingFaceRequest(prompt, {
                max_length: 1000,
                temperature: 0.8,
                do_sample: true,
                top_p: 0.9
            });
            
            if (storyResponse && storyResponse.length > 100) {
                this.currentCampaignStory = this.processCampaignStory(storyResponse);
                this.campaignGenerated = true;
                console.log('📚 Campaign story generated successfully');
                console.log('📚 Story preview:', this.currentCampaignStory.title);
                return this.currentCampaignStory;
            } else {
                // Use fallback story
                this.currentCampaignStory = this.getFallbackCampaignStory(settingData, characterData);
                this.campaignGenerated = true;
                console.log('📚 Using fallback campaign story');
                return this.currentCampaignStory;
            }
        } catch (error) {
            console.error('📚 Error generating campaign story:', error);
            this.currentCampaignStory = this.getFallbackCampaignStory(settingData, characterData);
            this.campaignGenerated = true;
            return this.currentCampaignStory;
        } finally {
            this.storyGenerationInProgress = false;
        }
    }
    
    getCampaignStoryPrompt(settingData = null, characterData = null) {
        // Get current setting for appropriate campaign generation
        const currentSetting = settingData?.id || (typeof gameState !== 'undefined' ? gameState.getCampaign().setting : 'medieval-fantasy');
        const campaignData = this.getCampaignInfo(currentSetting);
        const settingInfo = settingData || (typeof characterManager !== 'undefined' ? characterManager.settings[currentSetting] : null);
        
        const characterRole = characterData?.role || 'adventurer';
        const characterName = characterData?.name || 'the adventurer';
        
        console.log(`🎭 Generating campaign story prompt for ${currentSetting}`);
        
        return `You are the AI behind "${campaignData.title}" - an ${campaignData.tone} campaign.

SETTING: ${settingInfo?.description || 'Adventure setting'}
- Technology: ${settingInfo?.technology || 'Medieval'}
- Magic: ${settingInfo?.magic || 'High fantasy'}
- Themes: ${settingInfo?.themes?.join(', ') || 'Adventure, mystery, heroism'}

PLAYER CHARACTER: ${characterName}, a ${characterRole}

YOU MUST RETURN "${campaignData.title.toUpperCase()}" STORY:
Generate the exact campaign that matches this premise:

TITLE: ${campaignData.title}
PLOT: ${campaignData.plot}
LOCATIONS: ${campaignData.locations}
ANTAGONIST: ${campaignData.antagonist}
STAKES: ${campaignData.stakes}
HOOK: ${campaignData.hook}

Return exactly this story information in the proper format.`;
    }
    
    processCampaignStory(response) {
        const lines = response.split('\n');
        const story = {
            title: 'Untitled Adventure',
            plot: 'A mysterious adventure unfolds.',
            start: 'Your journey begins.',
            locations: ['Unknown location'],
            antagonist: 'Unknown threat',
            stakes: 'The fate of the world',
            hook: 'Adventure calls to you.'
        };
        
        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('TITLE:')) {
                story.title = cleanLine.replace('TITLE:', '').trim();
            } else if (cleanLine.startsWith('PLOT:')) {
                story.plot = cleanLine.replace('PLOT:', '').trim();
            } else if (cleanLine.startsWith('START:')) {
                story.start = cleanLine.replace('START:', '').trim();
            } else if (cleanLine.startsWith('LOCATIONS:')) {
                const locationText = cleanLine.replace('LOCATIONS:', '').trim();
                story.locations = locationText.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
            } else if (cleanLine.startsWith('ANTAGONIST:')) {
                story.antagonist = cleanLine.replace('ANTAGONIST:', '').trim();
            } else if (cleanLine.startsWith('STAKES:')) {
                story.stakes = cleanLine.replace('STAKES:', '').trim();
            } else if (cleanLine.startsWith('HOOK:')) {
                story.hook = cleanLine.replace('HOOK:', '').trim();
            }
        }
        
        return story;
    }
    
    getFallbackCampaignStory(settingData = null, characterData = null) {
        const currentSetting = settingData?.id || (typeof gameState !== 'undefined' ? gameState.getCampaign().setting : 'medieval-fantasy');
        const campaignData = this.getCampaignInfo(currentSetting);
        const characterRole = characterData?.role || 'warrior';
        
        console.log(`🎭 Creating fallback campaign story for ${currentSetting}`);
        
        // Use the appropriate campaign for the current setting
        const story = {
            title: campaignData.title,
            plot: campaignData.plot,
            start: this.generateStartScenario(currentSetting, campaignData),
            locations: campaignData.locations.split(', '),
            antagonist: campaignData.antagonist,
            stakes: campaignData.stakes,
            hook: campaignData.hook
        };
        
        // Customize hook based on character role and setting
        story.hook = this.customizeHookForRole(currentSetting, campaignData, characterRole);
        
        return story;
    }
    
    generateStartScenario(setting, campaignData) {
        const startScenarios = {
            'medieval-fantasy': `You receive word that strange shadows have begun consuming villages near the ${campaignData.locations.split(', ')[0]}. When you arrive, the air itself seems to whisper with dark magic from the Shadow Crown fragments.`,
            'modern-day': `Your phone buzzes with an encrypted message from The Veil about containment failures at ${campaignData.locations.split(', ')[0]}. When you arrive, reality itself seems unstable with supernatural breaches.`,
            'sci-fi-space': `Your ship receives a distress signal from a research station that was studying the artifact. When you arrive, the station is dark and filled with strange energy readings.`,
            'eldritch-horror': `A colleague sends you their final research notes about forbidden texts discovered at ${campaignData.locations.split(', ')[0]}. When you arrive, the very air seems to writhe with cosmic wrongness.`
        };
        
        return startScenarios[setting] || startScenarios['medieval-fantasy'];
    }
    
    customizeHookForRole(setting, campaignData, characterRole) {
        const hookCustomizations = {
            'medieval-fantasy': {
                'scholar': `Your research into ancient magic makes you a key target for Lord Malachar - he needs your knowledge to properly unite the Shadow Crown fragments.`,
                'healer': `The Shadow Crown's dark energy is causing a plague of nightmares among the villagers, and only you understand how to cure them.`,
                'scout': `You were the first to track the shadow creatures back to their source - they know you can find their hidden lairs.`,
                'default': campaignData.hook
            },
            'modern-day': {
                'scholar': `Your research into supernatural phenomena makes you either a valuable asset or dangerous liability to The Veil - Director Cross wants to recruit or eliminate you.`,
                'healer': `The reality breaches are causing psychological trauma that only you know how to treat, making you essential to The Veil's damage control.`,
                'scout': `You were the first civilian to document a major supernatural event - The Veil can't decide whether to hire you or silence you.`,
                'default': campaignData.hook
            },
            'sci-fi-space': {
                'scholar': `Your research into the Quantum Relay's origins makes you a key target for the Crimson Fleet - they need your knowledge to fully activate it.`,
                'healer': `The Quantum Relay's energy is causing a strange sickness among the colonists, and only you understand how to cure it.`,
                'scout': `You were the first to discover signs of the Crimson Fleet's presence in this sector - they know you can track them.`,
                'default': campaignData.hook
            },
            'eldritch-horror': {
                'scholar': `Your expertise in forbidden knowledge makes you both essential to stopping the ritual and a prime target for Professor Blackwood's cult.`,
                'healer': `The cosmic revelations are driving people insane, and only you have the psychiatric knowledge to help them maintain their sanity.`,
                'scout': `You've been tracking the cult's activities across the city - they know you're getting close to their final ritual site.`,
                'default': campaignData.hook
            }
        };
        
        const settingHooks = hookCustomizations[setting] || hookCustomizations['medieval-fantasy'];
        return settingHooks[characterRole] || settingHooks['default'];
    }
    
    // Campaign Story Management
    async regenerateCampaignStory(characterData = null, settingData = null) {
        console.log('📚 Regenerating campaign story...');
        this.currentCampaignStory = null;
        this.campaignGenerated = false;
        return await this.generateCampaignStory(characterData, settingData);
    }
    
    getCampaignStory() {
        return this.currentCampaignStory;
    }
    
    hasCampaignStory() {
        return this.campaignGenerated && this.currentCampaignStory !== null;
    }
    
    resetCampaignStory() {
        this.currentCampaignStory = null;
        this.campaignGenerated = false;
        this.storyGenerationInProgress = false;
        console.log('📚 Campaign story reset');
    }

    // Main HuggingFace Generation Methods
    async generateHuggingFaceStory(context, type = 'narrative', characterData = null, settingData = null) {
        console.log('🤗 Generating story with HuggingFace...');
        console.log('🤗 Context preview:', context.substring(0, 200) + '...');
        
        try {
            const enhancedContext = this.buildHuggingFaceEnhancedContext(context, characterData, settingData);
            const storyPrompt = this.getHuggingFaceStoryPrompt(type, settingData);
            const fullPrompt = storyPrompt + enhancedContext;
            
            console.log('🤗 Full prompt length:', fullPrompt.length, 'characters');
            
            const response = await this.makeHuggingFaceRequest(fullPrompt, {
                max_length: type === 'choice' ? 400 : 300,
                temperature: 0.85
            });
            
            if (!response || response.length < 50) {
                console.warn('🤗 Response too short, using enhanced fallback');
                return this.getHuggingFaceFallbackResponse(type, settingData);
            }
            
            const processedResponse = this.processHuggingFaceResponse(response, type);
            console.log('🤗 Final response length:', processedResponse.length, 'characters');
            
            return processedResponse;
            
        } catch (error) {
            console.error('🤗 Story generation failed:', error);
            return this.getHuggingFaceFallbackResponse(type, settingData);
        }
    }
    
    async generateHuggingFaceChoices(context, characterData = null, settingData = null) {
        console.log('🤗 Generating choices with HuggingFace...');
        
        try {
            const choiceResponse = await this.generateHuggingFaceStory(context, 'choice', characterData, settingData);
            
            // Try to extract numbered choices from the response
            const choiceLines = choiceResponse.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed.match(/^\d+\./) || trimmed.match(/^[A-D]\)/) || trimmed.match(/^-/);
            });
            
            if (choiceLines.length >= 4) {
                return choiceLines.slice(0, 4);
            }
            
            // If we don't have good choices, return fallback
            console.log('🤗 Not enough choices found, using fallback');
            return this.getHuggingFaceFallbackChoices();
            
        } catch (error) {
            console.error('🤗 Choice generation failed:', error);
            return this.getHuggingFaceFallbackChoices();
        }
    }
    
    processHuggingFaceResponse(response, type) {
        // Clean up the response
        let cleaned = response
            .replace(/^\s*["']|["']\s*$/g, '') // Remove surrounding quotes
            .replace(/\\n/g, '\n') // Convert escaped newlines
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        // Remove repetitive content
        const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const uniqueSentences = [];
        const seenContent = new Set();
        
        for (const sentence of sentences) {
            const normalized = sentence.toLowerCase().trim();
            if (!seenContent.has(normalized) && normalized.length > 10) {
                seenContent.add(normalized);
                uniqueSentences.push(sentence.trim());
            }
        }
        
        return uniqueSentences.join('. ').trim() + (uniqueSentences.length > 0 ? '.' : '');
    }
    
    getHuggingFaceFallbackResponse(type = 'narrative', settingData = null) {
        // Get current setting for appropriate fallbacks
        const currentSetting = settingData?.id || (typeof gameState !== 'undefined' ? gameState.getCampaign().setting : 'medieval-fantasy');
        const campaignData = this.getCampaignInfo(currentSetting);
        
        console.log(`🤗 Using ${currentSetting} fallback response for type: ${type}`);
        
        const fallbacks = {
            'medieval-fantasy': {
                narrative: [
                    `The ancient lands stretch before you, filled with magical mysteries and forgotten lore. Strange shadows seem to dance at the edges of your vision, and the air itself feels charged with the power of the Shadow Crown fragments. A critical decision lies ahead - will you investigate the dark magic directly, search for survivors among the shadowed ruins, or attempt to track Lord Malachar's forces? Your choice could determine the fate of all kingdoms.`,
                    
                    `You find yourself at the heart of this mystical crisis, where ancient magic and mortal ambition create an atmosphere thick with danger and wonder. The path forward isn't clear, but then again, the most crucial decisions rarely are. Several options present themselves - each with its own risks and rewards. What draws your attention most strongly in this moment of magical uncertainty?`
                ],
                
                character: [
                    `A figure emerges from the mist-shrouded path ahead, their movement careful and measured. They wear travel-worn robes with symbols from various kingdoms, their staff glowing faintly with protective wards against the Shadow Crown's influence. As they approach through the twilight realm's strange light, you sense this encounter could prove significant to your quest. How do you choose to engage with this fellow traveler?`,

                    `Someone approaches through the shadow-touched landscape, their presence immediately shifting the mystical energy around you. There's something about the way they move - alert but not aggressive, wise but cautious - that suggests they too understand the gravity of Malachar's threat. They pause at a respectful distance, clearly waiting to see how this encounter will unfold. What's your opening move?`
                ],
                
                choice: [
                    `Three paths diverge before you through the enchanted forest. The left trail leads toward ancient ruins, where magical artifacts await those with arcane knowledge. The right passage disappears into the Whispering Woods, perfect for those who prefer stealth and careful investigation. Straight ahead, shadow magic grows stronger near what might be one of the Crown fragments. Each route holds clues about Malachar's plans. Which path calls to you?`,

                    `A critical decision point presents multiple approaches to your current situation. You could take the direct route - boldly confronting the shadow magic, relying on courage and strength to overcome dark forces. Alternatively, a more subtle approach might serve you better - using stealth and wisdom to outmaneuver Malachar's minions. There's also the social path - seeking other heroes, gathering information through communication, or using charisma to build alliances against the Shadow Binder. Each approach has merit in this epic quest. What suits your instincts?`
                ]
            },
            
            'modern-day': {
                narrative: [
                    `The city's concrete jungle stretches before you, hiding supernatural mysteries behind every corporate facade. Strange energy readings spike on your detection equipment, and the very air seems to hum with reality breaches from The Veil Protocol failures. A critical decision lies ahead - will you investigate the supernatural activity directly, search for other Veil operatives, or attempt to track Director Cross's conspiracy? Your choice could determine humanity's future.`,
                    
                    `You find yourself at the heart of this reality crisis, where ancient supernatural forces and modern technology create an atmosphere thick with conspiracy and danger. The path forward isn't clear, but then again, the most crucial decisions rarely are. Several options present themselves - each with its own risks and rewards. What draws your attention most strongly in this moment of supernatural uncertainty?`
                ],
                
                character: [
                    `A figure emerges from the urban shadows, their movement purposeful and alert. They wear a tailored suit with subtle protective symbols, their smartphone displaying readings that suggest they're tracking supernatural phenomena like you. As they approach through the city's neon-lit streets, you sense this encounter could prove significant to stopping the Veil conspiracy. How do you choose to engage with this fellow investigator?`,

                    `Someone approaches through the crowded city streets, their presence immediately changing the supernatural energy around you. There's something about the way they move - professional but not threatening, informed but cautious - that suggests they also know about The Veil's activities. They pause at a safe distance, clearly waiting to see how this encounter will unfold. What's your opening move?`
                ],
                
                choice: [
                    `Three options present themselves in this urban environment. The corporate tower to your left houses Veil technology, perfect for those with hacking skills or social connections. The abandoned subway tunnels to your right offer a stealth approach to supernatural hotspots. Straight ahead, reality distortions grow stronger near what might be a major breach point. Each route offers clues about Cross's conspiracy. Which path calls to you?`,

                    `A critical decision point presents multiple approaches to your current situation. You could take the direct route - boldly confronting the supernatural threat, relying on courage and resources to expose the truth. Alternatively, a more subtle approach might serve better - using technology and stealth to gather intelligence on The Veil's operations. There's also the social path - networking with other investigators, using persuasion to recruit allies against Director Cross. Each approach has merit in this modern conspiracy. What suits your instincts?`
                ]
            },
            
            'sci-fi-space': {
                narrative: [
                    `The vast expanse of space stretches before you, filled with alien mysteries and technological wonders. The research station's darkened corridors seem alive with strange energy readings from the Quantum Relay. A critical decision lies ahead - will you investigate the strange energy signatures directly, search for survivors among the station's modules, or attempt to contact the Crimson Fleet to understand their involvement? Your choice could determine the fate of Earth's colonies.`,
                    
                    `You find yourself at the heart of this galactic crisis, where alien technology and human ambition create an atmosphere thick with tension and danger. The path forward isn't clear, but then again, the most crucial decisions rarely are. Several options present themselves - each with its own risks and rewards. What draws your attention most strongly in this moment of cosmic uncertainty?`
                ],
                
                character: [
                    `A figure emerges from the station's emergency lighting, their movement careful and deliberate in the low gravity. They wear a worn space suit with patches from various colonies, their helmet visor reflecting the strange glow of the Quantum Relay's energy. As they approach through the corridor, you sense this encounter could prove significant to your mission. How do you choose to engage with this fellow space traveler?`,

                    `Someone approaches through the station's dimly lit passages, their presence immediately shifting the energy around you. There's something about the way they move - alert but not aggressive, curious but cautious - that suggests they're also trying to understand what happened here. They pause at a respectful distance, clearly waiting to see how this encounter will unfold in the shadow of the Quantum Relay. What's your opening move?`
                ],
                
                choice: [
                    `Three paths diverge before you through the station's damaged structure. The left corridor leads toward the main reactor core, where technical systems await someone with engineering skills. The right passage disappears into the research labs, perfect for those who prefer stealth and careful investigation of the Quantum Relay data. Straight ahead, alien symbols glow faintly on damaged bulkheads, suggesting mysteries that would reward scientific study. Each route holds clues about the Crimson Fleet's plans. Which path calls to you?`,

                    `A critical decision point presents multiple approaches to your current situation. You could take the direct route - boldly investigating the Quantum Relay itself, relying on determination and courage to uncover its secrets. Alternatively, a more subtle approach might serve you better - using stealth and observation to gather intelligence on the Crimson Fleet's involvement. There's also the social path - seeking other survivors, gathering information through communication, or using persuasion to build alliances against Commander Vex. Each approach has merit in this galactic conflict. What suits your instincts?`
                ]
            },
            
            'eldritch-horror': {
                narrative: [
                    `The fog-shrouded streets of Arkham stretch before you, hiding cosmic terrors behind every Georgian facade. Strange symbols seem to writhe in your peripheral vision, and reality itself feels unstable near the cursed Manuscripts. A critical decision lies ahead - will you investigate the forbidden knowledge directly, search for other investigators who might still be sane, or attempt to track Professor Blackwood's cult? Your choice could determine humanity's sanity.`,
                    
                    `You find yourself at the heart of this cosmic crisis, where ancient knowledge and human frailty create an atmosphere thick with dread and madness. The path forward isn't clear, but then again, in matters of cosmic horror, clarity is often the first casualty. Several options present themselves - each with its own terrible risks. What draws your attention most strongly in this moment of eldritch uncertainty?`
                ],
                
                character: [
                    `A figure emerges from the university's shadow-draped corridors, their movement cautious and haunted. They wear academic robes marked with protective symbols, their eyes holding the haunted look of someone who has glimpsed the Arkham Manuscripts' terrible truths. As they approach through the gaslight's flickering glow, you sense this encounter could prove significant to stopping the cosmic ritual. How do you choose to engage with this fellow seeker of forbidden knowledge?`,

                    `Someone approaches through the mist-shrouded cemetery, their presence immediately affecting the oppressive atmosphere around you. There's something about the way they move - knowledgeable but fearful, determined but fragile - that suggests they too understand the magnitude of Blackwood's threat to reality. They pause at a safe distance, clearly waiting to see how this encounter will unfold. What's your opening move?`
                ],
                
                choice: [
                    `Three paths present themselves through Arkham's twisted streets. The university library to your left contains dangerous texts that await those with scholarly knowledge. The abandoned mansion to your right offers a stealth approach to investigating cult activities. Straight ahead, reality grows thin near what might be a ritual site mentioned in the Manuscripts. Each route offers clues about Blackwood's cosmic plans. Which path calls to you?`,

                    `A critical decision point presents multiple approaches to your current situation. You could take the direct route - boldly confronting the cosmic horror, relying on willpower and reason to resist madness. Alternatively, a more careful approach might preserve your sanity - using research and observation to understand the threat before acting. There's also the collaborative path - seeking other investigators, sharing knowledge to build defenses against Professor Blackwood's cult. Each approach has merit in this battle for humanity's soul. What suits your instincts?`
                ]
            }
        };

        const settingFallbacks = fallbacks[currentSetting] || fallbacks['medieval-fantasy'];
        const fallbackArray = settingFallbacks[type] || settingFallbacks.narrative;
        const randomIndex = Math.floor(Math.random() * fallbackArray.length);
        const selectedFallback = fallbackArray[randomIndex];
        
        console.log('🤗 Fallback response length:', selectedFallback.length, 'characters');
        return selectedFallback;
    }

    getHuggingFaceFallbackChoices() {
        // Get current setting for appropriate fallback choices
        const currentSetting = typeof gameState !== 'undefined' ? gameState.getCampaign().setting : 'medieval-fantasy';
        const campaignData = this.getCampaignInfo(currentSetting);
        
        const fallbackChoices = {
            'medieval-fantasy': [
                "Investigate the magical phenomenon thoroughly, studying every shadow and mystical detail for hidden clues",
                "Approach with heroic determination, ready to face whatever dark forces or creatures await", 
                "Move stealthily through the enchanted landscape, gathering intelligence while remaining hidden from Malachar's forces",
                "Use your unique abilities and knowledge of ancient lore in a creative way that reflects your character's background"
            ],
            'modern-day': [
                "Investigate the supernatural event thoroughly, documenting every anomaly and detail for The Veil records",
                "Approach with professional confidence, ready to handle whatever paranormal situation escalates", 
                "Move carefully to gather intelligence unseen, using modern surveillance techniques and urban camouflage",
                "Apply your specialized skills and contemporary knowledge in an innovative way that reflects your expertise"
            ],
            'sci-fi-space': [
                "Investigate the scene thoroughly, studying every shadow and detail for hidden clues or potential dangers",
                "Approach with confident determination, ready to act quickly if the situation escalates", 
                "Move stealthily to scout ahead unseen, gathering intelligence while remaining hidden in the shadows",
                "Think creatively and use your unique skills and abilities in an innovative way that reflects your personality"
            ],
            'eldritch-horror': [
                "Investigate the disturbing phenomenon carefully, documenting details while protecting your sanity",
                "Approach with scholarly resolve, ready to face whatever cosmic horror or cult activity awaits", 
                "Move cautiously to observe from a safe distance, gathering information while avoiding direct exposure",
                "Use your academic knowledge and research skills in a methodical way that reflects your investigative training"
            ]
        };
        
        return fallbackChoices[currentSetting] || fallbackChoices['medieval-fantasy'];
    }

    bindEvents() {
        eventBus.off('campaign:start', this.startCampaignHandler);
        eventBus.off('player:action', this.processPlayerActionHandler);
        eventBus.off('dice:rolled', this.processDiceRollHandler);
        
        this.startCampaignHandler = () => this.startCampaign();
        this.processPlayerActionHandler = (data) => this.processPlayerAction(data);
        this.processDiceRollHandler = (data) => this.processDiceRoll(data);
        
        eventBus.on('campaign:start', this.startCampaignHandler);
        eventBus.on('player:action', this.processPlayerActionHandler);
        eventBus.on('dice:rolled', this.processDiceRollHandler);
        
        console.log('🎯 Event handlers bound successfully');
    }
    
    // Diagnostic method for testing AI responses
    async testAIResponse(testAction = "look around") {
        console.log('🧪 Testing AI Response System...');
        console.log('🧪 Test action:', testAction);
        
        try {
            // Create test data
            const testActionData = {
                action: testAction,
                timestamp: Date.now()
            };
            
            console.log('🧪 Calling generateStoryResponse...');
            const response = await this.generateStoryResponse(testActionData);
            
            if (response) {
                console.log('🧪 ✅ AI Response SUCCESS!');
                console.log('🧪 Response length:', response.length, 'characters');
                console.log('🧪 Response preview:', response.substring(0, 200) + '...');
                return response;
            } else {
                console.log('🧪 ❌ AI Response FAILED - no response returned');
                
                // Try fallback directly
                console.log('🧪 Testing fallback response...');
                const fallback = this.getHuggingFaceFallbackResponse('narrative');
                console.log('🧪 Fallback response:', fallback.substring(0, 200) + '...');
                return fallback;
            }
        } catch (error) {
            console.error('🧪 ❌ AI Test Error:', error);
            
            // Try emergency fallback
            const emergency = this.getHuggingFaceFallbackResponse('narrative');
            console.log('🧪 Emergency fallback:', emergency.substring(0, 200) + '...');
            return emergency;
        }
    }
    
    // Test full player action processing flow
    async testPlayerActionFlow(testAction = "examine the room") {
        console.log('🧪 === TESTING FULL PLAYER ACTION FLOW ===');
        console.log('🧪 Test action:', testAction);
        
        // Reset any processing flags
        this.isProcessing = false;
        this.isGeneratingStory = false;
        
        const testActionData = {
            action: testAction,
            timestamp: Date.now()
        };
        
        console.log('🧪 Calling processPlayerAction...');
        
        try {
            await this.processPlayerAction(testActionData);
            console.log('🧪 ✅ Player action processing completed');
        } catch (error) {
            console.error('🧪 ❌ Player action processing failed:', error);
        }
        
        console.log('🧪 === END TEST ===');
    }
    
    /**
     * Start a new campaign with initial story
     */
    async startCampaign() {
        console.log('🚀 STARTING CAMPAIGN - AI Manager initialized:', this.initialized);
        
        try {
            // Emit thinking state for dice system  
            eventBus.emit('ai:thinking');
            
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            console.log('🚀 Character data:', character);
            console.log('🚀 Campaign data:', campaign);
            
            if (!character || !campaign) {
                console.error('❌ Missing character or campaign data');
                return;
            }
            
            // Generate campaign story first if not already done
            if (!this.campaignGenerated) {
                console.log('📚 Generating campaign story before starting...');
                
                // Get setting data
                let settingData = null;
                if (typeof characterManager !== 'undefined' && campaign.setting) {
                    settingData = characterManager.settings[campaign.setting];
                }
                
                await this.generateCampaignStory(character, settingData);
                
                // Display the campaign story to the player
                if (this.currentCampaignStory) {
                    const storyIntro = `📚 **${this.currentCampaignStory.title}**\n\n${this.currentCampaignStory.plot}\n\n**Your Story Begins:** ${this.currentCampaignStory.start}`;
                    this.displayStoryContent(storyIntro, 'campaign-intro');
                    
                    // Add to campaign log
                    gameState.addToCampaignLog({
                        type: 'campaign_story',
                        content: `Campaign: ${this.currentCampaignStory.title} - ${this.currentCampaignStory.plot}`,
                        character: character.name
                    });
                }
            }
            
            const systemPrompt = this.buildSystemPrompt();
            const startPrompt = this.buildStartPrompt(character, campaign);
            
            const response = await this.callAI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: startPrompt },
                { role: 'user', content: '🚨 CRITICAL REMINDER: Start immediately with in-world story content. NO meta-commentary, NO analysis, NO "Okay so..." or "Let me..." - pure story only!' }
            ]);
            
            if (response) {
                // Evaluate and potentially improve the response
                if (this.enableEvaluation && this.dmEvaluator) {
                    const evaluation = this.dmEvaluator.evaluateResponse(response, {
                        type: 'campaign_start',
                        character: character,
                        campaign: campaign
                    });
                    
                    console.log('📊 Campaign Start Response Evaluation:', evaluation);
                    
                    // If auto-improvement is enabled and score is low, try to improve
                    if (this.autoImprove && evaluation.totalScore < 6.5) {
                        console.log('🔧 Attempting to improve response...');
                        try {
                            const improvedResponse = await this.dmEvaluator.iterateResponse(response, evaluation, this);
                            if (improvedResponse && improvedResponse !== response) {
                                console.log('✨ Response improved!');
                                response = improvedResponse;
                                
                                // Re-evaluate the improved response
                                const newEvaluation = this.dmEvaluator.evaluateResponse(response, {
                                    type: 'campaign_start_improved',
                                    character: character,
                                    campaign: campaign,
                                    originalScore: evaluation.totalScore
                                });
                                console.log('📈 Improved Response Evaluation:', newEvaluation);
                            }
                        } catch (error) {
                            console.error('Failed to improve response:', error);
                        }
                    }
                }
                
                this.displayEnhancedStoryContent = this.displayEnhancedStoryContent.bind(this);
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
        const currentTime = Date.now();
        
        // Debounce rapid actions
        if (currentTime - this.lastActionTime < this.actionDebounceTime) {
            console.log('🚫 Action debounced, too rapid');
            return;
        }
        
        if (this.isProcessing) {
            console.log('🚫 AI already processing, ignoring duplicate request');
            showToast('Please wait for the current action to complete', 'warning');
            return;
        }
        
        // Prevent duplicate processing of the same action
        const actionKey = `${actionData.action}_${actionData.diceRoll?.result || 'no_dice'}`;
        if (this.lastProcessedAction === actionKey) {
            console.log('🚫 Duplicate action detected, ignoring:', actionKey);
            return;
        }
        
        this.lastProcessedAction = actionKey;
        this.lastActionTime = currentTime;
        this.isProcessing = true;
        
        try {
            // Store the last player action for reference
            this.lastPlayerAction = actionData.action;
            console.log('🎯 Processing action with dice roll:', actionData);
            
            // Check if this is the new combined format (action + dice roll)
            if (actionData.diceRoll) {
                console.log('[AI] New format: Action + Dice Roll received together');
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
            
            await this.processNormalAction(actionData);
        } finally {
            this.isProcessing = false;
        }
    }
    
    async processNormalAction(actionData) {
        this.isProcessing = true;
        this.showTypingIndicator();
        this.showProgressiveLoadingText();
        
        eventBus.emit('ai:thinking');
        
        console.log('🚀 Processing action:', actionData.action);
        
        try {
            console.log('🔥 Testing connection before story generation...');
            await Promise.race([
                this.testConnection(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
            ]);
            console.log('🔥 Connection test passed');
        } catch (error) {
            console.error('🔥 Connection test failed:', error);
            this.displayError('System is not available. Please check your configuration or try again later.');
            this.isProcessing = false;
            this.hideTypingIndicator();
            return;
        }
        
        try {
            console.log('🎭 Generating story content...');
            const storyResponse = await this.generateStoryResponse(actionData);
            
            console.log('🎭 Story response received:', storyResponse ? 'SUCCESS' : 'FAILED');
            console.log('🎭 Response length:', storyResponse?.length || 0);
            console.log('🎭 Response preview:', storyResponse?.substring(0, 150) + '...' || 'NO RESPONSE');
            
            if (storyResponse) {
                const diceRequest = this.detectDiceRequest(storyResponse);
                
                if (diceRequest) {
                    this.pendingAction = actionData;
                    this.pendingAIResponse = storyResponse;
                    this.requiredDiceRoll = diceRequest;
                    this.actionState = 'waiting_for_dice';
                    
                    this.displayStoryContent(actionData.action, 'player-action');
                    
                    setTimeout(async () => {
                        console.log('🎭 Displaying AI response with dice request...');
                        await this.displayEnhancedStoryContent(storyResponse, 'dm-response', {
                            type: 'story_response',
                            actionData: actionData,
                            hasDiceRequest: diceRequest
                        });
                        eventBus.emit('ai:response', storyResponse);
                        
                        this.promptForDiceRoll(storyResponse);
                        
                        console.log('🎯 Players can now type their actions instead of using buttons');
                        
                        this.updateActionButtonStates();
                    }, 1000);
                } else {
                    this.displayStoryContent(actionData.action, 'player-action');
                    
                    setTimeout(async () => {
                        console.log('🎭 Displaying AI response without dice request...');
                        await this.displayEnhancedStoryContent(storyResponse, 'dm-response', {
                            type: 'story_response_no_dice',
                            actionData: actionData
                        });
                        eventBus.emit('ai:response', storyResponse);
                        
                        // Always prompt for dice roll after story response
                        this.promptForDiceRoll(storyResponse);
                        
                        // Action buttons removed - players now type their actions directly
                        console.log('🎯 Players can now type their actions instead of using buttons');
                    }, 1000);
                    
                    this.updateGameState(actionData, storyResponse);
                }
            } else {
                console.error('❌ No story response from AI - generating emergency fallback');
                const emergencyResponse = this.generateFallbackResponse(actionData.action);
                console.log('🆘 Emergency response generated:', emergencyResponse.substring(0, 100) + '...');
                
                this.displayStoryContent(actionData.action, 'player-action');
                setTimeout(() => {
                    console.log('🆘 Displaying emergency fallback response...');
                    this.displayStoryContent(emergencyResponse, 'dm-response');
                    eventBus.emit('ai:response', emergencyResponse);
                    this.promptForDiceRoll(emergencyResponse);
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Failed to process player action with AI:', error);
            console.log('🆘 Generating catch block emergency response...');
            
            const emergencyResponse = this.generateFallbackResponse(actionData.action);
            console.log('🆘 Catch emergency response generated:', emergencyResponse.substring(0, 100) + '...');
            
            this.displayStoryContent(actionData.action, 'player-action');
            setTimeout(() => {
                console.log('🆘 Displaying catch emergency fallback response...');
                this.displayStoryContent(emergencyResponse, 'dm-response');
                eventBus.emit('ai:response', emergencyResponse);
                this.promptForDiceRoll(emergencyResponse);
            }, 1000);
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
            console.log('[AI] Submitting action with dice using specialized AI methods');
            
            // Create action data with dice result
            const actionDataWithDice = {
                ...this.pendingAction,
                diceResult: this.completedDiceRoll
            };
            
            console.log('🎭 Generating story content with dice result...');
            const storyResponse = await this.generateStoryResponse(actionDataWithDice);
            
            if (storyResponse) {
                // Display the dice roll result first, then story response
                this.displayStoryContent(`Rolled ${this.completedDiceRoll.result || this.completedDiceRoll.total}`, 'dice-result');
                
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
        console.log('[AI] Processing combined action + dice roll:', actionData);
        
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
        
        console.log('[AI] Dice evaluation:', { result, diceNumber, successLevel, outcomeType });
        
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
                
                console.log('[AI] Combined action + dice processed successfully');
                
            } else {
                console.error('[AI] No response from AI for combined action + dice');
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
        
        // Enhanced memory tracking
        this.trackImportantInformation(response, actionData.action);
        
        // Use memory manager if available
        if (this.memoryManager) {
            this.memoryManager.recordDecision(actionData.action, response);
        }
    }
    
    /**
     * Automatically track important information from AI responses for memory
     */
    trackImportantInformation(response, playerAction) {
        const campaign = gameState.getCampaign();
        const lowercaseResponse = response.toLowerCase();
        const lowercaseAction = playerAction.toLowerCase();
        
        // Track new locations mentioned
        this.trackNewLocations(response);
        
        // Track NPCs mentioned
        this.trackNPCs(response);
        
        // Track important decisions and flags
        this.trackDecisions(response, playerAction);
        
        // Track quest progress
        this.trackQuestProgress(response);
        
        // Track inventory changes
        this.trackInventoryChanges(response);
    }
    
    /**
     * Track new locations mentioned in responses
     */
    trackNewLocations(response) {
        const campaign = gameState.getCampaign();
        const locationPatterns = [
            /(?:arrive at|enter|reach|travel to|visit|discover)\s+(?:the\s+)?([A-Z][a-zA-Z\s']{2,30})/gi,
            /(?:you are in|you find yourself in|you stand before)\s+(?:the\s+)?([A-Z][a-zA-Z\s']{2,30})/gi,
            /(?:the|this)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|appears|looms|stands)/gi
        ];
        
        const existingLocations = campaign.locations_visited || [];
        const existingNames = new Set(existingLocations.map(loc => typeof loc === 'string' ? loc : loc.name));
        
        locationPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(response)) !== null) {
                const locationName = match[1].trim();
                
                // Filter out common false positives
                const excludeWords = ['time', 'place', 'way', 'moment', 'air', 'ground', 'light', 'sound', 'voice', 'power', 'magic', 'energy'];
                if (!excludeWords.includes(locationName.toLowerCase()) && 
                    locationName.length > 3 && 
                    !existingNames.has(locationName)) {
                    
                    const locationData = {
                        name: locationName,
                        discovered_at: new Date().toISOString(),
                        description: `Location mentioned during adventure`
                    };
                    
                    gameState.push('campaign.locations_visited', locationData);
                    existingNames.add(locationName);
                    
                    // Use memory manager if available
                    if (this.memoryManager) {
                        this.memoryManager.recordLocationDescription(locationName, 'Location mentioned during adventure');
                        this.memoryManager.recordDiscovery(`Discovered ${locationName}`, 'location', 'normal');
                    }
                    
                    console.log('📍 New location tracked:', locationName);
                }
            }
        });
    }
    
    /**
     * Track NPCs mentioned in responses
     */
    trackNPCs(response) {
        const campaign = gameState.getCampaign();
        const npcPatterns = [
            /(?:you meet|encounter|see|find)\s+(?:a\s+)?([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:who|that|says|tells|asks)/gi,
            /([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:approaches|greets|speaks|says|tells|warns|offers)/gi,
            /(?:the|a)\s+([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:nods|smiles|frowns|gestures|points)/gi
        ];
        
        const existingNPCs = campaign.npcs_encountered || [];
        const existingNames = new Set(existingNPCs.map(npc => npc.name));
        
        npcPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(response)) !== null) {
                const npcName = match[1].trim();
                
                // Filter out false positives
                const excludeWords = ['You', 'The', 'Your', 'This', 'That', 'They', 'Voice', 'Sound', 'Light', 'Shadow', 'Magic'];
                if (!excludeWords.includes(npcName) && 
                    npcName.length > 2 && 
                    !existingNames.has(npcName)) {
                    
                    const npcData = {
                        name: npcName,
                        met_at: new Date().toISOString(),
                        relationship: 'neutral',
                        description: `NPC encountered during adventure`
                    };
                    
                    gameState.push('campaign.npcs_encountered', npcData);
                    existingNames.add(npcName);
                    
                    // Use memory manager if available
                    if (this.memoryManager) {
                        this.memoryManager.updateRelationship(npcName, 'neutral', 'NPC encountered during adventure');
                    }
                    
                    console.log('👤 New NPC tracked:', npcName);
                }
            }
        });
    }
    
    /**
     * Track important decisions and set campaign flags
     */
    trackDecisions(response, playerAction) {
        const campaign = gameState.getCampaign();
        const lowercaseResponse = response.toLowerCase();
        const lowercaseAction = playerAction.toLowerCase();
        
        // Track major decision types
        if (lowercaseAction.includes('agree') || lowercaseAction.includes('accept')) {
            gameState.set(`campaign.campaign_flags.agreed_to_${Date.now()}`, playerAction);
        }
        
        if (lowercaseAction.includes('refuse') || lowercaseAction.includes('decline') || lowercaseAction.includes('reject')) {
            gameState.set(`campaign.campaign_flags.refused_${Date.now()}`, playerAction);
        }
        
        if (lowercaseAction.includes('ally') || lowercaseAction.includes('help') || lowercaseAction.includes('assist')) {
            gameState.set(`campaign.campaign_flags.helped_${Date.now()}`, playerAction);
        }
        
        if (lowercaseAction.includes('attack') || lowercaseAction.includes('fight') || lowercaseAction.includes('combat')) {
            gameState.set(`campaign.campaign_flags.fought_${Date.now()}`, playerAction);
        }
        
        // Track consequences mentioned in response
        if (lowercaseResponse.includes('remember') || lowercaseResponse.includes('will not forget')) {
            gameState.set(`campaign.campaign_flags.memorable_action_${Date.now()}`, playerAction);
        }
    }
    
    /**
     * Track quest progress from responses
     */
    trackQuestProgress(response) {
        const campaign = gameState.getCampaign();
        const lowercaseResponse = response.toLowerCase();
        
        // Detect quest completion
        if (lowercaseResponse.includes('quest complete') || 
            lowercaseResponse.includes('mission accomplished') || 
            lowercaseResponse.includes('task is done')) {
            
            if (campaign.current_quest) {
                const completedQuest = {
                    ...campaign.current_quest,
                    completed_at: new Date().toISOString()
                };
                gameState.push('campaign.completed_quests', completedQuest);
                gameState.set('campaign.current_quest', null);
                console.log('✅ Quest completed:', completedQuest.title || 'Unknown Quest');
            }
        }
        
        // Detect new quest
        if (lowercaseResponse.includes('new quest') || 
            lowercaseResponse.includes('mission for you') || 
            lowercaseResponse.includes('task ahead')) {
            
            const questData = {
                title: 'New Quest',
                started_at: new Date().toISOString(),
                description: 'Quest discovered during adventure'
            };
            gameState.set('campaign.current_quest', questData);
            console.log('🎯 New quest started:', questData.title);
        }
    }
    
    /**
     * Track inventory changes from responses
     */
    trackInventoryChanges(response) {
        const character = gameState.getCharacter();
        const lowercaseResponse = response.toLowerCase();
        
        // Detect item acquisition
        const itemPatterns = [
            /you (?:find|discover|obtain|receive|pick up|take|acquire)\s+(?:a|an|the|some)\s+([a-zA-Z\s]{3,30})/gi,
            /(?:gives?|hands?|offers?)\s+you\s+(?:a|an|the|some)\s+([a-zA-Z\s]{3,30})/gi
        ];
        
        itemPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(response)) !== null) {
                const itemName = match[1].trim();
                
                // Filter out false positives
                const excludeWords = ['look', 'sense', 'feeling', 'moment', 'chance', 'opportunity', 'way', 'path'];
                if (!excludeWords.some(word => itemName.toLowerCase().includes(word)) && 
                    itemName.length > 3) {
                    
                    const itemData = {
                        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: itemName,
                        type: 'item',
                        acquired_at: new Date().toISOString(),
                        source: 'adventure'
                    };
                    
                    gameState.push('character.inventory', itemData);
                    
                    // Use memory manager if available
                    if (this.memoryManager) {
                        this.memoryManager.recordItemGained(itemName, 'found', 'normal');
                    }
                    
                    console.log('🎒 New item added to inventory:', itemName);
                }
            }
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
        console.log('[AI] Processing dice roll:', rollData);
        
        // Track skill usage if we can detect it from the last action
        if (this.memoryManager && this.lastPlayerAction) {
            this.trackSkillUsageFromAction(this.lastPlayerAction, rollData);
        }
        
        // If we're waiting for a dice roll as part of an action sequence, handle it properly
        if (this.actionState === 'waiting_for_dice' && this.pendingAction) {
            this.completedDiceRoll = rollData;
            this.actionState = 'can_submit';
            
            // Automatically submit the action with dice result
            await this.submitActionWithDice();
            return;
        }
        
        // Handle dice rolls that come after AI responses (our current flow)
        console.log('[AI] Handling dice roll from AI-prompted roll');
        
        // Get the last player action from stored action
        const lastAction = this.lastPlayerAction || this.pendingAction?.action || "continue the adventure";
        console.log('[AI] Using last action for dice outcome:', lastAction);
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
        
        console.log('[AI] Dice evaluation:', { result, diceNumber, successLevel, outcomeType });
        
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
                
                console.log('[AI] Dice roll outcome processed successfully');
                
            } else {
                console.error('[AI] No response from AI for dice outcome');
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
     * Track skill usage based on player action and dice roll
     */
    trackSkillUsageFromAction(action, rollData) {
        const lowercaseAction = action.toLowerCase();
        const success = rollData.result > (rollData.max || 20) * 0.5; // Simple success threshold
        
        // Map actions to likely skills
        const skillMappings = {
            'stealth': ['sneak', 'hide', 'quietly', 'unseen'],
            'athletics': ['climb', 'jump', 'run', 'swim', 'lift'],
            'acrobatics': ['dodge', 'balance', 'flip', 'tumble'],
            'investigation': ['search', 'examine', 'investigate', 'look for', 'find'],
            'perception': ['listen', 'watch', 'notice', 'spot', 'observe'],
            'persuasion': ['convince', 'persuade', 'charm', 'diplomacy'],
            'deception': ['lie', 'bluff', 'deceive', 'trick'],
            'intimidation': ['threaten', 'intimidate', 'menace', 'frighten'],
            'insight': ['read', 'understand', 'sense motive'],
            'survival': ['track', 'navigate', 'forage', 'wilderness'],
            'medicine': ['heal', 'treat', 'cure', 'bandage']
        };
        
        for (const [skill, keywords] of Object.entries(skillMappings)) {
            if (keywords.some(keyword => lowercaseAction.includes(keyword))) {
                this.memoryManager.recordSkillUse(skill, success, action);
                console.log(`🎯 Tracked ${skill} usage: ${success ? 'Success' : 'Failure'}`);
                break; // Only track the first matching skill
            }
        }
    }
    
    /**
     * Build comprehensive dice action context with full campaign continuity
     */
    buildActionContextWithDice(character, campaign, actionData, diceRoll) {
        const currentStory = campaign.story_state || 'The adventure begins...';
        const recentLog = campaign.campaign_log?.slice(-6) || [];
        const settingData = characterManager?.settings?.[campaign.setting] || {};
        
        // Enhanced memory context
        const memoryContext = this.buildMemoryContext(character, campaign);
        
        const contextParts = [
            `CONTINUING ${character.name.toUpperCase()}'S STORY WITH DICE RESULT:`,
            ``,
            `Player Action: "${actionData.action}"`,
            `Dice Roll: ${diceRoll.dice || diceRoll.type} = ${diceRoll.result || diceRoll.total}`,
        ];
        
        // Add critical success/failure context
        if (diceRoll.critical) {
            contextParts.push(`🌟 CRITICAL SUCCESS! This should be exceptionally positive and memorable for ${character.name}.`);
        }
        if (diceRoll.fumble) {
            contextParts.push(`💀 CRITICAL FAILURE! Add interesting complications, but keep it engaging for ${character.name}.`);
        }
        
        contextParts.push(``, `📖 CURRENT STORY CONTEXT: ${currentStory}`);
        
        // Comprehensive character context with memory
        contextParts.push(`
👤 CHARACTER PROFILE:
Name: ${character.name} (use their name frequently)
Class: ${character.class} Level ${character.level} (reference their abilities)
Race: ${character.race || 'Human'}
Background: ${character.background || 'Unknown origins'} (inform character reactions)
Health: ${character.health?.current || '?'}/${character.health?.maximum || '?'}
Stats: STR ${character.stats?.str || 10}, DEX ${character.stats?.dex || 10}, CON ${character.stats?.con || 10}, INT ${character.stats?.int || 10}, WIS ${character.stats?.wis || 10}, CHA ${character.stats?.cha || 10}

${memoryContext}`);
        
        // Recent campaign history for continuity
        if (recentLog.length > 0) {
            contextParts.push(`
📚 RECENT CAMPAIGN HISTORY (maintain strict continuity):`);
            recentLog.forEach((entry, index) => {
                contextParts.push(`${index + 1}. ${entry.type}: ${entry.content?.substring(0, 150)}...`);
            });
        }
        
        // NPCs for relationship continuity
        if (campaign.npcs_encountered?.length > 0) {
            contextParts.push(`
🎭 ESTABLISHED NPCs (reference when relevant):`);
            campaign.npcs_encountered.forEach(npc => {
                contextParts.push(`- ${npc.name} (${npc.relationship || 'neutral'}): ${npc.description || 'previous encounter'}`);
            });
        }
        
        // Locations for world consistency
        if (campaign.important_locations?.length > 0) {
            contextParts.push(`
🗺️ KNOWN LOCATIONS (maintain world consistency):`);
            campaign.important_locations.forEach(loc => {
                contextParts.push(`- ${loc.name}: ${loc.description || 'previously visited'}`);
            });
        }
        
        contextParts.push(`
🎯 CURRENT LOCATION: ${campaign.current_location || 'Unknown'}
🌍 SETTING: ${settingData.name} (${settingData.description})

🔥 CRITICAL DM INSTRUCTIONS:
- You are ${character.name}'s personal DM with complete knowledge of their journey
- Interpret the ${diceRoll.result || diceRoll.total} roll result for "${actionData.action}"
- Reference their ${character.class} abilities and ${character.background} background
- Build directly upon previous story elements and established NPCs/locations
- Use ${character.name}'s name and personal details throughout your response
- Maintain ${settingData.name} setting atmosphere and continue established plotlines
- Create consequences that advance their ongoing personal narrative
- Remember their skills, equipment, and past decisions when crafting the outcome
- Remember: you know ${character.name} intimately as their dedicated game master

The dice result should directly influence the outcome of "${actionData.action}". Respond as ${character.name}'s DM with full campaign knowledge.`);
        
        return contextParts.join('\n');
    }
    
    /**
     * Build comprehensive system prompt with full character and campaign context
     */
    buildSystemPrompt() {
        const campaign = gameState.getCampaign();
        const character = gameState.getCharacter();
        const setting = campaign.setting;
        
        const settingData = characterManager?.settings?.[setting] || {};
        const recentLog = campaign.campaign_log?.slice(-8) || [];
        
        // Enhanced memory context
        const memoryContext = this.buildMemoryContext(character, campaign);
        
        // Build comprehensive character context
        const characterContext = `
🎭 GAME MASTER ROLE: You are the dedicated GM for this ${settingData.name || 'adventure'} campaign. You know this character intimately and maintain complete continuity of their story.

👤 CHARACTER PROFILE:
Name: ${character.name || 'the adventurer'}
Class: ${character.class || 'adventurer'} (Level ${character.level || 1})
Race: ${character.race || 'human'}
Background: ${character.background || 'unknown origins'}
Health: ${character.health?.current || 'unknown'}/${character.health?.maximum || 'unknown'}

⚡ ABILITY SCORES: STR ${character.stats?.str || 10}, DEX ${character.stats?.dex || 10}, CON ${character.stats?.con || 10}, INT ${character.stats?.int || 10}, WIS ${character.stats?.wis || 10}, CHA ${character.stats?.cha || 10}

${memoryContext}

🌍 CAMPAIGN SETTING: ${settingData.description || 'Fantasy adventure'}
🏛️ CURRENT LOCATION: ${campaign.current_location || 'Unknown location'}
📖 STORY STATE: ${campaign.story_state || 'Adventure beginning'}

${recentLog.length > 0 ? `📚 RECENT CAMPAIGN HISTORY:
${recentLog.map((entry, index) => `${index + 1}. ${entry.type}: ${entry.content?.substring(0, 120)}...`).join('\n')}` : ''}

${campaign.npcs_encountered?.length > 0 ? `🎭 KNOWN NPCs:
${campaign.npcs_encountered.map(npc => `- ${npc.name}: ${npc.relationship || 'neutral'} (${npc.description || 'no details'})`).join('\n')}` : ''}

${campaign.important_locations?.length > 0 ? `🗺️ KNOWN LOCATIONS:
${campaign.important_locations.map(loc => `- ${loc.name}: ${loc.description || 'no details'}`).join('\n')}` : ''}

DM PERSONALITY: ${settingData.dm_personality_hint || 'Create engaging adventures with meaningful choices.'}`;

        return `${characterContext}

CRITICAL DM INSTRUCTIONS:
- You ARE the DM for ${character.name}. Maintain complete story continuity.
- Remember everything that has happened in this campaign.
- Stay completely in character as their dedicated game master.
- Refer to past events, NPCs, and locations established in this campaign.
- Build upon previous story elements rather than ignoring them.
- Use the character's name, class, and background to personalize responses.
- Reference their skills, abilities, and inventory when relevant to actions.
- Adapt your tone and style to match the ${settingData.name} setting.
- Be concise but vivid - set scenes, describe consequences, advance the plot.
- Use second person ("you see...", "you hear...") to immerse the player.
- Generate 100-200 words of rich, atmospheric storytelling.

The player will provide their action and dice roll. Use the dice result to determine the outcome, continue the story with consequences, and set up their next choice.

Always end by asking what they want to do next and which die they want to roll for it.`;
    }

    /**
     * Build enhanced memory context for AI with all character details
     */
    buildMemoryContext(character, campaign) {
        const memoryParts = [];
        
        // Get memory summary from memory manager if available
        if (this.memoryManager) {
            const memorySummary = this.memoryManager.getMemorySummary();
            
            // Add recent decisions
            if (memorySummary.recent_decisions.length > 0) {
                const decisions = memorySummary.recent_decisions.map(d => d.decision).join(', ');
                memoryParts.push(`🧠 RECENT DECISIONS: ${decisions}`);
            }
            
            // Add key relationships
            if (memorySummary.key_relationships.length > 0) {
                const relationships = memorySummary.key_relationships
                    .map(([name, rel]) => `${name} (${rel.current_relationship})`)
                    .join(', ');
                memoryParts.push(`👥 KEY RELATIONSHIPS: ${relationships}`);
            }
            
            // Add important discoveries
            if (memorySummary.important_discoveries.length > 0) {
                const discoveries = memorySummary.important_discoveries.map(d => d.discovery).join(', ');
                memoryParts.push(`🔍 IMPORTANT DISCOVERIES: ${discoveries}`);
            }
            
            // Add frequently used skills
            if (memorySummary.frequently_used_skills.length > 0) {
                const skills = memorySummary.frequently_used_skills
                    .map(([skill, data]) => `${skill} (${data.successes}/${data.total_uses})`)
                    .join(', ');
                memoryParts.push(`🎯 FREQUENTLY USED SKILLS: ${skills}`);
            }
            
            // Add active plot threads
            if (memorySummary.active_plot_threads.length > 0) {
                const plots = memorySummary.active_plot_threads.map(p => p.name).join(', ');
                memoryParts.push(`📖 ACTIVE PLOT THREADS: ${plots}`);
            }
        }
        
        // Character Skills and Abilities
        if (character.skills && Object.keys(character.skills).length > 0) {
            const skillList = Object.entries(character.skills)
                .filter(([_, skill]) => skill.proficient)
                .map(([skillName, skill]) => `${skillName} (+${skill.modifier})`)
                .join(', ');
            if (skillList) {
                memoryParts.push(`🎯 PROFICIENT SKILLS: ${skillList}`);
            }
        }
        
        if (character.abilities && character.abilities.length > 0) {
            memoryParts.push(`💪 CLASS ABILITIES: ${character.abilities.join(', ')}`);
        }
        
        // Inventory and Equipment
        if (character.inventory && character.inventory.length > 0) {
            const inventoryList = character.inventory.map(item => item.name).join(', ');
            memoryParts.push(`🎒 INVENTORY: ${inventoryList}`);
        }
        
        if (character.equipment) {
            const equipment = [];
            if (character.equipment.weapon) equipment.push(`Weapon: ${character.equipment.weapon.name || character.equipment.weapon}`);
            if (character.equipment.armor) equipment.push(`Armor: ${character.equipment.armor.name || character.equipment.armor}`);
            if (character.equipment.shield) equipment.push(`Shield: ${character.equipment.shield.name || character.equipment.shield}`);
            if (equipment.length > 0) {
                memoryParts.push(`⚔️ EQUIPPED: ${equipment.join(', ')}`);
            }
        }
        
        // Important Campaign Decisions and Flags
        if (campaign.campaign_flags && Object.keys(campaign.campaign_flags).length > 0) {
            const flags = Object.entries(campaign.campaign_flags)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            memoryParts.push(`🚩 IMPORTANT DECISIONS: ${flags}`);
        }
        
        // NPCs and Relationships
        if (campaign.npcs_encountered && campaign.npcs_encountered.length > 0) {
            const npcs = campaign.npcs_encountered
                .map(npc => `${npc.name} (${npc.relationship || 'neutral'})`)
                .join(', ');
            memoryParts.push(`👥 KNOWN NPCs: ${npcs}`);
        }
        
        // Locations and World State
        if (campaign.locations_visited && campaign.locations_visited.length > 0) {
            const locations = campaign.locations_visited.map(loc => loc.name || loc).join(', ');
            memoryParts.push(`🗺️ VISITED LOCATIONS: ${locations}`);
        }
        
        // Quests
        if (campaign.current_quest) {
            memoryParts.push(`🎯 CURRENT QUEST: ${campaign.current_quest.title || campaign.current_quest}`);
        }
        
        if (campaign.completed_quests && campaign.completed_quests.length > 0) {
            const completedQuests = campaign.completed_quests.map(quest => quest.title || quest).join(', ');
            memoryParts.push(`✅ COMPLETED QUESTS: ${completedQuests}`);
        }
        
        return memoryParts.length > 0 ? '\n' + memoryParts.join('\n') + '\n' : '';
    }
    
    /**
     * Build comprehensive campaign context from history
     */
    buildCampaignContext() {
        const campaign = gameState.getCampaign();
        const character = gameState.getCharacter();
        const recentLog = campaign.campaign_log?.slice(-10) || [];
        const settingData = characterManager?.settings?.[campaign.setting] || {};
        
        const contextParts = [];
        
        if (character?.name) {
            contextParts.push(`📖 CONTINUING ${character.name.toUpperCase()}'S ADVENTURE`);
            contextParts.push(`👤 Character: ${character.name} (${character.race || 'Human'} ${character.class})`);
        }
        
        if (campaign.current_location) {
            contextParts.push(`🎯 Current Location: ${campaign.current_location}`);
        }
        
        contextParts.push(`🌍 Setting: ${settingData.name || campaign.setting}`);
        
        if (recentLog.length > 0) {
            contextParts.push(`\n📚 RECENT CAMPAIGN EVENTS:`);
            recentLog.forEach((entry, index) => {
                contextParts.push(`${index + 1}. ${entry.type}: ${entry.content?.substring(0, 120)}...`);
            });
        }
        
        if (campaign.npcs_encountered?.length > 0) {
            contextParts.push(`\n🎭 ESTABLISHED NPCs:`);
            campaign.npcs_encountered.forEach(npc => {
                contextParts.push(`- ${npc.name} (${npc.relationship || 'neutral'}): ${npc.description || 'previous encounter'}`);
            });
        }
        
        if (campaign.important_locations?.length > 0) {
            contextParts.push(`\n🗺️ KNOWN LOCATIONS:`);
            campaign.important_locations.forEach(loc => {
                contextParts.push(`- ${loc.name}: ${loc.description || 'previously visited'}`);
            });
        }
        
        return contextParts.length > 0 ? contextParts.join('\n') : 'This is the beginning of the adventure.';
    }
    
    /**
     * Always prompt for dice roll after AI response
     */
    promptForDiceRoll(aiResponse) {
        console.log('[AI] Always prompting for dice roll after response');
        
        const diceMatches = aiResponse.match(/(?:roll|make).*?[ad]?\s*(d4|d6|d8|d10|d12|d20)/gi);
        let diceType = 'd20';
        
        if (diceMatches && diceMatches.length > 0) {
            const match = diceMatches[0].toLowerCase();
            if (match.includes('d4')) diceType = 'd4';
            else if (match.includes('d6')) diceType = 'd6';
            else if (match.includes('d8')) diceType = 'd8';
            else if (match.includes('d10')) diceType = 'd10';
            else if (match.includes('d12')) diceType = 'd12';
            else if (match.includes('d20')) diceType = 'd20';
        }
        
        console.log('[AI] Detected dice type from AI response:', diceType);
        console.log('[AI] AI response dice matches:', diceMatches);
        
        // Force dice system to show for this dice type with a delay to ensure dice system is ready
        setTimeout(() => {
            if (typeof eventBus !== 'undefined' && window.diceSystem) {
                console.log('[AI] Emitting force:dice:show event for:', diceType);
                eventBus.emit('force:dice:show', {
                    diceType: diceType,
                    reason: 'AI response requires dice roll'
                });
                
                // Also directly call the dice system as backup
                if (window.diceSystem && window.diceSystem.showDiceRequest) {
                    console.log('[AI] Directly calling diceSystem.showDiceRequest as backup');
                    window.diceSystem.showDiceRequest([diceType]);
                }
            } else {
                console.warn('[AI] EventBus or diceSystem not available');
            }
        }, 500);
        
        console.log(`[AI] Scheduled dice UI to show for ${diceType.toUpperCase()} roll`);
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
     * TEST: Simple display function to verify UI is working
     */
    testDisplay() {
        console.log('🧪 Testing display system...');
        const testContent = "This is a test message from the AI system. If you can see this, the display system is working correctly!";
        this.displayStoryContent(testContent, 'dm-response');
        console.log('🧪 Test message sent to display');
    }

    /**
     * Build start prompt for new campaign
     */
    buildStartPrompt(character, campaign) {
        const setting = characterManager?.settings?.[campaign.setting] || {};
        const settingName = setting.name || 'Fantasy';
        const themes = setting.themes || ['adventure'];
        const technology = setting.technology || 'Medieval';
        const characterClass = character.class || 'adventurer';
        const characterName = character.name || 'Hero';
        
        // Create contextual opening scenarios based on setting
        const contextualPrompts = {
            'medieval-fantasy': `Start an epic ${settingName} adventure for ${characterName}, a level ${character.level} ${characterClass}.

SETTING CONTEXT: You are in the bustling medieval kingdom of Valdris, where ancient magic flows through enchanted forests, crumbling dungeons hide forgotten treasures, and political intrigue shadows the royal court. The air carries whispers of an awakening darkness in the northern mountains.

OPENING SCENARIO: ${characterName} finds themselves in the candlelit common room of The Prancing Pony tavern in the border town of Millhaven. Rain patters against diamond-paned windows as merchants, soldiers, and travelers share hushed conversations over tankards of ale. A hooded figure in the corner has been watching you for the past hour, and the tavern keeper keeps glancing nervously toward the stairs leading to the upper rooms.

Create an engaging opening that:
- Establishes immediate atmosphere with rich sensory details
- Introduces a compelling hook or mystery 
- Gives ${characterName} clear motivation as a ${characterClass}
- Sets up meaningful choices with consequences
- Incorporates elements of ${themes.join(', ')}`,

            'modern-day': `Start a gripping ${settingName} adventure for ${characterName}, a level ${character.level} ${characterClass}.

SETTING CONTEXT: You are in present-day Seattle, where beneath the surface of coffee shops and tech startups, supernatural forces move in the shadows. Government agencies track paranormal activities, and ancient entities adapt to the digital age.

OPENING SCENARIO: ${characterName} sits in their car outside a 24-hour diner on Highway 99, rain streaking the windshield as neon signs reflect in puddles. Your police scanner crackles with reports of "unusual electromagnetic activity" near the abandoned Blackwood Industries building. Your phone buzzes with an encrypted message: "They know you've been investigating. Meet me at the old pier. Come alone. -M"

Create an engaging opening that:
- Establishes modern urban atmosphere with contemporary details
- Introduces a supernatural or conspiracy-driven hook
- Gives ${characterName} clear motivation as a ${characterClass}
- Sets up tension-filled choices
- Incorporates elements of ${themes.join(', ')}`,

            'sci-fi-space': `Start an epic ${settingName} adventure for ${characterName}, a level ${character.level} ${characterClass}.

SETTING CONTEXT: You are aboard the deep space station Kepler-442, orbiting a gas giant in the outer rim territories. Here, alien traders, corporate agents, and independent spacers converge in a melting pot of species and technologies. Rumors speak of ancient alien artifacts and unexplored jump gates.

OPENING SCENARIO: ${characterName} stands on the observation deck of Kepler-442, watching the swirling storms of the gas giant below while distant stars twinkle through the reinforced transparisteel. Your comm unit chirps with an urgent message from Station Command: "Priority Alpha situation in Docking Bay 7. We need someone with your skills, ${characterClass}. Confidential briefing in 10 minutes."

Create an engaging opening that:
- Establishes sci-fi atmosphere with futuristic details
- Introduces a space-based mystery or alien encounter
- Gives ${characterName} clear motivation as a ${characterClass}
- Sets up high-stakes choices
- Incorporates elements of ${themes.join(', ')}`,

            'eldritch-horror': `Start a haunting ${settingName} adventure for ${characterName}, a level ${character.level} ${characterClass}.

SETTING CONTEXT: You are in 1920s Arkham, Massachusetts, where gaslight flickers against fog-shrouded streets and the Miskatonic University library holds forbidden tomes. Strange dreams plague the townsfolk, and those who delve too deep into ancient mysteries are never quite the same.

OPENING SCENARIO: ${characterName} sits in the lamp-lit study of Professor Armitage's Victorian home, rain tapping against tall windows as shadows dance beyond the glass. Ancient books line the walls, their leather bindings seeming to whisper secrets. The Professor's letter lies open on the mahogany desk: "The symbols you found match those in the Necronomicon. We must meet immediately. Something is stirring in the old Whateley place."

Create an engaging opening that:
- Establishes 1920s horror atmosphere with period details
- Introduces a cosmic horror mystery or forbidden knowledge
- Gives ${characterName} clear motivation as a ${characterClass}
- Sets up dread-filled choices with sanity at stake
- Incorporates elements of ${themes.join(', ')}`
        };

        const prompt = contextualPrompts[campaign.setting] || contextualPrompts['medieval-fantasy'];
        
        return `${prompt}

CRITICAL: Jump straight into immersive storytelling. Begin immediately with vivid scene-setting that makes the player feel they are truly in this world. NO meta-commentary or explanations.

Begin the adventure now!`;
    }
    
    /**
     * Build comprehensive action context with full campaign continuity
     */
    buildActionContext(character, campaign, actionData) {
        const settingData = characterManager?.settings?.[campaign.setting] || {};
        const recentLog = campaign.campaign_log?.slice(-6) || [];
        const currentStory = campaign.story_state || 'Beginning of adventure';
        
        // Enhanced memory context
        const memoryContext = this.buildMemoryContext(character, campaign);
        
        // Build context that ensures AI remembers everything
        const contextParts = [
            `🎯 PLAYER ACTION: "${actionData.action}"`,
            `👤 CHARACTER: ${character.name} the ${character.class} (Level ${character.level})`,
            `🌍 SETTING: ${settingData.name} - ${campaign.current_location || 'Unknown location'}`,
            `📖 CURRENT SITUATION: ${currentStory}`
        ];
        
        // Add enhanced memory context
        if (memoryContext) {
            contextParts.push(memoryContext);
        }
        
        // Add recent campaign history for continuity
        if (recentLog.length > 0) {
            contextParts.push(`📚 RECENT CAMPAIGN EVENTS (maintain continuity with these):`);
            recentLog.forEach((entry, index) => {
                contextParts.push(`${index + 1}. ${entry.type}: ${entry.content?.substring(0, 150)}...`);
            });
        }
        
        // Add character-specific context
        if (character.background) {
            contextParts.push(`🎭 CHARACTER BACKGROUND: ${character.background} (use this to inform character reactions)`);
        }
        
        // Add known NPCs for relationship continuity
        if (campaign.npcs_encountered?.length > 0) {
            contextParts.push(`🎭 KNOWN NPCs (reference these when relevant):`);
            campaign.npcs_encountered.forEach(npc => {
                contextParts.push(`- ${npc.name}: ${npc.relationship || 'neutral'} (${npc.description || 'no details'})`);
            });
        }
        
        // Add important locations for world continuity
        if (campaign.important_locations?.length > 0) {
            contextParts.push(`🗺️ ESTABLISHED LOCATIONS (maintain world consistency):`);
            campaign.important_locations.forEach(loc => {
                contextParts.push(`- ${loc.name}: ${loc.description || 'previously visited'}`);
            });
        }
        
        // Add character stats for ability-based responses
        contextParts.push(`⚡ CHARACTER ABILITIES: STR ${character.stats?.str || 10}, DEX ${character.stats?.dex || 10}, CON ${character.stats?.con || 10}, INT ${character.stats?.int || 10}, WIS ${character.stats?.wis || 10}, CHA ${character.stats?.cha || 10}`);
        
        // Add health status if relevant
        if (character.health) {
            contextParts.push(`❤️ HEALTH: ${character.health.current}/${character.health.maximum}`);
        }
        
        contextParts.push(`
🔥 DM INSTRUCTIONS:
- You are ${character.name}'s dedicated DM. Remember their entire story.
- Build upon previous events, NPCs, and locations from this campaign.
- Reference their ${character.class} abilities and ${character.background} background appropriately.
- Remember and reference their skills, equipment, and past decisions.
- Maintain the ${settingData.name} setting's atmosphere and tone.
- Consider their current health and ability scores when determining outcomes.
- Create consequences that advance the ongoing narrative.
- Stay completely in character as their DM throughout.

CRITICAL: Respond as ${character.name}'s DM with full knowledge of their campaign history. Jump straight into describing what happens as a result of "${actionData.action}" - NO meta-commentary, just pure storytelling that builds on everything established before.`);
        
        return contextParts.join('\n');
    }

    async generateStoryResponse(actionData) {
        if (this.isGeneratingStory) {
            console.log('🚫 Already processing, ignoring duplicate request');
            return null;
        }

        const requestKey = `${actionData.action}_${actionData.diceResult?.result || actionData.diceRoll?.result || 'no_dice'}_${Date.now()}`;
        if (this.lastStoryRequest === requestKey.split('_').slice(0, -1).join('_')) {
            console.log('🚫 Duplicate request detected, ignoring');
            return null;
        }
        
        this.lastStoryRequest = requestKey.split('_').slice(0, -1).join('_');
        this.isGeneratingStory = true;
        console.log('🎭 Generating narrative response for action:', actionData.action);

        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
            const storyContext = this.buildActionContext(character, campaign, actionData);
            
            const storySystemPrompt = `🎭 NARRATIVE GENERATION

You are the storytelling engine for a ${campaign.setting} campaign. Your ONLY job is to generate immersive story content.

🚨 CRITICAL RULES:
❌ NO meta-commentary, planning, or thinking out loud
❌ NO action options or choices - that's handled separately  
❌ NO dice requests - dice are handled separately
❌ NO game mechanics discussion
❌ NO repetition of previous responses
✅ ONLY pure story narrative describing what happens

RESPONSE FORMAT:
- 4-8 detailed paragraphs of immersive story content (MINIMUM 100 words)
- Rich sensory details and atmospheric description
- Character emotions and reactions
- Consequences of the player's action
- Natural story progression
- End with the scene resolution (no choices needed)

📏 CRITICAL: Your response must be AT LEAST 100 words long and UNIQUE. Short or repetitive responses are not acceptable.

START IMMEDIATELY WITH STORY CONTENT - NO PREAMBLE!`;

            const response = await this.callAI([
                { role: 'system', content: storySystemPrompt },
                { role: 'user', content: storyContext }
            ]);

            if (response) {
                this.addToRecentResponses(response);
            }

            console.log('🎭 Generated response length:', response?.length || 0);
            return response;

        } catch (error) {
            console.error('🎭 Error generating story response:', error);
            return this.getStoryFallback(actionData.action);
        } finally {
            this.isGeneratingStory = false;
        }
    }

    async generateActionChoices(currentStory = '') {
        if (this.isGeneratingChoices) {
            console.log('Choice generation already processing, ignoring duplicate request');
            return this.getGenericOptions();
        }

        this.isGeneratingChoices = true;
        console.log('🎯 Using rule-based contextual generation');

        try {
            const contextualOptions = this.generateContextualFallbackOptions(currentStory);
            console.log('🎯 Generated', contextualOptions.length, 'contextual options:', contextualOptions);
            return contextualOptions;
            
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

        } catch (error) {
            console.error('🎯 Error generating choices:', error);
            return this.getGenericOptions();
        } finally {
            this.isGeneratingChoices = false;
        }
    }

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
    
    async callAI(messages) {
        console.log('🤗 HuggingFace AI call started');
        console.log('🤗 Messages:', messages.length, 'items');
        
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            let settingData = null;
            
            if (typeof characterManager !== 'undefined' && campaign.setting) {
                settingData = { 
                    id: campaign.setting,
                    ...characterManager.settings[campaign.setting] 
                };
            }
            
            console.log('🤗 Using setting:', campaign.setting);
            
            // Extract the main content from messages
            const lastMessage = messages[messages.length - 1]?.content || '';
            const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
            
            // Combine system and user messages for HuggingFace
            let fullPrompt = '';
            if (systemMessage) {
                fullPrompt += `SYSTEM CONTEXT: ${systemMessage}\n\n`;
            }
            fullPrompt += `USER REQUEST: ${lastMessage}`;
            
            console.log('🤗 Full prompt length:', fullPrompt.length, 'characters');
            
            // Determine if this is choice generation or narrative
            const isChoiceGeneration = lastMessage.includes('action choices') || 
                                     lastMessage.includes('choice options') ||
                                     lastMessage.includes('what can') ||
                                     lastMessage.includes('options are');
            
            console.log('🤗 Is choice generation:', isChoiceGeneration);
            
            let response;
            if (isChoiceGeneration) {
                console.log('🤗 Generating choices with HuggingFace');
                try {
                    const choices = await this.generateHuggingFaceChoices(fullPrompt, character, settingData);
                    response = Array.isArray(choices) ? choices.join('\n') : choices;
                    console.log('🤗 Generated choices response length:', response?.length || 0);
                } catch (error) {
                    console.warn('🤗 Choice generation failed, using fallback');
                    const fallbackChoices = this.getHuggingFaceFallbackChoices();
                    response = fallbackChoices.join('\n');
                }
            } else {
                console.log('🤗 Generating story with HuggingFace');
                try {
                    response = await this.generateHuggingFaceStory(fullPrompt, 'narrative', character, settingData);
                    console.log('🤗 Generated story response length:', response?.length || 0);
                } catch (error) {
                    console.warn('🤗 Story generation failed, using fallback');  
                    response = this.getHuggingFaceFallbackResponse('narrative', settingData);
                }
            }
            
            if (response && response.length > 20 && this.validateResponseLength(response, 80)) {
                console.log('🤗 HuggingFace Success:', response.length, 'chars,', response.trim().split(/\s+/).length, 'words');
                console.log('🤗 Response preview:', response.substring(0, 100) + '...');
                return response;
            } else {
                console.warn('🤗 Response validation failed, using final fallback');
                const finalFallback = this.getHuggingFaceFallbackResponse('narrative', settingData);
                console.log('🤗 Final fallback response length:', finalFallback.length);
                return finalFallback;
            }
            
        } catch (error) {
            console.error('🤗 HuggingFace AI failed completely:', error);
            
            // Use enhanced fallback response with debugging
            console.log('🤗 Using emergency fallback response');
            const currentSetting = typeof gameState !== 'undefined' ? gameState.getCampaign().setting : 'medieval-fantasy';
            const settingData = { id: currentSetting };
            const fallbackResponse = this.getHuggingFaceFallbackResponse('narrative', settingData);
            console.log('🤗 Emergency fallback response generated:', fallbackResponse.substring(0, 100) + '...');
            return fallbackResponse;
        }
    }

    /**
     * Show fallback dice outcome when AI fails
     */
    showFallbackDiceOutcome(rollData, successLevel) {
        if (!rollData) {
            console.log('[AI] No dice data available for fallback outcome');
            return;
        }
        
        const result = rollData.result || rollData.total;
        let outcomeText = '';
        
        if (successLevel === 'critical_success') {
            const criticalSuccessResponses = [
                `Your exceptional roll of ${result} leads to outstanding success! Everything goes better than you could have hoped, opening up incredible new opportunities and possibilities.`,
                `With a magnificent roll of ${result}, you achieve extraordinary success! Fortune smiles upon you as events unfold in ways that exceed your expectations.`,
                `Your remarkable roll of ${result} produces spectacular results! The stars align in your favor, transforming what seemed challenging into a resounding victory.`
            ];
            outcomeText = criticalSuccessResponses[Math.floor(Math.random() * criticalSuccessResponses.length)];
        } else if (successLevel === 'success') {
            const successResponses = [
                `Your solid roll of ${result} allows you to succeed with confidence. Things unfold exactly as intended, building momentum for future challenges.`,
                `With your reliable roll of ${result}, you achieve your goal effectively. Your skill and determination pay off as circumstances align in your favor.`,
                `Your steady roll of ${result} delivers the success you were seeking, validating your strategy and opening the path forward.`
            ];
            outcomeText = successResponses[Math.floor(Math.random() * successResponses.length)];
        } else if (successLevel === 'partial') {
            const partialResponses = [
                `Your roll of ${result} produces mixed results. You achieve some of what you set out to accomplish, but complications add new dimensions to your situation.`,
                `With your roll of ${result}, you succeed partially while uncovering new complexities. Progress comes with unexpected twists.`,
                `Your roll of ${result} brings both achievement and revelation, teaching valuable lessons about the true nature of your circumstances.`
            ];
            outcomeText = partialResponses[Math.floor(Math.random() * partialResponses.length)];
        } else if (successLevel === 'failure') {
            const failureResponses = [
                `Your roll of ${result} doesn't achieve your intended goal, but opens different pathways forward. The experience provides valuable insight.`,
                `With your roll of ${result}, things don't go according to plan, forcing you to adapt and find alternative solutions.`,
                `Your roll of ${result} leads to an unexpected outcome that redirects your path, revealing new information about your situation.`
            ];
            outcomeText = failureResponses[Math.floor(Math.random() * failureResponses.length)];
        } else if (successLevel === 'critical_failure') {
            const criticalFailureResponses = [
                `Your challenging roll of ${result} creates significant complications that demand immediate attention, opening entirely new storylines.`,
                `With your roll of ${result}, events take a dramatic turn that transforms your entire situation with both danger and opportunity.`,
                `Your roll of ${result} triggers unexpected consequences that reshape everything, leading to memorable and challenging adventures.`
            ];
            outcomeText = criticalFailureResponses[Math.floor(Math.random() * criticalFailureResponses.length)];
        }
        
        const continuationPrompts = [
            "Roll a D10 to see what emerges from this situation!",
            "Roll a D8 to discover what opportunities or challenges await!",
            "Roll a D12 to unveil what destiny has in store!",
            "Roll a D6 to see what unexpected developments arise!",
            "Roll a D20 to determine what remarkable twists await!"
        ];
        
        const fullResponse = `${outcomeText} ${continuationPrompts[Math.floor(Math.random() * continuationPrompts.length)]}`;
        
        this.displayStoryContent(fullResponse, 'dm-response');
        this.promptForDiceRoll(fullResponse);
        
        console.log('[AI] Fallback dice outcome displayed');
    }
    
    /**
     * Add response to recent responses tracker
     */
    addToRecentResponses(response) {
        if (!response || typeof response !== 'string') return;
        
        // Keep only the first 100 characters for comparison
        const responseSignature = response.substring(0, 100).toLowerCase().trim();
        this.recentResponses.push(responseSignature);
        
        // Keep only the most recent responses
        if (this.recentResponses.length > this.maxRecentResponses) {
            this.recentResponses.shift();
        }
    }
    
    /**
     * Check if a response is too similar to recent ones
     */
    isResponseTooSimilar(response) {
        if (!response || typeof response !== 'string' || this.recentResponses.length === 0) {
            return false;
        }
        
        const responseSignature = response.substring(0, 100).toLowerCase().trim();
        
        // Check similarity with recent responses
        for (const recentResponse of this.recentResponses) {
            const similarity = this.calculateSimilarity(responseSignature, recentResponse);
            if (similarity > 0.7) { // 70% similarity threshold
                console.log('🚫 High similarity detected:', similarity);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Calculate similarity between two strings using simple word overlap
     */
    calculateSimilarity(str1, str2) {
        const words1 = str1.split(/\s+/).filter(word => word.length > 3);
        const words2 = str2.split(/\s+/).filter(word => word.length > 3);
        
        if (words1.length === 0 || words2.length === 0) return 0;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = (commonWords.length * 2) / (words1.length + words2.length);
        
        return similarity;
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
    /**
     * Enhanced display method that includes evaluation and improvement
     */
    async displayEnhancedStoryContent(content, type = 'dm-response', context = {}) {
        let finalContent = content;
        
        // Evaluate and potentially improve DM responses
        if (this.enableEvaluation && this.dmEvaluator && type === 'dm-response') {
            const evaluation = this.dmEvaluator.evaluateResponse(content, context);
            
            console.log('📊 DM Response Evaluation:', {
                score: evaluation.totalScore,
                feedback: evaluation.feedback,
                suggestions: evaluation.suggestions.slice(0, 2)
            });
            
            // If auto-improvement is enabled and score is low, try to improve
            if (this.autoImprove && evaluation.totalScore < 6.5) {
                console.log('🔧 Attempting to improve response (Score: ' + evaluation.totalScore.toFixed(1) + '/10)...');
                try {
                    const improvedContent = await this.dmEvaluator.iterateResponse(content, evaluation, this);
                    if (improvedContent && improvedContent !== content) {
                        console.log('✨ Response improved!');
                        finalContent = improvedContent;
                        
                        // Re-evaluate the improved response
                        const newEvaluation = this.dmEvaluator.evaluateResponse(finalContent, {
                            ...context,
                            type: context.type + '_improved',
                            originalScore: evaluation.totalScore
                        });
                        console.log('📈 Improved Response Score:', newEvaluation.totalScore.toFixed(1) + '/10');
                    }
                } catch (error) {
                    console.error('Failed to improve response:', error);
                }
            }
        }
        
        this.displayStoryContent(finalContent, type);
        return finalContent;
    }

    displayStoryContent(content, type = 'dm-response') {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) {
            console.error('❌ story-content element not found!');
            return;
        }
        
        let displayContent = content;
        
        // Only apply filtering to AI responses, not player actions or dice results
        if (type === 'dm-response' && content && content.length > 0) {
            // Basic cleanup only
            displayContent = content.trim();
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
                <span class="loading-dots">⏳</span>
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
     * Show fallback content when system fails
     */
    showFallbackStart() {
        const character = gameState.getCharacter();
        const campaign = gameState.getCampaign();
        const setting = characterManager?.settings?.[campaign.setting] || {};
        const characterName = character.name || 'Hero';
        const characterClass = character.class || 'adventurer';
        
        // Create contextual fallback scenarios
        const fallbackScenarios = {
            'medieval-fantasy': `The ancient stones beneath your feet seem to whisper secrets as you pause in the candlelit entrance of an old tavern. The scent of roasted meat and aged ale fills the air, while flickering flames cast dancing shadows on weathered wooden walls. Your keen senses as a ${characterClass} pick up the subtle tension in the room - hushed conversations, darting glances, and the unmistakable feeling that something momentous is about to unfold.

A hooded figure in the corner raises their head slightly, revealing eyes that seem to recognize you, ${characterName}. The tavern keeper polishes a tankard with nervous energy, occasionally glancing toward the stairs that lead to the upper rooms. Outside, rain patters against diamond-paned windows, and you can hear the distant sound of hoofbeats on cobblestone streets.

What do you choose to do in this moment that feels heavy with possibility?`,

            'modern-day': `The neon glow of the 24-hour diner reflects off the rain-slicked asphalt as you sit in your car, engine idling quietly. Your phone buzzes with an encrypted message while the police scanner crackles with reports of "unusual activity" downtown. As a ${characterClass}, you've learned to trust your instincts, and right now they're telling you that this seemingly ordinary Seattle night is anything but ordinary.

Through the diner's window, you spot a figure in a dark coat who's been nursing the same cup of coffee for two hours, occasionally glancing in your direction. The message on your phone reads: "They know you've been investigating. Time to choose a side, ${characterName}." Your training has prepared you for moments like this, but the weight of the decision ahead feels heavier than usual.

What do you decide to do as the rain continues to fall and the city holds its breath?`,

            'sci-fi-space': `The observation deck of Deep Space Station Kepler-442 offers a breathtaking view of the gas giant below, its swirling storms painted in shades of amber and crimson. The distant hum of the station's life support systems provides a constant reminder that you're suspended in the vast emptiness of space, surrounded by the unknown. Your experience as a ${characterClass} has brought you to this frontier outpost, where every day brings new challenges and discoveries.

Your comm unit chirps with an incoming priority message from Station Command. The artificial gravity beneath your feet feels reassuring as you consider the sealed orders in your quarters and the strange energy readings that have been detected near the outer rim. Other spacers, traders, and travelers move past you in the corridor, each carrying their own secrets and agendas in this crossroads of the galaxy.

${characterName}, your expertise is needed, and the choices you make here could affect the fate of entire systems. What do you choose to do?`,

            'eldritch-horror': `The gaslight flickers against fog-shrouded streets as you stand before the towering gates of Miskatonic University, its Gothic spires disappearing into the murky Arkham night. The year is 1925, and the weight of forbidden knowledge presses against your mind like a physical force. Your work as a ${characterClass} has brought you face-to-face with mysteries that rational minds refuse to accept, and tonight feels like another step down a path from which there may be no return.

Professor Armitage's urgent telegram crinkles in your coat pocket: "The symbols match. Ancient forces stir. Your expertise required immediately." The shadows between the buildings seem to move independently of their sources, and you swear you can hear whispers in a language that predates human civilization. Your sanity has already been tested by previous encounters with the unknown, but something tells you that what awaits ahead will challenge everything you thought you knew about reality.

${characterName}, the very foundations of your understanding are about to be shaken. What do you choose to do as the fog swirls around you?`
        };

        const fallbackContent = fallbackScenarios[campaign.setting] || fallbackScenarios['medieval-fantasy'];
        
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

// Initialize AI manager with error handling
let aiManager = null;

try {
    console.log('🤖 Initializing AI Manager...');
    aiManager = new AIManager();
    console.log('✅ AI Manager created successfully');
} catch (error) {
    console.error('❌ Failed to create AI Manager:', error);
    console.log('🔧 Creating fallback AI Manager...');
    
    // Create a minimal fallback AI Manager
    aiManager = {
        initialized: false,
        isProcessing: false,
        enableEvaluation: false,
        
        async initialize() {
            console.log('🔧 Fallback AI Manager initializing...');
            this.initialized = true;
        },
        
        async generateStoryResponse(actionData) {
            console.log('🔧 Fallback: Generating story response');
            const fallbacks = [
                `As you ${actionData.action.toLowerCase()}, the world around you responds. Your actions have set events in motion that will shape what comes next. The atmosphere grows more intense as new possibilities unfold before you.`,
                `Your decision to ${actionData.action.toLowerCase()} proves significant. The environment shifts in response to your choice, revealing new details and opportunities. You sense that this moment will be important for your journey ahead.`,
                `You ${actionData.action.toLowerCase()} with careful consideration. The scene evolves around you, presenting new challenges and revelations. Your path forward becomes clearer as the consequences of your action begin to manifest.`
            ];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        },
        
        displayStoryContent(content, type = 'dm-response') {
            console.log('🔧 Fallback: Displaying content');
            const storyContent = document.getElementById('story-content');
            if (storyContent) {
                // Clear waiting message on first real content
                if (storyContent.querySelector('.story-waiting')) {
                    storyContent.innerHTML = '';
                }
                
                const messageElement = document.createElement('div');
                messageElement.className = type;
                messageElement.innerHTML = `<p>${content}</p>`;
                storyContent.appendChild(messageElement);
                
                // Scroll to show new content
                const storyDisplay = document.getElementById('story-display');
                if (storyDisplay) {
                    storyDisplay.scrollTop = storyDisplay.scrollHeight;
                }
            }
        },
        
        async startCampaign() {
            console.log('🔧 Fallback: Starting campaign');
            const startText = "Your adventure begins! The world around you is filled with mystery and possibility. Your choices will shape the story that unfolds. What will you do first?";
            this.displayStoryContent(startText, 'dm-response');
        }
    };
}

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
window.AIManager = AIManager;
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
