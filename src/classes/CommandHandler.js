// src/classes/CommandHandler.js

class CommandHandler {
    constructor(gameScene, player) {
        this.gameScene = gameScene;
        this.player = player;
        this.commands = this.registerCommands();
        this.commandHistory = [];
        this.comboTracker = [];         // Tracks recently entered commands for combo detection
        this.comboTimeout = null;       // Timeout for resetting combo chain
        this.lastCommandTime = 0;       // Timestamp of last command (for rate limiting)
        
        // Command combinations that give special rewards when performed in sequence
        this.combos = {
            'focus,channel,release': {
                name: 'Energy Surge',
                reward: 250,
                message: 'You performed an Energy Surge combo! +250 Aura',
                effect: 'energy_burst'
            },
            'inspect,analyze,harvest': {
                name: 'Aura Extraction',
                reward: 300,
                message: 'You performed an Aura Extraction combo! +300 Aura',
                effect: 'extraction_spiral'
            },
            'meditate,visualize,manifest': {
                name: 'Inner Awakening',
                reward: 400,
                message: 'You performed an Inner Awakening combo! +400 Aura',
                effect: 'awakening_glow'
            }
        };
    }
    
    registerCommands() {
        // This method creates a mapping between command strings and their handler functions
        return {
            // Basic commands
            'help': this.showHelp.bind(this),
            'profile': this.showProfile.bind(this),
            'daily': this.claimDailyBonus.bind(this),
            'inventory': this.showInventory.bind(this),
            'shop': this.openShop.bind(this),
            'leaderboard': this.showLeaderboard.bind(this),
            
            // Interaction commands
            'duel': this.initiateDuel.bind(this),
            'steal': this.attemptTheft.bind(this),
            'gift': this.giftAura.bind(this),
            'use': this.useItem.bind(this),
            'grab': this.grabLootbox.bind(this),
            
            // Activity commands
            'quest': this.startQuest.bind(this),
            'minigame': this.startMinigame.bind(this),
            
            // Combo commands (used in sequences)
            'focus': this.trackCombo.bind(this, 'focus'),
            'channel': this.trackCombo.bind(this, 'channel'),
            'release': this.trackCombo.bind(this, 'release'),
            'inspect': this.trackCombo.bind(this, 'inspect'),
            'analyze': this.trackCombo.bind(this, 'analyze'),
            'harvest': this.trackCombo.bind(this, 'harvest'),
            'meditate': this.trackCombo.bind(this, 'meditate'),
            'visualize': this.trackCombo.bind(this, 'visualize'),
            'manifest': this.trackCombo.bind(this, 'manifest')
        };
    }

    // Main processing function for player input
    processCommand(input) {
        // Ignore empty inputs
        if (!input || input.trim() === '') {
            return false;
        }
        
        // Rate limiting - prevent command spamming
        const now = Date.now();
        if (now - this.lastCommandTime < 200) { // 200ms cooldown between commands
            return { success: false, message: 'Please slow down!' };
        }
        this.lastCommandTime = now;
        
        // Process and normalize input
        const fullInput = input.trim().toLowerCase();
        
        // Record in history
        this.commandHistory.push({
            timestamp: now,
            command: fullInput
        });
        
        // Keep history limited to last 20 commands
        if (this.commandHistory.length > 20) {
            this.commandHistory.shift();
        }
        
        // Handle commands with arguments (e.g., "/use shield")
        if (fullInput.startsWith('/')) {
            // Remove the leading slash and split by spaces
            const parts = fullInput.substring(1).split(' ');
            const command = parts[0];
            const args = parts.slice(1);
            
            // Check if command exists
            if (this.commands[command]) {
                return this.commands[command](args);
            } else {
                return { 
                    success: false, 
                    message: `Unknown command: ${command}. Type /help for available commands.` 
                };
            }
        }
        
        // Handle non-slash inputs as chat or special keywords
        return { 
            success: true, 
            message: `${this.player.name} says: ${fullInput}`,
            type: 'chat'
        };
    }
    
