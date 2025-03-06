// src/scenes/PreloadScene.js

import Phaser from 'phaser';
import Player from '../classes/Player';

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();
        
        // Load all game assets
        this.loadAssets();
    }

    createLoadingBar() {
        // Display logo
        this.add.image(400, 200, 'logo').setScale(0.8);
        
        // Loading text
        const loadingText = this.add.text(400, 300, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Create loading bar
        const loadingBg = this.add.image(400, 350, 'loading_bg');
        const loadingBar = this.add.image(400, 350, 'loading_bar');
        
        // Set up loading bar crop
        const loadingBarWidth = loadingBar.displayWidth;
        
        loadingBar.setCrop(0, 0, 0, loadingBar.height);
        
        // Loading progress callback
        this.load.on('progress', (value) => {
            loadingBar.setCrop(0, 0, loadingBarWidth * value, loadingBar.height);
            loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
        });
        
        // Loading complete callback
        this.load.on('complete', () => {
            loadingText.setText('Loading Complete!');
            
            // Add animation for completion
            this.tweens.add({
                targets: [loadingBg, loadingBar, loadingText],
                alpha: 0,
                duration: 1000,
                delay: 500
            });
        });
    }

    loadAssets() {
        // Load UI assets
        this.loadUIAssets();
        
        // Load character assets
        this.loadCharacterAssets();
        
        // Load item assets
        this.loadItemAssets();
        
        // Load effect assets
        this.loadEffectAssets();
        
        // Load audio assets
        this.loadAudioAssets();
        
        // Load fonts
        this.loadFonts();
    }

    loadUIAssets() {
        // Main UI elements
        this.load.image('background', 'assets/images/ui/background.png');
        this.load.image('textbox', 'assets/images/ui/textbox.png');
        this.load.image('button', 'assets/images/ui/button.png');
        this.load.image('aura_meter', 'assets/images/ui/aura_meter.png');
        this.load.image('menu_frame', 'assets/images/ui/menu_frame.png');
        this.load.image('inventory_slot', 'assets/images/ui/inventory_slot.png');
        this.load.image('shop_background', 'assets/images/ui/shop_background.png');
        this.load.image('quest_background', 'assets/images/ui/quest_background.png');
        this.load.image('minigame_background', 'assets/images/ui/minigame_background.png');
        this.load.image('duel_background', 'assets/images/ui/duel_background.png');
    }

    loadCharacterAssets() {
        // Avatar images
        this.load.image('avatar_default', 'assets/images/avatars/default.png');
        this.load.image('avatar_rare', 'assets/images/avatars/rare.png');
        this.load.image('avatar_epic', 'assets/images/avatars/epic.png');
        this.load.image('avatar_legendary', 'assets/images/avatars/legendary.png');
    }

    loadItemAssets() {
        // Load item icons
        // Defensive items
        this.load.image('aura_shield', 'assets/images/items/aura_shield.png');
        this.load.image('stealth_cloak', 'assets/images/items/stealth_cloak.png');
        this.load.image('mirror_ward', 'assets/images/items/mirror_ward.png');
        this.load.image('temporal_anchor', 'assets/images/items/temporal_anchor.png');
        
        // Offensive items
        this.load.image('aura_magnet', 'assets/images/items/aura_magnet.png');
        this.load.image('shadow_mask', 'assets/images/items/shadow_mask.png');
        this.load.image('precision_lens', 'assets/images/items/precision_lens.png');
        this.load.image('void_extractor', 'assets/images/items/void_extractor.png');
        
        // Utility items
        this.load.image('aura_catalyst', 'assets/images/items/aura_catalyst.png');
        this.load.image('lootbox_detector', 'assets/images/items/lootbox_detector.png');
        this.load.image('time_crystal', 'assets/images/items/time_crystal.png');
        this.load.image('mystic_orb', 'assets/images/items/mystic_orb.png');
        
        // Legendary items
        this.load.image('aura_crown', 'assets/images/items/aura_crown.png');
        this.load.image('void_siphon', 'assets/images/items/void_siphon.png');
        
        // Lootboxes
        this.load.image('lootbox_common', 'assets/images/items/lootbox_common.png');
        this.load.image('lootbox_rare', 'assets/images/items/lootbox_rare.png');
        this.load.image('lootbox_epic', 'assets/images/items/lootbox_epic.png');
    }

    loadEffectAssets() {
        // Particle effects
        this.load.image('particle', 'assets/images/effects/particle.png');
        this.load.image('aura_particle', 'assets/images/effects/aura_particle.png');
        
        // Effect animations
        this.load.spritesheet('effect_daily_bonus', 'assets/images/effects/daily_bonus.png', { 
            frameWidth: 128, frameHeight: 128 
        });
        this.load.spritesheet('effect_level_up', 'assets/images/effects/level_up.png', { 
            frameWidth: 256, frameHeight: 256 
        });
        this.load.spritesheet('effect_lootbox_open', 'assets/images/effects/lootbox_open.png', { 
            frameWidth: 128, frameHeight: 128 
        });
    }

    loadAudioAssets() {
        // Sound effects
        this.load.audio('command_success', 'assets/audio/command_success.mp3');
        this.load.audio('command_error', 'assets/audio/command_error.mp3');
        this.load.audio('aura_gain', 'assets/audio/aura_gain.mp3');
        this.load.audio('aura_loss', 'assets/audio/aura_loss.mp3');
        this.load.audio('lootbox_spawn', 'assets/audio/lootbox_spawn.mp3');
        this.load.audio('lootbox_open', 'assets/audio/lootbox_open.mp3');
        this.load.audio('level_up', 'assets/audio/level_up.mp3');
        this.load.audio('item_use', 'assets/audio/item_use.mp3');
        this.load.audio('combo_success', 'assets/audio/combo_success.mp3');
        
        // Background music
        this.load.audio('menu_music', 'assets/audio/menu_music.mp3');
        this.load.audio('game_music', 'assets/audio/game_music.mp3');
        this.load.audio('shop_music', 'assets/audio/shop_music.mp3');
        this.load.audio('quest_music', 'assets/audio/quest_music.mp3');
    }

    loadFonts() {
        // Load custom fonts (if any)
        // Note: Fonts are typically loaded via CSS, not in Phaser
    }

    create() {
        // Create animations
        this.createAnimations();
        
        // Initialize the player (or load existing player)
        this.initializePlayer();
        
        // Start the main menu scene
        this.scene.start('MainMenuScene', { player: this.player });
    }

    createAnimations() {
        // Create animations for effects
        this.anims.create({
            key: 'anim_daily_bonus',
            frames: this.anims.generateFrameNumbers('effect_daily_bonus', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'anim_level_up',
            frames: this.anims.generateFrameNumbers('effect_level_up', { start: 0, end: 15 }),
            frameRate: 15,
            repeat: 0
        });
        
        this.anims.create({
            key: 'anim_lootbox_open',
            frames: this.anims.generateFrameNumbers('effect_lootbox_open', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
    }

    initializePlayer() {
        // Check for existing player data in local storage
        let playerId = localStorage.getItem('avra_player_id');
        
        if (playerId) {
            // Try to load existing player
            this.player = Player.load(playerId);
            
            if (!this.player) {
                // Create new player if load failed
                this.player = new Player();
                localStorage.setItem('avra_player_id', this.player.id);
            }
        } else {
            // Create new player
            this.player = new Player();
            localStorage.setItem('avra_player_id', this.player.id);
        }
    }
}

export default PreloadScene;