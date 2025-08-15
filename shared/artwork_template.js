/**
 * Artwork Template Module
 * 
 * A minimal template for creating new AR artwork modules.
 * This module creates a simple animated orb visualization.
 */

// Only define the class if it doesn't already exist
if (typeof window.ArtworkTemplate === 'undefined') {

class ArtworkTemplate extends ArtworkModule {
    /**
     * Constructor for the ArtworkTemplate module
     * @param {HTMLElement} container - The container element where the artwork will be rendered
     * @param {Object} options - Configuration options for the module
     */
    constructor(container, options = {}) {
        super(container, options);
        
        // Default title
        this.title = options.title || 'AR Template Visualization';
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.orb = null;
        this.animationFrame = null;
        
        // Animation properties
        this.rotationSpeed = 0.01;
        this.pulseSpeed = 0.02;
        this.pulseAmount = 0.2;
        this.pulsePhase = 0;
        
        // Data for visualization
        this.dataPoints = [
            { label: 'Energy', value: 78, unit: '%' },
            { label: 'Frequency', value: 432, unit: 'Hz' },
            { label: 'Amplitude', value: 65, unit: 'dB' }
        ];
    }
    
    /**
     * Initialize the artwork module
     */
    initialize() {
        super.initialize();
        
        console.log('Initializing ArtworkTemplate module');
        
        // Set up Three.js scene
        this.setupScene();
        
        // Set up UI
        this.setupUI(this.title);
        
        // Create orb
        this.createOrb();
        
        // Start animation loop
        this.animate();
    }
    
    /**
     * Set up Three.js scene, camera, and renderer
     */
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('visualizationCanvas'),
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    /**
     * Create the orb visualization
     */
    createOrb() {
        // Create orb geometry
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Create orb material with glow effect
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x006666,
            specular: 0xffffff,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        // Create orb mesh
        this.orb = new THREE.Mesh(geometry, material);
        this.scene.add(this.orb);
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (!this.isActive) return;
        
        // Request next frame
        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
        
        // Rotate orb
        if (this.orb) {
            this.orb.rotation.x += this.rotationSpeed;
            this.orb.rotation.y += this.rotationSpeed * 1.3;
            
            // Pulse effect
            this.pulsePhase += this.pulseSpeed;
            const scale = 1 + Math.sin(this.pulsePhase) * this.pulseAmount;
            this.orb.scale.set(scale, scale, scale);
            
            // Update orb color based on audio if available
            if (this.audioEnabled && this.audioData) {
                const audioData = this.getAudioData();
                if (audioData) {
                    // Get average frequency value
                    const avg = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
                    
                    // Map to hue (0-360)
                    const hue = (avg / 255) * 360;
                    
                    // Convert HSL to RGB
                    const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
                    this.orb.material.color = color;
                    this.orb.material.emissive = new THREE.Color(`hsl(${hue}, 100%, 25%)`);
                }
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Activate the artwork module
     */
    activate() {
        super.activate();
        
        console.log('Activating ArtworkTemplate module');
        
        // Start animation loop if not already running
        if (!this.animationFrame) {
            this.animate();
        }
    }
    
    /**
     * Deactivate the artwork module
     */
    deactivate() {
        super.deactivate();
        
        console.log('Deactivating ArtworkTemplate module');
        
        // Stop animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * Show data overlay with information
     */
    showData() {
        console.log('Showing data overlay');
        
        // Get data overlay elements
        const overlay = document.getElementById('dataOverlay');
        const title = document.querySelector('.data-title');
        const metrics = document.querySelector('.metrics-container');
        
        if (!overlay || !title || !metrics) {
            console.error('Data overlay elements not found');
            return;
        }
        
        // Set title
        title.textContent = this.title;
        
        // Clear existing metrics
        metrics.innerHTML = '';
        
        // Add metrics
        this.dataPoints.forEach(point => {
            const metricEl = document.createElement('div');
            metricEl.className = 'metric';
            
            metricEl.innerHTML = `
                <div class="metric-value">${point.value}</div>
                <div class="metric-label">${point.label}</div>
                <div class="metric-unit">${point.unit}</div>
            `;
            
            metrics.appendChild(metricEl);
        });
        
        // Show overlay
        overlay.classList.add('active');
    }
    
    /**
     * Clean up resources when module is unloaded
     */
    cleanup() {
        super.cleanup();
        
        console.log('Cleaning up ArtworkTemplate module');
        
        // Stop animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Dispose Three.js objects
        if (this.orb) {
            this.scene.remove(this.orb);
            this.orb.geometry.dispose();
            this.orb.material.dispose();
            this.orb = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
        
        // Clear scene
        if (this.scene) {
            while (this.scene.children.length > 0) {
                const object = this.scene.children[0];
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
                this.scene.remove(object);
            }
        }
        
        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        this.scene = null;
        this.camera = null;
    }
}

// Register this class with the global scope
window.ArtworkTemplate = ArtworkTemplate;

} // End of if statement checking for existing class
