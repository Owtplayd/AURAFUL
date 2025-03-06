// src/utils/helpers.js

/**
 * A collection of helper functions for the AVRA game
 */

/**
 * Generate a random ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - A random string ID
 */
export function generateId(prefix = '') {
    return prefix + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
export function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format time duration from milliseconds
 * @param {number} ms - Time in milliseconds
 * @returns {string} - Formatted time string
 */
export function formatTime(ms) {
    if (ms <= 0) return '0s';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;
    
    return result.trim();
}

/**
 * Get a color based on rarity
 * @param {string} rarity - Item rarity (common, uncommon, rare, epic, legendary)
 * @returns {number} - Color as a hex number
 */
export function getRarityColor(rarity) {
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

/**
 * Get a color hex string based on rarity
 * @param {string} rarity - Item rarity
 * @returns {string} - Color as a hex string
 */
export function getRarityColorString(rarity) {
    const colorNum = getRarityColor(rarity);
    return `#${colorNum.toString(16).padStart(6, '0')}`;
}

/**
 * Create a tween to make an object pulse
 * @param {Phaser.Scene} scene - The scene
 * @param {object} target - The target object
 * @param {object} props - Properties to pulse (e.g. {alpha: 0.5})
 * @param {number} duration - Duration in milliseconds
 * @param {number} times - Number of pulses (default: -1 for infinite)
 * @returns {Phaser.Tweens.Tween} - The tween
 */
export function createPulseTween(scene, target, props, duration = 1000, times = -1) {
    return scene.tweens.add({
        targets: target,
        ...props,
        ease: 'Sine.easeInOut',
        duration: duration,
        yoyo: true,
        repeat: times
    });
}

/**
 * Wrap text to fit within a certain width
 * @param {string} text - The text to wrap
 * @param {number} maxChars - Maximum characters per line
 * @returns {string[]} - Array of lines
 */
export function wrapText(text, maxChars) {
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

/**
 * Create a floating text effect
 * @param {Phaser.Scene} scene - The scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} text - Text to display
 * @param {object} style - Text style
 * @param {number} duration - Duration in milliseconds
 * @param {number} rise - How far the text rises
 * @returns {Phaser.GameObjects.Text} - The text object
 */
export function createFloatingText(scene, x, y, text, style, duration = 2000, rise = 50) {
    const textObject = scene.add.text(x, y, text, style).setOrigin(0.5);
    
    scene.tweens.add({
        targets: textObject,
        y: y - rise,
        alpha: 0,
        duration: duration,
        onComplete: () => {
            textObject.destroy();
        }
    });
    
    return textObject;
}

/**
 * Shuffle an array
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
export function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Get a random item from an array
 * @param {Array} array - The array
 * @returns {any} - A random item
 */
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Lerp between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}