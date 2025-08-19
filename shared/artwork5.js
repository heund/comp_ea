/**
 * 열간 압연 데이터 05: 온도 분포 및 열 전달 분석 Module
 * 
 * AR artwork module that creates thermal heatmap visualization.
 * This module visualizes temperature distribution with thermal analysis.
 */

// Only define the class if it doesn't already exist
if (typeof window.Artwork5 === 'undefined') {

    class Artwork5 extends ArtworkModule {
        /**
         * Constructor for the ArtworkTemplate module
         * @param {HTMLElement} container - The container element where the artwork will be rendered
         * @param {Object} options - Configuration options for the module
         */
        constructor(container, options = {}) {
            super(container, options);
            
            // Default title
            this.title = options.title || '열간 압연 데이터 05: 전체 데이터 지도';
            
            // Get global audio manager instance
            this.globalAudioManager = window.globalAudioManager || window.GlobalAudioManager?.getInstance();
            this.audioId = 'artwork5';
            
            // Three.js objects
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.animationFrame = null;
            
            // Thermal visualization objects
            this.thermalContainer = null;
            this.thermalLayers = [];
            this.thermalAnimationActive = false;
            this.thermalScale = 1.0;
            
            // Data overlay system
            this.currentDataset = 0;
            this.overlayVisible = false;
            this.dataUpdateInterval = null;
            this.sampleThermalData = [
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
            
            // Sample data for thermal visualization display
            this.thermalDataPoints = [
                { label: 'Surface Temperature', value: 1085.5, unit: '°C' },
                { label: 'Core Temperature', value: 1120.3, unit: '°C' },
                { label: 'Thermal Gradient', value: 34.8, unit: '°C' },
                { label: 'Heat Transfer Rate', value: 12.7, unit: 'kW/m²' }
            ];
            
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
            
            console.log('Initializing Artwork5...');
            
            // Set up Three.js scene first
            this.setupScene();
            
            // DO NOT initialize thermal container here - only when activated
            // this.initializeThermalContainer();
            
            // Set up UI
            this.setupUI(this.title);
            
            // Setup canvas click detection
            this.setupCanvasClickDetection();
            
            // Setup event listeners (including thermal container click)
            this.setupEventListeners();
            
            // Initialize and set up data overlay
            this.initializeDataOverlay();
            this.setupDataOverlayListeners();
            
            // Initialize artwork audio
            this.initializeArtworkAudio();
            
            // Create audio progress bar
            this.createAudioProgressBar();
            
            this.title = '열간 압연 데이터 05: 온도 분포 및 열 전달 분석';
            console.log('Artwork5 initialized successfully (thermal container will be created on activation)');
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
            
            console.log('Invisible placeholder orb created for artwork5');
        }
        
        /**
         * Setup event listeners
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
            
            // Add data overlay click handler if available
            if (this.dataOverlay) {
                this.registerEventListener(this.dataOverlay, 'click', this.handleDataOverlayClick);
            }
            
            // Add thermal container click handler if available
            if (this.thermalContainer) {
                console.log('Setting up thermal container click handler:', this.thermalContainer);
                this.registerEventListener(this.thermalContainer, 'click', this.handleContainerClick.bind(this));
            } else {
                console.warn('Thermal container not available for click handler setup');
            }
        }
        
        /**
         * Initialize data overlay with consistent formatting
         */
        initializeDataOverlay() {
            try {
                // Initialize overlay state
                this.overlayVisible = false;
                this.currentDataset = 0;
                
                // Sample thermal data from original artwork5.html
                this.sampleData = [
                    {zone_1: 1217.45, zone_2: 1133.62, zone_3: 967.77, zone_4_L: 997.18, zone_4_R: 996.13, temp_gradient: 249.7, thermal_stability: 0.913},
                    {zone_1: 1229.47, zone_2: 1137.59, zone_3: 972.92, zone_4_L: 987.61, zone_4_R: 1000.68, temp_gradient: 256.6, thermal_stability: 0.853},
                    {zone_1: 1236.19, zone_2: 1167.79, zone_3: 971.20, zone_4_L: 1006.91, zone_4_R: 1019.96, temp_gradient: 265.0, thermal_stability: 0.819},
                    {zone_1: 1265.76, zone_2: 1178.55, zone_3: 1003.74, zone_4_L: 1027.83, zone_4_R: 1054.80, temp_gradient: 262.0, thermal_stability: 0.671},
                    {zone_1: 1300.00, zone_2: 1221.83, zone_3: 1048.45, zone_4_L: 1060.67, zone_4_R: 1070.49, temp_gradient: 251.6, thermal_stability: 0.500}
                ];
                
                console.log('Data overlay initialized for artwork5');
            } catch (error) {
                console.error('Error initializing data overlay:', error);
            }
        }
        
        /**
         * Show data overlay
         */
        showDataOverlay() {
            this.overlayVisible = true;
            const overlay = document.getElementById('dataOverlay');
            overlay.classList.add('active');
            
            // Update with current dataset
            this.updateOverlayData();
            
            // Start data cycling for dynamic updates
            this.startDataCycling();
            
            console.log('Data overlay shown for artwork5');
        }
        
        /**
         * Hide data overlay
         */
        hideDataOverlay() {
            this.overlayVisible = false;
            const overlay = document.getElementById('dataOverlay');
            overlay.classList.remove('active');
            
            // Stop data cycling
            this.stopDataCycling();
            
            console.log('Data overlay hidden for artwork5');
        }
        
        /**
         * Cycle to next dataset
         */
        cycleToNextDataset() {
            this.currentDataset = (this.currentDataset + 1) % 4; // 4 different data types
            this.updateOverlayData();
            console.log(`Cycled to dataset ${this.currentDataset} for artwork5`);
        }
        
        /**
         * Update overlay data based on current dataset with dynamic values
         */
        updateOverlayData() {
            const datasets = [
                { title: 'Zone 1<br>Temp', unit: '°C' },
                { title: 'Zone 2<br>Temp', unit: '°C' },
                { title: 'Temp<br>Gradient', unit: '°C' },
                { title: 'Thermal<br>Stability', unit: '' }
            ];
            
            const dataset = datasets[this.currentDataset];
            
            // Get DOM elements with null checks
            const metricLabel = document.getElementById('metricLabel');
            const metricUnit = document.getElementById('metricUnit');
            const metricValue = document.getElementById('metricValue');
            const additionalInfo = document.getElementById('additionalInfo');
            
            if (!metricLabel || !metricUnit || !metricValue) {
                console.warn('Data overlay DOM elements not found. Overlay may not be initialized.');
                return;
            }
            
            metricLabel.innerHTML = dataset.title;
            metricUnit.textContent = dataset.unit;
            
            // Calculate dynamic value based on current dataset
            const time = (Date.now() * 0.001);
            let value;
            
            switch (this.currentDataset) {
                case 0: // Zone 1 Temperature
                    value = 1085 + Math.sin(time * 0.7) * 5.5 + Math.cos(time * 1.3) * 3.2;
                    value = Math.max(1070, Math.min(1100, value));
                    break;
                    
                case 1: // Zone 2 Temperature
                    value = 1120 + Math.sin(time * 0.5) * 4.8 + Math.cos(time * 0.9) * 3.5;
                    value = Math.max(1110, Math.min(1130, value));
                    break;
                    
                case 2: // Temperature Gradient
                    value = 35 + Math.sin(time * 1.1) * 3.2 + Math.cos(time * 1.7) * 2.5;
                    value = Math.max(30, Math.min(40, value));
                    break;
                    
                case 3: // Thermal Stability
                    value = 0.875 + Math.sin(time * 1.5) * 0.08 + Math.cos(time * 2.1) * 0.05;
                    value = Math.max(0.8, Math.min(0.95, value));
                    break;
            }
            
            metricValue.textContent = value.toFixed(dataset.unit === '' ? 3 : 1);
            
            // Update additional info with dynamic values if element exists
            if (additionalInfo) {
                const zone3Temp = 1095 + Math.sin(time * 0.8) * 4.2 + Math.cos(time * 1.1) * 2.8;
                const zone4LTemp = 1105 + Math.sin(time * 0.6) * 3.8 + Math.cos(time * 1.4) * 3.1;
                const zone4RTemp = 1102 + Math.sin(time * 0.9) * 4.1 + Math.cos(time * 1.2) * 2.9;
                
                additionalInfo.innerHTML = 
                    `Zone 3: ${zone3Temp.toFixed(1)}°C<br>` +
                    `Zone 4L: ${zone4LTemp.toFixed(1)}°C<br>` +
                    `Zone 4R: ${zone4RTemp.toFixed(1)}°C`;
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
         * Handle canvas click event
         */
        handleCanvasClick(event, canvas) {
            console.log('Canvas clicked for artwork5');
            
            // Play click sound if available
            if (typeof playClickSound === 'function') {
                playClickSound();
            }
            
            // Toggle data overlay or cycle through datasets
            if (this.overlayVisible) {
                this.cycleToNextDataset();
            } else {
                this.showDataOverlay();
            }
        }
        
        /**
         * Handle thermal container click event
         */
        handleContainerClick(event) {
            console.log('Thermal container clicked for artwork5');
            
            if (!this.isActive) return;
            
            // Play click sound if available
            if (typeof playClickSound === 'function') {
                playClickSound();
            }
            
            // Toggle data overlay or cycle through datasets
            if (this.overlayVisible) {
                this.cycleToNextDataset();
            } else {
                this.showDataOverlay();
            }
        }
        
        /**
         * Set up data overlay listeners
         */
        setupDataOverlayListeners() {
            // Data overlay click handler for cycling datasets
            this.handleDataOverlayClick = () => {
                this.cycleToNextDataset();
            };
        }
        
        /**
         * Setup canvas click detection for data overlay interaction
         */
        setupCanvasClickDetection() {
            const canvas = document.getElementById('visualizationCanvas');
            if (!canvas) return;
            
            this.handleCanvasClick = (event) => {
                if (!this.isActive) return;
                
                // Play click sound if available
                if (typeof playClickSound === 'function') {
                    playClickSound();
                }
                
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
         * Update data values with dynamic calculations for thermal visualization
         */
        updateDataValues() {
            const time = (Date.now() * 0.001);
            let value;
            const metricValue = document.getElementById('metricValue');
            if (!metricValue) return;
            
            const baseData = this.thermalDataPoints[this.currentDataset];
            
            switch (this.currentDataset) {
                case 0: // Surface Temperature
                    value = baseData.value + Math.sin(time * 0.7) * 5.5 + Math.cos(time * 1.3) * 3.2;
                    value = Math.max(1070, Math.min(1100, value));
                    metricValue.textContent = value.toFixed(1);
                    break;
                    
                case 1: // Core Temperature
                    value = baseData.value + Math.sin(time * 0.5) * 4.8 + Math.cos(time * 0.9) * 3.5;
                    value = Math.max(1110, Math.min(1130, value));
                    metricValue.textContent = value.toFixed(1);
                    break;
                    
                case 2: // Thermal Gradient
                    value = baseData.value + Math.sin(time * 1.1) * 3.2 + Math.cos(time * 1.7) * 2.5;
                    value = Math.max(30, Math.min(40, value));
                    metricValue.textContent = value.toFixed(1);
                    break;
                    
                case 3: // Heat Transfer Rate
                    value = baseData.value + Math.sin(time * 1.5) * 1.8 + Math.cos(time * 2.1) * 1.2;
                    value = Math.max(10, Math.min(15, value));
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
                    this.updateOverlayData();
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
         * Inject thermal CSS styles into the document
         */
        injectThermalStyles() {
            if (document.getElementById('thermal-styles-artwork5')) {
                console.log('Thermal styles already injected');
                return;
            }
            
            const styleElement = document.createElement('style');
            styleElement.id = 'thermal-styles-artwork5';
            styleElement.textContent = `
                /* Thermal Visualization Container */
                .thermal-container {
                    --graphic-scale: 1.0; /* CSS custom property for dynamic scaling */
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(var(--graphic-scale));
                    width: 600px;
                    height: 600px;
                    pointer-events: none;
                    z-index: 100;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.5s ease;
                    cursor: pointer;
                    /* Prevent blue highlight/selection on click */
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                }
                
                .thermal-container.active {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                }
                
                .topological-shape {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                
                .thermal-container .layer {
                    position: absolute;
                    animation: subtle-float 6s ease-in-out infinite;
                    mix-blend-mode: multiply;
                    filter: blur(2px);
                    transition: all 0.5s ease;
                }
                
                /* Layer-specific styles */
                .thermal-container .layer-1 {
                    width: 600px;
                    height: 480px;
                    top: 80px;
                    left: 30px;
                    background: radial-gradient(ellipse at 30% 40%, 
                        rgba(253, 237, 237, 1) 0%,
                        rgba(249, 190, 190, 0.8) 30%,
                        rgba(246, 132, 133, 0.6) 60%,
                        rgba(244, 48, 51, 0.3) 80%,
                        rgba(244, 48, 51, 0) 100%);
                    transform: rotate(-5deg);
                    border-radius: 45% 55% 62% 38% / 25% 25% 75% 75%;
                    opacity: 0.9;
                }
                
                .thermal-container .layer-2 {
                    width: 540px;
                    height: 432px;
                    top: 96px;
                    left: 60px;
                    background: radial-gradient(ellipse at 35% 45%, 
                        rgba(249, 190, 190, 0.9) 0%,
                        rgba(246, 132, 133, 0.7) 30%,
                        rgba(244, 48, 51, 0.5) 60%,
                        rgba(181, 30, 33, 0.3) 80%,
                        rgba(181, 30, 33, 0) 100%);
                    transform: rotate(3deg);
                    border-radius: 50% 40% 55% 45% / 30% 35% 65% 70%;
                    animation-delay: -1s;
                    opacity: 0.8;
                }
                
                .thermal-container .layer-3 {
                    width: 480px;
                    height: 384px;
                    top: 112px;
                    left: 80px;
                    background: radial-gradient(ellipse at 40% 50%, 
                        rgba(246, 132, 133, 0.8) 0%,
                        rgba(244, 48, 51, 0.6) 30%,
                        rgba(181, 30, 33, 0.4) 60%,
                        rgba(120, 16, 18, 0.2) 80%,
                        rgba(120, 16, 18, 0) 100%);
                    transform: rotate(-2deg);
                    border-radius: 40% 60% 45% 55% / 35% 25% 75% 65%;
                    animation-delay: -2s;
                    opacity: 0.7;
                }
                
                .thermal-container .layer-4 {
                    width: 420px;
                    height: 336px;
                    top: 128px;
                    left: 100px;
                    background: radial-gradient(ellipse at 45% 55%, 
                        rgba(244, 48, 51, 0.7) 0%,
                        rgba(181, 30, 33, 0.5) 30%,
                        rgba(120, 16, 18, 0.3) 60%,
                        rgba(64, 5, 6, 0.1) 80%,
                        rgba(64, 5, 6, 0) 100%);
                    transform: rotate(4deg);
                    border-radius: 55% 45% 40% 60% / 25% 40% 60% 75%;
                    animation-delay: -3s;
                    opacity: 0.6;
                }
                
                .thermal-container .layer-5 {
                    width: 360px;
                    height: 288px;
                    top: 144px;
                    left: 120px;
                    background: radial-gradient(ellipse at 50% 60%, 
                        rgba(181, 30, 33, 0.6) 0%,
                        rgba(120, 16, 18, 0.4) 30%,
                        rgba(64, 5, 6, 0.2) 60%,
                        rgba(64, 5, 6, 0.1) 80%,
                        rgba(64, 5, 6, 0) 100%);
                    transform: rotate(-3deg);
                    border-radius: 60% 40% 50% 50% / 40% 30% 70% 60%;
                    animation-delay: -4s;
                    opacity: 0.5;
                }
                
                .thermal-container .layer-6 {
                    width: 300px;
                    height: 240px;
                    top: 160px;
                    left: 140px;
                    background: radial-gradient(ellipse at 55% 65%, 
                        rgba(140, 20, 15, 0.6) 0%,
                        rgba(100, 12, 8, 0.4) 30%,
                        rgba(80, 8, 6, 0.2) 60%,
                        rgba(70, 7, 5, 0.1) 80%,
                        rgba(60, 6, 4, 0) 100%);
                    transform: rotate(2deg);
                    border-radius: 45% 55% 35% 65% / 45% 35% 65% 55%;
                    animation-delay: -5s;
                    opacity: 0.5;
                }
                
                .thermal-container .layer-7 {
                    width: 200px;
                    height: 160px;
                    top: 220px;
                    left: 200px;
                    background: radial-gradient(ellipse at 60% 70%, 
                        rgba(80, 8, 6, 0.6) 0%,
                        rgba(60, 6, 4, 0.4) 30%,
                        rgba(50, 5, 3, 0.2) 60%,
                        rgba(45, 4, 3, 0.1) 80%,
                        rgba(41, 4, 2, 0) 100%);
                    transform: rotate(-1deg);
                    border-radius: 50% 50% 45% 55% / 35% 45% 55% 65%;
                    animation-delay: -1.5s;
                    opacity: 0.6;
                }
                
                .thermal-container .layer-8 {
                    width: 150px;
                    height: 120px;
                    top: 240px;
                    left: 225px;
                    background: radial-gradient(ellipse at 65% 75%, 
                        rgba(41, 4, 2, 0.8) 0%,
                        rgba(41, 4, 2, 0.6) 30%,
                        rgba(41, 4, 2, 0.3) 60%,
                        rgba(41, 4, 2, 0.1) 80%,
                        rgba(41, 4, 2, 0) 100%);
                    transform: rotate(1deg);
                    border-radius: 55% 45% 40% 60% / 50% 40% 60% 50%;
                    animation-delay: -2.5s;
                    opacity: 0.9;
                }
                
                /* Subtle float animation for thermal layers */
                @keyframes subtle-float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg) scale(1);
                    }
                    50% {
                        transform: translateY(-20px) rotate(2deg) scale(1.02);
                    }
                }
            `;
            
            document.head.appendChild(styleElement);
            console.log('Thermal CSS styles injected');
        }
        
        /**
         * Create thermal container and layers dynamically
         */
        createThermalContainer() {
            // Remove existing thermal container if it exists
            const existingContainer = document.getElementById('thermalContainer');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // Create thermal container
            const container = document.createElement('div');
            container.id = 'thermalContainer';
            container.className = 'thermal-container';
            
            // Create topological shape wrapper
            const topologicalShape = document.createElement('div');
            topologicalShape.className = 'topological-shape';
            
            // Create 8 thermal layers
            for (let i = 1; i <= 8; i++) {
                const layer = document.createElement('div');
                layer.className = `layer layer-${i}`;
                topologicalShape.appendChild(layer);
            }
            
            container.appendChild(topologicalShape);
            
            // Append to visualization container
            const visualizationContainer = document.getElementById('visualizationContainer');
            if (visualizationContainer) {
                visualizationContainer.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
            
            console.log('Thermal container created with 8 layers');
            return container;
        }
        
        /**
         * Initialize thermal container for thermal visualization
         */
        initializeThermalContainer() {
            // Only initialize if this module is active
            if (!this.isActive) {
                console.log('Artwork5 not active, skipping thermal container initialization');
                return;
            }
            
            console.log('Starting thermal container initialization...');
            
            // First inject the CSS styles
            this.injectThermalStyles();
            
            // Create the thermal container
            this.thermalContainer = this.createThermalContainer();
            
            if (this.thermalContainer) {
                // Get all thermal layers
                this.thermalLayers = Array.from(this.thermalContainer.querySelectorAll('.layer'));
                
                // Set initial scale
                this.thermalContainer.style.setProperty('--graphic-scale', this.thermalScale);
                
                console.log('Thermal container initialized with', this.thermalLayers.length, 'layers');
                console.log('Thermal container DOM element:', this.thermalContainer);
                console.log('Thermal container parent:', this.thermalContainer.parentElement);
            } else {
                console.error('Failed to create thermal container');
            }
        }
        
        /**
         * Activate thermal visualization layers
         */
        activateThermalVisualization() {
            if (!this.thermalContainer) return;
            
            console.log('[ARTWORK5] Activating thermal visualization');
            
            // Make thermal container visible
            this.thermalContainer.style.display = 'block';
            this.thermalContainer.classList.add('active');
            this.thermalAnimationActive = true;
            
            // Apply dynamic scaling based on viewport
            this.updateThermalScale();
            
            // Show thermal layers with staggered animation
            const layers = this.thermalContainer.querySelectorAll('.thermal-layer');
            layers.forEach((layer, index) => {
                setTimeout(() => {
                    layer.classList.add('visible');
                }, index * 200);
            });
            
            // Show thermal data points
            const dataPoints = this.thermalContainer.querySelectorAll('.thermal-data-point');
            dataPoints.forEach((point, index) => {
                setTimeout(() => {
                    point.classList.add('visible');
                }, 1000 + (index * 100));
            });
            
            // DO NOT auto-play audio on activation - removed auto-play behavior
            console.log('Thermal visualization activated without auto-playing audio');
        }
        
        /**
         * Deactivate thermal visualization
         */
        deactivateThermalVisualization() {
            if (!this.thermalContainer) return;
            
            console.log('[ARTWORK5] Deactivating thermal visualization');
            this.thermalContainer.classList.remove('active');
            this.thermalAnimationActive = false;
            
            // Reset thermal container state to prevent reactivation
            this.thermalContainer.style.display = 'none';
        }
        
        /**
         * Update thermal visualization scale based on viewport size
         */
        updateThermalScale() {
            if (!this.thermalContainer) return;
            
            // Calculate appropriate scale based on viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Base scale on the smaller dimension to ensure it fits
            const baseSize = 600; // Original design size
            const widthScale = viewportWidth / baseSize;
            const heightScale = viewportHeight / baseSize;
            
            // Use the smaller scale to ensure it fits completely
            this.thermalScale = Math.min(widthScale, heightScale) * 0.8; // 80% of available space
            
            // Apply the scale
            this.thermalContainer.style.setProperty('--graphic-scale', this.thermalScale);
            console.log('Updated thermal scale to:', this.thermalScale);
        }
        
        /**
         * Animate the scene
         */
        animate() {
            if (!this.isActive) return;
            
            // For artwork5, we only need to activate thermal visualization once
            // Only activate if module is active AND thermal animation is not already active
            if (this.isActive && this.thermalContainer && !this.thermalAnimationActive) {
                console.log('[ARTWORK5] Animate method activating thermal visualization');
                this.activateThermalVisualization();
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
         * Activate the module
         */
        activate() {
            if (this.isActive) return;
            
            console.log('Activating Artwork5...');
            super.activate();
            
            // Force re-initialization of thermal container to ensure it's created
            console.log('Force initializing thermal container...');
            this.initializeThermalContainer();
            
            // Setup thermal container click handler after re-initialization
            if (this.thermalContainer) {
                console.log('Setting up thermal container click handler on activation:', this.thermalContainer);
                this.registerEventListener(this.thermalContainer, 'click', this.handleContainerClick.bind(this));
            }
            
            // Activate thermal visualization
            if (this.thermalContainer && !this.thermalAnimationActive) {
                console.log('Activating thermal visualization...');
                this.activateThermalVisualization();
            } else {
                console.error('Thermal container not available:', this.thermalContainer);
                console.error('Animation active:', this.thermalAnimationActive);
            }
            
            // Start Three.js render loop for placeholder orb
            this.startThreeJSRenderLoop();
        }
        
        /**
         * Start Three.js render loop for the invisible placeholder orb
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
         * Deactivate the module
         */
        deactivate() {
            if (!this.isActive) return;
            
            console.log('[ARTWORK5] Deactivating Artwork5...');
            
            // Stop audio and reset button state
            this.stopArtworkAudio();
            
            // Deactivate thermal visualization
            this.deactivateThermalVisualization();
            
            // Properly close data overlay if it's open
            if (this.overlayVisible) {
                this.hideDataOverlay();
            }
            
            // Ensure data cycling is stopped
            this.stopDataCycling();
            
            // Reset thermal animation state completely
            this.thermalAnimationActive = false;
            
            // Clear any pending timeouts that might reactivate thermal layers
            if (this.thermalContainer) {
                const layers = this.thermalContainer.querySelectorAll('.thermal-layer');
                layers.forEach(layer => {
                    layer.classList.remove('visible');
                });
                
                const dataPoints = this.thermalContainer.querySelectorAll('.thermal-data-point');
                dataPoints.forEach(point => {
                    point.classList.remove('visible');
                });
            }
            
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
            
            console.log('[ARTWORK5] Artwork5 deactivation complete');
        }
        
        
        /**
         * Remove injected thermal styles from document
         */
        removeThermalStyles() {
            const styleElement = document.getElementById('thermal-styles-artwork5');
            if (styleElement) {
                styleElement.remove();
                console.log('Thermal CSS styles removed');
            }
        }
        
        /**
         * Remove thermal container from DOM
         */
        removeThermalContainer() {
            if (this.thermalContainer) {
                this.thermalContainer.remove();
                this.thermalContainer = null;
                this.thermalLayers = [];
                console.log('Thermal container removed from DOM');
            }
        }
        
        /**
         * Dispose of Three.js specific resources
         */
        disposeThreeJsResources() {
            console.log('Disposing Three.js resources...');
            
            // Cancel any animation frames
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            
            // Dispose of any Three.js textures
            if (this.textures) {
                Object.values(this.textures).forEach(texture => {
                    if (texture && texture.dispose) {
                        texture.dispose();
                    }
                });
                this.textures = null;
            }
        }
        
        /**
         * Dispose and clean up all resources
         */
        dispose() {
            console.log('Disposing Artwork5...');
            
            // Stop data cycling
            this.stopDataCycling();
            
            // Deactivate thermal visualization
            this.deactivateThermalVisualization();
            
            // Event listeners are automatically cleaned up by centralized system
            
            // Remove thermal styles and container (CSS cleanup)
            this.removeThermalStyles();
            this.removeThermalContainer();
            
            // Dispose Three.js resources
            this.disposeThreeJsResources();
            
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
            const progressBar = document.getElementById('artwork5AudioProgress');
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
            this.thermalContainer = null;
            this.thermalLayers = [];
            
            super.dispose();
        }

        /**
         * Override base class setupControlButtons to use artwork5 audio
         */
        setupControlButtons() {
            console.log('[ARTWORK5] Setting up control buttons with custom audio handling');
            
            // Set up audio button (AR controls button, not main synth button)
            const audioButton = document.getElementById('audioBtn');
            if (audioButton) {
                console.log('[ARTWORK5] Found AR audio button, setting up artwork5 audio');
                audioButton.addEventListener('click', () => {
                    this.toggleArtworkAudio();
                });
            } else {
                console.warn('[ARTWORK5] AR audio button (audioBtn) not found');
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
            console.log('[ARTWORK5] Initializing artwork audio');
            
            this.artworkAudio = new Audio('https://heund.github.io/comp_ea/shared/sounds/artwork5.wav');
            this.artworkAudio.preload = 'auto';
            this.artworkAudio.loop = false;

            // Register with global audio manager
            if (this.globalAudioManager) {
                this.globalAudioManager.registerAudio(this.audioId, this.artworkAudio, 'element');
                console.log('[ARTWORK5] Audio registered with Global Audio Manager');
            }

            this.artworkAudio.addEventListener('loadedmetadata', () => {
                console.log('[ARTWORK5] Audio metadata loaded, duration:', this.artworkAudio.duration);
            });

            this.artworkAudio.addEventListener('timeupdate', () => {
                this.updateAudioProgress();
            });

            this.artworkAudio.addEventListener('ended', () => {
                this.stopArtworkAudio();
            });
            
            console.log('[ARTWORK5] Artwork audio initialized');
        }

        /**
         * Toggle artwork audio playback
         */
        toggleArtworkAudio() {
            console.log('[ARTWORK5] toggleArtworkAudio called, isAudioPlaying:', this.isAudioPlaying);
            
            if (!this.artworkAudio) {
                console.error('[ARTWORK5] No artwork audio element found');
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
                console.error('[ARTWORK5] No artwork audio element found');
                return;
            }

            console.log('[ARTWORK5] Attempting to play audio via Global Audio Manager...');
            
            if (this.globalAudioManager) {
                // Use global audio manager to play (this will stop all other audio first)
                this.globalAudioManager.playAudio(this.audioId);
                this.isAudioPlaying = true;
                console.log('[ARTWORK5] Artwork audio started via Global Audio Manager');
                
                // Show progress bar and update button
                this.showAudioProgress();
                this.updateAudioButton();
            } else {
                // Fallback to direct play
                this.artworkAudio.play().then(() => {
                    this.isAudioPlaying = true;
                    console.log('[ARTWORK5] Artwork audio started successfully (fallback)');
                    
                    // Show progress bar and update button
                    this.showAudioProgress();
                    this.updateAudioButton();
                }).catch(error => {
                    console.error('[ARTWORK5] Error playing artwork audio:', error);
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
                console.log('[ARTWORK5] Artwork audio stopped via Global Audio Manager');
            } else {
                this.artworkAudio.pause();
                this.artworkAudio.currentTime = 0;
                console.log('[ARTWORK5] Artwork audio stopped (fallback)');
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

            const progressFill = document.getElementById('artwork5ProgressFill');
            const timeDisplay = document.getElementById('artwork5AudioTime');
            
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
            const progressBar = document.getElementById('artwork5AudioProgress');
            if (progressBar) {
                progressBar.classList.add('visible');
                console.log('[ARTWORK5] Audio progress bar shown');
            }
        }

        /**
         * Hide audio progress bar
         */
        hideAudioProgress() {
            const progressBar = document.getElementById('artwork5AudioProgress');
            if (progressBar) {
                progressBar.classList.remove('visible');
                console.log('[ARTWORK5] Audio progress bar hidden');
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
                console.log('[ARTWORK5] Audio button updated, playing:', this.isAudioPlaying);
            } else {
                console.warn('[ARTWORK5] Audio button icon not found');
            }
        }

        /**
         * Create audio progress bar HTML and CSS
         */
        createAudioProgressBar() {
            console.log('[ARTWORK5] Creating audio progress bar');
            
            // Create CSS styles
            const style = document.createElement('style');
            style.textContent = `
                /* Audio Progress Bar for Artwork5 */
                .artwork5-audio-progress-container {
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
                
                .artwork5-audio-progress-container.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .artwork5-audio-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .artwork5-audio-title {
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: 500;
                }
                
                .artwork5-audio-time {
                    font-size: 11px;
                    color: #ffffff;
                    font-family: 'Inter', sans-serif;
                }
                
                .artwork5-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .artwork5-progress-fill {
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
            progressContainer.className = 'artwork5-audio-progress-container';
            progressContainer.id = 'artwork5AudioProgress';
            progressContainer.innerHTML = `
                <div class="artwork5-audio-info">
                    <div class="artwork5-audio-title">열간 압연 데이터 05: 온도 분포 및 열 전달 분석</div>
                    <div class="artwork5-audio-time" id="artwork5AudioTime">0:00 / 0:00</div>
                </div>
                <div class="artwork5-progress-bar">
                    <div class="artwork5-progress-fill" id="artwork5ProgressFill"></div>
                </div>
            `;
            
            document.body.appendChild(progressContainer);
            console.log('[ARTWORK5] Audio progress bar created');
        }
    }
    
    // Register this class with the global scope
    console.log('Artwork5 module loaded successfully');
    window.Artwork5 = Artwork5;
} // End of if statement checking for existing class
    