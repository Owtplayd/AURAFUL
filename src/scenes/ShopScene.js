// src/scenes/ShopScene.js

import Phaser from 'phaser';
import { items, getItemsByType } from '../data/items';
import Item from '../classes/Item';

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
        
        this.player = null;
        this.currentCategory = 'defensive';
        this.itemsContainer = null;
        this.categoryButtons = [];
        this.itemButtons = [];
        this.detailsPanel = null;
        this.selectedItem = null;
    }
    
    init(data) {
        this.player = data.player;
    }
    
    preload() {
        // All assets should already be loaded in the PreloadScene
    }
    
    create() {
        // Create background
        this.add.image(400, 300, 'shop_background');
        
        // Create UI elements
        this.createHeader();
        this.createCategories();
        this.createItemsGrid();
        this.createDetailsPanel();
        this.createBackButton();
        
        // Display initial category
        this.showCategory(this.currentCategory);
        
        // Play shop music
        this.sound.play('shop_music', {
            loop: true,
            volume: this.game.globals.settings.musicVolume
        });
    }
    
    createHeader() {
        // Shop title
        this.add.text(400, 30, 'AURA SHOP', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Player aura display
        const auraText = this.add.text(700, 30, `${this.player.aura.toLocaleString()} AURA`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#8080FF'
        }).setOrigin(1, 0.5);
        
        // Add glow effect to player's aura amount
        this.tweens.add({
            targets: auraText,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    createCategories() {
        const categories = [
            { id: 'defensive', name: 'DEFENSIVE' },
            { id: 'offensive', name: 'OFFENSIVE' },
            { id: 'utility', name: 'UTILITY' },
            { id: 'legendary', name: 'LEGENDARY' }
        ];
        
        const startX = 150;
        const spacing = 130;
        
        categories.forEach((category, index) => {
            const x = startX + (index * spacing);
            
            // Category background
            const button = this.add.rectangle(x, 80, 120, 40, 0x4F4FFF)
                .setStrokeStyle(2, 0x8080FF)
                .setInteractive();
            
            // Category text
            const text = this.add.text(x, 80, category.name, {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            
            // Button states and interactions
            button.on('pointerover', () => {
                if (this.currentCategory !== category.id) {
                    button.setFillStyle(0x6464FF);
                }
            });
            
            button.on('pointerout', () => {
                if (this.currentCategory !== category.id) {
                    button.setFillStyle(0x4F4FFF);
                }
            });
            
            button.on('pointerdown', () => {
                this.sound.play('command_success');
                this.showCategory(category.id);
            });
            
            // Store reference to category button
            this.categoryButtons.push({ id: category.id, button, text });
        });
    }
    
    createItemsGrid() {
        // Create a container for the items grid
        this.itemsContainer = this.add.container(400, 250);
        
        // Background panel
        const bg = this.add.rectangle(0, 0, 700, 300, 0x10103A, 0.7)
            .setStrokeStyle(2, 0x8080FF);
        this.itemsContainer.add(bg);
    }
    
    createDetailsPanel() {
        // Create details panel (hidden initially)
        this.detailsPanel = this.add.container(600, 420);
        this.detailsPanel.visible = false;
        
        // Background
        const bg = this.add.rectangle(0, 0, 250, 180, 0x10103A, 0.9)
            .setStrokeStyle(2, 0x8080FF);
        this.detailsPanel.add(bg);
        
        // Item name
        this.itemNameText = this.add.text(0, -70, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.detailsPanel.add(this.itemNameText);
        
        // Item description
        this.itemDescText = this.add.text(0, -20, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#CCCCCC',
            align: 'center',
            wordWrap: { width: 230 }
        }).setOrigin(0.5, 0);
        this.detailsPanel.add(this.itemDescText);
        
        // Buy button
        this.buyButton = this.add.rectangle(0, 60, 160, 40, 0x44AA44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        this.detailsPanel.add(this.buyButton);
        
        this.buyText = this.add.text(0, 60, 'BUY: 500 AURA', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.detailsPanel.add(this.buyText);
        
        // Buy button interactions
        this.buyButton.on('pointerover', () => {
            this.buyButton.setFillStyle(0x88FF88);
        });
        
        this.buyButton.on('pointerout', () => {
            this.buyButton.setFillStyle(0x44AA44);
        });
        
        this.buyButton.on('pointerdown', () => {
            this.buyItem();
        });
    }
    
    createBackButton() {
        // Back button
        const backButton = this.add.rectangle(80, 30, 100, 40, 0x6464FF)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
        
        const backText = this.add.text(80, 30, 'BACK', {
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
            this.sound.stopAll();
            this.scene.start('GameScene', { player: this.player });
        });
    }
    
    showCategory(categoryId) {
        // Update current category
        this.currentCategory = categoryId;
        
        // Update category button states
        this.categoryButtons.forEach(cat => {
            if (cat.id === categoryId) {
                cat.button.setFillStyle(0x8080FF);
            } else {
                cat.button.setFillStyle(0x4F4FFF);
            }
        });
        
        // Clear existing items
        this.clearItems();
        
        // Get items for this category
        const categoryItems = getItemsByType(categoryId);
        
        // Display items in a grid
        this.displayItems(categoryItems);
        
        // Hide details panel when changing categories
        this.detailsPanel.visible = false;
    }
    
    clearItems() {
        // Remove existing item buttons
        this.itemButtons.forEach(item => {
            if (item.button) item.button.destroy();
            if (item.icon) item.icon.destroy();
            if (item.name) item.name.destroy();
            if (item.price) item.price.destroy();
        });
        
        this.itemButtons = [];
    }
    
    displayItems(items) {
        const columns = 4;
        const rows = Math.ceil(items.length / columns);
        const buttonWidth = 150;
        const buttonHeight = 120;
        const padding = 20;
        
        // Calculate grid dimensions
        const gridWidth = columns * (buttonWidth + padding) - padding;
        const gridHeight = rows * (buttonHeight + padding) - padding;
        
        // Center the grid
        const startX = -gridWidth / 2 + buttonWidth / 2;
        const startY = -gridHeight / 2 + buttonHeight / 2;
        
        // Create item buttons
        items.forEach((item, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            const x = startX + col * (buttonWidth + padding);
            const y = startY + row * (buttonHeight + padding);
            
            // Item button background
            const itemBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x1A1A4A)
                .setStrokeStyle(1, this.getRarityColor(item.rarity))
                .setInteractive();
            
            // Item interactions
            itemBg.on('pointerover', () => {
                itemBg.setFillStyle(0x2A2A5A);
            });
            
            itemBg.on('pointerout', () => {
                itemBg.setFillStyle(0x1A1A4A);
            });
            
            itemBg.on('pointerdown', () => {
                this.showItemDetails(item);
            });
            
            // Item icon (placeholder if image not available)
            let itemIcon;
            try {
                itemIcon = this.add.image(x, y - 20, item.id);
            } catch (e) {
                // Create a color square as placeholder
                itemIcon = this.add.rectangle(x, y - 20, 40, 40, this.getRarityColor(item.rarity));
            }
            
            // Item name
            const itemName = this.add.text(x, y + 25, item.name, {
                fontFamily: 'Arial',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#FFFFFF',
                align: 'center'
            }).setOrigin(0.5);
            
            // Item price
            const itemPrice = this.add.text(x, y + 45, `${item.price} Aura`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#8080FF'
            }).setOrigin(0.5);
            
            // Add to item buttons array
            this.itemButtons.push({
                item: item,
                button: itemBg,
                icon: itemIcon,
                name: itemName,
                price: itemPrice
            });
            
            // Add to container
            this.itemsContainer.add(itemBg);
            this.itemsContainer.add(itemIcon);
            this.itemsContainer.add(itemName);
            this.itemsContainer.add(itemPrice);
        });
    }
    
    showItemDetails(item) {
        // Set selected item
        this.selectedItem = item;
        
        // Update details panel
        this.itemNameText.setText(item.name);
        this.itemDescText.setText(item.description);
        this.buyText.setText(`BUY: ${item.price} AURA`);
        
        // Update button color based on if player can afford it
        this.updateBuyButtonState();
        
        // Show the panel
        this.detailsPanel.visible = true;
    }
    
    updateBuyButtonState() {
        if (!this.selectedItem) return;
        
        // Check if player can afford the item
        const canAfford = this.player.aura >= this.selectedItem.price;
        
        // Update button color
        if (canAfford) {
            this.buyButton.setFillStyle(0x44AA44);
            this.buyButton.setStrokeStyle(2, 0x88FF88);
        } else {
            this.buyButton.setFillStyle(0x666666);
            this.buyButton.setStrokeStyle(2, 0xAAAAAA);
        }
    }
    
    buyItem() {
        if (!this.selectedItem) return;
        
        // Check if player has enough Aura
        if (this.player.aura < this.selectedItem.price) {
            // Show not enough Aura message
            this.showMessage('Not enough Aura!', 0xFF4444);
            this.sound.play('command_error');
            return;
        }
        
        // Deduct Aura
        this.player.aura -= this.selectedItem.price;
        
        // Add item to inventory
        const newItem = new Item(this.selectedItem);
        this.player.addItem(newItem);
        
        // Save player data
        this.player.save();
        
        // Show success message
        this.showMessage(`Purchased ${this.selectedItem.name}!`, 0x44FF44);
        this.sound.play('command_success');
        
        // Update buy button state
        this.updateBuyButtonState();
    }
    
    showMessage(text, color) {
        // Create message
        const message = this.add.text(400, 500, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: color ? `#${color.toString(16)}` : '#FFFFFF'
        }).setOrigin(0.5);
        
        // Animate and destroy
        this.tweens.add({
            targets: message,
            y: 470,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                message.destroy();
            }
        });
    }
    
    getRarityColor(rarity) {
        // Return color based on item rarity
        switch (rarity) {
            case 'common':
                return 0x888888;
            case 'uncommon':
                return 0x00AA00;
            case 'rare':
                return 0x0088FF;
            case 'epic':
                return 0xAA00FF;
            case 'legendary':
                return 0xFFAA00;
            default:
                return 0xFFFFFF;
        }
    }
}

export default ShopScene;