    // Command handlers
    showHelp() {
        return {
            success: true,
            message: `
Available commands:
- /help - Show this help
- /daily - Claim daily Aura bonus
- /profile - View your profile and stats
- /inventory - Show your items
- /shop - Open the Aura shop
- /use [item] - Use an item from your inventory
- /grab - Grab a lootbox when available
- /duel [player] - Challenge player to an Aura duel
- /steal [player] - Attempt to steal Aura (risky)
- /gift [player] [amount] - Gift Aura to another player
- /quest [name] - Start a text adventure quest
- /minigame [type] - Play a minigame
- /leaderboard - View top Aura holders
            `,
            type: 'system'
        };
    }
    
    showProfile() {
        const player = this.player;
        return {
            success: true,
            message: `
Player: ${player.name}
Aura Level: ${player.auraLevel} (${player.aura} Aura)
Rank: ${player.rank}
Daily Streak: ${player.dailyStreak} days
Quests Completed: ${player.questsCompleted}
Duels Won: ${player.duelsWon}
Successful Thefts: ${player.theftsSuccessful}
            `,
            type: 'profile'
        };
    }
    
    claimDailyBonus() {
        // Check if already claimed today
        const now = new Date();
        const today = now.toDateString();
        
        if (this.player.lastDailyClaim === today) {
            return {
                success: false,
                message: 'You already claimed your daily bonus today. Come back tomorrow!',
                type: 'system'
            };
        }
        
        // Calculate streak and bonus
        let streak = this.player.dailyStreak || 0;
        const lastClaimDate = this.player.lastClaimDate ? new Date(this.player.lastClaimDate) : null;
        
        // Check if streak should continue or reset
        if (lastClaimDate) {
            const daysSinceLastClaim = Math.floor((now - lastClaimDate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastClaim > 1) {
                // Missed a day, but don't reset completely
                streak = Math.max(2, streak - 1); // Drop back a day but not below day 2
            } else {
                // Streak continues
                streak++;
            }
        } else {
            // First time claiming
            streak = 1;
        }
        
        // Cap streak at 7 days and cycle
        if (streak > 7) {
            streak = 1;
        }
        
        // Calculate bonus based on streak
        let bonus = 0;
        switch (streak) {
            case 1: bonus = 100; break;
            case 2: bonus = 150; break;
            case 3: bonus = 225; break;
            case 4: bonus = 300; break;
            case 5: bonus = 400; break;
            case 6: bonus = 500; break;
            case 7: bonus = 1000; break; // Weekly bonus
        }
        
        // Apply any active boosters
        if (this.player.hasActiveItem('Aura Catalyst')) {
            bonus = Math.floor(bonus * 1.25);
        }
        
        // Update player stats
        this.player.aura += bonus;
        this.player.dailyStreak = streak;
        this.player.lastDailyClaim = today;
        this.player.lastClaimDate = now;
        this.player.save(); // Persist changes
        
        return {
            success: true,
            message: `Daily bonus claimed! +${bonus} Aura (Day ${streak} streak)`,
            auraGain: bonus,
            type: 'reward',
            effect: 'daily_bonus'
        };
    }
    
    showInventory() {
        const inventory = this.player.inventory;
        
        if (inventory.length === 0) {
            return {
                success: true,
                message: 'Your inventory is empty. Visit the shop to buy items!',
                type: 'inventory'
            };
        }
        
        // Group items by type and count quantities
        const itemGroups = inventory.reduce((groups, item) => {
            if (!groups[item.id]) {
                groups[item.id] = {
                    name: item.name,
                    count: 0,
                    description: item.description,
                    type: item.type
                };
            }
            groups[item.id].count++;
            return groups;
        }, {});
        
        // Format the inventory message
        let message = '== YOUR INVENTORY ==\n\n';
        
        // Active items section
        const activeItems = this.player.activeItems;
        if (activeItems.length > 0) {
            message += 'ACTIVE ITEMS:\n';
            activeItems.forEach(item => {
                const timeLeft = Math.ceil((item.expiresAt - Date.now()) / 1000 / 60); // minutes remaining
                message += `- ${item.name} (${timeLeft} min remaining)\n`;
            });
            message += '\n';
        }
        
        // Items by category
        ['defensive', 'offensive', 'utility'].forEach(type => {
            const typeItems = Object.values(itemGroups).filter(item => item.type === type);
            if (typeItems.length > 0) {
                message += `${type.toUpperCase()} ITEMS:\n`;
                typeItems.forEach(item => {
                    message += `- ${item.name} (x${item.count}): ${item.description}\n`;
                });
                message += '\n';
            }
        });
        
        return {
            success: true,
            message: message,
            inventory: itemGroups, // Structured data for UI rendering
            type: 'inventory'
        };
    }
    
    openShop() {
        // This would typically change the game scene to the shop scene
        this.gameScene.scene.start('ShopScene', { player: this.player });
        
        return {
            success: true,
            message: 'Opening shop...',
            type: 'navigation'
        };
    }
    
    useItem(args) {
        if (!args || args.length === 0) {
            return {
                success: false,
                message: 'Please specify an item to use. Example: /use shield',
                type: 'system'
            };
        }
        
        const itemName = args.join(' ').toLowerCase();
        const result = this.player.useItem(itemName);
        
        if (!result.success) {
            return result;
        }
        
        // Apply special effects based on the item
        const item = result.item;
        switch (item.id) {
            case 'aura_shield':
                this.gameScene.showEffect('shield_activate');
                break;
            case 'stealth_cloak':
                this.gameScene.showEffect('stealth_activate');
                break;
            // Add cases for other items
        }
        
        return result;
    }
    
    grabLootbox() {
        // Check if there's an active lootbox
        if (!this.gameScene.activeLootbox) {
            return {
                success: false,
                message: 'There are no lootboxes available right now.',
                type: 'system'
            };
        }
        
        // Get lootbox and remove it
        const lootbox = this.gameScene.activeLootbox;
        this.gameScene.activeLootbox = null;
        
        // Process rewards
        const rewards = lootbox.getRewards();
        let rewardMessage = '';
        
        // Apply rewards to player
        rewards.forEach(reward => {
            if (reward.type === 'aura') {
                this.player.aura += reward.amount;
                rewardMessage += `+${reward.amount} Aura\n`;
            } else if (reward.type === 'item') {
                this.player.addItem(reward.item);
                rewardMessage += `New item: ${reward.item.name}\n`;
            }
        });
        
        this.player.save();
        
        // Play effects
        this.gameScene.showEffect('lootbox_open');
        
        return {
            success: true,
            message: `You grabbed a ${lootbox.rarity} lootbox!\n\nRewards:\n${rewardMessage}`,
            rewards: rewards,
            type: 'reward',
            effect: 'lootbox_open'
        };
    }
    
    initiateDuel(args) {
        if (!args || args.length === 0) {
            return {
                success: false,
                message: 'Please specify a player to duel. Example: /duel AuraKnight',
                type: 'system'
            };
        }
        
        const targetName = args.join(' ');
        
        // Check if player exists
        const targetPlayer = this.gameScene.getPlayerByName(targetName);
        if (!targetPlayer) {
            return {
                success: false,
                message: `Player "${targetName}" not found.`,
                type: 'system'
            };
        }
        
        // Check if player is trying to duel themselves
        if (targetPlayer.id === this.player.id) {
            return {
                success: false,
                message: 'You cannot duel yourself.',
                type: 'system'
            };
        }
        
        // Check cooldown
        if (this.player.duelCooldown && Date.now() < this.player.duelCooldown) {
            const timeLeft = Math.ceil((this.player.duelCooldown - Date.now()) / 1000 / 60); // minutes
            return {
                success: false,
                message: `You must wait ${timeLeft} more minutes before challenging another player.`,
                type: 'system'
            };
        }
        
        // Initiate duel request
        this.gameScene.createDuelRequest(this.player, targetPlayer);
        
        return {
            success: true,
            message: `Duel request sent to ${targetName}. They have 60 seconds to accept.`,
            type: 'duel',
            effect: 'duel_request'
        };
    }
    
    attemptTheft(args) {
        if (!args || args.length === 0) {
            return {
                success: false,
                message: 'Please specify a player to steal from. Example: /steal AuraKnight',
                type: 'system'
            };
        }
        
        const targetName = args.join(' ');
        
        // Check if player exists
        const targetPlayer = this.gameScene.getPlayerByName(targetName);
        if (!targetPlayer) {
            return {
                success: false,
                message: `Player "${targetName}" not found.`,
                type: 'system'
            };
        }
        
        // Check if player is trying to steal from themselves
        if (targetPlayer.id === this.player.id) {
            return {
                success: false,
                message: 'You cannot steal from yourself.',
                type: 'system'
            };
        }
        
        // Check cooldown
        if (this.player.theftCooldown && Date.now() < this.player.theftCooldown) {
            const timeLeft = Math.ceil((this.player.theftCooldown - Date.now()) / 1000 / 60); // minutes
            return {
                success: false,
                message: `You must wait ${timeLeft} more minutes before attempting another theft.`,
                type: 'system'
            };
        }
        
        // Calculate theft attempt success probability
        let successChance = 0.4; // Base 40% chance
        
        // Adjust based on level difference
        const levelDiff = targetPlayer.auraLevel - this.player.auraLevel;
        successChance -= levelDiff * 0.05; // -5% per level difference
        
        // Adjust based on items
        if (this.player.hasActiveItem('Aura Magnet')) {
            successChance += 0.15; // +15% with Aura Magnet
        }
        
        if (this.player.hasActiveItem('Precision Lens')) {
            successChance += 0.1; // +10% with Precision Lens
        }
        
        if (targetPlayer.hasActiveItem('Stealth Cloak')) {
            return {
                success: false,
                message: `${targetName} is currently using a Stealth Cloak and cannot be targeted.`,
                type: 'system'
            };
        }
        
        if (targetPlayer.hasActiveItem('Mirror Ward')) {
            // Theft gets reflected
            const auraLost = Math.floor(this.player.aura * 0.05); // Lose 5% of own Aura
            this.player.aura -= auraLost;
            targetPlayer.aura += auraLost;
            
            // Set cooldown
            this.player.theftCooldown = Date.now() + 60 * 60 * 1000; // 1 hour
            this.player.save();
            
            return {
                success: false,
                message: `${targetName}'s Mirror Ward reflected your theft attempt! You lost ${auraLost} Aura to them.`,
                auraLoss: auraLost,
                type: 'theft',
                effect: 'theft_reflected'
            };
        }
        
        if (targetPlayer.hasActiveItem('Aura Shield')) {
            // Shield blocks and is consumed
            targetPlayer.consumeItem('Aura Shield');
            
            // Set cooldown
            this.player.theftCooldown = Date.now() + 60 * 60 * 1000; // 1 hour
            this.player.save();
            
            return {
                success: false,
                message: `${targetName}'s Aura Shield blocked your theft attempt!`,
                type: 'theft',
                effect: 'theft_blocked'
            };
        }
        
        // Ensure the chance is within reasonable bounds
        successChance = Math.max(0.1, Math.min(0.8, successChance));
        
        // Determine success
        const isSuccessful = Math.random() < successChance;
        
        // Set cooldown regardless of outcome
        this.player.theftCooldown = Date.now() + 60 * 60 * 1000; // 1 hour
        
        if (isSuccessful) {
            // Calculate amount to steal
            let stealAmount = Math.floor(targetPlayer.aura * 0.1); // 10% of target's Aura
            
            // Apply buffs
            if (this.player.hasActiveItem('Void Extractor')) {
                stealAmount = Math.floor(stealAmount * 1.5); // 50% more with Void Extractor
            }
            
            // Cap the steal amount to prevent excessive losses
            stealAmount = Math.min(stealAmount, 5000);
            
            // Transfer Aura
            targetPlayer.aura -= stealAmount;
            this.player.aura += stealAmount;
            
            // Check for Temporal Anchor (delayed recovery)
            if (targetPlayer.hasActiveItem('Temporal Anchor')) {
                // Schedule Aura restoration after 1 hour
                this.gameScene.scheduleEvent(60 * 60 * 1000, () => {
                    targetPlayer.aura += stealAmount;
                    targetPlayer.notifications.push({
                        type: 'system',
                        message: `Your Temporal Anchor has restored ${stealAmount} stolen Aura.`
                    });
                    targetPlayer.save();
                });
            }
            
            // Update stats
            this.player.theftsSuccessful = (this.player.theftsSuccessful || 0) + 1;
            this.player.save();
            targetPlayer.save();
            
            return {
                success: true,
                message: `You successfully stole ${stealAmount} Aura from ${targetName}!`,
                auraGain: stealAmount,
                type: 'theft',
                effect: 'theft_success'
            };
        } else {
            // Failed attempt consequences
            const penaltyAmount = Math.floor(this.player.aura * 0.05); // Lose 5% of own Aura
            this.player.aura -= penaltyAmount;
            this.player.save();
            
            return {
                success: false,
                message: `Your theft attempt on ${targetName} failed! You lost ${penaltyAmount} Aura in the process.`,
                auraLoss: penaltyAmount,
                type: 'theft',
                effect: 'theft_failed'
            };
        }
    }
    
    giftAura(args) {
        if (args.length < 2) {
            return {
                success: false,
                message: 'Please specify a player and amount. Example: /gift AuraKnight 100',
                type: 'system'
            };
        }
        
        const amount = parseInt(args[args.length - 1], 10);
        const targetName = args.slice(0, -1).join(' ');
        
        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return {
                success: false,
                message: 'Please specify a valid amount of Aura to gift.',
                type: 'system'
            };
        }
        
        // Check if player has enough Aura
        if (this.player.aura < amount) {
            return {
                success: false,
                message: `You don't have ${amount} Aura to gift.`,
                type: 'system'
            };
        }
        
        // Check if target player exists
        const targetPlayer = this.gameScene.getPlayerByName(targetName);
        if (!targetPlayer) {
            return {
                success: false,
                message: `Player "${targetName}" not found.`,
                type: 'system'
            };
        }
        
        // Transfer Aura
        this.player.aura -= amount;
        targetPlayer.aura += amount;
        
        // Save both players
        this.player.save();
        targetPlayer.save();
        
        // Notify the recipient
        targetPlayer.notifications.push({
            type: 'gift',
            message: `${this.player.name} has gifted you ${amount} Aura!`,
            from: this.player.name,
            amount: amount
        });
        
        return {
            success: true,
            message: `You gifted ${amount} Aura to ${targetName}.`,
            auraLoss: amount,
            type: 'gift',
            effect: 'gift_sent'
        };
    }
    
