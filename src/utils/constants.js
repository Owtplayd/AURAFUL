// src/utils/constants.js

/**
 * Game-wide constants for the AVRA game
 */

// Player progression
export const PLAYER_LEVELS = [
    { level: 1, minAura: 0, maxAura: 999 },
    { level: 2, minAura: 1000, maxAura: 4999 },
    { level: 3, minAura: 5000, maxAura: 9999 },
    { level: 4, minAura: 10000, maxAura: 24999 },
    { level: 5, minAura: 25000, maxAura: 49999 },
    { level: 6, minAura: 50000, maxAura: 99999 },
    { level: 7, minAura: 100000, maxAura: Infinity }
];

// Player ranks corresponding to levels
export const PLAYER_RANKS = [
    'Novice Seeker',
    'Aura Adept',
    'Energy Channeler',
    'Aura Mystic',
    'Aetheric Master',
    'Void Walker',
    'Aura Lord'
];

// Daily streak rewards
export const DAILY_REWARDS = [
    { day: 1, reward: 100 },
    { day: 2, reward: 150 },
    { day: 3, reward: 225 },
    { day: 4, reward: 300 },
    { day: 5, reward: 400 },
    { day: 6, reward: 500 },
    { day: 7, reward: 1000 } // Weekly bonus
];

// Cooldown times (in milliseconds)
export const COOLDOWNS = {
    THEFT: 60 * 60 * 1000, // 1 hour
    DUEL: 10 * 60 * 1000,  // 10 minutes
    LOOTBOX_MIN: 15 * 60 * 1000, // 15 minutes
    LOOTBOX_MAX: 45 * 60 * 1000  // 45 minutes
};

// Item related constants
export const ITEM_TYPES = {
    DEFENSIVE: 'defensive',
    OFFENSIVE: 'offensive',
    UTILITY: 'utility',
    LEGENDARY: 'legendary',
    CONSUMABLE: 'consumable'
};

export const ITEM_RARITIES = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

// Lootbox probabilities
export const LOOTBOX_PROBABILITIES = {
    COMMON: 0.7,   // 70% chance
    RARE: 0.25,    // 25% chance
    EPIC: 0.05     // 5% chance
};

// Item drop rates from lootboxes
export const LOOTBOX_DROP_RATES = {
    COMMON: {
        COMMON_ITEM: 0.2,      // 20% chance
        UNCOMMON_ITEM: 0,
        RARE_ITEM: 0,
        EPIC_ITEM: 0
    },
    RARE: {
        COMMON_ITEM: 1.0,      // 100% chance
        UNCOMMON_ITEM: 0.3,    // 30% chance
        RARE_ITEM: 0,
        EPIC_ITEM: 0
    },
    EPIC: {
        COMMON_ITEM: 0,        // 0% chance (guaranteed better)
        UNCOMMON_ITEM: 1.0,    // 100% chance
        RARE_ITEM: 0.5,        // 50% chance
        EPIC_ITEM: 0.1         // 10% chance
    }
};

// Aura theft mechanics
export const THEFT_MECHANICS = {
    BASE_SUCCESS_CHANCE: 0.4,  // 40% base chance
    LEVEL_PENALTY: 0.05,       // -5% per level difference
    MAX_STEAL_PERCENT: 0.1,    // 10% of target's Aura
    MAX_STEAL_AMOUNT: 5000,    // Cap at 5000 Aura
    FAIL_PENALTY_PERCENT: 0.05 // 5% of own Aura lost on fail
};

// Duel mechanics
export const DUEL_MECHANICS = {
    STAKE_PERCENT: 0.05,     // 5% of lower player's Aura
    MIN_STAKE: 100,          // Minimum 100 Aura at stake
    MAX_STAKE: 5000,         // Maximum 5000 Aura at stake
    LEVEL_ADVANTAGE: 0.1     // 10% advantage per level difference
};

// Minigame rewards
export const MINIGAME_REWARDS = {
    WORDSCRAMBLE: { min: 100, max: 300 },
    COMMANDCHAIN: { min: 150, max: 450 },
    AURAPUZZLE: { min: 200, max: 600 },
    REACTION: { min: 50, max: 150 }
};

// Command combos
export const COMMAND_COMBOS = {
    ENERGY_SURGE: {
        sequence: ['focus', 'channel', 'release'],
        reward: 250,
        name: 'Energy Surge',
        message: 'You performed an Energy Surge combo! +{reward} Aura',
        effect: 'energy_burst'
    },
    AURA_EXTRACTION: {
        sequence: ['inspect', 'analyze', 'harvest'],
        reward: 300,
        name: 'Aura Extraction',
        message: 'You performed an Aura Extraction combo! +{reward} Aura',
        effect: 'extraction_spiral'
    },
    INNER_AWAKENING: {
        sequence: ['meditate', 'visualize', 'manifest'],
        reward: 400,
        name: 'Inner Awakening',
        message: 'You performed an Inner Awakening combo! +{reward} Aura',
        effect: 'awakening_glow'
    }
};

// UI Colors
export const UI_COLORS = {
    BACKGROUND: 0x10103A,
    FRAME: 0x8080FF,
    TEXT_PRIMARY: 0xFFFFFF,
    TEXT_SECONDARY: 0xCCCCFF,
    BUTTON_PRIMARY: 0x4F4FFF,
    BUTTON_HOVER: 0x6464FF,
    SUCCESS: 0x44FF44,
    ERROR: 0xFF4444,
    WARNING: 0xFFFF00
};

// Event types
export const EVENT_TYPES = {
    PLAYER_UPDATE: 'player_update',
    ITEM_USED: 'item_used',
    AURA_GAINED: 'aura_gained',
    AURA_LOST: 'aura_lost',
    LOOTBOX_SPAWN: 'lootbox_spawn',
    LOOTBOX_OPEN: 'lootbox_open',
    DUEL_COMPLETED: 'duel_completed',
    THEFT_ATTEMPTED: 'theft_attempted',
    LEVEL_UP: 'level_up',
    COMBO_COMPLETED: 'combo_completed',
    QUEST_COMPLETED: 'quest_completed',
    MINIGAME_COMPLETED: 'minigame_completed'
};

// Word list for word scramble minigame
export const WORD_LIST = [
    'aura', 'energy', 'crystal', 'power', 'mystic',
    'ethereal', 'spiritual', 'cosmic', 'magical', 'essence',
    'catalyst', 'emanation', 'luminous', 'radiance', 'shimmer',
    'vibration', 'resonance', 'frequency', 'quantum', 'astral',
    'chakra', 'vortex', 'nebula', 'horizon', 'eclipse',
    'alchemy', 'elemental', 'celestial', 'arcane', 'prism'
];

// Export all constants as a single object for convenience
export default {
    PLAYER_LEVELS,
    PLAYER_RANKS,
    DAILY_REWARDS,
    COOLDOWNS,
    ITEM_TYPES,
    ITEM_RARITIES,
    LOOTBOX_PROBABILITIES,
    LOOTBOX_DROP_RATES,
    THEFT_MECHANICS,
    DUEL_MECHANICS,
    MINIGAME_REWARDS,
    COMMAND_COMBOS,
    UI_COLORS,
    EVENT_TYPES,
    WORD_LIST
};