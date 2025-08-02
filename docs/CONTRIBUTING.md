# Contributing to DiceTales

Welcome to the DiceTales community! We're excited to have you contribute to this AI-powered RPG adventure game. This guide will help you get started with contributing code, documentation, ideas, and more.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
Found a bug? Help us fix it!
- Search existing issues first
- Use the bug report template
- Include browser/OS information
- Provide steps to reproduce
- Add screenshots if helpful

### 💡 Feature Requests
Have a great idea for DiceTales?    
- Check if it's already been suggested
- Use the feature request template
- Explain the use case and benefits
- Consider implementation complexity

### 📝 Documentation
Help improve our docs!
- Fix typos and grammar
- Add missing information
- Improve clarity and examples
- Translate to other languages

### 🔧 Code Contributions
Ready to code? Here's how:
- Fork the repository
- Create a feature branch
- Write clean, documented code
- Add tests if applicable
- Submit a pull request

### 🎨 Design & UI
Make DiceTales more beautiful!
- Improve visual design
- Enhance user experience
- Create mobile-friendly layouts
- Design new game assets

### 🔊 Audio & Assets
Add atmosphere to the game!
- Create sound effects
- Compose background music
- Design character portraits
- Build environment assets

## 🚀 Getting Started

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/yourusername/DiceTales.git
cd DiceTales
```

### 2. Set Up Development Environment
```bash
# No build process needed! Just serve the files:
python -m http.server 8000
# Or use any static file server
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Make Your Changes
- Edit files using your favorite editor
- Test in multiple browsers
- Follow our coding standards

### 5. Test Your Changes
- [ ] Game loads without errors
- [ ] All existing features still work
- [ ] New features work as expected
- [ ] No console errors
- [ ] Mobile-friendly (if UI changes)

### 6. Commit and Push
```bash
git add .
git commit -m "Add feature: brief description"
git push origin feature/your-feature-name
```

### 7. Create Pull Request
- Go to GitHub and create a pull request
- Use the pull request template
- Link any related issues
- Wait for review

## 📋 Development Guidelines

### Code Style

#### JavaScript
```javascript
// Use camelCase for variables and functions
const playerCharacter = new Character('Hero');
const rollDice = (sides = 20) => { /* ... */ };

// Use PascalCase for classes
class AIService {
    constructor() { /* ... */ }
}

// Use UPPER_SNAKE_CASE for constants
const MAX_HEALTH_POINTS = 100;
const DEFAULT_DIFFICULTY = 'normal';

// Use meaningful variable names
const currentStoryText = 'You enter a dark cave...';
const playerChoiceIndex = 2;

// Add JSDoc comments for public methods
/**
 * Generates a story continuation using AI
 * @param {string} context - Current story context
 * @param {string} type - Story type ('narrative', 'combat', etc.)
 * @returns {Promise<string>} Generated story text
 */
async generateStory(context, type) {
    // Implementation...
}
```

#### CSS
```css
/* Use BEM naming convention */
.character-sheet { /* Block */ }
.character-sheet__stat { /* Element */ }
.character-sheet__stat--highlighted { /* Modifier */ }

/* Use consistent spacing */
.game-container {
    margin: 0 auto;
    padding: 20px;
    max-width: 1200px;
}

/* Group related properties */
.dice-container {
    /* Display & Box Model */
    display: flex;
    padding: 10px;
    margin: 5px 0;
    
    /* Visual */
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
    
    /* Animation */
    transition: all 0.3s ease;
}
```

#### HTML
```html
<!-- Use semantic HTML5 elements -->
<main class="game-container">
    <section class="story-area">
        <article class="current-story">
            <!-- Story content -->
        </article>
    </section>
    
    <aside class="character-panel">
        <!-- Character stats -->
    </aside>
</main>

<!-- Use meaningful class names -->
<button class="choice-button" data-choice-index="0">
    Attack the dragon
</button>

<!-- Include accessibility attributes -->
<button 
    class="dice-roll-button" 
    aria-label="Roll 20-sided die"
    title="Roll for skill check">
    🎲 Roll D20
</button>
```

### File Organization

```
DiceTales/
├── css/
│   ├── main.css          # Core game styles
│   ├── character.css     # Character sheet styles
│   ├── dice.css          # Dice animation styles
│   └── responsive.css    # Mobile responsiveness
├── js/
│   ├── main.js           # Game initialization
│   ├── ai/               # AI-related modules
│   │   ├── ai.js         # AI coordinator
│   │   ├── huggingfaceAI.js
│   │   ├── simpleAI.js
│   │   └── mockAI.js
│   ├── game/             # Core game logic
│   │   ├── character.js
│   │   ├── dice.js
│   │   └── gameState.js
│   └── ui/               # User interface
│       ├── ui.js
│       └── audio.js
```

### Testing Guidelines

#### Manual Testing Checklist
Before submitting a pull request:

**Basic Functionality**
- [ ] Game loads without JavaScript errors
- [ ] Character creation works properly
- [ ] Story generation functions (all AI services)
- [ ] Dice rolling produces expected results
- [ ] Save/load functionality works

