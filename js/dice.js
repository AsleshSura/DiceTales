/**
 * DiceTales - Simple Dice Display System
 * Shows dice images when AI requests rolls
 */

class DiceSystem {
    constructor() {
        this.diceImages = {
            'd4': '🔺',
            'd6': '⚀',
            'd8': '♦️',
            'd10': '🔟',
            'd12': '🟢',
            'd20': '🎲',
            'd100': '💯'
        };
        
        this.diceNames = {
            'd4': 'D4',
            'd6': 'D6', 
            'd8': 'D8',
            'd10': 'D10',
            'd12': 'D12',
            'd20': 'D20',
            'd100': 'D100'
        };
        
        this.init();
    }
    
    init() {
        // Listen for AI responses that contain dice roll requests
        if (typeof eventBus !== 'undefined') {
            eventBus.on('ai:response', (content) => {
                this.detectAndShowDiceRequest(content);
            });
            
            // Clear dice display when new story content starts
            eventBus.on('story:new', () => {
                this.clearDiceDisplay();
            });
        }
    }
    
    /**
     * Detect dice roll requests in AI content and show appropriate dice
     */
    detectAndShowDiceRequest(content) {
        if (!content || typeof content !== 'string') return;
        
        // Look for dice roll patterns in the AI response
        const dicePatterns = [
            /roll\s+a?\s*(d\d+)/gi,
            /make\s+a?\s*(d\d+)\s+roll/gi,
            /(d\d+)\s+check/gi,
            /(d\d+)\s+saving\s+throw/gi,
            /roll\s+(\d+d\d+)/gi,
            /(\d*)d(\d+)/gi
        ];
        
        let foundDice = [];
        
        dicePatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (let match of matches) {
                if (match[1]) {
                    let diceType = match[1].toLowerCase();
                    if (!diceType.startsWith('d')) {
                        diceType = 'd' + diceType.replace(/\d*d/, '');
                    }
                    if (this.diceImages[diceType] && !foundDice.includes(diceType)) {
                        foundDice.push(diceType);
                    }
                }
            }
        });
        
        // If we found dice requests, show them
        if (foundDice.length > 0) {
            this.showDiceRequest(foundDice);
        }
    }
    
    /**
     * Show the requested dice with a roll button
     */
    showDiceRequest(diceTypes) {
        const container = document.getElementById('dice-display');
        if (!container) return;
        
        const firstDice = diceTypes[0];
        const diceNumber = parseInt(firstDice.substring(1));
        
        container.innerHTML = `
            <div class="dice-request">
                <div class="dice-visual">
                    <div class="dice-icon large">${this.diceImages[firstDice]}</div>
                    <div class="dice-label">${this.diceNames[firstDice]}</div>
                </div>
                <button class="btn btn-primary roll-btn" onclick="diceSystem.rollRequestedDice('${firstDice}')">
                    🎲 Roll ${this.diceNames[firstDice]}
                </button>
                <div class="dice-result" id="dice-result" style="display: none;"></div>
            </div>
        `;
    }
    
    /**
     * Roll the requested dice and show result
     */
    async rollRequestedDice(diceType) {
        const diceNumber = parseInt(diceType.substring(1));
        const result = this.rollDie(diceNumber);
        
        const resultContainer = document.getElementById('dice-result');
        const rollButton = document.querySelector('.roll-btn');
        
        if (rollButton) rollButton.disabled = true;
        
        // Animate the roll
        if (resultContainer) {
            resultContainer.style.display = 'block';
            resultContainer.innerHTML = `
                <div class="rolling-animation">🎲</div>
            `;
        }
        
        // Show result after animation
        setTimeout(() => {
            if (resultContainer) {
                const isMax = result === diceNumber;
                const isMin = result === 1;
                
                resultContainer.innerHTML = `
                    <div class="result-number ${isMax ? 'critical-success' : isMin ? 'critical-failure' : ''}">
                        ${result}
                    </div>
                    <div class="result-text">
                        ${isMax ? '🌟 Maximum Roll!' : isMin ? '💀 Minimum Roll!' : `Rolled ${result}`}
                    </div>
                `;
                
                // Show toast notification
                const message = `Rolled ${result} on ${this.diceNames[diceType]}${isMax ? ' (Max!)' : isMin ? ' (Min!)' : ''}`;
                if (window.showToast) {
                    showToast(message, isMax ? 'success' : isMin ? 'error' : 'info');
                }
                
                // Add to game state if available
                if (typeof gameState !== 'undefined' && gameState.addToRollHistory) {
                    gameState.addToRollHistory({
                        dice: diceType,
                        result: result,
                        timestamp: new Date().toISOString(),
                        critical: isMax,
                        fumble: isMin && diceNumber === 20
                    });
                }
            }
        }, 1500);
    }
    
    /**
     * Roll a single die
     */
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }
    
    /**
     * Clear the dice display
     */
    clearDiceDisplay() {
        const container = document.getElementById('dice-display');
        if (container) {
            container.innerHTML = `
                <div class="dice-waiting">
                    <p>🎲 Dice rolls will appear here when requested by the game master</p>
                </div>
            `;
        }
    }
}

// Initialize dice system
const diceSystem = new DiceSystem();

// Export to global scope
window.diceSystem = diceSystem;
