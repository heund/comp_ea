/**
 * Global Data Popup Manager - Singleton Pattern
 * 
 * Prevents multiple data overlays from showing simultaneously across all artworks.
 * Centralizes data popup control and ensures clean transitions between artworks.
 */

class GlobalDataPopupManager {
    constructor() {
        if (GlobalDataPopupManager.instance) {
            return GlobalDataPopupManager.instance;
        }
        
        // Registry to track all data popup instances
        this.activePopups = new Map();
        this.currentActivePopup = null;
        this.dataCyclingIntervals = new Map();
        
        GlobalDataPopupManager.instance = this;
        
        console.log('Global Data Popup Manager initialized');
    }
    
    /**
     * Register a data popup with the manager
     * @param {string} id - Unique identifier for the popup (e.g., 'artwork1', 'artwork2')
     * @param {Object} popupController - Object with popup control methods
     */
    registerPopup(id, popupController) {
        // Check if already registered and clean up first
        if (this.activePopups.has(id)) {
            console.warn(`Popup ${id} already registered, cleaning up previous registration`);
            this.unregisterPopup(id);
        }
        
        this.activePopups.set(id, {
            controller: popupController,
            isVisible: false,
            cyclingInterval: null
        });
        
        console.log(`Data popup registered: ${id} (Total: ${this.activePopups.size})`);
    }
    
    /**
     * Unregister a data popup
     * @param {string} id - Popup identifier to remove
     */
    unregisterPopup(id) {
        if (this.activePopups.has(id)) {
            // Stop any cycling for this popup
            this.stopDataCycling(id);
            this.activePopups.delete(id);
            console.log(`Data popup unregistered: ${id} (Remaining: ${this.activePopups.size})`);
        }
    }
    
    /**
     * Hide all data popups except the specified one
     * @param {string} exceptId - ID to exclude from hiding (optional)
     */
    hideAllPopups(exceptId = null) {
        console.log('Hiding all data popups...', exceptId ? `except ${exceptId}` : '');
        
        // First, force hide the shared DOM element to prevent glitches
        this.hideAllPopupsDirect();
        
        this.activePopups.forEach((popupData, id) => {
            if (id !== exceptId && popupData.isVisible) {
                try {
                    // Stop data cycling for this popup
                    this.stopDataCycling(id);
                    
                    // Update internal state without DOM manipulation to avoid conflicts
                    popupData.isVisible = false;
                    console.log(`Hidden data popup: ${id}`);
                } catch (error) {
                    console.warn(`Error hiding popup ${id}:`, error);
                }
            }
        });
        
        // Update current active popup
        this.currentActivePopup = exceptId;
    }
    
    /**
     * Show data popup for a specific artwork, hiding all others first
     * @param {string} id - Popup identifier
     */
    showPopup(id) {
        // Hide all other popups first
        this.hideAllPopups(id);
        
        // Show the requested popup
        if (this.activePopups.has(id)) {
            const popupData = this.activePopups.get(id);
            
            try {
                if (popupData.controller && typeof popupData.controller.showDataOverlay === 'function') {
                    popupData.controller.showDataOverlay();
                } else {
                    // Fallback to direct DOM manipulation
                    this.showPopupDirect(id);
                }
                
                popupData.isVisible = true;
                this.currentActivePopup = id;
                console.log(`Showing data popup: ${id}`);
            } catch (error) {
                console.error(`Error showing popup ${id}:`, error);
            }
        } else {
            console.warn(`Data popup ${id} not found in registry`);
        }
    }
    
    /**
     * Hide data popup for a specific artwork
     * @param {string} id - Popup identifier
     */
    hidePopup(id) {
        if (this.activePopups.has(id)) {
            const popupData = this.activePopups.get(id);
            
            try {
                // Stop data cycling
                this.stopDataCycling(id);
                
                if (popupData.controller && typeof popupData.controller.hideDataOverlay === 'function') {
                    popupData.controller.hideDataOverlay();
                } else {
                    // Fallback to direct DOM manipulation
                    this.hidePopupDirect(id);
                }
                
                popupData.isVisible = false;
                
                if (this.currentActivePopup === id) {
                    this.currentActivePopup = null;
                }
                
                console.log(`Hidden data popup: ${id}`);
            } catch (error) {
                console.warn(`Error hiding popup ${id}:`, error);
            }
        }
    }
    
    /**
     * Toggle data popup for a specific artwork
     * @param {string} id - Popup identifier
     */
    togglePopup(id) {
        if (this.activePopups.has(id)) {
            const popupData = this.activePopups.get(id);
            
            if (popupData.isVisible) {
                this.hidePopup(id);
            } else {
                this.showPopup(id);
            }
        }
    }
    
