// src/scenes/MainMenuScene.js

import Phaser from 'phaser';

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.player = null;
        this.nameInput = null;
    }

    init(data) {
        if (data.player) {
            this.player = data.player;
        }
    }

    create() {
        // Create background with particle effects
        this.createBackground();
        
        // Create title and logo
        this.createTitle();
        
        // Create welcome panel and name input
        this.createWelcomePanel();
        
        // Play background music
        this.sound.play('menu_music', {
            loop: true,
            volume: this.game.globals.settings.musicVolume
        });
    }

    createBackground() {
        // Add background image
        this.add.image(400, 300, 'background');
        
        // Add particle effects
        const particles = this.add.particles('aura_particle');
        
        particles.createEmitter({
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            lifespan: 6000,
            speedX: { min: -20, max: 20 },
            speedY: { min: -20, max: 20 },
            scale: { start: 0.2, end: 0 },
            quantity: 2,
            blendMode: 'ADD',
            tint: [0x4F4FFF, 0x00FFFF, 0x9966FF, 0xFF00FF]
        });
    }

    createTitle() {
        // Add game logo
        const logo = this.add.image(400, 120, 'logo').setScale(1.2);
        
        // Add glow effect to logo
        this.tweens.add({
            targets: logo,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add tagline
        this.add.text(400, 200, 'Master Your Aura, Rule the Realm', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#CCCCFF',
            align: 'center'
        }).setOrigin(0.5);
    }

    createWelcomePanel() {
        // Create welcome container
        const welcomePanel = this.add.container(400, 330);
        
        // Welcome panel background
        const panelBg = this.add.rectangle(0, 0, 500, 300, 0x10103A, 0.8)
            .setStrokeStyle(3, 0x8080FF);
        welcomePanel.add(panelBg);
        
        // Welcome message
        const welcomeText = this.add.text(0, -120, 'WELCOME TO AVRA', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        welcomePanel.add(welcomeText);
        
        const welcomeDesc = this.add.text(0, -80, 'A text-command RPG where you collect and manipulate Aura', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#CCCCFF',
            align: 'center'
        }).setOrigin(0.5);
        welcomePanel.add(welcomeDesc);
        
        // Name input label
        const nameLabel = this.add.text(0, -30, 'Enter your name:', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        welcomePanel.add(nameLabel);
        
        // Name input background
        const inputBg = this.add.rectangle(0, 10, 300, 50, 0x1A1A4A)
            .setStrokeStyle(2, 0x8080FF);
        welcomePanel.add(inputBg);
        
        // Create HTML input element for name entry
        this.nameInput = this.add.dom(0, 10).createFromHTML(`<input type="text" id="playerNameInput" value="${this.player ? this.player.name : ''}" placeholder="Enter your name" style="width:280px;height:40px;font-size:18px;background:rgba(26,26,74,0.8);color:white;border:none;padding:0 10px;border-radius:5px;">`);
        welcomePanel.add(this.nameInput);
        
        // Start button
        const startButton = this.add.rectangle(0, 80, 250, 50, 0x4F4FFF)
            .setStrokeStyle(3, 0x8080FF)
            .setInteractive();
        welcomePanel.add(startButton);
        
        const startButtonText = this.add.text(0, 80, 'BEGIN JOURNEY', {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        welcomePanel.add(startButtonText);
        
        // Settings button
        const settingsButton = this.add.rectangle(200, 80, 120, 40, 0x6464FF)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
        welcomePanel.add(settingsButton);
        
        const settingsButtonText = this.add.text(200, 80, 'SETTINGS', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        welcomePanel.add(settingsButtonText);
        
        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x6464FF);
            this.tweens.add({
                targets: startButtonText,
                scale: 1.1,
                duration: 100
            });
        });
        
        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x4F4FFF);
            this.tweens.add({
                targets: startButtonText,
                scale: 1,
                duration: 100
            });
        });
        
        settingsButton.on('pointerover', () => {
            settingsButton.setFillStyle(0x8080FF);
        });
        
        settingsButton.on('pointerout', () => {
            settingsButton.setFillStyle(0x6464FF);
        });
        
        // Button click handlers
        startButton.on('pointerdown', () => {
            this.startGame();
        });
        
        settingsButton.on('pointerdown', () => {
            this.showSettings();
        });
        
        // Add version number
        this.add.text(780, 580, 'v0.1', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#6666AA'
        }).setOrigin(1);
    }

    startGame() {
        // Play click sound
        this.sound.play('command_success');
        
        // Get player name from input
        const nameInput = document.getElementById('playerNameInput');
        let playerName = 'AuraSeeker';
        
        if (nameInput && nameInput.value.trim() !== '') {
            playerName = nameInput.value.trim();
        }
        
        // Create click effect
        this.createButtonClickEffect(400, 330);
        
        // Update player name if it changed
        if (this.player) {
            this.player.name = playerName;
            this.player.save();
        }
        
        // Transition to the game scene
        this.scene.start('GameScene', { player: this.player });
    }

    createButtonClickEffect(x, y) {
        // Create particle effect on button click
        const particles = this.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 20,
            blendMode: 'ADD'
        });
        
        // Set particle color
        emitter.setTint(0x8080FF);
        
        // Stop emitting after burst
        this.time.delayedCall(100, () => {
            emitter.stop();
        });
        
        // Destroy particles after animation completes
        this.time.delayedCall(600, () => {
            particles.destroy();
        });
    }

    showSettings() {
        // Create settings panel
        const panel = this.add.container(400, 300);
        
        // Panel background
        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.8)
            .setStrokeStyle(2, 0x8080FF);
        panel.add(bg);
        
        // Panel title
        const title = this.add.text(0, -170, 'SETTINGS', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(title);
        
        // Music volume
        const musicText = this.add.text(-200, -100, 'Music Volume:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        });
        panel.add(musicText);
        
        // Music slider background
        const musicSliderBg = this.add.rectangle(50, -100, 300, 20, 0x222244)
            .setOrigin(0, 0.5);
        panel.add(musicSliderBg);
        
        // Music slider handle
        const musicSlider = this.add.rectangle(
            50 + (300 * this.game.globals.settings.musicVolume),
            -100,
            30,
            30,
            0x4F4FFF
        ).setInteractive({ draggable: true });
        panel.add(musicSlider);
        
        // Sound volume
        const soundText = this.add.text(-200, -40, 'Sound Volume:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        });
        panel.add(soundText);
        
        // Sound slider background
        const soundSliderBg = this.add.rectangle(50, -40, 300, 20, 0x222244)
            .setOrigin(0, 0.5);
        panel.add(soundSliderBg);
        
        // Sound slider handle
        const soundSlider = this.add.rectangle(
            50 + (300 * this.game.globals.settings.soundVolume),
            -40,
            30,
            30,
            0x4F4FFF
        ).setInteractive({ draggable: true });
        panel.add(soundSlider);
        
        // Particle effects toggle
        const particleText = this.add.text(-200, 20, 'Particle Effects:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        });
        panel.add(particleText);
        
        // Toggle button
        const toggleState = this.game.globals.settings.particleEffects;
        const toggleButton = this.add.rectangle(50, 20, 80, 40, toggleState ? 0x44AA44 : 0x444444)
            .setStrokeStyle(2, 0xAAAAAA)
            .setInteractive();
        panel.add(toggleButton);
        
        const toggleCircle = this.add.circle(
            toggleState ? 50 + 25 : 50 - 25,
            20,
            15,
            0xFFFFFF
        );
        panel.add(toggleCircle);
        
        // Toggle button handler
        toggleButton.on('pointerdown', () => {
            this.game.globals.settings.particleEffects = !this.game.globals.settings.particleEffects;
            toggleButton.setFillStyle(this.game.globals.settings.particleEffects ? 0x44AA44 : 0x444444);
            
            // Move toggle circle
            this.tweens.add({
                targets: toggleCircle,
                x: this.game.globals.settings.particleEffects ? 50 + 25 : 50 - 25,
                duration: 100
            });
        });
        
        // Reset button
        const resetButton = this.add.rectangle(0, 80, 200, 40, 0xAA4444)
            .setStrokeStyle(2, 0xFF8888)
            .setInteractive();
        panel.add(resetButton);
        
        const resetText = this.add.text(0, 80, 'RESET SETTINGS', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(resetText);
        
        // Reset button handler
        resetButton.on('pointerdown', () => {
            // Reset to defaults
            this.game.globals.settings.musicVolume = 0.5;
            this.game.globals.settings.soundVolume = 0.7;
            this.game.globals.settings.particleEffects = true;
            
            // Update UI
            musicSlider.x = 50 + (300 * 0.5);
            soundSlider.x = 50 + (300 * 0.7);
            toggleButton.setFillStyle(0x44AA44);
            toggleCircle.x = 50 + 25;
            
            // Update actual volumes
            this.sound.volume = 0.7;
            this.updateMusicVolume(0.5);
        });
        
        // Close button
        const closeButton = this.add.rectangle(220, -170, 80, 40, 0xFF4444)
            .setStrokeStyle(2, 0xFF8888)
            .setInteractive();
        panel.add(closeButton);
        
        const closeText = this.add.text(220, -170, 'CLOSE', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(closeText);
        
        closeButton.on('pointerdown', () => {
            panel.destroy();
            
            // Save settings
            this.saveSettings();
        });
        
        closeButton.on('pointerover', () => {
            closeButton.setFillStyle(0xFF8888);
        });
        
        closeButton.on('pointerout', () => {
            closeButton.setFillStyle(0xFF4444);
        });
        
        // Slider drag handlers
        musicSlider.on('drag', (pointer, dragX) => {
            // Keep slider within bounds
            const x = Phaser.Math.Clamp(dragX, 50, 350);
            musicSlider.x = x;
            
            // Calculate and set volume (0-1)
            const volume = (x - 50) / 300;
            this.game.globals.settings.musicVolume = volume;
            
            // Update actual music volume
            this.updateMusicVolume(volume);
        });
        
        soundSlider.on('drag', (pointer, dragX) => {
            // Keep slider within bounds
            const x = Phaser.Math.Clamp(dragX, 50, 350);
            soundSlider.x = x;
            
            // Calculate and set volume (0-1)
            const volume = (x - 50) / 300;
            this.game.globals.settings.soundVolume = volume;
            
            // Update actual sound volume
            this.sound.volume = volume;
        });
    }
    
    updateMusicVolume(volume) {
        // Update volume for any playing music
        this.sound.getAll('menu_music').forEach(music => {
            music.volume = volume;
        });
    }
    
    saveSettings() {
        // Save settings to local storage
        localStorage.setItem('avra_settings', JSON.stringify(this.game.globals.settings));
    }
}

export default MainMenuScene;