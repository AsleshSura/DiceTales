/**
 * Simple AI Service using a public JSON API
 * Fallback when HuggingFace has issues
 */

class SimpleAI {
    constructor() {
        this.storyTemplates = [
            "In the depths of the ancient {location}, you {action}. The {atmosphere} air carries whispers of {mystery}, and you notice {detail}. Your {equipment} glows faintly as {consequence}. What do you do?",
            
            "The {weather} sky above mirrors your {emotion} as you {movement} through the {terrain}. In the distance, {observation}, while {character} {characterAction}. The {object} in your possession {reaction}. How do you proceed?",
            
            "As you {decision}, the very fabric of magic {effect} around you. The {location} {transformation}, revealing {discovery}. A {creature} {creatureAction}, and you sense that {foreshadowing}. What is your next move?",
            
            "Your footsteps echo through the {location} as {environment}. The {item} you carry {itemEffect}, drawing the attention of {entity}. Time seems to {timeEffect} as {climax}. How do you respond?",
            
            "The ancient runes on the {surface} begin to {runeEffect} as you {approach}. {character} emerges from {hidingPlace}, {expression} clearly visible. The {artifact} {artifactReaction}, and you realize {realization}. What action do you take?"
        ];

        this.choiceSets = [
            [
                "Examine the {object} more closely",
                "Approach the {character} with caution", 
                "Search for a hidden {passage}",
                "Use your {skill} to {action}"
            ],
            [
                "Draw your {weapon} and prepare for combat",
                "Attempt to {social} with the {entity}",
                "Try to {stealth} past unnoticed", 
                "Cast a {spell} to {effect}"
            ],
            [
                "Enter the mysterious {location}",
                "Investigate the strange {phenomenon}",
                "Call out to the {character}",
                "Retreat and {alternative}"
            ],
            [
                "Follow the {path} deeper",
                "Set up camp and {rest}",
                "Climb the {obstacle}",
                "Use the {item} from your pack"
            ]
        ];

        this.wordBank = {
            location: ["chamber", "cavern", "temple", "grove", "ruins", "sanctuary", "hall", "tower"],
            action: ["step forward", "investigate", "listen carefully", "examine the walls", "search methodically"],
            atmosphere: ["musty", "electric", "mystical", "ancient", "ethereal", "charged", "sacred"],
            mystery: ["forgotten secrets", "ancient power", "hidden dangers", "lost knowledge", "divine presence"],
            detail: ["carved symbols", "flickering lights", "moving shadows", "strange sounds", "glowing crystals"],
            equipment: ["sword", "staff", "amulet", "compass", "torch", "shield", "pendant"],
            consequence: ["danger approaches", "magic stirs", "mysteries deepen", "paths reveal themselves"],
            weather: ["storm-torn", "star-filled", "misty", "crimson", "ethereal", "moonlit"],
            emotion: ["determination", "curiosity", "caution", "excitement", "resolve", "wonder"],
            movement: ["stride confidently", "move carefully", "press onward", "advance slowly"],
            terrain: ["mountain path", "forest clearing", "stone corridor", "winding trail"],
            observation: ["lights flicker", "shadows move", "voices echo", "energy pulses"],
            character: ["hooded figure", "ancient guardian", "wise elder", "mysterious stranger"],
            characterAction: ["watches intently", "steps forward", "gestures mysteriously", "speaks softly"],
            object: ["crystal orb", "ancient tome", "glowing artifact", "mystical key", "carved statue"],
            reaction: ["pulses with energy", "grows warm", "whispers secrets", "reveals visions"],
            decision: ["speak the ancient words", "touch the artifact", "step into the light"],
            effect: ["shimmers", "resonates", "transforms", "awakens", "responds"],
            transformation: ["shifts and changes", "reveals hidden passages", "glows brighter"],
            discovery: ["a secret chamber", "ancient writings", "a hidden door", "forgotten treasures"],
            creature: ["spirit guardian", "magical beast", "ancient entity", "mystical being"],
            creatureAction: ["materializes nearby", "emerges from hiding", "approaches cautiously"],
            foreshadowing: ["greater challenges await", "destiny calls", "the true quest begins"],
            weapon: ["enchanted blade", "mystical staff", "blessed bow", "ancient sword"],
            social: ["negotiate", "communicate", "reason", "parley"],
            entity: ["guardian", "spirit", "stranger", "creature"],
            stealth: ["sneak", "slip", "creep", "move silently"],
            spell: ["protection spell", "light spell", "confusion charm", "detection magic"],
            skill: ["magic", "stealth", "diplomacy", "investigation", "survival"],
            passage: ["doorway", "tunnel", "staircase", "portal"],
            path: ["stone steps", "narrow bridge", "winding path", "hidden trail"],
            rest: ["rest until dawn", "meditate", "tend to wounds", "study your map"],
            obstacle: ["cliff face", "ancient wall", "fallen tree", "stone barrier"],
            item: ["healing potion", "rope", "lantern", "magical focus", "ancient key"]
        };
    }

    generateStory() {
        const template = this.getRandomElement(this.storyTemplates);
        return this.fillTemplate(template);
    }

    generateChoices() {
        const choiceSet = this.getRandomElement(this.choiceSets);
        return choiceSet.map(choice => this.fillTemplate(choice));
    }

    fillTemplate(template) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            const options = this.wordBank[key];
            return options ? this.getRandomElement(options) : match;
        });
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async simulateAPICall(prompt, type = 'story') {
        // Add realistic delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        
        console.log('🎯 SIMPLE AI generating:', type);
        
        if (type === 'choices') {
            return this.generateChoices();
        } else {
            return this.generateStory();
        }
    }
}

window.SimpleAI = SimpleAI;
