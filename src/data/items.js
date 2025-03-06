// src/data/items.js

// Item database containing all available items in the AVRA game
const items = [
    // DEFENSIVE ITEMS
    {
        id: 'aura_shield',
        name: 'Aura Shield',
        description: 'Blocks one theft attempt completely. Single-use, consumed on activation.',
        type: 'defensive',
        price: 500,
        rarity: 'common',
        effect: 'block_theft',
        iconPath: 'assets/images/items/aura_shield.png',
        usageText: 'Your Aura Shield activates, blocking the theft attempt!'
    },
    {
        id: 'stealth_cloak',
        name: 'Stealth Cloak',
        description: 'Makes you invisible on the leaderboard for 6 hours. Prevents theft attempts during this time.',
        type: 'defensive',
        price: 1200,
        rarity: 'uncommon',
        effect: 'stealth',
        iconPath: 'assets/images/items/stealth_cloak.png',
        usageText: 'You fade from view, becoming untargetable for theft attempts.'
    },
    {
        id: 'mirror_ward',
        name: 'Mirror Ward',
        description: 'Reflects theft attempts for 3 hours. Attacker loses Aura instead.',
        type: 'defensive',
        price: 2000,
        rarity: 'rare',
        effect: 'reflect_theft',
        iconPath: 'assets/images/items/mirror_ward.png',
        usageText: 'A shimmering barrier surrounds your Aura, ready to reflect theft attempts.'
    },
    {
        id: 'temporal_anchor',
        name: 'Temporal Anchor',
        description: 'If Aura is stolen, automatically restores it after 1 hour. 24-hour duration.',
        type: 'defensive',
        price: 3500,
        rarity: 'epic',
        effect: 'restore_stolen',
        iconPath: 'assets/images/items/temporal_anchor.png',
        usageText: 'You anchor your Aura to its current state, ensuring any losses will be recovered.'
    },

    // OFFENSIVE ITEMS
    {
        id: 'aura_magnet',
        name: 'Aura Magnet',
        description: '+15% success chance on your next theft attempt. Single use.',
        type: 'offensive',
        price: 800,
        rarity: 'common',
        effect: 'boost_theft',
        iconPath: 'assets/images/items/aura_magnet.png',
        usageText: 'The Aura Magnet pulses with energy, ready to draw in Aura from your target.'
    },
    {
        id: 'shadow_mask',
        name: 'Shadow Mask',
        description: 'Hide your identity during theft attempts for 2 hours. Failed attempts don\'t result in reputation loss.',
        type: 'offensive',
        price: 1500,
        rarity: 'uncommon',
        effect: 'hide_identity',
        iconPath: 'assets/images/items/shadow_mask.png',
        usageText: 'You don a mask of shadows, concealing your identity during theft attempts.'
    },
    {
        id: 'precision_lens',
        name: 'Precision Lens',
        description: 'See other players\' defensive items for 1 hour. Plan theft attempts more strategically.',
        type: 'offensive',
        price: 2500,
        rarity: 'rare',
        effect: 'see_defenses',
        iconPath: 'assets/images/items/precision_lens.png',
        usageText: 'The Precision Lens activates, revealing the defensive measures of potential targets.'
    },
    {
        id: 'void_extractor',
        name: 'Void Extractor',
        description: 'Steal 50% more Aura on successful theft. 12-hour cooldown.',
        type: 'offensive',
        price: 4000,
        rarity: 'epic',
        effect: 'amplify_theft',
        iconPath: 'assets/images/items/void_extractor.png',
        usageText: 'The Void Extractor hums with dark energy, ready to drain additional Aura from your targets.'
    },

    // UTILITY ITEMS
    {
        id: 'aura_catalyst',
        name: 'Aura Catalyst',
        description: '+25% Aura from all sources for 3 hours.',
        type: 'utility',
        price: 1000,
        rarity: 'uncommon',
        effect: 'boost_gains',
        iconPath: 'assets/images/items/aura_catalyst.png',
        usageText: 'The Aura Catalyst activates, enhancing all Aura you receive.'
    },
    {
        id: 'lootbox_detector',
        name: 'Lootbox Detector',
        description: 'Get notified 30 seconds before lootbox spawns. Lasts 12 hours.',
        type: 'utility',
        price: 1800,
        rarity: 'uncommon',
        effect: 'detect_lootbox',
        iconPath: 'assets/images/items/lootbox_detector.png',
        usageText: 'The Lootbox Detector begins scanning the area for upcoming lootbox spawns.'
    },
    {
        id: 'time_crystal',
        name: 'Time Crystal',
        description: 'Reduce all cooldowns by 50% for 2 hours.',
        type: 'utility',
        price: 3000,
        rarity: 'rare',
        effect: 'reduce_cooldowns',
        iconPath: 'assets/images/items/time_crystal.png',
        usageText: 'The Time Crystal fractures reality around you, accelerating your recovery times.'
    },
    {
        id: 'mystic_orb',
        name: 'Mystic Orb',
        description: 'Reveals one random command combo. Single use.',
        type: 'utility',
        price: 5000,
        rarity: 'epic',
        effect: 'reveal_combo',
        iconPath: 'assets/images/items/mystic_orb.png',
        usageText: 'The Mystic Orb swirls with cosmic energy, revealing hidden knowledge.'
    },

    // LEGENDARY ITEMS (Rare drops or special events)
    {
        id: 'aura_crown',
        name: 'Crown of Luminescence',
        description: 'Legendary item. +50% Aura from all sources and immunity to theft for 1 hour. 7-day cooldown.',
        type: 'legendary',
        price: 25000, // Extremely expensive if bought
        rarity: 'legendary',
        effect: 'crown_effect',
        iconPath: 'assets/images/items/aura_crown.png',
        usageText: 'The Crown of Luminescence blazes with power, making you untouchable and vastly increasing your Aura gains.'
    },
    {
        id: 'void_siphon',
        name: 'Void Siphon',
        description: 'Legendary item. Drain 5% Aura from all players below your level. 14-day cooldown.',
        type: 'legendary',
        price: 30000, // Extremely expensive if bought
        rarity: 'legendary',
        effect: 'mass_drain',
        iconPath: 'assets/images/items/void_siphon.png',
        usageText: 'The Void Siphon creates a massive pull, drawing Aura from countless sources into your reserves.'
    }
];

