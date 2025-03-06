// src/utils/auraCalculations.js

import { PLAYER_LEVELS, PLAYER_RANKS, DAILY_REWARDS, THEFT_MECHANICS } from './constants';

/**
 * A collection of functions for Aura calculations
 */

/**
 * Calculate player level based on aura amount
 * @param {number} aura - Player's aura amount
 * @returns {number} - Player level (1-7)
 */
export function calculateLevel(aura) {
    for (const levelData of PLAYER_LEVELS) {
        if (aura >= levelData.minAura && aura <= levelData.maxAura) {
            return levelData.level;
        }
    }
    return 7; // Maximum level as fallback
}

/**
 * Get player rank based on level
 * @param {number} level - Player level (1-7)
 * @returns {string} - Player rank title
 */
export function getLevelRank(level) {
    const index = Math.min(Math.max(0, level - 1), PLAYER_RANKS.length - 1);
    return PLAYER_RANKS[index];
}

/**
 * Calculate level progress percentage
 * @param {number} aura - Player's current aura
 * @param {number} level - Player's current level
 * @returns {number} - Progress percentage (0-1)
 */
export function calculateLevelProgress(aura, level) {
    // Get current level data
    const currentLevel = PLAYER_LEVELS.find(data => data.level === level);
    
    if (!currentLevel) return 1; // Default to 100% if level not found
    
    // If at max level, calculate based on a higher arbitrary maximum
    if (level === 7) {
        const minAura = currentLevel.minAura;
        const progressRange = 100000; // Arbitrary range for level 7
        return Math.min(1, (aura - minAura) / progressRange);
    }
    
    // Regular calculation
    const minAura = currentLevel.minAura;
    const maxAura = currentLevel.maxAura;
    const range = maxAura - minAura;
    
    return (aura - minAura) / range;
}

/**
 * Calculate daily streak reward
 * @param {number} streak - Current daily streak (1-7)
 * @returns {number} - Reward amount
 */
export function calculateDailyReward(streak) {
    const day = Math.min(Math.max(1, streak), 7);
    const reward = DAILY_REWARDS.find(data => data.day === day);
    return reward ? reward.reward : DAILY_REWARDS[0].reward;
}

/**
 * Apply Aura boost from items
 * @param {number} baseAmount - Base Aura amount
 * @param {Object} player - Player object
 * @returns {number} - Boosted Aura amount
 */
export function applyAuraBoost(baseAmount, player) {
    let multiplier = 1;
    
    // Check for active Aura Catalyst
    if (player.hasActiveItem && player.hasActiveItem('Aura Catalyst')) {
        multiplier += 0.25; // +25%
    }
    
    // Check for active Crown of Luminescence
    if (player.hasActiveItem && player.hasActiveItem('aura_crown')) {
        multiplier += 0.5; // +50%
    }
    
    // Apply synergy effects
    // For demo purposes we'll just check a few key synergies
    if (player.checkActiveSynergies) {
        const activeSynergies = player.checkActiveSynergies();
        
        if (activeSynergies.includes('catalyst_network')) {
            multiplier += 0.15; // +15% for Catalyst Network synergy
        }
    }
    
    return Math.floor(baseAmount * multiplier);
}

/**
 * Calculate theft success chance
 * @param {Object} thief - Player attempting the theft
 * @param {Object} target - Target player
 * @returns {number} - Success chance (0-1)
 */
export function calculateTheftChance(thief, target) {
    // Base chance
    let chance = THEFT_MECHANICS.BASE_SUCCESS_CHANCE;
    
    // Adjust based on level difference
    const levelDiff = target.auraLevel - thief.auraLevel;
    chance -= levelDiff * THEFT_MECHANICS.LEVEL_PENALTY;
    
    // Apply thief item bonuses
    if (thief.hasActiveItem('Aura Magnet')) {
        chance += 0.15; // +15% with Aura Magnet
    }
    
    if (thief.hasActiveItem('Precision Lens')) {
        chance += 0.1; // +10% with Precision Lens
    }
    
    // Apply synergy effects
    if (thief.hasActiveItem('shadow_mask') && 
        thief.hasActiveItem('stealth_cloak')) {
        chance += 0.1; // +10% for Stealth Set synergy
    }
    
    // Master Thief synergy allows stealing from higher level players
    if (thief.hasActiveItem('aura_magnet') && 
        thief.hasActiveItem('precision_lens') && 
        thief.hasActiveItem('void_extractor')) {
        // Reduce level penalty for Master Thief synergy
        const masterThiefBonus = Math.max(0, levelDiff * 0.03); // reduce penalty by 60%
        chance += masterThiefBonus;
    }
    
    // Ensure the chance is within reasonable bounds
    return Math.max(0.1, Math.min(0.8, chance));
}