    startQuest(args) {
        if (!args || args.length === 0) {
            // No quest specified, show available quests
            const availableQuests = this.gameScene.getAvailableQuests(this.player);
            
            if (availableQuests.length === 0) {
                return {
                    success: false,
                    message: 'There are no quests available for you right now. Check back later!',
                    type: 'system'
                };
            }
            
            let message = '== AVAILABLE QUESTS ==\n\n';
            availableQuests.forEach(quest => {
                message += `${quest.name}: ${quest.description}\n`;
                message += `Difficulty: ${quest.difficulty} | Reward: ${quest.reward} Aura\n\n`;
            });
            
            message += 'To start a quest, type: /quest [quest name]';
            
            return {
                success: true,
                message: message,
                quests: availableQuests,
                type: 'quest_list'
            };
        }
        
        const questName = args.join(' ');
        const quest = this.gameScene.getQuestByName(questName);
        
        if (!quest) {
            return {
                success: false,
                message: `Quest "${questName}" not found. Type /quest to see available quests.`,
                type: 'system'
            };
        }
        
        // Check requirements
        if (quest.levelRequirement && this.player.auraLevel < quest.levelRequirement) {
            return {
                success: false,
                message: `You need to be Aura Level ${quest.levelRequirement} to start this quest.`,
                type: 'system'
            };
        }
        
        // Switch to quest scene
        this.gameScene.scene.start('QuestScene', {
            player: this.player,
            quest: quest
        });
        
        return {
            success: true,
            message: `Starting quest: ${quest.name}`,
            type: 'navigation'
        };
    }
    
