/**
 * Better DM - Enhanced AI Manager
 * Advanced AI system with campaign roadmap integration
 * Maintains story coherence while adapting to player actions
 */

class BetterDMAI {
    constructor() {
        this.initialized = false;
        this.isProcessing = false;
        
        // Campaign roadmap manager
        this.roadmapManager = new CampaignRoadmapManager();
        
        // AI Configuration
        this.aiConfig = {
            baseUrl: 'https://api-inference.huggingface.co/models/',
            models: [
                'microsoft/GODEL-v1_1-large-seq2seq',
                'facebook/blenderbot-400M-distill',
                'microsoft/DialoGPT-large',
                'gpt2-large'
            ],
            currentModelIndex: 0,
            maxRetries: 3,
            temperature: 0.8,
            maxTokens: 300
        };
        
        // Context management
        this.conversationHistory = [];
        this.maxHistoryLength = 15;
        this.systemContext = "";
        
        // Response quality tracking
        this.responseQuality = {
            coherenceScore: 0,
            engagementScore: 0,
            roadmapAdherence: 0
        };
        
        // State tracking
        this.lastPlayerAction = null;
        this.pendingSceneTransition = false;
        this.emergencyMode = false;
        
        this.logger = typeof logger !== 'undefined' ? logger : console;
    }
    
    /**
     * Initialize the Better DM AI system
     */
    async initialize(campaignPrompt, characterInfo) {
        try {
            this.logger.info('🤖 Initializing Better DM AI...');
            
            // Initialize campaign roadmap
            await this.roadmapManager.initialize(campaignPrompt, characterInfo);
            
            // Set initial system context
            this.updateSystemContext();
            
            // Generate opening story
            const openingStory = await this.generateOpeningStory();
            
            this.initialized = true;
            this.logger.info('✅ Better DM AI initialized successfully');
            
            return {
                success: true,
                roadmap: this.roadmapManager.roadmap,
                openingStory: openingStory
            };
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize Better DM AI:', error);
            throw error;
        }
    }
    
    /**
     * Update system context based on current roadmap state
     */
    updateSystemContext() {
        const campaignContext = this.roadmapManager.getCampaignContext();
        const currentScene = this.roadmapManager.getCurrentScene();
        const currentChapter = this.roadmapManager.getCurrentChapter();
        
        this.systemContext = `
You are an experienced Dungeon Master running a D&D campaign. You speak with the voice and authority of a seasoned DM who has been crafting adventures for years. Your responses should feel like they come from behind the DM screen - descriptive, engaging, and filled with the kind of rich detail that brings the world to life.

TONE AND STYLE:
- Use vivid, cinematic descriptions that paint clear mental images
- Speak directly to the player as "you" - make them feel present in the scene
- Include sensory details (what they see, hear, smell, feel)
- Build tension and atmosphere appropriate to the situation
- Reference dice rolls, checks, and game mechanics naturally when relevant
- Show consequences of actions through the world's reactions

CAMPAIGN MANAGEMENT:
- Follow the established campaign roadmap but adapt dynamically to player choices
- Track current objectives and guide players toward them through natural storytelling
- Introduce NPCs with distinct personalities and motivations
- Create meaningful choices that impact the story's direction
- Reward creative thinking and problem-solving

${campaignContext}

Current Scene Status:
${currentScene ? `
Scene: ${currentScene.type} encounter (Difficulty ${currentScene.difficulty}/10)
Active Objectives: ${currentScene.objectives?.join(', ') || 'Explore and discover'}
Scene Context: ${currentScene.description || 'The adventure continues...'}
` : 'Setting up the next scene...'}

DM SIGNALS (use when appropriate):
[SCENE_COMPLETE] - When current objectives are accomplished
[CHAPTER_ADVANCE] - When ready to transition to the next major story beat
[ROADMAP_UPDATE] - When player actions create new story possibilities
[ROLL_DICE] - When a skill check, saving throw, or attack roll is needed

Remember: You're not just narrating events - you're creating an interactive story where the player's choices matter. Make every response feel like it's happening at your gaming table, with you as the DM bringing the world to life through your words.
`;
    }
    
    /**
     * Generate opening story based on roadmap
     */
    async generateOpeningStory() {
        const roadmap = this.roadmapManager.roadmap;
        const firstChapter = roadmap.chapters[0];
        const firstScene = firstChapter?.scenes[0];
        
        try {
            const prompt = this.buildOpeningPrompt(roadmap, firstChapter, firstScene);
            const response = await this.callAI(prompt);
            return this.processAIResponse(response).cleanText;
        } catch (error) {
            this.logger.error('Failed to generate opening story:', error);
            return this.generateFallbackOpeningStory(roadmap, firstChapter, firstScene);
        }
    }
    
