/**
 * DiceTales Base - The Crystal of Shadows
 * Simplified AI-powered adventure game with pre-planned storyline
 */

class CrystalOfShadowsGame {
    constructor() {
        this.character = null;
        this.gameState = {
            currentChapter: 1,
            location: 'village',
            health: 20,
            maxHealth: 20,
            inventory: ['old map', 'basic sword', 'torch'],
            flags: {},
            storyProgress: []
        };
        
        // Pre-planned storyline structure
        this.storyline = {
            intro: {
                title: "The Village of Millbrook",
                description: "Your adventure begins in the peaceful village of Millbrook, where strange shadows have been appearing at night. The village elder has told you about an ancient crystal hidden in the nearby Shadowmere Forest that might be the key to stopping this darkness."
            },
            chapters: [
                {
                    id: 1,
                    title: "The Mysterious Shadows",
                    location: "village",
                    setup: "You stand in the village square as the sun sets. Dark shadows begin to move independently of their sources, creeping along the ground toward the villagers' homes.",
                    objectives: ["Investigate the shadows", "Talk to the village elder", "Prepare for the journey"],
                    keyEvents: ["shadow_investigation", "elder_meeting", "departure_prep"]
                },
                {
                    id: 2,
                    title: "Into the Shadowmere Forest",
                    location: "forest_entrance",
                    setup: "The ancient forest looms before you, its canopy so thick that even midday feels like twilight. Strange whispers seem to echo from within.",
                    objectives: ["Navigate the forest", "Find the old shrine", "Avoid the shadow creatures"],
                    keyEvents: ["forest_entry", "shrine_discovery", "creature_encounter"]
                },
                {
                    id: 3,
                    title: "The Crystal Cave",
                    location: "crystal_cave",
                    setup: "Deep within the forest, you discover a cave that glows with an eerie blue light. The Crystal of Shadows lies within, but it's guarded by a powerful shadow guardian.",
                    objectives: ["Enter the cave", "Solve the crystal puzzle", "Face the shadow guardian"],
                    keyEvents: ["cave_entry", "puzzle_solving", "guardian_battle"]
                },
                {
                    id: 4,
                    title: "The Final Confrontation",
                    location: "crystal_chamber",
                    setup: "You've reached the heart of the cave where the Crystal of Shadows pulses with dark energy. To cleanse it, you must face your own inner darkness.",
                    objectives: ["Confront your fears", "Purify the crystal", "Save the village"],
                    keyEvents: ["inner_darkness", "crystal_purification", "village_salvation"]
                }
            ]
        };
        
        this.aiResponses = new Map();
        this.initializeAIResponses();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Character form submission
        document.getElementById('character-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCharacter();
        });

        // Action submission
        document.getElementById('action-submit').addEventListener('click', () => {
            this.handleAction();
        });

