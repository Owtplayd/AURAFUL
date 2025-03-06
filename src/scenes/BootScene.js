// src/scenes/BootScene.js

import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load minimal assets needed for the loading screen
        this.load.image('logo', 'assets/images/ui/avra_logo.png');
        this.load.image('loading_bar', 'assets/images/ui/loading_bar.png');
        this.load.image('loading_bg', 'assets/images/ui/loading_bg.png');
    }

    create() {
        // Set up any game configurations
        this.configureGame();
        
        // Transition to the preload scene
        this.scene.start('PreloadScene');
    }
    
    configureGame() {
        // Configure game settings
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        // Enable physics
        this.physics.world.setBounds(0, 0, 800, 600);
        
        // Configure input
        this.input.mouse.disableContextMenu();
        
        // Set up any global game events
        this.events.on('shutdown', this.shutdown, this);
        
        // Initialize custom event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Create a custom event emitter if needed
        if (!window.gameEvents) {
            window.gameEvents = new Phaser.Events.EventEmitter();
        }
    }
    
    shutdown() {
        // Clean up any resources
        this.events.off('shutdown');
    }
}

export default BootScene;