    /**
     * Build opening story prompt
     */
    buildOpeningPrompt(roadmap, firstChapter, firstScene) {
        return `You are a Dungeon Master starting a new D&D campaign. Set the opening scene with the rich, descriptive style that makes players feel like they're truly in the world.

CAMPAIGN OVERVIEW:
Campaign Title: ${roadmap.title}
Theme & Tone: ${roadmap.theme}
Ultimate Goal: ${roadmap.overallGoal}

OPENING SCENE:
Chapter: ${firstChapter?.title || 'The Beginning'}
Scene Type: ${firstScene?.title || 'Opening'} (${firstScene?.type || 'story'})

CRAFT THE OPENING:
Create a compelling campaign opener that captures the D&D spirit. Your description should:

• Paint a vivid picture that draws the player into the world
• Establish the atmosphere and tone of the adventure
• Present the initial hook or situation naturally
• End with a clear moment where the player needs to decide what to do
• Feel like the opening of a real D&D session

Write this as if you're speaking directly to your player across the gaming table, setting the scene for an epic adventure. Make it atmospheric, engaging, and true to the collaborative storytelling nature of D&D.

Aim for 200-250 words that make the player excited to dive into this world.

Opening Scene:`;
    }
    
    /**
     * Generate fallback opening story when AI generation fails
     */
    generateFallbackOpeningStory(roadmap, firstChapter, firstScene) {
        const theme = roadmap.theme || 'heroic';
        const title = roadmap.title || 'Epic Adventure';
        
        const openings = {
            heroic: [
                `Welcome to ${title}! You find yourself in a peaceful village as the morning sun casts long shadows across cobblestone streets. The air is filled with the scent of fresh bread and the sound of merchants setting up their stalls. But beneath this tranquil surface, whispers of danger circulate among the townsfolk. Something dark stirs in the distant lands, and the people look to heroes like you for hope. As you walk through the village square, an elderly figure approaches with urgent eyes and a tale that will change your destiny forever.`,
                
                `The story of ${title} begins in a time of relative peace, but peace, as you well know, rarely lasts. You stand at the crossroads of fate, where the choices you make will echo through history. The world around you is beautiful yet fragile, filled with people who deserve protection from the shadows that gather on the horizon. Today marks the beginning of an adventure that will test your courage, challenge your wisdom, and forge you into the legend you're destined to become.`
            ],
            dark: [
                `Darkness creeps across the land in ${title}, and you find yourself in a world where hope flickers like a dying candle. The village you enter is shrouded in an unnatural gloom, with shuttered windows and fearful glances from the few souls brave enough to venture outside. Something ancient and malevolent has awakened, casting its shadow over everything you hold dear. The very air seems to whisper of danger, and you can feel unseen eyes watching your every move. In this place where nightmares walk among the living, you must find the strength to stand against the encroaching evil.`,
                
                `Welcome to a realm where ${title} unfolds—a world tainted by corruption and haunted by ancient curses. The settlement before you bears the scars of recent tragedy, its people hollow-eyed and desperate. Dark omens fill the sky, and even the bravest warriors speak in hushed tones of the terror that lurks beyond the safety of these walls. You are perhaps the last hope in a world that has forgotten what it means to dream of better days.`
            ],
            mystery: [
                `The tale of ${title} begins with questions that demand answers. You arrive in a place where nothing is quite what it seems, where every shadow might hide a clue and every conversation might reveal a secret. Recent events have left the local population puzzled and afraid, speaking in riddles about strange occurrences that defy explanation. As an investigator of mysteries, you sense that beneath the surface of this seemingly ordinary place lies a web of intrigue waiting to be unraveled. Your keen mind and sharp instincts will be essential to solving the puzzle that lies before you.`,
                
                `In ${title}, truth is a rare commodity, and you find yourself in a community where secrets run as deep as ancient roots. Whispered conversations stop when you approach, and knowing glances are exchanged when they think you're not looking. Something significant has happened here—something that has shaken the very foundations of what people believed to be true. Your arrival may be the key to unlocking mysteries that have plagued this place for far too long.`
            ]
        };
        
        const themeOpenings = openings[theme] || openings.heroic;
        const selectedOpening = themeOpenings[Math.floor(Math.random() * themeOpenings.length)];
        
        return `${selectedOpening}

What would you like to do first?`;
    }
    