    /**
     * Cycle to next dataset for a specific popup
     * @param {string} id - Popup identifier
     */
    cycleDataset(id) {
        if (this.activePopups.has(id)) {
            const popupData = this.activePopups.get(id);
            
            if (popupData.isVisible && popupData.controller && typeof popupData.controller.cycleToNextDataset === 'function') {
                try {
                    popupData.controller.cycleToNextDataset();
                    console.log(`Cycled dataset for popup: ${id}`);
                } catch (error) {
                    console.warn(`Error cycling dataset for ${id}:`, error);
                }
            }
        }
    }
    
    /**
     * Start data cycling for a specific popup
     * @param {string} id - Popup identifier
     * @param {number} interval - Cycling interval in milliseconds (default: 3000)
     */
    startDataCycling(id, interval = 3000) {
        if (this.activePopups.has(id)) {
            // Stop existing cycling first
            this.stopDataCycling(id);
            
            const popupData = this.activePopups.get(id);
            
            if (popupData.controller && typeof popupData.controller.startDataCycling === 'function') {
                try {
                    popupData.controller.startDataCycling();
                    console.log(`Started data cycling for popup: ${id}`);
                } catch (error) {
                    console.warn(`Error starting data cycling for ${id}:`, error);
                }
            }
        }
    }
    
    /**
     * Stop data cycling for a specific popup
     * @param {string} id - Popup identifier
     */
    stopDataCycling(id) {
        if (this.activePopups.has(id)) {
            const popupData = this.activePopups.get(id);
            
            if (popupData.controller && typeof popupData.controller.stopDataCycling === 'function') {
                try {
                    popupData.controller.stopDataCycling();
                    console.log(`Stopped data cycling for popup: ${id}`);
                } catch (error) {
                    console.warn(`Error stopping data cycling for ${id}:`, error);
                }
            }
        }
    }
    
    /**
     * Direct DOM manipulation to show popup (fallback)
     * @param {string} id - Popup identifier
     */
    showPopupDirect(id) {
        // Hide all other popups first
        this.hideAllPopupsDirect();
        
        const overlay = document.getElementById('dataOverlay');
        if (overlay) {
            overlay.classList.add('active');
            // Store which artwork is currently using the overlay
            overlay.setAttribute('data-current-artwork', id);
            console.log(`Direct show for popup: ${id}`);
        }
    }
    
    /**
     * Direct DOM manipulation to hide popup (fallback)
     * @param {string} id - Popup identifier
     */
    hidePopupDirect(id) {
        const overlay = document.getElementById('dataOverlay');
        if (overlay) {
            // Only hide if this artwork is currently using the overlay
            const currentArtwork = overlay.getAttribute('data-current-artwork');
            if (currentArtwork === id || !currentArtwork) {
                overlay.classList.remove('active');
                overlay.removeAttribute('data-current-artwork');
                console.log(`Direct hide for popup: ${id}`);
            }
        }
    }
    
    /**
     * Hide all popups using direct DOM manipulation
     */
    hideAllPopupsDirect() {
        const overlay = document.getElementById('dataOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.removeAttribute('data-current-artwork');
        }
    }
    
    /**
     * Get current active popup ID
     * @returns {string|null} - Current active popup ID or null
     */
    getCurrentActivePopup() {
        return this.currentActivePopup;
    }
    
    /**
     * Check if a specific popup is visible
     * @param {string} id - Popup identifier
     * @returns {boolean} - True if popup is visible
     */
    isPopupVisible(id) {
        if (this.activePopups.has(id)) {
            return this.activePopups.get(id).isVisible;
        }
        return false;
    }
    
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!GlobalDataPopupManager.instance) {
            new GlobalDataPopupManager();
        }
        return GlobalDataPopupManager.instance;
    }
    
    /**
     * Clean up all popup instances
     */
    cleanup() {
        console.log('Cleaning up Global Data Popup Manager...');
        
        // Stop all data cycling
        this.activePopups.forEach((popupData, id) => {
            this.stopDataCycling(id);
        });
        
        // Hide all popups
        this.hideAllPopups();
        
        // Clear registry
        this.activePopups.clear();
        this.currentActivePopup = null;
        
        console.log('Global Data Popup Manager cleanup complete');
    }
}

// Create global instance
window.globalDataPopupManager = new GlobalDataPopupManager();

// Also expose the class for manual instantiation if needed
window.GlobalDataPopupManager = GlobalDataPopupManager;

console.log('Global Data Popup Manager script loaded');
