/**
 * Global Audio Manager - Singleton Pattern
 * 
 * Prevents multiple audio instances from playing simultaneously across all artworks.
 * Uses a centralized registry to track and control all audio playback.
 */

class GlobalAudioManager {
    constructor() {
        if (GlobalAudioManager.instance) {
            return GlobalAudioManager.instance;
        }
        
        // Audio registry to track all active audio instances
        this.activeAudio = new Map();
        this.activeAudioContexts = new Map();
        
        // Current playing audio reference
        this.currentAudio = null;
        this.currentAudioContext = null;
        
        GlobalAudioManager.instance = this;
        
        console.log('Global Audio Manager initialized');
    }
    
    /**
     * Register an audio instance with the manager
     * @param {string} id - Unique identifier for the audio (e.g., 'artwork1', 'artwork2')
     * @param {HTMLAudioElement|AudioContext} audio - Audio element or Web Audio context
     * @param {string} type - 'element' for HTML audio, 'context' for Web Audio API
     * @param {Object} uiElements - Optional UI elements to control (progressBar, etc.)
     */
    registerAudio(id, audio, type = 'element', uiElements = null) {
        if (type === 'element') {
            this.activeAudio.set(id, { audio, uiElements });
        } else if (type === 'context') {
            this.activeAudioContexts.set(id, { audio, uiElements });
        }
        
        console.log(`Audio registered: ${id} (${type})`);
    }
    
    /**
     * Unregister an audio instance
     * @param {string} id - Audio identifier to remove
     */
    unregisterAudio(id) {
        if (this.activeAudio.has(id)) {
            this.activeAudio.delete(id);
            console.log(`Audio unregistered: ${id} (element)`);
        }
        
        if (this.activeAudioContexts.has(id)) {
            this.activeAudioContexts.delete(id);
            console.log(`Audio unregistered: ${id} (context)`);
        }
    }
    
    /**
     * Stop all currently playing audio except the specified one
     * @param {string} exceptId - ID to exclude from stopping (optional)
     */
    stopAllAudio(exceptId = null) {
        console.log('Stopping all audio...', exceptId ? `except ${exceptId}` : '');
        
        // Stop HTML audio elements and hide their UI
        this.activeAudio.forEach((audioData, id) => {
            if (id !== exceptId && audioData) {
                try {
                    const audio = audioData.audio;
                    if (audio && !audio.paused) {
                        audio.pause();
                        audio.currentTime = 0;
                        console.log(`Stopped audio element: ${id}`);
                    }
                    
                    // Hide UI elements for this audio
                    this.hideAudioUI(id);
                } catch (error) {
                    console.warn(`Error stopping audio ${id}:`, error);
                }
            }
        });
        
        // Suspend Web Audio contexts and hide their UI
        this.activeAudioContexts.forEach((contextData, id) => {
            if (id !== exceptId && contextData) {
                try {
                    const context = contextData.audio;
                    if (context && context.state === 'running') {
                        context.suspend().then(() => {
                            console.log(`Suspended audio context: ${id}`);
                        }).catch(error => {
                            console.warn(`Error suspending context ${id}:`, error);
                        });
                    }
                    
                    // Hide UI elements for this audio context
                    this.hideAudioUI(id);
                } catch (error) {
                    console.warn(`Error suspending context ${id}:`, error);
                }
            }
        });
    }
    
    /**
     * Play audio for a specific artwork, stopping all others first
     * @param {string} id - Audio identifier
     */
    playAudio(id) {
        // Stop all other audio first
        this.stopAllAudio(id);
        
        // Play the requested audio
        if (this.activeAudio.has(id)) {
            const audioData = this.activeAudio.get(id);
            const audio = audioData.audio;
            this.currentAudio = audio;
            
            try {
                audio.play().then(() => {
                    console.log(`Playing audio: ${id}`);
                }).catch(error => {
                    console.error(`Error playing audio ${id}:`, error);
                });
            } catch (error) {
                console.error(`Error playing audio ${id}:`, error);
            }
        } else if (this.activeAudioContexts.has(id)) {
            const contextData = this.activeAudioContexts.get(id);
            const context = contextData.audio;
            this.currentAudioContext = context;
            
            try {
                if (context.state === 'suspended') {
                    context.resume().then(() => {
                        console.log(`Resumed audio context: ${id}`);
                    }).catch(error => {
                        console.error(`Error resuming context ${id}:`, error);
                    });
                }
            } catch (error) {
                console.error(`Error resuming context ${id}:`, error);
            }
        } else {
            console.warn(`Audio ${id} not found in registry`);
        }
    }
    
    /**
     * Stop audio for a specific artwork
     * @param {string} id - Audio identifier
     */
    stopAudio(id) {
        if (this.activeAudio.has(id)) {
            const audioData = this.activeAudio.get(id);
            try {
                const audio = audioData.audio;
                if (audio && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            } catch (error) {
                console.warn(`Error stopping audio ${id}:`, error);
            }
        }
        
        if (this.activeAudioContexts.has(id)) {
            const contextData = this.activeAudioContexts.get(id);
            try {
                const context = contextData.audio;
                if (context && context.state === 'running') {
                    context.suspend();
                }
            } catch (error) {
                console.warn(`Error suspending context ${id}:`, error);
            }
        }
        
        if (this.currentAudio === id) {
            this.currentAudio = null;
        }
        if (this.currentAudioContext === id) {
            this.currentAudioContext = null;
        }
    }
    
    /**
     * Hide audio UI elements for a specific artwork
     * @param {string} id - Audio identifier
     */
    hideAudioUI(id) {
        // Hide progress bar for this artwork
        const progressBar = document.getElementById(`${id}AudioProgress`);
        if (progressBar) {
            progressBar.classList.remove('visible');
            console.log(`Hidden audio UI for: ${id}`);
        }
    }
    
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!GlobalAudioManager.instance) {
            new GlobalAudioManager();
        }
        return GlobalAudioManager.instance;
    }
    
    /**
     * Clean up all audio instances
     */
    cleanup() {
        this.stopAllAudio();
        this.activeAudio.clear();
        this.activeAudioContexts.clear();
        this.currentAudio = null;
        this.currentAudioContext = null;
        console.log('Global Audio Manager cleaned up');
    }
}

// Create and expose the singleton instance
window.GlobalAudioManager = GlobalAudioManager;
window.globalAudioManager = GlobalAudioManager.getInstance();

console.log('Global Audio Manager loaded');