// Define item synergies that provide bonus effects when multiple items are used together
const itemSynergies = [
    {
        id: 'stealth_set',
        name: 'Stealth Set',
        items: ['stealth_cloak', 'shadow_mask'],
        description: 'Complete anonymity for 4 hours. +25% Aura from theft attempts.',
        effect: 'stealth_synergy',
        iconPath: 'assets/images/items/stealth_set.png',
        visualEffect: 'Creates a shadowy aura that obscures your presence and identity.'
    },
    {
        id: 'catalyst_network',
        name: 'Catalyst Network',
        items: ['aura_catalyst', 'time_crystal', 'lootbox_detector'],
        description: 'Lootboxes have double rewards for 1 hour.',
        effect: 'catalyst_synergy',
        iconPath: 'assets/images/items/catalyst_network.png',
        visualEffect: 'Creates an ethereal network connecting the items, pulsing with amplified energy.'
    },
    {
        id: 'guardian_protocol',
        name: 'Guardian Protocol',
        items: ['aura_shield', 'mirror_ward', 'temporal_anchor'],
        description: 'Auto-blocks 50% of theft attempts for 24 hours.',
        effect: 'guardian_synergy',
        iconPath: 'assets/images/items/guardian_protocol.png',
        visualEffect: 'Manifests orbiting shield glyphs that intercept incoming theft attempts.'
    },
    {
        id: 'master_thief',
        name: 'Master Thief',
        items: ['aura_magnet', 'precision_lens', 'void_extractor'],
        description: 'Can steal from players up to 2 levels higher.',
        effect: 'thief_synergy',
        iconPath: 'assets/images/items/master_thief.png',
        visualEffect: 'Surrounds you with a predatory aura trail when targeting higher-level players.'
    },
    {
        id: 'time_weaver',
        name: 'Time Weaver',
        items: ['time_crystal', 'temporal_anchor'],
        description: 'Cooldowns reduced by 75% instead of 50%.',
        effect: 'time_synergy',
        iconPath: 'assets/images/items/time_weaver.png',
        visualEffect: 'Distorts reality around you, creating rippling time dilation effects.'
    },
    {
        id: 'void_walker',
        name: 'Void Walker',
        items: ['void_extractor', 'shadow_mask', 'precision_lens'],
        description: 'When stealing, gain an additional 10% of target\'s Aura as bonus.',
        effect: 'void_synergy',
        iconPath: 'assets/images/items/void_walker.png',
        visualEffect: 'Surrounds you with void tendrils that extract additional Aura during theft.'
    }
];

// Helper function to check if a player has a complete synergy set active
function checkSynergies(player) {
    const activeSynergies = [];
    
    // For each synergy definition
    itemSynergies.forEach(synergy => {
        // Check if all required items for this synergy are active
        const hasAllItems = synergy.items.every(itemId => 
            player.activeItems.some(activeItem => activeItem.id === itemId)
        );
        
        if (hasAllItems) {
            activeSynergies.push(synergy);
        }
    });
    
    return activeSynergies;
}

// Helper function to get item by ID
function getItemById(itemId) {
    return items.find(item => item.id === itemId);
}

// Helper function to get all items by type
function getItemsByType(type) {
    return items.filter(item => item.type === type);
}

// Helper function to get all items by rarity
function getItemsByRarity(rarity) {
    return items.filter(item => item.rarity === rarity);
}

export { 
    items, 
    itemSynergies, 
    checkSynergies, 
    getItemById, 
    getItemsByType, 
    getItemsByRarity 
};