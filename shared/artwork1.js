/**
 * 열간 압연 데이터 01: 보정 알고리즘 구조 Module
 * 
 * AR artwork module that creates a network graph visualization.
 * This module visualizes a complex network of nodes and connections.
 */

// Only define the class if it doesn't already exist
if (typeof window.Artwork1 === 'undefined') {

    class Artwork1 extends ArtworkModule {
        /**
         * Constructor for the ArtworkTemplate module
         * @param {HTMLElement} container - The container element where the artwork will be rendered
         * @param {Object} options - Configuration options for the module
         */
        constructor(container, options = {}) {
            super(container, options);
            
            // Default title
            this.title = options.title || '열간 압연 데이터 01: 보정 알고리즘 구조';
            
            // Get global audio manager instance
            this.globalAudioManager = window.globalAudioManager || window.GlobalAudioManager?.getInstance();
            this.audioId = 'artwork1';
            
            // Three.js components
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.controls = null;
            
            // Network visualization data
            this.networkGraph = {
                nodes: [],
                edges: []
            };
            
            // 3D objects
            this.networkNodes = [];
            this.networkEdges = [];
            this.centralCore = null;
            
            // Animation
            this.animationId = null;
            this.time = 0;
            
            // Interaction
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            
            // Audio for this artwork
            this.artworkAudio = null;
            this.isAudioPlaying = false;
            this.audioProgressInterval = null;
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
            
            // Sample data for visualization
            this.sampleData = [
                {current_corrections_count: 2, data_integrity: 0.85, correction_effectiveness: 0.78, active_corrections_count: 5},
                {current_corrections_count: 3, data_integrity: 0.92, correction_effectiveness: 0.81, active_corrections_count: 7},
                {current_corrections_count: 1, data_integrity: 0.76, correction_effectiveness: 0.69, active_corrections_count: 3},
                {current_corrections_count: 4, data_integrity: 0.88, correction_effectiveness: 0.85, active_corrections_count: 8},
                {current_corrections_count: 2, data_integrity: 0.91, correction_effectiveness: 0.77, active_corrections_count: 6}
            ];
            
            // Data for overlay
            this.dataPoints = [
                { label: 'Core Efficiency', value: 87.3, unit: '%' },
                { label: 'Network Load', value: 64.2, unit: '%' },
                { label: 'Active Corrections', value: 142, unit: '' },
                { label: 'Data Integrity', value: 91.8, unit: '%' }
            ];
            console.log('Artwork1 constructor completed');
        }

        /**
         * Initialize the artwork module
         */
        initialize() {
            console.log('[ARTWORK1] Starting initialization');
            super.initialize();
            
            // Initialize artwork-specific audio
            this.initializeArtworkAudio();
        
            // Create audio progress bar
            this.createAudioProgressBar();
            
            console.log('Initializing 연간압연 데이터 01: 보정 알고리즘 구조 module');
            
            // Set up Three.js scene
            this.setupScene();
            
            // Set up UI
            this.setupUI(this.title);
            
            // Create network visualization
            this.createCorrectionNetwork();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize and set up data overlay
            this.initializeDataOverlay();
            this.setupDataOverlayListeners();
            
            // Set up mouse controls
            this.setupMouseControls();
            
            // Start animation loop
            this.animate();
            
            this.title = '열간 압연 데이터 01: 보정 알고리즘 구조'; 
            console.log('연간압연 데이터 01: 보정 알고리즘 구조 module initialized');
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
            this.scene.background = null;
            
            // Calculate scale factor based on viewport size
            const minDimension = Math.min(width, height);
            const scaleFactor = this.calculateScaleFactor(minDimension);
            
            // Create camera with dynamic scaling for different devices
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            
            // Apply dynamic camera positioning
            const baseDistance = 20;
            const distance = baseDistance * scaleFactor;
            this.camera.position.set(distance, distance * 0.6, distance);
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
            window.addEventListener('resize', this.onWindowResize.bind(this));
            
            // Set up exit button to stop audio
            const exitButton = document.getElementById('exitBtn');
            if (exitButton) {
                exitButton.addEventListener('click', () => {
                    this.stopArtworkAudio();
                });
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
         * Set up data overlay event listeners
         */
        setupDataOverlayListeners() {
            try {
                const canvas = document.getElementById('visualizationCanvas');
                const overlayClose = document.getElementById('overlayClose');
                
                if (canvas) {
                    console.log('Setting up data overlay listeners for canvas');
                    
                    // Canvas click handler for node interactions
                    canvas.addEventListener('click', (event) => {
                        try {
                            this.handleNodeClick(event, canvas);
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
                                    this.handleNodeClick(syntheticEvent, canvas);
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
         * Create the network graph visualization
         */
        createCorrectionNetwork() {
            const n_nodes = 800;
            const coreRadius = 1.5, sphereRadius = 15;
            
            this.networkGraph.nodes = [];
            
            // Create 800 nodes
            for (let i = 0; i < n_nodes; i++) {
                const row = this.sampleData[i % this.sampleData.length];
                const variation = (Math.random() - 0.5) * 0.2;
                
                const correctionIntensity = Math.min(1.0, (row.current_corrections_count + variation) / 5.0);
                const systemHealth = Math.min(1.0, ((row.data_integrity + row.correction_effectiveness) / 2.0) + variation * 0.1);
                const correctionBurden = Math.min(1.0, (row.active_corrections_count + Math.floor(variation * 3)) / 10.0);
                
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
                    id: i, intensity: correctionIntensity, health: systemHealth, burden: correctionBurden,
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
                nodeMesh.userData = { nodeData: node, type: 'correction-node', clickable: true };
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
         * Animation loop
         */
        animate() {
            if (!this.isActive) return;
            
            // Request next frame
            this.animationFrame = requestAnimationFrame(this.animate.bind(this));
            
            // Auto-rotate if enabled
            if (this.autoRotate && this.centralCore) {
                this.centralCore.rotation.y += 0.002;
                this.centralCore.rotation.x += 0.001;
            }
            
            // Pulse effect on nodes
            const time = Date.now() * 0.001;
            this.networkNodes.forEach((node, i) => {
                if (i % 5 === 0) { // Only animate some nodes for performance
                    const nodeData = node.userData.nodeData;
                    const pulseScale = 1 + 0.1 * Math.sin(time * 2 + nodeData.id * 0.1);
                    node.scale.set(pulseScale, pulseScale, pulseScale);
                    
                    // Subtle position animation
                    const positionOffset = 0.05 * Math.sin(time + nodeData.id * 0.2);
                    node.position.x = nodeData.x + positionOffset;
                    node.position.y = nodeData.y + positionOffset;
                    node.position.z = nodeData.z + positionOffset;
                }
            });
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
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
         * Activate the artwork module
         */
        activate() {
            super.activate();
            
            console.log('Activating 연간압연 데이터 01: 보정 알고리즘 구조 module');
            
            // Reset overlay state when activating
            this.overlayVisible = false;
            
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
            
            console.log('Deactivating 연간압연 데이터 01: 보정 알고리즘 구조 module');
            
            // Properly close data overlay if it's open
            if (this.overlayVisible) {
                this.hideDataOverlay();
            }
            
            // Ensure data cycling is stopped
            this.stopDataCycling();
            
            // Stop animation loop
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        }
        
        /**
         * Handle node click for data interaction
         */
        handleNodeClick(event, canvas) {
            // Check if camera exists before proceeding
            if (!this.camera) {
                console.warn('Camera not initialized for node click handling');
                return;
            }
            
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            try {
                // Update the picking ray with the camera and mouse position
                this.raycaster.setFromCamera(this.mouse, this.camera);
                
                // Get all clickable objects in the scene (including meshes and lines)
                const clickableObjects = [];
                this.scene.traverse((child) => {
                    // Include both mesh objects (nodes) and line objects (connections)
                    if (child.isMesh || child.isLine || child.isLineSegments || child.type === 'Line') {
                        clickableObjects.push(child);
                    }
                });
                
                // Calculate objects intersecting the picking ray
                const intersects = this.raycaster.intersectObjects(clickableObjects);
                
                if (intersects.length > 0) {
                    console.log('Object clicked:', intersects[0].object);
                    
                    if (this.overlayVisible) {
                        this.cycleToNextDataset();
                    } else {
                        this.showDataOverlay();
                    }
                }
            } catch (error) {
                console.error('Error in handleNodeClick:', error);
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
                { title: 'Core<br>Efficiency', unit: '%', baseValue: 87.3 },
                { title: 'Network<br>Load', unit: '%', baseValue: 64.2 },
                { title: 'Active<br>Corrections', unit: '', baseValue: 142 },
                { title: 'Data<br>Integrity', unit: '%', baseValue: 91.8 }
            ];
            
            const dataset = datasets[this.currentDataset];
            document.getElementById('metricLabel').innerHTML = dataset.title;
            document.getElementById('metricUnit').textContent = dataset.unit;
            
            // Start with base value, will be updated by cycling
            document.getElementById('metricValue').textContent = dataset.baseValue;
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
         * Clean up resources when module is unloaded
         */
        cleanup() {
            super.cleanup();
            
            console.log('Cleaning up 연간압연 데이터 01: 보정 알고리즘 구조 module');
            
            // Stop data cycling if active
            this.stopDataCycling();
            
            // Stop animation loop
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            
            // Remove event listeners
            window.removeEventListener('resize', this.onWindowResize.bind(this));
            
            const canvas = document.getElementById('visualizationCanvas');
            if (canvas) {
                canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
                canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
                canvas.removeEventListener('wheel', this.onMouseWheel.bind(this));
            }
            
            document.removeEventListener('mousemove', this.onMouseMove.bind(this));
            document.removeEventListener('mouseup', this.onMouseUp.bind(this));
            document.removeEventListener('touchmove', this.onTouchMove.bind(this));
            document.removeEventListener('touchend', this.onTouchEnd.bind(this));
            
            // Dispose network nodes and edges
            this.networkNodes.forEach(node => {
                if (node.geometry) node.geometry.dispose();
                if (node.material) node.material.dispose();
                this.scene.remove(node);
            });
            
            this.networkEdges.forEach(edge => {
                if (edge.geometry) edge.geometry.dispose();
                if (edge.material) edge.material.dispose();
                this.scene.remove(edge);
            });
            
            // Dispose central core
            if (this.centralCore) {
                this.scene.remove(this.centralCore);
                if (this.centralCore.geometry) this.centralCore.geometry.dispose();
                if (this.centralCore.material) this.centralCore.material.dispose();
                this.centralCore = null;
            }
            
            // Clear arrays
            this.networkNodes = [];
            this.networkEdges = [];
            this.networkGraph.nodes = [];
            
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
            console.log('[ARTWORK1] Cleanup complete');
        }

        /**
         * Initialize artwork-specific audio
         */
        initializeArtworkAudio() {
            console.log('[ARTWORK1] Initializing artwork audio');
            
            // Create audio element for artwork1.wav
            this.artworkAudio = new Audio();
            this.artworkAudio.src = 'https://heund.github.io/comp_ea/shared/sounds/artwork1.wav';
            this.artworkAudio.loop = false;
            this.artworkAudio.volume = 0.7;
            
            // Register with global audio manager
            if (this.globalAudioManager) {
                this.globalAudioManager.registerAudio(this.audioId, this.artworkAudio, 'element');
                console.log('[ARTWORK1] Audio registered with Global Audio Manager');
            }
            
            // Add audio event listeners for progress tracking
            this.artworkAudio.addEventListener('loadedmetadata', () => {
                this.updateAudioTime();
            });

            this.artworkAudio.addEventListener('timeupdate', () => {
                this.updateAudioProgress();
            });

            this.artworkAudio.addEventListener('ended', () => {
                this.stopArtworkAudio();
            });
            
            // Audio button will be set up in setupControlButtons()
            
            console.log('[ARTWORK1] Artwork audio initialized');
        }

        /**
         * Override base class setupControlButtons to use artwork1 audio
         */
        setupControlButtons() {
            console.log('[ARTWORK1] Setting up control buttons with custom audio handling');
            
            // Set up audio button (AR controls button, not main synth button)
            const audioButton = document.getElementById('audioBtn');
            if (audioButton) {
                console.log('[ARTWORK1] Found AR audio button, setting up artwork1 audio');
                audioButton.addEventListener('click', () => {
                    this.toggleArtworkAudio();
                });
            } else {
                console.warn('[ARTWORK1] AR audio button (audioBtn) not found');
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
         * Toggle artwork audio playback
         */
        toggleArtworkAudio() {
            console.log('[ARTWORK1] toggleArtworkAudio called, isAudioPlaying:', this.isAudioPlaying);
            
            if (!this.artworkAudio) {
                console.warn('[ARTWORK1] Artwork audio not initialized');
                return;
            }

            if (this.isAudioPlaying) {
                console.log('[ARTWORK1] Stopping audio...');
                this.stopArtworkAudio();
            } else {
                console.log('[ARTWORK1] Starting audio...');
                this.playArtworkAudio();
            }
        }

        /**
         * Play artwork audio and show progress bar
         */
        playArtworkAudio() {
            if (!this.artworkAudio) {
                console.error('[ARTWORK1] No artwork audio element found');
                return;
            }

            console.log('[ARTWORK1] Attempting to play audio via Global Audio Manager...');
            
            if (this.globalAudioManager) {
                // Use global audio manager to play (this will stop all other audio first)
                this.globalAudioManager.playAudio(this.audioId);
                this.isAudioPlaying = true;
                console.log('[ARTWORK1] Artwork audio started via Global Audio Manager');
                
                // Show progress bar and update button
                this.showAudioProgress();
                this.updateAudioButton();
            } else {
                // Fallback to direct play
                this.artworkAudio.play().then(() => {
                    this.isAudioPlaying = true;
                    console.log('[ARTWORK1] Artwork audio started successfully (fallback)');
                    
                    // Show progress bar and update button
                    this.showAudioProgress();
                    this.updateAudioButton();
                }).catch(error => {
                    console.error('[ARTWORK1] Error playing artwork audio:', error);
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
                console.log('[ARTWORK1] Artwork audio stopped via Global Audio Manager');
            } else {
                this.artworkAudio.pause();
                this.artworkAudio.currentTime = 0;
                console.log('[ARTWORK1] Artwork audio stopped (fallback)');
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

            const progress = (this.artworkAudio.currentTime / this.artworkAudio.duration) * 100;
            const progressFill = document.getElementById('artwork1ProgressFill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            this.updateAudioTime();
        }

        /**
         * Update audio time display
         */
        updateAudioTime() {
            if (!this.artworkAudio) return;

            const current = this.formatTime(this.artworkAudio.currentTime);
            const duration = this.formatTime(this.artworkAudio.duration);
            const timeDisplay = document.getElementById('artwork1AudioTime');
            if (timeDisplay) {
                timeDisplay.textContent = `${current} / ${duration}`;
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
            const progressBar = document.getElementById('artwork1AudioProgress');
            if (progressBar) {
                progressBar.classList.add('visible');
                console.log('[ARTWORK1] Audio progress bar shown');
            }
        }

        /**
         * Hide audio progress bar
         */
        hideAudioProgress() {
            const progressBar = document.getElementById('artwork1AudioProgress');
            if (progressBar) {
                progressBar.classList.remove('visible');
                console.log('[ARTWORK1] Audio progress bar hidden');
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
                console.log('[ARTWORK1] Audio button updated, playing:', this.isAudioPlaying);
            }
        }

        /**
         * Create audio progress bar HTML and CSS
         */
        createAudioProgressBar() {
            console.log('[ARTWORK1] Creating audio progress bar');
            
            // Create CSS styles
            const style = document.createElement('style');
            style.textContent = `
                /* Audio Progress Bar for Artwork1 */
                .artwork1-audio-progress-container {
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
                
                .artwork1-audio-progress-container.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .artwork1-audio-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .artwork1-audio-title {
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: 500;
                }
                
                .artwork1-audio-time {
                    font-size: 11px;
                    color: #ffffff;
                    font-family: 'Inter', sans-serif;
                }
                
                .artwork1-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .artwork1-progress-fill {
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
            progressContainer.className = 'artwork1-audio-progress-container';
            progressContainer.id = 'artwork1AudioProgress';
            progressContainer.innerHTML = `
                <div class="artwork1-audio-info">
                    <div class="artwork1-audio-title">열간 압연 데이터 01: 네트워크 구조</div>
                    <div class="artwork1-audio-time" id="artwork1AudioTime">0:00 / 0:00</div>
                </div>
                <div class="artwork1-progress-bar">
                    <div class="artwork1-progress-fill" id="artwork1ProgressFill"></div>
                </div>
            `;
            
            document.body.appendChild(progressContainer);
            console.log('[ARTWORK1] Audio progress bar created');
        }
    }
    
    // Register this class with the global scope
    window.Artwork1 = Artwork1;
    } // End of if statement checking for existing class
    