// src/utils/eventManager.js

/**
 * A simple event manager to handle game-wide events
 * This provides a central place for components to subscribe to game events
 */
class EventManager {
    constructor() {
        this.events = {};
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Function to call when event occurs
     * @param {object} context - Context for the callback
     * @returns {object} - Subscription object that can be used to unsubscribe
     */
    subscribe(event, callback, context) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        const subscription = { callback, context };
        this.events[event].push(subscription);
        
        return {
            unsubscribe: () => this.unsubscribe(event, callback, context)
        };
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Original callback function
     * @param {object} context - Original context
     */
    unsubscribe(event, callback, context) {
        if (!this.events[event]) return;
        
        this.events[event] = this.events[event].filter(
            subscription => subscription.callback !== callback || subscription.context !== context
        );
        
        if (this.events[event].length === 0) {
            delete this.events[event];
        }
    }
    
    /**
     * Publish an event to all subscribers
     * @param {string} event - Event name
     * @param {any} data - Data to pass to subscribers
     */
    publish(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(subscription => {
            subscription.callback.call(subscription.context, data);
        });
    }
    
    /**
     * Clear all subscriptions for an event
     * @param {string} event - Event name (optional - if not provided, clears all events)
     */
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}

// Create a singleton instance
const eventManager = new EventManager();

// Export the instance
export default eventManager;