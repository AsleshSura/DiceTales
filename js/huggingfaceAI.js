/**
 * HuggingFace AI Service
 * Free AI models with no API key required!
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
        
        // RPG-optimized prompts with proper instruction formatting
        this.storyPrompts = {
            narrative: `You are a masterful dungeon master telling an epic fantasy story. Continue this adventure with vivid imagery and engaging narrative. Write 2-3 sentences that advance the story:

Context: `,
            
            choice: `You are a dungeon master creating action choices for a fantasy RPG. Based on the current situation, provide exactly 4 distinct, creative action options. Format as a numbered list:

Situation: `,
            
            character: `You are describing an encounter in a fantasy RPG. Create an atmospheric description of this character meeting. Focus on mood and tension:

Scene: `
        };

        this.init();
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

    async generateStory(context, type = 'narrative') {
        console.log('🤗 GENERATING STORY:', type);
        
        let attempt = 0;
        const maxAttempts = 2;
        
        while (attempt < maxAttempts) {
            try {
                // Clean and prepare the context
                const cleanContext = this.cleanContext(context);
                
                // Build enhanced RPG-optimized prompt for longer responses
                let promptTemplate = this.storyPrompts[type] || this.storyPrompts.narrative;
                let fullPrompt;
                
                if (type === 'narrative') {
                    fullPrompt = `${promptTemplate}${cleanContext}

Current adventure: ${cleanContext}

As an expert dungeon master, continue this epic fantasy story with a rich, detailed narrative of at least 200 characters. Your response must include:

1. VIVID ENVIRONMENTAL DETAILS: Describe what the character sees, hears, smells, and feels in the scene
2. ATMOSPHERIC TENSION: Build suspense, mystery, or excitement appropriate to the situation  
3. STORY PROGRESSION: Advance the plot with new discoveries, encounters, or developments
4. SENSORY IMMERSION: Include specific details about lighting, sounds, textures, temperatures
5. CHARACTER AGENCY: Set up clear opportunities for the player to make meaningful choices

Write your response as if you're narrating an immersive fantasy novel. Make it atmospheric, engaging, and detailed. Minimum 200 characters required.

IMPORTANT: Your response MUST end with a direct question or present a clear decision point for the player. Examples:
- "What do you do?"
- "How do you proceed?"
- "Which path will you choose?"
- "What is your next move?"

Detailed story continuation:`;
                } else if (type === 'character') {
                    fullPrompt = `${promptTemplate}${cleanContext}

Create a detailed encounter description with rich atmosphere and character details. Include physical appearance, mannerisms, environment, and mood. Make it vivid and immersive. Minimum 150 characters required.

IMPORTANT: End with a question about how the player responds to this encounter.

Detailed encounter:`;
                } else {
                    fullPrompt = `${promptTemplate}${cleanContext}

Continue this fantasy adventure with rich, detailed descriptions that paint a vivid picture. Include environmental details, atmospheric elements, and story progression. Minimum 200 characters required.

IMPORTANT: Your response must end with a question or choice for the player.

Detailed continuation:`;
                }
                
                console.log('🤗 Using enhanced prompt:', fullPrompt.substring(0, 150) + '...');
                
                const response = await this.makeRequest(fullPrompt, {
                    max_length: type === 'narrative' ? 800 : 500,  // Significantly increased
                    max_new_tokens: type === 'narrative' ? 600 : 400,  // Ensure new content generation
                    temperature: 0.9 + (attempt * 0.05),   // Increase creativity on retries
                    top_p: 0.95,        // More diverse vocabulary
                    repetition_penalty: 1.1,  // Reduced to allow natural repetition
                    do_sample: true,
                    min_length: type === 'narrative' ? 200 : 150,  // Minimum length requirement
                    pad_token_id: 50256
                });

                const processed = this.postProcessStoryResponse(response, type);
                
                // If processed response is too short, try again with different prompt
                if (processed && processed.length < 200 && attempt < maxAttempts - 1) {
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

    async generateChoices(context) {
        console.log('🤗 GENERATING CHOICES');
        
        try {
            const cleanContext = this.cleanContext(context);
            
            const prompt = `You are an expert dungeon master creating action choices for an epic fantasy RPG. The player faces this situation:

${cleanContext}

Generate exactly 4 diverse, detailed action choices. Each choice should be:
- 15-30 words long with specific details
- Represent different approaches (combat, stealth, magic, social, investigation)
- Start with a clear action verb
- Include tactical considerations or interesting consequences

Format as numbered list:

1. Attack`;

            console.log('🤗 Using enhanced choice prompt:', prompt.substring(0, 100) + '...');

            const response = await this.makeRequest(prompt, {
                max_length: 250,  // Increased for longer choices
                temperature: 0.75,  // Balanced creativity for choices
                top_p: 0.88,
                repetition_penalty: 1.25,  // Ensure variety
                do_sample: true
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
            // Add an engaging question based on the content and context
            const questionOptions = [
                " What do you do?",
                " How do you proceed?", 
                " What is your next move?",
                " Which path will you take?",
                " How do you respond?",
                " What action do you take?",
                " What will you do next?",
                " How do you handle this situation?"
            ];
            
            // Choose question based on content
            let selectedQuestion;
            if (cleaned.includes('path') || cleaned.includes('direction') || cleaned.includes('way')) {
                selectedQuestion = " Which path will you take?";
            } else if (cleaned.includes('approach') || cleaned.includes('near') || cleaned.includes('ahead')) {
                selectedQuestion = " How do you proceed?";
            } else if (cleaned.includes('danger') || cleaned.includes('threat') || cleaned.includes('enemy')) {
                selectedQuestion = " What action do you take?";
            } else if (cleaned.includes('speaks') || cleaned.includes('says') || cleaned.includes('voice')) {
                selectedQuestion = " How do you respond?";
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

        // More lenient RPG content check - accept if it has basic adventure elements
        const hasRpgElements = cleaned.match(/\b(you|your|the|a|an|ancient|mystical|chamber|path|adventure|magic|dragon|sword|crystal|temple|forest|cave|treasure|quest|danger|shadow|light|power|stone|door|corridor|room|hall|stairs|wall|ground|air|darkness|bright|dim|glow|sound|voice|whisper|echo|wind|water|fire|cold|warm|feel|see|hear|smell|taste|move|walk|step|turn|look|find|discover|reveal|hidden|secret|mysterious|strange|eerie|ominous|peaceful|quiet|loud|distant|near|far|high|low|deep|wide|narrow|long|short|old|new|ancient|modern|magical|enchanted|cursed|blessed|sacred|evil|good|dark|bright)\b/i);
        
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
                "You find yourself in a mysterious location. The air feels different here, charged with possibility. You notice details that weren't there before - a distant sound, shifting shadows, or perhaps a faint scent on the breeze. Something has changed, and it's time to decide your next move. What do you do?",
                
                "The path ahead is unclear, but you sense opportunity. Your surroundings offer several possibilities - you could explore further, rest and observe, or try a completely different approach. The choice is yours, and each option could lead to something unexpected. How do you proceed?",

                "A moment of quiet settles around you, giving you time to think. The situation has shifted, and new possibilities have emerged. You feel that whatever you do next could be significant to your journey. What action do you take?"
            ],
            
            character: [
                "A figure approaches from the shadows. They seem neither threatening nor completely friendly - just... present. Their eyes show curiosity about you, and they appear to be waiting for some kind of response. How do you react?",

                "Someone new has entered the scene. Their intentions aren't immediately clear, but they've noticed you and seem interested in what you're doing here. The next move appears to be yours. What do you say or do?"
            ],
            
            choice: [
                "Several paths lie before you. Each one offers its own potential rewards and risks. You'll need to choose carefully - your decision here could shape what happens next. Which direction calls to you?",

                "The situation presents multiple options. You could take the direct approach, try something more subtle, or find a completely different solution. What's your strategy?"
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
            "Investigate the mysterious object ahead",
            "Approach cautiously and observe",
            "Search for an alternative path",
            "Use your special abilities"
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
