/**
 * DiceTales - DM Response Evaluator
 * System to score and improve AI responses to feel more like a human Dungeon Master
 */

class DMEvaluator {
    constructor() {
        this.evaluationCriteria = {
            immersion: {
                weight: 0.25,
                name: "Immersion & Atmosphere",
                description: "Rich sensory details, vivid descriptions, world-building"
            },
            personality: {
                weight: 0.20,
                name: "DM Personality",
                description: "Human-like warmth, enthusiasm, unique voice"
            },
            engagement: {
                weight: 0.20,
                name: "Player Engagement", 
                description: "Specific story developments, concrete events, avoiding open-ended questions"
            },
            flow: {
                weight: 0.15,
                name: "Narrative Flow",
                description: "Natural transitions, pacing, story coherence"
            },
            authenticity: {
                weight: 0.10,
                name: "D&D Authenticity",
                description: "Rules knowledge, genre conventions, terminology"
            },
            creativity: {
                weight: 0.10,
                name: "Creative Flair",
                description: "Unexpected twists, memorable NPCs, unique situations"
            }
        };

        this.responseHistory = [];
        this.maxHistorySize = 50;
        this.averageScore = 0;
        this.improvementThreshold = 6.5; // Out of 10
        this.iterationCount = 0;
    }

    /**
     * Evaluate a DM response and return a detailed score
     */
    evaluateResponse(response, context = {}) {
        const evaluation = {
            response: response,
            context: context,
            timestamp: Date.now(),
            scores: {},
            totalScore: 0,
            feedback: {},
            suggestions: []
        };

        // Evaluate each criteria
        evaluation.scores.immersion = this.scoreImmersion(response);
        evaluation.scores.personality = this.scorePersonality(response);
        evaluation.scores.engagement = this.scoreEngagement(response);
        evaluation.scores.flow = this.scoreFlow(response, context);
        evaluation.scores.authenticity = this.scoreAuthenticity(response);
        evaluation.scores.creativity = this.scoreCreativity(response);

        // Calculate weighted total score
        evaluation.totalScore = Object.entries(this.evaluationCriteria).reduce((total, [key, criteria]) => {
            return total + (evaluation.scores[key] * criteria.weight * 10);
        }, 0);

        // Generate feedback
        evaluation.feedback = this.generateFeedback(evaluation.scores);
        evaluation.suggestions = this.generateSuggestions(evaluation.scores, response);

        // Store in history
        this.addToHistory(evaluation);

        return evaluation;
    }

    /**
     * Score immersion and atmosphere (0-1)
     */
    scoreImmersion(response) {
        let score = 0.5; // Base score

        // PENALIZE overly flowery/cliché language heavily
        const clichePhrases = /\b(tapestry|woven|shimmer|possibilities|potential|legendary tales|cosmic horror|forbidden knowledge|ancient mysteries|intricate|unfold|calls to your|adventurous spirit|perfect moment|unique abilities|shine)\b/gi;
        const clicheMatches = (response.match(clichePhrases) || []).length;
        score -= Math.min(clicheMatches * 0.15, 0.6); // Heavy penalty for clichés

        // PENALIZE purple prose and overwrought descriptions
        const purpleProse = /\b(practically hums|shimmering with|woven from|stretches before you like|each thread|could unfold into)\b/gi;
        const purpleMatches = (response.match(purpleProse) || []).length;
        score -= Math.min(purpleMatches * 0.2, 0.5); // Even heavier penalty

        // REWARD simple, clear sensory details
        const simpleSensory = /\b(you hear|you smell|you feel|you see|cold|warm|loud|quiet|bright|dark|rough|smooth)\b/gi;
        const sensoryMatches = (response.match(simpleSensory) || []).length;
        score += Math.min(sensoryMatches * 0.08, 0.3);

        // REWARD natural, conversational descriptions
        const naturalLanguage = /\b(there's|it's|you notice|looks like|sounds like|feels like)\b/gi;
        const naturalMatches = (response.match(naturalLanguage) || []).length;
        score += Math.min(naturalMatches * 0.05, 0.15);

        // PENALIZE overly long, run-on sentences
        const sentences = response.split(/[.!?]+/);
        const longSentences = sentences.filter(s => s.split(' ').length > 25).length;
        score -= Math.min(longSentences * 0.1, 0.3);

        return Math.min(Math.max(score, 0), 1);
    }

