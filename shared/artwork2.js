/**
 * 열간 압연 데이터 02: 압연 효율 분포 Module
 * 
 * AR artwork module that creates a compression spheres visualization.
 * This module visualizes compression data using floating spheres.
 */

// Only define the class if it doesn't already exist
if (typeof window.Artwork2 === 'undefined') {

    class Artwork2 extends ArtworkModule {
        /**
         * Constructor for the ArtworkTemplate module
         * @param {HTMLElement} container - The container element where the artwork will be rendered
         * @param {Object} options - Configuration options for the module
         */
        constructor(container, options = {}) {
            super(container, options);
            
            // Default title
            this.title = options.title || '열간 압연 데이터 02: 압연 효율 분포';
            
            // Three.js objects
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.animationFrame = null;
            
            // Compression spheres objects
            this.compressionSpheres = [];
            this.centralCore = null;
            this.dataFlowPulses = [];
            this.dataFlowInterval = null;
            
            // Data overlay properties
            this.overlayVisible = false;
            this.currentDataset = 0;
            this.dataUpdateInterval = null;
            this.dataRevealed = false;
            
            // Mouse interaction
            this.mouse = new THREE.Vector2();
            this.raycaster = new THREE.Raycaster();
            this.previousTouchDistance = 0;
            
            // Animation properties
            this.isAnimating = false;
            this.colorSchemeIndex = 0;
            
            // Data overlay system
            this.overlayVisible = false;
            this.currentDataset = 0;
            this.dataUpdateInterval = null;
            
            // Color schemes for compression spheres
            this.colorSchemes = [
                { name: 'CompressionBlues', colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'] },
                { name: 'CompressionGreys', colors: ['#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'] },
                { name: 'CompressionCyan', colors: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064'] },
                { name: 'CompressionTeal', colors: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B', '#00695C', '#004D40'] }
            ];
            
            // Sample data for compression visualization
            this.sampleData = [
                {compression_ratio: 0.73, temperature: 850, pressure: 12.5, efficiency: 0.89},
                {compression_ratio: 0.68, temperature: 860, pressure: 13.2, efficiency: 0.92},
                {compression_ratio: 0.76, temperature: 845, pressure: 11.8, efficiency: 0.87},
                {compression_ratio: 0.71, temperature: 855, pressure: 12.8, efficiency: 0.90},
                {compression_ratio: 0.74, temperature: 852, pressure: 12.3, efficiency: 0.88}
            ];
            
            // Data for overlay
            this.dataPoints = [
                { label: 'Rolling Force', value: 95.8, unit: 'kN' },
                { label: 'Compression', value: 73.3, unit: '%' },
                { label: 'Process Efficiency', value: 89.2, unit: '%' },
                { label: 'Material Flow', value: 94.1, unit: '%' }
            ];
            
            // Pulse geometry and material
            this.pulseGeometry = null;
            this.pulseMaterial = null;
            
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
            
            console.log('Initializing 열간압연 데이터 02: 압연 압력 시각화 module');
            
            // Set up Three.js scene
            this.setupScene();
            
            // Set up UI
            this.setupUI(this.title);
            
            // Initialize sample data for spheres
            this.initializeSampleData();
            
            // Create compression spheres visualization
            this.createCompressionVisualization();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize and set up data overlay
            this.initializeDataOverlay();
            this.setupDataOverlayListeners();
            
            // Set up mouse controls
            this.setupMouseControls();
            
            // Initialize artwork audio
            this.initializeArtworkAudio();
            
            // Create audio progress bar
            this.createAudioProgressBar();
            
            // Start animation loop
            this.animate();
            
            console.log('연간압연 데이터 02: 압연 압력 시각화 module initialized');
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
            this.registerEventListener(canvas, 'mousedown', this.onMouseDown.bind(this));
            this.registerEventListener(document, 'mousemove', this.onMouseMove.bind(this));
            this.registerEventListener(document, 'mouseup', this.onMouseUp.bind(this));
            
            // Touch events for mobile - need passive: false for preventDefault
            // Store bound functions for proper cleanup
            this.boundTouchStart = this.onTouchStart.bind(this);
            this.boundTouchMove = this.onTouchMove.bind(this);
            this.boundTouchEnd = this.onTouchEnd.bind(this);
            
            canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
            document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
            document.addEventListener('touchend', this.boundTouchEnd, { passive: false });
            
            // Mouse wheel for zoom
            this.registerEventListener(canvas, 'wheel', this.onMouseWheel.bind(this));
            
            // Window resize event
            this.registerEventListener(window, 'resize', this.onWindowResize.bind(this));
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
            this.scene.background = null; // Transparent background
            
            // Camera setup with dynamic scaling for different devices
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            
            // Calculate scale factor based on viewport size
            const minDimension = Math.min(width, height);
            const scaleFactor = this.calculateScaleFactor(minDimension);
            
            // Apply camera positioning with increased distance to show the entire structure
            // Using isometric view position but at a much greater distance
            this.camera.position.set(60, 40, 60);
            this.camera.lookAt(0, 0, 0);
            
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
        }
        
        /**
         * Set up event listeners
         */
        setupEventListeners() {
            // Window resize handler
            this.registerEventListener(window, 'resize', this.onWindowResize.bind(this));
            
            // Exit button is handled by ar_detection.html
        }
        
        /**
         * Show the visualization when AR marker is detected
         */
        showVisualization() {
            const container = document.querySelector('.visualization-container');
            container.classList.add('active');
            
            // Start animation when visualization becomes active
            this.isAnimating = true;
            
            // Fade in AR UI elements when marker is detected
            this.showARInterface();
            
            // Start data flow visualization
            setTimeout(() => {
                this.startDataFlowVisualization();
            }, 1000);
        }
        
        /**
         * Show AR interface elements
         */
        showARInterface() {
            // Fade in AR controls and title
            const arControls = document.querySelector('.ar-controls-container');
            if (arControls) {
                // Immediate activation without delay to match work1.html
                arControls.classList.add('ar-active');
            }
            
            // Fade in audio progress bar if audio is playing
            const audioProgress = document.querySelector('.audio-progress-container');
            if (audioProgress && this.audioPlaying) {
                setTimeout(() => {
                    audioProgress.classList.add('ar-active');
                }, 800); // Staggered appearance
            }
        }
        
        /**
         * Hide AR interface elements
         */
        hideARInterface() {
            // Fade out AR controls and title
            const arControls = document.querySelector('.ar-controls-container');
            if (arControls) {
                arControls.classList.remove('ar-active');
            }
            
            // Fade out audio progress bar
            const audioProgress = document.querySelector('.audio-progress-container');
            if (audioProgress) {
                audioProgress.classList.remove('ar-active');
            }
        }
        
        /**
         * Hide visualization
         */
        hideVisualization() {
            super.hideVisualization();
            
            // Stop data flow visualization
            this.stopDataFlowVisualization();
            
            // Clean up all animation frames and intervals
            this.cleanupAnimations();
        }
        
        /**
         * Activate the artwork module
         */
        activate() {
            super.activate();
            
            console.log('Activating 열간 압연 데이터 02: 압축 알고리즘 시각화 module');
            
            // Reset overlay state when activating
            this.overlayVisible = false;
            
            // Start animation loop if not already running
            if (!this.animationFrameId) {
                this.animate();
            }
        }
        
        /**
         * Deactivate the artwork module
         */
        deactivate() {
            super.deactivate();
            
            console.log('Deactivating 연간압연 데이터 02: 압축 알고리즘 시각화 module');
            
            // Properly close data overlay if it's open
            if (this.overlayVisible) {
                this.hideDataOverlay();
            }
            
            // Ensure data cycling is stopped
            this.stopDataCycling();
            
            // Stop animation loop
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
        
        /**
         * Clean up animations and intervals
         */
        cleanupAnimations() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            this.stopDataCycling();
            
            if (this.dataFlowInterval) {
                clearInterval(this.dataFlowInterval);
                this.dataFlowInterval = null;
            }
            
            // Clear any pulse timers on spheres
            if (this.compressionSpheres) {
                this.compressionSpheres.forEach(sphere => {
                    if (sphere.userData && sphere.userData.pulseTimer) {
                        if (typeof sphere.userData.pulseTimer === 'number') {
                            cancelAnimationFrame(sphere.userData.pulseTimer);
                            clearTimeout(sphere.userData.pulseTimer);
                        }
                        sphere.userData.pulseTimer = null;
                    }
                });
            }
            
            // Reset overlay state without hiding it
            this.overlayVisible = false;
        }
        
        /**
         * Start data flow visualization
         */
        startDataFlowVisualization() {
            // Create pulse geometry and material - brighter and more noticeable
            this.pulseGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            this.pulseMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FFFF, // Bright cyan
                transparent: true,
                opacity: 1.0
            });
            
            // Start creating data flow pulses - optimized frequency
            this.dataFlowInterval = setInterval(() => {
                this.createDataFlowPulse();
            }, 800); // Reduced from 400ms to 800ms for better performance
        }
        
        /**
         * Stop data flow visualization
         */
        stopDataFlowVisualization() {
            if (this.dataFlowInterval) {
                clearInterval(this.dataFlowInterval);
                this.dataFlowInterval = null;
            }
            
            // Remove any existing pulses
            this.dataFlowPulses.forEach(pulse => {
                if (pulse.geometry) pulse.geometry.dispose();
                if (pulse.material) pulse.material.dispose();
                this.scene.remove(pulse);
            });
            this.dataFlowPulses = [];
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
                    
                    // Canvas click handler for sphere interactions
                    canvas.addEventListener('click', (event) => {
                        try {
                            this.handleSphereClick(event, canvas);
                        } catch (error) {
                            console.error('Error handling canvas click:', error);
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
                            
                            // Only trigger click if it was a short tap, not a drag
                            if (!isTouchDragging && touchDuration < 300) {
                                const touch = event.changedTouches[0];
                                const clickEvent = {
                                    clientX: touch.clientX,
                                    clientY: touch.clientY
                                };
                                this.handleSphereClick(clickEvent, canvas);
                            }
                        } catch (error) {
                            console.error('Error handling touch end:', error);
                        }
                    }, { passive: false });
                } else {
                    console.warn('Canvas element not found for data overlay listeners');
                }
                
                if (overlayClose) {
                    this.hideDataOverlayHandler = () => {
                        try {
                            this.hideDataOverlay();
                        } catch (error) {
                            console.error('Error in overlay close handler:', error);
                        }
                    };
                    overlayClose.addEventListener('click', this.hideDataOverlayHandler);
                } else {
                    console.warn('Overlay close button not found');
                }
                
                // Add click handler to the data overlay for cycling through datasets
                const dataOverlay = document.getElementById('dataOverlay');
                if (dataOverlay) {
                    dataOverlay.addEventListener('click', (event) => {
                        try {
                            // Only cycle if click is not on the close button
                            if (!event.target.closest('#overlayClose')) {
                                this.cycleToNextDataset();
                            }
                        } catch (error) {
                            console.error('Error cycling datasets:', error);
                        }
                    });
                }
                
                // Data button functionality is handled by parent class
            } catch (error) {
                console.error('Error setting up data overlay listeners:', error);
            }
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
         * Calculate scale factor based on device size
         */
        calculateScaleFactor(minDimension) {
            // INVERTED LOGIC: Larger scale factor = camera farther away = graphic appears smaller
            if (minDimension >= 768) {
                // iPad size - use original distance
                return 1.0;
            } else if (minDimension >= 414) {
                // Large phone - move camera slightly farther
                return 1.2;
            } else if (minDimension >= 375) {
                // Medium phone - move camera farther
                return 1.3;
            } else {
                // Small phone - move camera farthest away
                return 1.4;
            }
        }
    
        /**
         * Clear any existing visualization elements
         */
        clearVisualization() {
            // Clear compression spheres
            if (this.compressionSpheres && this.compressionSpheres.length > 0) {
                this.compressionSpheres.forEach(sphere => {
                    if (sphere.geometry) sphere.geometry.dispose();
                    if (sphere.material) sphere.material.dispose();
                    this.scene.remove(sphere);
                });
                this.compressionSpheres = [];
            }
            
            // Clear central core
            if (this.centralCore) {
                this.scene.remove(this.centralCore);
                if (this.centralCore.geometry) this.centralCore.geometry.dispose();
                if (this.centralCore.material) this.centralCore.material.dispose();
                this.centralCore = null;
            }
            
            // Clear data flow pulses
            if (this.dataFlowPulses && this.dataFlowPulses.length > 0) {
                this.dataFlowPulses.forEach(pulse => {
                    if (pulse.geometry) pulse.geometry.dispose();
                    if (pulse.material) pulse.material.dispose();
                    this.scene.remove(pulse);
                });
                this.dataFlowPulses = [];
            }
            
            // Stop data flow interval
            if (this.dataFlowInterval) {
                clearInterval(this.dataFlowInterval);
                this.dataFlowInterval = null;
            }
        }
        
        /**
         * Create the compression spheres visualization
         */
        createCompressionVisualization() {
            if (!this.scene) return;
            
            // Clear any existing visualization
            this.clearVisualization();
            
            // Create central core sphere
            const coreGeometry = new THREE.SphereGeometry(8, 32, 32);
            const coreMaterial = new THREE.MeshPhongMaterial({
                color: 0x2196F3,
                emissive: 0x0D47A1,
                emissiveIntensity: 0.5,
                shininess: 50,
                transparent: true,
                opacity: 0.9
            });
            this.centralCore = new THREE.Mesh(coreGeometry, coreMaterial);
            this.scene.add(this.centralCore);
            
            // Add glow effect to core
            const coreGlow = new THREE.Mesh(
                new THREE.SphereGeometry(10, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: 0x4FC3F7,
                    transparent: true,
                    opacity: 0.15
                })
            );
            this.centralCore.add(coreGlow);
            
            // Create compression spheres
            const sphereCount = 12;
            const colors = this.colorSchemes[this.colorSchemeIndex].colors;
            
            // Create spheres in a circular pattern
            for (let i = 0; i < sphereCount; i++) {
                const angle = (i / sphereCount) * Math.PI * 2;
                const radius = 30 + Math.random() * 10;
                
                const x = Math.cos(angle) * radius;
                const y = (Math.random() - 0.5) * 40; // Distribute vertically
                const z = Math.sin(angle) * radius;
                
                // Size based on data
                const dataIndex = i % this.sampleData.length;
                const data = this.sampleData[dataIndex];
                const size = 3 + (data.compression_ratio * 5);
                
                // Color based on temperature/pressure
                const colorIndex = Math.floor((data.pressure / 15) * (colors.length - 1));
                const color = new THREE.Color(colors[colorIndex]);
                
                // Create sphere geometry and material
                const sphereGeometry = new THREE.SphereGeometry(size, 24, 24);
                const sphereMaterial = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color.clone().multiplyScalar(0.3),
                    transparent: true,
                    opacity: 0.8,
                    shininess: 30
                });
                
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(x, y, z);
                sphere.userData = {
                    isCompressionSphere: true,
                    index: i,
                    originalColor: color.clone(),
                    originalPosition: new THREE.Vector3(x, y, z),
                    originalScale: 1.0,
                    dataIndex: dataIndex,
                    compressionData: data,
                    pulseActive: false,
                    highlightActive: false
                };
                
                // Add glow effect
                const glowSize = size * 1.3;
                const glow = new THREE.Mesh(
                    new THREE.SphereGeometry(glowSize, 24, 24),
                    new THREE.MeshBasicMaterial({
                        color: color.clone().multiplyScalar(1.5),
                        transparent: true,
                        opacity: 0.15
                    })
                );
                sphere.add(glow);
                
                this.compressionSpheres.push(sphere);
                this.scene.add(sphere);
            }
            
            // Create pulse geometry and material for data flow visualization
            this.pulseGeometry = new THREE.SphereGeometry(1, 16, 16);
            this.pulseMaterial = new THREE.MeshBasicMaterial({
                color: 0x4FC3F7,
                transparent: true,
                opacity: 0.7
            });
            
            // Start data flow visualization
            this.startDataFlow();
        }
        
        /**
         * Setup mouse and touch controls
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
         * Reset camera to original position
         */
        resetCameraPosition() {
            // Reset to original camera position and angle - at a greater distance to show the entire structure
            this.camera.position.set(60, 40, 60);
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
         * Animation loop
         */
        animate() {
            // Store animation frame ID so we can cancel it later
            this.animationFrameId = requestAnimationFrame(() => this.animate());
            
            if (this.isAnimating) {
                const time = Date.now() * 0.001;
                
                // Simple floating animation for compression spheres
                this.compressionSpheres.forEach((sphere, i) => {
                    const userData = sphere.userData;
                    const animationTime = time + userData.animationOffset;
                    
                    // Gentle floating motion - simple up and down movement
                    const floatY = Math.sin(animationTime * 0.5 + i * 0.1) * 0.8;
                    const floatX = Math.cos(animationTime * 0.3 + i * 0.15) * 0.4;
                    
                    sphere.position.x = userData.originalPosition.x + floatX;
                    sphere.position.y = userData.originalPosition.y + floatY;
                    sphere.position.z = userData.originalPosition.z;
                    
                    // Gentle pulsing based on efficiency
                    const pulse = 1 + Math.sin(animationTime * 1.5 + i * 0.2) * 0.1 * userData.efficiency;
                    sphere.scale.set(pulse, pulse, pulse);
                });
            }
            
            // Update data flow pulses
            this.updateDataFlowPulses();
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        /**
         * Handle window resize
         */
        onWindowResize() {
            if (!this.camera || !this.renderer) return;
            
            // Get the actual container dimensions (not window dimensions)
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            const container = canvas.parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            // Recalculate camera position for new dimensions
            const minDimension = Math.min(width, height);
            const scaleFactor = this.calculateScaleFactor(minDimension);
            
            // Update camera aspect ratio
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            
            // We don't need to change camera position on resize
            // The isometric view position is maintained
            // Only update the aspect ratio and renderer size
            
            // Update renderer size
            this.renderer.setSize(width, height);
            
            // Force a render to apply changes immediately
            if (this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        
        /**
         * Start data flow visualization
         */
        startDataFlow() {
            // Clear any existing interval
            if (this.dataFlowInterval) {
                clearInterval(this.dataFlowInterval);
            }
            
            // Create data flow pulses at regular intervals
            this.dataFlowInterval = setInterval(() => {
                // Select a random sphere as source
                const sourceIndex = Math.floor(Math.random() * this.compressionSpheres.length);
                const sourceSphere = this.compressionSpheres[sourceIndex];
                
                // Create a pulse from the sphere to the central core
                this.createDataPulse(sourceSphere);
            }, 2000); // Create a new pulse every 2 seconds
        }
        
        /**
         * Create a data pulse from a sphere to the central core
         * @param {THREE.Mesh} sourceSphere - The source sphere for the pulse
         */
        createDataPulse(sourceSphere) {
            if (!this.scene || !this.centralCore || !this.pulseGeometry || !this.pulseMaterial) return;
            
            const pulse = new THREE.Mesh(this.pulseGeometry, this.pulseMaterial.clone());
            pulse.position.copy(sourceSphere.position);
            
            // Store the start position and target position
            pulse.userData = {
                startTime: Date.now(),
                duration: 1500, // 1.5 seconds
                startPosition: sourceSphere.position.clone(),
                targetPosition: this.centralCore.position.clone(),
                sourceIndex: sourceSphere.userData.index
            };
            
            this.dataFlowPulses.push(pulse);
            this.scene.add(pulse);
            
            // Highlight the source sphere
            this.highlightSphere(sourceSphere);
        }
        
        /**
         * Update data flow pulses
         */
        updateDataFlowPulses() {
            const now = Date.now();
            const pulsesToRemove = [];
            
            this.dataFlowPulses.forEach(pulse => {
                const data = pulse.userData;
                const elapsed = now - data.startTime;
                const progress = Math.min(elapsed / data.duration, 1.0);
                
                if (progress < 1.0) {
                    // Update position along the path
                    pulse.position.lerpVectors(data.startPosition, data.targetPosition, progress);
                    
                    // Scale down as it approaches the target
                    const scale = 1.0 - (progress * 0.7);
                    pulse.scale.set(scale, scale, scale);
                    
                    // Fade out as it approaches the target
                    pulse.material.opacity = 0.7 * (1.0 - progress);
                } else {
                    // Mark for removal when animation is complete
                    pulsesToRemove.push(pulse);
                }
            });
            
            // Remove completed pulses
            pulsesToRemove.forEach(pulse => {
                this.scene.remove(pulse);
                if (pulse.geometry) pulse.geometry.dispose();
                if (pulse.material) pulse.material.dispose();
                
                const index = this.dataFlowPulses.indexOf(pulse);
                if (index !== -1) {
                    this.dataFlowPulses.splice(index, 1);
                }
            });
        }
        
        /**
         * Highlight a compression sphere
         * @param {THREE.Mesh} sphere - The sphere to highlight
         */
        highlightSphere(sphere) {
            if (!sphere || !sphere.userData || !sphere.userData.isCompressionSphere) return;
            
            // Reset any previously highlighted spheres
            this.compressionSpheres.forEach(s => {
                if (s.userData.highlightActive && s !== sphere) {
                    s.material.emissive.copy(s.userData.originalColor).multiplyScalar(0.3);
                    s.material.opacity = 0.8;
                    s.userData.highlightActive = false;
                    
                    // Reset scale of previously highlighted spheres
                    if (s.userData.originalScale) {
                        s.scale.set(
                            s.userData.originalScale,
                            s.userData.originalScale,
                            s.userData.originalScale
                        );
                    }
                    
                    // Clear any animation timers
                    if (s.userData.pulseTimer) {
                        clearTimeout(s.userData.pulseTimer);
                        s.userData.pulseTimer = null;
                    }
                }
            });
            
            // Highlight this sphere
            sphere.material.emissive.setHex(0x88CCFF);
            sphere.material.opacity = 1.0;
            sphere.userData.highlightActive = true;
            
            // Add a temporary pulse effect using standard JS animations
            const originalScale = sphere.userData.originalScale || 1.0;
            
            // Store original scale if not already stored
            if (!sphere.userData.originalScale) {
                sphere.userData.originalScale = originalScale;
            }
            
            // Pulse up function - expand the sphere
            const pulseUp = () => {
                const targetScale = originalScale * 1.3;
                const startScale = originalScale;
                const duration = 300; // 300ms
                const startTime = Date.now();
                
                // Animation function
                const animatePulseUp = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1.0);
                    
                    // Ease in-out function for smoother animation
                    const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    // Calculate current scale
                    const currentScale = startScale + (targetScale - startScale) * easeProgress;
                    
                    // Apply scale
                    sphere.scale.set(currentScale, currentScale, currentScale);
                    
                    if (progress < 1.0) {
                        // Continue animation
                        sphere.userData.pulseTimer = requestAnimationFrame(animatePulseUp);
                    } else {
                        // Animation complete, start pulse down
                        sphere.userData.pulseTimer = setTimeout(pulseDown, 10);
                    }
                };
                
                // Start animation
                sphere.userData.pulseTimer = requestAnimationFrame(animatePulseUp);
            };
            
            // Pulse down function - return to original size
            const pulseDown = () => {
                const targetScale = originalScale;
                const startScale = originalScale * 1.3;
                const duration = 300; // 300ms
                const startTime = Date.now();
                
                // Animation function
                const animatePulseDown = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1.0);
                    
                    // Ease in-out function for smoother animation
                    const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    // Calculate current scale
                    const currentScale = startScale + (targetScale - startScale) * easeProgress;
                    
                    // Apply scale
                    sphere.scale.set(currentScale, currentScale, currentScale);
                    
                    if (progress < 1.0) {
                        // Continue animation
                        sphere.userData.pulseTimer = requestAnimationFrame(animatePulseDown);
                    } else {
                        // Animation complete
                        sphere.userData.pulseTimer = null;
                    }
                };
                
                // Start animation
                sphere.userData.pulseTimer = requestAnimationFrame(animatePulseDown);
            };
            
            // Start the pulse animation
            pulseUp();
        }
        
        /**
         * Show data for a compression sphere
         * @param {THREE.Mesh} sphere - The sphere to show data for
         */
        showSphereData(sphere) {
            if (!sphere || !sphere.userData || !sphere.userData.isCompressionSphere) return;
            
            const data = sphere.userData.compressionData;
            if (!data) return;
            
            // Update data overlay with sphere data
            this.updateDataOverlay([
                { label: 'Compression', value: (data.compression_ratio * 100).toFixed(1), unit: '%' },
                { label: 'Temperature', value: data.temperature, unit: '°C' },
                { label: 'Pressure', value: data.pressure.toFixed(1), unit: 'MPa' },
                { label: 'Efficiency', value: (data.efficiency * 100).toFixed(1), unit: '%' }
            ]);
        }
        
        /**
         * Handle sphere click for data interaction
         */
        handleSphereClick(event, canvas) {
            // Check if camera exists before proceeding
            if (!this.camera) {
                console.warn('Camera not initialized for node click handling');
                return;
            }
            
            // Calculate mouse position in normalized device coordinates
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            try {
                // Update the picking ray with the camera and mouse position
                this.raycaster.setFromCamera(this.mouse, this.camera);
                
                // Get all clickable objects in the scene (compression spheres)
                const clickableObjects = [];
                this.scene.traverse((child) => {
                    // Include mesh objects (compression spheres)
                    if (child.isMesh && child.userData && child.userData.isCompressionSphere) {
                        clickableObjects.push(child);
                    }
                });
                
                // Calculate objects intersecting the picking ray
                const intersects = this.raycaster.intersectObjects(clickableObjects);
                
                if (intersects.length > 0) {
                    const intersection = intersects[0];
                    const object = intersection.object;
                    
                    // Check if it's a compression sphere
                    if (object.userData && object.userData.isCompressionSphere) {
                        try {
                            // If data overlay is already visible, cycle to next dataset
                            if (this.overlayVisible) {
                                this.cycleToNextDataset();
                            } else {
                                // Otherwise, show data for the sphere and initialize
                                this.showSphereData(object);
                            }
                            
                            // Highlight the clicked sphere
                            this.highlightSphere(object);
                        } catch (error) {
                            console.error('Error in sphere click handling:', error);
                        }
                        
                        // Show data overlay if not already visible
                        if (!this.overlayVisible) {
                            this.showDataOverlay();
                        }
                    }
                }
                // If no sphere was clicked but overlay is visible, also cycle datasets
                else if (this.overlayVisible) {
                    this.cycleToNextDataset();
                }
            } catch (error) {
                console.error('Error in sphere click handling:', error);
            }
        }
        
        /**
         * Show data overlay
         */
        showDataOverlay() {
            this.overlayVisible = true;
            const overlay = document.getElementById('dataOverlay');
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
         * Show data when data button is clicked
         */
        showData() {
            this.toggleDataOverlay();
        }
        
        /**
         * Toggle data overlay visibility
         */
        toggleDataOverlay() {
            if (this.overlayVisible) {
                this.hideDataOverlay();
            } else {
                this.showDataOverlay();
            }
        }
        
        // This method has been moved to avoid duplication
        
        /**
         * Start data cycling
         */
        startDataCycling() {
            if (this.dataUpdateInterval) return;
            
            // Initialize dynamic calculation system
            this.initializeCalculationSystem();
            
            // Start with first metric (Rolling Force)
            this.currentDatasetIndex = 0;
            
            // Store calculation start time for reference
            this.calculationStartTime = Date.now();
            
            // Set up interval for data updates
            this.dataUpdateInterval = setInterval(() => {
                this.updateDataDisplay();
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
         * Initialize calculation system for dynamic data
         */
        initializeCalculationSystem() {
            // Initialize system state parameters
            this.systemState = {
                temperature: 0.5, // 0-1 normalized
                pressure: 0.6,    // 0-1 normalized
                speed: 0.4,       // 0-1 normalized
                efficiency: 0.7   // 0-1 normalized
            };
            
            // Define metrics with formulas - using consistent naming (label and calculate)
            this.metrics = [
                {
                    label: 'Rolling Force',
                    unit: 'kN',
                    baseValue: 95.8,
                    range: 20,
                    calculate: (time, state) => {
                        // Simple baseValue + variation approach like artwork1.js
                        const variation = (Math.random() - 0.5) * this.metrics[0].range;
                        return Math.round(this.metrics[0].baseValue + variation);
                    }
                },
                {
                    label: 'Compression',
                    unit: '%',
                    calculate: (time, state) => {
                        // Formula: base + pressure/speed ratio + efficiency factor + noise
                        return Math.round(25 + (state.pressure / state.speed) * 15 + state.efficiency * 10 + Math.random() * 2);
                    }
                },
                {
                    label: 'Process Efficiency',
                    unit: '%',
                    baseValue: 89.2,
                    variance: 0.3,
                    frequency: 0.6,
                    noiseLevel: 0.08,
                    calculate: (time, state) => {
                        const cyclicVariation = Math.sin(time * this.metrics[2].frequency + Math.PI/4) * this.metrics[2].variance;
                        const temperatureOptimal = 1 - Math.abs(state.temperature - 850) * 0.0001;
                        const speedOptimal = 1 - Math.abs(state.speed - 2.3) * 0.05;
                        const noise = (Math.random() - 0.5) * this.metrics[2].noiseLevel;
                        return (this.metrics[2].baseValue + cyclicVariation) * temperatureOptimal * speedOptimal + noise;
                    }
                },
                {
                    label: 'Material Flow',
                    unit: '%',
                    baseValue: 94.1,
                    variance: 0.25,
                    frequency: 1.5,
                    noiseLevel: 0.06,
                    calculate: (time, state) => {
                        const cyclicVariation = Math.sin(time * this.metrics[3].frequency + Math.PI/2) * this.metrics[3].variance;
                        const speedInfluence = (state.speed - 2.3) * 0.8;
                        const efficiencyInfluence = (state.efficiency - 0.89) * 3;
                        const compressionInfluence = (this.getCurrentCompression() - 73.3) * 0.1;
                        const noise = (Math.random() - 0.5) * this.metrics[3].noiseLevel;
                        return this.metrics[3].baseValue + cyclicVariation + speedInfluence + efficiencyInfluence + compressionInfluence + noise;
                    }
                }
            ];
            
            // Store calculation start time
            this.calculationStartTime = Date.now();
            
            // Initialize with static values instead of evolving parameters
            this.systemState.temperature = 850;
            this.systemState.pressure = 12.5;
            this.systemState.speed = 2.3;
            this.systemState.efficiency = 0.89;
        }
        
        /**
         * Get current compression value for interdependent calculations
         */
        getCurrentCompression() {
            // Helper method to get current compression value for interdependent calculations
            if (this.metrics && this.metrics[1]) {
                const time = (Date.now() - this.calculationStartTime) / 1000;
                
                // Use standardized calculate method
                if (typeof this.metrics[1].calculate === 'function') {
                    return this.metrics[1].calculate(time, this.systemState);
                }
            }
            return 73.3;
        }
        
        /**
         * Initialize sample compression data for spheres
         */
        initializeSampleData() {
            // Sample data for compression spheres
            this.sampleCompressionData = [
                { pressure: 245.8, temperature: 1250.5, efficiency: 87.3, location: 'Zone A' },
                { pressure: 237.2, temperature: 1280.3, efficiency: 89.1, location: 'Zone B' },
                { pressure: 252.6, temperature: 1235.7, efficiency: 86.5, location: 'Zone C' },
                { pressure: 241.9, temperature: 1265.2, efficiency: 88.4, location: 'Zone D' },
                { pressure: 249.3, temperature: 1245.8, efficiency: 87.9, location: 'Zone E' },
                { pressure: 234.7, temperature: 1290.1, efficiency: 90.2, location: 'Zone F' },
                { pressure: 256.4, temperature: 1225.6, efficiency: 85.8, location: 'Zone G' },
                { pressure: 243.5, temperature: 1260.9, efficiency: 88.7, location: 'Zone H' }
            ];
        }
        
        /**
         * Show data for the selected compression sphere
         */
        showSphereData(sphere) {
            // Stop automatic data cycling when a specific sphere is selected
            this.stopDataCycling();
            
            // Make sure calculation system is initialized
            if (!this.metrics || !this.systemState) {
                this.initializeCalculationSystem();
            }
            
            // Get data from the sphere's userData
            const sphereData = sphere.userData;
            const index = sphereData && sphereData.index ? sphereData.index : 0;
            
            // Modify the system state based on the sphere's index to create variation
            // This will influence the metric calculations without directly changing the values
            if (this.systemState) {
                // Each sphere influences the system state differently
                const sphereInfluence = index / 10;
                this.systemState.temperature = 850 + (index * 3) - 6;
                this.systemState.pressure = 12.5 + (sphereInfluence - 0.3);
                this.systemState.speed = 2.3 + (sphereInfluence * 0.2 - 0.1);
                this.systemState.efficiency = 0.89 + (sphereInfluence * 0.05 - 0.025);
            }
            
            // Reset to the first metric (Rolling Force)
            this.currentDatasetIndex = 0;
            
            // Update the display with the current metric
            this.updateDataDisplay();
            
            // Show the data overlay if not already visible
            if (!this.overlayVisible) {
                this.showDataOverlay();
            }
        }
        
        /**
         * Cycle to the next dataset when user interacts with the popup
         */
        cycleToNextDataset() {
            if (this.metrics && this.metrics.length > 0) {
                // Move to next metric in the cycle
                this.currentDatasetIndex = (this.currentDatasetIndex + 1) % this.metrics.length;
                
                // Update display immediately with new metric
                this.updateDataDisplay();
            }
        }
        
        /**
         * Update data display with calculated values from metrics
         */
        updateDataDisplay() {
            const valueElement = document.getElementById('metricValue');
            const unitElement = document.getElementById('metricUnit');
            const labelElement = document.getElementById('metricLabel');
            
            if (valueElement && unitElement && labelElement && this.metrics) {
                const currentMetric = this.metrics[this.currentDatasetIndex];
                const time = (Date.now() - this.calculationStartTime) / 1000;
                
                // Calculate current value using dynamic formula
                let calculatedValue;
                
                // Use standardized calculate method
                if (typeof currentMetric.calculate === 'function') {
                    calculatedValue = currentMetric.calculate(time, this.systemState);
                } else {
                    console.error('No calculation method found for metric:', currentMetric);
                    calculatedValue = 0;
                }
                
                // Format value based on metric type
                let displayValue;
                if (currentMetric.unit === 'kN') {
                    displayValue = Math.round(calculatedValue);
                } else {
                    displayValue = calculatedValue.toFixed(1);
                }
                
                valueElement.textContent = displayValue;
                unitElement.textContent = currentMetric.unit;
                labelElement.textContent = currentMetric.label;
            }
        }
        
        /**
         * Update dynamic data for the multi-item data display (legacy method)
         */
        updateDynamicData() {
            const datasets = [
                { title: '압력<br>Pressure', unit: 'MPa', baseValue: 245.8, range: 30 },
                { title: '온도<br>Temperature', unit: '°C', baseValue: 1250.5, range: 100 },
                { title: '효율성<br>Efficiency', unit: '%', baseValue: 87.3, range: 15 },
                { title: '상태<br>Status', unit: '', baseValue: 0, range: 0 }
            ];
            
            const dataElements = document.querySelectorAll('.data-item');
            if (dataElements.length === datasets.length) {
                dataElements.forEach((element, index) => {
                    const dataset = datasets[index];
                    const titleElement = element.querySelector('.data-title');
                    const valueElement = element.querySelector('.data-value');
                    
                    if (titleElement && valueElement) {
                        titleElement.innerHTML = dataset.title;
                        
                        // Generate a slightly random value around the base
                        if (index !== 3) { // Not for status
                            const randomOffset = (Math.random() * dataset.range * 2) - dataset.range;
                            const value = dataset.baseValue + randomOffset;
                            
                            valueElement.textContent = dataset.unit ? 
                                `${value.toFixed(1)}${dataset.unit}` : 
                                `${Math.round(value)}`;
                        } else {
                            // For status, cycle through different statuses
                            const statuses = ['정상', '가열중', '압축중', '냉각중'];
                            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                            valueElement.textContent = randomStatus;
                        }
                    }
                });
            }
        }
        
        /**
         * Clean up resources when module is unloaded
         */
        cleanup() {
            super.cleanup();
            
            console.log('Cleaning up 연간압연 데이터 02: 압축 알고리즘 시각화 module');
            
            // Stop data cycling if active
            this.stopDataCycling();
            
            // Stop animation loop
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // Event listeners are automatically cleaned up by centralized system
            // But we need to manually clean up touch events that were added with passive: false
            const canvas = document.getElementById('visualizationCanvas');
            if (canvas && this.boundTouchStart) {
                canvas.removeEventListener('touchstart', this.boundTouchStart);
            }
            if (this.boundTouchMove) {
                document.removeEventListener('touchmove', this.boundTouchMove);
            }
            if (this.boundTouchEnd) {
                document.removeEventListener('touchend', this.boundTouchEnd);
            }
            
            // Dispose compression spheres
            if (this.compressionSpheres) {
                this.compressionSpheres.forEach(sphere => {
                    if (sphere.geometry) sphere.geometry.dispose();
                    if (sphere.material) sphere.material.dispose();
                    if (this.scene) this.scene.remove(sphere);
                });
                this.compressionSpheres = [];
            }
            
            // Clear arrays
            this.sampleCompressionData = [];
            this.metrics = [];
            
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
            const progressBar = document.getElementById('artwork2AudioProgress');
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
        }

        /**
         * Override base class setupControlButtons to use artwork2 audio
         */
        setupControlButtons() {
            console.log('[ARTWORK2] Setting up control buttons with custom audio handling');
            
            // Set up audio button (AR controls button, not main synth button)
            const audioButton = document.getElementById('audioBtn');
            if (audioButton) {
                console.log('[ARTWORK2] Found AR audio button, setting up artwork2 audio');
                audioButton.addEventListener('click', () => {
                    this.toggleArtworkAudio();
                });
            } else {
                console.warn('[ARTWORK2] AR audio button (audioBtn) not found');
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
            console.log('[ARTWORK2] Initializing artwork audio');
            
            this.artworkAudio = new Audio('https://heund.github.io/comp_ea/shared/sounds/artwork2.wav');
            this.artworkAudio.preload = 'auto';
            this.artworkAudio.loop = false;

            this.artworkAudio.addEventListener('loadedmetadata', () => {
                console.log('[ARTWORK2] Audio metadata loaded, duration:', this.artworkAudio.duration);
            });

            this.artworkAudio.addEventListener('timeupdate', () => {
                this.updateAudioProgress();
            });

            this.artworkAudio.addEventListener('ended', () => {
                this.stopArtworkAudio();
            });
            
            // Audio button will be set up in setupControlButtons()
            
            console.log('[ARTWORK2] Artwork audio initialized');
        }

        /**
         * Toggle artwork audio playback
         */
        toggleArtworkAudio() {
            console.log('[ARTWORK2] toggleArtworkAudio called, isAudioPlaying:', this.isAudioPlaying);
            
            if (!this.artworkAudio) {
                console.error('[ARTWORK2] No artwork audio element found');
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
                console.error('[ARTWORK2] No artwork audio element found');
                return;
            }

            console.log('[ARTWORK2] Attempting to play audio...');
            this.artworkAudio.play().then(() => {
                this.isAudioPlaying = true;
                console.log('[ARTWORK2] Artwork audio started successfully');
                
                // Show progress bar and update button
                this.showAudioProgress();
                this.updateAudioButton();
            }).catch(error => {
                console.error('[ARTWORK2] Error playing artwork audio:', error);
            });
        }

        /**
         * Stop artwork audio and hide progress bar
         */
        stopArtworkAudio() {
            if (!this.artworkAudio) return;

            this.artworkAudio.pause();
            this.artworkAudio.currentTime = 0;
            this.isAudioPlaying = false;
            
            // Hide progress bar and update button
            this.hideAudioProgress();
            this.updateAudioButton();
            
            console.log('[ARTWORK2] Artwork audio stopped');
        }

        /**
         * Update audio progress bar
         */
        updateAudioProgress() {
            if (!this.artworkAudio) return;

            const progressFill = document.getElementById('artwork2ProgressFill');
            const timeDisplay = document.getElementById('artwork2AudioTime');
            
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
            const progressBar = document.getElementById('artwork2AudioProgress');
            if (progressBar) {
                progressBar.classList.add('visible');
                console.log('[ARTWORK2] Audio progress bar shown');
            }
        }

        /**
         * Hide audio progress bar
         */
        hideAudioProgress() {
            const progressBar = document.getElementById('artwork2AudioProgress');
            if (progressBar) {
                progressBar.classList.remove('visible');
                console.log('[ARTWORK2] Audio progress bar hidden');
            }
        }

        /**
         * Update audio button appearance
         */
        updateAudioButton() {
            const audioBtn = document.getElementById('audioBtn');
            if (audioBtn) {
                const icon = audioBtn.querySelector('i');
                if (this.isAudioPlaying) {
                    icon.className = 'bi bi-pause-fill';
                    audioBtn.classList.add('active');
                } else {
                    icon.className = 'bi bi-volume-up-fill';
                    audioBtn.classList.remove('active');
                }
                console.log('[ARTWORK2] Audio button updated, playing:', this.isAudioPlaying);
            }
        }

        /**
         * Create audio progress bar HTML and CSS
         */
        createAudioProgressBar() {
            console.log('[ARTWORK2] Creating audio progress bar');
            
            // Create CSS styles
            const style = document.createElement('style');
            style.textContent = `
                /* Audio Progress Bar for Artwork2 */
                .artwork2-audio-progress-container {
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
                
                .artwork2-audio-progress-container.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .artwork2-audio-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .artwork2-audio-title {
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: 500;
                }
                
                .artwork2-audio-time {
                    font-size: 11px;
                    color: #ffffff;
                    font-family: 'Inter', sans-serif;
                }
                
                .artwork2-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .artwork2-progress-fill {
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
            progressContainer.className = 'artwork2-audio-progress-container';
            progressContainer.id = 'artwork2AudioProgress';
            progressContainer.innerHTML = `
                <div class="artwork2-audio-info">
                    <div class="artwork2-audio-title">열간 압연 데이터 02: 압연 효율 분포</div>
                    <div class="artwork2-audio-time" id="artwork2AudioTime">0:00 / 0:00</div>
                </div>
                <div class="artwork2-progress-bar">
                    <div class="artwork2-progress-fill" id="artwork2ProgressFill"></div>
                </div>
            `;
            
            document.body.appendChild(progressContainer);
            console.log('[ARTWORK2] Audio progress bar created');
        }
        
    }
    
    // Register this class with the global scope
    window.Artwork2 = Artwork2;
    
    } // End of if statement checking for existing class
    