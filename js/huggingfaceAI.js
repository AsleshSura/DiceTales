/**
 * HuggingFace AI Service - Enhanced D&D Dungeon Master
 * Free AI models with no API key required!
 * 
 * Enhanced with authentic D&D dungeon master capabilities:
 * - Warm, descriptive storytelling that emphasizes fun and collaboration
 * - Natural integration of dice roll suggestions and game mechanics
 * - Focus on heroic moments and meaningful player choices
 * - Maintains the inclusive, welcoming tone of a great DM
 * - Incorporates classic D&D elements like skill checks and character agency
 */

class HuggingFaceAI {
    constructor() {
        this.baseUrl = 'https://api-inference.huggingface.co/models/';
        // Use the most reliable storytelling model
        this.currentModel = 'microsoft/DialoGPT-medium';
        this.isReady = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Ordered by storytelling capability and reliability
        this.modelQueue = [
            'microsoft/DialoGPT-large',     // Best conversational model
            'microsoft/DialoGPT-medium',    // Good balance of quality/speed
            'gpt2-large',                   // Strong text generation
            'gpt2',                         // Most reliable fallback
            'microsoft/DialoGPT-small',     // Faster alternative
            'distilgpt2'                    // Lightweight final option
        ];
        
        this.init();
    }

    /**
     * Generate setting-appropriate story prompts based on campaign data
     */
    getStoryPrompt(type, settingData = null) {
        const settingName = settingData?.name || 'Medieval Fantasy';
        const settingDesc = settingData?.description || 'classic fantasy adventure';
        const technology = settingData?.technology || 'Medieval';
        const magic = settingData?.magic || 'High fantasy';
        const themes = settingData?.themes ? settingData.themes.join(', ') : 'heroic adventures';
        const dmHint = settingData?.dm_personality_hint || 'Focus on classic fantasy tropes and epic adventures.';
        
        const basePrompts = {
            narrative: `You are a warm, descriptive, and engaging Dungeons & Dragons dungeon master running a ${settingName} campaign. Your setting is: ${settingDesc}

CAMPAIGN DETAILS:
- Technology Level: ${technology}
- Magic System: ${magic}  
- Main Themes: ${themes}
- DM Style: ${dmHint}

Your primary goals are to ensure the player has fun while creating an immersive, collaborative storytelling experience appropriate to this setting. 

As a skilled DM, you should:
- Be descriptive and paint vivid scenes using all five senses that fit the ${settingName} setting
- Maintain a warm, encouraging tone that makes the player feel welcome
- Incorporate dice roll results naturally into the narrative when appropriate
- Focus on collaborative storytelling where the player's choices matter
- Create opportunities for heroic moments and character growth within the ${settingName} world
- Balance challenge with fun, ensuring the story remains engaging
- Remember that D&D is about shared imagination and having a great time together
- Honor the themes and tone of ${settingName}: ${themes}

Continue this adventure with rich, atmospheric storytelling that brings the ${settingName} world to life:

Current Situation: `,
            
            choice: `You are an experienced D&D dungeon master presenting action options for a ${settingName} campaign. The setting is: ${settingDesc}

Setting Details: Technology (${technology}), Magic (${magic}), Themes (${themes})

Create exactly 4 distinct, engaging choices that reflect different approaches a D&D character might take in this ${settingName} setting. Each option should:
- Suggest potential dice rolls that might be involved (like Perception, Athletics, Persuasion, etc.)
- Be appropriate to the ${technology} technology level and ${magic} magic system
- Reflect the themes of: ${themes}
- Offer different risk/reward scenarios
- Appeal to different character types and playstyles
- Sound fun and heroic within the ${settingName} context

Format as a numbered list based on this situation:

Current Scenario: `,
            
            character: `You are a D&D dungeon master introducing an NPC encounter in a ${settingName} campaign. The setting is: ${settingDesc}

Setting Context: Technology (${technology}), Magic (${magic}), Themes (${themes})

Create an atmospheric, welcoming description that brings this character to life within the ${settingName} world. Focus on:
- Rich sensory details appropriate to the ${settingName} setting (appearance, voice, mannerisms, environment)
- The mood and emotional tone of the encounter that fits ${themes}
- Hints about the character's personality and motivations within this world
- Creating intrigue while maintaining a warm, inviting atmosphere
- Elements that reflect the ${technology} technology and ${magic} magic levels

Describe this encounter:

Scene Setup: `
        };
        
        return basePrompts[type] || basePrompts.narrative;
    }