/**
 * Calculate amount of Aura to steal
 * @param {Object} thief - Player attempting theft
 * @param {Object} target - Target player
 * @returns {number} - Amount of Aura to steal
 */
export function calculateTheftAmount(thief, target) {
    // Base amount is a percentage of target's Aura
    let amount = Math.floor(target.aura * THEFT_MECHANICS.MAX_STEAL_PERCENT);
    
    // Apply item bonuses
    if (thief.hasActiveItem('Void Extractor')) {
        amount = Math.floor(amount * 1.5); // +50% with Void Extractor
    }
    
    // Apply Void Walker synergy
    if (thief.hasActiveItem('void_extractor') && 
        thief.hasActiveItem('shadow_mask') && 
        thief.hasActiveItem('precision_lens')) {
        amount = Math.floor(amount * 1.1); // Additional +10% for Void Walker
    }
    
    // Cap the amount to prevent excessive losses
    return Math.min(amount, THEFT_MECHANICS.MAX_STEAL_AMOUNT);
}

/**
 * Calculate penalty for failed theft attempt
 * @param {Object} thief - Player who attempted theft
 * @returns {number} - Penalty amount
 */
export function calculateTheftPenalty(thief) {
    return Math.floor(thief.aura * THEFT_MECHANICS.FAIL_PENALTY_PERCENT);
}

/**
 * Calculate duel stake amount
 * @param {Object} player1 - First player
 * @param {Object} player2 - Second player
 * @returns {number} - Stake amount
 */
export function calculateDuelStake(player1, player2) {
    // Base stake is a percentage of the lower player's Aura
    const lowerAura = Math.min(player1.aura, player2.aura);
    let stake = Math.floor(lowerAura * DUEL_MECHANICS.STAKE_PERCENT);
    
    // Ensure minimum and maximum stakes
    stake = Math.max(DUEL_MECHANICS.MIN_STAKE, stake);
    stake = Math.min(DUEL_MECHANICS.MAX_STAKE, stake);
    
    return stake;
}

/**
 * Calculate level advantage for duels
 * @param {number} level1 - First player's level
 * @param {number} level2 - Second player's level
 * @returns {number} - Advantage modifier (-1 to 1)
 */
export function calculateLevelAdvantage(level1, level2) {
    const levelDiff = level1 - level2;
    return levelDiff * DUEL_MECHANICS.LEVEL_ADVANTAGE;
}

/**
 * Calculate minigame reward based on score
 * @param {string} minigameType - Type of minigame
 * @param {number} score - Player's score
 * @param {number} maxScore - Maximum possible score
 * @param {Object} player - Player object for boosts
 * @returns {number} - Reward amount
 */
export function calculateMinigameReward(minigameType, score, maxScore, player) {
    // Import minigame rewards dynamically to avoid circular dependencies
    const { MINIGAME_REWARDS } = require('./constants');
    
    // Get reward range for this minigame
    const rewardRange = MINIGAME_REWARDS[minigameType.toUpperCase()];
    if (!rewardRange) return 0;
    
    // Calculate percentage of max score achieved
    const percentage = Math.min(1, score / maxScore);
    
    // Calculate reward based on percentage
    const baseReward = Math.floor(rewardRange.min + percentage * (rewardRange.max - rewardRange.min));
    
    // Apply Aura boosts
    return applyAuraBoost(baseReward, player);
}

/**
 * Calculate combo reward with boosts
 * @param {number} baseReward - Base reward amount
 * @param {Object} player - Player object
 * @returns {number} - Final reward amount
 */
export function calculateComboReward(baseReward, player) {
    // Apply Aura boosts
    return applyAuraBoost(baseReward, player);
}

/**
 * Export all functions for easy access
 */
export default {
    calculateLevel,
    getLevelRank,
    calculateLevelProgress,
    calculateDailyReward,
    applyAuraBoost,
    calculateTheftChance,
    calculateTheftAmount,
    calculateTheftPenalty,
    calculateDuelStake,
    calculateLevelAdvantage,
    calculateMinigameReward,
    calculateComboReward
};