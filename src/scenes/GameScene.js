// src/scenes/GameScene.js

import Phaser from 'phaser';
import CommandHandler from '../classes/CommandHandler';
import Player from '../classes/Player';
import { checkSynergies } from '../data/items';
import Lootbox from '../classes/Lootbox';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.player = null;
        this.commandHandler = null;
        this.activeLootbox = null;
        this.lootboxTimer = null;
        this.activeEffects = [];
        this.scheduledEvents = [];
        
        // UI elements
        this.commandInput = null;
        this.outputText = null;
        this.auraDisplay = null;
        this.sideButtons = [];
    }

    init(data) {
        // Initialize the player from data or load from storage
        if (data.player) {
            this.player = data.player;
        } else if (data.playerId) {
            this.player = Player.load(data.playerId);
        } else {
            // Create a new player if none exists
            this.player = new Player();
        }
        
        // Initialize command handler
        this.commandHandler = new CommandHandler(this, this.player);
    }

    preload() {
        // Load necessary assets
        this.load.image('background', 'assets/images/ui/background.png');
        this.load.image('textbox', 'assets/images/ui/textbox.png');
        this.load.image('button', 'assets/images/ui/button.png');
        this.load.image('aura_meter', 'assets/images/ui/aura_meter.png');
        this.load.image('menu_frame', 'assets/images/ui/menu_frame.png');
        
        // Load particle effects
        this.load.image('particle', 'assets/images/effects/particle.png');
        
        // Load lootbox images
        this.load.image('lootbox_common', 'assets/images/items/lootbox_common.png');
        this.load.image('lootbox_rare', 'assets/images/items/lootbox_rare.png');
        this.load.image('lootbox_epic', 'assets/images/items/lootbox_epic.png');
        
        // Load effect animations
        this.load.spritesheet('effect_daily_bonus', 'assets/images/effects/daily_bonus.png', { 
            frameWidth: 128, frameHeight: 128 
        });
        this.load.spritesheet('effect_level_up', 'assets/images/effects/level_up.png', { 
            frameWidth: 256, frameHeight: 256 
        });
        
        // Load audio
        this.load.audio('command_success', 'assets/audio/command_success.mp3');
        this.load.audio('command_error', 'assets/audio/command_error.mp3');
        this.load.audio('aura_gain', 'assets/audio/aura_gain.mp3');
        this.load.audio('lootbox_spawn', 'assets/audio/lootbox_spawn.mp3');
        this.load.audio('lootbox_open', 'assets/audio/lootbox_open.mp3');
    }

    create() {
        // Create background
        this.add.image(400, 300, 'background');
        
        // Create UI containers
        this.createUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize lootbox spawning
        this.initLootboxSystem();
        
        // Check and apply active item effects
        this.player.processActiveItems();
        
        // Check for active synergies
        this.checkAndApplySynergies();
        
        // Display welcome message
        this.addOutputMessage({
            success: true,
            message: `Welcome to AVRA, ${this.player.name}!\nYou currently have ${this.player.aura} Aura (Level ${this.player.auraLevel}).\nType /help to see available commands.`,
            type: 'system'
        });
    }
    
    update(time, delta) {
        // Process any pending notification animations
        this.processNotifications();
        
        // Update aura display
        this.updateAuraDisplay();
        
        // Process any active effects
        this.updateActiveEffects(delta);
        
        // Check for level ups
        this.checkLevelUp();
    }
    
    createUI() {
        // Main game container
        const gameContainer = this.add.container(400, 280);
        
        // Display background
        const displayBg = this.add.rectangle(-350, -200, 700, 380, 0x10103A, 0.7)
            .setOrigin(0)
            .setStrokeStyle(2, 0x8080FF);
        gameContainer.add(displayBg);
        
        // Header
        const headerText = this.add.text(0, -170, 'AVRA WORLD', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        gameContainer.add(headerText);
        
        // Output text area
        this.outputText = this.add.text(-330, -120, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF',
            wordWrap: { width: 650 }
        }).setOrigin(0);
        gameContainer.add(this.outputText);
        
        // Command input
        const inputBg = this.add.rectangle(400, 500, 600, 60, 0x1A1A4A)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
        
        // Placeholder text
        const placeholderText = this.add.text(110, 500, 'Type command here...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#8080FF',
            alpha: 0.7
        }).setOrigin(0, 0.5);
        
        // Add cursor animation
        const cursor = this.add.rectangle(270, 500, 2, 30, 0xFFFFFF).setOrigin(0.5);
        this.tweens.add({
            targets: cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Create HTML input element for text entry
        this.commandInput = this.add.dom(400, 500).createFromHTML('<input type="text" id="commandInput" placeholder="Type command here..." style="width:580px;height:50px;font-size:18px;background:rgba(26,26,74,0.8);color:white;border:none;padding:0 10px;border-radius:5px;">');
        this.commandInput.addListener('keydown');
        
        // Listen for key events
        this.commandInput.on('keydown', (event) => {
            if (event.key === 'Enter') {
                const input = event.target.value;
                
                // Clear the input
                event.target.value = '';
                
                // Process the command
                this.processCommand(input);
            }
        });
        
        // Aura level display
        const auraContainer = this.add.container(400, 50);
        
        // Outer frame
        const auraFrame = this.add.rectangle(0, 0, 300, 60, 0x10103A)
            .setStrokeStyle(2, 0x8080FF)
            .setOrigin(0.5);
        auraContainer.add(auraFrame);
        
        // Aura meter
        this.auraMeter = this.add.rectangle(-140, 0, 280, 40, 0x4F4FFF)
            .setOrigin(0, 0.5);
        auraContainer.add(this.auraMeter);
        
        // Aura text
        this.auraDisplay = this.add.text(0, 0, `${this.player.aura.toLocaleString()} AURA`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        auraContainer.add(this.auraDisplay);
        
        // Add particle effects to aura display
        this.createAuraParticles(auraContainer);
        
        // Side menu buttons
        this.createSideButtons();
        
        // Player avatar and info
        this.createPlayerAvatar();
    }
    
    createAuraParticles(container) {
        // Create particle emitter for aura display
        const particles = this.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: 0,
            y: 0,
            speed: { min: 10, max: 30 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            frequency: 100
        });
        
        // Add particles to container
        container.add(particles);
        
        // Update particle color based on aura level
        this.updateParticleColors(emitter);
    }
    
    updateParticleColors(emitter) {
        // Color scheme based on aura level
        const colors = [
            0x4F4FFF,  // Level 1: Pale blue
            0x00FFFF,  // Level 2: Cyan
            0x00AAFF,  // Level 3: Electric blue
            0x9966FF,  // Level 4: Purple-blue
            0xAA00FF,  // Level 5: Cosmic violet
            0xFFD700,  // Level 6: Gold
            0xFF00FF   // Level 7: Rainbow (simplified as magenta)
        ];
        
        const level = this.player.auraLevel;
        const color = colors[Math.min(level - 1, colors.length - 1)];
        
        // Update emitter tint
        emitter.setTint(color);
    }
    
    createSideButtons() {
        const buttonLabels = [
            'INVENTORY',
            'SHOP',
            'QUESTS',
            'MINIGAMES',
            'DUELS',
            'LEADERBOARD',
            'SETTINGS'
        ];
        
        const buttonCommands = [
            '/inventory',
            '/shop',
            '/quest',
            '/minigame',
            '/duel',
            '/leaderboard',
            '/settings'
        ];
        
        const buttonY = -200;
        const spacing = 60;
        
        buttonLabels.forEach((label, index) => {
            const y = buttonY + (index * spacing);
            
            // Button background
            const button = this.add.rectangle(720, 300 + y, 120, 40, 0x6464FF)
                .setInteractive()
                .on('pointerdown', () => {
                    this.processCommand(buttonCommands[index]);
                })
                .on('pointerover', () => {
                    button.setFillStyle(0x8080FF);
                })
                .on('pointerout', () => {
                    button.setFillStyle(0x6464FF);
                });
            
            // Button text
            const text = this.add.text(720, 300 + y, label, {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            
            this.sideButtons.push({ button, text });
        });
    }
    
    createPlayerAvatar() {
        const avatarContainer = this.add.container(80, 300);
        
        // Avatar background
        const avatarBg = this.add.circle(0, 0, 60, 0x10103A)
            .setStrokeStyle(2, 0x8080FF);
        avatarContainer.add(avatarBg);
        
        // Aura effect
        const auraEffect = this.add.circle(0, 0, 70, 0xFFFFFF, 0.3);
        avatarContainer.add(auraEffect);
        
        // Pulse animation for aura effect
        this.tweens.add({
            targets: auraEffect,
            radius: 75,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Player silhouette (using graphics for custom drawing)
        const silhouette = this.add.graphics();
        silhouette.fillStyle(0xFFFFFF, 1);
        
        // Draw head
        silhouette.fillCircle(0, -10, 10);
        
        // Draw body
        silhouette.fillPath();
        silhouette.moveTo(0, -30);
        silhouette.lineTo(-20, -15);
        silhouette.lineTo(-20, 15);
        silhouette.lineTo(0, 15);
        silhouette.lineTo(20, 15);
        silhouette.lineTo(20, -15);
        silhouette.closePath();
        silhouette.fillPath();
        
        avatarContainer.add(silhouette);
        
        // Player name
        const nameText = this.add.text(0, 80, this.player.name, {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        avatarContainer.add(nameText);
        
        // Active item indicators
        this.updateActiveItemIndicators(avatarContainer);
    }
    
    updateActiveItemIndicators(container) {
        // Clear existing indicators
        container.list.forEach(child => {
            if (child.itemIndicator) {
                child.destroy();
            }
        });
        
        // Add new indicators for active items
        const activeItems = this.player.activeItems.slice(0, 4); // Show max 4 items
        
        activeItems.forEach((item, index) => {
            // Calculate position in a circle around avatar
            const angle = (index / activeItems.length) * Math.PI * 2;
            const x = Math.cos(angle) * 80;
            const y = Math.sin(angle) * 80;
            
            // Indicator background
            const indicator = this.add.circle(x, y, 15, 0x4040A0)
                .setStrokeStyle(1, 0xFFFFFF);
            indicator.itemIndicator = true;
            
            // Item initial
            const initial = this.add.text(x, y, item.name.charAt(0).toUpperCase(), {
                fontFamily: 'Arial',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            initial.itemIndicator = true;
            
            container.add(indicator);
            container.add(initial);
        });
    }
    
    setupEventListeners() {
        // Listen for global events
        this.events.on('shutdown', this.shutdown, this);
        
        // Custom event for when the player's data is updated
        window.addEventListener('avra_player_save', this.onPlayerUpdate.bind(this));
    }
    
    onPlayerUpdate(event) {
        // Update UI when player data changes
        this.updateAuraDisplay();
        this.updateActiveItemIndicators(this.children.list.find(child => child.type === 'Container' && child.x === 80 && child.y === 300));
    }
    
    shutdown() {
        // Clean up event listeners
        window.removeEventListener('avra_player_save', this.onPlayerUpdate);
        
        // Clear timers
        if (this.lootboxTimer) {
            clearTimeout(this.lootboxTimer);
        }
        
        this.scheduledEvents.forEach(event => {
            clearTimeout(event.timer);
        });
    }
    
    processCommand(input) {
        // Skip if empty
        if (!input || input.trim() === '') {
            return;
        }
        
        // Process command
        const result = this.commandHandler.processCommand(input);
        
        // Display result
        this.addOutputMessage(result);
        
        // Play sound based on result
        if (result.success) {
            this.sound.play('command_success');
            
            // Show effect if specified
            if (result.effect) {
                this.showEffect(result.effect);
            }
            
            // Handle aura gains/losses
            if (result.auraGain) {
                this.animateAuraGain(result.auraGain);
            }
            
            if (result.auraLoss) {
                this.animateAuraLoss(result.auraLoss);
            }
        } else {
            this.sound.play('command_error');
        }
    }
    
    addOutputMessage(result) {
        // Format message based on type
        let formattedMessage = '';
        const message = result.message || '';
        
        switch (result.type) {
            case 'system':
                formattedMessage = `[System] ${message}`;
                break;
            case 'reward':
                formattedMessage = `[Reward] ${message}`;
                break;
            case 'chat':
                formattedMessage = message;
                break;
            case 'theft':
                formattedMessage = `[Theft] ${message}`;
                break;
            case 'duel':
                formattedMessage = `[Duel] ${message}`;
                break;
            case 'combo':
                formattedMessage = `[Combo] ${message}`;
                break;
            default:
                formattedMessage = message;
        }
        
        // Keep a limited history of messages (max 10)
        const currentText = this.outputText.text;
        const lines = currentText.split('\n');
        
        // Add new message
        if (lines.length > 9) {
            // Remove oldest message if we're at capacity
            lines.shift();
        }
        
        // Add new message with proper wrapping
        const wrappedMessage = this.wrapText(formattedMessage, 80);
        lines.push(...wrappedMessage);
        
        // Update text
        this.outputText.setText(lines.join('\n'));
        
        // Scroll to bottom by adjusting position
        this.outputText.y = Math.min(-120, -120 - (lines.length - 10) * 20);
    }
    
    wrapText(text, maxChars) {
        // Simple text wrapper
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    updateAuraDisplay() {
        // Update aura text
        this.auraDisplay.setText(`${this.player.aura.toLocaleString()} AURA`);
        
        // Update aura meter width based on level progress
        const levels = [0, 1000, 5000, 10000, 25000, 50000, 100000, Infinity];
        const currentLevel = this.player.auraLevel;
        
        const minAura = levels[currentLevel - 1];
        const maxAura = levels[currentLevel];
        const range = maxAura - minAura;
        const progress = (this.player.aura - minAura) / range;
        
        // Cap progress at 1.0 for highest level
        const cappedProgress = currentLevel === 7 ? 1.0 : progress;
        
        // Update meter width
        this.auraMeter.width = Math.max(10, Math.min(280, 280 * cappedProgress));
        
        // Update meter color based on level
        const colors = [
            0x4F4FFF,  // Level 1: Pale blue
            0x00FFFF,  // Level 2: Cyan
            0x00AAFF,  // Level 3: Electric blue
            0x9966FF,  // Level 4: Purple-blue
            0xAA00FF,  // Level 5: Cosmic violet
            0xFFD700,  // Level 6: Gold
            0xFF00FF   // Level 7: Rainbow (simplified as magenta)
        ];
        
        this.auraMeter.fillColor = colors[currentLevel - 1];
    }
    
    animateAuraGain(amount) {
        // Create floating text animation for aura gain
        const auraGainText = this.add.text(400, 40, `+${amount}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#80FF80'
        }).setOrigin(0.5);
        
        // Animate
        this.tweens.add({
            targets: auraGainText,
            y: 10,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                auraGainText.destroy();
            }
        });
        
        // Play sound
        this.sound.play('aura_gain');
    }
    
    animateAuraLoss(amount) {
        // Create floating text animation for aura loss
        const auraLossText = this.add.text(400, 40, `-${amount}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FF8080'
        }).setOrigin(0.5);
        
        // Animate
        this.tweens.add({
            targets: auraLossText,
            y: 10,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                auraLossText.destroy();
            }
        });
    }
    
    showEffect(effectType) {
        let x = 400;
        let y = 300;
        let duration = 1000;
        
        // Configure effect based on type
        switch (effectType) {
            case 'daily_bonus':
                this.createParticleEffect(400, 50, 0x80FF80, 50);
                break;
                
            case 'level_up':
                this.createLevelUpEffect();
                break;
                
            case 'lootbox_open':
                this.createParticleEffect(400, 300, 0xFFFF00, 100);
                this.sound.play('lootbox_open');
                break;
                
            case 'theft_success':
                this.createParticleEffect(80, 300, 0xFF00FF, 30);
                break;
                
            case 'theft_failed':
                this.createParticleEffect(80, 300, 0xFF0000, 30);
                break;
                
            case 'combo_success':
                this.createParticleEffect(400, 300, 0x00FFFF, 80);
                break;
                
            // Add more effect types as needed
        }
        
        // Add to active effects
        this.activeEffects.push({
            type: effectType,
            container: null, // Optional container reference
            startTime: this.time.now,
            duration: duration
        });
    }
    
    createParticleEffect(x, y, color, count) {
        // Create particle emitter
        const particles = this.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 200 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            quantity: count
        });
        
        // Set particle color
        emitter.setTint(color);
        
        // Destroy after animation completes
        this.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    
    createLevelUpEffect() {
        // Create container for level up effect
        const container = this.add.container(400, 300);
        
        // Add circular glow
        const glow = this.add.circle(0, 0, 100, 0xFFFFFF, 0.3);
        container.add(glow);
        
        // Add text
        const levelText = this.add.text(0, 0, `LEVEL ${this.player.auraLevel}`, {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        container.add(levelText);
        
        // Add particles
        const particles = this.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: 0,
            y: 0,
            speed: { min: 100, max: 300 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            quantity: 100
        });
        
        emitter.setTint(0xFFFF00);
        container.add(particles);
        
        // Animate
        this.tweens.add({
            targets: glow,
            radius: 300,
            alpha: 0,
            duration: 2000
        });
        
        this.tweens.add({
            targets: levelText,
            scale: 2,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                container.destroy();
            }
        });
    }
    
    updateActiveEffects(delta) {
        // Process and update active visual effects
        this.activeEffects = this.activeEffects.filter(effect => {
            const elapsed = this.time.now - effect.startTime;
            
            if (elapsed >= effect.duration) {
                // Effect is complete, remove it
                if (effect.container && effect.container.active) {
                    effect.container.destroy();
                }
                return false;
            }
            
            // Effect still active
            return true;
        });
    }
    
    checkLevelUp() {
        // Store current level
        const currentLevel = this.player.auraLevel;
        
        // If level changed since last frame
        if (currentLevel > this._lastLevel) {
            // Show level up effect
            this.showEffect('level_up');
            
            // Add congratulatory message
            this.addOutputMessage({
                success: true,
                message: `Congratulations! You reached Aura Level ${currentLevel}!`,
                type: 'system'
            });
            
            // Play sound
            this.sound.play('level_up');
        }
        
        // Update last known level
        this._lastLevel = currentLevel;
    }
    
    processNotifications() {
        // Process any pending notifications
        if (this.player.notifications && this.player.notifications.length > 0) {
            const notification = this.player.notifications.shift();
            this.addOutputMessage(notification);
        }
    }
    
    initLootboxSystem() {
        // Schedule first lootbox
        this.scheduleLootbox();
    }
    
    scheduleLootbox() {
        // Random time between 15-45 minutes (for demo, use shorter times)
        const minTimeMs = 15 * 1000; // 15 seconds for demo
        const maxTimeMs = 45 * 1000; // 45 seconds for demo
        
        const spawnTime = Math.floor(Math.random() * (maxTimeMs - minTimeMs + 1)) + minTimeMs;
        
        // Clear any existing timer
        if (this.lootboxTimer) {
            clearTimeout(this.lootboxTimer);
        }
        
        // Schedule next lootbox
        this.lootboxTimer = setTimeout(() => {
            this.spawnLootbox();
        }, spawnTime);
    }
    
    spawnLootbox() {
        // Create lootbox instance
        this.activeLootbox = new Lootbox();
        
        // Show lootbox notification
        this.createLootboxNotification();
        
        // Play sound
        this.sound.play('lootbox_spawn');
        
        // Auto-despawn after 30 seconds
        setTimeout(() => {
            if (this.activeLootbox) {
                this.activeLootbox = null;
                this.addOutputMessage({
                    success: false,
                    message: 'The lootbox disappeared!',
                    type: 'system'
                });
                
                // Schedule next lootbox
                this.scheduleLootbox();
            }
        }, 30000);
    }
    
    createLootboxNotification() {
        // Create notification container
        const container = this.add.container(600, 400);
        
        // Background
        const bg = this.add.rectangle(0, 0, 200, 60, 0x4040A0)
            .setStrokeStyle(2, 0xFFFF00);
        container.add(bg);
        
        // Pulsing animation
        this.tweens.add({
            targets: bg,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Text
        const text1 = this.add.text(0, -10, 'LOOTBOX APPEARED!', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        container.add(text1);
        
        const text2 = this.add.text(0, 10, 'Type /grab to claim', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        container.add(text2);
        
        // Auto destroy when lootbox is gone
        this.time.delayedCall(30000, () => {
            container.destroy();
        });
    }
    
    scheduleEvent(delay, callback) {
        // Schedule a future event
        const timer = setTimeout(() => {
            callback();
            
            // Remove from scheduled events
            this.scheduledEvents = this.scheduledEvents.filter(e => e.timer !== timer);
        }, delay);
        
        // Add to tracked events
        this.scheduledEvents.push({ timer, callback });
    }
    
    checkAndApplySynergies() {
        // Check for active synergies
        const activeSynergies = checkSynergies(this.player);
        
        if (activeSynergies.length > 0) {
            // Notify player of active synergies
            activeSynergies.forEach(synergy => {
                this.addOutputMessage({
                    success: true,
                    message: `Synergy active: ${synergy.name} - ${synergy.description}`,
                    type: 'system'
                });
            });
        }
    }
    
    // Helper functions for other components to use
    getPlayerByName(name) {
        // In a full implementation, this would query the database
        // For this demo, we'll return null for any player but self
        if (name.toLowerCase() === this.player.name.toLowerCase()) {
            return this.player;
        }
        
        // Simulate finding another player (for testing)
        if (name.toLowerCase() === 'npc_player') {
            return new Player({
                id: 'npc_1',
                name: 'NPC_Player',
                aura: 5000,
                auraLevel: 3
            });
        }
        
        return null;
    }
    
    getLeaderboard() {
        // In a full implementation, this would query the database
        // For this demo, we'll return a static leaderboard with the player included
        
        // Create some fake players
        const fakePlayers = [
            { id: 'p1', name: 'AuraLord99', aura: 150000, auraLevel: 7 },
            { id: 'p2', name: 'MysticMaster', aura: 75000, auraLevel: 6 },
            { id: 'p3', name: 'EnergySeeker', aura: 40000, auraLevel: 5 },
            { id: 'p4', name: 'AetherKnight', aura: 20000, auraLevel: 4 }
        ];
        
        // Add the player to the list
        const allPlayers = [
            ...fakePlayers,
            {
                id: this.player.id,
                name: this.player.name,
                aura: this.player.aura,
                auraLevel: this.player.auraLevel
            }
        ];
        
        // Sort by aura (descending)
        return allPlayers.sort((a, b) => b.aura - a.aura).slice(0, 10);
    }
    
    getAvailableQuests() {
        // In a full implementation, this would return quests based on player level
        // For this demo, we'll return static quests
        return [
            {
                id: 'q1',
                name: 'Crystal Caverns',
                description: 'Explore the ancient crystal caverns to find rare Aura crystals.',
                difficulty: 'Medium',
                reward: 500,
                levelRequirement: 1
            },
            {
                id: 'q2',
                name: 'Shadow Realm',
                description: 'Enter the shadow realm and overcome its challenges to gain Aura mastery.',
                difficulty: 'Hard',
                reward: 800,
                levelRequirement: 2
            },
            {
                id: 'q3',
                name: 'Aura Temple',
                description: 'Visit the mystical Aura temple and learn ancient techniques from the masters.',
                difficulty: 'Easy',
                reward: 300,
                levelRequirement: 1
            }
        ];
    }
    
    getQuestByName(name) {
        const quests = this.getAvailableQuests();
        return quests.find(q => q.name.toLowerCase() === name.toLowerCase());
    }
    
    createDuelRequest(player, target) {
        // In a full implementation, this would notify the target player and set up a duel
        // For this demo, we'll simulate the duel with a timeout
        
        this.addOutputMessage({
            success: true,
            message: `Duel request sent to ${target.name}. Awaiting response...`,
            type: 'duel'
        });
        
        // Simulate target player accepting or declining
        setTimeout(() => {
            const accepted = Math.random() > 0.3; // 70% chance to accept
            
            if (accepted) {
                this.startDuel(player, target);
            } else {
                this.addOutputMessage({
                    success: false,
                    message: `${target.name} declined your duel request.`,
                    type: 'duel'
                });
            }
        }, 5000); // 5 second decision time
    }
    
    startDuel(player, target) {
        // Determine outcome based on levels and random chance
        const playerLevelBonus = player.auraLevel * 0.1;
        const targetLevelBonus = target.auraLevel * 0.1;
        
        const playerScore = Math.random() + playerLevelBonus;
        const targetScore = Math.random() + targetLevelBonus;
        
        // Calculate Aura at stake - 5% of lower player's Aura
        const auraAtStake = Math.floor(Math.min(player.aura, target.aura) * 0.05);
        
        if (playerScore > targetScore) {
            // Player wins
            player.aura += auraAtStake;
            target.aura -= auraAtStake;
            player.duelsWon = (player.duelsWon || 0) + 1;
            
            this.addOutputMessage({
                success: true,
                message: `You won the duel against ${target.name}! You gained ${auraAtStake} Aura.`,
                type: 'duel',
                auraGain: auraAtStake
            });
            
            this.animateAuraGain(auraAtStake);
            this.showEffect('duel_win');
        } else {
            // Player loses
            player.aura -= auraAtStake;
            target.aura += auraAtStake;
            player.duelsLost = (player.duelsLost || 0) + 1;
            
            this.addOutputMessage({
                success: false,
                message: `You lost the duel against ${target.name}! You lost ${auraAtStake} Aura.`,
                type: 'duel',
                auraLoss: auraAtStake
            });
            
            this.animateAuraLoss(auraAtStake);
            this.showEffect('duel_lose');
        }
        
        // Set cooldown
        player.duelCooldown = Date.now() + (10 * 60 * 1000); // 10 minute cooldown
        
        // Save player
        player.save();
    }
}

export default GameScene;