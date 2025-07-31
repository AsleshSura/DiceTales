/**
 * Mock AI System for Static Website Demo
 * Provides realistic AI-like responses without API calls
 */

class MockAI {
    constructor() {
        this.storyTemplates = [
            "As you {action}, the ancient {location} {reaction}. The {character} watches you with {emotion} eyes, clearly {assessment} of your decision. What do you do next?",
            "The {weather} sky above mirrors your {mood} as you {movement}. In the distance, {observation}, suggesting that {consequence}. How do you proceed?",
            "Your {action} echoes through the {location}. A {character} emerges from the shadows, {characterAction}, while {environmental_detail}. What is your response?",
            "The mystical energy in the air {shifts} as you {decision}. You sense that {foreshadowing}, and the {item} in your possession {itemReaction}. What action will you take?",
            "Time seems to {timeEffect} as you {action}. The {location} around you {transformation}, revealing {discovery}. How do you handle this revelation?"
        ];

        this.choiceTemplates = [
            ["Investigate the mysterious {object}", "Approach the {character} cautiously", "Search for another path", "Use your {skill} ability"],
            ["Attack with your {weapon}", "Try to negotiate", "Attempt to sneak past", "Use magic to {effect}"],
            ["Enter the {location}", "Examine the {object} closely", "Call out to {character}", "Retreat and reconsider"],
            ["Follow the {path}", "Set up camp here", "Climb the {obstacle}", "Use your {item}"],
            ["Accept the {offer}", "Decline politely", "Ask for more information", "Propose an alternative"]
        ];

        this.wordBanks = {
            action: ["step forward", "draw your weapon", "cast a spell", "examine the area", "speak aloud", "move cautiously"],
            location: ["chamber", "forest clearing", "mountain path", "underground cavern", "ruined temple", "mystical grove"],
            reaction: ["trembles with power", "glows with ancient magic", "whispers forgotten secrets", "pulses with energy"],
            character: ["hooded figure", "wise elder", "mysterious stranger", "ancient guardian", "fellow traveler"],
            emotion: ["knowing", "suspicious", "curious", "ancient", "piercing", "compassionate"],
            assessment: ["impressed", "wary", "intrigued", "concerned", "approving", "puzzled"],
            weather: ["storm-torn", "crystal clear", "misty", "star-filled", "crimson", "ethereal"],
            mood: ["determination", "uncertainty", "excitement", "caution", "wonder", "resolve"],
            movement: ["press onward", "pause thoughtfully", "scan the horizon", "ready your defenses"],
            observation: ["lights flicker", "shadows move", "voices carry on the wind", "the ground trembles"],
            consequence: ["danger approaches", "opportunity awaits", "mysteries deepen", "allies may be near"],
            object: ["glowing crystal", "ancient tome", "mystical artifact", "hidden door", "strange symbol"],
            skill: ["stealth", "magic", "diplomacy", "investigation", "survival", "combat"],
            weapon: ["enchanted sword", "mystical staff", "blessed bow", "ancient blade", "magical focus"],
            effect: ["confuse enemies", "reveal hidden paths", "communicate with spirits", "enhance your abilities"],
            path: ["winding trail", "stone steps", "narrow bridge", "hidden passage", "marked route"],
            obstacle: ["steep cliff", "fallen tree", "stone wall", "rushing river", "thorny barrier"],
            item: ["magical compass", "healing potion", "ancient key", "protective charm", "mysterious map"],
            offer: ["quest", "bargain", "alliance", "challenge", "opportunity", "warning"]
        };
    }

    generateStory(context = {}) {
        const template = this.getRandomElement(this.storyTemplates);
        return this.fillTemplate(template);
    }

    generateChoices(context = {}) {
        const choiceSet = this.getRandomElement(this.choiceTemplates);
        return choiceSet.map(choice => this.fillTemplate(choice));
    }

    fillTemplate(template) {
        return template.replace(/\{(\w+)\}/g, (match, category) => {
            const words = this.wordBanks[category];
            return words ? this.getRandomElement(words) : match;
        });
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Simulate API delay for realism
    async simulateAPICall(prompt, type = 'story') {
        // Add realistic delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        if (type === 'choices') {
            return this.generateChoices();
        } else {
            return this.generateStory();
        }
    }
}

// Make available globally
window.MockAI = MockAI;
