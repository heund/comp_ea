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
        console.log(`Initializing ${this.title} module`);
        this.isInitialized = true;
        
        // Create audio context if audio file is provided
        if (this.options.audioFile) {
            this.setupAudio(this.options.audioFile);
        }
    }

    /**
     * Activate the artwork module
     * Called when the corresponding AR marker is detected
     */
    activate() {
        if (!this.isInitialized) {
            this.initialize();
        }
        
        console.log(`Activating ${this.title} module`);
        this.isActive = true;
        
        // Show visualization container
        const visualizationContainer = document.querySelector('.visualization-container');
        if (visualizationContainer) {
            visualizationContainer.classList.add('active');
            console.log('Visualization container activated');
        } else {
            console.error('Visualization container not found');
        }
        
        // Show controls
        const controlsContainer = document.querySelector('.ar-controls-container');
        if (controlsContainer) {
            controlsContainer.classList.add('ar-active');
        }
        
        // Play audio if enabled
        if (this.audioEnabled && this.audioElement) {
            this.audioElement.play().catch(e => console.log('Error playing audio:', e));
        }
    }

    /**
     * Deactivate the artwork module
     * Called when the corresponding AR marker is lost
     */
    deactivate() {
        console.log(`Deactivating ${this.title} module`);
        this.isActive = false;
        
        // Hide visualization container
        const visualizationContainer = document.querySelector('.visualization-container');
        if (visualizationContainer) {
            visualizationContainer.classList.remove('active');
            console.log('Visualization container deactivated');
        }
        
        // Hide controls
        const controlsContainer = document.querySelector('.ar-controls-container');
        if (controlsContainer) {
            controlsContainer.classList.remove('ar-active');
        }
        
        // Pause audio
        if (this.audioElement) {
            this.audioElement.pause();
        }
        
        // Hide data overlay if visible
        this.hideDataOverlay();
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
        console.log(`Cleaning up ${this.title} module`);
        
        // Stop and disconnect audio
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        
        if (this.audioSource) {
            try {
                this.audioSource.disconnect();
            } catch (e) {
                console.log('Error disconnecting audio source:', e);
            }
        }
        
        if (this.audioAnalyser) {
            try {
                this.audioAnalyser.disconnect();
            } catch (e) {
                console.log('Error disconnecting audio analyser:', e);
            }
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            try {
                this.audioContext.close();
            } catch (e) {
                console.log('Error closing audio context:', e);
            }
        }
        
        // Remove event listeners from control buttons
        const audioButton = document.getElementById('audioBtn');
        if (audioButton) {
            audioButton.replaceWith(audioButton.cloneNode(true));
        }
        
        const dataButton = document.getElementById('dataBtn');
        if (dataButton) {
            dataButton.replaceWith(dataButton.cloneNode(true));
        }
        
        const closeOverlayButton = document.getElementById('overlayClose');
        if (closeOverlayButton) {
            closeOverlayButton.replaceWith(closeOverlayButton.cloneNode(true));
        }
        
        this.isInitialized = false;
        this.isActive = false;
    }
}

// Register this class with the global scope
window.ArtworkModule = ArtworkModule;

} // End of if statement checking for existing class
