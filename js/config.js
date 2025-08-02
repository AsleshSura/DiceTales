/**
 * DiceTales - "The Quantum Relay" AI Configuration
 * Specialized AI system for immersive sci-fi storytelling
 */

const AI_CONFIG = {
    // Primary and only AI system: HuggingFace optimized for "The Quantum Relay" story
    USE_HUGGINGFACE: true,
    
    // HuggingFace model preferences optimized for sci-fi storytelling
    HUGGINGFACE_MODELS: [
        'microsoft/DialoGPT-large',
        'microsoft/DialoGPT-medium', 
        'gpt2-large',
        'gpt2',
        'microsoft/DialoGPT-small',
        'distilgpt2'
    ],
    
    // Fallback systems for when HuggingFace models are unavailable
    USE_SIMPLE_AI: true,
    USE_MOCK_FALLBACK: true
};

// Make config available globally
window.AI_CONFIG = AI_CONFIG;
