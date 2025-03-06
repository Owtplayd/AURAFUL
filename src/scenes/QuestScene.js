// src/scenes/QuestScene.js

import Phaser from 'phaser';

class QuestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuestScene' });
        
        this.player = null;
        this.quest = null;
        this.currentStep = null;
        this.questProgress = 0;
        this.choices = [];
        this.auraReward = 0;
        this.itemReward = null;
    }
    
    init(data) {
        this.player = data.player;
        this.quest = data.quest;
        this.questProgress = 0;
        this.auraReward = this.quest.reward;
    }
    
    preload() {
        // Load assets
        this.load.image('quest_background', 'assets/images/ui/quest_background.png');
        this.load.image('choice_button', 'assets/images/ui/choice_button.png');
        
        // Load quest-specific assets if needed
        this.loadQuestAssets();
    }
    
    loadQuestAssets() {
        // Load assets specific to the current quest
        switch (this.quest.id) {
            case 'q1': // Crystal Caverns
                this.load.image('crystal_cavern', 'assets/images/quests/crystal_cavern.png');
                break;
            case 'q2': // Shadow Realm
                this.load.image('shadow_realm', 'assets/images/quests/shadow_realm.png');
                break;
            case 'q3': // Aura Temple
                this.load.image('aura_temple', 'assets/images/quests/aura_temple.png');
                break;
        }
    }
    
    create() {
        // Create background
        this.add.image(400, 300, 'quest_background');
        
        // Create UI elements
        this.createUI();
        
        // Start the quest
        this.startQuest();
    }
    
    createUI() {
        // Quest title
        this.titleText = this.add.text(400, 50, this.quest.name, {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Quest description
        this.descriptionText = this.add.text(400, 100, this.quest.description, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#CCCCCC',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);
        
        // Quest narrative text
        this.narrativeText = this.add.text(400, 200, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5, 0);
        
        // Create choice buttons (hidden initially)
        this.choiceButtons = [];
        
        for (let i = 0; i < 3; i++) {
            const button = this.add.rectangle(400, 400 + i * 60, 600, 50, 0x4F4FFF)
                .setStrokeStyle(2, 0x8080FF)
                .setInteractive()
                .setVisible(false);
                
            const text = this.add.text(400, 400 + i * 60, '', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#FFFFFF'
            }).setOrigin(0.5)
              .setVisible(false);
            
            // Store button and text as a pair
            this.choiceButtons.push({ button, text });
            
            // Add click handler
            button.on('pointerdown', () => {
                this.makeChoice(i);
            });
            
            // Add hover effects
            button.on('pointerover', () => {
                button.setFillStyle(0x8080FF);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(0x4F4FFF);
            });
        }
        
        // Exit button
        this.exitButton = this.add.rectangle(750, 50, 100, 40, 0x6464FF)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
            
        this.exitText = this.add.text(750, 50, 'EXIT', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.exitButton.on('pointerdown', () => {
            this.exitQuest();
        });
        
        this.exitButton.on('pointerover', () => {
            this.exitButton.setFillStyle(0x8080FF);
        });
        
        this.exitButton.on('pointerout', () => {
            this.exitButton.setFillStyle(0x6464FF);
        });
    }
    
    startQuest() {
        // Get quest steps based on quest ID
        this.questSteps = this.getQuestSteps(this.quest.id);
        
        // Start with the first step
        this.showQuestStep(0);
    }
    
    showQuestStep(stepIndex) {
        // Check if we've completed the quest
        if (stepIndex >= this.questSteps.length) {
            this.completeQuest();
            return;
        }
        
        // Update current step
        this.currentStep = this.questSteps[stepIndex];
        this.questProgress = stepIndex;
        
        // Update narrative text
        this.narrativeText.setText(this.currentStep.narrative);
        
        // Update and show choices
        this.updateChoices(this.currentStep.choices);
    }
    
    updateChoices(choices) {
        // Hide all choice buttons first
        this.choiceButtons.forEach(({ button, text }) => {
            button.setVisible(false);
            text.setVisible(false);
        });
        
        // Show and update available choices
        choices.forEach((choice, index) => {
            if (index < this.choiceButtons.length) {
                const { button, text } = this.choiceButtons[index];
                
                text.setText(choice.text);
                
                button.setVisible(true);
                text.setVisible(true);
            }
        });
    }
    
    makeChoice(choiceIndex) {
        // Get the selected choice
        const choice = this.currentStep.choices[choiceIndex];
        
        // Apply any rewards/penalties
        if (choice.auraReward) {
            this.auraReward += choice.auraReward;
        }
        
        if (choice.itemReward) {
            this.itemReward = choice.itemReward;
        }
        
        // Get the next step based on choice
        const nextStepIndex = choice.nextStep !== undefined ? choice.nextStep : this.questProgress + 1;
        
        // Move to the next step
        this.showQuestStep(nextStepIndex);
    }
    
    completeQuest() {
        // Update narrative to show completion
        this.narrativeText.setText('You have completed the quest!');
        
        // Hide choice buttons
        this.choiceButtons.forEach(({ button, text }) => {
            button.setVisible(false);
            text.setVisible(false);
        });
        
        // Show rewards
        let rewardText = `Rewards:\n+${this.auraReward} Aura`;
        if (this.itemReward) {
            rewardText += `\n${this.itemReward.name}`;
        }
        
        const rewardsDisplay = this.add.text(400, 400, rewardText, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFFF00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add continue button
        const continueButton = this.add.rectangle(400, 500, 300, 50, 0x6464FF)
            .setStrokeStyle(2, 0x8080FF)
            .setInteractive();
            
        const continueText = this.add.text(400, 500, 'CONTINUE', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        continueButton.on('pointerdown', () => {
            this.claimRewards();
        });
        
        continueButton.on('pointerover', () => {
            continueButton.setFillStyle(0x8080FF);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setFillStyle(0x6464FF);
        });
    }
    
    claimRewards() {
        // Add Aura to player
        this.player.aura += this.auraReward;
        
        // Add item if there is one
        if (this.itemReward) {
            this.player.addItem(this.itemReward);
        }
        
        // Update quest completion stats
        this.player.questsCompleted = (this.player.questsCompleted || 0) + 1;
        
        // Save player data
        this.player.save();
        
        // Return to game scene
        this.scene.start('GameScene', { player: this.player });
    }
    
    exitQuest() {
        // Confirm exit
        const confirmContainer = this.add.container(400, 300);
        
        // Background
        const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8)
            .setStrokeStyle(2, 0x8080FF);
        confirmContainer.add(bg);
        
        // Text
        const text = this.add.text(0, -50, 'Exit quest? Your progress will be lost.', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        confirmContainer.add(text);
        
        // Yes button
        const yesButton = this.add.rectangle(-100, 50, 150, 50, 0xFF4444)
            .setStrokeStyle(2, 0xFF8888)
            .setInteractive();
        confirmContainer.add(yesButton);
        
        const yesText = this.add.text(-100, 50, 'YES', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        confirmContainer.add(yesText);
        
        yesButton.on('pointerdown', () => {
            this.scene.start('GameScene', { player: this.player });
        });
        
        // No button
        const noButton = this.add.rectangle(100, 50, 150, 50, 0x44FF44)
            .setStrokeStyle(2, 0x88FF88)
            .setInteractive();
        confirmContainer.add(noButton);
        
        const noText = this.add.text(100, 50, 'NO', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        confirmContainer.add(noText);
        
        noButton.on('pointerdown', () => {
            confirmContainer.destroy();
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
    }
    
    getQuestSteps(questId) {
        // Return quest steps based on quest ID
        // This would typically come from a database or JSON file
        
        switch (questId) {
            case 'q1': // Crystal Caverns
                return this.getCrystalCavernsQuest();
            case 'q2': // Shadow Realm
                return this.getShadowRealmQuest();
            case 'q3': // Aura Temple
                return this.getAuraTempleQuest();
            default:
                return [];
        }
    }
    
    getCrystalCavernsQuest() {
        return [
            {
                narrative: "You stand at the entrance of the legendary Crystal Caverns. Legends say that deep within, rare Aura crystals grow in abundance, but few return from its depths. The cave mouth glimmers with faint blue light, beckoning you inward.",
                choices: [
                    { text: "Enter cautiously, staying alert for danger", nextStep: 1 },
                    { text: "Use a torch to light your way clearly", nextStep: 2 },
                    { text: "Meditate before entering to sense the Aura flows", nextStep: 3 }
                ]
            },
            {
                narrative: "Moving cautiously through the dim passages, your eyes adjust to see crystalline formations along the walls. A fork in the path appears: one direction shows signs of recent travel, while the other is untouched but emits a stronger Aura glow.",
                choices: [
                    { text: "Follow the path with footprints", nextStep: 4 },
                    { text: "Take the untouched path with stronger Aura", nextStep: 5 }
                ]
            },
            {
                narrative: "Your torch illuminates the cavern brilliantly, revealing stunning crystal formations. However, the light seems to disturb something - you hear skittering sounds from the shadows. The path ahead splits into a narrow crevice or a wider tunnel.",
                choices: [
                    { text: "Squeeze through the narrow crevice", nextStep: 6 },
                    { text: "Take the wider tunnel, moving quickly", nextStep: 7 },
                    { text: "Extinguish your torch and proceed in darkness", nextStep: 1 }
                ]
            },
            {
                narrative: "Your meditation connects you to the cavern's energy. You sense Aura flowing like underwater rivers through the stone. With this awareness, you notice a hidden path beneath an ordinary-looking rock formation.",
                choices: [
                    { text: "Follow the hidden path guided by Aura", nextStep: 8 },
                    { text: "Stick to the main passage but use your enhanced awareness", nextStep: 9 }
                ]
            },
            {
                narrative: "Following the footprints leads you to a small mining operation abandoned in haste. Tools lie scattered, and a cart is half-filled with crystal fragments. A journal nearby mentions 'guardians' awakening.",
                choices: [
                    { text: "Collect the crystal fragments from the cart", nextStep: 10, auraReward: 100 },
                    { text: "Look for clues about what happened to the miners", nextStep: 11 },
                    { text: "Continue deeper, following fresh footprints", nextStep: 12 }
                ]
            },
            {
                narrative: "The untouched path grows increasingly radiant as you proceed. The Aura concentration is palpable. You emerge into a vast chamber where giant crystal clusters grow from floor to ceiling, pulsing with power.",
                choices: [
                    { text: "Carefully harvest some smaller crystals", nextStep: 13, auraReward: 200 },
                    { text: "Approach the largest crystal formation", nextStep: 14 },
                    { text: "Sit and meditate to absorb ambient Aura", nextStep: 15, auraReward: 150 }
                ]
            },
            // More steps would follow...
            {
                narrative: "After your adventure in the Crystal Caverns, you emerge with newfound knowledge of Aura crystallization and a collection of valuable crystal fragments. The experience has enhanced your understanding of Aura manipulation.",
                choices: [
                    { text: "Complete the quest", nextStep: 99 }
                ]
            }
        ];
    }
    
    getShadowRealmQuest() {
        // Shadow Realm quest narrative
        return [
            {
                narrative: "You stand before a tear in reality - a dark, swirling portal to the Shadow Realm. The air around it feels heavy and charged with negative Aura. Entering will be dangerous, but the potential for growth is immense.",
                choices: [
                    { text: "Step confidently into the portal", nextStep: 1 },
                    { text: "Create a protective Aura shield before entering", nextStep: 2 },
                    { text: "Toss something into the portal first to test it", nextStep: 3 }
                ]
            },
            // Additional steps would go here
            {
                narrative: "You've survived the challenges of the Shadow Realm and absorbed significant dark Aura. While initially disorienting, you've learned to balance this new energy with your existing Aura. Your control has grown substantially.",
                choices: [
                    { text: "Complete the quest", nextStep: 99 }
                ]
            }
        ];
    }
    
    getAuraTempleQuest() {
        // Aura Temple quest narrative
        return [
            {
                narrative: "The ancient Aura Temple stands before you, its white marble columns glowing with inner light. Temple guardians bow slightly as you approach, recognizing a seeker of knowledge. 'What brings you to the sacred halls?' one asks.",
                choices: [
                    { text: "I seek to understand the fundamental nature of Aura", nextStep: 1 },
                    { text: "I wish to increase my Aura capacity", nextStep: 2 },
                    { text: "I've come to learn techniques for manipulating Aura", nextStep: 3 }
                ]
            },
            // Additional steps would go here
            {
                narrative: "Your time at the Aura Temple has been enlightening. The masters have shared ancient techniques that few outsiders have learned. As you prepare to leave, you feel your Aura flowing more naturally than ever before.",
                choices: [
                    { text: "Complete the quest", nextStep: 99 }
                ]
            }
        ];
    }
}

export default QuestScene;