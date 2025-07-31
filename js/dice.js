/**
 * DiceTales - Dice System
 * 3D dice rolling with physics and animations
 */

class DiceSystem {
    constructor() {
        this.availableDice = {
            'd4': { sides: 4, name: 'D4', icon: '▲' },
            'd6': { sides: 6, name: 'D6', icon: '⚀' },
            'd8': { sides: 8, name: 'D8', icon: '♦' },
            'd10': { sides: 10, name: 'D10', icon: '⬟' },
            'd12': { sides: 12, name: 'D12', icon: '⬢' },
            'd20': { sides: 20, name: 'D20', icon: '⚛' },
            'd100': { sides: 100, name: 'D%', icon: '%' }
        };
        
        this.selectedDice = ['d20'];
        this.rollHistory = [];
        this.isRolling = false;
        
        this.init();
    }
    
    init() {
        this.renderDiceSelection();
        this.bindEvents();
        this.updateRollButton();
    }
    
    renderDiceSelection() {
        const container = document.getElementById('dice-selection');
        if (!container) return;
        
        container.innerHTML = Object.entries(this.availableDice).map(([key, dice]) => `
            <button class="dice-type-btn ${this.selectedDice.includes(key) ? 'selected' : ''}" 
                    data-dice="${key}">
                <div class="dice-icon">${dice.icon}</div>
                <div class="dice-label">${dice.name}</div>
            </button>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.dice-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diceType = btn.dataset.dice;
                this.toggleDiceSelection(diceType);
            });
        });
    }
    
    toggleDiceSelection(diceType) {
        const index = this.selectedDice.indexOf(diceType);
        if (index > -1) {
            this.selectedDice.splice(index, 1);
        } else {
            this.selectedDice.push(diceType);
        }
        
        this.renderDiceSelection();
        this.updateRollButton();
        
        // Save to game state
        gameState.setSetting('dice_preferences', this.selectedDice);
    }
    
    updateRollButton() {
        const rollBtn = document.getElementById('roll-dice-btn');
        if (rollBtn) {
            rollBtn.disabled = this.selectedDice.length === 0 || this.isRolling;
            rollBtn.textContent = this.isRolling ? 'Rolling...' : `🎲 Roll ${this.selectedDice.length} Dice`;
        }
    }
    
    async rollDice() {
        if (this.isRolling || this.selectedDice.length === 0) return;
        
        this.isRolling = true;
        this.updateRollButton();
        
        const results = [];
        const diceDisplay = document.getElementById('dice-display');
        
        // Clear previous results
        if (diceDisplay) {
            diceDisplay.innerHTML = '';
        }
        
        // Roll each selected dice
        for (const diceType of this.selectedDice) {
            const result = this.rollSingleDie(diceType);
            results.push(result);
            
            if (diceDisplay) {
                this.renderDiceAnimation(diceDisplay, diceType, result.value);
            }
        }
        
        // Wait for animations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.isRolling = false;
        this.updateRollButton();
        
        // Process results
        this.processRollResults(results);
        
        return results;
    }
    
    rollSingleDie(diceType) {
        const dice = this.availableDice[diceType];
        const value = randomInt(1, dice.sides);
        
        return {
            dice: diceType,
            sides: dice.sides,
            value: value,
            timestamp: new Date().toISOString(),
            critical: value === dice.sides,
            fumble: value === 1 && dice.sides === 20
        };
    }
    
    renderDiceAnimation(container, diceType, result) {
        const diceElement = createElement('div', {
            className: `dice-3d ${diceType} rolling`,
            innerHTML: this.getDiceFaces(diceType, result)
        });
        
        container.appendChild(diceElement);
        
        // Add result display after animation
        setTimeout(() => {
            diceElement.classList.remove('rolling');
            
            const resultElement = createElement('div', {
                className: `dice-result ${result === this.availableDice[diceType].sides ? 'critical-success' : result === 1 ? 'critical-failure' : ''}`,
                textContent: result
            });
            
            diceElement.appendChild(resultElement);
        }, 1500);
    }
    
    getDiceFaces(diceType, result) {
        // Simple implementation - in a full version, this would render proper 3D faces
        return `<div class="dice-face front">${result}</div>`;
    }
    
    processRollResults(results) {
        const total = results.reduce((sum, r) => sum + r.value, 0);
        const hasCritical = results.some(r => r.critical);
        const hasFumble = results.some(r => r.fumble);
        
        // Add to history
        const rollData = {
            id: generateId('roll'),
            timestamp: new Date().toISOString(),
            dice: this.selectedDice.slice(),
            results: results,
            total: total,
            critical: hasCritical,
            fumble: hasFumble
        };
        
        this.rollHistory.unshift(rollData);
        gameState.addToRollHistory(rollData);
        
        // Emit event for other systems
        eventBus.emit('dice:rolled', rollData);
        
        // Show notification
        let message = `Rolled ${total}`;
        if (hasCritical) message += ' (Critical!)';
        if (hasFumble) message += ' (Fumble!)';
        
        showToast(message, hasCritical ? 'success' : hasFumble ? 'error' : 'info');
    }
    
    bindEvents() {
        const rollBtn = document.getElementById('roll-dice-btn');
        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.rollDice());
        }
        
        // Listen for game state changes
        eventBus.on('gameState:loaded', () => {
            const savedDice = gameState.getSetting('dice_preferences');
            if (savedDice && savedDice.length > 0) {
                this.selectedDice = savedDice;
                this.renderDiceSelection();
                this.updateRollButton();
            }
        });
    }
}

// Initialize dice system
const diceSystem = new DiceSystem();

// Export to global scope
window.diceSystem = diceSystem;
