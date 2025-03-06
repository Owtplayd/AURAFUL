// src/classes/Player.js

// src/classes/Player.js

class Player {
    constructor(data = {}) {
        // Basic player information
        this.id = data.id || generateUniqueId();
        this.name = data.name || 'AuraSeeker';
        this.aura = data.aura || 500; // Changed from 0 to 500 initial Aura
        this.createdAt = data.createdAt || Date.now();
        
        // Progression tracking
        this.dailyStreak = data.dailyStreak || 0;
        this.lastDailyClaim = data.lastDailyClaim || null;
        this.lastClaimDate = data.lastClaimDate || null;
        
        // Inventory and equipment
        this.inventory = data.inventory || [];
        this.activeItems = data.activeItems || [];
        
        // Stats tracking
        this.questsCompleted = data.questsCompleted || 0;
        this.duelsWon = data.duelsWon || 0;
        this.duelsLost = data.duelsLost || 0;
        this.theftsSuccessful = data.theftsSuccessful || 0;
        this.theftsFailed = data.theftsFailed || 0;
        
        // Cooldowns
        this.duelCooldown = data.duelCooldown || 0;
        this.theftCooldown = data.theftCooldown || 0;
        
        // Notifications
        this.notifications = data.notifications || [];
    }
    
    // [... Rest of the Player class remains unchanged ...]
    
    // Calculated properties
    get auraLevel() {
        // Calculate level based on aura amount
        if (this.aura < 1000) return 1;
        if (this.aura < 5000) return 2;
        if (this.aura < 10000) return 3;
        if (this.aura < 25000) return 4;
        if (this.aura < 50000) return 5;
        if (this.aura < 100000) return 6;
        return 7;
    }
    
    get rank() {
        // Ranks based on level
        const ranks = [
            'Novice Seeker',
            'Aura Adept',
            'Energy Channeler',
            'Aura Mystic',
            'Aetheric Master',
            'Void Walker',
            'Aura Lord'
        ];
        return ranks[this.auraLevel - 1];
    }
    
    // Inventory management
    addItem(item) {
        this.inventory.push({
            ...item,
            acquiredAt: Date.now()
        });
        return true;
    }
    
    useItem(itemNameOrId) {
        // Find the item in inventory (case insensitive)
        const itemIndex = this.inventory.findIndex(item => 
            item.id.toLowerCase() === itemNameOrId.toLowerCase() || 
            item.name.toLowerCase() === itemNameOrId.toLowerCase()
        );
        
        if (itemIndex === -1) {
            return {
                success: false,
                message: `You don't have an item called "${itemNameOrId}" in your inventory.`,
                type: 'system'
            };
        }
        
        const item = this.inventory[itemIndex];
        
        // Different logic based on item type
        switch (item.type) {
            case 'consumable':
                // Apply one-time effect
                return this.applyConsumableEffect(item, itemIndex);
                
            case 'defensive':
            case 'offensive':
            case 'utility':
                // Activate item for duration
                return this.activateItem(item, itemIndex);
                
            default:
                return {
                    success: false,
                    message: `Cannot use this type of item.`,
                    type: 'system'
                };
        }
    }
    
    applyConsumableEffect(item, itemIndex) {
        // Apply the item's effect
        let effectMessage = '';
        
        switch (item.id) {
            case 'aura_shield':
                // Add to active items with instant effect but persists until triggered
                this.activeItems.push({
                    id: item.id,
                    name: item.name,
                    effect: 'block_theft',
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                });
                effectMessage = 'Aura Shield activated. Your next theft attempt will be blocked.';
                break;
                
            case 'mystic_orb':
                // Reveal a random command combo
                const combos = [
                    "focus → channel → release",
                    "inspect → analyze → harvest",
                    "meditate → visualize → manifest"
                ];
                const randomCombo = combos[Math.floor(Math.random() * combos.length)];
                effectMessage = `The Mystic Orb reveals a powerful command sequence: ${randomCombo}`;
                break;
                
            // Add more consumable item effects here
            default:
                effectMessage = `Used ${item.name}.`;
        }
        
        // Remove the item from inventory
        this.inventory.splice(itemIndex, 1);
        
        return {
            success: true,
            message: effectMessage,
            item: item,
            type: 'item_use'
        };
    }
    
