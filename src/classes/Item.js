// src/classes/Item.js
import { getItemById } from '../data/items';

class Item {
    constructor(itemData) {
        // Basic item properties
        this.id = itemData.id;
        this.name = itemData.name;
        this.description = itemData.description;
        this.type = itemData.type;
        this.price = itemData.price;
        this.rarity = itemData.rarity;
        this.effect = itemData.effect;
        this.iconPath = itemData.iconPath;
        this.usageText = itemData.usageText;
        
        // Instance-specific properties
        this.acquiredAt = itemData.acquiredAt || Date.now();
        this.expiresAt = itemData.expiresAt || null;
        this.isActive = itemData.isActive || false;
        this.usesLeft = itemData.usesLeft || (this.isConsumable() ? 1 : Infinity);
    }
    
    // Factory method to create item from item database
    static fromId(itemId) {
        const itemData = getItemById(itemId);
        if (!itemData) {
            return null;
        }
        return new Item(itemData);
    }
    
    // Check if this is a consumable item
    isConsumable() {
        // Items that are consumed on use
        return this.type === 'consumable' || 
               this.id === 'aura_shield' || 
               this.id === 'mystic_orb' ||
               this.id === 'aura_magnet';
    }
    
    // Get the duration this item stays active when used
    getDuration() {
        // Default durations for different item types in milliseconds
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
            'aura_crown': 1 * 60 * 60 * 1000, // 1 hour
            'void_siphon': 1 * 60 * 60 * 1000 // 1 hour
        };
        
        return durations[this.id] || 1 * 60 * 60 * 1000; // Default 1 hour
    }
    
    // Get item cooldown period (time until can be used again)
    getCooldown() {
        // Cooldowns for special items in milliseconds
        const cooldowns = {
            'void_extractor': 12 * 60 * 60 * 1000, // 12 hours
            'aura_crown': 7 * 24 * 60 * 60 * 1000, // 7 days
            'void_siphon': 14 * 24 * 60 * 60 * 1000 // 14 days
        };
        
        return cooldowns[this.id] || 0; // No cooldown by default
    }
    
    // Activate the item
    activate() {
        if (this.usesLeft <= 0) {
            return {
                success: false,
                message: `This ${this.name} has been fully consumed.`,
                type: 'system'
            };
        }
        
        // Set active status
        this.isActive = true;
        
        // Set expiration time for duration-based items
        if (!this.isConsumable()) {
            this.expiresAt = Date.now() + this.getDuration();
        }
        
        // Reduce uses for consumable items
        if (this.isConsumable()) {
            this.usesLeft--;
        }
        
        return {
            success: true,
            message: this.usageText || `${this.name} activated.`,
            item: this,
            type: 'item_use'
        };
    }
    
    // Check if the item is currently active
    isCurrentlyActive() {
        if (!this.isActive) return false;
        
        // If it has an expiration time, check if it's still valid
        if (this.expiresAt) {
            return Date.now() < this.expiresAt;
        }
        
        // Items without expiration are active until consumed
        return this.usesLeft > 0;
    }
    
    // Get time remaining before item expires (in milliseconds)
    getTimeRemaining() {
        if (!this.isActive || !this.expiresAt) return 0;
        return Math.max(0, this.expiresAt - Date.now());
    }
    
    // Format time remaining in a readable format
    getFormattedTimeRemaining() {
        const msRemaining = this.getTimeRemaining();
        
        if (msRemaining <= 0) return 'Expired';
        
        const seconds = Math.floor((msRemaining / 1000) % 60);
        const minutes = Math.floor((msRemaining / (1000 * 60)) % 60);
        const hours = Math.floor((msRemaining / (1000 * 60 * 60)) % 24);
        const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }
    
    // Deactivate the item
    deactivate() {
        this.isActive = false;
        this.expiresAt = null;
    }
    
    // Convert to data object for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            acquiredAt: this.acquiredAt,
            expiresAt: this.expiresAt,
            isActive: this.isActive,
            usesLeft: this.usesLeft
        };
    }
}

export default Item;