    async init() {
    }

    async init() {
        console.log('🤗 INITIALIZING HUGGINGFACE AI');
        await this.warmupModel();
    }

    async warmupModel() {
        try {
            console.log('🤗 WARMING UP MODEL:', this.currentModel);
            
            // Send a simple warmup request
            const warmupResponse = await this.makeRequest("Hello, are you ready?", { max_length: 50 });
            
            if (warmupResponse) {
                this.isReady = true;
                console.log('🤗 HUGGINGFACE MODEL READY!');
            }
        } catch (error) {
            console.warn('🤗 Model warmup failed, will try on first request:', error);
        }
    }

    async makeRequest(prompt, options = {}) {
        const config = {
            max_length: options.max_length || 600,
            max_new_tokens: options.max_new_tokens || 500,
            min_length: options.min_length || 100,
            temperature: options.temperature || 0.9,
            do_sample: true,
            top_p: options.top_p || 0.95,
            repetition_penalty: options.repetition_penalty || 1.1,
            return_full_text: false,
            pad_token_id: 50256,
            ...options
        };

        // Try models with timeout for faster fallback
        for (let attempt = 0; attempt < this.modelQueue.length; attempt++) {
            const modelToTry = this.modelQueue[attempt];
            
            try {
                console.log(`🤗 Attempting request with model: ${modelToTry} (attempt ${attempt + 1})`);
                console.log('🤗 Prompt preview:', prompt.substring(0, 100) + '...');
                
                // Add timeout for faster fallback
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout
                
                const response = await fetch(`${this.baseUrl}${modelToTry}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: config,
                        options: {
                            wait_for_model: true,
                            use_cache: false
                        }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log(`🤗 Response status for ${modelToTry}:`, response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`🤗 Raw response from ${modelToTry}:`, data);

                    // Handle different response formats
                    let result = null;
                    if (Array.isArray(data) && data.length > 0) {
                        result = data[0].generated_text || data[0].text || '';
                    } else if (data.generated_text) {
                        result = data.generated_text;
                    } else if (typeof data === 'string') {
                        result = data;
                    }

                    if (result && result.trim().length > 10) {
                        // Success! Update current model and return
                        this.currentModel = modelToTry;
                        this.retryCount = 0;
                        console.log(`🤗 SUCCESS with ${modelToTry}! Result length: ${result.length}`);
                        return result;
                    } else {
                        console.warn(`🤗 ${modelToTry} returned empty or too short response:`, result);
                    }
                } else {
                    const errorText = await response.text();
                    console.warn(`🤗 ${modelToTry} failed with status ${response.status}:`, errorText);
                }

            } catch (error) {
                console.error(`🤗 Error with ${modelToTry}:`, error.message);
            }

            // Add small delay between model attempts
            if (attempt < this.modelQueue.length - 1) {
                console.log('🤗 Waiting before trying next model...');
                await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
            }
        }

        console.error('🤗 ALL MODELS FAILED - using fallback');
        throw new Error('All HuggingFace models failed');
    }

    async tryAlternativeModel() {
        // Try next model in queue
        const currentIndex = this.modelQueue.indexOf(this.currentModel);
        const nextIndex = (currentIndex + 1) % this.modelQueue.length;
        const nextModel = this.modelQueue[nextIndex];
        
        console.log('🤗 SWITCHING FROM', this.currentModel, 'TO', nextModel);
        this.currentModel = nextModel;
        
        // Reset retry count for new model
        if (nextIndex === 0 && this.retryCount >= this.maxRetries) {
            this.retryCount = 0;
        }
    }

    /**
     * Build enhanced context that incorporates character and setting data for plot generation
     */
    buildEnhancedContext(baseContext, characterData = null, settingData = null) {
        let enhancedContext = baseContext;
        
        // Get current game state if not provided
        if (!characterData && typeof gameState !== 'undefined') {
            characterData = gameState.getCharacter();
        }
        if (!settingData && typeof gameState !== 'undefined') {
            const campaign = gameState.getCampaign();
            // Get setting details from character manager if available
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
                campaignContext += `\n🎭 DUNGEON MASTER GUIDANCE: ${settingData.dm_personality_hint}\n`;
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
            
            if (campaign.current_quest) {
                campaignContext += `🎯 ACTIVE QUEST: ${campaign.current_quest.title || campaign.current_quest}\n`;
            }
            
            // Include recent campaign history for continuity
            if (campaign.campaign_log && campaign.campaign_log.length > 0) {
                campaignContext += `\n📜 RECENT EVENTS:\n`;
                const recentEvents = campaign.campaign_log.slice(-3); // Last 3 events
                recentEvents.forEach(event => {
                    if (event.content) {
                        const shortContent = event.content.length > 100 
                            ? event.content.substring(0, 100) + '...' 
                            : event.content;
                        campaignContext += `- ${shortContent}\n`;
                    }
                });
            }
            
            // Include known NPCs for continuity
            if (campaign.npcs_encountered && campaign.npcs_encountered.length > 0) {
                campaignContext += `\n👥 KNOWN CHARACTERS:\n`;
                campaign.npcs_encountered.slice(-5).forEach(npc => { // Last 5 NPCs
                    campaignContext += `- ${npc.name}: ${npc.relationship || 'neutral'}\n`;
                });
            }
        }
        
        // Combine base context with enhanced campaign context
        return campaignContext ? `${enhancedContext}${campaignContext}` : enhancedContext;
    }

    async generateStory(context, type = 'narrative', characterData = null, settingData = null) {
        console.log('🤗 GENERATING STORY:', type);
        
        let attempt = 0;
        const maxAttempts = 2;
        
        while (attempt < maxAttempts) {
            try {
                // Clean and prepare the context
                const cleanContext = this.cleanContext(context);
                
                // Build enhanced context with character and setting information
                const enhancedContext = this.buildEnhancedContext(cleanContext, characterData, settingData);
                
                // Get setting-appropriate prompt
                const promptTemplate = this.getStoryPrompt(type, settingData);
                let fullPrompt;
                
                if (type === 'narrative') {
                    fullPrompt = `${promptTemplate}${enhancedContext}

As a masterful D&D dungeon master with years of experience, continue this adventure with the immersive storytelling that makes tabletop gaming legendary. Channel the best DMs who paint worlds with words and make every moment feel cinematic.

🎲 DICE & MECHANICS: Weave dice roll outcomes naturally into the narrative (e.g., "Your sharp eyes catch a glint of metal behind the tapestry" or "Despite your careful steps, a loose stone betrays your position")

🌟 RICH ATMOSPHERE: Create a multi-sensory experience - describe the musty scent of ancient corridors, the echo of footsteps on stone, the weight of anticipation in the air, the play of torchlight on damp walls

🎭 DUNGEON MASTER VOICE: Write with the enthusiasm and warmth of a DM who loves their craft - be descriptive but personal, dramatic but welcoming, mysterious but encouraging

⚔️ HEROIC MOMENTS: Set up scenarios where the player can make meaningful choices, showcase their abilities, and feel genuinely heroic

🗺️ WORLD BUILDING: Include environmental details, atmospheric elements, and subtle hints about the larger world that make the setting feel alive and authentic

🎯 COLLABORATIVE STORYTELLING: Remember you're not just telling a story - you're facilitating an adventure where the player is the protagonist

📚 DESCRIPTIVE DEPTH: Aim for rich, evocative descriptions that would make a player lean forward with excitement and feel truly immersed in the world

Write a vivid, engaging continuation (minimum 300 characters) that captures the magic of sitting around a table with friends, rolling dice, and creating unforgettable stories together.

IMPORTANT: Always end with an intriguing question, choice, or moment that naturally invites the player to respond and engage with the story.

Continue the adventure with rich detail:`;
                } else if (type === 'character') {
                    fullPrompt = `${promptTemplate}${enhancedContext}

As a veteran D&D dungeon master renowned for bringing NPCs to life, create an encounter that players will remember long after the session ends. Think of the most memorable characters from great campaigns.

🎭 LIVING CHARACTER: This NPC should feel like a real person with genuine personality, motivations, quirks, and a distinct voice that fits the campaign setting

🌟 IMMERSIVE SCENE: Paint the complete picture - their appearance, mannerisms, the space they occupy, ambient sounds, lighting, even the air quality around them

🎲 INTERACTIVE POTENTIAL: Subtly hint at how different character approaches might work (Insight to read their true intentions, Persuasion to gain their trust, Intimidation if needed, etc.)

🗺️ WORLD INTEGRATION: Make this character feel authentically part of the campaign world with details that connect to the setting's themes and atmosphere

🎯 STORY HOOKS: Layer in potential plot threads, information, or opportunities that could lead to interesting developments

📚 SENSORY RICHNESS: Include specific details that engage multiple senses - how they smell, the texture of their clothing, the sound of their voice, their physical presence

🎪 MEMORABLE QUALITIES: Give them something distinctive that will stick in the player's mind - a unique speech pattern, unusual habit, or compelling contradiction

Create an atmospheric encounter description (minimum 250 characters) that brings this character to life in a way that would make any D&D player excited to roleplay the interaction.

IMPORTANT: End with a compelling question about how the player wishes to approach or interact with this character.

Describe this memorable encounter:`;
                } else {
                    fullPrompt = `${promptTemplate}${enhancedContext}

As an experienced D&D dungeon master who understands that great campaigns are built on rich storytelling and meaningful player agency, continue this adventure with the depth and engagement that makes tabletop gaming magical.

🎲 SEAMLESS MECHANICS: Naturally integrate dice rolls, skill checks, and game mechanics into the narrative flow without breaking immersion

🌟 ATMOSPHERIC MASTERY: Create scenes that feel cinematic yet intimate - use lighting, weather, architecture, sounds, and environmental details to set the perfect mood

🎭 AUTHENTIC VOICE: Maintain that perfect DM tone that's simultaneously dramatic and approachable, mysterious and reassuring, challenging and supportive

⚔️ MEANINGFUL CHOICES: Present situations where player decisions truly matter and different approaches can lead to different outcomes

🗺️ LIVING WORLD: Make the setting feel dynamic and responsive, where the world continues to exist and evolve beyond the immediate scene

🎯 COLLABORATIVE SPIRIT: Remember that you're facilitating the player's story, not just telling your own - create space for their character to shine

📚 NARRATIVE DEPTH: Build layers into your descriptions - immediate details, hidden elements, and subtle foreshadowing that rewards careful attention

Write a richly detailed continuation (minimum 300 characters) that captures the essence of what makes D&D special - the perfect blend of structure and improvisation, challenge and triumph, mystery and revelation.

IMPORTANT: Always conclude with an engaging prompt that makes the player eager to respond and continue shaping the story.

Continue the epic tale:`;
                }
                
                console.log('🤗 Using enhanced prompt:', fullPrompt.substring(0, 150) + '...');
                
                const response = await this.makeRequest(fullPrompt, {
                    max_length: type === 'narrative' ? 1200 : 800,  // Significantly increased for more detail
                    max_new_tokens: type === 'narrative' ? 900 : 600,  // Ensure substantial new content generation
                    temperature: 0.85 + (attempt * 0.05),   // Slightly more focused but still creative
                    top_p: 0.92,        // Balanced vocabulary diversity
                    repetition_penalty: 1.15,  // Moderate repetition control
                    do_sample: true,
                    min_length: type === 'narrative' ? 300 : 250,  // Higher minimum for more descriptive content
                    pad_token_id: 50256
                });

                const processed = this.postProcessStoryResponse(response, type);
                
                // If processed response is too short, try again with different prompt
                if (processed && processed.length < 300 && attempt < maxAttempts - 1) {
                    console.log('🤗 Response too short (' + processed.length + ' chars), retrying with enhanced prompt...');
                    attempt++;
                    continue;
                }
                
                console.log('🤗 Generated story length:', processed.length, 'characters');
                return processed;

            } catch (error) {
                console.error('🤗 STORY GENERATION FAILED on attempt', attempt + 1, ':', error);
                attempt++;
                if (attempt >= maxAttempts) {
                    return this.getFallbackResponse(type);
                }
            }
        }
        
        return this.getFallbackResponse(type);
    }

    async generateChoices(context, characterData = null, settingData = null) {
        console.log('🤗 GENERATING CHOICES');
        
        try {
            const cleanContext = this.cleanContext(context);
            
            // Build enhanced context with character and setting information
            const enhancedContext = this.buildEnhancedContext(cleanContext, characterData, settingData);
            
            const prompt = `You are a masterful D&D dungeon master with a gift for creating compelling action choices that make players excited to roll dice. The current situation is:

${enhancedContext}

Create exactly 4 diverse, atmospheric action choices that capture the essence of great D&D gameplay. Each choice should:

🎲 DICE ANTICIPATION: Clearly suggest what exciting dice rolls might be needed (Athletics for climbing, Stealth for sneaking, Persuasion for talking, Investigation for searching, etc.)

⚔️ STRATEGIC VARIETY: Represent fundamentally different D&D approaches:
   - Combat/Direct Action (for the bold warrior types)
   - Stealth/Subterfuge (for the sneaky rogue types) 
   - Social/Diplomatic (for the charismatic leader types)
   - Magic/Investigation (for the clever scholar types)

🌟 VIVID IMAGERY: Use descriptive language that helps players visualize exactly what their character would be doing

🎯 HEROIC POTENTIAL: Make each option sound like it could lead to an epic, memorable moment worthy of retelling

📚 ATMOSPHERIC DETAIL: Include environmental elements or sensory details that enhance immersion

🎭 CHARACTER AGENCY: Ensure each choice gives the player meaningful control over the story direction

Remember: Great D&D choices make players lean forward with anticipation, excited to see what their dice will decide!

Format as a numbered list with rich, evocative descriptions (20-40 words each):

1. `;

            console.log('🤗 Using enhanced choice prompt:', prompt.substring(0, 100) + '...');

            const response = await this.makeRequest(prompt, {
                max_length: 400,  // Increased for more detailed choices
                temperature: 0.8,  // Good creativity for varied choices
                top_p: 0.9,
                repetition_penalty: 1.3,  // Ensure strong variety between choices
                do_sample: true,
                min_length: 200  // Ensure substantial choice descriptions
            });

            const choices = this.parseChoices(response);
            console.log('🤗 Generated choices:', choices.map(c => `${c.length} chars`));
            return choices;

        } catch (error) {
            console.error('🤗 CHOICE GENERATION FAILED:', error);
            return this.getFallbackChoices();
        }
    }
    
    cleanContext(context) {
        if (!context) return "A mysterious adventure begins...";
        
        // Remove meta-instructions that might confuse the AI
        let cleaned = context
            .replace(/generate|create|make|provide/gi, '')
            .replace(/action choices|choice options/gi, '')
            .replace(/story|narrative/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
            
        // Ensure we have content
        if (cleaned.length < 10) {
            cleaned = "A mysterious adventure unfolds in a fantasy realm...";
        }
        
        return cleaned;
    }

    postProcessStoryResponse(response, type) {
        if (!response) return this.getFallbackResponse(type);

        console.log('🤗 Processing response length:', response.length);
        
        // Clean up the response for RPG storytelling
        let cleaned = response
            .replace(/^\s*[\[\]\(\)]*\s*/, '') // Remove leading brackets
            .replace(/\s*[\[\]\(\)]*\s*$/, '') // Remove trailing brackets
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
            .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
            .trim();

        // Remove meta-commentary that AI might add
        cleaned = cleaned
            .replace(/^(Here's|Here is|This is|Let me|I'll|The story continues|Continue|Next|Story continuation:|Detailed story continuation:)/i, '')
            .replace(/^(You are|You're|The player|The character)/i, 'You')
            .replace(/\b(story|narrative|text|response|output)\b/gi, 'tale')
            .trim();

        // More lenient minimum length for quality (but ensure reasonable length)
        if (cleaned.length < 50) {
            console.log('🤗 Response too short, using fallback. Length:', cleaned.length);
            return this.getFallbackResponse(type);
        }

        // If response is shorter than 200 characters, try to extend it
        if (cleaned.length < 200) {
            console.log('🤗 Response shorter than target (200 chars), but acceptable. Length:', cleaned.length);
            // Don't reject, but log for monitoring
        }

        // Capitalize first letter and ensure proper punctuation
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        
        // Check if response ends with a question or engaging prompt
        const hasQuestion = /\?$/.test(cleaned);
        const hasEngagingEnd = /\b(what do you|how do you|which|where do you|will you|do you|can you|would you)\b/i.test(cleaned.slice(-50));
        
        if (!hasQuestion && !hasEngagingEnd) {
            // Add an engaging D&D-style question based on the content and context
            const questionOptions = [
                " What do you do?",
                " How do you proceed?", 
                " What is your next move?",
                " Which path will you take?",
                " How do you respond?",
                " What action do you take?",
                " Roll for initiative - what's your plan?",
                " Time to make a choice - what do you decide?"
            ];
            
            // Choose question based on content with D&D flavor
            let selectedQuestion;
            if (cleaned.includes('path') || cleaned.includes('direction') || cleaned.includes('way')) {
                selectedQuestion = " Which path will you take?";
            } else if (cleaned.includes('approach') || cleaned.includes('near') || cleaned.includes('ahead')) {
                selectedQuestion = " How do you proceed?";
            } else if (cleaned.includes('danger') || cleaned.includes('threat') || cleaned.includes('enemy') || cleaned.includes('combat')) {
                selectedQuestion = " What action do you take?";
            } else if (cleaned.includes('speaks') || cleaned.includes('says') || cleaned.includes('voice') || cleaned.includes('NPC')) {
                selectedQuestion = " How do you respond?";
            } else if (cleaned.includes('roll') || cleaned.includes('check') || cleaned.includes('dice')) {
                selectedQuestion = " What's your next move?";
            } else {
                // Random selection for other cases
                selectedQuestion = questionOptions[Math.floor(Math.random() * questionOptions.length)];
            }
            
            // Remove existing period if present and add question
            cleaned = cleaned.replace(/\.$/, '') + selectedQuestion;
        } else if (!/[.!?]$/.test(cleaned)) {
            // Add appropriate ending based on content if no punctuation
            if (cleaned.includes('?') || cleaned.toLowerCase().includes('what') || cleaned.toLowerCase().includes('how')) {
                cleaned += '?';
            } else if (cleaned.includes('!') || cleaned.toLowerCase().includes('suddenly') || cleaned.toLowerCase().includes('danger')) {
                cleaned += '!';
            } else {
                cleaned += '.';
            }
        }

        // Enhanced D&D content check - accept if it has RPG/fantasy elements including dice mechanics
        const hasRpgElements = cleaned.match(/\b(you|your|the|a|an|roll|dice|check|skill|ability|strength|dexterity|constitution|intelligence|wisdom|charisma|perception|investigation|stealth|athletics|persuasion|deception|intimidation|insight|ancient|mystical|chamber|path|adventure|magic|dragon|sword|crystal|temple|forest|cave|treasure|quest|danger|shadow|light|power|stone|door|corridor|room|hall|stairs|wall|ground|air|darkness|bright|dim|glow|sound|voice|whisper|echo|wind|water|fire|cold|warm|feel|see|hear|smell|taste|move|walk|step|turn|look|find|discover|reveal|hidden|secret|mysterious|strange|eerie|ominous|peaceful|quiet|loud|distant|near|far|high|low|deep|wide|narrow|long|short|old|new|ancient|modern|magical|enchanted|cursed|blessed|sacred|evil|good|dark|bright|character|player|dungeon|master|DM|initiative|combat|spell|weapon|armor|shield|potion|scroll)\b/i);
        
        if (!hasRpgElements) {
            console.log('🤗 Response lacks RPG elements, using fallback');
            return this.getFallbackResponse(type);
        }

        console.log('🤗 Final processed response length:', cleaned.length);
        return cleaned;
    }

    parseChoices(response) {
        if (!response) return this.getFallbackChoices();

        console.log('🤗 Parsing choices from:', response);

        // Try to extract choices from response
        const lines = response.split('\n').filter(line => line.trim());
        const choices = [];

        for (let line of lines) {
            // Clean up choice line
            let choice = line
                .replace(/^\d+\.?\s*/, '') // Remove numbering
                .replace(/^[-*]\s*/, '') // Remove bullet points
                .replace(/^[A-Za-z]\)\s*/, '') // Remove letter numbering
                .replace(/^["']|["']$/g, '') // Remove quotes
                .trim();

            // Skip empty or too short choices
            if (choice && choice.length > 5 && choice.length < 100) {
                // Ensure choice starts with action verb
                if (!choice.match(/^(attack|investigate|examine|approach|search|use|cast|climb|open|follow|enter|speak|listen|hide|run|wait|rest|defend|dodge|block|parry|sneak|steal|buy|sell|talk|ask|tell|give|take|drop|pick|look|move|go|walk|try|attempt)/i)) {
                    // Add action verb if missing
                    if (choice.match(/^(the|a|an|your)/i)) {
                        choice = 'Examine ' + choice.toLowerCase();
                    } else if (!choice.match(/^[A-Z]/)) {
                        choice = 'Try to ' + choice.toLowerCase();
                    }
                }
                
                // Capitalize first letter
                choice = choice.charAt(0).toUpperCase() + choice.slice(1);
                choices.push(choice);
            }

            if (choices.length >= 4) break;
        }

        // Fill with fallback choices if needed
        const fallbacks = this.getFallbackChoices();
        while (choices.length < 4) {
            if (choices.length < fallbacks.length) {
                choices.push(fallbacks[choices.length]);
            } else {
                choices.push('Consider your options carefully');
                break;
            }
        }

        return choices.slice(0, 4);
    }

    getFallbackResponse(type) {
        console.log('🤗 Using fallback response for type:', type);
        
        const fallbacks = {
            narrative: [
                "The ancient stones beneath your feet seem to whisper secrets as you pause, your breath creating small clouds in the cool, musty air. Your keen senses pick up the subtle dance of shadows cast by flickering torchlight - each movement revealing new textures in the weathered walls around you. A Perception check reveals that the faint echo of your footsteps suggests a vast chamber lies ahead, while the air carries hints of aged parchment and something metallic... perhaps copper or old blood. The weight of adventure presses against your shoulders like an invisible cloak. What do you choose to do in this moment pregnant with possibility?",
                
                "Time seems to slow as your character draws upon years of hard-won experience, muscles tensed and ready for action. The environment around you pulses with potential - every shadow could hide treasure or danger, every sound might herald friend or foe. Your Investigation check might uncover crucial details about the ornate carvings on the nearby walls, while your battle-honed Insight whispers that multiple paths forward exist, each with its own risks and rewards. The very air crackles with the electricity of impending adventure. How do you choose to proceed through this crossroads of fate?",

                "The dice of destiny have rolled you to this pivotal moment in your tale, where heroes are forged and legends begin. Your weathered hands tighten around familiar gear as you survey the scene - torchlight dancing across surfaces that have witnessed countless stories, the taste of anticipation sharp on your tongue. This feels like one of those moments where a crucial Wisdom saving throw might be needed, or perhaps where those carefully hoarded abilities could turn the tide of your entire adventure. The silence stretches like a held breath, waiting for your next move. What decisive action do you take to shape your destiny?"
            ],
            
            character: [
                "A figure emerges from the interplay of light and shadow, their footsteps creating a rhythm that speaks neither of hostility nor friendship - simply the measured pace of someone who has stories to tell. Your sharp Insight check suggests they're another complex soul navigating this intricate tapestry of adventure, their weathered clothing and knowing eyes hinting at experience both bitter and sweet. The air between you crackles with potential - this seems like a perfect moment for your social skills to shine, whether through silver-tongued Persuasion, clever Deception, or commanding Intimidation. The encounter feels ripe with possibility. How do you choose to engage with this mysterious figure?",

                "An intriguing NPC materializes in your path like a character from a well-loved story, their presence immediately shifting the energy of the scene. They carry themselves with the quiet confidence of someone who has learned to read situations quickly, and their eyes hold that particular gleam that suggests they've noticed you long before you spotted them. This moment practically calls for roleplay - perhaps a Charisma check to create a memorable first impression, or an Investigation check to discern their true intentions before committing to an approach. The scene awaits your choice like an unwritten page. What's your opening move in this dance of personalities?"
            ],
            
            choice: [
                "Multiple pathways stretch before you like the branching corridors of an ancient dungeon, each one practically humming with the promise of different dice rolls and distinct adventures. The rough stone path to your left whispers of Athletics checks and physical challenges, while the shadow-draped passage to your right suggests opportunities for Stealth and subterfuge. Straight ahead, intricate symbols carved into weathered stone hint at mysteries that would reward Investigation and scholarly pursuits. Your character's unique strengths could truly shine in any direction - the question is which path calls most strongly to your adventurous heart? Where do you direct your steps?",

                "The classic D&D crossroads spreads before you like a master's carefully crafted encounter, each option gleaming with different risk-reward scenarios that could become legendary moments in your adventure. You could embrace the warrior's direct approach - perhaps an Athletics check to overcome physical obstacles or a bold Combat encounter to test your mettle. Alternatively, the rogue's path beckons with opportunities for Sleight of Hand or Stealth, while the social character might find success through silver-tongued Persuasion or clever Deception. And then there's always the wild card - creative use of magic, tools, or pure improvisation that makes D&D sessions truly memorable. The dice are ready to sing their song of chance and skill. What strategy captures your imagination?"
            ]
        };

        // Get random fallback from the appropriate category
        const fallbackArray = fallbacks[type] || fallbacks.narrative;
        const randomIndex = Math.floor(Math.random() * fallbackArray.length);
        const selectedFallback = fallbackArray[randomIndex];
        
        console.log('🤗 Fallback response length:', selectedFallback.length, 'characters');
        return selectedFallback;
    }

    getFallbackChoices() {
        return [
            "Investigate the scene thoroughly with a keen Perception check, studying every shadow and detail for hidden clues or potential dangers",
            "Approach with confident determination, ready to roll Initiative if the situation escalates into combat or requires quick reflexes", 
            "Use masterful Stealth to scout ahead unseen, gathering intelligence while remaining hidden in the shadows like a ghost",
            "Think creatively and employ your character's unique abilities in an innovative way that reflects their personality and specialized skills"
        ];
    }

    // Check if HuggingFace service is available
    async isServiceAvailable() {
        try {
            const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
                method: 'HEAD'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Make available globally
window.HuggingFaceAI = HuggingFaceAI;
