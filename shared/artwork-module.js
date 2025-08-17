/**
 * Base ArtworkModule Class
 * 
 * This class serves as the foundation for all artwork modules in the AR container system.
 * It provides common functionality and structure that all artwork modules will inherit.
 */

// Only define the class if it doesn't already exist
if (typeof window.ArtworkModule === 'undefined') {

class ArtworkModule {
    /**
     * Constructor for the ArtworkModule base class
     * @param {HTMLElement} container - The container element where the artwork will be rendered
     * @param {Object} options - Configuration options for the module
     */
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.isInitialized = false;
        this.isActive = false;
        this.title = options.title || 'Artwork Module';
        this.audioEnabled = false;
        this.audioContext = null;
        this.audioSource = null;
        this.audioAnalyser = null;
        this.audioElement = null;
        this.audioData = null;
    }

    /**
     * Initialize the artwork module
     * Called when the module is first loaded
     */
    initialize() {
        console.log(`[INIT] Starting initialization for ${this.title} module`);
        console.log(`[INIT] Container:`, this.container);
        console.log(`[INIT] Options:`, this.options);
        
        this.isInitialized = true;
        
        // Create audio context if audio file is provided
        if (this.options.audioFile) {
            console.log(`[INIT] Setting up audio: ${this.options.audioFile}`);
            this.setupAudio(this.options.audioFile);
        }
        
        console.log(`[INIT] ✅ ${this.title} module initialization complete`);
    }

    /**
     * Activate the artwork module
     * Called when the corresponding AR marker is detected
     */
    activate() {
        console.log(`[ACTIVATE] 🚀 Starting activation for ${this.title} module`);
        console.log(`[ACTIVATE] isInitialized: ${this.isInitialized}, isActive: ${this.isActive}`);
        
        if (!this.isInitialized) {
            console.log(`[ACTIVATE] Module not initialized, calling initialize() first`);
            this.initialize();
        }
        
        console.log(`[ACTIVATE] Setting module as active`);
        this.isActive = true;
        
        // Show visualization container
        const visualizationContainer = document.querySelector('.visualization-container');
        if (visualizationContainer) {
            console.log(`[ACTIVATE] Found visualization container, adding 'active' class`);
            visualizationContainer.classList.add('active');
            console.log(`[ACTIVATE] ✅ Visualization container activated`);
        } else {
            console.error(`[ACTIVATE] ❌ Visualization container not found`);
        }
        
        // Show controls
        const controlsContainer = document.querySelector('.ar-controls-container');
        if (controlsContainer) {
            console.log(`[ACTIVATE] Found AR controls container, adding 'ar-active' class`);
            controlsContainer.classList.add('ar-active');
        } else {
            console.log(`[ACTIVATE] ⚠️ AR controls container not found`);
        }
        
        // Play audio if enabled
        if (this.audioEnabled && this.audioElement) {
            console.log(`[ACTIVATE] Starting audio playback`);
            this.audioElement.play().catch(e => console.log('[ACTIVATE] Audio play error:', e));
        }
        
        console.log(`[ACTIVATE] ✅ ${this.title} module activation complete`);
    }

    /**
     * Deactivate the artwork module
     * Called when the corresponding AR marker is lost
     */
    deactivate() {
        console.log(`[DEACTIVATE] 🛑 Starting deactivation for ${this.title} module`);
        console.log(`[DEACTIVATE] Current state - isActive: ${this.isActive}`);
        
        this.isActive = false;
        console.log(`[DEACTIVATE] Set isActive to false`);
        
        // Hide visualization container
        const visualizationContainer = document.querySelector('.visualization-container');
        if (visualizationContainer) {
            console.log(`[DEACTIVATE] Found visualization container, removing 'active' class`);
            visualizationContainer.classList.remove('active');
            console.log(`[DEACTIVATE] ✅ Visualization container deactivated`);
        } else {
            console.log(`[DEACTIVATE] ⚠️ Visualization container not found`);
        }
        
        // Hide controls
        const controlsContainer = document.querySelector('.ar-controls-container');
        if (controlsContainer) {
            console.log(`[DEACTIVATE] Found AR controls container, removing 'ar-active' class`);
            controlsContainer.classList.remove('ar-active');
        } else {
            console.log(`[DEACTIVATE] ⚠️ AR controls container not found`);
        }
        
        // Pause audio
        if (this.audioElement) {
            console.log(`[DEACTIVATE] Pausing audio playback`);
            this.audioElement.pause();
        }
        
        // Hide data overlay if visible
        console.log(`[DEACTIVATE] Hiding data overlay`);
        this.hideDataOverlay();
        
        console.log(`[DEACTIVATE] ✅ ${this.title} module deactivation complete`);
    }

    /**
     * Set up the UI elements for this artwork
     * @param {String} title - The title of the artwork to display
     */
    setupUI(title) {
        // Set artwork title
        const titleElement = document.querySelector('.ar-title');
        if (titleElement) {
            titleElement.textContent = title || this.title;
        }
        
        // Set up control buttons
        this.setupControlButtons();
    }

    /**
     * Set up control buttons and their event listeners
     */
    setupControlButtons() {
        // Audio button
        const audioButton = document.getElementById('audioBtn');
        if (audioButton) {
            audioButton.addEventListener('click', () => {
                this.toggleAudio();
            });
        }
        
        // Data button
        const dataButton = document.getElementById('dataBtn');
        if (dataButton) {
            dataButton.addEventListener('click', () => {
                this.showData();
            });
        }
        
        // Close overlay button
        const closeOverlayButton = document.getElementById('overlayClose');
        if (closeOverlayButton) {
            closeOverlayButton.addEventListener('click', () => {
                this.hideDataOverlay();
            });
        }
    }

    /**
     * Toggle audio playback
     */
    toggleAudio() {
        if (!this.audioElement) return;
        
        this.audioEnabled = !this.audioEnabled;
        console.log(`Audio ${this.audioEnabled ? 'enabled' : 'disabled'}`);
        
        const audioButton = document.getElementById('audioBtn');
        if (audioButton) {
            if (this.audioEnabled) {
                audioButton.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
                this.audioElement.play().catch(e => console.log('Error playing audio:', e));
            } else {
                audioButton.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
                this.audioElement.pause();
            }
        }
    }

    /**
     * Set up audio processing
     * @param {String} audioFile - Path to the audio file
     */
    setupAudio(audioFile) {
        // Create audio element
        this.audioElement = document.createElement('audio');
        this.audioElement.src = audioFile;
        this.audioElement.loop = true;
        
        // Set up Web Audio API for analysis
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
            this.audioAnalyser = this.audioContext.createAnalyser();
            
            this.audioAnalyser.fftSize = 256;
            this.audioData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
            
            this.audioSource.connect(this.audioAnalyser);
            this.audioAnalyser.connect(this.audioContext.destination);
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
        }
    }

    /**
     * Get audio analysis data
     * @returns {Uint8Array} - Audio frequency data
     */
    getAudioData() {
        if (this.audioAnalyser && this.audioData) {
            this.audioAnalyser.getByteFrequencyData(this.audioData);
            return this.audioData;
        }
        return null;
    }

    /**
     * Show data overlay with information
     * To be implemented by subclasses
     */
    showData() {
        console.warn('showData() method should be implemented by subclass');
    }

    /**
     * Hide data overlay
     */
    hideDataOverlay() {
        const overlay = document.getElementById('dataOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    /**
     * Clean up resources when module is unloaded
     */
    cleanup() {
        console.log(`[CLEANUP] 🧹 Starting cleanup for ${this.title} module`);
        console.log(`[CLEANUP] Current state - isActive: ${this.isActive}, isInitialized: ${this.isInitialized}`);
        
        // Stop and disconnect audio
        if (this.audioElement) {
            console.log(`[CLEANUP] Stopping audio element`);
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        
        if (this.audioSource) {
            console.log(`[CLEANUP] Disconnecting audio source`);
            try {
                this.audioSource.disconnect();
            } catch (e) {
                console.log('[CLEANUP] Error disconnecting audio source:', e);
            }
        }
        
        if (this.audioAnalyser) {
            console.log(`[CLEANUP] Disconnecting audio analyser`);
            try {
                this.audioAnalyser.disconnect();
            } catch (e) {
                console.log('[CLEANUP] Error disconnecting audio analyser:', e);
            }
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            console.log(`[CLEANUP] Closing audio context`);
            try {
                this.audioContext.close();
            } catch (e) {
                console.log('Error closing audio context:', e);
            }
        }
        
        // Remove event listeners from control buttons
        console.log(`[CLEANUP] Removing event listeners from control buttons`);
        const audioButton = document.getElementById('audioBtn');
        if (audioButton) {
            console.log(`[CLEANUP] Cleaning up audio button event listeners`);
            audioButton.replaceWith(audioButton.cloneNode(true));
        }
        
        const dataButton = document.getElementById('dataBtn');
        if (dataButton) {
            console.log(`[CLEANUP] Cleaning up data button event listeners`);
            dataButton.replaceWith(dataButton.cloneNode(true));
        }
        
        const closeOverlayButton = document.getElementById('overlayClose');
        if (closeOverlayButton) {
            console.log(`[CLEANUP] Cleaning up overlay close button event listeners`);
            closeOverlayButton.replaceWith(closeOverlayButton.cloneNode(true));
        }
        
        console.log(`[CLEANUP] Resetting module state flags`);
        this.isInitialized = false;
        this.isActive = false;
        
        console.log(`[CLEANUP] ✅ ${this.title} module cleanup complete`);
    }
}

// Register this class with the global scope
window.ArtworkModule = ArtworkModule;

} // End of if statement checking for existing class
