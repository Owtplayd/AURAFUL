// src/scenes/MainMenuScene.js

import Phaser from 'phaser';

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.player = null;
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
        
        // Create menu buttons
        this.createButtons();
        
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
        const logo = this.add.image(400, 150, 'logo').setScale(1.2);
        
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
        this.add.text(400, 240, 'Master Your Aura, Rule the Realm', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#CCCCFF',
            align: 'center'
        }).setOrigin(0.5);
    }

    createButtons() {
        // Button styles
        const buttonWidth = 300;
        const buttonHeight = 60;
        const buttonSpacing = 80;
        const startY = 320;
        
        // Create main menu buttons
        const buttons = [
            { text: 'ENTER GAME', scene: 'GameScene' },
            { text: 'CHARACTER', callback: this.showCharacter.bind(this) },
            { text: 'SETTINGS', callback: this.showSettings.bind(this) }
        ];
        
        buttons.forEach((button, index) => {
            const y = startY + (index * buttonSpacing);
            
            // Button background
            const buttonBg = this.add.rectangle(400, y, buttonWidth, buttonHeight, 0x4F4FFF)
                .setStrokeStyle(3, 0x8080FF)
                .setInteractive();
            
            // Button text
            const buttonText = this.add.text(400, y, button.text, {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            
            // Button hover effect
            buttonBg.on('pointerover', () => {
                buttonBg.setFillStyle(0x6464FF);
                this.tweens.add({
                    targets: buttonText,
                    scale: 1.1,
                    duration: 100
                });
            });
            
            buttonBg.on('pointerout', () => {
                buttonBg.setFillStyle(0x4F4FFF);
                this.tweens.add({
                    targets: buttonText,
                    scale: 1,
                    duration: 100
                });
            });
            
            // Button click handler
            buttonBg.on('pointerdown', () => {
                // Play click sound
                this.sound.play('command_success');
                
                // Add click effect
                this.createButtonClickEffect(400, y);
                
                // Handle click based on button type
                if (button.scene) {
                    // Transition to the specified scene
                    this.scene.start(button.scene, { player: this.player });
                } else if (button.callback) {
                    // Call the callback function
                    button.callback();
                }
            });
        });
        
        // Add version number
        this.add.text(780, 580, 'v0.1', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#6666AA'
        }).setOrigin(1);
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

    showCharacter() {
        // Create character preview panel
        const panel = this.add.container(400, 300);
        
        // Panel background
        const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8)
            .setStrokeStyle(2, 0x8080FF);
        panel.add(bg);
        
        // Panel title
        const title = this.add.text(0, -170, 'CHARACTER PROFILE', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(title);
        
        // Character info
        const infoText = [
            `Name: ${this.player.name}`,
            `Aura Level: ${this.player.auraLevel}`,
            `Rank: ${this.player.rank}`,
            `Aura: ${this.player.aura.toLocaleString()}`,
            `Daily Streak: ${this.player.dailyStreak || 0} days`,
            `Quests Completed: ${this.player.questsCompleted || 0}`,
            `Duels Won: ${this.player.duelsWon || 0} / Lost: ${this.player.duelsLost || 0}`,
            `Successful Thefts: ${this.player.theftsSuccessful || 0}`
        ].join('\n\n');
        
        const info = this.add.text(-250, -100, infoText, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#FFFFFF',
            lineSpacing: 10
        });
        panel.add(info);
        
        // Avatar
        const avatarBg = this.add.circle(150, 0, 100, 0x10103A)
            .setStrokeStyle(2, 0x8080FF);
        panel.add(avatarBg);
        
        // Aura effect around avatar
        const auraEffect = this.add.circle(150, 0, 110, 0xFFFFFF, 0.3);
        panel.add(auraEffect);
        
        // Pulse animation for aura effect
        this.tweens.add({
            targets: auraEffect,
            radius: 120,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Close button
        const closeButton = this.add.rectangle(250, -170, 80, 40, 0xFF4444)
            .setStrokeStyle(2, 0xFF8888)
            .setInteractive();
        panel.add(closeButton);
        
        const closeText = this.add.text(250, -170, 'CLOSE', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(closeText);
        
        closeButton.on('pointerdown', () => {
            panel.destroy();
        });
        
        closeButton.on('pointerover', () => {
            closeButton.setFillStyle(0xFF8888);
        });
        
        closeButton.on('pointerout', () => {
            closeButton.setFillStyle(0xFF4444);
        });
        
        // Set up edit name button
        const editButton = this.add.rectangle(150, 120, 160, 40, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        panel.add(editButton);
        
        const editText = this.add.text(150, 120, 'CHANGE NAME', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(editText);
        
        editButton.on('pointerdown', () => {
            this.promptChangeName(panel);
        });
        
        editButton.on('pointerover', () => {
            editButton.setFillStyle(0x88FF88);
        });
        
        editButton.on('pointerout', () => {
            editButton.setFillStyle(0x44AA44);
        });
    }

    promptChangeName(parentPanel) {
        // Create name change prompt
        const promptPanel = this.add.container(0, 0);
        parentPanel.add(promptPanel);
        
        // Panel background
        const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.9)
            .setStrokeStyle(2, 0x8080FF);
        promptPanel.add(bg);
        
        // Panel title
        const title = this.add.text(0, -70, 'CHANGE NAME', {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        promptPanel.add(title);
        
        // Create HTML input element for name entry
        const nameInput = this.add.dom(0, 0).createFromHTML('<input type="text" id="nameInput" placeholder="Enter new name" value="' + this.player.name + '" style="width:300px;height:40px;font-size:18px;padding:5px;">');
        promptPanel.add(nameInput);
        
        // Confirm button
        const confirmButton = this.add.rectangle(-80, 70, 120, 40, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        promptPanel.add(confirmButton);
        
        const confirmText = this.add.text(-80, 70, 'CONFIRM', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        promptPanel.add(confirmText);
        
        // Cancel button
        const cancelButton = this.add.rectangle(80, 70, 120, 40, 0xFF4444)
            .setStrokeStyle(2, 0xFF8888)
            .setInteractive();
        promptPanel.add(cancelButton);
        
        const cancelText = this.add.text(80, 70, 'CANCEL', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        promptPanel.add(cancelText);
        
        // Button handlers
        confirmButton.on('pointerdown', () => {
            const newName = document.getElementById('nameInput').value.trim();
            
            if (newName && newName.length > 0) {
                this.player.name = newName;
                this.player.save();
                
                // Update the character info panel
                parentPanel.destroy();
                this.showCharacter();
            }
        });
        
        cancelButton.on('pointerdown', () => {
            promptPanel.destroy();
        });
        
        // Hover effects
        confirmButton.on('pointerover', () => {
            confirmButton.setFillStyle(0x88FF88);
        });
        
        confirmButton.on('pointerout', () => {
            confirmButton.setFillStyle(0x44AA44);
        });
        
        cancelButton.on('pointerover', () => {
            cancelButton.setFillStyle(0xFF8888);
        });
        
        cancelButton.on('pointerout', () => {
            cancelButton.setFillStyle(0xFF4444);
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