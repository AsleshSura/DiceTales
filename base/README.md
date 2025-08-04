# DiceTales Base - The Crystal of Shadows

A simplified, standalone version of DiceTales featuring a pre-planned storyline and streamlined AI chatbot DM functionality.

## 🎮 About This Version

This is a focused implementation of the core DiceTales concept, featuring:

- **Pre-planned Adventure**: "The Crystal of Shadows" - A complete 4-chapter fantasy quest
- **AI-like Responses**: Contextual storytelling that adapts to player actions
- **Simple Character Creation**: Choose your class and background to personalize the experience
- **Linear Progression**: Clear story beats that advance based on player choices
- **No External Dependencies**: Runs entirely in the browser with no external API calls

## 🌟 The Story

### The Crystal of Shadows

You are a hero called to the village of Millbrook, where strange shadows have begun moving independently at night, threatening the peaceful community. Your quest leads you through four exciting chapters:

1. **The Mysterious Shadows** - Investigate the supernatural threat in the village
2. **Into the Shadowmere Forest** - Journey into the ancient woods to find answers
3. **The Crystal Cave** - Discover the source of the dark magic
4. **The Final Confrontation** - Face your inner darkness to save the village

## 🎯 Key Features

- **Character Classes**: Warrior, Mage, Rogue, Ranger, Paladin, Cleric
- **Multiple Backgrounds**: Village Hero, Scholar, Merchant, Soldier, Hermit, Noble
- **Contextual Responses**: AI-like responses that change based on your location and actions
- **Quick Actions**: Pre-built actions like "Look Around", "Check Inventory", "Cast Light Spell"
- **Chapter Progression**: Story automatically advances based on your choices
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 How to Play

1. **Open `index.html`** in any modern web browser
2. **Create Your Character** - Choose a name, class, and background
3. **Read the Story** - Each chapter sets up new scenarios and challenges
4. **Take Actions** - Type what you want to do or use the quick action buttons
5. **Progress Through Chapters** - The story advances based on your choices
6. **Complete the Quest** - Reach the satisfying conclusion of your adventure

## 🛠 Technical Details

### File Structure
```
base/
├── index.html          # Main game page
├── css/
│   └── style.css      # Complete styling for the game
└── js/
    └── game.js        # Game logic and AI response system
```

### How It Works

- **Storyline Engine**: Pre-scripted adventure with branching dialogue
- **AI Response System**: Pattern-matching responses based on player actions and current location
- **Chapter Management**: Automatic progression through 4 distinct story chapters
- **Character System**: Simple stats and class-based responses
- **No External APIs**: All responses are generated locally

### Customization

You can easily customize this version by:

1. **Adding New Responses**: Edit the `initializeAIResponses()` method in `game.js`
2. **Modifying the Story**: Update the `storyline` object to change chapters and progression
3. **Adding Character Classes**: Extend the character creation form and stats generation
4. **Changing the Theme**: Modify the CSS for different visual styles

## 🔄 Differences from Full DiceTales

This base version:
- ✅ Focuses on a single, complete adventure story
- ✅ Uses local pattern-matching instead of external AI APIs
- ✅ Has simplified character creation (no complex stat rolling)
- ✅ Features linear story progression instead of open-world exploration
- ✅ Requires no setup or API keys
- ❌ Does not include dice rolling mechanics
- ❌ Does not have save/load functionality
- ❌ Does not include complex inventory management
- ❌ Does not have multiple campaign settings

## 🎨 Visual Design

The game features a fantasy-themed dark UI with:
- Gold and blue color scheme evoking magical crystals
- Elegant typography with serif fonts for readability
- Smooth animations and hover effects
- Responsive design that works on all devices
- Atmospheric loading screen with spinning dice animation

## 🔮 Future Enhancements

This base can be extended with:
- Additional story chapters or side quests
- More sophisticated AI response patterns
- Simple dice rolling mechanics
- Character progression and leveling
- Multiple story paths and endings
- Save/load game functionality
- Sound effects and background music

## 📝 License

This is a simplified demonstration version of DiceTales. Feel free to use and modify for educational purposes.

---

**Ready to begin your adventure?** Open `index.html` and step into the world of shadows and magic!
