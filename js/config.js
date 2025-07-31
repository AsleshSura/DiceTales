/**
 * DiceTales - AI Configuration
 * HuggingFace AI with proper prompt engineering for RPG storytelling
 */

const AI_CONFIG = {
    // Primary AI: HuggingFace (free models, prompt-engineered for RPG)
    USE_HUGGINGFACE: true,
    
    // Secondary: Simple AI (template-based fallback)
    USE_SIMPLE_AI: true,
    
    // Final: Mock AI (basic responses)
    USE_MOCK_FALLBACK: true
};

// Make config available globally
window.AI_CONFIG = AI_CONFIG;