        // Enter key in action input
        document.getElementById('action-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAction();
            }
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.performAction(action);
            });
        });
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.remove('active');
        }, 2000);
    }

    createCharacter() {
        const name = document.getElementById('char-name').value || 'Hero';
        const charClass = document.getElementById('char-class').value;
        const background = document.getElementById('char-background').value;

        this.character = {
            name: name,
            class: charClass,
            background: background,
            stats: this.generateStats(charClass)
        };

        this.updateCharacterDisplay();
        this.startGame();
    }

    generateStats(charClass) {
        const baseStats = { str: 12, dex: 12, con: 12, int: 12, wis: 12, cha: 12 };
        
        // Adjust stats based on class
        switch (charClass) {
            case 'warrior':
                baseStats.str += 3;
                baseStats.con += 2;
                break;
            case 'mage':
                baseStats.int += 3;
                baseStats.wis += 2;
                break;
            case 'rogue':
                baseStats.dex += 3;
                baseStats.cha += 2;
                break;
            case 'ranger':
                baseStats.dex += 2;
                baseStats.wis += 3;
                break;
            case 'paladin':
                baseStats.str += 2;
                baseStats.cha += 3;
                break;
            case 'cleric':
                baseStats.wis += 3;
                baseStats.con += 2;
                break;
        }
        
        return baseStats;
    }

    updateCharacterDisplay() {
        document.getElementById('character-name').textContent = this.character.name;
        document.getElementById('character-class').textContent = this.character.class.charAt(0).toUpperCase() + this.character.class.slice(1);
        document.getElementById('health').textContent = this.gameState.health;
    }

    startGame() {
        // Switch to game screen
        document.getElementById('character-setup').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        // Display intro story
        this.displayStoryEntry(
            `Welcome, ${this.character.name} the ${this.character.class}!`,
            this.storyline.intro.description,
            'story'
        );

        // Start first chapter
        setTimeout(() => {
            this.startChapter(1);
        }, 2000);
    }

    startChapter(chapterNumber) {
        const chapter = this.storyline.chapters[chapterNumber - 1];
        if (!chapter) return;

        this.gameState.currentChapter = chapterNumber;
        this.gameState.location = chapter.location;

        this.displayStoryEntry(
            `Chapter ${chapterNumber}: ${chapter.title}`,
            chapter.setup,
            'story'
        );
    }

    handleAction() {
        const actionInput = document.getElementById('action-input');
        const action = actionInput.value.trim();
        
        if (!action) return;

        actionInput.value = '';
        this.performAction(action);
    }

    performAction(action) {
        // Display user action
        this.displayStoryEntry(
            'Your Action',
            `You decide to ${action}.`,
            'user-action'
        );

        // Generate AI response
        setTimeout(() => {
            const response = this.generateAIResponse(action);
            this.displayStoryEntry('', response, 'story');
            
            // Check for chapter progression
            this.checkChapterProgression(action);
        }, 1000);
    }

    generateAIResponse(action) {
        const lowerAction = action.toLowerCase();
        const currentChapter = this.storyline.chapters[this.gameState.currentChapter - 1];
        
        // First check for specific story-advancing actions
        const storyResponse = this.getStorySpecificResponse(action, currentChapter);
        if (storyResponse) {
            return storyResponse;
        }
        
        // Check for general action patterns
        for (const [pattern, responses] of this.aiResponses) {
            if (lowerAction.includes(pattern)) {
                const contextualResponses = responses[this.gameState.location] || responses.default;
                return this.selectRandomResponse(contextualResponses);
            }
        }

        // Generate contextual response based on current chapter and location
        return this.generateContextualResponse(action, currentChapter);
    }

    generateContextualResponse(action, chapter) {
        // Try to create a response that acknowledges the specific action
        const lowerAction = action.toLowerCase();
        const actionVerb = this.extractActionVerb(action);
        
        const responses = {
            village: [
                `As you ${actionVerb}, the villagers watch you with a mixture of hope and fear. The shadows continue their unnatural movement across the square.`,
                `Your action draws the attention of several villagers, who whisper among themselves about the strange happenings that have plagued their home.`,
                `While you ${actionVerb}, you notice the shadows seem to recoil slightly from your presence, as if sensing something different about you.`,
                `The village elder observes your actions thoughtfully, clearly sizing you up as a potential solution to their shadow problem.`
            ],
            forest_entrance: [
                `As you ${actionVerb} in the ancient forest, the blue mushrooms pulse brighter, as if responding to your presence.`,
                `Your action causes the twisted branches overhead to creak ominously, and you feel unseen eyes watching from the darkness.`,
                `The forest seems to test you as you ${actionVerb}, with shadows shifting just beyond your vision.`,
                `Strange whispers echo through the trees as you ${actionVerb}, speaking in a language that predates human memory.`
            ],
            crystal_cave: [
                `The crystal formations hum more intensely as you ${actionVerb}, their blue light casting dancing patterns on the cave walls.`,
                `Your action causes the ancient runes to glow brighter, as if the cave itself is reacting to your presence.`,
                `As you ${actionVerb}, you feel the weight of ages pressing down on you, along with the expectation of something watching from the shadows.`,
                `The cave's magical energy swirls around you as you ${actionVerb}, filling the air with an almost tangible sense of anticipation.`
            ],
            crystal_chamber: [
                `The Crystal of Shadows pulses with dark energy as you ${actionVerb}, and your shadow self watches your every move with malevolent interest.`,
                `Your action causes ripples of power to emanate from the floating crystal, testing your resolve and inner strength.`,
                `As you ${actionVerb}, whispers of doubt and fear echo through the chamber, challenging your determination to save the village.`,
                `The final confrontation draws near as you ${actionVerb}, and you can feel the weight of destiny settling upon your shoulders.`
            ]
        };

        const locationResponses = responses[this.gameState.location] || responses.village;
        return this.selectRandomResponse(locationResponses);
    }

    extractActionVerb(action) {
        // Simple method to extract the main action from the player's input
        const words = action.toLowerCase().split(' ');
        const actionVerbs = ['walk', 'go', 'move', 'run', 'approach', 'examine', 'look', 'search', 'talk', 'speak', 'cast', 'use', 'take', 'pick', 'enter', 'exit', 'climb', 'jump', 'attack', 'defend'];
        
        for (const word of words) {
            if (actionVerbs.includes(word)) {
                return word;
            }
        }
        
        // If no specific verb found, return a generic phrase
        return action.toLowerCase();
    }

    getStorySpecificResponse(action, chapter) {
        const lowerAction = action.toLowerCase();
        
        // Chapter 1 - Village responses
        if (chapter.id === 1) {
            if (lowerAction.includes('home') || lowerAction.includes('house') || lowerAction.includes('door')) {
                return `You approach one of the modest homes lining the village square. Through the window, you see a family huddled together, watching the shadows with fearful eyes. When you knock, an elderly woman cracks the door open. "Please, brave one," she whispers, "the shadows came for my grandson last night. They whispered to him, tried to lure him outside. The village elder says you might be able to help us - that old shrine in the Shadowmere Forest holds the key to stopping this curse."`;
            }
            if (lowerAction.includes('elder') || lowerAction.includes('talk') && lowerAction.includes('village')) {
                return `The village elder, a weathered man with kind eyes, approaches you with urgency. "Thank the gods you've answered our call for help! These shadow creatures appeared three nights ago. They whisper to our children, trying to lure them into the darkness. I've consulted the old texts - there's an ancient shrine deep in the Shadowmere Forest. Legend speaks of a Crystal of Shadows that once protected our village. You must find it before the shadows claim us all!"`;
            }
            if (lowerAction.includes('shadow') || lowerAction.includes('investigate')) {
                return `You carefully observe the unnatural shadows creeping across the cobblestones. They move like living things, independent of any light source. As you watch, one shadow reaches toward a child's window before recoiling from the lamplight. You notice they all seem to flow from the same direction - toward the dark treeline of the Shadowmere Forest. A chill runs down your spine as you realize these aren't ordinary shadows, but something far more sinister.`;
            }
            if (lowerAction.includes('forest') || lowerAction.includes('journey') || lowerAction.includes('leave')) {
                this.gameState.flags.readyForForest = true;
                return `You gather your courage and decide it's time to venture into the Shadowmere Forest. The villagers watch as you check your equipment and steel yourself for the journey ahead. "May the light protect you," the elder calls out as you head toward the dark treeline. The forest looms ominously before you, its canopy so thick that even the afternoon sun barely penetrates the gloom.`;
            }
        }
        
        // Chapter 2 - Forest responses
        if (chapter.id === 2) {
            if (lowerAction.includes('path') || lowerAction.includes('follow') || lowerAction.includes('deeper')) {
                return `You follow the winding forest path, guided by strange blue mushrooms that seem to glow with their own inner light. The air grows colder as you venture deeper, and you notice that your own shadow seems to lag behind you, moving sluggishly. Ancient oak trees tower overhead, their gnarled branches forming a natural cathedral. In the distance, you hear the sound of running water and catch glimpses of a brighter blue glow ahead.`;
            }
            if (lowerAction.includes('mushroom') || lowerAction.includes('blue') || lowerAction.includes('glow')) {
                return `You examine the peculiar blue mushrooms more closely. They pulse with a gentle, rhythmic light that seems almost alive. When you touch one, it feels warm despite the forest's chill, and for a moment you hear distant whispers in a language you don't understand. These mushrooms appear to mark a safe path through the forest - wherever they grow, the malevolent shadows seem unable to reach.`;
            }
            if (lowerAction.includes('shrine') || lowerAction.includes('structure') || lowerAction.includes('building')) {
                return `Following the trail of blue mushrooms, you discover an ancient stone shrine covered in moss and carved with symbols that seem to shift when you're not looking directly at them. The shrine emanates a faint blue light, and you can feel powerful magic resonating from within. Behind the shrine, a narrow cave entrance glows with the same blue light. This must be the path to the Crystal of Shadows.`;
            }
            if (lowerAction.includes('cave') || lowerAction.includes('enter') || lowerAction.includes('inside')) {
                this.gameState.flags.foundCave = true;
                return `You approach the glowing cave entrance behind the shrine. The blue light pulses more intensely as you near, and you can feel ancient magic thrumming through the stone. Taking a deep breath, you step into the cave. The walls are lined with veins of luminescent crystal that cast dancing shadows on the rough stone surfaces. The path slopes downward, leading you deeper into the earth toward what can only be the Crystal of Shadows.`;
            }
        }
        
        // Chapter 3 - Cave responses
        if (chapter.id === 3) {
            if (lowerAction.includes('crystal') || lowerAction.includes('examine') || lowerAction.includes('approach')) {
                return `As you approach the massive crystal formations, they begin to hum with increasing intensity. The blue light shifts and swirls within them, almost like trapped souls trying to escape. You realize these smaller crystals are connected to something much larger deeper in the cave. Ancient runes carved into the walls begin to glow, spelling out warnings in the old tongue: "Beware the Guardian. Face thy shadow. Only the pure of heart may claim the Crystal's power."`;
            }
            if (lowerAction.includes('rune') || lowerAction.includes('read') || lowerAction.includes('decipher')) {
                return `You study the glowing runes more carefully. Though the language is ancient, the meaning becomes clear to you: "The Crystal of Shadows was sealed here long ago, guarded by the Shadow Guardian - a manifestation of the darkness in mortal hearts. To claim the crystal and break the curse, one must first confront and overcome their own inner shadow. Only then can the crystal's purifying light be restored to protect the village."`;
            }
            if (lowerAction.includes('guardian') || lowerAction.includes('deeper') || lowerAction.includes('chamber')) {
                this.gameState.flags.enteredMainChamber = true;
                return `You venture deeper into the cave, following the increasingly bright crystal formations. The passage opens into a vast underground chamber. At its center, suspended in the air by tendrils of dark energy, hovers the Crystal of Shadows - a massive gem that pulses between brilliant blue light and ominous darkness. Before you can approach, a shadow peels away from the cave wall, taking the shape of a dark mirror image of yourself. "So," it speaks with your voice, "you think yourself worthy to claim the crystal's power?"`;
            }
        }
        
        // Chapter 4 - Final chamber responses
        if (chapter.id === 4) {
            if (lowerAction.includes('shadow') || lowerAction.includes('face') || lowerAction.includes('confront')) {
                return `You steel yourself to face your shadow self. It speaks with your voice but with malice: "You know your failures, your doubts, your fears. Remember when you ran from danger? When you chose the easy path? You're no hero - you're just another coward pretending to be brave." But as you listen, you realize these words have no power over you anymore. You've grown through your journey, faced your fears, and chosen to help others despite the danger.`;
            }
            if (lowerAction.includes('purify') || lowerAction.includes('cleanse') || lowerAction.includes('crystal')) {
                return `With newfound confidence, you step toward the Crystal of Shadows. Your shadow self tries to block your path, but you walk through it like mist. As you touch the crystal, brilliant light floods the chamber. The dark energy dissipates, and the crystal's true form is revealed - a beacon of pure, protective light. You feel its power flowing through you, banishing the shadows that have plagued the village.`;
            }
            if (lowerAction.includes('village') || lowerAction.includes('return') || lowerAction.includes('save')) {
                return `With the Crystal of Shadows purified and its protective power restored, you make your way back through the forest to Millbrook. As you emerge from the treeline, you see the first natural shadows in days dancing normally in the sunlight. The villagers rush to greet you, their faces bright with joy and relief. The shadow curse has been broken, and the village is safe once more. You have proven yourself a true hero.`;
            }
        }
        
        return null; // Return null if no specific response found
    }

    selectRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    checkChapterProgression(action) {
        const currentChapter = this.gameState.currentChapter;
        const lowerAction = action.toLowerCase();

        // Chapter progression based on specific story flags and actions
        if (currentChapter === 1) {
            if (this.gameState.flags.readyForForest || 
                lowerAction.includes('forest') || 
                lowerAction.includes('journey') || 
                lowerAction.includes('venture') ||
                lowerAction.includes('leave village') ||
                lowerAction.includes('go to forest')) {
                setTimeout(() => {
                    this.displayStoryEntry(
                        'Journey to the Forest',
                        'You leave the village behind and approach the dark edge of the Shadowmere Forest. The trees seem to whisper warnings, but you steel your courage and step into the gloom.',
                        'story'
                    );
                    this.startChapter(2);
                }, 2000);
            }
        } else if (currentChapter === 2) {
            if (this.gameState.flags.foundCave || 
                lowerAction.includes('cave') || 
                lowerAction.includes('enter cave') ||
                lowerAction.includes('shrine') ||
                lowerAction.includes('crystal') ||
                lowerAction.includes('go deeper')) {
                setTimeout(() => {
                    this.displayStoryEntry(
                        'Into the Crystal Cave',
                        'The cave entrance beckons with its mysterious blue glow. You take a deep breath and step inside, feeling the ancient magic that permeates this sacred place.',
                        'story'
                    );
                    this.startChapter(3);
                }, 2000);
            }
        } else if (currentChapter === 3) {
            if (this.gameState.flags.enteredMainChamber || 
                lowerAction.includes('chamber') || 
                lowerAction.includes('guardian') ||
                lowerAction.includes('deeper') ||
                lowerAction.includes('approach crystal') ||
                lowerAction.includes('main chamber')) {
                setTimeout(() => {
                    this.displayStoryEntry(
                        'The Final Challenge',
                        'You stand before the Crystal of Shadows, but between you and your goal stands the Shadow Guardian - a dark reflection of yourself that you must overcome.',
                        'story'
                    );
                    this.startChapter(4);
                }, 2000);
            }
        } else if (currentChapter === 4) {
            if (lowerAction.includes('purify') || 
                lowerAction.includes('cleanse') || 
                lowerAction.includes('touch crystal') ||
                lowerAction.includes('save village') ||
                lowerAction.includes('complete') ||
                lowerAction.includes('finish')) {
                setTimeout(() => this.concludeStory(), 3000);
            }
        }
    }

    concludeStory() {
        this.displayStoryEntry(
            'Victory!',
            `Congratulations, ${this.character.name}! You have successfully purified the Crystal of Shadows. The dark energy dissipates, and you feel the oppressive presence lift from the forest. As you emerge from the cave, you see the first natural shadows in weeks dancing normally in the sunlight. The village of Millbrook is safe, and you have proven yourself a true hero. Your adventure in the Shadowmere Forest has come to a triumphant end, but who knows what other quests await you in the future?`,
            'story'
        );
    }

    displayStoryEntry(header, content, type) {
        const storyContent = document.getElementById('story-content');
        const entry = document.createElement('div');
        entry.className = `story-entry ${type}`;
        
        entry.innerHTML = `
            ${header ? `<div class="entry-header">${header}</div>` : ''}
            <div class="entry-content">${content}</div>
        `;
        
        storyContent.appendChild(entry);
        
        // Scroll to bottom
        const storyContainer = document.getElementById('story-container');
        storyContainer.scrollTop = storyContainer.scrollHeight;
        
        // Store in game state
        this.gameState.storyProgress.push({
            header: header,
            content: content,
            type: type,
            timestamp: new Date().toISOString()
        });
    }

    initializeAIResponses() {
        // Initialize contextual AI responses based on common actions
        this.aiResponses.set('look', {
            village: [
                "The village square is unusually quiet. Shadows seem to move independently, creeping along the ground in unnatural patterns.",
                "You see worried villagers peering from their windows, afraid to venture outside as darkness falls.",
                "The village well at the center of the square reflects no light, as if the shadows have consumed even its surface."
            ],
            forest_entrance: [
                "The forest stretches endlessly before you, its canopy so dense that little sunlight penetrates to the forest floor.",
                "Ancient oak trees tower overhead, their gnarled branches forming a natural cathedral of wood and shadow.",
                "A narrow path winds deeper into the forest, marked by strange blue glowing mushrooms."
            ],
            crystal_cave: [
                "The cave walls are lined with veins of dark crystal that pulse with an inner light.",
                "Strange formations jut from the ceiling, dripping with an otherworldly luminescence.",
                "Your torch reveals ancient carvings on the walls, depicting figures battling shadow creatures."
            ],
            default: [
                "You observe your surroundings carefully, taking note of every detail that might be important."
            ]
        });

        this.aiResponses.set('listen', {
            village: [
                "You hear hushed whispers from the villagers and the unusual absence of normal evening sounds.",
                "The wind carries an eerie silence, broken only by the occasional creak of a wooden shutter.",
                "Somewhere in the distance, you hear what sounds like voices calling for help, but they seem to fade when you focus on them."
            ],
            forest_entrance: [
                "The forest whispers with the sound of leaves rustling, but there's something unnatural about the rhythm.",
                "You hear the distant sound of running water and what might be voices carried on the wind.",
                "Strange clicks and chittering sounds echo from the depths of the forest, unlike any animal you know."
            ],
            crystal_cave: [
                "The crystals emit a low, harmonic hum that resonates through your bones.",
                "You hear the distant sound of dripping water and the echo of your own breathing.",
                "Whispers seem to emanate from the crystals themselves, speaking in a language you don't understand."
            ],
            default: [
                "You strain your ears, listening carefully to the sounds around you."
            ]
        });

        this.aiResponses.set('search', {
            village: [
                "Searching the village square, you find strange markings on the ground where the shadows seem darkest.",
                "Among the cobblestones, you discover small crystals that seem to absorb light rather than reflect it.",
                "You notice that all the shadows point toward the forest, regardless of where the light sources are."
            ],
            forest_entrance: [
                "Your search reveals an old stone marker covered in moss, with an arrow pointing deeper into the forest.",
                "You find tracks in the soft earth - some human, but others are strange and unidentifiable.",
                "Hidden beneath some fallen leaves, you discover a small crystal similar to those in the village."
            ],
            crystal_cave: [
                "Searching the cave floor, you find ancient coins and artifacts from previous adventurers.",
                "You discover a hidden passage behind one of the larger crystal formations.",
                "Your search reveals a pedestal in the center of the chamber, clearly meant to hold something important."
            ],
            default: [
                "You search the area thoroughly, looking for anything that might be useful or important."
            ]
        });

        this.aiResponses.set('talk', {
            village: [
                "The village elder approaches you with relief in his eyes. 'Thank the gods you've come! The shadows grow stronger each night.'",
                "A frightened villager tells you about the strange dreams that have been plaguing everyone since the shadows appeared.",
                "An old woman shares tales of the ancient crystal that was once used to protect the village from dark magic."
            ],
            default: [
                "You attempt to start a conversation, but there's no one around to talk to right now."
            ]
        });

        this.aiResponses.set('inventory', {
            default: [
                `You check your belongings. You currently carry: ${this.gameState.inventory.join(', ')}.`,
                "You take stock of your equipment, making sure everything is secure and ready for action.",
                "Your pack feels reassuringly heavy with the supplies you'll need for the journey ahead."
            ]
        });

        this.aiResponses.set('light', {
            default: [
                "You raise your torch high, pushing back the encroaching darkness and revealing more of your surroundings.",
                "Light flares from your torch, causing nearby shadows to retreat and dance in the flickering flame.",
                "The warm glow of your light brings comfort in this dark and uncertain place."
            ]
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CrystalOfShadowsGame();
});
