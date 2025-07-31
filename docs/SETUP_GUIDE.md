# DiceTales Setup Guide

Get DiceTales running in less than 5 minutes! This guide covers everything from local development to deployment.

## 🚀 Quick Start

### Option 1: Play Online (Easiest)
Simply visit the [live demo](#) and start playing immediately - no setup required!

### Option 2: Download and Play Locally
1. **Download the repository**
   ```bash
   git clone https://github.com/AsleshSura/DiceTales.git
   cd DiceTales
   ```

2. **Open in browser**
   - Double-click `index.html`, or
   - Open `index.html` in any modern web browser

3. **Start playing!**
   - Click "New Game" to begin your adventure
   - The AI will generate your story automatically

## 📋 Requirements

### Minimum Requirements
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **JavaScript**: Must be enabled
- **Internet**: Required for AI features (HuggingFace API)
- **Storage**: ~1MB for game saves (LocalStorage)

### Recommended
- **Screen**: 1024x768 or larger for best experience
- **Audio**: Speakers/headphones for atmospheric sounds
- **Connection**: Stable internet for consistent AI responses

## 🔧 Development Setup

### For Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AsleshSura/DiceTales.git
   cd DiceTales
   ```

2. **Serve files locally** (recommended for development)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### Why Use a Local Server?
- Avoids CORS issues with some browsers
- Better debugging experience
- Simulates production environment
- Required for some advanced features

## 🎮 First Time Setup

### 1. Character Creation
When you first start DiceTales:

1. **Choose your character stats** - Distribute points among:
   - **Strength**: Physical power and melee combat
   - **Dexterity**: Agility, stealth, and ranged combat
   - **Constitution**: Health, stamina, and endurance
   - **Intelligence**: Knowledge, reasoning, and magic
   - **Wisdom**: Perception, insight, and willpower
   - **Charisma**: Social skills and leadership

2. **Set your character name** - This will appear in your adventure

3. **Choose difficulty** (optional):
   - **Beginner**: More forgiving dice rolls
   - **Standard**: Balanced gameplay
   - **Expert**: Challenging experience

### 2. Understanding the Interface

```
┌─────────────────────────────────────────┐
│             Story Area                  │
│  (AI-generated narrative appears here)  │
├─────────────────────────────────────────┤
│             Choice Buttons              │
│  [Option 1] [Option 2] [Option 3] [...]  │
├─────────────────────┬───────────────────┤
│    Character Stats  │    Dice Area      │
│  STR: 14  INT: 12   │   🎲 Roll D20     │
│  DEX: 16  WIS: 10   │   [Roll Result]   │
│  CON: 13  CHA: 11   │                   │
│  HP: 15/15 XP: 0    │                   │
└─────────────────────┴───────────────────┘
```

### 3. Game Controls

| Action | Method |
|--------|--------|
| **Make Choice** | Click any choice button |
| **Roll Dice** | Click the dice or "Roll D20" button |
| **View Stats** | Always visible in bottom-left |
| **Save Game** | Automatic (LocalStorage) |
| **Load Game** | Refresh page and click "Continue" |
| **New Game** | Click "New Game" button |

## 🌐 Deployment Options

### GitHub Pages (Free)
1. Fork the repository on GitHub
2. Go to Settings → Pages
3. Select "Deploy from a branch" → "main"
4. Your game will be available at `https://yourusername.github.io/DiceTales/`

### Netlify (Free)
1. Create account at [netlify.com](https://netlify.com)
2. Drag the DiceTales folder to the deploy area
3. Your game gets a unique URL instantly

### Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. In the DiceTales directory: `vercel`
3. Follow the prompts for instant deployment

### Self-Hosted
Upload all files to any web server that serves static files:
- Apache HTTP Server
- Nginx
- IIS
- Any shared hosting provider

## 🔧 Configuration Options

### AI Settings (Advanced)
Edit `js/config.js` to customize AI behavior:

```javascript
const CONFIG = {
    USE_HUGGINGFACE: true,        // Primary AI service
    USE_SIMPLE_AI: true,          // Fallback templates
    USE_MOCK_AI: true,            // Final fallback
    
    // HuggingFace settings
    HUGGINGFACE_MODELS: [
        'microsoft/DialoGPT-large',
        'microsoft/DialoGPT-medium',
        'gpt2-large',
        'gpt2'
    ],
    
    // Response tuning
    MAX_STORY_LENGTH: 500,
    MAX_CHOICE_LENGTH: 250,
    TEMPERATURE: 0.85,
    TOP_P: 0.92
};
```

### Audio Settings
Edit `js/audio.js` to customize sound effects:
- Enable/disable background music
- Adjust volume levels
- Add custom sound files

## 🐛 Troubleshooting

### Common Issues

**"AI not responding" or showing template responses**
- Check internet connection
- HuggingFace API might be busy - try refreshing
- Game automatically falls back to template responses

**"Game won't load"**
- Ensure JavaScript is enabled
- Try a different browser
- Check browser console for errors (F12)

**"Choices not appearing"**
- Disable ad blockers (they sometimes block dynamic content)
- Clear browser cache and reload
- Try incognito/private mode

**"Game state not saving"**
- Check if browser allows LocalStorage
- Try in incognito mode to test
- Some browsers block storage on file:// URLs

### Getting Help

1. **Check the console** (F12) for error messages
2. **Try a different browser** to isolate issues
3. **Clear cache and cookies** for the site
4. **Disable extensions** that might interfere
5. **Report bugs** on the GitHub repository

## ⚡ Performance Tips

### For Best Experience
- **Close unused browser tabs** (AI processing is resource-intensive)
- **Use Chrome or Firefox** for best compatibility
- **Stable internet connection** for consistent AI responses
- **Allow JavaScript** and disable strict content blockers

### For Developers
- **Use browser dev tools** for debugging
- **Monitor network tab** to see AI API calls
- **Check console** for detailed logging
- **Test on multiple devices** for compatibility

---

**Need more help?** Check out the [Game Guide](GAME_GUIDE.md) for gameplay tips or [Technical Overview](TECHNICAL_OVERVIEW.md) for development details.
