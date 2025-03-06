// src/main.js

import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';
import ShopScene from './scenes/ShopScene';
import MinigameScene from './scenes/MinigameScene';
import DuelScene from './scenes/DuelScene';
import QuestScene from './scenes/QuestScene';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000',
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene,
        ShopScene,
        MinigameScene,
        DuelScene,
        QuestScene
    ],
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game state (for sharing data between scenes)
game.globals = {
    settings: {
        musicVolume: 0.5,
        soundVolume: 0.7,
        particleEffects: true
    },
    // Can add more global properties as needed
};

// Export the game instance
export default game;