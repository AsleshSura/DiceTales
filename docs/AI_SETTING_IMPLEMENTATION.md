# AI Setting-Based Storylines Implementation

## Overview
The AI system has been successfully modified to support different storylines based on the chosen game setting, while maintaining the same general structure and functionality.

## Changes Made

### 1. Dynamic Campaign Stories
- **Before**: Hardcoded "The Quantum Relay" space story for all settings
- **After**: Four unique campaign stories, one for each setting:
  - **Medieval Fantasy**: "The Shadow Crown" - Ancient crown fragments and shadow magic
  - **Modern Day**: "The Veil Protocol" - Secret organization and supernatural containment failures
  - **Sci-Fi Space**: "The Quantum Relay" - Alien artifact and galactic politics (original story)
  - **Eldritch Horror**: "The Arkham Manuscripts" - Forbidden knowledge and cosmic horror

### 2. Updated Methods

#### `getCampaignInfo(settingId)`
- New method that returns setting-specific campaign data including:
  - Title, plot, locations, antagonist, stakes, character hook
  - Story focus and tone appropriate to the genre
  - Console logging for debugging

#### `getHuggingFaceStoryPrompt(type, settingData)`
- **Updated**: Now dynamically generates prompts based on current setting
- Pulls campaign info from `getCampaignInfo()` instead of hardcoded values
- Adapts language and tone to match genre (fantasy, sci-fi, modern, horror)
- Maintains same structure but with setting-appropriate content

#### `getHuggingFaceFallbackResponse(type, settingData)`
- **Updated**: Setting-aware fallback responses
- Each setting has unique fallback stories that match the campaign
- Appropriate language and atmosphere for each genre

#### `getHuggingFaceFallbackChoices()`
- **Updated**: Setting-appropriate choice options
- Fantasy uses "magical phenomenon" and "ancient lore"
- Modern uses "supernatural event" and "contemporary knowledge"
- Sci-fi uses original space terminology
- Horror uses "disturbing phenomenon" and "academic knowledge"

#### `getCampaignStoryPrompt(settingData, characterData)`
- **Updated**: Dynamic campaign generation based on setting
- Uses `getCampaignInfo()` for appropriate campaign data
- Customizes prompts for each genre

#### `getFallbackCampaignStory(settingData, characterData)`
- **Updated**: Setting-specific fallback campaigns
- New helper methods:
  - `generateStartScenario()` - Creates appropriate opening scenes
  - `customizeHookForRole()` - Adapts character hooks by class and setting

### 3. Console Logging
- Added debugging logs to show which setting/campaign is being used
- Helps track when different storylines are loaded
- Makes it easier to verify the system is working correctly

### 4. Maintained Compatibility
- All existing AI functionality preserved
- Same method signatures and return types
- Backward compatible with existing game state and character systems
- No breaking changes to other game systems

## How It Works

1. **Setting Detection**: The AI checks the current game setting from `gameState.getCampaign().setting`
2. **Campaign Selection**: `getCampaignInfo()` returns the appropriate campaign data for that setting
3. **Prompt Generation**: All story prompts are generated using the setting-specific campaign information
4. **Adaptive Language**: Prompts use genre-appropriate language and terminology
5. **Character Customization**: Character hooks and scenarios are adapted based on both setting and character class

## Campaign Details

### Medieval Fantasy - "The Shadow Crown"
- **Plot**: Ancient crown shattered into fragments, shadow magic consuming the world
- **Antagonist**: Lord Malachar the Shadow Binder
- **Locations**: Crystal Caverns, Sunken Ruins, Whispering Woods, Dragonspine Mountains
- **Tone**: Epic fantasy adventure

### Modern Day - "The Veil Protocol"
- **Plot**: Secret organization's supernatural containment failing, reality breaches
- **Antagonist**: Director Elena Cross and her conspiracy faction
- **Locations**: Underground facilities, subway tunnels, corporate headquarters
- **Tone**: Urban fantasy thriller

### Sci-Fi Space - "The Quantum Relay"
- **Plot**: Alien artifact capable of opening wormholes, galactic politics
- **Antagonist**: Commander Vex of the Crimson Fleet
- **Locations**: Research stations, asteroid colonies, alien ruins
- **Tone**: Space opera adventure

### Eldritch Horror - "The Arkham Manuscripts"
- **Plot**: Forbidden texts threatening reality, cosmic entities awakening
- **Antagonist**: Professor Jeremiah Blackwood and his cult
- **Locations**: Miskatonic University, abandoned mansions, cult temples
- **Tone**: Cosmic horror investigation

## Testing
- Created `setting_test.js` to verify functionality
- Tests campaign generation for all four settings
- Verifies prompt generation and fallback systems
- Includes browser-based test button for easy verification

## Result
The AI now provides genre-appropriate storylines that match the chosen setting while maintaining the same high-quality storytelling structure. Players will experience completely different adventures based on their setting choice, with appropriate atmosphere, language, and plot elements for each genre.
