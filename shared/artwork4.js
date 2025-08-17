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
            this.title = '열간 압연 데이터 04: 응력 누적 분포';
            
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
            
            // Apply dynamic camera positioning - positioned to face Voronoi shape directly
            const canvas = document.getElementById('visualizationCanvas');
            const container = canvas.parentElement;
            const minDimension = Math.min(container.clientWidth, container.clientHeight);
            const scaleFactor = this.calculateScaleFactor(minDimension);
            const baseDistance = 25;
            const distance = baseDistance * scaleFactor;
            this.camera.position.set(0, 0, distance);
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
            this.registerEventListener(window, 'resize', this.onWindowResize.bind(this));
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
                
                // Create canvas for data label - extra large for AR readability
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 400;
                canvas.height = 200;
                context.fillStyle = '#591500';
                context.font = '72px Arial';
                context.textAlign = 'center';
                context.fillText(cellData.dataPoint.value.toString(), 200, 130);
                
                // Create sprite label - extra large scale
                const texture = new THREE.CanvasTexture(canvas);
                const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
                const label = new THREE.Sprite(labelMaterial);
                label.scale.set(4.0, 2.0, 1);
                
                // Group dot and label together
                const group = new THREE.Group();
                group.add(dot);
                group.add(label);
                
                // Position at absolute world coordinates (not relative to shape)
                group.position.set(
                    cellData.dataPoint.x,
                    cellData.dataPoint.y,
                    cellData.dataPoint.z
                );
                
                // Position label well above dot to avoid overlap
                label.position.set(0, 1.2, 0);
                
                // Store references for updates and link to parent shape
                group.userData = {
                    canvas: canvas,
                    context: context,
                    label: label,
                    parentShape: shape,
                    originalPosition: { ...cellData.dataPoint },
                    baseValue: cellData.dataPoint.value
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
                
                // Toggle data overlay or cycle through datasets
                if (this.overlayVisible) {
                    this.cycleToNextDataset();
                } else {
                    this.showDataOverlay();
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
            
            this.voronoiShapes = [];
            this.dataPoints = [];
            
            console.log(`[CLEANUP] ✅ ${this.title} module cleanup complete`);
        }
    }
    
    // Register this class with the global scope
    window.Artwork4 = Artwork4;
    
} // End of if statement checking for existing class
