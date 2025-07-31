# DiceTales Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Web Browser**: Modern browser with JavaScript enabled
- **Development Server**: Python 3.x (for local development)
- **Optional**: Node.js (for build tools)

### 1. Download/Clone the Project
```bash
# If using Git
git clone https://github.com/your-username/dicetales.git
cd dicetales

# Or download and extract the ZIP file
```

### 2. Start Development Server
```bash
# Using Python (recommended)
python -m http.server 8000

# Or using Python 3 explicitly
python3 -m http.server 8000

# Alternative: Using Node.js
npx http-server -p 8000
```

### 3. Open in Browser
Navigate to: `http://localhost:8000`

---

## 📁 Project Structure

```
DiceTales/
├── index.html              # Main application entry point
├── css/                    # Stylesheets
│   ├── main.css           # Core application styles
│   ├── character.css      # Character creation styles
│   ├── dice.css           # Dice system styles
│   └── responsive.css     # Mobile/responsive design
├── js/                     # JavaScript application
│   ├── main.js            # Application controller
│   ├── ai.js              # AI integration system
│   ├── audio.js           # Audio system
│   ├── character.js       # Character management
│   ├── dice.js            # Dice rolling system
│   ├── gameState.js       # State management
│   ├── ui.js              # User interface
│   └── utils.js           # Utility functions
├── docs/                   # Documentation
│   ├── README.md          # Documentation overview
│   ├── PROJECT_OVERVIEW.md # Project architecture
│   ├── API_REFERENCE.md   # Complete API docs
│   ├── javascript/        # JS module documentation
│   └── css/               # CSS documentation
└── README.md              # Project overview
```

---

## 🔧 Configuration

### Environment Setup

#### Development Mode
Debug mode is automatically enabled for local development:
```javascript
// Automatically detected
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG_MODE = true;
}
```

#### Production Mode
For production deployment:
1. Serve files from a web server
2. Debug mode automatically disabled
3. Consider minifying CSS/JS files

### AI Configuration
The application uses the HackClub AI API by default. No API key required.

```javascript
// AI settings in ai.js
const AI_CONFIG = {
    apiUrl: 'https://ai.hackclub.com/chat/completions',
    model: 'Qwen/Qwen2.5-32B-Instruct',
    maxTokens: 4000
};
```

---

## 🎮 First Time Setup

### 1. Launch the Application
After starting your development server, the application will:
- Show a loading screen
- Initialize all game systems
- Redirect to character creation

### 2. Create Your First Character
1. **Choose Campaign Setting**: Select from 4 available settings
   - Medieval Fantasy 🏰
   - Modern Day 🏙️  
   - Sci-Fi Space 🚀
   - Eldritch Horror 🐙

2. **Select Character Class**: Choose class appropriate to your setting
3. **Allocate Stats**: Use point-buy system (27 points)
4. **Add Details**: Name your character and add background

### 3. Start Your Adventure
- AI generates opening narrative
- Interactive story begins
- Dice rolling system available
- Character progression tracked

---

## 🛠️ Development Workflow

### File Editing
All game logic is in separate, well-documented files:
- Edit JavaScript files for functionality changes
- Edit CSS files for visual modifications
- Changes are immediately reflected (refresh browser)

### Adding New Features

#### Adding a New Character Class
1. Edit `character.js`
2. Add class to appropriate campaign setting:
```javascript
this.classes['new-class'] = {
    name: 'New Class',
    icon: '⚡',
    description: 'Class description',
    stats: { str: 12, dex: 14, con: 13, int: 11, wis: 10, cha: 15 },
    abilities: [
        { name: 'Special Ability', description: 'Ability description' }
    ],
    equipment: ['Starting equipment list']
};
```

#### Adding New Dice Types
1. Edit `dice.js`
2. Add to `availableDice` object:
```javascript
'd30': { sides: 30, name: 'D30', icon: '⬟' }
```

#### Adding Sound Effects
1. Edit `audio.js`
2. Add new sound type to `playSFX()` method
3. Create configuration method for the sound

### Testing Changes
- **Browser DevTools**: Use console for debugging
- **Error Logging**: Check browser console for errors
- **State Inspection**: `window.debugGameState` in debug mode
- **Performance**: `window.perf` for timing operations

---

## 📱 Device Compatibility

### Desktop Browsers
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support with minor differences
- **Edge**: Full support

### Mobile Browsers
- **iOS Safari**: Full support
- **Chrome Mobile**: Full support
- **Firefox Mobile**: Full support
- **Samsung Internet**: Full support

### Tablet Support
- **iPad**: Optimized tablet layout
- **Android Tablets**: Responsive design
- **Surface**: Full desktop experience

