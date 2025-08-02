/**
 * DiceTales - Unified AI System
 * Combined AI manager with HuggingFace integration
 * Dynamic storytelling system for adventure games
 */

class AIManager {
    constructor() {
        // Use only HuggingFace as the primary and only AI system
        this.useHuggingFace = true;
        
        // Initialize DM Response Evaluator
        this.dmEvaluator = new DMEvaluator();
        this.enableEvaluation = true;
        this.autoImprove = true;
        
        console.log('🎭 DM Response Evaluator initialized');
        console.log('📊 Evaluation enabled:', this.enableEvaluation);
        console.log('🔧 Auto-improvement enabled:', this.autoImprove);
        
        // HuggingFace configuration - primary AI system
        this.huggingFaceBaseUrl = 'https://api-inference.huggingface.co/models/';
        this.currentHuggingFaceModel = 'microsoft/DialoGPT-medium';
        this.huggingFaceModelQueue = [
            'microsoft/DialoGPT-large',
            'microsoft/DialoGPT-medium',
            'gpt2-large',
            'gpt2',
            'microsoft/DialoGPT-small',
            'distilgpt2'
        ];
        this.huggingFaceRetryCount = 0;
        this.maxHuggingFaceRetries = 3;
        this.huggingFaceReady = false;
        // System state
        this.conversationHistory = [];
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
        
        this.bindEvents();
        
        // Initialize HuggingFace as the primary AI system for "The Quantum Relay" story
        console.log('🤗 Initializing "The Quantum Relay" AI storytelling system...');
        this.initHuggingFace();
        console.log('🤗 "The Quantum Relay" AI system initialized successfully');
    }

    async initialize() {
        if (this.initialized) return;
        console.log('🤗 STARTING "THE QUANTUM RELAY" AI SYSTEM INITIALIZATION...');
        console.log('🤗 Using advanced HuggingFace AI for immersive sci-fi storytelling');
        
        try {
            // Test HuggingFace connection
            console.log('🤗 Testing "The Quantum Relay" AI connections...');
            await this.testConnection();
            this.initialized = true;
            console.log('✅ "THE QUANTUM RELAY" AI SYSTEM READY FOR ADVENTURE');
        } catch (error) {
            console.warn('⚠️ AI initialization had issues, but continuing with fallbacks:', error);
            this.initialized = true;
        }
    }
    
