# DiceTales Setup Guide

Get DiceTales running in less than 5 minutes! This streamlined guide covers everything from local play to development setup.

## 🚀 Quick Start

### Option 1: Play Online (Easiest)
Simply open `index.html` in your browser and start playing immediately - no setup required!

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
   - The AI will generate your story in real-time using HuggingFace models

## 📋 Requirements

### Minimum Requirements
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **JavaScript**: Must be enabled
- **Internet**: Required for AI storytelling (HuggingFace API)
- **Storage**: ~2MB for game saves and character data (LocalStorage)

### Recommended
- **Screen**: 1024x768 or larger for optimal experience
- **Connection**: Stable internet for consistent AI responses
- **HuggingFace Access**: Unrestricted access to HuggingFace Inference API

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
│  (HuggingFace AI narrative appears here)│
├─────────────────────────────────────────┤
│             Choice Buttons              │
│  [Option 1] [Option 2] [Option 3] [...]  │
├─────────────────────┬───────────────────┤
│    Character Stats  │    Dice Area      │
│  STR: 14  INT: 12   │   Roll D20     │
│  DEX: 16  WIS: 10   │   [Turn Result]   │
│  CON: 13  CHA: 11   │   "Turn Active"   │
│  HP: 15/15 XP: 0    │                   │
└─────────────────────┴───────────────────┘
```

### 3. Turn-Based Game Controls

| Action | Method | Notes |
|--------|--------|-------|
| **Make Choice** | Click any choice button | Progresses story |
| **Roll Dice** | Click dice when available | **One roll per turn only** |
| **View Stats** | Always visible in bottom-left | Updates automatically |
| **Save Game** | Automatic (LocalStorage) | Saves after each action |
| **Load Game** | Refresh page and click "Continue" | Restores last state |
| **New Game** | Click "New Game" button | Starts fresh adventure |

### 4. Turn System (New in v2.0)
- **One dice roll per turn** - Roll strategically!
- **Turn progression** - Each choice or roll advances the story
- **Visual feedback** - Dice availability clearly indicated
- **Strategic gameplay** - Plan your actions carefully

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

### HuggingFace AI Settings
Edit `advanced/js/ai.js` to customize AI behavior:

```javascript
// Model configuration (models tried in order)
const AI_CONFIG = {
    HF_MODELS: [
        'microsoft/GODEL-v1_1-large-seq2seq',
        'microsoft/DialoGPT-large',
        'facebook/blenderbot-400M-distill',
        'microsoft/DialoGPT-medium'
    ]
};

// Response settings
const MAX_NEW_TOKENS = 150;
const TEMPERATURE = 0.8;
const TOP_P = 0.9;
```

**Note**: DiceTales uses advanced HuggingFace models with intelligent fallback responses for reliability.

### Audio Settings
Edit `advanced/js/audio.js` to customize sound effects:
- Enable/disable background music
- Adjust volume levels
- Add custom sound files

## 🐛 Troubleshooting

### Common Issues

**"AI Error: Unable to generate story" message**
- Check internet connection
- HuggingFace API might be busy - wait and try again
- Clear browser cache and reload
- Check browser console (F12) for detailed error messages

**"Cannot roll dice" (dice appears disabled)**
- You can only roll **once per turn**
- Make a story choice to advance to the next turn
- This is intentional strategic gameplay

**"Game won't load"**
- Ensure JavaScript is enabled
- Try a different browser
- Check browser console for errors (F12)
- Try serving from localhost if using file:// URLs

**"Choices not appearing"**
- Disable ad blockers (they sometimes block dynamic content)
- Clear browser cache and reload
- Try incognito/private mode
- Wait for HuggingFace AI to finish processing

**"Game state not saving"**
- Check if browser allows LocalStorage
- Try in incognito mode to test
- Some browsers block storage on file:// URLs

### HuggingFace-Specific Issues

**"Model loading failed" errors**
- HuggingFace model servers may be under load
- Try refreshing the page to attempt different models
- Check HuggingFace status at [status.huggingface.co](https://status.huggingface.co)

**Slow AI responses**
- HuggingFace free tier can be slower during peak hours
- Responses may take 10-30 seconds during busy periods
- Consider upgrading to HuggingFace Pro for faster inference

### Getting Help

1. **Check the console** (F12) for error messages
2. **Try a different browser** to isolate issues
3. **Clear cache and cookies** for the site
4. **Disable extensions** that might interfere
5. **Report bugs** on the GitHub repository

## ⚡ Performance Tips

### For Best Experience
- **Close unused browser tabs** (HuggingFace AI processing is resource-intensive)
- **Use Chrome or Firefox** for best compatibility
- **Stable internet connection** for consistent AI responses
- **Allow JavaScript** and disable strict content blockers
- **Be patient with AI responses** - HuggingFace can take 10-30 seconds

### For Developers
- **Use browser dev tools** for debugging
- **Monitor network tab** to see HuggingFace API calls
- **Check console** for detailed AI error logging
- **Test on multiple devices** for compatibility
- **Understand the turn system** - strategic dice rolling is key

### Turn-Based Strategy Tips
- **Plan your dice rolls** - you only get one per turn
- **Use dice for crucial moments** - combat, skill checks, important decisions
- **Advance turns strategically** - each choice progresses the story
- **Watch for dice availability** - visual cues show when rolling is possible

---

**Need more help?** Check out the [Game Guide](https://asleshsura.github.io/DiceTales/docs/GAME_GUIDE) for gameplay tips or [Technical Overview](https://asleshsura.github.io/DiceTales/docs/TECHNICAL_OVERVIEW) for development details.
