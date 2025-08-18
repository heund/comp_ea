/**
 * Artwork4 - 열간 압연 데이터 04: 응력 누적 분포
 * Voronoi Diamond Stress Accumulation Visualization
 * Extracted from artwork4.html
 */

// Check if the class already exists to prevent redefinition
if (typeof window.Artwork4 === 'undefined') {

    class Artwork4 extends ArtworkModule {
        constructor(container, options = {}) {
            super(container, options);
            
            // Default title
            this.title = options.title || '열간 압연 데이터 04: 쥜료 유동 패턴';
            
            // Get global audio manager instance
            this.globalAudioManager = window.globalAudioManager || window.GlobalAudioManager?.getInstance();
            this.audioId = 'artwork4';
            
            // Voronoi diamond visualization properties
            this.voronoiShapes = [];
            this.dataPoints = [];
            this.wireframeMode = false;
            this.animationProgress = 0;
            this.isAnimating = true;
            
            // Diamond with seamless triangular wings - scaled to 2.5x with EXACT relative dot positions from voronoi_test.html
            this.voronoiData = [
                // MAIN DIAMOND - Subdivided into 4 even triangular sections
                // Top triangle section
                { center: { x: 0, y: 3.25, z: 0 }, vertices: [
                    { x: 0, y: 10, z: 0 },    // Top point
                    { x: -5, y: 0, z: 0 },   // Left point
                    { x: 0, y: 0, z: 0 }     // Center point
                ], color: 0xFFA398, dataPoint: { value: 0.174, x: -3.0, y: 0, z: 0.25 }},
                
                // Right triangle section
                { center: { x: 1.75, y: 0, z: 0 }, vertices: [
                    { x: 0, y: 10, z: 0 },    // Top point
                    { x: 0, y: 0, z: 0 },    // Center point
                    { x: 5, y: 0, z: 0 }     // Right point
                ], color: 0xFFA398, dataPoint: { value: 0.173, x: -1.0, y: 0, z: 0.25 }},
                
                // Bottom triangle section
                { center: { x: 0, y: -3.25, z: 0 }, vertices: [
                    { x: 5, y: 0, z: 0 },    // Right point
                    { x: 0, y: 0, z: 0 },    // Center point
                    { x: 0, y: -10, z: 0 }    // Bottom point
                ], color: 0xFF603C, dataPoint: { value: 0.172, x: 1.0, y: 0, z: 0.25 }},
                
                // Left triangle section
                { center: { x: -1.75, y: 0, z: 0 }, vertices: [
                    { x: 0, y: -10, z: 0 },   // Bottom point
                    { x: 0, y: 0, z: 0 },    // Center point
                    { x: -5, y: 0, z: 0 }    // Left point
                ], color: 0xFF603C, dataPoint: { value: 0.171, x: 3.0, y: 0, z: 0.25 }},
                
                // Left triangular wing - seamlessly connected
                { center: { x: -7.5, y: 2.5, z: 0 }, vertices: [
                    { x: 0, y: 10, z: 0 },    // Share diamond's top point
                    { x: -5, y: 0, z: 0 },   // Share diamond's left point
                    { x: -10, y: 5, z: 0 }    // Wing tip point
                ], color: 0xFFA398, dataPoint: { value: 0.172, x: -6.25, y: 5, z: 0.25 }},
                
                // Right triangular wing - seamlessly connected
                { center: { x: 7.5, y: 2.5, z: 0 }, vertices: [
                    { x: 0, y: 10, z: 0 },    // Share diamond's top point
                    { x: 5, y: 0, z: 0 },    // Share diamond's right point
                    { x: 10, y: 5, z: 0 }     // Wing tip point
                ], color: 0xFFA398, dataPoint: { value: 0.172, x: 6.25, y: 5, z: 0.25 }},
                
                // Left bottom triangular wing - flipped downward
                { center: { x: -7.5, y: -2.5, z: 0 }, vertices: [
                    { x: 0, y: -10, z: 0 },   // Share diamond's bottom point
                    { x: -5, y: 0, z: 0 },   // Share diamond's left point
                    { x: -10, y: -5, z: 0 }   // Wing tip point (flipped down)
                ], color: 0xFF603C, dataPoint: { value: 0.172, x: -6.25, y: -5, z: 0.25 }},
                
                // Right bottom triangular wing - flipped downward
                { center: { x: 7.5, y: -2.5, z: 0 }, vertices: [
                    { x: 0, y: -10, z: 0 },   // Share diamond's bottom point
                    { x: 5, y: 0, z: 0 },    // Share diamond's right point
                    { x: 10, y: -5, z: 0 }    // Wing tip point (flipped down)
                ], color: 0xFF603C, dataPoint: { value: 0.172, x: 6.25, y: -5, z: 0.25 }}
            ];
            
            // Sample data for data overlay cycling
            this.sampleData = [
                {current_corrections_count: 2, data_integrity: 0.85, correction_effectiveness: 0.78, active_corrections_count: 5},
                {current_corrections_count: 3, data_integrity: 0.92, correction_effectiveness: 0.81, active_corrections_count: 7},
                {current_corrections_count: 1, data_integrity: 0.76, correction_effectiveness: 0.69, active_corrections_count: 3},
                {current_corrections_count: 4, data_integrity: 0.88, correction_effectiveness: 0.85, active_corrections_count: 8},
                {current_corrections_count: 2, data_integrity: 0.91, correction_effectiveness: 0.77, active_corrections_count: 6}
            ];
            
            // Data overlay system
            this.currentDataset = 0;
            this.overlayVisible = false;
            this.mouse = new THREE.Vector2();
            this.raycaster = new THREE.Raycaster();
            
            // Animation properties
            this.animationFrame = null;
            this.time = 0;
            
            // Custom orbital controls for iPad
            this.isMouseDown = false;
            this.isTouchDown = false;
            this.lastMouseX = 0;
            this.lastMouseY = 0;
            this.cameraDistance = 25;
            this.cameraTheta = Math.PI / 4; // 45 degrees for isometric view
            this.cameraPhi = Math.PI / 3; // ~60 degrees elevation
            this.targetTheta = Math.PI / 4;
            this.targetPhi = Math.PI / 3;
            this.targetDistance = 25;
            
            // Audio for this artwork
            this.artworkAudio = null;
            this.isAudioPlaying = false;
            this.audioProgressInterval = null;
        }
        
        /**
         * Initialize the artwork module
         */
        initialize() {
            console.log(`[INIT] 🎨 Initializing ${this.title} module`);
            
            // Set up Three.js scene first
            this.setupScene();
            
            // Set up UI
            this.setupUI(this.title);
            
            // Setup canvas click detection
            this.setupCanvasClickDetection();
            
            // Initialize and set up data overlay
            this.initializeDataOverlay();
            this.setupDataOverlayListeners();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize artwork audio
            this.initializeArtworkAudio();
            
            // Create audio progress bar
            this.createAudioProgressBar();
            
            // Apply dynamic camera positioning - positioned to face Voronoi shape directly
            const canvas = document.getElementById('visualizationCanvas');
            const container = canvas.parentElement;
            const minDimension = Math.min(container.clientWidth, container.clientHeight);
            const scaleFactor = this.calculateScaleFactor(minDimension);
            const baseDistance = 25;
            const distance = baseDistance * scaleFactor;
            
            // Set initial position using isometric view like artwork2 (positioned to show the diamond properly)
            this.targetDistance = distance;
            this.cameraDistance = distance;
            this.camera.position.set(distance * 0.6, distance * 0.4, distance * 0.6);
            this.camera.lookAt(0, 0, 0);
            
            this.isInitialized = true;
            console.log(`[INIT] ✅ ${this.title} module initialized successfully`);
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
            
            // Add invisible placeholder orb to prevent empty container issues
            this.createPlaceholderOrb();
        }
        
        /**
         * Create an invisible placeholder orb for the Three.js container
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
            
            console.log('[ARTWORK4] 🔮 Invisible placeholder orb created');
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
            
            // Set up custom orbital controls for iPad
            this.setupCustomOrbitalControls();
        }
        
        /**
         * Set up custom orbital controls for iPad touch interaction
         */
        setupCustomOrbitalControls() {
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            // Mouse events for desktop testing
            canvas.addEventListener('mousedown', (event) => {
                this.isMouseDown = true;
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
                event.preventDefault();
            });
            
            canvas.addEventListener('mousemove', (event) => {
                if (!this.isMouseDown) return;
                
                const deltaX = event.clientX - this.lastMouseX;
                const deltaY = event.clientY - this.lastMouseY;
                
                this.targetTheta -= deltaX * 0.01;
                this.targetPhi += deltaY * 0.01;
                this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi));
                
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
                event.preventDefault();
            });
            
            canvas.addEventListener('mouseup', () => {
                this.isMouseDown = false;
            });
            
            // Touch events for iPad
            canvas.addEventListener('touchstart', (event) => {
                if (event.touches.length === 1) {
                    this.isTouchDown = true;
                    this.lastMouseX = event.touches[0].clientX;
                    this.lastMouseY = event.touches[0].clientY;
                }
                event.preventDefault();
            });
            
            canvas.addEventListener('touchmove', (event) => {
                if (!this.isTouchDown || event.touches.length !== 1) return;
                
                const deltaX = event.touches[0].clientX - this.lastMouseX;
                const deltaY = event.touches[0].clientY - this.lastMouseY;
                
                this.targetTheta -= deltaX * 0.01;
                this.targetPhi += deltaY * 0.01;
                this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi));
                
                this.lastMouseX = event.touches[0].clientX;
                this.lastMouseY = event.touches[0].clientY;
                event.preventDefault();
            });
            
            canvas.addEventListener('touchend', () => {
                this.isTouchDown = false;
            });
            
            // Pinch-to-zoom for iPad
            let initialDistance = 0;
            canvas.addEventListener('touchstart', (event) => {
                if (event.touches.length === 2) {
                    const touch1 = event.touches[0];
                    const touch2 = event.touches[1];
                    initialDistance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                }
            });
            
            canvas.addEventListener('touchmove', (event) => {
                if (event.touches.length === 2) {
                    const touch1 = event.touches[0];
                    const touch2 = event.touches[1];
                    const currentDistance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                    
                    if (initialDistance > 0) {
                        const scale = currentDistance / initialDistance;
                        this.targetDistance = Math.max(10, Math.min(100, this.targetDistance / scale));
                        initialDistance = currentDistance;
                    }
                    event.preventDefault();
                }
            });
            
            // Mouse wheel for desktop zoom
            canvas.addEventListener('wheel', (event) => {
                this.targetDistance += event.deltaY * 0.01;
                this.targetDistance = Math.max(10, Math.min(100, this.targetDistance));
                event.preventDefault();
            });
        }
        
        /**
         * Calculate scale factor for responsive design
         */
        calculateScaleFactor(minDimension) {
            if (minDimension < 400) return 1.8;      // Small phones
            if (minDimension < 600) return 1.4;      // Large phones
            if (minDimension < 900) return 1.2;      // Tablets
            if (minDimension < 1200) return 1.0;     // Small desktops
            return 0.8;                              // Large desktops
        }
        
        /**
         * Create Voronoi diamond visualization
         */
        createVoronoiVisualization() {
            // Clear any existing shapes and data points
            this.voronoiShapes.forEach(shape => this.scene.remove(shape));
            this.dataPoints.forEach(point => this.scene.remove(point));
            this.voronoiShapes = [];
            this.dataPoints = [];
            
            this.createVoronoiShapes();
            this.createDataPoints();
        }
        
        /**
         * Create Voronoi diamond shapes
         */
        createVoronoiShapes() {
            this.voronoiData.forEach((cellData, index) => {
                const geometry = new THREE.BufferGeometry();
                
                // Create triangle vertices
                const vertices = [];
                cellData.vertices.forEach(vertex => {
                    vertices.push(vertex.x, vertex.y, vertex.z);
                });
                
                // Create triangle indices (for a single triangle: 0, 1, 2)
                const indices = [0, 1, 2];
                
                geometry.setIndex(indices);
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.computeVertexNormals();
                
                // Create material with solid color
                const material = new THREE.MeshBasicMaterial({
                    color: cellData.color,
                    side: THREE.DoubleSide,
                    wireframe: this.wireframeMode,
                    transparent: true,
                    opacity: 0.8
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                
                // Position the shape at its center coordinates (like original voronoi_test.html)
                mesh.position.set(cellData.center.x, cellData.center.y, cellData.center.z);
                
                mesh.userData = { 
                    originalPosition: { ...cellData.center },
                    cellIndex: index,
                    isVoronoiShape: true
                };
                
                this.scene.add(mesh);
                this.voronoiShapes.push(mesh);
            });
        }
        
        /**
         * Create data points for Voronoi visualization
         */
        createDataPoints() {
            // Create dots linked directly to their parent shapes
            this.voronoiShapes.forEach((shape, index) => {
                const cellData = this.voronoiData[index];
                
                // Create dot geometry - extra large for AR readability
                const dotGeometry = new THREE.SphereGeometry(0.4, 16, 16);
                const dotMaterial = new THREE.MeshBasicMaterial({
                    color: 0x591500,  // Brown color from voronoi_test.html
                    transparent: true,
                    opacity: 0.9
                });
                
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                
                // Group just the dot (no label with numbers)
                const group = new THREE.Group();
                group.add(dot);
                
                // Position at absolute world coordinates (not relative to shape)
                group.position.set(
                    cellData.dataPoint.x,
                    cellData.dataPoint.y,
                    cellData.dataPoint.z
                );
                
                // Store references for updates and link to parent shape
                group.userData = {
                    parentShape: shape,
                    originalPosition: { ...cellData.dataPoint },
                    baseValue: cellData.dataPoint.value,
                    cellIndex: index
                };
                
                // Add to scene directly (not as child of shape) for exact positioning
                this.scene.add(group);
                this.dataPoints.push(group);
            });
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
         * Activate the module
         */
        activate() {
            if (this.isActive) return;
            
            console.log('[ARTWORK4] 🚀 Starting activation');
            super.activate();
            
            // Create Voronoi visualization
            this.createVoronoiVisualization();
            
            // Start Three.js render loop for placeholder orb and Voronoi shapes
            this.startThreeJSRenderLoop();
            
            console.log('[ARTWORK4] ✅ Activation complete');
        }
        
        /**
         * Start Three.js render loop for the Voronoi visualization
         */
        startThreeJSRenderLoop() {
            if (!this.renderer || !this.scene || !this.camera) return;
            
            const animate = () => {
                if (!this.isActive) return; // Stop if module is deactivated
                
                // Update custom orbital controls
                this.updateCustomOrbitalControls();
                
                // Rotate the placeholder orb slowly (even though it's invisible)
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
         * Update custom orbital controls
         */
        updateCustomOrbitalControls() {
            // Smooth interpolation for camera movement
            const lerpFactor = 0.05;
            this.cameraTheta += (this.targetTheta - this.cameraTheta) * lerpFactor;
            this.cameraPhi += (this.targetPhi - this.cameraPhi) * lerpFactor;
            this.cameraDistance += (this.targetDistance - this.cameraDistance) * lerpFactor;
            
            // Convert spherical coordinates to Cartesian - positioned to face front of diamond
            const x = this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
            const y = this.cameraDistance * Math.cos(this.cameraPhi);
            const z = this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
            
            // Update camera position
            this.camera.position.set(x, y, z);
            this.camera.lookAt(0, 0, 0);
        }
        
        /**
         * Initialize data overlay system
         */
        initializeDataOverlay() {
            this.currentDataset = 0;
        }
        
        /**
         * Set up data overlay listeners
         */
        setupDataOverlayListeners() {
            // Data overlay click handler for cycling datasets
            this.handleDataOverlayClick = () => {
                this.cycleDataset();
            };
        }
        
        /**
         * Set up canvas click detection for data overlay
         */
        setupCanvasClickDetection() {
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            this.handleCanvasClick = (event) => {
                if (!this.isActive) return;
                
                // Calculate mouse position for raycasting
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                
                // Raycast to detect clicks on dots
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.dataPoints, true);
                
                if (intersects.length > 0) {
                    // Get the clicked data point
                    const clickedPoint = intersects[0].object.parent;
                    const cellIndex = clickedPoint.userData.cellIndex;
                    
                    // Show data popup using global data popup manager
                    if (this.globalDataPopupManager) {
                        const popupData = {
                            title: '응력 누적 분포',
                            value: this.voronoiData[cellIndex].dataPoint.value,
                            unit: 'MPa',
                            description: `셀 ${cellIndex + 1} 응력 데이터`
                        };
                        this.globalDataPopupManager.showPopup(this.popupId, popupData);
                    }
                } else {
                    // Click on empty space - toggle data overlay
                    if (this.overlayVisible) {
                        this.cycleToNextDataset();
                    } else {
                        this.showDataOverlay();
                    }
                }
            };
            
            this.registerEventListener(canvas, 'click', this.handleCanvasClick);
        }
        
        /**
         * Show data when data button is clicked
         */
        showData() {
            this.toggleDataOverlay();
        }
        
        /**
         * Show data overlay
         */
        showDataOverlay() {
            this.overlayVisible = true;
            const overlay = document.getElementById('dataOverlay');
            overlay.classList.add('active');
            this.updateOverlayData();
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
         * Update overlay data based on current dataset
         */
        updateOverlayData() {
            const datasets = [
                { title: 'Current<br>Corrections', unit: '', baseValue: 4 },
                { title: 'Data<br>Integrity', unit: '%', baseValue: 88 },
                { title: 'Correction<br>Effectiveness', unit: '%', baseValue: 85 },
                { title: 'Active<br>Corrections', unit: '', baseValue: 8 }
            ];
            
            const dataset = datasets[this.currentDataset];
            const metricLabel = document.getElementById('metricLabel');
            const metricUnit = document.getElementById('metricUnit');
            const metricValue = document.getElementById('metricValue');
            
            if (metricLabel) metricLabel.innerHTML = dataset.title;
            if (metricUnit) metricUnit.textContent = dataset.unit;
            if (metricValue) metricValue.textContent = dataset.baseValue;
        }
        
        /**
         * Start data cycling for dynamic updates
         */
        startDataCycling() {
            if (this.dataUpdateInterval) return;
            
            this.dataUpdateInterval = setInterval(() => {
                this.updateDynamicData();
            }, 180); // Update every 180ms for dynamic effect
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
         * Update dynamic data with variations
         */
        updateDynamicData() {
            const datasets = [
                { title: 'Current<br>Corrections', unit: '', baseValue: 4, range: 3 },
                { title: 'Data<br>Integrity', unit: '%', baseValue: 88, range: 12 },
                { title: 'Correction<br>Effectiveness', unit: '%', baseValue: 85, range: 15 },
                { title: 'Active<br>Corrections', unit: '', baseValue: 8, range: 5 }
            ];
            
            const dataset = datasets[this.currentDataset];
            const variation = (Math.random() - 0.5) * dataset.range;
            let newValue = dataset.baseValue + variation;
            
            const metricValue = document.getElementById('metricValue');
            if (!metricValue) return;
            
            // Format the value appropriately
            if (dataset.unit === '%') {
                newValue = Math.max(0, Math.min(100, newValue));
                metricValue.textContent = newValue.toFixed(1);
            } else {
                newValue = Math.max(0, newValue);
                metricValue.textContent = Math.round(newValue);
            }
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
         * Deactivate the module
         */
        deactivate() {
            if (!this.isActive) return;
            
            console.log('[ARTWORK4] 🛑 Starting deactivation');
            
            // Hide data overlay and stop data cycling BEFORE calling super.deactivate()
            if (this.overlayVisible) {
                this.hideDataOverlay();
            }
            
            // Ensure data cycling is stopped
            this.stopDataCycling();
            
            super.deactivate();
            
            // Stop Three.js animation
            if (this.threeJSAnimationId) {
                cancelAnimationFrame(this.threeJSAnimationId);
                this.threeJSAnimationId = null;
            }
            
            // Clear Three.js renderer but keep the placeholder orb
            if (this.renderer) {
                this.renderer.clear();
            }
            
            console.log('[ARTWORK4] ✅ Deactivation complete');
        }
        
        
        /**
         * Clean up resources
         */
        cleanup() {
            console.log(`[CLEANUP] 🧹 Starting cleanup for ${this.title} module`);
            
            // Event listeners are automatically cleaned up by centralized system
            
            // Clean up Three.js objects
            if (this.scene) {
                this.voronoiShapes.forEach(shape => {
                    if (shape.geometry) shape.geometry.dispose();
                    if (shape.material) shape.material.dispose();
                    this.scene.remove(shape);
                });
                
                this.dataPoints.forEach(point => {
                    point.children.forEach(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    });
                    this.scene.remove(point);
                });
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
            const progressBar = document.getElementById('artwork4AudioProgress');
            if (progressBar) {
                progressBar.remove();
            }
            
            this.voronoiShapes = [];
            this.dataPoints = [];
            
            console.log(`[CLEANUP] ✅ ${this.title} module cleanup complete`);
        }

        /**
         * Override base class setupControlButtons to use artwork4 audio
         */
        setupControlButtons() {
            console.log('[ARTWORK4] Setting up control buttons with custom audio handling');
            
            // Set up audio button (AR controls button, not main synth button)
            const audioButton = document.getElementById('audioBtn');
            if (audioButton) {
                console.log('[ARTWORK4] Found AR audio button, setting up artwork4 audio');
                audioButton.addEventListener('click', () => {
                    this.toggleArtworkAudio();
                });
            } else {
                console.warn('[ARTWORK4] AR audio button (audioBtn) not found');
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
            console.log('[ARTWORK4] Initializing artwork audio');
            
            this.artworkAudio = new Audio('https://heund.github.io/comp_ea/shared/sounds/artwork4.wav');
            this.artworkAudio.preload = 'auto';
            this.artworkAudio.loop = false;

            // Register with global audio manager
            if (this.globalAudioManager) {
                this.globalAudioManager.registerAudio(this.audioId, this.artworkAudio, 'element');
                console.log('[ARTWORK4] Audio registered with Global Audio Manager');
            }

            this.artworkAudio.addEventListener('loadedmetadata', () => {
                console.log('[ARTWORK4] Audio metadata loaded, duration:', this.artworkAudio.duration);
            });

            this.artworkAudio.addEventListener('timeupdate', () => {
                this.updateAudioProgress();
            });

            this.artworkAudio.addEventListener('ended', () => {
                this.stopArtworkAudio();
            });
            
            console.log('[ARTWORK4] Artwork audio initialized');
        }

        /**
         * Toggle artwork audio playback
         */
        toggleArtworkAudio() {
            console.log('[ARTWORK4] toggleArtworkAudio called, isAudioPlaying:', this.isAudioPlaying);
            
            if (!this.artworkAudio) {
                console.error('[ARTWORK4] No artwork audio element found');
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
                console.error('[ARTWORK4] No artwork audio element found');
                return;
            }

            console.log('[ARTWORK4] Attempting to play audio via Global Audio Manager...');
            
            if (this.globalAudioManager) {
                // Use global audio manager to play (this will stop all other audio first)
                this.globalAudioManager.playAudio(this.audioId);
                this.isAudioPlaying = true;
                console.log('[ARTWORK4] Artwork audio started via Global Audio Manager');
                
                // Show progress bar and update button
                this.showAudioProgress();
                this.updateAudioButton();
            } else {
                // Fallback to direct play
                this.artworkAudio.play().then(() => {
                    this.isAudioPlaying = true;
                    console.log('[ARTWORK4] Artwork audio started successfully (fallback)');
                    
                    // Show progress bar and update button
                    this.showAudioProgress();
                    this.updateAudioButton();
                }).catch(error => {
                    console.error('[ARTWORK4] Error playing artwork audio:', error);
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
                console.log('[ARTWORK4] Artwork audio stopped via Global Audio Manager');
            } else {
                this.artworkAudio.pause();
                this.artworkAudio.currentTime = 0;
                console.log('[ARTWORK4] Artwork audio stopped (fallback)');
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

            const progressFill = document.getElementById('artwork4ProgressFill');
            const timeDisplay = document.getElementById('artwork4AudioTime');
            
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
            const progressBar = document.getElementById('artwork4AudioProgress');
            if (progressBar) {
                progressBar.classList.add('visible');
                console.log('[ARTWORK4] Audio progress bar shown');
            }
        }

        /**
         * Hide audio progress bar
         */
        hideAudioProgress() {
            const progressBar = document.getElementById('artwork4AudioProgress');
            if (progressBar) {
                progressBar.classList.remove('visible');
                console.log('[ARTWORK4] Audio progress bar hidden');
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
                console.log('[ARTWORK4] Audio button updated, playing:', this.isAudioPlaying);
            }
        }

        /**
         * Create audio progress bar HTML and CSS
         */
        createAudioProgressBar() {
            console.log('[ARTWORK4] Creating audio progress bar');
            
            // Create CSS styles
            const style = document.createElement('style');
            style.textContent = `
                /* Audio Progress Bar for Artwork4 */
                .artwork4-audio-progress-container {
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
                
                .artwork4-audio-progress-container.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .artwork4-audio-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .artwork4-audio-title {
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: 500;
                }
                
                .artwork4-audio-time {
                    font-size: 11px;
                    color: #ffffff;
                    font-family: 'Inter', sans-serif;
                }
                
                .artwork4-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .artwork4-progress-fill {
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
            progressContainer.className = 'artwork4-audio-progress-container';
            progressContainer.id = 'artwork4AudioProgress';
            progressContainer.innerHTML = `
                <div class="artwork4-audio-info">
                    <div class="artwork4-audio-title">열간 압연 데이터 04: 응력 누적 분포</div>
                    <div class="artwork4-audio-time" id="artwork4AudioTime">0:00 / 0:00</div>
                </div>
                <div class="artwork4-progress-bar">
                    <div class="artwork4-progress-fill" id="artwork4ProgressFill"></div>
                </div>
            `;
            
            document.body.appendChild(progressContainer);
            console.log('[ARTWORK4] Audio progress bar created');
        }
    }
    
    // Register this class with the global scope
    window.Artwork4 = Artwork4;
    
} // End of if statement checking for existing class