---

## 🎵 Audio Setup

### Browser Audio Policies
Modern browsers require user interaction before playing audio:
- Audio initializes automatically on first click/touch
- Shows notification when audio is ready
- Graceful fallback if audio fails

### Audio Features
- **Background Music**: Contextual music themes
- **Sound Effects**: Synthesized using Web Audio API
- **Volume Controls**: Separate music/SFX volume
- **Mute Options**: Can disable audio entirely

---

## 💾 Save System

### Automatic Saving
- **Auto-save**: Every 5 seconds after changes
- **LocalStorage**: Browser-based persistence
- **Cross-session**: Game state preserved between sessions

### Manual Backup
```javascript
// Export save data (in browser console)
const backup = JSON.stringify(gameState.state, null, 2);
console.log(backup);

// Save to file
const blob = new Blob([backup], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dicetales-save.json';
a.click();
```

### Restore from Backup
```javascript
// In browser console
const backup = /* paste your backup JSON */;
gameState.state = backup;
gameState.save();
location.reload();
```

---

## 🔧 Troubleshooting

### Common Issues

#### Game Won't Load
1. **Check Console**: Open browser DevTools → Console
2. **Server Running**: Ensure development server is active
3. **File Permissions**: Verify files are readable
4. **JavaScript Errors**: Look for syntax errors in console

#### Audio Not Working
1. **User Interaction**: Click anywhere to initialize audio
2. **Browser Support**: Ensure Web Audio API support
3. **Volume Settings**: Check both browser and game volume
4. **Console Errors**: Look for audio-related errors

#### Character Creation Stuck
1. **Form Validation**: Ensure all required fields filled
2. **Point Allocation**: Verify all stat points used
3. **Browser Storage**: Check if localStorage is enabled
4. **JavaScript Errors**: Check console for errors

#### AI Not Responding
1. **Network Connection**: Verify internet connectivity
2. **API Status**: Check if HackClub AI API is operational
3. **Fallback Mode**: Game should work without AI
4. **Console Messages**: Look for AI-related errors

### Debug Mode Features
When running locally, debug mode provides:
- **Console Logging**: Detailed operation logs
- **State Inspection**: Access to game state
- **Performance Monitoring**: Timing information
- **Error Details**: Enhanced error reporting

### Performance Issues
1. **Browser Resources**: Close other tabs/applications
2. **Graphics Settings**: Reduce animations if needed
3. **Memory Usage**: Refresh page if running long sessions
4. **Mobile Performance**: May be slower on older devices

---

## 📦 Deployment

### Static File Hosting
DiceTales is a client-side application that can be hosted on any static file server:

#### GitHub Pages
1. Fork/upload repository to GitHub
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/dicetales`

#### Netlify
1. Drag and drop project folder to Netlify
2. Automatic deployment and hosting
3. Custom domain support available

#### Traditional Web Hosting
1. Upload all files to web server
2. Ensure MIME types configured correctly
3. Access via your domain

### Production Optimizations
For production deployment:
1. **Minify Files**: Compress CSS and JavaScript
2. **Enable Compression**: Use gzip on server
3. **Cache Headers**: Set appropriate cache policies
4. **CDN**: Consider using a CDN for global performance

---

## 🔒 Security Considerations

### Client-Side Security
- **XSS Prevention**: HTML is sanitized
- **Data Validation**: Input validation on all forms
- **Safe JSON**: Protected JSON parsing
- **No Server**: No server-side vulnerabilities

### User Data
- **Local Storage**: All data stored locally
- **No Tracking**: No analytics or user tracking
- **Privacy**: No data sent to external services (except AI API)

---

## 🆘 Getting Help

### Documentation
- **API Reference**: Complete function documentation
- **Module Docs**: Individual file documentation
- **Code Comments**: Inline code documentation

### Community
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Community help and sharing
- **Code Examples**: Usage examples in documentation

### Development Support
For development questions:
1. Check documentation first
2. Review code comments
3. Use browser DevTools for debugging
4. Create GitHub issue for bugs

---

## 🎯 Next Steps

After setup, you might want to:
1. **Customize**: Modify character classes or campaign settings
2. **Extend**: Add new features or integrations
3. **Share**: Deploy your customized version
4. **Contribute**: Submit improvements back to the project

### Learning Resources
- **JavaScript**: Mozilla Developer Network (MDN)
- **Web Audio API**: MDN Web Audio documentation
- **CSS Grid/Flexbox**: CSS-Tricks guides
- **Game Development**: HTML5 game development resources

---

*This setup guide provides everything needed to get DiceTales running locally or deployed to production. For additional help, refer to the API documentation or create an issue on GitHub.*