    /**
     * Score DM personality and human-like qualities (0-1)
     */
    scorePersonality(response) {
        let score = 0.4; // Base score

        // PENALIZE artificial, overly formal language
        const artificialPhrases = /\b(furthermore|subsequently|magnificent tapestry|intricate weaving|shimmering possibilities|calls to your|adventurous spirit|legendary tales)\b/gi;
        const artificialMatches = (response.match(artificialPhrases) || []).length;
        score -= Math.min(artificialMatches * 0.2, 0.6);

        // REWARD natural, conversational touches
        const naturalPhrases = /\b(hey|well|okay|alright|huh|whoa|damn|shit|oh man|that's|there's|it's|you're|can't|won't|don't)\b/gi;
        const naturalMatches = (response.match(naturalPhrases) || []).length;
        score += Math.min(naturalMatches * 0.1, 0.3);

        // REWARD simple enthusiasm markers
        const simpleEnthusiasm = /\b(nice|cool|awesome|great|oh|ah|wow|yikes|uh oh)\b/gi;
        const enthusiasmMatches = (response.match(simpleEnthusiasm) || []).length;
        score += Math.min(enthusiasmMatches * 0.12, 0.25);

        // PENALIZE overly dramatic language
        const dramaticOveruse = /\b(cosmic|eldritch|legendary|magnificent|intricate|shimmering|forbidden|ancient mysteries|epic)\b/gi;
        const dramaticMatches = (response.match(dramaticOveruse) || []).length;
        score -= Math.min(dramaticMatches * 0.15, 0.5);

        // REWARD direct, simple communication
        if (response.length < 300 && response.length > 50) score += 0.1; // Reward conciseness
        
        // REWARD contractions and casual language
        const contractions = /\b(you're|it's|that's|there's|can't|won't|don't|isn't|aren't)\b/gi;
        const contractionMatches = (response.match(contractions) || []).length;
        score += Math.min(contractionMatches * 0.05, 0.15);

        return Math.min(Math.max(score, 0), 1);
    }

    /**
     * Score player engagement (0-1)
     */
    scoreEngagement(response) {
        let score = 0.3; // Base score

        // PENALIZE open-ended questions heavily
        const openEndedPhrases = /\b(what do you|what would you|what will you|what are you|how do you|where do you|what's your next|what is your next)\b/gi;
        const openEndedMatches = (response.match(openEndedPhrases) || []).length;
        score -= openEndedMatches * 0.3; // Heavy penalty

        // PENALIZE generic endings
        const vagueEndings = /\b(what do you do|what would you like to do|what's next|what now|your choice|up to you|decide|choose what)\b/gi;
        const vagueMatches = (response.match(vagueEndings) || []).length;
        score -= vagueMatches * 0.4; // Even heavier penalty

        // REWARD specific story developments
        const specificDevelopments = /\b(suddenly|immediately|just then|at that moment|without warning|as you watch|before you can react|in response)\b/gi;
        const specificMatches = (response.match(specificDevelopments) || []).length;
        score += Math.min(specificMatches * 0.15, 0.3);

        // REWARD concrete actions happening
        const concreteActions = /\b(the door opens|footsteps approach|a voice calls|light appears|ground shakes|wind picks up|something moves)\b/gi;
        const concreteMatches = (response.match(concreteActions) || []).length;
        score += Math.min(concreteMatches * 0.1, 0.2);

        // REWARD definitive story progression
        const storyProgression = /\b(reveals|discovers|encounters|finds|notices|hears|sees|feels) (something|someone|a)\b/gi;
        const progressionMatches = (response.match(storyProgression) || []).length;
        score += Math.min(progressionMatches * 0.08, 0.15);

        return Math.min(Math.max(score, 0), 1);
    }

    /**
     * Score narrative flow (0-1)
     */
    scoreFlow(response, context) {
        let score = 0.5; // Base score

        // Check for transition words
        const transitions = /\b(as|while|meanwhile|suddenly|then|now|after|before|during)\b/gi;
        const transitionMatches = (response.match(transitions) || []).length;
        score += Math.min(transitionMatches * 0.05, 0.2);

        // Check length appropriateness
        const wordCount = response.split(' ').length;
        if (wordCount >= 50 && wordCount <= 200) score += 0.2;
        else if (wordCount < 30) score -= 0.2;

        // Check for story coherence (avoid repetitive phrases)
        const sentences = response.split(/[.!?]+/);
        const uniqueSentenceStarts = new Set(sentences.map(s => s.trim().split(' ')[0]?.toLowerCase()));
        if (uniqueSentenceStarts.size / sentences.length > 0.7) score += 0.1;

        return Math.min(Math.max(score, 0), 1);
    }

    /**
     * Score D&D authenticity (0-1)
     */
    scoreAuthenticity(response) {
        let score = 0.6; // Base score

        // Check for D&D terminology
        const dndTerms = /\b(roll|check|save|AC|HP|damage|spell|magic|adventure|quest|dungeon|dragon|tavern|guild)\b/gi;
        const dndMatches = (response.match(dndTerms) || []).length;
        score += Math.min(dndMatches * 0.05, 0.2);

        // Check for appropriate fantasy elements
        const fantasyTerms = /\b(magic|spell|sword|shield|armor|potion|scroll|crystal|ancient|mystical)\b/gi;
        if ((response.match(fantasyTerms) || []).length > 0) score += 0.1;

        // Penalize modern references
        const modernTerms = /\b(phone|car|computer|internet|email|website|app|digital)\b/gi;
        if ((response.match(modernTerms) || []).length > 0) score -= 0.3;

        return Math.min(Math.max(score, 0), 1);
    }

    /**
     * Score creativity and originality (0-1)
     */
    scoreCreativity(response) {
        let score = 0.4; // Base score

        // Check for unique details
        const uniqueWords = /\b(shimmering|crystalline|ethereal|luminous|peculiar|extraordinary|enigmatic)\b/gi;
        const uniqueMatches = (response.match(uniqueWords) || []).length;
        score += Math.min(uniqueMatches * 0.1, 0.2);

        // Check for dialogue or character voice
        if (response.includes('"') || response.includes("'")) score += 0.15;

        // Check for unexpected elements
        const surpriseWords = /\b(unexpected|surprising|peculiar|odd|strange|unusual|remarkable)\b/gi;
        if ((response.match(surpriseWords) || []).length > 0) score += 0.1;

        // Bonus for specific details over generic descriptions
        const specificDetails = response.match(/\b\d+\b/g) || []; // Numbers suggest specificity
        score += Math.min(specificDetails.length * 0.02, 0.1);

        return Math.min(score, 1);
    }

    /**
     * Generate detailed feedback based on scores
     */
    generateFeedback(scores) {
        const feedback = {};
        
        Object.entries(scores).forEach(([category, score]) => {
            const criteria = this.evaluationCriteria[category];
            if (score >= 0.8) {
                feedback[category] = `Excellent ${criteria.name.toLowerCase()}! Really captures the DM feel.`;
            } else if (score >= 0.6) {
                feedback[category] = `Good ${criteria.name.toLowerCase()}, could be enhanced further.`;
            } else if (score >= 0.4) {
                feedback[category] = `Average ${criteria.name.toLowerCase()}, needs improvement.`;
            } else {
                feedback[category] = `Weak ${criteria.name.toLowerCase()}, requires significant enhancement.`;
            }
        });

        return feedback;
    }

    /**
     * Generate specific suggestions for improvement
     */
    generateSuggestions(scores, response) {
        const suggestions = [];

        if (scores.immersion < 0.6) {
            suggestions.push("AVOID cliché phrases like 'tapestry', 'shimmering', 'cosmic', 'intricate', 'legendary tales'");
            suggestions.push("Use simple, clear descriptions instead of purple prose");
            suggestions.push("Say 'it's dark' instead of 'darkness shrouds the area like velvet'");
            suggestions.push("Keep sentences under 25 words and descriptions conversational");
        }

        if (scores.personality < 0.6) {
            suggestions.push("Use natural, casual language with contractions (you're, it's, that's)");
            suggestions.push("Talk like a real person, not a fantasy novelist");
            suggestions.push("Use simple enthusiasm: 'Cool!', 'Nice!', 'Oh shit!' instead of 'Magnificent!'");
            suggestions.push("Keep responses under 200 words when possible");
        }

        if (scores.engagement < 0.6) {
            suggestions.push("AVOID open-ended questions like 'What do you do?' - instead describe what happens next");
            suggestions.push("End with specific story developments, discoveries, or events occurring");
            suggestions.push("Drive the plot forward with concrete actions rather than asking for player input");
            suggestions.push("Use definitive storytelling: 'As you step forward, the door suddenly creaks open...'");
        }

        if (scores.flow < 0.6) {
            suggestions.push("Use better transition words between scenes");
            suggestions.push("Adjust response length for better pacing");
            suggestions.push("Vary sentence structure and openings");
        }

        if (scores.authenticity < 0.6) {
            suggestions.push("Include more D&D-appropriate terminology and references");
            suggestions.push("Enhance fantasy atmosphere with genre-appropriate elements");
        }

        if (scores.creativity < 0.6) {
            suggestions.push("Add unique, memorable details that stand out");
            suggestions.push("Include dialogue or character voice elements");
            suggestions.push("Introduce unexpected but logical story elements");
        }

        return suggestions;
    }

    /**
     * Add evaluation to history and update averages
     */
    addToHistory(evaluation) {
        this.responseHistory.push(evaluation);
        
        if (this.responseHistory.length > this.maxHistorySize) {
            this.responseHistory.shift();
        }

        // Update running average
        this.averageScore = this.responseHistory.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / this.responseHistory.length;
    }

    /**
     * Get improvement recommendations for the AI system
     */
    getSystemImprovements() {
        if (this.responseHistory.length < 5) {
            return { needsMoreData: true };
        }

        const recentEvaluations = this.responseHistory.slice(-10);
        const categoryAverages = {};

        // Calculate category averages
        Object.keys(this.evaluationCriteria).forEach(category => {
            categoryAverages[category] = recentEvaluations.reduce((sum, evaluation) =>
                sum + evaluation.scores[category], 0) / recentEvaluations.length;
        });        // Find weakest areas
        const weakestAreas = Object.entries(categoryAverages)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 2)
            .map(([category, score]) => ({
                category,
                score,
                criteria: this.evaluationCriteria[category]
            }));

        return {
            averageScore: this.averageScore,
            needsImprovement: this.averageScore < this.improvementThreshold,
            weakestAreas,
            categoryAverages,
            recommendedActions: this.getRecommendedActions(categoryAverages)
        };
    }

    /**
     * Get specific actions to improve the AI system
     */
    getRecommendedActions(categoryAverages) {
        const actions = [];

        if (categoryAverages.personality < 0.6) {
            actions.push({
                type: 'prompt_enhancement',
                priority: 'high',
                description: 'Enhance system prompt with more human-like DM personality traits',
                implementation: 'Add enthusiasm markers, conversational tone, personal touches'
            });
        }

        if (categoryAverages.immersion < 0.6) {
            actions.push({
                type: 'sensory_enhancement',
                priority: 'high', 
                description: 'Improve sensory detail generation in responses',
                implementation: 'Add specific prompts for sights, sounds, smells, textures'
            });
        }

        if (categoryAverages.engagement < 0.6) {
            actions.push({
                type: 'interaction_improvement',
                priority: 'medium',
                description: 'Enhance player engagement mechanics',
                implementation: 'Add more questions, hooks, and choice implications'
            });
        }

        return actions;
    }

    /**
     * Generate an improved system prompt based on evaluation history
     */
    generateImprovedSystemPrompt(basePrompt, settingData = {}) {
        const improvements = this.getSystemImprovements();
        
        if (improvements.needsMoreData) {
            return basePrompt; // Not enough data to improve yet
        }

        let enhancedPrompt = basePrompt;

        // Add personality enhancements if needed
        if (improvements.categoryAverages.personality < 0.6) {
            enhancedPrompt += `

🎭 ENHANCED DM PERSONALITY:
- Use enthusiastic, warm language with natural exclamations ("Ah!", "Oh!", "Excellent!", "Perfect!")
- Include personal touches and conversational elements ("Well now...", "I see...", "Interesting...")
- Show genuine excitement about the story and player choices
- Use pauses and emphasis for dramatic effect ("...and then..." "But wait...")
- Be encouraging and supportive like a friend running the game`;
        }

        // Add immersion enhancements if needed
        if (improvements.categoryAverages.immersion < 0.6) {
            enhancedPrompt += `

🌟 ENHANCED IMMERSION REQUIREMENTS:
- ALWAYS include at least 2-3 sensory details (sounds, smells, textures, visual elements)
- Paint vivid scenes that make the player feel present in the world
- Use specific, evocative adjectives rather than generic descriptions
- Include atmospheric details about lighting, weather, mood, and environment
- Make every description cinematic and engaging`;
        }

        // Add engagement enhancements if needed
        if (improvements.categoryAverages.engagement < 0.6) {
            enhancedPrompt += `

🎯 ENHANCED PLAYER ENGAGEMENT:
- End responses with intrigue, questions, or hooks that make players curious
- Include subtle choices or implications without being directive
- Add mysterious elements that reward investigation
- Use phrases that invite player action ("You notice...", "Something catches your attention...")
- Create moments that feel significant and meaningful`;
        }

        return enhancedPrompt;
    }

    /**
     * Iterate and improve a response using the evaluation
     */
    async iterateResponse(originalResponse, evaluation, aiManager) {
        if (evaluation.totalScore >= this.improvementThreshold) {
            return originalResponse; // Already good enough
        }

        // Build improvement instructions based on evaluation
        const improvements = evaluation.suggestions.slice(0, 3); // Top 3 suggestions
        const improvementPrompt = `
IMPROVE THIS DM RESPONSE:

Original Response: "${originalResponse}"

Issues to Address:
${improvements.map((suggestion, i) => `${i + 1}. ${suggestion}`).join('\n')}

Requirements:
- Keep the same story content and meaning
- Enhance the response to feel more like an enthusiastic human DM
- Add sensory details and atmosphere
- Include more personality and warmth
- Make it more engaging and immersive

Improved Response:`;

        try {
            const improvedResponse = await aiManager.callAI([
                { role: 'system', content: 'You are an expert at improving D&D storytelling to sound more human and engaging.' },
                { role: 'user', content: improvementPrompt }
            ]);

            return improvedResponse || originalResponse;
        } catch (error) {
            console.error('Failed to iterate response:', error);
            return originalResponse;
        }
    }

    /**
     * Get evaluation statistics
     */
    getStats() {
        if (this.responseHistory.length === 0) {
            return { noData: true };
        }

        const recent = this.responseHistory.slice(-10);
        const categoryStats = {};

        Object.keys(this.evaluationCriteria).forEach(category => {
            const scores = recent.map(evaluation => evaluation.scores[category]);
            categoryStats[category] = {
                average: scores.reduce((a, b) => a + b, 0) / scores.length,
                min: Math.min(...scores),
                max: Math.max(...scores),
                trend: scores.length > 5 ? this.calculateTrend(scores) : 'stable'
            };
        });

        return {
            totalEvaluations: this.responseHistory.length,
            averageScore: this.averageScore,
            recentAverage: recent.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / recent.length,
            categoryStats,
            needsImprovement: this.averageScore < this.improvementThreshold
        };
    }

    /**
     * Calculate trend for a series of scores
     */
    calculateTrend(scores) {
        if (scores.length < 3) return 'stable';
        
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 0.1) return 'improving';
        if (difference < -0.1) return 'declining';
        return 'stable';
    }
}

// Make available globally
window.DMEvaluator = DMEvaluator;
