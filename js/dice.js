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
        
        this.isDiceRequestActive = false; // Track if dice request is currently active
        this.currentTurnId = null; // Track current turn ID
        this.hasRolledThisTurn = false; // Track if user has already rolled in current turn
        this.turnStartTime = null; // Track when current turn started
        this.testMode = false; // Test mode allows unlimited rolls
        
        this.init();
    }
    
    /**
     * Start a new turn - called when AI generates a new response requiring dice
     */
    startNewTurn() {
        this.currentTurnId = `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.hasRolledThisTurn = false;
        this.turnStartTime = new Date().toISOString();
        
        console.log('🎯 New turn started:', this.currentTurnId);
        
        // Store turn info in game state if available
        if (typeof gameState !== 'undefined') {
            gameState.set('ui.currentTurn', {
                id: this.currentTurnId,
                hasRolled: false,
                startTime: this.turnStartTime
            });
        }
    }

    /**
     * Check if user can roll dice (hasn't rolled this turn, or in test mode)
     */
    canRollDice() {
        return this.testMode || !this.hasRolledThisTurn;
    }

    /**
     * Mark that user has rolled dice this turn
     */
    markDiceRolled() {
        this.hasRolledThisTurn = true;
        
        // Update game state if available
        if (typeof gameState !== 'undefined') {
            gameState.update('ui.currentTurn', { hasRolled: true });
        }
        
        console.log('🎯 Dice rolled for turn:', this.currentTurnId);
    }

    /**
     * Get turn status for display
     */
    getTurnStatus() {
        return {
            turnId: this.currentTurnId,
            hasRolled: this.hasRolledThisTurn,
            canRoll: this.canRollDice(),
            startTime: this.turnStartTime
        };
    }

    init() {
        // Listen for AI responses that contain dice roll requests
        if (typeof eventBus !== 'undefined') {
            eventBus.on('ai:response', (content) => {
                this.detectAndShowDiceRequest(content);
            });
            
            // Listen for forced dice roll requests (always show dice after AI responses)
            eventBus.on('force:dice:show', (data) => {
                console.log('🎲 Forced dice show event received:', data);
                console.log('🎲 Data.diceType:', data.diceType);
                console.log('🎲 Calling showDiceRequest with:', [data.diceType || 'd20']);
                // Start new turn when dice is requested
                this.startNewTurn();
                this.showDiceRequest([data.diceType || 'd20']);
            });
            
            // Clear dice display when new story content starts (disabled during active game)
            eventBus.on('story:new', () => {
                // Only clear if no active dice request is pending
                if (!this.isDiceRequestActive) {
                    console.log('🎲 story:new event - clearing dice display');
                    this.clearDiceDisplay();
                } else {
                    console.log('🎲 story:new event - keeping dice display (active request)');
                }
            });
            
            // Show thinking state when AI is processing
            eventBus.on('ai:thinking', () => {
                this.showThinkingState();
                
                // Set a timeout to clear thinking state if it gets stuck
                if (this.thinkingTimeout) {
                    clearTimeout(this.thinkingTimeout);
                }
                this.thinkingTimeout = setTimeout(() => {
                    const container = document.getElementById('dice-display');
                    if (container && container.innerHTML.includes('analyzing')) {
                        console.log('🎲 Thinking state timeout - clearing');
                        this.clearDiceDisplay();
                    }
                }, 10000); // 10 second timeout
            });
            
            // Show ready state when AI finishes
            eventBus.on('ai:complete', () => {
                if (this.thinkingTimeout) {
                    clearTimeout(this.thinkingTimeout);
                    this.thinkingTimeout = null;
                }
                
                // Only clear if we're still in thinking state
                const container = document.getElementById('dice-display');
                if (container && container.innerHTML.includes('analyzing')) {
                    this.clearDiceDisplay();
                }
            });
        }
        
        // Also initialize the dice display immediately (but not with default state during game)
        // Only show default state if no game is active
        if (!gameState || !gameState.getCampaign || !gameState.getCampaign().id) {
            this.clearDiceDisplay();
        }
        
        // Watch for skill check notifications
        this.watchForSkillCheckNotifications();
        
        // Test if dice display exists
        setTimeout(() => {
            const container = document.getElementById('dice-display');
            if (container) {
                console.log('🎲 Dice system initialized successfully');
            } else {
                console.warn('🎲 Dice display container not found');
            }
        }, 1000);
    }
    
    /**
     * Watch for skill check notifications and auto-trigger dice
     * Currently disabled to prevent false triggers - only manual detection through AI responses
     */
    watchForSkillCheckNotifications() {
        // Temporarily disabled - the DOM watching was too aggressive
        // and triggered on any mention of dice/roll/skill check in the story
        console.log('🎲 DOM watching disabled - using AI response detection only');
        
        /* DISABLED CODE:
        // Observer to watch for new elements being added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is a SPECIFIC skill check notification (not story text)
                        const text = node.textContent || '';
                        // Only trigger on very specific notification patterns
                        if (node.classList && (node.classList.contains('skill-check-notification') || 
                                               node.classList.contains('dice-request-notification'))) {
                            console.log('🎲 Auto-detected skill check notification, showing D20');
                            setTimeout(() => {
                                this.showDiceRequest(['d20']);
                            }, 500);
                        }
                    }
                });
            });
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        */
    }
    
    /**
     * Detect dice roll requests in AI content and show appropriate dice
     */
    detectAndShowDiceRequest(content) {
        if (!content || typeof content !== 'string') return;
        
        console.log('🎲 Checking content for dice requests:', content.substring(0, 100));
        
        // First check for exclusion patterns - these indicate the AI is just telling a story, not requesting rolls
        const exclusionPatterns = [
            /you see.*dice.*table/gi,        // More specific: dice on a table/game
            /tavern.*dice.*game/gi,          // More specific: tavern dice games
            /gambling.*with.*dice/gi,        // More specific: gambling context
            /story.*about.*dice/gi,          // More specific: story about dice
            /tale.*of.*dice/gi,              // More specific: tale of dice
            /once.*rolled.*dice/gi,          // More specific: past dice rolls
            /previously.*rolled/gi,          // Past rolls
            /in.*the.*past.*roll/gi,         // Past context
            /think.*about.*rolling/gi        // "think about rolling" is contemplative
        ];
        
        // If any exclusion patterns match, don't show dice
        for (let pattern of exclusionPatterns) {
            if (pattern.test(content)) {
                console.log('🎲 Exclusion pattern matched - not showing dice for story content:', pattern.source);
                return;
            }
        }
        
        // Look for dice roll commands - made more flexible to catch more patterns
        const explicitDicePatterns = [
            /^roll\s+a?\s*(d\d+)/gi,        // "Roll a d20" at start of sentence
            /\.\s*roll\s+a?\s*(d\d+)/gi,    // "Roll a d20" after a period
            /!\s*roll\s+a?\s*(d\d+)/gi,     // "Roll a d20" after exclamation
            /now\s+roll\s+a?\s*(d\d+)/gi,   // "Now roll a d20"
            /you\s+must\s+roll\s+a?\s*(d\d+)/gi, // "You must roll a d20"
            /roll\s+(\d+d\d+)\s+now/gi,     // "Roll 1d20 now"
            /time\s+to\s+roll\s+a?\s*(d\d+)/gi,  // "Time to roll a d20"
            /make\s+a?\s*(d\d+)\s+roll/gi,  // "Make a d20 roll"
            /roll\s+a?\s*(d\d+)\s+for/gi,   // "Roll a d20 for"
            /\broll\s+a?\s*(d\d+)/gi,       // More flexible "roll d20" anywhere
            /attempt\s+a?\s*(d\d+)\s+roll/gi, // "Attempt a d20 roll"
            /make\s+an?\s+([\w\s]+)\s+attempt/gi, // "Make an attempt" - generic
            /roll\s+for\s+([\w\s]+)/gi      // "Roll for stealth" - generic
        ];
        
        let foundDice = [];
        let foundGenericRoll = false;
        
        explicitDicePatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (let match of matches) {
                console.log('🎲 Found EXPLICIT dice pattern match:', match[0]);
                if (match[1]) {
                    let diceType = match[1].toLowerCase();
                    if (!diceType.startsWith('d')) {
                        diceType = 'd' + diceType.replace(/\d*d/, '');
                    }
                    if (this.diceImages[diceType] && !foundDice.includes(diceType)) {
                        foundDice.push(diceType);
                    }
                } else {
                    // Generic roll pattern found (like "make a skill check")
                    foundGenericRoll = true;
                }
            }
        });
        
        // Also check for challenge patterns that don't specify dice
        const challengePatterns = [
            /challenge/gi,
            /test\s+your/gi,
            /attempt\s+to/gi,
            /try\s+to/gi,
            /check\s+if/gi
        ];
        
        challengePatterns.forEach(pattern => {
            if (pattern.test(content)) {
                console.log('🎲 Found challenge pattern:', pattern.source);
                foundGenericRoll = true;
            }
        });
        
        // If no specific dice found but generic patterns detected, default to D20
        if (foundDice.length === 0 && foundGenericRoll) {
            foundDice.push('d20');
        }
        
        // If we found dice requests, show them immediately
        if (foundDice.length > 0) {
            console.log('🎲 Found EXPLICIT dice requests:', foundDice);
            // Start new turn when dice is requested via AI response detection
            this.startNewTurn();
            this.showDiceRequest(foundDice);
        } else {
            console.log('🎲 No explicit dice requests found in content');
        }
    }

    /**
     * Show the requested dice with a roll button
     */
    showDiceRequest(diceTypes) {
        const container = document.getElementById('dice-display');
        if (!container) {
            console.warn('🎲 Dice display container not found');
            return;
        }
        
        this.isDiceRequestActive = true; // Mark dice request as active
        
        const firstDice = diceTypes[0];
        const diceNumber = parseInt(firstDice.substring(1));
        
        console.log('🎲 Showing dice request for:', firstDice);
        console.log('🎯 Can roll dice this turn:', this.canRollDice());
        
        // Check if user has already rolled this turn
        if (!this.canRollDice()) {
            container.innerHTML = `
                <div class="dice-request dice-already-rolled" style="animation: slideInUp 0.5s ease-out;">
                    <div class="dice-prompt" style="text-align: center; margin-bottom: 15px; padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 8px; border-left: 4px solid #FF9800;">
                        <strong style="color: #FF9800;">⏸️ One Roll Per Turn</strong>
                        <p style="margin: 5px 0 0 0; color: var(--text-secondary);">You've already rolled dice this turn!</p>
                    </div>
                    <div class="dice-visual">
                        <div class="dice-icon large" style="font-size: 4rem; text-shadow: 0 4px 8px rgba(0,0,0,0.3); opacity: 0.5;">${this.diceImages[firstDice]}</div>
                        <div class="dice-label" style="font-size: 1.5rem; font-weight: bold; color: var(--text-secondary); opacity: 0.7;">${this.diceNames[firstDice]} (Used)</div>
                    </div>
                    <div class="turn-restriction-message" style="background: rgba(255, 152, 0, 0.05); padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid rgba(255, 152, 0, 0.2);">
                        <div style="font-size: 1.1rem; font-weight: 600; color: #FF9800; margin-bottom: 8px;">🎯 Turn-Based Restriction</div>
                        <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
                            In DiceTales, you can only roll <strong>one die per turn</strong> to maintain tactical decision-making. 
                            Wait for the Game Master to continue the story and start a new turn.
                        </p>
                        <div style="margin-top: 10px; font-size: 0.8rem; opacity: 0.8; color: var(--text-secondary);">
                            Turn ID: ${this.currentTurnId || 'Unknown'}
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="dice-request" style="animation: slideInUp 0.5s ease-out;">
                <div class="dice-prompt" style="text-align: center; margin-bottom: 15px; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 8px; border-left: 4px solid #2196F3;">
                    <strong style="color: #2196F3;">🎲 Dice Roll Required!</strong>
                    <p style="margin: 5px 0 0 0; color: var(--text-secondary);">The outcome depends on your roll...</p>
                    <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary); opacity: 0.8;">
                        💡 You get <strong>one roll per turn</strong> - make it count!
                    </div>
                </div>
                <div class="dice-visual">
                    <div class="dice-icon large" style="font-size: 4rem; text-shadow: 0 4px 8px rgba(0,0,0,0.3);">${this.diceImages[firstDice]}</div>
                    <div class="dice-label" style="font-size: 1.5rem; font-weight: bold; color: var(--accent-primary);">${this.diceNames[firstDice]}</div>
                </div>
                <button class="btn btn-primary roll-btn" onclick="diceSystem.rollRequestedDice('${firstDice}')" style="padding: 15px 30px; font-size: 1.2rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover)); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    🎲 Roll ${this.diceNames[firstDice]}
                </button>
                <div class="turn-info" style="margin-top: 10px; font-size: 0.8rem; color: var(--text-secondary); opacity: 0.7; text-align: center;">
                    Turn: ${this.currentTurnId ? this.currentTurnId.split('_')[1] : 'Active'}
                </div>
            </div>
        `;
        
        // Add hover effect to roll button
        const rollBtn = container.querySelector('.roll-btn');
        if (rollBtn) {
            rollBtn.addEventListener('mouseenter', () => {
                rollBtn.style.transform = 'translateY(-2px)';
                rollBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            });
            rollBtn.addEventListener('mouseleave', () => {
                rollBtn.style.transform = 'translateY(0)';
                rollBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            });
        }
    }
    
    /**
     * Roll the requested dice and show result
     */
    async rollRequestedDice(diceType) {
        console.log('🎲 Rolling dice:', diceType);
        
        // Check if user can roll dice this turn
        if (!this.canRollDice()) {
            console.log('🎯 User already rolled this turn, preventing roll');
            if (typeof showToast === 'function') {
                showToast('You can only roll one die per turn!', 'warning');
            } else {
                console.warn('You can only roll one die per turn!');
            }
            return;
        }
        
        const diceNumber = parseInt(diceType.substring(1));
        const result = this.rollDie(diceNumber);
        console.log('🎲 Dice result:', result);
        
        // Mark that user has rolled dice this turn
        this.markDiceRolled();
        
        // Use the proper dice-display container instead of dice-result
        const diceDisplay = document.getElementById('dice-display');
        const rollButton = document.querySelector('.roll-btn');
        
        console.log('🎲 Dice display container found:', !!diceDisplay);
        console.log('🎲 Roll button found:', !!rollButton);
        
        if (!diceDisplay) {
            console.error('🎲 Dice display container not found!');
            return;
        }
        
        if (rollButton) {
            rollButton.disabled = true;
            rollButton.innerHTML = '🎲 Rolling...';
            rollButton.style.opacity = '0.6';
        }
        
        // Show rolling animation in the proper container
        diceDisplay.innerHTML = `
            <div class="rolling-animation" style="font-size: 3rem; animation: spin 0.1s linear infinite; text-align: center;">🎲</div>
            <p style="color: var(--text-secondary); margin-top: 10px; text-align: center;">Rolling the dice...</p>
        `;
        
        // Show result after animation with enhanced visuals
        setTimeout(() => {
            console.log('🎲 Showing result after timeout');
            
            const isMax = result === diceNumber;
            const isMin = result === 1;
            const isCritical = diceNumber === 20;
            
            console.log('🎲 Result calculations:', { result, diceNumber, isMax, isMin, isCritical });
            
            let resultColor = 'var(--text-primary)';
            let resultBg = 'var(--surface-secondary)';
            let resultText = `Rolled ${result}`;
            let emoji = '🎯';
            
            if (isMax) {
                resultColor = 'var(--success-color)';
                resultBg = 'rgba(76, 175, 80, 0.1)';
                resultText = isCritical ? '🌟 Critical Success!' : '🌟 Maximum Roll!';
                emoji = '🌟';
            } else if (isMin && isCritical) {
                resultColor = 'var(--error-color)';
                resultBg = 'rgba(244, 67, 54, 0.1)';
                resultText = '💀 Critical Failure!';
                emoji = '💀';
            } else if (result >= diceNumber * 0.75) {
                resultColor = 'var(--success-color)';
                resultText = '✨ Great Roll!';
                emoji = '✨';
            } else if (result <= diceNumber * 0.25) {
                resultColor = 'var(--warning-color)';
                resultText = '😅 Could be better...';
                emoji = '😅';
            }
            
            const resultHTML = `
                <div class="dice-result-display" style="background: ${resultBg}; border-radius: 12px; padding: 25px; border: 3px solid ${resultColor}; animation: bounceIn 0.6s ease-out; margin: 15px 0; text-align: center; width: 100%;">
                    <div class="dice-result-header" style="margin-bottom: 15px;">
                        <div style="font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">🎲 ${this.diceNames[diceType]} RESULT</div>
                    </div>
                    <div class="result-number" style="font-size: 4rem; font-weight: bold; color: ${resultColor}; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 15px;">
                        ${result}
                    </div>
                    <div class="result-text" style="font-size: 1.3rem; font-weight: 600; color: ${resultColor}; margin-bottom: 15px;">
                        ${emoji} ${resultText}
                    </div>
                    <div class="result-details" style="font-size: 1rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 15px;">
                        Roll: ${result} out of ${diceNumber} possible
                    </div>
                    <div class="turn-complete-notice" style="background: rgba(255, 152, 0, 0.05); padding: 10px; border-radius: 6px; margin-top: 15px; border: 1px solid rgba(255, 152, 0, 0.2);">
                        <div style="font-size: 0.9rem; color: #FF9800; font-weight: 600;">⏸️ Turn Complete</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                            You've used your one dice roll for this turn. Wait for the GM to continue the story.
                        </div>
                    </div>
                </div>
            `;
            
            console.log('🎲 Setting result HTML in dice-display container');
            diceDisplay.innerHTML = resultHTML;
            
            // Add to game state if available
            if (typeof gameState !== 'undefined' && gameState.addToRollHistory) {
                gameState.addToRollHistory({
                    dice: diceType,
                    result: result,
                    timestamp: new Date().toISOString(),
                    critical: isMax,
                    fumble: isMin && diceNumber === 20,
                    turnId: this.currentTurnId
                });
            }
            
            // Emit dice roll event for AI system
            if (typeof eventBus !== 'undefined') {
                eventBus.emit('dice:rolled', {
                    dice: diceType,
                    result: result,
                    total: result,
                    type: this.diceNames[diceType],
                    critical: isMax,
                    fumble: isMin && diceNumber === 20,
                    timestamp: new Date().toISOString(),
                    turnId: this.currentTurnId
                });
            }
            
            // Mark dice request as complete
            this.isDiceRequestActive = false;
            
            // Don't show roll again button since we only allow one roll per turn
            console.log('🎯 Roll complete for turn:', this.currentTurnId);
        }, 1000); // Shorter timeout for better UX
    }
    
    /**
     * Roll a single die
     */
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }
    
    /**
     * Show a status message in the dice area (can be used for general feedback)
     */
    showStatusMessage(message, type = 'info') {
        const container = document.getElementById('dice-display');
        if (container) {
            let icon = '🎲';
            let color = 'var(--text-secondary)';
            
            switch(type) {
                case 'success':
                    icon = '✅';
                    color = 'var(--success-color)';
                    break;
                case 'warning':
                    icon = '⚠️';
                    color = 'var(--warning-color)';
                    break;
                case 'error':
                    icon = '❌';
                    color = 'var(--error-color)';
                    break;
                case 'processing':
                    icon = '⏳';
                    color = 'var(--accent-primary)';
                    break;
            }
            
            container.innerHTML = `
                <div class="dice-status" style="text-align: center; padding: 20px; color: ${color};">
                    <div style="font-size: 2rem; margin-bottom: 10px;">${icon}</div>
                    <p style="font-size: 1rem; margin: 0;">${message}</p>
                </div>
            `;
        }
    }

    /**
     * Show thinking/processing state
     */
    showThinkingState() {
        const container = document.getElementById('dice-display');
        if (container) {
            // Don't show thinking state if there's already a dice request active
            if (container.innerHTML.includes('dice-request') || container.innerHTML.includes('Roll D')) {
                console.log('🎲 Dice request already active, not showing thinking state');
                return;
            }
            
            container.innerHTML = `
                <div class="dice-thinking" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 10px; animation: pulse 2s infinite;">🎭</div>
                    <p style="margin-bottom: 10px; font-size: 1rem;">Game Master is analyzing the situation...</p>
                    <div style="display: flex; justify-content: center; gap: 5px; margin-bottom: 15px;">
                        <div class="thinking-dot" style="width: 8px; height: 8px; background: var(--accent-primary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
                        <div class="thinking-dot" style="width: 8px; height: 8px; background: var(--accent-primary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
                        <div class="thinking-dot" style="width: 8px; height: 8px; background: var(--accent-primary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div>
                    </div>
                    <p style="font-size: 0.8rem; opacity: 0.7;">Preparing dice rolls if needed...</p>
                </div>
            `;
        }
    }

    /**
     * Clear the dice display
     */
    clearDiceDisplay() {
        const container = document.getElementById('dice-display');
        if (container) {
            container.innerHTML = `
                <div class="dice-waiting" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.6;">🎲</div>
                    <p style="margin-bottom: 15px; font-size: 1.1rem;">Ready for adventure!</p>
                    <p style="margin-bottom: 20px; font-size: 0.9rem; opacity: 0.8;">Dice rolls will appear here when the game master calls for them</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="diceSystem.testDiceRoll('d20')" style="padding: 8px 16px; font-size: 0.9rem;">
                            🎲 Test D20
                        </button>
                        <button class="btn btn-secondary" onclick="diceSystem.testDiceRoll('d6')" style="padding: 8px 16px; font-size: 0.9rem;">
                            ⚀ Test D6
                        </button>
                    </div>
                    <div style="margin-top: 15px; font-size: 0.8rem; opacity: 0.6;">
                        💡 Tip: The system enforces one dice roll per turn for strategic gameplay!
                    </div>
                    ${this.hasRolledThisTurn ? `
                        <div style="margin-top: 10px; padding: 8px; background: rgba(255, 152, 0, 0.1); border-radius: 6px; border: 1px solid rgba(255, 152, 0, 0.2);">
                            <div style="font-size: 0.8rem; color: #FF9800;">⏸️ Turn Status: Already rolled this turn</div>
                            <button class="btn btn-warning" onclick="diceSystem.resetCurrentTurn()" style="margin-top: 5px; padding: 4px 8px; font-size: 0.7rem;">
                                🔄 Reset Turn (Debug)
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }
    
    /**
     * Manually trigger a dice roll for testing
     */
    testDiceRoll(diceType = 'd20') {
        console.log('🎲 Testing dice roll:', diceType);
        // Start new turn for testing
        this.startNewTurn();
        this.showDiceRequest([diceType]);
    }

    /**
     * Force show dice request (bypass all restrictions for testing)
     */
    forceShowDice(diceType = 'd20') {
        console.log('🎲 Force showing dice:', diceType);
        this.startNewTurn();
        this.showDiceRequest([diceType]);
    }

    /**
     * Test the dice detection system with sample text
     */
    testDiceDetection(text) {
        console.log('🎲 Testing dice detection with text:', text);
        this.detectAndShowDiceRequest(text);
    }

    /**
     * Reset current turn (for debugging/admin purposes)
     */
    resetCurrentTurn() {
        console.log('🎯 Manually resetting current turn');
        this.hasRolledThisTurn = false;
        this.currentTurnId = null;
        this.turnStartTime = null;
        
        if (typeof gameState !== 'undefined') {
            gameState.set('ui.currentTurn', null);
        }
        
        if (typeof showToast === 'function') {
            showToast('Turn reset - you can roll dice again', 'info');
        } else {
            console.log('Turn reset - you can roll dice again');
        }
    }

    /**
     * Enable test mode - allows unlimited rolls for testing
     */
    enableTestMode() {
        this.testMode = true;
        console.log('🎲 Test mode enabled - unlimited dice rolls');
        if (typeof showToast === 'function') {
            showToast('Test mode enabled - unlimited dice rolls', 'info');
        }
    }

    /**
     * Disable test mode - back to normal turn restrictions
     */
    disableTestMode() {
        this.testMode = false;
        console.log('🎲 Test mode disabled - normal turn restrictions');
        if (typeof showToast === 'function') {
            showToast('Test mode disabled - normal turn restrictions', 'info');
        }
    }
}

// Initialize dice system
const diceSystem = new DiceSystem();

// Export to global scope for easy access
window.DiceSystem = DiceSystem;
window.diceSystem = diceSystem;

// Also add a global status function for convenience
window.showDiceStatus = (message, type) => diceSystem.showStatusMessage(message, type);