    startMinigame(args) {
        if (!args || args.length === 0) {
            // No minigame specified, show available ones
            const minigames = [
                { id: 'wordscramble', name: 'Word Unscramble', description: 'Quickly unscramble Aura-related words', reward: '100-300 Aura' },
                { id: 'commandchain', name: 'Command Chain', description: 'Memorize and type command sequences', reward: '150-450 Aura' },
                { id: 'aurapuzzle', name: 'Aura Puzzle', description: 'Solve text-based riddles', reward: '200-600 Aura' },
                { id: 'reaction', name: 'Reaction Test', description: 'Type commands instantly when prompted', reward: '50-150 Aura' }
            ];
            
            let message = '== AVAILABLE MINIGAMES ==\n\n';
            minigames.forEach(game => {
                message += `${game.name}: ${game.description}\n`;
                message += `Reward: ${game.reward}\n\n`;
            });
            
            message += 'To start a minigame, type: /minigame [name]';
            
            return {
                success: true,
                message: message,
                minigames: minigames,
                type: 'minigame_list'
            };
        }
        
        const minigameName = args.join(' ').toLowerCase();
        let minigameId;
        
        // Map input to minigame ID
        if (minigameName.includes('word') || minigameName.includes('scramble')) {
            minigameId = 'wordscramble';
        } else if (minigameName.includes('command') || minigameName.includes('chain')) {
            minigameId = 'commandchain';
        } else if (minigameName.includes('puzzle')) {
            minigameId = 'aurapuzzle';
        } else if (minigameName.includes('reaction')) {
            minigameId = 'reaction';
        } else {
            return {
                success: false,
                message: `Minigame "${minigameName}" not found. Type /minigame to see available games.`,
                type: 'system'
            };
        }
        
        // Switch to minigame scene
        this.gameScene.scene.start('MinigameScene', {
            player: this.player,
            minigameId: minigameId
        });
        
        return {
            success: true,
            message: `Starting minigame: ${minigameId}`,
            type: 'navigation'
        };
    }
    
