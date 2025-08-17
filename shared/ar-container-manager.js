/**
 * AR Container Manager
 * 
 * This class manages the AR container system, handling marker detection and
 * dynamically loading/unloading artwork modules as markers are found/lost.
 */

// Only define the class if it doesn't already exist
if (typeof window.ARContainerManager === 'undefined') {

class ARContainerManager {
    /**
     * Constructor for the ARContainerManager
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Default options
        this.options = Object.assign({
            visualizationContainer: '#visualization-container',
            arScene: 'a-scene',
            debugMode: false
        }, options);
        
        // Module registry
        this.moduleRegistry = {};
        
        // Currently active module
        this.activeModule = null;
        this.activeMarkerId = null;
        
        // Container element
        this.container = document.querySelector(this.options.visualizationContainer);
        
        // Debug mode
        this.debugMode = this.options.debugMode;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize the AR container manager
     */
    initialize() {
        console.log('Initializing AR Container Manager');
        
        // Ensure container exists
        if (!this.container) {
            console.error('Visualization container not found');
            return;
        }
        
        // Set up AR marker event listeners
        this.setupMarkerListeners();
        
        // Set up UI
        this.setupUI();
        
        // Log initialization complete
        console.log('AR Container Manager initialized');
    }
    
    /**
     * Register an artwork module
     * @param {String} markerId - The ID of the marker that triggers this module
     * @param {Class} moduleClass - The class of the module to instantiate
     * @param {Object} moduleOptions - Options to pass to the module constructor
     */
    registerModule(markerId, moduleClass, moduleOptions = {}) {
        if (!markerId || !moduleClass) {
            console.error('Invalid module registration parameters');
            return;
        }
        
        console.log(`Registering module for marker: ${markerId}`);
        
        this.moduleRegistry[markerId] = {
            class: moduleClass,
            options: moduleOptions,
            instance: null
        };
        
        if (this.debugMode) {
            console.log(`Module registry:`, this.moduleRegistry);
        }
    }
    
    /**
     * Set up AR marker event listeners
     */
    setupMarkerListeners() {
        // Get all markers in the scene
        const scene = document.querySelector(this.options.arScene);
        if (!scene) {
            console.error('AR scene not found');
            return;
        }
        
        // Wait for scene to load
        scene.addEventListener('loaded', () => {
            console.log('AR scene loaded, setting up marker listeners');
            
            // Find all markers
            const markers = document.querySelectorAll('a-marker, a-marker-camera');
            
            markers.forEach(marker => {
                const markerId = marker.id;
                
                if (!markerId) {
                    console.warn('Found marker without ID, skipping');
                    return;
                }
                
                console.log(`Setting up listeners for marker: ${markerId}`);
                
                // Marker found event
                marker.addEventListener('markerFound', () => {
                    console.log(`Marker found: ${markerId}`);
                    this.onMarkerFound(markerId);
                });
                
                // Marker lost event
                marker.addEventListener('markerLost', () => {
                    console.log(`Marker lost: ${markerId}`);
                    this.onMarkerLost(markerId);
                });
            });
        });
    }
    
    /**
     * Handle marker found event
     * @param {String} markerId - The ID of the found marker
     */
    onMarkerFound(markerId) {
        // Check if any animation is currently active and block marker detection
        if (this.isAnimationActive()) {
            console.log(`Marker detection blocked: Animation is active for ${this.activeMarkerId}`);
            return;
        }
        
        // Check if we have a module registered for this marker
        if (!this.moduleRegistry[markerId]) {
            console.warn(`No module registered for marker: ${markerId}`);
            return;
        }
        
        // If we already have an active module, deactivate it first
        if (this.activeModule && this.activeMarkerId !== markerId) {
            this.deactivateCurrentModule();
        }
        
        // Activate the module for this marker
        this.activateModule(markerId);
    }
    
    /**
     * Check if any animation is currently active
     * @returns {Boolean} - True if animation is active, false otherwise
     */
    isAnimationActive() {
        if (!this.activeModule) {
            return false;
        }
        
        // Check for various animation states across different artwork types
        const module = this.activeModule;
        
        // Check for thermal animation (artwork5)
        if (module.thermalAnimationActive) {
            return true;
        }
        
        // Check for wave animation (artwork3)
        if (module.waveAnimationId || module.animationFrame) {
            return true;
        }
        
        // Check for Three.js animation loops (artwork1, artwork2, artwork4)
        if (module.animationFrameId || module.threeJSAnimationId) {
            return true;
        }
        
        // Check for data overlay visibility (any artwork with active data popup)
        if (module.overlayVisible) {
            return true;
        }
        
        // Check for general active state
        if (module.isActive) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle marker lost event
     * @param {String} markerId - The ID of the lost marker
     */
    onMarkerLost(markerId) {
        // We no longer deactivate the module when marker is lost
        // The module will stay active until the user clicks the exit button
        console.log(`Marker lost: ${markerId}, but keeping module active`);
        // Only log the event, don't deactivate
    }
    
    /**
     * Activate a module for a marker
     * @param {String} markerId - The ID of the marker
     */
    activateModule(markerId) {
        // If this module is already active, do nothing
        if (this.activeMarkerId === markerId && this.activeModule) {
            return;
        }
        
        const moduleInfo = this.moduleRegistry[markerId];
        
        if (!moduleInfo) {
            console.error(`No module registered for marker: ${markerId}`);
            return;
        }
        
        console.log(`[AR-MANAGER] 🚀 Activating module for marker: ${markerId}`);
        
        // Deactivate current module when switching to a different marker
        if (this.activeModule && this.activeMarkerId !== markerId) {
            console.log(`[AR-MANAGER] 🔄 Switching modules: ${this.activeMarkerId} → ${markerId}`);
            this.deactivateCurrentModule();
        }
        
        // Create instance if it doesn't exist
        if (!moduleInfo.instance) {
            console.log(`[AR-MANAGER] 🏗️ Creating new instance for ${markerId}`);
            try {
                moduleInfo.instance = new moduleInfo.class(this.container, moduleInfo.options);
                console.log(`[AR-MANAGER] ✅ Instance created successfully for ${markerId}`);
            } catch (error) {
                console.error(`[AR-MANAGER] ❌ Error creating module instance for marker ${markerId}:`, error);
                return;
            }
        } else {
            console.log(`[AR-MANAGER] ♻️ Reusing existing instance for ${markerId}`);
        }
        
        // Activate the module
        console.log(`[AR-MANAGER] 🎬 Calling activate() on ${markerId} module`);
        try {
            moduleInfo.instance.activate();
            this.activeModule = moduleInfo.instance;
            this.activeMarkerId = markerId;
            console.log(`[AR-MANAGER] ✅ Module ${markerId} activated successfully`);
            
            // Show the AR controls
            console.log(`[AR-MANAGER] 🎛️ Showing AR controls`);
            this.showARControls();
            
            // Hide AR instructions
            console.log(`[AR-MANAGER] 📖 Hiding AR instructions`);
            this.hideARInstructions();
        } catch (error) {
            console.error(`[AR-MANAGER] ❌ Error activating module for marker ${markerId}:`, error);
        }
    }
    
    /**
     * Deactivate the currently active module
     */
    deactivateCurrentModule() {
        if (!this.activeModule) return;
        
        console.log(`[AR-MANAGER] 🛑 Deactivating current module: ${this.activeMarkerId}`);
        
        try {
            console.log(`[AR-MANAGER] 📞 Calling deactivate() on ${this.activeMarkerId} module`);
            this.activeModule.deactivate();
            console.log(`[AR-MANAGER] ✅ Module ${this.activeMarkerId} deactivated successfully`);
        } catch (error) {
            console.error(`[AR-MANAGER] ❌ Error deactivating module:`, error);
        }
        
        console.log(`[AR-MANAGER] 🔄 Clearing active module references`);
        this.activeModule = null;
        this.activeMarkerId = null;
        
        // Hide the AR controls
        console.log(`[AR-MANAGER] 🎛️ Hiding AR controls`);
        this.hideARControls();
        
        // Show AR instructions
        console.log(`[AR-MANAGER] 📖 Showing AR instructions`);
        this.showARInstructions();
        
        console.log(`[AR-MANAGER] ✅ Module deactivation complete`);
    }
    
    /**
     * Set up the UI elements
     */
    setupUI() {
        // Show AR instructions initially
        this.showARInstructions();
        
        // Hide AR controls initially
        this.hideARControls();
    }
    
    /**
     * Show the AR instructions
     */
    showARInstructions() {
        const instructions = document.querySelector('.ar-instructions');
        if (instructions) {
            instructions.classList.add('active');
        }
    }
    
    /**
     * Hide the AR instructions
     */
    hideARInstructions() {
        // Hide AR detection container
        const arDetection = document.getElementById('arDetection');
        if (arDetection) {
            arDetection.classList.add('hidden');
        }
        
        // Also hide any legacy instructions if they exist
        const instructions = document.querySelector('.ar-instructions');
        if (instructions) {
            instructions.classList.remove('active');
        }
    }
    
    /**
     * Show the AR controls and title
     */
    showARControls() {
        const controls = document.querySelector('.ar-controls-container');
        if (controls) {
            controls.classList.add('ar-active');
        }
        
        // Also show the title container
        const titleContainer = document.querySelector('.ar-title-container');
        if (titleContainer) {
            titleContainer.classList.add('ar-active');
        }
    }
    
    /**
     * Hide the AR controls and title
     */
    hideARControls() {
        const controls = document.querySelector('.ar-controls-container');
        if (controls) {
            controls.classList.remove('ar-active');
        }
        
        // Also hide the title container
        const titleContainer = document.querySelector('.ar-title-container');
        if (titleContainer) {
            titleContainer.classList.remove('ar-active');
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        console.log('Cleaning up AR Container Manager');
        
        // Deactivate current module if any
        this.deactivateCurrentModule();
        
        // Clean up all module instances
        Object.keys(this.moduleRegistry).forEach(markerId => {
            const moduleInfo = this.moduleRegistry[markerId];
            if (moduleInfo.instance) {
                try {
                    moduleInfo.instance.cleanup();
                } catch (error) {
                    console.error(`Error cleaning up module for marker ${markerId}:`, error);
                }
                moduleInfo.instance = null;
            }
        });
    }
}

// Register this class with the global scope
window.ARContainerManager = ARContainerManager;

} // End of if statement checking for existing class
