/**
 * 열간 압연 데이터 03: 시계열 구간별 변형 제어값 Module
 * 
 * AR artwork module that creates a stratified deformation visualization.
 * This module visualizes deformation layers with stress analysis.
 */

// Only define the class if it doesn't already exist
if (typeof window.Artwork3 === 'undefined') {

    class Artwork3 extends ArtworkModule {
        /**
         * Constructor for the ArtworkTemplate module
         * @param {HTMLElement} container - The container element where the artwork will be rendered
         * @param {Object} options - Configuration options for the module
         */
        constructor(container, options = {}) {
            super(container, options);
            
            // Default title
            this.title = options.title || '열간 압연 데이터 03: 온도 분포 지도';
            
            // Get global audio manager instance
            this.globalAudioManager = window.globalAudioManager || window.GlobalAudioManager?.getInstance();
            this.audioId = 'artwork3';
            
            // Three.js objects
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.animationFrame = null;
            
            // Audio wave visualization objects
            this.canvas = null;
            this.ctx = null;
            this.waveAnimationId = null;
            this.time = 0;
            this.lastFrameTime = 0;
            
            // Data overlay system
            this.currentDataset = 0;
            this.overlayVisible = false;
            this.dataUpdateInterval = null;
            
            // Touch ripple effect variables
            this.touchRipples = [];
            this.isColorShifted = false;
            this.sampleDeformationData = [
                {simulation_step: 1, strain_rate: 0.091, flow_stress: 129.2, total_deformation: 0.0, grain_size: 100.0, recrystallization_fraction: 0.0, material_type: "Medium Carbon Steel", temperature: 1100.0},
                {simulation_step: 2, strain_rate: 0.095, flow_stress: 135.4, total_deformation: 0.05, grain_size: 98.5, recrystallization_fraction: 0.02, material_type: "Medium Carbon Steel", temperature: 1095.0},
                {simulation_step: 3, strain_rate: 0.102, flow_stress: 142.1, total_deformation: 0.12, grain_size: 96.8, recrystallization_fraction: 0.05, material_type: "Medium Carbon Steel", temperature: 1090.0},
                {simulation_step: 4, strain_rate: 0.108, flow_stress: 148.9, total_deformation: 0.21, grain_size: 94.9, recrystallization_fraction: 0.08, material_type: "Medium Carbon Steel", temperature: 1085.0},
                {simulation_step: 5, strain_rate: 0.115, flow_stress: 155.8, total_deformation: 0.32, grain_size: 92.7, recrystallization_fraction: 0.12, material_type: "Medium Carbon Steel", temperature: 1080.0},
                {simulation_step: 6, strain_rate: 0.123, flow_stress: 162.9, total_deformation: 0.45, grain_size: 90.3, recrystallization_fraction: 0.16, material_type: "High Carbon Steel", temperature: 1075.0},
                {simulation_step: 7, strain_rate: 0.131, flow_stress: 170.2, total_deformation: 0.59, grain_size: 87.6, recrystallization_fraction: 0.21, material_type: "High Carbon Steel", temperature: 1070.0},
                {simulation_step: 8, strain_rate: 0.139, flow_stress: 177.7, total_deformation: 0.75, grain_size: 84.7, recrystallization_fraction: 0.26, material_type: "High Carbon Steel", temperature: 1065.0},
                {simulation_step: 9, strain_rate: 0.148, flow_stress: 185.4, total_deformation: 0.93, grain_size: 81.5, recrystallization_fraction: 0.32, material_type: "High Carbon Steel", temperature: 1060.0},
                {simulation_step: 10, strain_rate: 0.157, flow_stress: 193.3, total_deformation: 1.13, grain_size: 78.1, recrystallization_fraction: 0.38, material_type: "Low Carbon Steel", temperature: 1055.0},
                {simulation_step: 11, strain_rate: 0.167, flow_stress: 201.5, total_deformation: 1.35, grain_size: 74.4, recrystallization_fraction: 0.45, material_type: "Low Carbon Steel", temperature: 1050.0},
                {simulation_step: 12, strain_rate: 0.177, flow_stress: 209.9, total_deformation: 1.59, grain_size: 70.5, recrystallization_fraction: 0.52, material_type: "Low Carbon Steel", temperature: 1045.0},
                {simulation_step: 13, strain_rate: 0.188, flow_stress: 218.6, total_deformation: 1.85, grain_size: 66.3, recrystallization_fraction: 0.60, material_type: "Low Carbon Steel", temperature: 1040.0},
                {simulation_step: 14, strain_rate: 0.199, flow_stress: 227.6, total_deformation: 2.13, grain_size: 61.9, recrystallization_fraction: 0.68, material_type: "Medium Carbon Steel", temperature: 1035.0},
                {simulation_step: 15, strain_rate: 0.211, flow_stress: 236.9, total_deformation: 2.43, grain_size: 57.2, recrystallization_fraction: 0.77, material_type: "Medium Carbon Steel", temperature: 1030.0},
                {simulation_step: 16, strain_rate: 0.223, flow_stress: 246.5, total_deformation: 2.76, grain_size: 52.3, recrystallization_fraction: 0.86, material_type: "Medium Carbon Steel", temperature: 1025.0},
                {simulation_step: 17, strain_rate: 0.236, flow_stress: 256.5, total_deformation: 3.11, grain_size: 47.1, recrystallization_fraction: 0.95, material_type: "High Carbon Steel", temperature: 1020.0},
                {simulation_step: 18, strain_rate: 0.250, flow_stress: 266.9, total_deformation: 3.48, grain_size: 41.6, recrystallization_fraction: 1.05, material_type: "High Carbon Steel", temperature: 1015.0},
                {simulation_step: 19, strain_rate: 0.264, flow_stress: 277.7, total_deformation: 3.88, grain_size: 35.8, recrystallization_fraction: 1.15, material_type: "High Carbon Steel", temperature: 1010.0},
                {simulation_step: 20, strain_rate: 0.279, flow_stress: 288.9, total_deformation: 4.30, grain_size: 29.7, recrystallization_fraction: 1.26, material_type: "Low Carbon Steel", temperature: 1005.0}
            ];
            
            // Data overlay properties
            this.overlayVisible = false;
            this.currentDataset = 0;
            this.dataUpdateInterval = null;
            
            // Mouse interaction
            this.mouse = new THREE.Vector2();
            this.raycaster = new THREE.Raycaster();
            
            // Animation properties
            this.isWireframe = false;
            this.colorSchemeIndex = 0;
            
            // Data overlay system
            this.overlayVisible = false;
            this.currentDataset = 0;
            this.dataUpdateInterval = null;
            
            // Color schemes
            this.colorSchemes = [
                { name: 'UserGreyGradient', colors: ['#E9EAEB', '#BEC3C5', '#989C9E', '#747779', '#525455', '#323334', '#151616'] },
                { name: 'GreyGradientAlt', colors: ['#E9EAEB', '#BEC3C5', '#989C9E', '#747779', '#525455', '#323334', '#151616'] },
                { name: 'MonochromeGradient', colors: ['#E9EAEB', '#BEC3C5', '#989C9E', '#747779', '#525455', '#323334', '#151616'] },
                { name: 'GreyScale', colors: ['#E9EAEB', '#BEC3C5', '#989C9E', '#747779', '#525455', '#323334', '#151616'] }
            ];
            
            
            // Data for overlay
            this.dataPoints = [
                { label: 'Strain Rate', value: 0.145, unit: '/s' },
                { label: 'Flow Stress', value: 185.4, unit: 'MPa' },
                { label: 'Total Deformation', value: 2.13, unit: 'mm' },
                { label: 'Grain Size', value: 61.9, unit: 'μm' }
            ];
            
            // Audio for this artwork
            this.artworkAudio = null;
            this.isAudioPlaying = false;
            this.audioProgressInterval = null;
        }
        
        /**
         * Initialize the artwork module
         */
        initialize() {
            super.initialize();
            
            console.log('Initializing Artwork3...');
            
            // Set up Three.js scene first
            this.setupScene();
            
            // Initialize wave canvas for audio wave visualization
            this.initializeWaveCanvas();
            
            // Set up UI
            this.setupUI(this.title);
            
            // Setup canvas click detection
            this.setupCanvasClickDetection();
            
            // Initialize and set up data overlay
            this.initializeDataOverlay();
            this.setupDataOverlayListeners();
            
            // Initialize artwork audio
            this.initializeArtworkAudio();
            
            // Create audio progress bar
            this.createAudioProgressBar();
            
            this.title = '열간 압연 데이터 03: 시계열 구간별 변형 제어값';
            console.log('Artwork3 initialized successfully');
        }
        
        /**
         * Set up Three.js scene, camera, and renderer
         */
        setupScene() {
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            const container = canvas.parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            // Create scene
            this.scene = new THREE.Scene();
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            this.camera.position.z = 5;
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                alpha: true,
                antialias: true
            });
            this.renderer.setSize(width, height);
            this.renderer.setClearColor(0x000000, 0);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);
            
            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(50, 50, 50);
            this.scene.add(directionalLight);
            
            // Add simple placeholder orb to prevent empty container issues
            this.createPlaceholderOrb();
        }
        
        /**
         * Create a simple placeholder orb for the Three.js container
         */
        createPlaceholderOrb() {
            // Create a simple sphere geometry
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            
            // Create a completely invisible material
            const material = new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.0,
                visible: false
            });
            
            // Create the mesh
            this.placeholderOrb = new THREE.Mesh(geometry, material);
            this.placeholderOrb.position.set(0, 0, 0);
            
            // Add to scene
            this.scene.add(this.placeholderOrb);
            
            console.log('Placeholder orb created for artwork3');
        }
        
        /**
         * Set up event listeners
         */
        setupEventListeners() {
            // Window resize handler
            window.addEventListener('resize', this.onWindowResize.bind(this));
        }
        
        /**
         * Initialize data overlay with consistent formatting
         */
        initializeDataOverlay() {
            try {
                // Make sure the default text in the HTML uses line breaks consistently
                const metricLabel = document.getElementById('metricLabel');
                if (metricLabel) {
                    // Check if it's the default "Rolling Force" text
                    if (metricLabel.innerHTML.includes('Rolling')) {
                        // Ensure it has a line break
                        metricLabel.innerHTML = 'Rolling<br>Force';
                    }
                }
            } catch (error) {
                console.error('Error initializing data overlay:', error);
            }
        }
        
        /**
         * Set up data overlay event listeners
         */
        setupDataOverlayListeners() {
            try {
                const canvas = document.getElementById('visualizationCanvas');
                const overlayClose = document.getElementById('overlayClose');
                
                if (canvas) {
                    console.log('Setting up data overlay listeners for canvas');
                    
                    // Canvas click handler for data overlay
                    canvas.addEventListener('click', (event) => {
                        try {
                            this.handleCanvasClick(event, canvas);
                        } catch (error) {
                            console.error('Error in canvas click handler:', error);
                        }
                    });
                    
                    // Touch handler for mobile devices
                    let isTouchDragging = false;
                    let touchStartTime = 0;
                    
                    canvas.addEventListener('touchstart', (event) => {
                        isTouchDragging = false;
                        touchStartTime = Date.now();
                    }, { passive: false });
                    
                    canvas.addEventListener('touchmove', (event) => {
                        isTouchDragging = true;
                    }, { passive: false });
                    
                    canvas.addEventListener('touchend', (event) => {
                        try {
                            event.preventDefault();
                            const touchDuration = Date.now() - touchStartTime;
                            
                            // Only trigger click if it wasn't a drag and was a quick tap
                            if (!isTouchDragging && touchDuration < 300) {
                                if (event.changedTouches.length > 0) {
                                    const touch = event.changedTouches[0];
                                    const syntheticEvent = {
                                        clientX: touch.clientX,
                                        clientY: touch.clientY,
                                        target: canvas
                                    };
                                    this.handleCanvasClick(syntheticEvent, canvas);
                                }
                            }
                            isTouchDragging = false;
                        } catch (error) {
                            console.error('Error in touchend handler:', error);
                        }
                    }, { passive: false });
                } else {
                    console.warn('Canvas element not found for data overlay listeners');
                }
                
                // Close button handler
                if (overlayClose) {
                    overlayClose.addEventListener('click', () => {
                        try {
                            this.hideDataOverlay();
                        } catch (error) {
                            console.error('Error in overlay close handler:', error);
                        }
                    });
                } else {
                    console.warn('Overlay close button not found');
                }
                
                // Data button functionality is handled by parent class
            } catch (error) {
                console.error('Error setting up data overlay listeners:', error);
            }
        }
        
        /**
         * Calculate scale factor based on device size
         */
        calculateScaleFactor(minDimension) {
            // Dynamic scaling based on device size
            if (minDimension <= 480) {
                return 0.8; // Phone
            } else if (minDimension <= 768) {
                return 0.9; // Small tablet
            } else if (minDimension <= 1024) {
                return 1.0; // iPad
            } else {
                return 1.1; // Desktop
            }
        }
    
        /**
         * Setup canvas click detection for data overlay interaction
         */
        setupCanvasClickDetection() {
            const canvas = document.getElementById('waveCanvas');
            if (!canvas) return;
            
            // Simple click event - just like any other HTML element
            canvas.addEventListener('click', (event) => {
                this.handleCanvasTouch(event, canvas);
            });
            
            // Simple touch event for mobile
            canvas.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.handleCanvasTouch(event, canvas);
            });
            
            // Set up exit button to stop audio
            const exitButton = document.getElementById('exitBtn');
            if (exitButton) {
                exitButton.addEventListener('click', () => {
                    this.stopArtworkAudio();
                });
            }
        }
        
        /**
         * Handle canvas touch for ripple effects and data overlay cycling
         */
        handleCanvasTouch(event, canvas) {
            // Get touch/click coordinates
            const rect = canvas.getBoundingClientRect();
            let x, y;
            
            if (event.type === 'touchend' && event.changedTouches) {
                x = event.changedTouches[0].clientX - rect.left;
                y = event.changedTouches[0].clientY - rect.top;
            } else {
                x = event.clientX - rect.left;
                y = event.clientY - rect.top;
            }
            
            // Scale coordinates to canvas size
            x = (x / rect.width) * canvas.width;
            y = (y / rect.height) * canvas.height;
            
            // Create ripple effect at touch point
            this.createTouchRipple(x, y);
            
            // Original functionality - show data overlay or cycle datasets
            if (this.overlayVisible) {
                this.cycleToNextDataset();
            } else {
                this.showDataOverlay();
            }
        }
        
        /**
         * Create a touch ripple effect
         */
        createTouchRipple(x, y) {
            // Create a new ripple effect
            const ripple = {
                x: x,
                y: y,
                radius: 0,
                maxRadius: 200,
                startTime: performance.now(),
                duration: 2000, // 2 seconds
                intensity: 1.0
            };
            
            this.touchRipples.push(ripple);
            
            // Trigger color shift
            this.isColorShifted = true;
            
            // Reset color shift after ripple fades
            setTimeout(() => {
                this.isColorShifted = false;
            }, ripple.duration);
        }
        
        /**
         * Update touch ripples
         */
        updateTouchRipples(currentTime) {
            // Update and remove expired ripples
            this.touchRipples = this.touchRipples.filter(ripple => {
                const elapsed = currentTime - ripple.startTime;
                const progress = elapsed / ripple.duration;
                
                if (progress >= 1.0) {
                    return false; // Remove expired ripple
                }
                
                // Update ripple properties
                ripple.radius = ripple.maxRadius * progress;
                ripple.intensity = 1.0 - progress; // Fade out over time
                
                return true; // Keep active ripple
            });
        }
        
        /**
         * Calculate ripple influence at a given point
         */
        calculateRippleInfluence(waveX, waveY, ripple) {
            // Calculate distance from wave point to ripple center
            const dx = waveX - ripple.x;
            const dy = waveY - ripple.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate influence based on ripple radius and distance
            if (distance <= ripple.radius) {
                const influence = ripple.intensity * (1.0 - distance / ripple.radius);
                return Math.max(0, influence);
            }
            
            return 0;
        }
        
        /**
         * Show data overlay with cycling datasets
         */
        showDataOverlay() {
            const overlay = document.getElementById('dataOverlay');
            if (overlay) {
                this.overlayVisible = true;
                
                // Initialize with first dataset BEFORE showing overlay
                this.updateOverlayData();
                
                overlay.classList.add('active');
                
                // Start data cycling
                this.startDataCycling();
            }
        }
        
        /**
         * Hide data overlay
         */
        hideDataOverlay() {
            const overlay = document.getElementById('dataOverlay');
            if (overlay) {
                this.overlayVisible = false;
                overlay.classList.remove('active');
                
                // Stop data cycling
                this.stopDataCycling();
            }
        }
        
        /**
         * Cycle to next dataset
         */
        cycleToNextDataset() {
            if (this.overlayVisible) {
                this.currentDataset = (this.currentDataset + 1) % 4;
                this.updateOverlayData();
            }
        }
        
        
        /**
         * Update data values with dynamic calculations
         */
        updateDataValues() {
            const time = (Date.now() * 0.001);
            let value;
            const metricValue = document.getElementById('metricValue');
            if (!metricValue) return;
            
            switch (this.currentDataset) {
                case 0: // Strain Rate
                    value = 0.091 + Math.sin(time * 1.3) * 0.02 + Math.cos(time * 2.7) * 0.015;
                    value = Math.max(0.05, Math.min(0.15, value));
                    metricValue.textContent = value.toFixed(3);
                    break;
                    
                case 1: // Flow Stress
                    value = 129.2 + Math.sin(time * 1.8) * 15 + Math.cos(time * 2.3) * 10;
                    value = Math.max(100, Math.min(180, value));
                    metricValue.textContent = value.toFixed(1);
                    break;
                    
                case 2: // Total Deformation
                    value = 0.0 + Math.sin(time * 1.5) * 0.3 + Math.cos(time * 2.1) * 0.2;
                    value = Math.max(0.0, Math.min(1.0, value));
                    metricValue.textContent = value.toFixed(2);
                    break;
                    
                case 3: // Grain Size
                    value = 100.0 + Math.sin(time * 1.2) * 20 + Math.cos(time * 1.9) * 15;
                    value = Math.max(60, Math.min(140, value));
                    metricValue.textContent = value.toFixed(1);
                    break;
            }
        }
        
        /**
         * Start data cycling interval
         */
        startDataCycling() {
            if (this.dataUpdateInterval) return;
            
            this.dataUpdateInterval = setInterval(() => {
                if (this.overlayVisible) {
                    this.updateDataValues();
                }
            }, 200); // Fast updates for dynamic effect
        }
        
        /**
         * Stop data cycling interval
         */
        stopDataCycling() {
            if (this.dataUpdateInterval) {
                clearInterval(this.dataUpdateInterval);
                this.dataUpdateInterval = null;
            }
        }
        
        /**
         * Initialize wave canvas for audio wave visualization
         */
        initializeWaveCanvas() {
            // First try to find existing canvas
            this.canvas = document.getElementById('waveCanvas');
            
            // If not found, create it dynamically
            if (!this.canvas) {
                console.log('waveCanvas not found, creating dynamically');
                
                // Create wave container if it doesn't exist
                let waveContainer = document.getElementById('waveContainer');
                if (!waveContainer) {
                    waveContainer = document.createElement('div');
                    waveContainer.id = 'waveContainer';
                    waveContainer.className = 'wave-container';
                    document.body.appendChild(waveContainer);
                }
                
                // Create canvas
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'waveCanvas';
                this.canvas.width = 1920;
                this.canvas.height = 1080;
                waveContainer.appendChild(this.canvas);
                
                console.log('waveCanvas created dynamically');
            }
            
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                
                // Set canvas size to match container
                const container = this.canvas.parentElement;
                this.canvas.width = container.clientWidth;
                this.canvas.height = container.clientHeight;
                
                this.lastFrameTime = performance.now();
                console.log('Wave canvas initialized:', this.canvas.width, 'x', this.canvas.height);
            } else {
                console.error('Failed to create waveCanvas element');
            }
        }
        
        /**
         * Draw flowing audio waves with gradients - matches artwork3.html exactly
         */
        drawWaves() {
            if (!this.canvas || !this.ctx) {
                console.log('Canvas or context not available for drawing waves');
                return;
            }
            
            console.log('Drawing waves - canvas size:', this.canvas.width, 'x', this.canvas.height);
            
            // Use consistent frame timing to prevent acceleration
            const currentTime = performance.now();
            if (this.lastFrameTime === 0) {
                this.lastFrameTime = currentTime;
            }
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            // Update time at consistent rate for natural wave animation
            this.time += deltaTime * 0.08; // Faster for more engaging wave movement
            
            // Update touch ripples
            this.updateTouchRipples(currentTime);
            
            // Clear canvas with transparent background
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw densely stacked waves - AR optimized
            const centerY = this.canvas.height / 2;
            const numWaves = 60; // Fewer waves for much thicker appearance
            
            for (let i = 0; i < numWaves; i++) {
                const waveOffset = (i - numWaves / 2) * 8; // Much more spacing for AR visibility
                const baseY = centerY + waveOffset;
                
                // Create gradient for each wave with smooth color blending and depth of field
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
                
                // Calculate distance from center for depth of field
                const centerDistance = Math.abs(waveOffset);
                const maxDistance = 240; // Maximum distance from center
                const depthRatio = centerDistance / maxDistance; // 0 = center, 1 = edge
                
                // Depth of field: closer waves are more saturated and opaque
                const baseAlpha = Math.max(0.2, 1 - depthRatio * 0.8); // Fade to background
                const saturation = Math.max(0.3, 1 - depthRatio * 0.7); // Desaturate distant waves
                
                // Smooth color transition: red center → orange → cyan edges
                // Using smooth cubic interpolation for better gradients
                const smoothRatio = depthRatio * depthRatio * (3 - 2 * depthRatio); // Smooth step function
                
                // Calculate ripple influence for this wave position
                let totalRippleInfluence = 0;
                for (let ripple of this.touchRipples) {
                    totalRippleInfluence += this.calculateRippleInfluence(this.canvas.width / 2, baseY, ripple);
                }
                totalRippleInfluence = Math.min(1.0, totalRippleInfluence);
                
                // Color palette with three-stage transitions
                const centerR = 255, centerG = 80, centerB = 60;      // Coral-orange between orange and pink
                const midR = 246, midG = 101, midB = 93;               // #F6655D exact color mid
                const edgeR = 100, edgeG = 149, edgeB = 180;           // Greyish blue edges
                
                // Blue shift colors (opposite end of spectrum)
                const blueR = 50, blueG = 120, blueB = 200;            // Deep blue
                const lightBlueR = 100, lightBlueG = 180, lightBlueB = 255; // Light blue
                
                // Three-stage interpolation: red → orange → cyan
                let r, g, b;
                if (smoothRatio < 0.5) {
                    // First half: red to orange
                    const t = smoothRatio * 2; // 0 to 1
                    r = Math.round(centerR + (midR - centerR) * t);
                    g = Math.round(centerG + (midG - centerG) * t);
                    b = Math.round(centerB + (midB - centerB) * t);
                } else {
                    // Second half: orange to cyan
                    const t = (smoothRatio - 0.5) * 2; // 0 to 1
                    r = Math.round(midR + (edgeR - midR) * t);
                    g = Math.round(midG + (edgeG - midG) * t);
                    b = Math.round(midB + (edgeB - midB) * t);
                }
                
                // Apply ripple color shift toward blue spectrum
                if (totalRippleInfluence > 0) {
                    const targetR = smoothRatio < 0.5 ? blueR : lightBlueR;
                    const targetG = smoothRatio < 0.5 ? blueG : lightBlueG;
                    const targetB = smoothRatio < 0.5 ? blueB : lightBlueB;
                    
                    r = Math.round(r + (targetR - r) * totalRippleInfluence);
                    g = Math.round(g + (targetG - g) * totalRippleInfluence);
                    b = Math.round(b + (targetB - b) * totalRippleInfluence);
                }
                
                // Apply saturation factor
                const finalR = Math.round(r * saturation + 128 * (1 - saturation));
                const finalG = Math.round(g * saturation + 128 * (1 - saturation));
                const finalB = Math.round(b * saturation + 128 * (1 - saturation));
                
                // Create gradient with depth-aware opacity
                gradient.addColorStop(0, `rgba(${finalR}, ${finalG}, ${finalB}, 0)`);
                gradient.addColorStop(0.1, `rgba(${finalR}, ${finalG}, ${finalB}, ${baseAlpha * 0.6})`);
                gradient.addColorStop(0.5, `rgba(${finalR}, ${finalG}, ${finalB}, ${baseAlpha})`);
                gradient.addColorStop(0.9, `rgba(${finalR}, ${finalG}, ${finalB}, ${baseAlpha * 0.6})`);
                gradient.addColorStop(1, `rgba(${finalR}, ${finalG}, ${finalB}, 0)`);
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 12 + Math.sin(i * 0.1) * 4; // Dramatically thick lines (12-16px) for AR
                this.ctx.globalAlpha = baseAlpha;
                
                // Draw wave path
                this.ctx.beginPath();
                
                for (let x = 0; x <= this.canvas.width; x += 3) { // Lower resolution for smoother curves
                    // Simplified wave with just 2 frequencies for cleaner look
                    const frequency1 = 0.008 + Math.sin(i * 0.05) * 0.003; // Primary wave
                    const frequency2 = 0.020 + Math.cos(i * 0.03) * 0.005; // Secondary wave
                    
                    const amplitude1 = 30 + Math.sin(i * 0.1 + this.time * 0.02) * 20; // Large primary amplitude
                    const amplitude2 = 10 + Math.cos(i * 0.15 + this.time * 0.015) * 8; // Smaller secondary amplitude
                    
                    // Calculate ripple influence for this specific point
                    let pointRippleInfluence = 0;
                    for (let ripple of this.touchRipples) {
                        pointRippleInfluence += this.calculateRippleInfluence(x, baseY, ripple);
                    }
                    pointRippleInfluence = Math.min(1.0, pointRippleInfluence);
                    
                    // Add ripple distortion to wave amplitude
                    const rippleAmplitude = pointRippleInfluence * 15; // Additional wave distortion from ripple
                    
                    const wave1 = Math.sin(x * frequency1 + this.time * 0.01 + i * 0.1) * amplitude1;
                    const wave2 = Math.sin(x * frequency2 + this.time * 0.008 + i * 0.15) * amplitude2;
                    const rippleWave = Math.sin(x * 0.02 + this.time * 0.05) * rippleAmplitude;
                    
                    const y = baseY + wave1 + wave2 + rippleWave;
                    
                    if (x === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                
                this.ctx.stroke();
            }
            
            this.ctx.globalAlpha = 1;
            // Continue animation
            this.waveAnimationId = requestAnimationFrame(() => this.drawWaves());
        }
        
        /**
         * Create the network graph visualization
         */
        createCorrectionNetwork() {
            const n_nodes = 800;
            const coreRadius = 1.5, sphereRadius = 15;
            
            this.networkGraph.nodes = [];
            
            // Create 800 nodes
            for (let i = 0; i < n_nodes; i++) {
                const row = this.sampleDeformationData[i % this.sampleDeformationData.length];
                const variation = (Math.random() - 0.5) * 0.2;
                
                const strainIntensity = Math.min(1.0, (row.strain_rate + variation) / 0.3);
                const stressLevel = Math.min(1.0, (row.flow_stress + variation * 50) / 300.0);
                const deformationLevel = Math.min(1.0, (row.total_deformation + variation * 2) / 5.0);
                
                // Generate 3D position using rejection sampling
                let x, y, z, distanceSquared;
                do {
                    x = (Math.random() - 0.5) * 2;
                    y = (Math.random() - 0.5) * 2;
                    z = (Math.random() - 0.5) * 2;
                    distanceSquared = x*x + y*y + z*z;
                } while (distanceSquared > 1 || distanceSquared < 0.01);
                
                const unitDistance = Math.sqrt(distanceSquared);
                const minDistance = coreRadius + 0.5;
                const actualDistance = minDistance + (unitDistance * (sphereRadius - minDistance));
                
                x = (x / unitDistance) * actualDistance;
                y = (y / unitDistance) * actualDistance;
                z = (z / unitDistance) * actualDistance;
                
                this.networkGraph.nodes.push({
                    id: i, intensity: strainIntensity, health: stressLevel, burden: deformationLevel,
                    x: x, y: y, z: z, vx: 0, vy: 0, vz: 0
                });
            }
            
            this.createSolidCore();
            this.createNetworkVisualization();
        }
        
        /**
         * Create the central core of the network
         */
        createSolidCore() {
            const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
            const currentScheme = this.colorSchemes[this.colorSchemeIndex];
            const coreMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color(currentScheme.colors[currentScheme.colors.length - 1])
            });
            
            this.centralCore = new THREE.Mesh(coreGeometry, coreMaterial);
            this.centralCore.castShadow = true;
            this.scene.add(this.centralCore);
        }
        
        /**
         * Create the network nodes and edges
         */
        createNetworkVisualization() {
            // Clear existing
            this.networkNodes.forEach(node => this.scene.remove(node));
            this.networkEdges.forEach(edge => this.scene.remove(edge));
            this.networkNodes.length = 0;
            this.networkEdges.length = 0;
            
            const currentScheme = this.colorSchemes[this.colorSchemeIndex];
            const edgeColor = new THREE.Color(currentScheme.colors[currentScheme.colors.length - 2]);
            
            this.networkGraph.nodes.forEach((node, i) => {
                // Create connection from center to node
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array([0, 0, 0, node.x, node.y, node.z]);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                
                const material = new THREE.LineBasicMaterial({
                    color: edgeColor, transparent: true, opacity: 0.7
                });
                
                const edge = new THREE.Line(geometry, material);
                this.scene.add(edge);
                this.networkEdges.push(edge);
                
                // Create optimized node mesh
                const nodeGeometry = new THREE.SphereGeometry(0.2, 12, 12); // Reduced complexity
                const colorIndex = Math.floor(node.intensity * (currentScheme.colors.length - 1));
                const nodeMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(currentScheme.colors[colorIndex]),
                    transparent: true, 
                    opacity: 0.8, 
                    wireframe: this.isWireframe
                });
                
                const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
                nodeMesh.position.set(node.x, node.y, node.z);
                nodeMesh.userData = { nodeData: node, type: 'deformation-node', clickable: true };
                this.scene.add(nodeMesh);
                this.networkNodes.push(nodeMesh);
            });
        }
        
        /**
         * Setup mouse and touch controls
         */
        setupMouseControls() {
            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };
            this.rotationSpeed = { x: 0.001, y: 0.001 };
            this.autoRotate = true;
            
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            // Mouse events
            canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
            document.addEventListener('mousemove', this.onMouseMove.bind(this));
            document.addEventListener('mouseup', this.onMouseUp.bind(this));
            
            // Touch events for mobile
            canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
            document.addEventListener('touchend', this.onTouchEnd.bind(this));
            
            // Mouse wheel for zoom
            canvas.addEventListener('wheel', this.onMouseWheel.bind(this), { passive: false });
        }
        
        /**
         * Mouse down event handler
         */
        onMouseDown(event) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
            this.autoRotate = false;
        }
        
        /**
         * Mouse move event handler
         */
        onMouseMove(event) {
            if (!this.isDragging) return;
            
            const deltaX = event.clientX - this.previousMousePosition.x;
            const deltaY = event.clientY - this.previousMousePosition.y;
            
            // Rotate camera using the new method
            this.rotateCamera(deltaX, deltaY);
            
            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
        
        /**
         * Mouse up event handler
         */
        onMouseUp(event) {
            this.isDragging = false;
        }
        
        /**
         * Touch start event handler
         */
        onTouchStart(event) {
            event.preventDefault();
            if (event.touches.length === 1) {
                this.isDragging = true;
                this.previousMousePosition = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                this.autoRotate = false;
            }
        }
        
        /**
         * Touch move event handler
         */
        onTouchMove(event) {
            event.preventDefault();
            if (!this.isDragging || event.touches.length !== 1) return;
            
            const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
            const deltaY = event.touches[0].clientY - this.previousMousePosition.y;
            
            // Rotate camera using the new method
            this.rotateCamera(deltaX, deltaY);
            
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
        
        /**
         * Touch end event handler
         */
        onTouchEnd(event) {
            this.isDragging = false;
        }
        
        /**
         * Mouse wheel event handler for zoom
         */
        onMouseWheel(event) {
            event.preventDefault();
            
            if (this.camera) {
                const zoomSpeed = 0.1;
                const zoomDirection = event.deltaY > 0 ? 1 : -1;
                this.zoomCamera(zoomDirection * zoomSpeed);
            }
        }
        
        /**
         * Rotate camera around target
         */
        rotateCamera(deltaX, deltaY) {
            if (!this.camera) return;
            
            const rotationSpeed = 0.005;
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            
            spherical.theta -= deltaX * rotationSpeed;
            spherical.phi += deltaY * rotationSpeed;
            
            // Constrain phi to prevent flipping
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);
        }
        
        /**
         * Zoom camera in/out
         */
        zoomCamera(delta) {
            if (!this.camera) return;
            
            const direction = this.camera.position.clone().normalize();
            const newPosition = this.camera.position.clone().add(direction.multiplyScalar(delta));
            
            // Constrain zoom distance
            const minDistance = 5;
            const maxDistance = 100;
            const distance = newPosition.length();
            
            if (distance >= minDistance && distance <= maxDistance) {
                this.camera.position.copy(newPosition);
            }
        }
        
        /**
         * Animation loop - only for canvas wave animation
         */
        animate() {
            if (!this.isActive) return;
            
            // For artwork3, we only need canvas wave animation
            // The drawWaves() method handles its own requestAnimationFrame
            if (this.canvas && this.ctx && !this.waveAnimationId) {
                this.drawWaves();
            }
        }
        
        /**
         * Handle window resize
         */
        onWindowResize() {
            if (!this.camera || !this.renderer) return;
            
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            const container = canvas.parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
        
        /**
         * Activate the artwork (called when AR marker is detected)
         */
        activate() {
            super.activate();
            
            console.log('Activating Artwork3...');
            
            // Reset overlay state when activating (like artwork1)
            this.overlayVisible = false;
            
            // Show wave container and reset display
            const waveContainer = document.getElementById('waveContainer');
            if (waveContainer) {
                waveContainer.style.display = 'block'; // Ensure it's visible
                waveContainer.classList.add('active');
                console.log('Wave container activated');
            }
            
            // Stop any existing animation before starting a new one
            if (this.waveAnimationId) {
                cancelAnimationFrame(this.waveAnimationId);
                this.waveAnimationId = null;
            }
            
            // Re-initialize canvas to ensure clean state
            this.initializeWaveCanvas();
            
            // Clear canvas completely before starting new animation
            if (this.canvas && this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            // Start wave animation directly - this should trigger the animation loop
            if (this.canvas && this.ctx) {
                this.time = 0; // Reset animation time
                this.lastFrameTime = performance.now();
                this.drawWaves();
            }
            
            // Start Three.js render loop for placeholder orb
            this.startThreeJSRenderLoop();
        }
        
        /**
         * Start Three.js render loop for the placeholder orb
         */
        startThreeJSRenderLoop() {
            if (!this.renderer || !this.scene || !this.camera) return;
            
            const animate = () => {
                if (!this.isActive) return; // Stop if module is deactivated
                
                // Rotate the placeholder orb slowly
                if (this.placeholderOrb) {
                    this.placeholderOrb.rotation.x += 0.01;
                    this.placeholderOrb.rotation.y += 0.01;
                }
                
                this.renderer.render(this.scene, this.camera);
                this.threeJSAnimationId = requestAnimationFrame(animate);
            };
            
            animate();
        }
        
        /**
         * Deactivate the artwork module
         */
        deactivate() {
            super.deactivate();
            
            console.log('Deactivating 열간 압연 데이터 03: 시계열 구간별 변형 제어값 module');
            
            // Hide wave container COMPLETELY
            const waveContainer = document.getElementById('waveContainer');
            if (waveContainer) {
                waveContainer.classList.remove('active');
                waveContainer.style.display = 'none'; // Force hide
                console.log('Wave container completely hidden');
            }
            
            // Stop wave animation
            if (this.waveAnimationId) {
                cancelAnimationFrame(this.waveAnimationId);
                this.waveAnimationId = null;
            }
            
            // Stop Three.js animation
            if (this.threeJSAnimationId) {
                cancelAnimationFrame(this.threeJSAnimationId);
                this.threeJSAnimationId = null;
            }
            
            // Properly close data overlay if it's open
            if (this.overlayVisible) {
                this.hideDataOverlay();
            }
            
            // Stop data cycling
            this.stopDataCycling();
            
            // Clear canvas completely
            if (this.canvas && this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = 'transparent';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            // Clear Three.js renderer but keep the placeholder orb
            if (this.renderer) {
                this.renderer.clear();
            }
        }
        
        /**
         * Show data overlay
         */
        showDataOverlay() {
            this.overlayVisible = true;
            const overlay = document.getElementById('dataOverlay');
            
            // Initialize with first dataset BEFORE showing overlay
            this.updateOverlayData();
            
            overlay.classList.add('active');
            this.startDataCycling();
        }
        
        /**
         * Hide data overlay
         */
        hideDataOverlay() {
            this.overlayVisible = false;
            const overlay = document.getElementById('dataOverlay');
            overlay.classList.remove('active');
            this.stopDataCycling();
        }
        
        /**
         * Cycle to next dataset
         */
        cycleToNextDataset() {
            this.currentDataset = (this.currentDataset + 1) % 4;
            this.updateOverlayData();
        }
        
        
        /**
         * Start data cycling
         */
        startDataCycling() {
            if (this.dataUpdateInterval) return;
            
            this.dataUpdateInterval = setInterval(() => {
                this.updateDynamicData();
            }, 150); // Update every 150ms for rapid cycling
        }
        
        /**
         * Stop data cycling
         */
        stopDataCycling() {
            if (this.dataUpdateInterval) {
                clearInterval(this.dataUpdateInterval);
                this.dataUpdateInterval = null;
            }
        }
        
        /**
         * Update dynamic data
         */
        updateDynamicData() {
            const datasets = [
                { title: 'Core<br>Efficiency', unit: '%', baseValue: 87.3, range: 15 },
                { title: 'Network<br>Load', unit: '%', baseValue: 64.2, range: 20 },
                { title: 'Active<br>Corrections', unit: '', baseValue: 142, range: 30 },
                { title: 'Data<br>Integrity', unit: '%', baseValue: 91.8, range: 8 }
            ];
            
            const dataset = datasets[this.currentDataset];
            const variation = (Math.random() - 0.5) * dataset.range;
            let newValue = dataset.baseValue + variation;
            
            // Format the value appropriately
            if (dataset.unit === '%') {
                newValue = Math.max(0, Math.min(100, newValue));
                document.getElementById('metricValue').textContent = newValue.toFixed(1);
            } else {
                newValue = Math.max(0, newValue);
                document.getElementById('metricValue').textContent = Math.round(newValue);
            }
        }
        
        /**
         * Show data when data button is clicked
         */
        showData() {
            this.toggleDataOverlay();
        }
        
        /**
         * Toggle data overlay
         */
        toggleDataOverlay() {
            if (this.overlayVisible) {
                this.hideDataOverlay();
            } else {
                this.showDataOverlay();
            }
        }
        
        /**
         * Handle canvas click for data overlay
         */
        handleCanvasClick(event, canvas) {
            // Toggle data overlay or cycle through datasets
            if (this.overlayVisible) {
                this.cycleToNextDataset();
            } else {
                this.showDataOverlay();
            }
        }
        
        /**
         * Show data overlay
         */
        showDataOverlay() {
            this.overlayVisible = true;
            const overlay = document.getElementById('dataOverlay');
            
            // Initialize with first dataset BEFORE showing overlay
            this.updateOverlayData();
            
            overlay.classList.add('active');
            this.startDataCycling();
        }
        
        /**
         * Hide data overlay
         */
        hideDataOverlay() {
            this.overlayVisible = false;
            const overlay = document.getElementById('dataOverlay');
            overlay.classList.remove('active');
            this.stopDataCycling();
        }
        
        /**
         * Cycle to next dataset
         */
        cycleToNextDataset() {
            this.currentDataset = (this.currentDataset + 1) % 4;
            this.updateOverlayData();
        }
        
        /**
         * Update overlay data
         */
        updateOverlayData() {
            const datasets = [
                { title: 'Strain<br>Rate', unit: '/s', getValue: (data) => data.strain_rate },
                { title: 'Flow<br>Stress', unit: 'MPa', getValue: (data) => data.flow_stress },
                { title: 'Total<br>Deformation', unit: 'mm', getValue: (data) => data.total_deformation },
                { title: 'Grain<br>Size', unit: 'μm', getValue: (data) => data.grain_size }
            ];
            
            const dataset = datasets[this.currentDataset];
            const currentData = this.sampleDeformationData[Math.floor(Math.random() * this.sampleDeformationData.length)];
            const value = dataset.getValue(currentData);
            
            const metricLabel = document.getElementById('metricLabel');
            const metricUnit = document.getElementById('metricUnit');
            const metricValue = document.getElementById('metricValue');
            const additionalInfo = document.getElementById('additionalInfo');
            
            if (metricLabel) metricLabel.innerHTML = dataset.title;
            if (metricUnit) metricUnit.textContent = dataset.unit;
            if (metricValue) metricValue.textContent = value.toFixed(dataset.unit === '/s' ? 3 : 1);
            
            // Update additional info with material and temperature (if element exists)
            if (additionalInfo) {
                additionalInfo.innerHTML = 
                    `Step: ${currentData.simulation_step}<br>` +
                    `Material: ${currentData.material_type}<br>` +
                    `Temperature: ${currentData.temperature}°C`;
            }
        }
        
        /**
         * Start data cycling
         */
        startDataCycling() {
            if (this.dataUpdateInterval) return;
            
            this.dataUpdateInterval = setInterval(() => {
                this.updateDynamicData();
            }, 150);
        }
        
        /**
         * Stop data cycling
         */
        stopDataCycling() {
            if (this.dataUpdateInterval) {
                clearInterval(this.dataUpdateInterval);
                this.dataUpdateInterval = null;
            }
        }
        
        /**
         * Update dynamic data using actual deformation calculations
         */
        updateDynamicData() {
            // Get random data point from actual deformation dataset
            const dataPoint = this.sampleDeformationData[Math.floor(Math.random() * this.sampleDeformationData.length)];
            const variation = (Math.random() - 0.5) * 0.1; // Same variation as artwork3.html
            
            const datasets = [
                { 
                    title: 'Strain<br>Rate', 
                    unit: '/s', 
                    getValue: () => Math.max(0.05, dataPoint.strain_rate + variation),
                    precision: 3
                },
                { 
                    title: 'Flow<br>Stress', 
                    unit: 'MPa', 
                    getValue: () => Math.max(100, dataPoint.flow_stress + variation * 50),
                    precision: 1
                },
                { 
                    title: 'Total<br>Deformation', 
                    unit: 'mm', 
                    getValue: () => Math.max(0, dataPoint.total_deformation + variation * 2),
                    precision: 2
                },
                { 
                    title: 'Grain<br>Size', 
                    unit: 'μm', 
                    getValue: () => Math.max(20, dataPoint.grain_size + variation * 10),
                    precision: 1
                }
            ];
            
            const dataset = datasets[this.currentDataset];
            const newValue = dataset.getValue();
            
            const metricValue = document.getElementById('metricValue');
            const additionalInfo = document.getElementById('additionalInfo');
            
            if (metricValue) {
                metricValue.textContent = newValue.toFixed(dataset.precision);
            }
            
            // Update additional info with current data point (if element exists)
            if (additionalInfo) {
                additionalInfo.innerHTML = 
                    `Step: ${dataPoint.simulation_step}<br>` +
                    `Material: ${dataPoint.material_type}<br>` +
                    `Temperature: ${dataPoint.temperature}°C`;
            }
        }
        
        /**
         * Show data when data button is clicked
         */
        showData() {
            this.toggleDataOverlay();
        }
        
        /**
         * Toggle data overlay
         */
        toggleDataOverlay() {
            if (this.overlayVisible) {
                this.hideDataOverlay();
            } else {
                this.showDataOverlay();
            }
        }
        
        /**
         * Clean up resources when module is unloaded
         */
        cleanup() {
            super.cleanup();
            
            console.log('Cleaning up 열간 압연 데이터 03: 시계열 구간별 변형 제어값 module');
            
            // Stop data cycling if active
            this.stopDataCycling();
            
            // Stop wave animation
            if (this.waveAnimationId) {
                cancelAnimationFrame(this.waveAnimationId);
                this.waveAnimationId = null;
            }
            
            // Remove event listeners
            window.removeEventListener('resize', this.onWindowResize.bind(this));
            
            // Remove canvas event listeners (if they exist)
            const waveCanvas = document.getElementById('waveCanvas');
            if (waveCanvas && this.onCanvasClick) {
                waveCanvas.removeEventListener('click', this.onCanvasClick.bind(this));
            }
            if (waveCanvas && this.onCanvasTouch) {
                waveCanvas.removeEventListener('touchstart', this.onCanvasTouch.bind(this));
            }
            
            // Clear canvas
            if (this.canvas && this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            // Clear scene (Three.js cleanup)
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
            
            // Clean up audio
            if (this.artworkAudio) {
                this.artworkAudio.pause();
                this.artworkAudio = null;
            }
            
            if (this.audioProgressInterval) {
                clearInterval(this.audioProgressInterval);
                this.audioProgressInterval = null;
            }
            
            // Remove audio progress bar
            const progressBar = document.getElementById('artwork3AudioProgress');
            if (progressBar) {
                progressBar.remove();
            }
            
            // Dispose renderer
            if (this.renderer) {
                this.renderer.dispose();
                this.renderer = null;
            }
            
            this.scene = null;
            this.camera = null;
            this.canvas = null;
            this.ctx = null;
        }

        /**
         * Override base class setupControlButtons to use artwork3 audio
         */
        setupControlButtons() {
            console.log('[ARTWORK3] Setting up control buttons with custom audio handling');
            
            // Set up audio button (AR controls button, not main synth button)
            const audioButton = document.getElementById('audioBtn');
            if (audioButton) {
                console.log('[ARTWORK3] Found AR audio button, setting up artwork3 audio');
                audioButton.addEventListener('click', () => {
                    this.toggleArtworkAudio();
                });
            } else {
                console.warn('[ARTWORK3] AR audio button (audioBtn) not found');
            }
            
            // Set up other control buttons normally
            const dataButton = document.getElementById('dataBtn');
            if (dataButton) {
                dataButton.addEventListener('click', () => {
                    this.showData();
                });
            }
            
            const closeOverlayButton = document.getElementById('overlayClose');
            if (closeOverlayButton) {
                closeOverlayButton.addEventListener('click', () => {
                    this.hideDataOverlay();
                });
            }
        }

        /**
         * Initialize artwork audio
         */
        initializeArtworkAudio() {
            console.log('[ARTWORK3] Initializing artwork audio');
            
            this.artworkAudio = new Audio('https://heund.github.io/comp_ea/shared/sounds/artwork3.wav');
            this.artworkAudio.preload = 'auto';
            this.artworkAudio.loop = false;

            // Register with global audio manager
            if (this.globalAudioManager) {
                this.globalAudioManager.registerAudio(this.audioId, this.artworkAudio, 'element');
                console.log('[ARTWORK3] Audio registered with Global Audio Manager');
            }

            this.artworkAudio.addEventListener('loadedmetadata', () => {
                console.log('[ARTWORK3] Audio metadata loaded, duration:', this.artworkAudio.duration);
            });

            this.artworkAudio.addEventListener('timeupdate', () => {
                this.updateAudioProgress();
            });

            this.artworkAudio.addEventListener('ended', () => {
                this.stopArtworkAudio();
            });
            
            console.log('[ARTWORK3] Artwork audio initialized');
        }

        /**
         * Toggle artwork audio playback
         */
        toggleArtworkAudio() {
            console.log('[ARTWORK3] toggleArtworkAudio called, isAudioPlaying:', this.isAudioPlaying);
            
            if (!this.artworkAudio) {
                console.error('[ARTWORK3] No artwork audio element found');
                return;
            }

            if (this.isAudioPlaying) {
                this.stopArtworkAudio();
            } else {
                this.playArtworkAudio();
            }
        }

        /**
         * Play artwork audio and show progress bar
         */
        playArtworkAudio() {
            if (!this.artworkAudio) {
                console.error('[ARTWORK3] No artwork audio element found');
                return;
            }

            console.log('[ARTWORK3] Attempting to play audio via Global Audio Manager...');
            
            if (this.globalAudioManager) {
                // Use global audio manager to play (this will stop all other audio first)
                this.globalAudioManager.playAudio(this.audioId);
                this.isAudioPlaying = true;
                console.log('[ARTWORK3] Artwork audio started via Global Audio Manager');
                
                // Show progress bar and update button
                this.showAudioProgress();
                this.updateAudioButton();
            } else {
                // Fallback to direct play
                this.artworkAudio.play().then(() => {
                    this.isAudioPlaying = true;
                    console.log('[ARTWORK3] Artwork audio started successfully (fallback)');
                    
                    // Show progress bar and update button
                    this.showAudioProgress();
                    this.updateAudioButton();
                }).catch(error => {
                    console.error('[ARTWORK3] Error playing artwork audio:', error);
                });
            }
        }

        /**
         * Stop artwork audio and hide progress bar
         */
        stopArtworkAudio() {
            if (!this.artworkAudio) return;

            if (this.globalAudioManager) {
                this.globalAudioManager.stopAudio(this.audioId);
                console.log('[ARTWORK3] Artwork audio stopped via Global Audio Manager');
            } else {
                this.artworkAudio.pause();
                this.artworkAudio.currentTime = 0;
                console.log('[ARTWORK3] Artwork audio stopped (fallback)');
            }
            
            this.isAudioPlaying = false;
            
            // Hide progress bar and update button
            this.hideAudioProgress();
            this.updateAudioButton();
        }

        /**
         * Update audio progress bar
         */
        updateAudioProgress() {
            if (!this.artworkAudio) return;

            const progressFill = document.getElementById('artwork3ProgressFill');
            const timeDisplay = document.getElementById('artwork3AudioTime');
            
            if (progressFill && this.artworkAudio.duration) {
                const progress = (this.artworkAudio.currentTime / this.artworkAudio.duration) * 100;
                progressFill.style.width = `${progress}%`;
            }
            
            if (timeDisplay) {
                const currentTime = this.formatTime(this.artworkAudio.currentTime || 0);
                const duration = this.formatTime(this.artworkAudio.duration || 0);
                timeDisplay.textContent = `${currentTime} / ${duration}`;
            }
        }

        /**
         * Format time in MM:SS format
         */
        formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }

        /**
         * Show audio progress bar
         */
        showAudioProgress() {
            const progressBar = document.getElementById('artwork3AudioProgress');
            if (progressBar) {
                progressBar.classList.add('visible');
                console.log('[ARTWORK3] Audio progress bar shown');
            }
        }

        /**
         * Hide audio progress bar
         */
        hideAudioProgress() {
            const progressBar = document.getElementById('artwork3AudioProgress');
            if (progressBar) {
                progressBar.classList.remove('visible');
                console.log('[ARTWORK3] Audio progress bar hidden');
            }
        }

        /**
         * Update audio button appearance
         */
        updateAudioButton() {
            const audioBtn = document.getElementById('audioBtn');
            if (audioBtn) {
                const icon = audioBtn.querySelector('i');
                if (icon) {
                    if (this.isAudioPlaying) {
                        icon.className = 'bi bi-pause-fill';
                        audioBtn.classList.add('active');
                    } else {
                        icon.className = 'bi bi-volume-up-fill';
                        audioBtn.classList.remove('active');
                    }
                }
                console.log('[ARTWORK3] Audio button updated, playing:', this.isAudioPlaying);
            }
        }

        /**
         * Create audio progress bar HTML and CSS
         */
        createAudioProgressBar() {
            console.log('[ARTWORK3] Creating audio progress bar');
            
            // Create CSS styles
            const style = document.createElement('style');
            style.textContent = `
                /* Audio Progress Bar for Artwork3 */
                .artwork3-audio-progress-container {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 300px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 12px 16px;
                    z-index: 1003;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                
                .artwork3-audio-progress-container.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .artwork3-audio-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .artwork3-audio-title {
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: 500;
                }
                
                .artwork3-audio-time {
                    font-size: 11px;
                    color: #ffffff;
                    font-family: 'Inter', sans-serif;
                }
                
                .artwork3-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .artwork3-progress-fill {
                    height: 100%;
                    background: #ffffff;
                    border-radius: 2px;
                    width: 0%;
                    transition: width 0.1s ease;
                }
            `;
            document.head.appendChild(style);
            
            // Create HTML structure
            const progressContainer = document.createElement('div');
            progressContainer.className = 'artwork3-audio-progress-container';
            progressContainer.id = 'artwork3AudioProgress';
            progressContainer.innerHTML = `
                <div class="artwork3-audio-info">
                    <div class="artwork3-audio-title">열간 압연 데이터 03: 시계열 구간별 변형 제어값</div>
                    <div class="artwork3-audio-time" id="artwork3AudioTime">0:00 / 0:00</div>
                </div>
                <div class="artwork3-progress-bar">
                    <div class="artwork3-progress-fill" id="artwork3ProgressFill"></div>
                </div>
            `;
            
            document.body.appendChild(progressContainer);
            console.log('[ARTWORK3] Audio progress bar created');
        }
    }
    
    // Register this class with the global scope
    window.Artwork3 = Artwork3;
    
    } // End of if statement checking for existing class
    