**Cross-Browser Testing**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (latest)

**Responsive Design**
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, 414x896)

**Accessibility**
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast adequate
- [ ] Focus indicators visible

#### Automated Testing (Future)
We're working on adding:
- Unit tests for game logic
- Integration tests for AI services
- UI automation tests
- Performance regression tests

### AI Development Guidelines

When working with AI services:

#### Prompt Engineering
```javascript
// Good: Specific, contextual prompts
const prompt = `You are a dungeon master telling an epic fantasy story.
Current situation: ${cleanContext}
Character stats: STR:${str} DEX:${dex} INT:${int}

Continue this adventure with 3-4 vivid sentences that:
- Advance the story with specific details
- Include sensory descriptions
- Create an interesting choice moment
- Match the fantasy RPG tone

Story continuation:`;

// Bad: Vague, generic prompts
const prompt = `Continue this story: ${context}`;
```

#### Error Handling
```javascript
// Always implement graceful fallbacks
async generateStory(context) {
    try {
        return await primaryAI.generate(context);
    } catch (error) {
        console.warn('Primary AI failed:', error);
        try {
            return await fallbackAI.generate(context);
        } catch (fallbackError) {
            console.warn('Fallback AI failed:', fallbackError);
            return this.getHardcodedResponse(context);
        }
    }
}
```

#### Response Processing
```javascript
// Clean and validate AI responses
processAIResponse(response) {
    // Remove unwanted content
    let cleaned = response
        .replace(/^\s*[\[\]\(\)]*\s*/, '')
        .replace(/\b(AI|assistant|model)\b/gi, '')
        .trim();
    
    // Validate content
    if (cleaned.length < 20) {
        return this.getFallbackResponse();
    }
    
    // Ensure RPG appropriateness
    if (!this.isRPGAppropriate(cleaned)) {
        return this.getFallbackResponse();
    }
    
    return cleaned;
}
```

## 🔍 Issue Guidelines

### Bug Report Template
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g. Chrome 91.0.4472.124]
- OS: [e.g. Windows 10, macOS 11.4]
- Device: [e.g. Desktop, iPhone 12]

**Additional Context**
Any other context about the problem.
```

### Feature Request Template
```markdown
**Feature Summary**
Brief description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
Detailed description of the proposed feature.

**Alternatives Considered**
What other solutions did you consider?

**Implementation Notes**
Any technical considerations or requirements.

**Additional Context**
Mockups, examples, or related issues.
```

### Pull Request Template
```markdown
**Description**
Brief description of changes made.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

**Testing Done**
- [ ] Manual testing completed
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] AI services tested

**Screenshots**
If applicable, add screenshots of changes.

**Related Issues**
Fixes #(issue number)

**Checklist**
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated if needed
```

## 🏆 Recognition

We appreciate all contributions! Contributors will be:
- Listed in our README contributors section
- Mentioned in release notes for their contributions
- Invited to join our Discord community
- Given credit in the game's about section

### Types of Recognition

**🌟 Code Contributors**
- Major features and bug fixes
- Performance improvements
- Architecture enhancements

**📚 Documentation Heroes**
- Comprehensive guides
- Code documentation
- Tutorial creation

**🎨 Design Artists**
- UI/UX improvements
- Visual assets
- Audio contributions

**🐛 Bug Hunters**
- Quality assurance testing
- Issue reporting
- Regression testing

**💡 Idea Champions**
- Feature suggestions
- User experience insights
- Community feedback

## 📞 Getting Help

### Discord Community
Join our Discord server for:
- Real-time discussion
- Development help
- Feature brainstorming
- Community events

### GitHub Discussions
Use GitHub Discussions for:
- Feature proposals
- Technical questions
- Show and tell
- General community chat

### Direct Contact
For sensitive issues:
- Security vulnerabilities
- Code of conduct violations
- Private development discussions

## 📜 Code of Conduct

### Our Pledge
We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement
Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

## 🔄 Development Workflow

### Release Cycle
1. **Development** - New features and bug fixes
2. **Feature Freeze** - Testing and documentation
3. **Release Candidate** - Final testing
4. **Release** - Tagged and deployed
5. **Post-Release** - Bug fixes and patches

### Branch Strategy
```
main                 # Stable release branch
├── develop          # Integration branch
├── feature/xyz      # Feature branches
├── fix/abc          # Bug fix branches
└── hotfix/critical  # Emergency fixes
```

### Version Numbers
We use Semantic Versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backwards compatible
- **Patch** (1.1.1): Bug fixes

## 🎉 Welcome to the Team!

Thank you for considering contributing to DiceTales! Your efforts help make this game better for everyone. Whether you're fixing a typo, adding a major feature, or just providing feedback, every contribution matters.

**Ready to start?** 
1. Check out our [good first issues](https://github.com/AsleshSura/DiceTales/labels/good%20first%20issue)
2. Join our community discussions
3. Read through the codebase
4. Pick something that interests you

**Questions?** Don't hesitate to ask! We're here to help you succeed.

---

*Happy coding, and may your dice always roll high! 🎲*