    showLeaderboard() {
        const leaderboard = this.gameScene.getLeaderboard();
        
        let message = '== AURA LEADERBOARD ==\n\n';
        leaderboard.forEach((player, index) => {
            const rank = index + 1;
            let prefix = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `${rank}.`;
            message += `${prefix} ${player.name}: ${player.aura} Aura (Level ${player.auraLevel})\n`;
        });
        
        // Show player's rank if not in top 10
        const playerRank = leaderboard.findIndex(p => p.id === this.player.id);
        if (playerRank === -1) {
            const fullLeaderboard = this.gameScene.getFullLeaderboard();
            const playerFullRank = fullLeaderboard.findIndex(p => p.id === this.player.id);
            
            if (playerFullRank !== -1) {
                message += `\n...\n\n${playerFullRank + 1}. ${this.player.name}: ${this.player.aura} Aura (Level ${this.player.auraLevel})`;
            }
        }
        
        return {
            success: true,
            message: message,
            leaderboard: leaderboard,
            type: 'leaderboard'
        };
    }
    
    // Combo tracking system
    trackCombo(command) {
        // Add command to the combo tracker
        this.comboTracker.push(command);
        
        // Reset the combo timeout
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
        }
        
        // Set a timeout to clear the combo tracker after 10 seconds
        this.comboTimeout = setTimeout(() => {
            this.comboTracker = [];
        }, 10000);
        
        // Check if we've formed a known combo
        const currentCombo = this.comboTracker.join(',');
        
        // Look for any combo that matches our current sequence
        for (const [comboString, comboData] of Object.entries(this.combos)) {
            if (currentCombo.endsWith(comboString)) {
                // We've completed a combo!
                const reward = comboData.reward;
                
                // Apply any active boosters
                let finalReward = reward;
                if (this.player.hasActiveItem('Aura Catalyst')) {
                    finalReward = Math.floor(finalReward * 1.25);
                }
                
                // Give the reward to the player
                this.player.aura += finalReward;
                this.player.save();
                
                // Clear the combo tracker
                this.comboTracker = [];
                
                // Trigger the visual effect
                this.gameScene.showEffect(comboData.effect || 'combo_success');
                
                // Return success
                return {
                    success: true,
                    message: comboData.message.replace(/\d+/, finalReward),
                    auraGain: finalReward,
                    comboName: comboData.name,
                    type: 'combo',
                    effect: comboData.effect
                };
            }
        }
        
        // If we didn't complete a combo, just acknowledge the command
        return {
            success: true,
            message: `Command: ${command}`,
            type: 'command'
        };
    }
}

export default CommandHandler;