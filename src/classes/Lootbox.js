// src/classes/Lootbox.js
import { getItemById, getItemsByRarity } from '../data/items';

class Lootbox {
    constructor() {
        // Determine rarity
        this.determineRarity();
        
        // Generate content based on rarity
        this.generateContents();
    }
    
    determineRarity() {
        // Probability distribution for lootbox rarity
        const rarityRoll = Math.random();
        
        if (rarityRoll < 0.7) {
            this.rarity = 'common';
        } else if (rarityRoll < 0.95) {
            this.rarity = 'rare';
        } else {
            this.rarity = 'epic';
        }
    }
    
    generateContents() {
        // Rewards vary based on rarity
        this.rewards = [];
        
        // Always include some Aura
        this.addAuraReward();
        
        // Add item rewards
        this.addItemRewards();
    }
    
    addAuraReward() {
        let minAura, maxAura;
        
        switch (this.rarity) {
            case 'common':
                minAura = 50;
                maxAura = 200;
                break;
            case 'rare':
                minAura = 200;
                maxAura = 500;
                break;
            case 'epic':
                minAura = 500;
                maxAura = 1000;
                break;
        }
        
        const auraAmount = Math.floor(Math.random() * (maxAura - minAura + 1)) + minAura;
        
        this.rewards.push({
            type: 'aura',
            amount: auraAmount
        });
    }
    
    addItemRewards() {
        // Item rewards depend on rarity
        switch (this.rarity) {
            case 'common':
                // 20% chance for a common item
                if (Math.random() < 0.2) {
                    this.addRandomItem('common');
                }
                break;
                
            case 'rare':
                // 100% chance for a common item
                this.addRandomItem('common');
                
                // 30% chance for an uncommon item
                if (Math.random() < 0.3) {
                    this.addRandomItem('uncommon');
                }
                break;
                
            case 'epic':
                // 100% chance for an uncommon item
                this.addRandomItem('uncommon');
                
                // 50% chance for a rare item
                if (Math.random() < 0.5) {
                    this.addRandomItem('rare');
                }
                
                // 10% chance for an epic item
                if (Math.random() < 0.1) {
                    this.addRandomItem('epic');
                }
                break;
        }
    }
    
    addRandomItem(rarity) {
        // Get all items of specified rarity
        const itemsOfRarity = getItemsByRarity(rarity);
        
        if (itemsOfRarity.length === 0) {
            return; // No items of this rarity
        }
        
        // Pick a random item
        const randomIndex = Math.floor(Math.random() * itemsOfRarity.length);
        const item = itemsOfRarity[randomIndex];
        
        this.rewards.push({
            type: 'item',
            item: item
        });
    }
    
    getRewards() {
        return this.rewards;
    }
}

export default Lootbox;