    async testConnection() {
        console.log('🤗 TESTING "THE QUANTUM RELAY" AI CONNECTION...');
        
        try {
            console.log('🤗 Testing advanced sci-fi storytelling AI connection...');
            const testResponse = await this.makeHuggingFaceRequest('Testing connection', { max_length: 50 });
            if (testResponse && testResponse.length > 10) {
                console.log('🤗 "THE QUANTUM RELAY" AI CONNECTION SUCCESSFUL');
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
        const requestData = {
            inputs: prompt,
            parameters: {
                max_new_tokens: options.max_length || 250,
                temperature: options.temperature || 0.8,
                do_sample: true,
                top_p: 0.9,
                repetition_penalty: 1.1,
                return_full_text: false
            },
            options: {
                wait_for_model: true,
                use_cache: false
            }
        };
        
        for (let attempt = 0; attempt < this.huggingFaceModelQueue.length; attempt++) {
            const modelToTry = this.huggingFaceModelQueue[attempt];
            console.log(`🤗 Trying model ${attempt + 1}/${this.huggingFaceModelQueue.length}:`, modelToTry);
            
            try {
                const response = await fetch(this.huggingFaceBaseUrl + modelToTry, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    
                    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
                        this.currentHuggingFaceModel = modelToTry;
                        console.log('🤗 SUCCESS with', modelToTry);
                        return result[0].generated_text.trim();
                    }
                }
                
                if (response.status === 503) {
                    console.log(`🤗 ${modelToTry} is loading, trying next model...`);
                } else {
                    const errorText = await response.text();
                    console.warn(`🤗 ${modelToTry} failed with status ${response.status}:`, errorText);
                }

            } catch (error) {
                console.error(`🤗 Error with ${modelToTry}:`, error.message);
            }

            // Add small delay between model attempts
            if (attempt < this.huggingFaceModelQueue.length - 1) {
                console.log('🤗 Waiting before trying next model...');
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.error('🤗 ALL MODELS FAILED - using fallback');
        throw new Error('All HuggingFace models failed');
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
    
    // HuggingFace Story Prompts - Optimized for "The Quantum Relay"
    getHuggingFaceStoryPrompt(type, settingData = null) {
        // Always use "The Quantum Relay" campaign info regardless of setting
        const campaignInfo = `

📚 CURRENT CAMPAIGN: "The Quantum Relay"
Main Plot: An alien artifact called the Quantum Relay has been discovered, capable of opening wormholes across the galaxy. A rogue faction wants to use it to invade Earth, while others seek to destroy it entirely.
Key Locations: Research Station Alpha, Asteroid Mining Colony, Ancient Alien Ruins, The Enemy Mothership
Main Antagonist: Commander Vex of the Crimson Fleet, leading a human separatist faction allied with hostile aliens
Stakes: Earth and its colonies face invasion or isolation from the galaxy
Character Hook: Your family lives on one of the colonies that will be the first target of invasion.

🎯 STORY FOCUS: All scenes should connect to "The Quantum Relay" campaign. Reference space stations, alien technology, the Crimson Fleet, and the threat to Earth's colonies. Keep the player moving toward resolving this galactic conflict.`;
        
        const basePrompts = {
            narrative: `You're a Dungeon Master running "The Quantum Relay" - an epic sci-fi space adventure campaign.

SETTING: Advanced space-faring future with alien artifacts, interstellar travel, and colonial settlements${campaignInfo}

🎭 BE A NATURAL SPACE OPERA DM:
You're the DM everyone wants for their sci-fi campaign - relaxed, fun, and genuinely into space adventures. Talk like a real person:
- Use normal language, not overly technical jargon ("The ship's dark" not "The vessel is shrouded in mechanical silence")
- Be enthusiastic about space action ("Cool!" "Nice!" "Holy shit!" "Damn!")
- Talk like you're running a space campaign at the table with friends
- Use contractions (you're, it's, that's, can't, won't)

� DESCRIBE THINGS SIMPLY:
- Use clear, direct descriptions that paint a picture without being pretentious
- Include what you see, hear, smell, feel - but keep it natural
- Avoid cliché phrases like "tapestry", "shimmering", "intricate", "cosmic", "legendary"
- Say "you hear footsteps" not "the sound of approaching footsteps dances upon your ears"

🎯 KEEP THE SPACE ADVENTURE MOVING:
- Make things happen - space is dangerous and fast-paced
- End with concrete events involving the Quantum Relay, Crimson Fleet, or colony threats
- Use simple transitions: "Then", "Suddenly", "Just as you do that", "The comm crackles"
- Keep responses under 200 words when possible

🚨 NEVER DO THIS:
- Don't use purple prose about space or alien technology
- Avoid phrases like "beckons to your explorer's soul", "quantum possibilities shimmer"
- Don't end with "What calls to your spacefarer spirit?" - just tell us what happens
- No "cosmic destinies" or "stellar tapestries" - keep it grounded in the story

Current situation: `,
            
            choice: `You're a Dungeon Master presenting action options for "The Quantum Relay" space adventure campaign.${campaignInfo}

KEEP IT SIMPLE AND SPACE-FOCUSED:
Create exactly 4 clear, straightforward choices for this sci-fi adventure. Each should:
- Be written in plain English, not technobabble
- Suggest dice rolls naturally ("Roll to hack the console" not "Could demonstrate your technical prowess")
- Sound like something a real Space GM would say
- Be specific about what the character would actually do in this space scenario
- Connect to the Quantum Relay story, Crimson Fleet threat, or colony danger when possible

Based on this space situation: `,
            
            character: `You're a Dungeon Master introducing a character in "The Quantum Relay" space adventure campaign.${campaignInfo}

BE NATURAL AND DIRECT:
Describe this space character like you're telling a friend about someone interesting you met on a space station. Keep it:
- Simple and clear, not flowery or dramatic
- Focused on what the player would actually notice
- Under 150 words
- Conversational, like you're sitting at a gaming table
- Consider how this character might relate to the Quantum Relay story, Crimson Fleet, or colony threats

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
                settingData = characterManager.settings[campaign.setting];
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
        // Always generate "The Quantum Relay" story regardless of setting
        const characterRole = characterData?.role || 'space explorer';
        const characterName = characterData?.name || 'the space explorer';
        
        return `You are the AI behind "The Quantum Relay" - an epic sci-fi space adventure campaign.

SETTING: Advanced space-faring future with alien artifacts, interstellar travel, and colonial settlements
- Technology: Starships, AI systems, alien technology
- Environment: Space stations, alien worlds, asteroid colonies
- Themes: Galactic conflict, alien artifacts, survival, exploration

PLAYER CHARACTER: ${characterName}, a ${characterRole}

YOU MUST RETURN "THE QUANTUM RELAY" STORY:
Generate the exact campaign that matches this premise:

TITLE: The Quantum Relay
PLOT: An alien artifact called the Quantum Relay has been discovered, capable of opening wormholes across the galaxy. A rogue faction wants to use it to invade Earth, while others seek to destroy it entirely.
START: Your ship receives a distress signal from a research station that was studying the artifact. When you arrive, the station is dark and filled with strange energy readings.
LOCATIONS: Research Station Alpha, Asteroid Mining Colony, Ancient Alien Ruins, The Enemy Mothership
ANTAGONIST: Commander Vex of the Crimson Fleet, leading a human separatist faction allied with hostile aliens
STAKES: Earth and its colonies face invasion or isolation from the galaxy
HOOK: Your family lives on one of the colonies that will be the first target of invasion.

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
        const characterRole = characterData?.role || 'warrior';
        
        // Always use "The Quantum Relay" story as the primary campaign for all settings
        const story = {
            title: 'The Quantum Relay',
            plot: 'An alien artifact called the Quantum Relay has been discovered, capable of opening wormholes across the galaxy. A rogue faction wants to use it to invade Earth, while others seek to destroy it entirely.',
            start: 'Your ship receives a distress signal from a research station that was studying the artifact. When you arrive, the station is dark and filled with strange energy readings.',
            locations: ['Research Station Alpha', 'Asteroid Mining Colony', 'Ancient Alien Ruins', 'The Enemy Mothership'],
            antagonist: 'Commander Vex of the Crimson Fleet, leading a human separatist faction allied with hostile aliens',
            stakes: 'Earth and its colonies face invasion or isolation from the galaxy',
            hook: 'Your family lives on one of the colonies that will be the first target of invasion.'
        };
        
        // Customize hook based on character role
        if (characterRole === 'scholar') {
            story.hook = 'Your research into the Quantum Relay\'s origins makes you a key target for the Crimson Fleet - they need your knowledge to fully activate it.';
        } else if (characterRole === 'healer') {
            story.hook = 'The Quantum Relay\'s energy is causing a strange sickness among the colonists, and only you understand how to cure it.';
        } else if (characterRole === 'scout') {
            story.hook = 'You were the first to discover signs of the Crimson Fleet\'s presence in this sector - they know you can track them.';
        }
        
        return story;
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
        // Always use "The Quantum Relay" space setting for fallbacks
        const fallbacks = {
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

                `A critical decision point presents multiple approaches to your current situation. You could take the direct route - boldly investigating the Quantum Relay itself, relying on determination and courage to uncover its secrets. Alternatively, a more subtle approach might serve you better - using stealth and observation to gather intelligence on the Crimson Fleet's involvement. There's also the social path - seeking other survivors, gathering information through communication, or using persuasion to build alliances against Commander Vex. Each approach has merit in this galactic conflict. What suits your instincts in this moment?`
            ]
        };

        const fallbackArray = fallbacks[type] || fallbacks.narrative;
        const randomIndex = Math.floor(Math.random() * fallbackArray.length);
        const selectedFallback = fallbackArray[randomIndex];
        
        console.log('🤗 Fallback response length:', selectedFallback.length, 'characters');
        return selectedFallback;
    }

    getHuggingFaceFallbackChoices() {
        return [
            "Investigate the scene thoroughly, studying every shadow and detail for hidden clues or potential dangers",
            "Approach with confident determination, ready to act quickly if the situation escalates", 
            "Move stealthily to scout ahead unseen, gathering intelligence while remaining hidden in the shadows",
            "Think creatively and use your unique skills and abilities in an innovative way that reflects your personality"
        ];
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
    
    /**
     * Start a new campaign with initial story
     */
    async startCampaign() {
        try {
            // Emit thinking state for dice system  
            eventBus.emit('ai:thinking');
            
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            
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
            
            if (storyResponse) {
                const diceRequest = this.detectDiceRequest(storyResponse);
                
                if (diceRequest) {
                    this.pendingAction = actionData;
                    this.pendingAIResponse = storyResponse;
                    this.requiredDiceRoll = diceRequest;
                    this.actionState = 'waiting_for_dice';
                    
                    this.displayStoryContent(actionData.action, 'player-action');
                    
                    setTimeout(async () => {
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
     * Build comprehensive dice action context with full campaign continuity
     */
    buildActionContextWithDice(character, campaign, actionData, diceRoll) {
        const currentStory = campaign.story_state || 'The adventure begins...';
        const recentLog = campaign.campaign_log?.slice(-6) || [];
        const settingData = characterManager?.settings?.[campaign.setting] || {};
        
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
        
        // Comprehensive character context
        contextParts.push(`
👤 CHARACTER PROFILE:
Name: ${character.name} (use their name frequently)
Class: ${character.class} Level ${character.level} (reference their abilities)
Race: ${character.race || 'Human'}
Background: ${character.background || 'Unknown origins'} (inform character reactions)
Health: ${character.health?.current || '?'}/${character.health?.maximum || '?'}
Stats: STR ${character.stats?.str || 10}, DEX ${character.stats?.dex || 10}, CON ${character.stats?.con || 10}, INT ${character.stats?.int || 10}, WIS ${character.stats?.wis || 10}, CHA ${character.stats?.cha || 10}`);
        
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
        const difficulty = campaign.dm_difficulty;
        
        const settingData = characterManager?.settings?.[setting] || {};
        const recentLog = campaign.campaign_log?.slice(-8) || [];
        
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

🌍 CAMPAIGN SETTING: ${settingData.description || 'Fantasy adventure'}
🎯 DIFFICULTY: ${difficulty} difficulty
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
- Adapt your tone and style to match the ${settingData.name} setting.
- Be concise but vivid - set scenes, describe consequences, advance the plot.
- Use second person ("you see...", "you hear...") to immerse the player.
- Generate 100-200 words of rich, atmospheric storytelling.

The player will provide their action and dice roll. Use the dice result to determine the outcome, continue the story with consequences, and set up their next choice.

Always end by asking what they want to do next and which die they want to roll for it.`;
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
        
        // Build context that ensures AI remembers everything
        const contextParts = [
            `🎯 PLAYER ACTION: "${actionData.action}"`,
            `👤 CHARACTER: ${character.name} the ${character.class} (Level ${character.level})`,
            `🌍 SETTING: ${settingData.name} - ${campaign.current_location || 'Unknown location'}`,
            `📖 CURRENT SITUATION: ${currentStory}`
        ];
        
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
        
        try {
            const character = gameState.getCharacter();
            const campaign = gameState.getCampaign();
            let settingData = null;
            
            if (typeof characterManager !== 'undefined' && campaign.setting) {
                settingData = characterManager.settings[campaign.setting];
            }
            
            // Extract the main content from messages
            const lastMessage = messages[messages.length - 1]?.content || '';
            const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
            
            // Combine system and user messages for HuggingFace
            let fullPrompt = '';
            if (systemMessage) {
                fullPrompt += `SYSTEM CONTEXT: ${systemMessage}\n\n`;
            }
            fullPrompt += `USER REQUEST: ${lastMessage}`;
            
            // Determine if this is choice generation or narrative
            const isChoiceGeneration = lastMessage.includes('action choices') || 
                                     lastMessage.includes('choice options') ||
                                     lastMessage.includes('what can') ||
                                     lastMessage.includes('options are');
            
            let response;
            if (isChoiceGeneration) {
                console.log('🤗 Generating choices with HuggingFace');
                const choices = await this.generateHuggingFaceChoices(fullPrompt, character, settingData);
                response = Array.isArray(choices) ? choices.join('\n') : choices;
            } else {
                console.log('🤗 Generating story with HuggingFace');
                response = await this.generateHuggingFaceStory(fullPrompt, 'narrative', character, settingData);
            }
            
            if (response && response.length > 20 && this.validateResponseLength(response, 80)) {
                console.log('🤗 HuggingFace Success:', response.length, 'chars,', response.trim().split(/\s+/).length, 'words');
                return response;
            }
            
            throw new Error('HuggingFace response too short or failed validation');
            
        } catch (error) {
            console.error('🤗 HuggingFace AI failed:', error);
            
            // Use enhanced fallback response
            console.log('🤗 Using enhanced fallback response');
            return this.getHuggingFaceFallbackResponse('narrative');
        }
    }
    
    /**
     * Generate story response using HuggingFace
     */
    async generateStoryResponse(actionData) {
        console.log('🤗 Generating story response for action:', actionData.action);
        
        const character = gameState.getCharacter();
        const campaign = gameState.getCampaign();
        let settingData = null;
        
        if (typeof characterManager !== 'undefined' && campaign.setting) {
            settingData = characterManager.settings[campaign.setting];
        }
        
        // Build context for the story response
        const context = this.buildActionContext(character, campaign, actionData);
        
        try {
            const response = await this.generateHuggingFaceStory(context, 'narrative', character, settingData);
            return response;
        } catch (error) {
            console.error('🤗 Story generation failed:', error);
            return this.getHuggingFaceFallbackResponse('narrative', settingData);
        }
    }
    
    /**
     * Build action context for HuggingFace prompts
     */
    buildActionContext(character, campaign, actionData) {
        const characterName = character.name || 'the adventurer';
        const characterClass = character.class || 'adventurer';
        const currentStory = campaign.story_state || 'The adventure begins...';
        
        let context = `Current story: ${currentStory}\n\n`;
        context += `${characterName} the ${characterClass} decides to: ${actionData.action}\n\n`;
        
        if (actionData.diceResult) {
            const result = actionData.diceResult.result || actionData.diceResult.total;
            const dice = actionData.diceResult.dice || actionData.diceResult.type;
            context += `They rolled ${dice} and got ${result}.\n\n`;
        }
        
        context += `Continue the story based on this action and describe what happens next.`;
        
        return context;
    }
    
    generateFallbackResponse(userMessage = '') {
        const message = userMessage.toLowerCase();
        
        if (message.includes('sleep') || message.includes('rest')) {
            const sleepResponses = [
                "You settle into a comfortable resting spot, feeling the day's adventures catch up with you. Sleep comes easily, and your dreams are filled with visions of ancient magic and distant lands. When you wake, your body feels refreshed and your mind sharp. Roll a D6 to discover what new energy flows through you!",
                "The weight of exhaustion finally claims you as you find shelter for the night. Your sleep is deep and restorative, and strange whispers in your dreams speak of hidden knowledge. Dawn brings renewed vigor and a sense of purpose. Roll a D8 to see what insight your rest has provided!",
                "You decide that rest is exactly what you need right now. As you close your eyes, the sounds of the world fade away, replaced by peaceful silence. Your dreams take you on journeys through realms of possibility. You awaken with clarity and determination. Roll a D10 to see what opportunities await!"
            ];
            return sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
        }
        
        if (message.includes('attack') || message.includes('fight') || message.includes('battle')) {
            const combatResponses = [
                "Your warrior instincts take over as you spring into action. The familiar weight of your weapon in your hands brings confidence, and your movements flow with practiced precision. The heat of battle fills your veins as you face whatever challenges await. Roll a D12 to determine your combat prowess!",
                "Combat erupts around you as you engage with fierce determination. Time seems to slow as your training guides every movement, every decision crucial to the outcome. Your opponent's weaknesses become clear as you press your advantage. Roll a D20 to see how the tide of battle turns!",
                "You charge forward with courage blazing in your heart. The clash of steel rings through the air as you fight with everything you have. Victory or defeat hangs in the balance, but you've never backed down from a challenge. Roll a D8 to discover the result of your bold assault!"
            ];
            return combatResponses[Math.floor(Math.random() * combatResponses.length)];
        }
        
        if (message.includes('explore') || message.includes('search') || message.includes('investigate')) {
            const exploreResponses = [
                "Your curiosity leads you deeper into the unknown as you carefully examine every detail around you. Hidden secrets begin to reveal themselves to your keen observation, and you sense that important discoveries lie just beyond your reach. Roll a D10 to uncover what mysteries await!",
                "You begin a methodical investigation of your surroundings, noting every shadow, every unusual marking, every hint of something more. Your patience and attention to detail start to pay off as patterns emerge from the chaos. Roll a D12 to see what significant clues you discover!",
                "Your explorer's instincts guide you as you search with growing excitement. Each step forward reveals new wonders and possibilities, and you can feel that you're on the verge of something important. The thrill of discovery pulses through your veins. Roll a D6 to determine what treasures you find!"
            ];
            return exploreResponses[Math.floor(Math.random() * exploreResponses.length)];
        }
        
        if (message.includes('talk') || message.includes('speak') || message.includes('negotiate') || message.includes('convince')) {
            const socialResponses = [
                "You choose your words with careful consideration, understanding that the right phrase at the right moment can change everything. Your voice carries confidence and sincerity as you speak your truth. The power of communication opens new paths forward. Roll a D8 to see how your words resonate!",
                "Diplomacy becomes your weapon of choice as you engage in meaningful conversation. Your approach is thoughtful and respectful, seeking common ground where others might see only conflict. Sometimes the greatest victories come through understanding. Roll a D10 to determine how your diplomatic efforts unfold!",
                "You step forward with words instead of weapons, believing in the power of honest communication. Your sincerity and wisdom shine through as you attempt to bridge differences and find solutions. The art of persuasion requires both courage and compassion. Roll a D6 to see the impact of your approach!"
            ];
            return socialResponses[Math.floor(Math.random() * socialResponses.length)];
        }
        
        const uniqueResponses = [
            "Your bold decision sets in motion a cascade of unexpected events. The world around you seems to hold its breath as your choice ripples through the fabric of reality, creating new possibilities that didn't exist moments before. Roll a D8 to discover what fascinating developments unfold!",
            "With unwavering determination, you take action that will be remembered. Your choice carries weight beyond what you might imagine, and the consequences begin to take shape in ways both subtle and profound. Roll a D10 to see how destiny responds to your courage!",
            "The path you've chosen leads into uncharted territory where few have dared to venture. Your decision resonates with ancient powers that have long waited for someone brave enough to step forward. Roll a D6 to uncover what extraordinary forces you've awakened!",
            "Your instincts guide you toward an action that feels both necessary and transformative. The energy of change crackles in the air around you as your choice begins to reshape the very nature of your adventure. Roll a D12 to witness the remarkable results!",
            "You move forward with purpose, your decision creating waves of change that spread far beyond your immediate surroundings. The universe seems to align itself with your intent, opening doors that were previously invisible. Roll a D20 to discover what incredible opportunities emerge!"
        ];
        
        return uniqueResponses[Math.floor(Math.random() * uniqueResponses.length)];
    }

    /**
     * Show fallback dice outcome when AI fails
     */
    showFallbackDiceOutcome(rollData, successLevel) {
        const result = rollData.result || rollData.total;
        const diceType = rollData.dice || rollData.type;
        
        let outcomeText = '';
        
        if (successLevel === 'critical_success') {
            const criticalSuccessResponses = [
                `Your exceptional roll of ${result} leads to outstanding success! Everything goes better than you could have hoped, opening up incredible new opportunities and possibilities. The favorable outcome propels you forward with tremendous advantage.`,
                `With a magnificent roll of ${result}, you achieve extraordinary success! Fortune smiles upon you as events unfold in ways that exceed even your most optimistic expectations. This triumph creates new pathways to victory.`,
                `Your remarkable roll of ${result} produces spectacular results! The stars align in your favor, and what seemed challenging becomes a resounding victory. This critical success changes the entire dynamic of your situation.`
            ];
            outcomeText = criticalSuccessResponses[Math.floor(Math.random() * criticalSuccessResponses.length)];
        } else if (successLevel === 'success') {
            const successResponses = [
                `Your solid roll of ${result} allows you to succeed with confidence. Things unfold exactly as you intended, and you can proceed knowing your approach was sound. The positive result builds momentum for future challenges.`,
                `With your reliable roll of ${result}, you achieve your goal effectively. Your skill and determination pay off as circumstances align in your favor. This success demonstrates your growing competence and adaptability.`,
                `Your steady roll of ${result} delivers the success you were seeking. The outcome validates your strategy and opens the path forward with clear advantages. You've proven that persistence and wisdom yield results.`
            ];
            outcomeText = successResponses[Math.floor(Math.random() * successResponses.length)];
        } else if (successLevel === 'partial') {
            const partialResponses = [
                `Your roll of ${result} produces interesting mixed results. You achieve some of what you set out to accomplish, but unexpected complications add fascinating new dimensions to your situation. Progress comes with intriguing twists.`,
                `With your roll of ${result}, you succeed partially while uncovering new complexities. Your efforts bear fruit, but the outcome reveals layers of challenge and opportunity you hadn't anticipated. Success rarely comes without surprises.`,
                `Your roll of ${result} brings both achievement and revelation. While you accomplish part of your goal, the experience teaches you valuable lessons about the true nature of your circumstances. Partial victory often leads to greater wisdom.`
            ];
            outcomeText = partialResponses[Math.floor(Math.random() * partialResponses.length)];
        } else if (successLevel === 'failure') {
            const failureResponses = [
                `Your roll of ${result} doesn't achieve your intended goal, but it opens different pathways forward. Sometimes what appears to be failure is actually guidance toward a better approach. The experience provides valuable insight for your next attempt.`,
                `With your roll of ${result}, things don't go according to plan, forcing you to adapt and reconsider your strategy. This setback challenges you to think creatively and find alternative solutions. Every master knows that failure teaches what success cannot.`,
                `Your roll of ${result} leads to an unexpected outcome that redirects your path. While your original plan doesn't succeed, this experience reveals new information about your situation. Sometimes the universe has different plans in mind.`
            ];
            outcomeText = failureResponses[Math.floor(Math.random() * failureResponses.length)];
        } else if (successLevel === 'critical_failure') {
            const criticalFailureResponses = [
                `Your challenging roll of ${result} creates significant complications that demand immediate attention. While this outcome presents serious obstacles, it also opens up entirely new storylines and opportunities for heroic problem-solving. Great adventures often begin with great challenges.`,
                `With your roll of ${result}, events take a dramatic turn that no one could have predicted. This critical development transforms your entire situation, creating both danger and opportunity in equal measure. True heroes rise to meet such moments.`,
                `Your roll of ${result} triggers a cascade of unexpected consequences that reshape everything around you. While the immediate situation becomes more complex, these dramatic changes often lead to the most memorable and rewarding adventures. Adversity breeds legends.`
            ];
            outcomeText = criticalFailureResponses[Math.floor(Math.random() * criticalFailureResponses.length)];
        }
        
        const continuationPrompts = [
            "The adventure continues to evolve, and your next actions will be crucial in determining how this new chapter unfolds. Roll a D10 to see what emerges from this situation!",
            "Your story takes on new dimensions, and the choices you make now will echo through future events. Roll a D8 to discover what opportunities or challenges await!",
            "The narrative threads weave together in fascinating ways, creating fresh possibilities for heroic action. Roll a D12 to unveil what destiny has in store!",
            "New paths reveal themselves as your adventure transforms and grows. Roll a D6 to see what unexpected developments arise from these circumstances!",
            "The tale continues with renewed energy and possibility. Roll a D20 to determine what remarkable twists await in the next phase of your journey!"
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
