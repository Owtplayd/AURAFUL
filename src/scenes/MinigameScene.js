// src/scenes/MinigameScene.js

import Phaser from 'phaser';

class MinigameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MinigameScene' });
        
        this.player = null;
        this.minigameId = null;
        this.gameActive = false;
        this.timeLeft = 0;
        this.score = 0;
        this.requiredScore = 0;
        this.timerText = null;
        this.scoreText = null;
        this.gameElements = [];
    }
    
    init(data) {
        this.player = data.player;
        this.minigameId = data.minigameId;
        this.score = 0;
        this.gameActive = false;
    }
    
    preload() {
        // All assets should already be loaded in the PreloadScene
    }
    
    create() {
        // Create background
        this.add.image(400, 300, 'minigame_background');
        
        // Create UI elements
        this.createHeader();
        this.createGameArea();
        this.createControls();
        
        // Start specific minigame based on ID
        this.initializeMinigame();
    }
    
    update(time, delta) {
        if (this.gameActive) {
            // Update game timer
            this.updateTimer(delta);
            
            // Update game-specific logic
            this.updateMinigame(delta);
        }
    }
    
    createHeader() {
        // Title based on minigame
        let title = 'MINIGAME';
        switch (this.minigameId) {
            case 'wordscramble':
                title = 'WORD UNSCRAMBLE';
                break;
            case 'commandchain':
                title = 'COMMAND CHAIN';
                break;
            case 'aurapuzzle':
                title = 'AURA PUZZLE';
                break;
            case 'reaction':
                title = 'REACTION TEST';
                break;
        }
        
        this.add.text(400, 30, title, {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Timer display
        this.timerText = this.add.text(700, 30, '00:00', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(1, 0.5);
        
        // Score display
        this.scoreText = this.add.text(100, 30, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0, 0.5);
    }
    
    createGameArea() {
        // Game area background
        this.gameArea = this.add.rectangle(400, 300, 700, 380, 0x10103A, 0.7)
            .setStrokeStyle(2, 0x8080FF);
    }
    
    createControls() {
        // Back button
        const backButton = this.add.rectangle(80, 560, 100, 40, 0x6464FF)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
        
        const backText = this.add.text(80, 560, 'BACK', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x8080FF);
        });
        
        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x6464FF);
        });
        
        backButton.on('pointerdown', () => {
            this.exitMinigame();
        });
        
        // Start button
        this.startButton = this.add.rectangle(400, 560, 200, 40, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        
        this.startText = this.add.text(400, 560, 'START GAME', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x88FF88);
        });
        
        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x44AA44);
        });
        
        this.startButton.on('pointerdown', () => {
            this.startGame();
        });
    }
    
    initializeMinigame() {
        // Set up minigame-specific elements
        switch (this.minigameId) {
            case 'wordscramble':
                this.initWordScramble();
                break;
            case 'commandchain':
                this.initCommandChain();
                break;
            case 'aurapuzzle':
                this.initAuraPuzzle();
                break;
            case 'reaction':
                this.initReactionTest();
                break;
            default:
                // Fallback to word scramble
                this.minigameId = 'wordscramble';
                this.initWordScramble();
        }
    }
    
    startGame() {
        // Reset game state
        this.score = 0;
        this.updateScoreDisplay();
        
        // Set game as active
        this.gameActive = true;
        
        // Hide start button
        this.startButton.setVisible(false);
        this.startText.setVisible(false);
        
        // Start timer
        this.timeLeft = this.getGameDuration();
        this.updateTimerDisplay();
        
        // Start minigame-specific logic
        switch (this.minigameId) {
            case 'wordscramble':
                this.startWordScramble();
                break;
            case 'commandchain':
                this.startCommandChain();
                break;
            case 'aurapuzzle':
                this.startAuraPuzzle();
                break;
            case 'reaction':
                this.startReactionTest();
                break;
        }
    }
    
    getGameDuration() {
        // Return game duration in milliseconds
        switch (this.minigameId) {
            case 'wordscramble':
                return 60 * 1000; // 60 seconds
            case 'commandchain':
                return 90 * 1000; // 90 seconds
            case 'aurapuzzle':
                return 120 * 1000; // 2 minutes
            case 'reaction':
                return 30 * 1000; // 30 seconds
            default:
                return 60 * 1000; // Default 1 minute
        }
    }
    
    updateTimer(delta) {
        // Decrease time left
        this.timeLeft -= delta;
        
        // Update timer display
        this.updateTimerDisplay();
        
        // Check if time is up
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    updateTimerDisplay() {
        // Format time as MM:SS
        const seconds = Math.max(0, Math.floor(this.timeLeft / 1000));
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`);
        
        // Change color when time is low
        if (seconds <= 10) {
            this.timerText.setColor('#FF4444');
        } else {
            this.timerText.setColor('#FFFFFF');
        }
    }
    
    updateScoreDisplay() {
        this.scoreText.setText(`Score: ${this.score}`);
    }
    
    endGame() {
        // Stop the game
        this.gameActive = false;
        
        // Calculate reward based on score and game type
        const reward = this.calculateReward();
        
        // Show game over message with score and reward
        this.showGameOverPanel(reward);
    }
    
    calculateReward() {
        // Base reward ranges for each minigame
        const rewardRanges = {
            'wordscramble': { min: 100, max: 300 },
            'commandchain': { min: 150, max: 450 },
            'aurapuzzle': { min: 200, max: 600 },
            'reaction': { min: 50, max: 150 }
        };
        
        const range = rewardRanges[this.minigameId];
        
        // Calculate percentage of max score achieved
        const percentage = Math.min(1, this.score / this.requiredScore);
        
        // Calculate reward based on percentage of max score
        const baseReward = Math.floor(range.min + percentage * (range.max - range.min));
        
        // Apply any active boosters
        let finalReward = baseReward;
        if (this.player.hasActiveItem && this.player.hasActiveItem('Aura Catalyst')) {
            finalReward = Math.floor(finalReward * 1.25);
        }
        
        return finalReward;
    }
    
    showGameOverPanel(reward) {
        // Create game over panel
        const panel = this.add.container(400, 300);
        
        // Background
        const bg = this.add.rectangle(0, 0, 500, 300, 0x000000, 0.8)
            .setStrokeStyle(2, 0x8080FF);
        panel.add(bg);
        
        // Title
        const title = this.add.text(0, -120, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(title);
        
        // Results
        const scoreText = this.add.text(0, -60, `Final Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(scoreText);
        
        // Reward text
        const rewardText = this.add.text(0, 0, `Reward: ${reward} Aura`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFFF00'
        }).setOrigin(0.5);
        panel.add(rewardText);
        
        // Add reward to player
        this.player.aura += reward;
        this.player.save();
        
        // Continue button
        const continueButton = this.add.rectangle(0, 80, 200, 50, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        panel.add(continueButton);
        
        const continueText = this.add.text(0, 80, 'CONTINUE', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add(continueText);
        
        continueButton.on('pointerover', () => {
            continueButton.setFillStyle(0x88FF88);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setFillStyle(0x44AA44);
        });
        
        continueButton.on('pointerdown', () => {
            // Return to game scene
            this.scene.start('GameScene', { player: this.player });
        });
    }
    
    exitMinigame() {
        // Confirm if game is active
        if (this.gameActive) {
            // Create confirmation dialog
            const panel = this.add.container(400, 300);
            
            // Background
            const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8)
                .setStrokeStyle(2, 0x8080FF);
            panel.add(bg);
            
            // Text
            const text = this.add.text(0, -50, 'Exit minigame?\nYour progress will be lost.', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#FFFFFF',
                align: 'center'
            }).setOrigin(0.5);
            panel.add(text);
            
            // Yes button
            const yesButton = this.add.rectangle(-100, 50, 150, 50, 0xFF4444)
                .setStrokeStyle(2, 0xFF8888)
                .setInteractive();
            panel.add(yesButton);
            
            const yesText = this.add.text(-100, 50, 'YES', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            panel.add(yesText);
            
            yesButton.on('pointerdown', () => {
                this.scene.start('GameScene', { player: this.player });
            });
            
            // No button
            const noButton = this.add.rectangle(100, 50, 150, 50, 0x44FF44)
                .setStrokeStyle(2, 0x88FF88)
                .setInteractive();
            panel.add(noButton);
            
            const noText = this.add.text(100, 50, 'NO', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            panel.add(noText);
            
            noButton.on('pointerdown', () => {
                panel.destroy();
            });
            
            // Add hover effects
            yesButton.on('pointerover', () => {
                yesButton.setFillStyle(0xFF8888);
            });
            
            yesButton.on('pointerout', () => {
                yesButton.setFillStyle(0xFF4444);
            });
            
            noButton.on('pointerover', () => {
                noButton.setFillStyle(0x88FF88);
            });
            
            noButton.on('pointerout', () => {
                noButton.setFillStyle(0x44FF44);
            });
        } else {
            // Just exit if no game is active
            this.scene.start('GameScene', { player: this.player });
        }
    }
    
    clearGameElements() {
        // Remove all game-specific elements
        this.gameElements.forEach(element => {
            if (element) element.destroy();
        });
        this.gameElements = [];
    }
    
    // Minigame-specific implementations
    // Word Scramble
    initWordScramble() {
        // Instructions text
        const instructions = this.add.text(400, 140, 'Unscramble the Aura-related words as quickly as possible!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Input field for answers
        this.answerInput = this.add.dom(400, 400).createFromHTML('<input type="text" id="answerInput" placeholder="Type answer here..." style="width:300px;height:40px;font-size:18px;background:rgba(26,26,74,0.8);color:white;border:none;padding:0 10px;border-radius:5px;">');
        this.answerInput.addListener('keydown');
        
        // Set required score
        this.requiredScore = 10; // 10 words to reach max score
        
        // Hide input until game starts
        this.answerInput.setVisible(false);
    }
    
    startWordScramble() {
        // Show input
        this.answerInput.setVisible(true);
        
        // Set up words list
        this.wordList = [
            'aura', 'energy', 'crystal', 'power', 'mystic',
            'ethereal', 'spiritual', 'cosmic', 'magical', 'essence',
            'catalyst', 'emanation', 'luminous', 'radiance', 'shimmer',
            'vibration', 'resonance', 'frequency', 'quantum', 'astral'
        ];
        
        // Shuffle word list
        this.wordList = Phaser.Utils.Array.Shuffle(this.wordList);
        
        // Display first word
        this.currentWordIndex = 0;
        this.displayNextWord();
        
        // Listen for answers
        this.answerInput.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkWordAnswer(event.target.value);
                event.target.value = '';
            }
        });
    }
    
    displayNextWord() {
        if (this.currentWordIndex >= this.wordList.length) {
            // End game if we run out of words
            this.endGame();
            return;
        }
        
        // Get current word
        const word = this.wordList[this.currentWordIndex];
        
        // Scramble the word
        this.currentWord = word;
        const scrambled = this.scrambleWord(word);
        
        // Clear old word display if it exists
        if (this.wordText) {
            this.wordText.destroy();
        }
        
        // Display scrambled word
        this.wordText = this.add.text(400, 300, scrambled, {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFFF00'
        }).setOrigin(0.5);
        
        this.gameElements.push(this.wordText);
    }
    
    scrambleWord(word) {
        // Convert to array, shuffle, and join back to string
        return word.split('').sort(() => 0.5 - Math.random()).join('');
    }
    
    checkWordAnswer(answer) {
        if (!this.gameActive) return;
        
        // Compare answer to current word
        if (answer.toLowerCase() === this.currentWord.toLowerCase()) {
            // Correct answer
            this.score++;
            this.updateScoreDisplay();
            
            // Show success feedback
            this.showFeedback('Correct!', 0x44FF44);
            
            // Move to next word
            this.currentWordIndex++;
            this.displayNextWord();
        } else {
            // Wrong answer
            this.showFeedback('Try again!', 0xFF4444);
        }
    }
    
    // Command Chain minigame (placeholder implementation)
    initCommandChain() {
        // Instructions
        const instructions = this.add.text(400, 140, 'Memorize and repeat the command sequences!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Set required score
        this.requiredScore = 5; // 5 sequences to reach max score
    }
    
    startCommandChain() {
        // Implement command chain game logic here
        this.showFeedback('Command Chain game not fully implemented yet!', 0xFFFF00);
        
        // For demo purposes, end game after delay
        this.time.delayedCall(5000, () => {
            this.score = 2; // Demo score
            this.endGame();
        });
    }
    
    // Aura Puzzle minigame (placeholder implementation)
    initAuraPuzzle() {
        // Instructions
        const instructions = this.add.text(400, 140, 'Solve the Aura-related riddles!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Set required score
        this.requiredScore = 5; // 5 puzzles to reach max score
    }
    
    startAuraPuzzle() {
        // Implement aura puzzle game logic here
        this.showFeedback('Aura Puzzle game not fully implemented yet!', 0xFFFF00);
        
        // For demo purposes, end game after delay
        this.time.delayedCall(5000, () => {
            this.score = 3; // Demo score
            this.endGame();
        });
    }
    
    // Reaction Test minigame (placeholder implementation)
    initReactionTest() {
        // Instructions
        const instructions = this.add.text(400, 140, 'Type the commands as soon as they appear!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Set required score
        this.requiredScore = 15; // 15 reactions to reach max score
    }
    
    startReactionTest() {
        // Implement reaction test game logic here
        this.showFeedback('Reaction Test game not fully implemented yet!', 0xFFFF00);
        
        // For demo purposes, end game after delay
        this.time.delayedCall(5000, () => {
            this.score = 7; // Demo score
            this.endGame();
        });
    }
    
    updateMinigame(delta) {
        // Update minigame-specific logic
        switch (this.minigameId) {
            case 'wordscramble':
                // Word scramble updates handled by event listeners
                break;
            case 'commandchain':
                // Command chain updates would go here
                break;
            case 'aurapuzzle':
                // Aura puzzle updates would go here
                break;
            case 'reaction':
                // Reaction test updates would go here
                break;
        }
    }
    
    showFeedback(message, color) {
        // Create feedback text
        const feedbackText = this.add.text(400, 220, message, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: color ? `#${color.toString(16)}` : '#FFFFFF'
        }).setOrigin(0.5);
        
        // Animate and destroy
        this.tweens.add({
            targets: feedbackText,
            y: 200,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                feedbackText.destroy();
            }
        });
    }
}

export default MinigameScene;