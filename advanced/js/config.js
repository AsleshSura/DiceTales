/**
 * DiceTales - Advanced AI Configuration
 * Specialized AI system for immersive storytelling with human-like conversation
 */

const AI_CONFIG = {
    // Primary and only AI system: HuggingFace optimized for natural storytelling
    USE_HUGGINGFACE: true,
    
    // HuggingFace model preferences - modern human-sounding conversational models
    HUGGINGFACE_MODELS: [
        'microsoft/GODEL-v1_1-large-seq2seq',  // Advanced conversational AI with better context understanding
        'facebook/blenderbot-400M-distill',     // Optimized for natural dialogue
        'microsoft/GODEL-v1_1-base-seq2seq',   // Good balance of quality and speed
        'facebook/blenderbot-1B-distill',      // Large conversational model
        'microsoft/DialoGPT-large',            // Fallback - proven conversational model
        'microsoft/DialoGPT-medium',           // Fallback - medium size
        'gpt2-large',                          // Fallback - general purpose
        'distilgpt2'                           // Final fallback
    ],
    
    // Enhanced conversation settings for more human-like responses
    CONVERSATION_SETTINGS: {
        maxContextLength: 2048,
        temperature: 0.8,           // Higher temperature for more creative responses
        topP: 0.9,                 // Nucleus sampling for better quality
        repetitionPenalty: 1.1,    // Reduce repetitive responses
        maxNewTokens: 150,         // Reasonable response length
        doSample: true,            // Enable sampling for variety
        numBeams: 3                // Beam search for better quality
    },
    
    // Memory and context settings
    MEMORY_SETTINGS: {
        maxConversationHistory: 20,  // Keep last 20 exchanges
        plotContextWindow: 5,        // Last 5 plot-relevant events
        characterMemoryDepth: 10     // Remember character interactions
    },
    
    // Fallback systems for when HuggingFace models are unavailable
    USE_SIMPLE_AI: true,
    USE_MOCK_FALLBACK: true
};

// Make config available globally
window.AI_CONFIG = AI_CONFIG;
