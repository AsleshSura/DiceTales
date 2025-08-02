/**
 * DiceTales - AI Configuration
 * HuggingFace-only AI system for RPG storytelling
 */

const AI_CONFIG = {
    // Primary and only AI system: HuggingFace (free models, optimized for D&D storytelling)
    USE_HUGGINGFACE: true,
    
    // HuggingFace model preferences (system will try models in order)
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