    activateItem(item, itemIndex) {
        // Check if this item is already active
        const activeIndex = this.activeItems.findIndex(activeItem => activeItem.id === item.id);
        
        if (activeIndex !== -1) {
            // Already active, extend duration
            const existing = this.activeItems[activeIndex];
            const remainingTime = Math.max(0, existing.expiresAt - Date.now());
            const newDuration = this.getItemDuration(item.id);
            
            this.activeItems[activeIndex].expiresAt = Date.now() + remainingTime + newDuration;
            
            // Remove from inventory
            this.inventory.splice(itemIndex, 1);
            
            const hoursRemaining = Math.ceil((remainingTime + newDuration) / (60 * 60 * 1000));
            return {
                success: true,
                message: `Extended ${item.name} duration. Now active for ${hoursRemaining} hours.`,
                item: item,
                type: 'item_use'
            };
        }
        
        // Activate the new item
        const duration = this.getItemDuration(item.id);
        this.activeItems.push({
            id: item.id,
            name: item.name,
            effect: item.effect,
            expiresAt: Date.now() + duration
        });
        
        // Remove from inventory
        this.inventory.splice(itemIndex, 1);
        
        const hoursActive = Math.ceil(duration / (60 * 60 * 1000));
        return {
            success: true,
            message: `Activated ${item.name}. Active for ${hoursActive} hours.`,
            item: item,
            type: 'item_use'
        };
    }
    
    getItemDuration(itemId) {
        // Return duration in milliseconds for each item type
        const durations = {
            'stealth_cloak': 6 * 60 * 60 * 1000, // 6 hours
            'mirror_ward': 3 * 60 * 60 * 1000, // 3 hours
            'temporal_anchor': 24 * 60 * 60 * 1000, // 24 hours
            'shadow_mask': 2 * 60 * 60 * 1000, // 2 hours
            'precision_lens': 1 * 60 * 60 * 1000, // 1 hour
            'void_extractor': 12 * 60 * 60 * 1000, // 12 hours
            'aura_catalyst': 3 * 60 * 60 * 1000, // 3 hours
            'lootbox_detector': 12 * 60 * 60 * 1000, // 12 hours
            'time_crystal': 2 * 60 * 60 * 1000, // 2 hours
            // Add more items with their durations
        };
        
        return durations[itemId] || 1 * 60 * 60 * 1000; // Default 1 hour
    }
    
    consumeItem(itemId) {
        // Find and remove an active item when it's consumed (e.g., shield blocks attack)
        const index = this.activeItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.activeItems.splice(index, 1);
            return true;
        }
        return false;
    }
    
    hasActiveItem(itemNameOrId) {
        // Check if player has an active item by name or ID
        return this.activeItems.some(item => 
            item.id === itemNameOrId || 
            item.name === itemNameOrId
        );
    }
    
    // Clean up expired items and process active effects
    processActiveItems() {
        const now = Date.now();
        
        // Remove expired items
        this.activeItems = this.activeItems.filter(item => item.expiresAt > now);
        
        // Process any active effects that need periodic checks
        // (e.g., passive aura gain, etc.)
        
        return this.activeItems;
    }
    
    // Data persistence
    save() {
        // Process any expired items
        this.processActiveItems();
        
        // In a real implementation, this would save to a database
        // For this example, we'll save to localStorage
        const data = {
            id: this.id,
            name: this.name,
            aura: this.aura,
            createdAt: this.createdAt,
            dailyStreak: this.dailyStreak,
            lastDailyClaim: this.lastDailyClaim,
            lastClaimDate: this.lastClaimDate,
            inventory: this.inventory,
            activeItems: this.activeItems,
            questsCompleted: this.questsCompleted,
            duelsWon: this.duelsWon,
            duelsLost: this.duelsLost,
            theftsSuccessful: this.theftsSuccessful,
            theftsFailed: this.theftsFailed,
            duelCooldown: this.duelCooldown,
            theftCooldown: this.theftCooldown,
            notifications: this.notifications
        };
        
        // In browser environment
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`avra_player_${this.id}`, JSON.stringify(data));
        }
        
        // For server-side, this would call a database save
        // For this example, we'll emit an event that the game can listen for
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('avra_player_save', { detail: data }));
        }
        
        return data;
    }
    
    static load(id) {
        // In browser environment
        if (typeof localStorage !== 'undefined') {
            const data = localStorage.getItem(`avra_player_${id}`);
            if (data) {
                return new Player(JSON.parse(data));
            }
        }
        
        // For server-side, this would fetch from a database
        return null;
    }
}

// Helper function to generate a unique ID
function generateUniqueId() {
    return 'p_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

export default Player;