    /**
     * Process player action and generate appropriate response
     */
    async processPlayerAction(playerAction, actionContext = {}) {
        if (!this.initialized) {
            throw new Error('Better DM AI not initialized');
        }
        
        if (this.isProcessing) {
            this.logger.warn('AI is already processing, queuing action...');
            return { response: "Please wait, I'm still processing your previous action...", queued: true };
        }
        
        this.isProcessing = true;
        
        try {
            this.logger.info('🎮 Processing player action:', playerAction);
            
            // Update last action
            this.lastPlayerAction = playerAction;
            
            // Add to conversation history
            this.addToHistory('player', playerAction);
            
            // Generate context-aware prompt
            const prompt = this.buildActionPrompt(playerAction, actionContext);
            
            // Get AI response
            const aiResponse = await this.callAI(prompt);
            
            // Process response and extract signals
            const processedResponse = this.processAIResponse(aiResponse);
            
            // Handle any roadmap updates needed
            await this.handleRoadmapUpdates(playerAction, processedResponse);
            
            // Add AI response to history
            this.addToHistory('dm', processedResponse.cleanText);
            
            // Update system context for next interaction
            this.updateSystemContext();
            
            this.logger.info('✅ Player action processed successfully');
            
            return {
                response: processedResponse.cleanText,
                signals: processedResponse.signals,
                roadmapState: this.roadmapManager.getCampaignContext(),
                sceneInfo: this.roadmapManager.getCurrentScene()
            };
            
        } catch (error) {
            this.logger.error('❌ Failed to process player action:', error);
            return {
                response: "I encountered an issue processing your action. Please try again.",
                error: true
            };
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Build context-aware prompt for player action
     */
    buildActionPrompt(playerAction, actionContext) {
        const currentScene = this.roadmapManager.getCurrentScene();
        const recentHistory = this.getRecentHistory(5);
        
        return `
${this.systemContext}

=== RECENT GAME SESSION ===
${recentHistory}

=== CURRENT SITUATION ===
${JSON.stringify(actionContext, null, 2)}

=== PLAYER'S ACTION ===
"${playerAction}"

=== YOUR RESPONSE AS DM ===
The player has declared their action. As their Dungeon Master, describe what happens next. Paint a vivid scene that:

• Acknowledges their action with descriptive consequences
• Advances the current scene toward its objectives: ${currentScene?.objectives?.join(', ') || 'Continue the story'}
• Maintains the campaign's momentum and atmosphere
• Presents clear opportunities for the player's next move
• Feels like authentic D&D gameplay

Remember: You're sitting across from this player at a gaming table. Make your response immersive, engaging, and true to the collaborative storytelling spirit of D&D. Show them the world through your words.

DM Response:
`;
    }
    
    /**
     * Process AI response and extract control signals
     */
    processAIResponse(response) {
        const signals = {
            sceneComplete: response.includes('[SCENE_COMPLETE]'),
            chapterAdvance: response.includes('[CHAPTER_ADVANCE]'),
            roadmapUpdate: response.includes('[ROADMAP_UPDATE]'),
            emergencyMode: response.includes('[EMERGENCY_MODE]')
        };
        
        // Clean response text
        let cleanText = response
            .replace(/\[SCENE_COMPLETE\]/g, '')
            .replace(/\[CHAPTER_ADVANCE\]/g, '')
            .replace(/\[ROADMAP_UPDATE\]/g, '')
            .replace(/\[EMERGENCY_MODE\]/g, '')
            .trim();
        
        // Ensure response quality
        cleanText = this.ensureResponseQuality(cleanText);
        
        return {
            cleanText,
            signals,
            originalResponse: response
        };
    }
    
    /**
     * Handle roadmap updates based on AI signals and player actions
     */
    async handleRoadmapUpdates(playerAction, processedResponse) {
        const { signals } = processedResponse;
        
        // Handle scene completion
        if (signals.sceneComplete) {
            this.logger.info('🎬 Scene marked as complete, progressing story...');
            const progressed = this.roadmapManager.progressStory();
            if (progressed) {
                this.updateSystemContext();
            }
        }
        
        // Handle roadmap adaptation
        if (signals.roadmapUpdate || this.shouldAdaptRoadmap(playerAction)) {
            await this.roadmapManager.adaptToPlayerAction(playerAction, processedResponse.cleanText);
            this.updateSystemContext();
        }
        
        // Handle emergency mode (when players go completely off-track)
        if (signals.emergencyMode) {
            await this.handleEmergencyMode(playerAction);
        }
    }
    
    /**
     * Determine if roadmap should be adapted based on action
     */
    shouldAdaptRoadmap(playerAction) {
        // Check if action is significantly different from expected scene progression
        const currentScene = this.roadmapManager.getCurrentScene();
        if (!currentScene) return false;
        
        // Simple heuristics - in production, this would be more sophisticated
        const unexpectedKeywords = ['leave', 'abandon', 'different', 'instead', 'refuse'];
        return unexpectedKeywords.some(keyword => 
            playerAction.toLowerCase().includes(keyword)
        );
    }
    
    /**
     * Handle emergency mode when players go completely off expected path
     */
    async handleEmergencyMode(playerAction) {
        this.logger.warn('🚨 Entering emergency mode - player significantly off-track');
        this.emergencyMode = true;
        
        // Use emergency scenarios from roadmap or generate new ones
        const emergencyScenarios = this.roadmapManager.roadmap.emergencyScenarios;
        
        if (emergencyScenarios.length > 0) {
            // Use predefined emergency scenario
            this.logger.info('Using predefined emergency scenario');
        } else {
            // Generate dynamic emergency scenario
            await this.generateEmergencyScenario(playerAction);
        }
    }
    
    /**
     * Generate dynamic emergency scenario
     */
    async generateEmergencyScenario(playerAction) {
        const prompt = `
The player has gone significantly off the planned campaign path with this action: "${playerAction}"

Current campaign context:
${this.roadmapManager.getCampaignContext()}

Generate a way to gracefully redirect the story back toward the main campaign objectives while:
1. Respecting the player's agency and choice
2. Making the redirection feel natural and story-driven
3. Creating an interesting scenario that connects back to the main plot
4. Maintaining the campaign's theme and tone

Provide a brief scenario description and how it connects back to the roadmap.
`;

        try {
            const emergencyResponse = await this.callAI(prompt);
            this.logger.info('📝 Generated emergency scenario:', emergencyResponse);
            
            // Add to emergency scenarios for future use
            this.roadmapManager.roadmap.emergencyScenarios.push({
                trigger: playerAction,
                scenario: emergencyResponse,
                createdAt: Date.now()
            });
            
        } catch (error) {
            this.logger.error('Failed to generate emergency scenario:', error);
        }
    }
    
    /**
     * Call AI with current configuration (with smart local fallback)
     */
    async callAI(prompt, retryCount = 0) {
        // First try external AI if API key is available
        const apiKey = this.getAPIKey();
        if (apiKey && apiKey !== 'hf_your_api_key_here') {
            try {
                return await this.callExternalAI(prompt, retryCount);
            } catch (error) {
                this.logger.warn('External AI failed, falling back to local AI:', error);
            }
        }
        
        // Fallback to smart local AI
        return await this.callLocalAI(prompt);
    }
    
    /**
     * Call external AI service
     */
    async callExternalAI(prompt, retryCount = 0) {
        const model = this.aiConfig.models[this.aiConfig.currentModelIndex];
        const url = this.aiConfig.baseUrl + model;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAPIKey()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    temperature: this.aiConfig.temperature,
                    max_new_tokens: this.aiConfig.maxTokens,
                    return_full_text: false,
                    do_sample: true
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data[0]?.generated_text) {
            return data[0].generated_text.trim();
        } else if (data.generated_text) {
            return data.generated_text.trim();
        } else {
            throw new Error('Invalid response format');
        }
    }
    
    /**
     * Smart local AI that generates contextual responses based on roadmap
     */
    async callLocalAI(prompt) {
        this.logger.info('🤖 Using local AI system for response generation');
        
        // Extract key information from the prompt
        const playerAction = this.extractPlayerAction(prompt);
        const currentScene = this.roadmapManager.getCurrentScene();
        const currentChapter = this.roadmapManager.getCurrentChapter();
        
        // Generate contextual response based on roadmap
        return this.generateContextualResponse(playerAction, currentScene, currentChapter, prompt);
    }
    
    /**
     * Extract player action from prompt
     */
    extractPlayerAction(prompt) {
        const actionMatch = prompt.match(/Player Action: "(.*?)"/);
        return actionMatch ? actionMatch[1] : '';
    }
    
    /**
     * Generate intelligent response based on context
     */
    generateContextualResponse(playerAction, currentScene, currentChapter, fullPrompt) {
        const actionLower = playerAction.toLowerCase();
        const sceneName = currentScene?.title || 'Unknown Scene';
        const sceneType = currentScene?.type || 'story';
        const objectives = currentScene?.objectives || [];
        const chapterName = currentChapter?.title || 'Unknown Chapter';
        
        // Determine response type based on action and scene
        if (this.isExaminationAction(actionLower)) {
            return this.generateExaminationResponse(currentScene, currentChapter);
        } else if (this.isCombatAction(actionLower)) {
            return this.generateCombatResponse(currentScene, currentChapter);
        } else if (this.isSocialAction(actionLower)) {
            return this.generateSocialResponse(currentScene, currentChapter);
        } else if (this.isMovementAction(actionLower)) {
            return this.generateMovementResponse(currentScene, currentChapter);
        } else {
            return this.generateGeneralResponse(playerAction, currentScene, currentChapter);
        }
    }
    
    /**
     * Check if action is examination/investigation
     */
    isExaminationAction(action) {
        const examineKeywords = ['look', 'examine', 'inspect', 'search', 'investigate', 'check', 'study', 'observe'];
        return examineKeywords.some(keyword => action.includes(keyword));
    }
    
    /**
     * Check if action is combat-related
     */
    isCombatAction(action) {
        const combatKeywords = ['attack', 'fight', 'strike', 'hit', 'shoot', 'cast', 'defend', 'block', 'dodge'];
        return combatKeywords.some(keyword => action.includes(keyword));
    }
    
    /**
     * Check if action is social interaction
     */
    isSocialAction(action) {
        const socialKeywords = ['talk', 'speak', 'ask', 'tell', 'persuade', 'intimidate', 'negotiate', 'greet'];
        return socialKeywords.some(keyword => action.includes(keyword));
    }
    
    /**
     * Check if action is movement
     */
    isMovementAction(action) {
        const moveKeywords = ['go', 'move', 'walk', 'run', 'travel', 'head', 'approach', 'leave', 'enter'];
        return moveKeywords.some(keyword => action.includes(keyword));
    }
    
    /**
     * Generate examination response
     */
    generateExaminationResponse(scene, chapter) {
        const sceneType = scene?.type || 'story';
        const objectives = scene?.objectives || [];
        const sceneName = scene?.title || 'this area';
        const chapterName = chapter?.title || 'your current journey';
        
        // Generate specific environmental details based on scene type and context
        const environmentalDetails = this.generateEnvironmentalDetails(scene, chapter);
        const specificFindings = this.generateSpecificFindings(scene, chapter);
        
        const responses = {
            story: [
                `As you carefully examine your surroundings in ${sceneName}, ${environmentalDetails} You notice ${specificFindings} The atmosphere here tells a story of ${this.getStoryAtmosphere(scene, chapter)}. ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `Your methodical investigation of the area reveals ${environmentalDetails} ${specificFindings} stands out as particularly significant. The details you observe paint a picture of ${this.getRecentEvents(scene)}, and ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `Looking around ${sceneName} with a keen eye, you take in ${environmentalDetails} Your attention is drawn to ${specificFindings} Everything here seems connected to ${chapterName}, and ${this.getDetailedObjectiveHint(objectives, scene)}`
            ],
            
            exploration: [
                `Your exploration of ${sceneName} uncovers ${environmentalDetails} Hidden among the obvious features, you discover ${specificFindings} The layout suggests ${this.getLocationPurpose(scene)}, and ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `As you search through ${sceneName}, ${environmentalDetails} becomes apparent. Your explorer's instincts guide you to ${specificFindings} This location clearly has significance in ${chapterName} because ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `The area reveals its secrets to your careful exploration. ${environmentalDetails} Most intriguingly, ${specificFindings} catches your attention. The geography and features here suggest ${this.getLocationHistory(scene)}, which means ${this.getDetailedObjectiveHint(objectives, scene)}`
            ],
            
            social: [
                `You observe the social dynamics in ${sceneName}, noting that ${environmentalDetails} The people here show signs of ${this.getSocialTension(scene)}. ${specificFindings} reveals important information about the community's current state. ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `Your careful observation of the people reveals ${environmentalDetails} Body language and conversations suggest ${this.getCommunityMood(scene)}. You notice ${specificFindings} which indicates ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `The social atmosphere in ${sceneName} is telling. ${environmentalDetails} Watching the interactions, you see ${specificFindings} The community dynamics here are clearly affected by ${chapterName}, and ${this.getDetailedObjectiveHint(objectives, scene)}`
            ],
            
            combat: [
                `Your tactical assessment of ${sceneName} reveals ${environmentalDetails} From a combat perspective, ${specificFindings} provides either an advantage or a significant threat. The terrain suggests ${this.getCombatTerrain(scene)}, which means ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `Examining the area with a warrior's eye, you note that ${environmentalDetails} Your combat experience tells you that ${specificFindings} could be crucial in any conflict. The positioning here in relation to ${chapterName} suggests ${this.getDetailedObjectiveHint(objectives, scene)}`,
                
                `Your battlefield assessment shows ${environmentalDetails} The strategic importance of ${specificFindings} cannot be overlooked. This location's defensive potential relates to your mission because ${this.getDetailedObjectiveHint(objectives, scene)}`
            ]
        };
        
        const typeResponses = responses[sceneType] || responses.story;
        return this.selectRandomResponse(typeResponses);
    }
    
    /**
     * Generate combat response
     */
    generateCombatResponse(scene, chapter) {
        const objectives = scene?.objectives || [];
        const sceneName = scene?.title || 'the battlefield';
        const chapterName = chapter?.title || 'your current quest';
        
        const combatDetails = this.generateCombatDetails(scene, chapter);
        const tacticalSituation = this.generateTacticalSituation(scene);
        const combatOutcome = this.generateCombatOutcome(scene);
        
        const responses = [
            `Roll for initiative! Your attack strikes true in ${sceneName}. ${combatDetails} ${tacticalSituation} The sound of clashing weapons echoes through the area as ${combatOutcome} This battle is a pivotal moment in ${chapterName} - ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Combat begins! You engage your foe in ${sceneName}. ${combatDetails} The battlefield shows ${tacticalSituation} as the fight intensifies. ${combatOutcome} Your actions here will determine whether you can ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `The tension breaks into violence as combat erupts in ${sceneName}! ${combatDetails} You notice ${tacticalSituation} The outcome looks promising as ${combatOutcome} Success in this encounter means ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Battle is joined! In ${sceneName}, ${combatDetails} Your tactical awareness reveals ${tacticalSituation} The tide of battle shifts as ${combatOutcome} Victory here brings you one step closer to ${this.getDetailedObjectiveHint(objectives, scene)}`
        ];
        
        return this.selectRandomResponse(responses);
    }
    
    /**
     * Generate social interaction response
     */
    generateSocialResponse(scene, chapter) {
        const objectives = scene?.objectives || [];
        const sceneName = scene?.title || 'this social setting';
        const chapterName = chapter?.title || 'your current mission';
        
        const socialContext = this.generateSocialContext(scene, chapter);
        const conversationDetails = this.generateConversationDetails(scene);
        const socialOutcome = this.generateSocialOutcome(scene);
        
        const responses = [
            `Make a Persuasion check. Your words land with impact in ${sceneName}, where ${socialContext} The conversation ${conversationDetails} revealing ${socialOutcome} This exchange could be key to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `The NPCs react to your approach. In ${sceneName}, ${socialContext} Your diplomatic effort ${conversationDetails} and you sense ${socialOutcome} This social encounter opens the path to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Roll for Insight. As you navigate the social currents of ${sceneName}, ${socialContext} The conversation ${conversationDetails} leading to ${socialOutcome} This interaction moves you closer to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Your words weave through the complex social web of ${sceneName}. Here, ${socialContext} The exchange ${conversationDetails} The outcome - ${socialOutcome} - creates new opportunities to ${this.getDetailedObjectiveHint(objectives, scene)}`
        ];
        
        return this.selectRandomResponse(responses);
    }
    
    /**
     * Generate movement response
     */
    generateMovementResponse(scene, chapter) {
        const objectives = scene?.objectives || [];
        const sceneName = scene?.title || 'this location';
        const chapterName = chapter?.title || 'your journey';
        
        const movementDetails = this.generateMovementDetails(scene, chapter);
        const pathDescription = this.generatePathDescription(scene);
        const destinationInfo = this.generateDestinationInfo(scene);
        
        const responses = [
            `Your movement through ${sceneName} ${movementDetails} as you navigate ${pathDescription} The path ahead ${destinationInfo} bringing you closer to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `You advance purposefully through ${sceneName}, where ${movementDetails} The route ${pathDescription} while ${destinationInfo} This progress in ${chapterName} means ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Your journey continues as ${movementDetails} through ${sceneName}. The way forward ${pathDescription} and ${destinationInfo} Each step brings you nearer to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Moving with determination, ${movementDetails} as you traverse ${sceneName}. The path ${pathDescription} leading to where ${destinationInfo} Your progress ensures ${this.getDetailedObjectiveHint(objectives, scene)}`
        ];
        
        return this.selectRandomResponse(responses);
    }
    
    /**
     * Generate general response for other actions
     */
    generateGeneralResponse(playerAction, scene, chapter) {
        const objectives = scene?.objectives || [];
        const sceneName = scene?.title || 'the current situation';
        const chapterName = chapter?.title || 'your quest';
        
        const actionContext = this.generateActionContext(playerAction, scene);
        const consequenceDetails = this.generateConsequenceDetails(scene, chapter);
        const storyProgression = this.generateStoryProgression(scene);
        
        const responses = [
            `I see what you're trying to do. Your decision to ${playerAction.toLowerCase()} in ${sceneName} ${actionContext} The world responds as ${consequenceDetails} This moment in ${chapterName} reveals that ${storyProgression} Your path forward involves ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Interesting choice! As you ${playerAction.toLowerCase()} in ${sceneName}, ${actionContext} The immediate consequences show ${consequenceDetails} The larger story unfolds as ${storyProgression} This positions you to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `Let's see how this plays out. In ${sceneName}, your action ${actionContext} The ripple effects manifest as ${consequenceDetails} Your journey through ${chapterName} takes a new turn as ${storyProgression} The opportunity before you now is to ${this.getDetailedObjectiveHint(objectives, scene)}`,
            
            `The dice of fate are cast! Your bold move in ${sceneName} ${actionContext} What follows is ${consequenceDetails} This pivotal moment means ${storyProgression} The adventure calls you to ${this.getDetailedObjectiveHint(objectives, scene)}`
        ];
        
        return this.selectRandomResponse(responses);
    }
    
    /**
     * Get hint about current objectives
     */
    getObjectiveHint(objectives) {
        if (!objectives || objectives.length === 0) {
            return "Continue exploring to discover what you should do next.";
        }
        
        const randomObjective = objectives[Math.floor(Math.random() * objectives.length)];
        const hints = [
            `Remember, you need to ${randomObjective.toLowerCase()}.`,
            `Your goal of ${randomObjective.toLowerCase()} seems within reach.`,
            `Consider how this relates to ${randomObjective.toLowerCase()}.`,
            `This might help you ${randomObjective.toLowerCase()}.`
        ];
        
        return this.selectRandomResponse(hints);
    }
    
    /**
     * Select random response from array
     */
    selectRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Get API key (should be configured externally)
     */
    getAPIKey() {
        // In production, this should come from secure configuration
        return 'hf_your_api_key_here';
    }
    
    /**
     * Add message to conversation history
     */
    addToHistory(role, message) {
        this.conversationHistory.push({
            role,
            message,
            timestamp: Date.now()
        });
        
        // Trim history if too long
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }
    
    /**
     * Get recent conversation history as formatted string
     */
    getRecentHistory(count = 5) {
        return this.conversationHistory
            .slice(-count)
            .map(entry => `${entry.role.toUpperCase()}: ${entry.message}`)
            .join('\n');
    }
    
    /**
     * Ensure response quality and consistency
     */
    ensureResponseQuality(response) {
        // Basic quality checks
        if (!response || response.length < 10) {
            return "I need a moment to think about that. Please try again.";
        }
        
        // Remove redundant phrases
        response = response
            .replace(/\b(you see|you notice|you feel)\b/gi, match => 
                Math.random() > 0.7 ? match : ''
            )
            .replace(/\s+/g, ' ')
            .trim();
        
        // Ensure proper ending
        if (!/[.!?]$/.test(response)) {
            response += '.';
        }
        
        return response;
    }
    
    /**
     * Get current campaign state for UI display
     */
    getCampaignState() {
        return {
            initialized: this.initialized,
            roadmap: this.roadmapManager.roadmap,
            currentChapter: this.roadmapManager.currentChapter,
            currentScene: this.roadmapManager.currentScene,
            sceneInfo: this.roadmapManager.getCurrentScene(),
            chapterInfo: this.roadmapManager.getCurrentChapter(),
            progress: {
                chaptersCompleted: this.roadmapManager.currentChapter,
                totalChapters: this.roadmapManager.roadmap?.chapters?.length || 0,
                scenesInChapter: this.roadmapManager.getCurrentChapter()?.scenes?.length || 0,
                currentSceneIndex: this.roadmapManager.currentScene
            }
        };
    }
    
    /**
     * Export complete state for saving
     */
    exportState() {
        return {
            aiConfig: this.aiConfig,
            conversationHistory: this.conversationHistory,
            roadmapState: this.roadmapManager.exportRoadmap(),
            responseQuality: this.responseQuality,
            emergencyMode: this.emergencyMode
        };
    }
    
    /**
     * Import state from save
     */
    importState(data) {
        if (data.aiConfig) this.aiConfig = { ...this.aiConfig, ...data.aiConfig };
        if (data.conversationHistory) this.conversationHistory = data.conversationHistory;
        if (data.roadmapState) this.roadmapManager.importRoadmap(data.roadmapState);
        if (data.responseQuality) this.responseQuality = data.responseQuality;
        if (data.emergencyMode !== undefined) this.emergencyMode = data.emergencyMode;
        
        this.initialized = true;
        this.updateSystemContext();
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get detailed objective hint
     */
    getDetailedObjectiveHint(objectives, scene) {
        if (!objectives || objectives.length === 0) {
            return "discovering new paths forward in your quest";
        }
        
        const objective = this.selectRandomResponse(objectives);
        const actionWords = ['achieve', 'accomplish', 'complete', 'fulfill', 'secure', 'attain'];
        const actionWord = this.selectRandomResponse(actionWords);
        
        const progressPhrases = [
            `you can ${actionWord} ${objective.description}`,
            `${objective.description} becomes within reach`,
            `${objective.description} moves closer to completion`,
            `your path to ${objective.description} becomes clearer`,
            `the way to ${objective.description} opens before you`
        ];
        
        return this.selectRandomResponse(progressPhrases);
    }
    
    /**
     * Generate environmental details for examination
     */
    generateEnvironmentalDetails(scene) {
        const environments = [
            "ancient stone corridors echo with your footsteps",
            "mysterious shadows dance in the torchlight",
            "weathered wooden beams creak overhead",
            "polished marble surfaces reflect your movement",
            "rough cave walls glisten with moisture",
            "ornate tapestries tell stories of forgotten times",
            "crystal formations catch and scatter light",
            "overgrown vines partially conceal hidden passages"
        ];
        
        const atmosphere = [
            "the air thick with anticipation",
            "a sense of ancient power lingering in the space",
            "the weight of history pressing down around you",
            "an otherworldly energy pulsing through the area",
            "the silence broken only by distant sounds",
            "a mysterious aura that makes your skin tingle",
            "the feeling that unseen eyes are watching",
            "an electric tension that speaks of hidden secrets"
        ];
        
        return `${this.selectRandomResponse(environments)} with ${this.selectRandomResponse(atmosphere)}`;
    }
    
    /**
     * Generate specific findings for examination
     */
    generateSpecificFindings(scene) {
        const findings = [
            "intricate carvings that seem to shift when you're not looking directly at them",
            "a hidden compartment containing a cryptic message written in ancient script",
            "strange symbols etched into the surface that glow faintly when touched",
            "worn grooves in the floor suggesting frequent use by previous visitors",
            "scratches and marks that tell a story of desperate struggles",
            "carefully concealed mechanisms that respond to your careful examination",
            "subtle magical auras that hint at powerful enchantments",
            "evidence of recent activity despite the location's apparent abandonment"
        ];
        
        const insights = [
            "revealing crucial information about your surroundings",
            "providing vital clues to the mysteries you're unraveling",
            "offering new understanding of the forces at work here",
            "uncovering secrets that others have fought to protect",
            "illuminating connections you hadn't previously noticed",
            "exposing hidden truths about this place's true purpose",
            "demonstrating the significance of your current location",
            "clarifying the importance of your presence here"
        ];
        
        return `you discover ${this.selectRandomResponse(findings)}, ${this.selectRandomResponse(insights)}`;
    }
    
    /**
     * Generate combat details
     */
    generateCombatDetails(scene, chapter) {
        const combatTypes = [
            "Your swift strikes create openings in your opponent's defenses",
            "The fierce exchange of blows tests both your skill and resolve",
            "Your tactical awareness gives you the advantage in this deadly dance",
            "The brutal combat pushes you to your physical and mental limits",
            "Your training pays off as you anticipate and counter each attack",
            "The clash of weapons creates sparks that illuminate the surrounding area",
            "Your aggressive assault overwhelms your foe's defensive stance",
            "The desperate struggle demands everything you've learned about warfare"
        ];
        
        return this.selectRandomResponse(combatTypes);
    }
    
    /**
     * Generate tactical situation
     */
    generateTacticalSituation(scene) {
        const tactics = [
            "your superior positioning allows for devastating follow-up attacks",
            "the terrain works to your advantage as you maneuver for the killing blow",
            "your opponent's fatigue becomes apparent as the fight drags on",
            "environmental hazards add another layer of danger to the encounter",
            "your experience in similar battles gives you crucial insights",
            "the confined space limits your opponent's mobility significantly",
            "your adaptive fighting style keeps your enemy off-balance",
            "the psychological pressure of your relentless assault takes its toll"
        ];
        
        return this.selectRandomResponse(tactics);
    }
    
    /**
     * Generate combat outcome
     */
    generateCombatOutcome(scene) {
        const outcomes = [
            "victory seems within your grasp if you maintain this momentum",
            "the tide of battle shifts decisively in your favor",
            "your opponent's defenses begin to crumble under your sustained attack",
            "the fight reaches a critical turning point where skill matters most",
            "your strategic thinking pays off as you gain the upper hand",
            "the wounded enemy becomes increasingly desperate and dangerous",
            "your relentless pressure forces them into a defensive retreat",
            "the final moments of combat will determine the outcome of everything"
        ];
        
        return this.selectRandomResponse(outcomes);
    }
    
    /**
     * Generate social context
     */
    generateSocialContext(scene, chapter) {
        const contexts = [
            "political tensions run high and every word carries weight",
            "hidden agendas swirl beneath the surface of polite conversation",
            "ancient alliances and rivalries color every interaction",
            "power dynamics shift with each carefully chosen phrase",
            "unspoken threats and promises hang heavy in the air",
            "cultural differences create both barriers and opportunities",
            "personal histories influence how your words are received",
            "the delicate balance of trust and suspicion defines the moment"
        ];
        
        return this.selectRandomResponse(contexts);
    }
    
    /**
     * Generate conversation details
     */
    generateConversationDetails(scene) {
        const details = [
            "unveils motivations that were previously hidden from view",
            "creates unexpected alliances through skillful negotiation",
            "exposes vulnerabilities in your conversational partner's facade",
            "builds bridges of understanding across significant differences",
            "reveals crucial information through careful questioning",
            "demonstrates the power of empathy and emotional intelligence",
            "uncovers secrets that others have worked hard to conceal",
            "establishes trust through honesty and genuine concern"
        ];
        
        return this.selectRandomResponse(details);
    }
    
    /**
     * Generate social outcome
     */
    generateSocialOutcome(scene) {
        const outcomes = [
            "new paths forward that weren't visible before",
            "valuable allies who may prove crucial to your mission",
            "critical intelligence about the challenges that lie ahead",
            "unexpected solutions to problems that seemed insurmountable",
            "deeper understanding of the forces working against you",
            "leverage that could prove decisive in future encounters",
            "insight into the true nature of your current situation",
            "opportunities that could change the course of your entire quest"
        ];
        
        return this.selectRandomResponse(outcomes);
    }
    
    /**
     * Generate movement details
     */
    generateMovementDetails(scene, chapter) {
        const movements = [
            "reveals the landscape's hidden challenges and opportunities",
            "demonstrates your growing familiarity with this dangerous territory",
            "showcases your ability to adapt to changing environmental conditions",
            "highlights the strategic importance of your chosen route",
            "exposes new dangers that require immediate attention",
            "uncovers shortcuts that could save precious time",
            "illustrates the wisdom of your navigational choices",
            "proves your stamina and determination in the face of adversity"
        ];
        
        return this.selectRandomResponse(movements);
    }
    
    /**
     * Generate path description
     */
    generatePathDescription(scene) {
        const paths = [
            "winds through treacherous terrain that tests your resolve",
            "leads through areas rich with historical significance",
            "crosses ancient boundaries that few dare to traverse",
            "follows forgotten roads once traveled by legendary heroes",
            "cuts through hostile territory where danger lurks around every corner",
            "reveals breathtaking vistas that inspire and energize your spirit",
            "passes by mysterious landmarks that hold secrets yet to be discovered",
            "connects distant locations through passages known only to the wise"
        ];
        
        return this.selectRandomResponse(paths);
    }
    
    /**
     * Generate destination info
     */
    generateDestinationInfo(scene) {
        const destinations = [
            "promises answers to questions that have long puzzled you",
            "holds the key to unlocking your true potential",
            "contains resources essential to completing your mission",
            "offers sanctuary from the forces pursuing you",
            "provides the vantage point needed to plan your next moves",
            "houses allies who have been waiting for your arrival",
            "guards secrets that could change everything you thought you knew",
            "represents the culmination of all your efforts thus far"
        ];
        
        return this.selectRandomResponse(destinations);
    }
    
    /**
     * Generate action context
     */
    generateActionContext(playerAction, scene) {
        const contexts = [
            "creates ripple effects that extend far beyond the immediate area",
            "demonstrates your growing understanding of the complex forces at play",
            "reveals character traits that will define your legacy",
            "shows your willingness to take calculated risks for greater rewards",
            "illustrates your ability to think creatively under pressure",
            "proves your commitment to seeing this quest through to completion",
            "highlights your skill in adapting to unexpected circumstances",
            "showcases the wisdom gained through your previous experiences"
        ];
        
        return this.selectRandomResponse(contexts);
    }
    
    /**
     * Generate consequence details
     */
    generateConsequenceDetails(scene, chapter) {
        const consequences = [
            "allies rally to support your cause while enemies plot in the shadows",
            "new possibilities emerge while certain paths become permanently closed",
            "the balance of power shifts in ways that will reshape future conflicts",
            "hidden truths surface while comfortable illusions are shattered",
            "unexpected aid arrives from sources you never anticipated",
            "ancient prophecies edge closer to fulfillment through your actions",
            "the fabric of reality itself seems to respond to your determination",
            "those who doubted your abilities begin to reconsider their positions"
        ];
        
        return this.selectRandomResponse(consequences);
    }
    
    /**
     * Generate story progression
     */
    generateStoryProgression(scene) {
        const progressions = [
            "the threads of destiny weave together in patterns you're only beginning to understand",
            "your personal growth becomes evident through the challenges you now face with confidence",
            "the larger narrative reveals its true scope as your role becomes increasingly significant",
            "past decisions prove their worth as they provide advantages in your current situation",
            "the world around you responds to your presence in ways both subtle and profound",
            "your reputation spreads, opening doors while also attracting unwanted attention",
            "the stakes continue to escalate as your actions have increasingly far-reaching consequences",
            "your journey transforms from a simple quest into something far more meaningful and complex"
        ];
        
        return this.selectRandomResponse(progressions);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BetterDMAI;
} else {
    window.BetterDMAI = BetterDMAI;
}
