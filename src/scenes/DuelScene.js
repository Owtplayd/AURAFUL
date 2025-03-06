// src/scenes/DuelScene.js

import Phaser from 'phaser';

class DuelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DuelScene' });
        
        this.player = null;
        this.opponent = null;
        this.duelState = 'waiting'; // waiting, preparing, active, complete
        this.duelResult = null;
        this.auraAtStake = 0;
    }
    
    init(data) {
        this.player = data.player;
        this.opponent = data.opponent;
        
        // Calculate aura at stake - 5% of lower player's Aura
        this.auraAtStake = Math.floor(Math.min(
            this.player.aura,
            this.opponent.aura || 5000 // Default opponent aura if not provided
        ) * 0.05);
        
        // Ensure minimum stake
        this.auraAtStake = Math.max(100, this.auraAtStake);
        
        // Ensure reasonable maximum
        this.auraAtStake = Math.min(5000, this.auraAtStake);
    }
    
    preload() {
        // Assets should already be loaded in PreloadScene
    }
    
    create() {
        // Create background
        this.add.image(400, 300, 'duel_background');
        
        // Create UI elements
        this.createHeader();
        this.createDuelArea();
        this.createControls();
        
        // Start duel flow
        this.startDuel();
    }
    
    createHeader() {
        // Duel title
        this.add.text(400, 30, 'AURA DUEL', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Stakes display
        this.add.text(400, 70, `${this.auraAtStake} Aura at stake`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFF00'
        }).setOrigin(0.5);
    }
    
    createDuelArea() {
        // Main duel arena
        this.duelArena = this.add.container(400, 280);
        
        // Arena background
        const arenaBg = this.add.rectangle(0, 0, 700, 300, 0x10103A, 0.7)
            .setStrokeStyle(2, 0x8080FF);
        this.duelArena.add(arenaBg);
        
        // Player side
        this.createPlayerSide();
        
        // Opponent side
        this.createOpponentSide();
        
        // Divider
        const divider = this.add.rectangle(0, 0, 4, 300, 0x8080FF, 0.5);
        this.duelArena.add(divider);
        
        // Status text (for duel progress)
        this.statusText = this.add.text(0, -120, 'Preparing for duel...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.duelArena.add(this.statusText);
        
        // Result text (hidden until duel completes)
        this.resultText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5).setVisible(false);
        this.duelArena.add(this.resultText);
    }
    
    createPlayerSide() {
        // Player container (left side)
        this.playerContainer = this.add.container(-180, 0);
        this.duelArena.add(this.playerContainer);
        
        // Player name
        const playerName = this.add.text(0, -80, this.player.name, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.playerContainer.add(playerName);
        
        // Player level/rank
        const playerLevel = this.add.text(0, -50, `Level ${this.player.auraLevel} - ${this.player.rank}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#AAAAFF'
        }).setOrigin(0.5);
        this.playerContainer.add(playerLevel);
        
        // Player avatar circle
        const avatarBg = this.add.circle(0, 30, 60, 0x10103A)
            .setStrokeStyle(2, 0x8080FF);
        this.playerContainer.add(avatarBg);
        
        // Aura effect around avatar
        this.playerAura = this.add.circle(0, 30, 70, 0x4F4FFF, 0.3);
        this.playerContainer.add(this.playerAura);
        
        // Pulse animation for aura effect
        this.tweens.add({
            targets: this.playerAura,
            radius: 75,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Player avatar (simplified for demo)
        const avatar = this.add.circle(0, 30, 50, 0x4F4FFF, 0.8);
        this.playerContainer.add(avatar);
        
        // Player energy bar
        const energyBg = this.add.rectangle(0, 110, 150, 20, 0x222244)
            .setStrokeStyle(1, 0x8080FF);
        this.playerContainer.add(energyBg);
        
        this.playerEnergyBar = this.add.rectangle(-75, 110, 0, 18, 0x4F4FFF)
            .setOrigin(0, 0.5);
        this.playerContainer.add(this.playerEnergyBar);
    }
    
    createOpponentSide() {
        // Opponent container (right side)
        this.opponentContainer = this.add.container(180, 0);
        this.duelArena.add(this.opponentContainer);
        
        // Opponent name
        const opponentName = this.add.text(0, -80, this.opponent ? this.opponent.name : 'Opponent', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.opponentContainer.add(opponentName);
        
        // Opponent level/rank
        const opponentLevel = this.add.text(0, -50, this.opponent ? 
            `Level ${this.opponent.auraLevel} - ${this.opponent.rank}` : 'Unknown Challenger', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFAAAA'
        }).setOrigin(0.5);
        this.opponentContainer.add(opponentLevel);
        
        // Opponent avatar circle
        const avatarBg = this.add.circle(0, 30, 60, 0x10103A)
            .setStrokeStyle(2, 0xFF8080);
        this.opponentContainer.add(avatarBg);
        
        // Aura effect around avatar
        this.opponentAura = this.add.circle(0, 30, 70, 0xFF4F4F, 0.3);
        this.opponentContainer.add(this.opponentAura);
        
        // Pulse animation for aura effect
        this.tweens.add({
            targets: this.opponentAura,
            radius: 75,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Opponent avatar (simplified for demo)
        const avatar = this.add.circle(0, 30, 50, 0xFF4F4F, 0.8);
        this.opponentContainer.add(avatar);
        
        // Opponent energy bar
        const energyBg = this.add.rectangle(0, 110, 150, 20, 0x222244)
            .setStrokeStyle(1, 0xFF8080);
        this.opponentContainer.add(energyBg);
        
        this.opponentEnergyBar = this.add.rectangle(-75, 110, 0, 18, 0xFF4F4F)
            .setOrigin(0, 0.5);
        this.opponentContainer.add(this.opponentEnergyBar);
    }
    
    createControls() {
        // Back button (shown during waiting or after duel)
        this.backButton = this.add.rectangle(80, 550, 100, 40, 0x6464FF)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
        
        this.backText = this.add.text(80, 550, 'BACK', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.backButton.on('pointerover', () => {
            this.backButton.setFillStyle(0x8080FF);
        });
        
        this.backButton.on('pointerout', () => {
            this.backButton.setFillStyle(0x6464FF);
        });
        
        this.backButton.on('pointerdown', () => {
            this.exitDuel();
        });
        
        // Duel action buttons (shown during active duel)
        this.actionButtons = [];
        
        // Attack button
        const attackButton = this.add.rectangle(250, 550, 150, 40, 0xFF4444)
            .setStrokeStyle(2, 0xFF8888)
            .setInteractive()
            .setVisible(false);
        
        const attackText = this.add.text(250, 550, 'ATTACK', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5).setVisible(false);
        
        attackButton.on('pointerdown', () => {
            this.performAction('attack');
        });
        
        // Defend button
        const defendButton = this.add.rectangle(400, 550, 150, 40, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive()
            .setVisible(false);
        
        const defendText = this.add.text(400, 550, 'DEFEND', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5).setVisible(false);
        
        defendButton.on('pointerdown', () => {
            this.performAction('defend');
        });
        
        // Channel button
        const channelButton = this.add.rectangle(550, 550, 150, 40, 0x4444AA)
            .setStrokeStyle(2, 0x8888FF)
            .setInteractive()
            .setVisible(false);
        
        const channelText = this.add.text(550, 550, 'CHANNEL', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5).setVisible(false);
        
        channelButton.on('pointerdown', () => {
            this.performAction('channel');
        });
        
        // Store action buttons for easy access
        this.actionButtons = [
            { button: attackButton, text: attackText, action: 'attack' },
            { button: defendButton, text: defendText, action: 'defend' },
            { button: channelButton, text: channelText, action: 'channel' }
        ];
        
        // Add hover effects to action buttons
        this.actionButtons.forEach(item => {
            const button = item.button;
            const originalColor = button.fillColor;
            const hoverColor = Phaser.Display.Color.GetColor32(
                ((originalColor >> 16) & 0xFF) + 40,
                ((originalColor >> 8) & 0xFF) + 40,
                (originalColor & 0xFF) + 40,
                255
            );
            
            button.on('pointerover', () => {
                button.setFillStyle(hoverColor);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(originalColor);
            });
        });
    }
    
    startDuel() {
        // Set duel state to waiting
        this.duelState = 'waiting';
        
        // Update status text
        this.statusText.setText('Waiting for opponent...');
        
        // Add countdown to simulate opponent acceptance
        let countdown = 3;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            this.statusText.setText(`Opponent joining in ${countdown}...`);
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.prepareDuel();
            }
        }, 1000);
    }
    
    prepareDuel() {
        // Set duel state to preparing
        this.duelState = 'preparing';
        
        // Update status text
        this.statusText.setText('Duel starting...');
        
        // Reset energy bars
        this.playerEnergyBar.width = 0;
        this.opponentEnergyBar.width = 0;
        
        // Start energy filling animation
        this.tweens.add({
            targets: [this.playerEnergyBar, this.opponentEnergyBar],
            width: 150,
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                this.startDuelAction();
            }
        });
    }
    
    startDuelAction() {
        // Set duel state to active
        this.duelState = 'active';
        
        // Update status text
        this.statusText.setText('Choose your action!');
        
        // Show action buttons
        this.actionButtons.forEach(item => {
            item.button.setVisible(true);
            item.text.setVisible(true);
        });
        
        // Hide back button during active duel
        this.backButton.setVisible(false);
        this.backText.setVisible(false);
    }
    
    performAction(action) {
        // Hide action buttons
        this.actionButtons.forEach(item => {
            item.button.setVisible(false);
            item.text.setVisible(false);
        });
        
        // Show player action
        this.statusText.setText(`You chose to ${action}!`);
        
        // Simulate opponent's action and determine outcome
        this.time.delayedCall(1000, () => {
            // Random opponent action
            const opponentActions = ['attack', 'defend', 'channel'];
            const opponentAction = opponentActions[Math.floor(Math.random() * opponentActions.length)];
            
            this.statusText.setText(`You chose to ${action}. Opponent chose to ${opponentAction}.`);
            
            // Determine winner based on actions
            this.time.delayedCall(1500, () => {
                this.determineDuelOutcome(action, opponentAction);
            });
        });
    }
    
    determineDuelOutcome(playerAction, opponentAction) {
        // Simple rock-paper-scissors style logic:
        // attack beats channel, channel beats defend, defend beats attack
        let playerWins = false;
        
        if (playerAction === opponentAction) {
            // Tie, slightly favor the player for simplicity
            playerWins = Math.random() > 0.5;
        } else if (
            (playerAction === 'attack' && opponentAction === 'channel') ||
            (playerAction === 'channel' && opponentAction === 'defend') ||
            (playerAction === 'defend' && opponentAction === 'attack')
        ) {
            // Player wins
            playerWins = true;
        } else {
            // Opponent wins
            playerWins = false;
        }
        
        // Apply level modifier
        const playerLevel = this.player.auraLevel;
        const opponentLevel = this.opponent ? this.opponent.auraLevel : 3; // Default level 3
        
        // Each level difference gives a 10% advantage
        const levelDifference = playerLevel - opponentLevel;
        const levelModifier = levelDifference * 0.1;
        
        // Apply the modifier (50% chance base + level modifier)
        playerWins = Math.random() < (0.5 + levelModifier) ? playerWins : !playerWins;
        
        // Complete the duel
        this.completeDuel(playerWins);
    }
    
    completeDuel(playerWins) {
        // Set duel state to complete
        this.duelState = 'complete';
        
        // Hide status text
        this.statusText.setVisible(false);
        
        // Show result text
        this.resultText.setText(playerWins ? 'VICTORY!' : 'DEFEAT!');
        this.resultText.setColor(playerWins ? '#44FF44' : '#FF4444');
        this.resultText.setVisible(true);
        
        // Apply duel rewards/penalties
        if (playerWins) {
            // Player wins and gains Aura
            this.player.aura += this.auraAtStake;
            this.player.duelsWon = (this.player.duelsWon || 0) + 1;
            
            // Create floating text for Aura gain
            this.createFloatingText(`+${this.auraAtStake} Aura`, 0x44FF44);
            
            // Victory particles
            this.createParticleEffect(this.playerContainer.x, this.playerContainer.y, 0x44FF44, 100);
        } else {
            // Player loses and loses Aura
            this.player.aura -= this.auraAtStake;
            this.player.duelsLost = (this.player.duelsLost || 0) + 1;
            
            // Create floating text for Aura loss
            this.createFloatingText(`-${this.auraAtStake} Aura`, 0xFF4444);
            
            // Defeat particles
            this.createParticleEffect(this.opponentContainer.x, this.opponentContainer.y, 0xFF4444, 100);
        }
        
        // Save player data
        this.player.save();
        
        // Show back button
        this.backButton.setVisible(true);
        this.backText.setVisible(true);
        
        // Add continue button
        const continueButton = this.add.rectangle(400, 550, 200, 40, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        
        const continueText = this.add.text(400, 550, 'CONTINUE', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        continueButton.on('pointerover', () => {
            continueButton.setFillStyle(0x88FF88);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setFillStyle(0x44AA44);
        });
        
        continueButton.on('pointerdown', () => {
            this.exitDuel();
        });
    }
    
    createFloatingText(message, color) {
        // Create floating text
        const textColor = color ? `#${color.toString(16)}` : '#FFFFFF';
        
        const floatingText = this.add.text(400, 450, message, {
            fontFamily: 'Arial',
            fontSize: '26px',
            fontStyle: 'bold',
            color: textColor
        }).setOrigin(0.5);
        
        // Animate
        this.tweens.add({
            targets: floatingText,
            y: 400,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }
    
    createParticleEffect(x, y, color, count) {
        // Create particle emitter
        const particles = this.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: x + 400, // Adjust for container position
            y: y + 280, // Adjust for container position
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
    
    exitDuel() {
        // Return to game scene
        this.scene.start('GameScene', { player: this.player });
    }
}

export default DuelScene;