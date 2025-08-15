/**
 * Artwork5 - 열간 압연 데이터 05: 다중 열 변수 시계열 필드값
 * Thermal Dissipation Heatmap Visualization
 * Based on artwork5.html Three.js animation
 */

// Check if the class already exists to prevent redefinition
if (typeof window.Artwork5 === 'undefined') {

    class Artwork5 extends ArtworkBase {
        constructor() {
            super();
            this.title = '열간 압연 데이터 05: 다중 열 변수 시계열 필드값';
            
            // Thermal heatmap properties
            this.heatmapLayers = [];
            this.temperatureGradients = [];
            this.thermalContours = [];
            this.currentHeatmapMode = 0;
            this.animationSpeed = 1.0;
            
            // Thermal data for heatmap
            this.thermalData = {
                width: 20,
                height: 15,
                data: null // Will be generated in generateThermalData
            };
            
            // Color schemes for thermal visualization - exact same as original HTML
            this.colorSchemes = {
                thermal: [
                    new THREE.Color(0x000033), // Dark blue (cool)
                    new THREE.Color(0x000066), // Blue
                    new THREE.Color(0x003399), // Light blue
                    new THREE.Color(0x0066cc), // Cyan
                    new THREE.Color(0x00cc99), // Teal
                    new THREE.Color(0x66ff66), // Green
                    new THREE.Color(0xffff00), // Yellow
                    new THREE.Color(0xff9900), // Orange
                    new THREE.Color(0xff3300), // Red
                    new THREE.Color(0xff0066)  // Hot pink (very hot)
                ],
                industrial: [
                    new THREE.Color(0x1a1a2e), // Dark blue-gray
                    new THREE.Color(0x16213e), // Steel blue
                    new THREE.Color(0x0f3460), // Industrial blue
                    new THREE.Color(0x533483), // Purple-blue
                    new THREE.Color(0x7209b7), // Purple
                    new THREE.Color(0xa663cc), // Light purple
                    new THREE.Color(0xf39c12), // Orange
                    new THREE.Color(0xe74c3c), // Red
                    new THREE.Color(0xff6b35), // Bright orange
                    new THREE.Color(0xffffff)  // White hot
                ],
                cyber: [
                    new THREE.Color(0x001122), // Dark cyan
                    new THREE.Color(0x003344), // Dark teal
                    new THREE.Color(0x00ff41), // Bright green
                    new THREE.Color(0x00bfff), // Cyan
                    new THREE.Color(0x4dd0e1), // Light cyan
                    new THREE.Color(0x80ff80), // Light green
                    new THREE.Color(0xffff00), // Yellow
                    new THREE.Color(0xff8000), // Orange
                    new THREE.Color(0xff0080), // Pink
                    new THREE.Color(0xffffff)  // White
                ],
                monochrome: [
                    new THREE.Color(0x000000), // Black
                    new THREE.Color(0x222222), // Very dark gray
                    new THREE.Color(0x444444), // Dark gray
                    new THREE.Color(0x666666), // Medium dark gray
                    new THREE.Color(0x888888), // Medium gray
                    new THREE.Color(0xaaaaaa), // Light gray
                    new THREE.Color(0xcccccc), // Lighter gray
                    new THREE.Color(0xeeeeee), // Very light gray
                    new THREE.Color(0xffffff), // White
                    new THREE.Color(0xffffff)  // White
                ]
            };
            
            this.currentColorScheme = 'thermal';
            
            // Data points for popup display - based on actual thermal dataset
            this.dataPoints = [
                { label: 'Zone 1 온도', value: 1217, unit: '°C', baseValue: 1217 },
                { label: 'Zone 2 온도', value: 1134, unit: '°C', baseValue: 1134 },
                { label: '온도 구배', value: 250, unit: '°C/mm', baseValue: 250 },
                { label: '열 안정성', value: 0.91, unit: '', baseValue: 0.91 }
            ];
            
            // Animation properties
            this.animationFrame = null;
            this.time = 0;
        }
        
        /**
         * Get the exact thermal dataset from the original HTML file
         */
        getThermalDataset() {
            // Embedded thermal data - exact same as artwork5.html
            return [
                {zone_1: 1217.45, zone_2: 1133.62, zone_3: 967.77, zone_4_L: 997.18, zone_4_R: 996.13, temp_gradient: 249.7, thermal_stability: 0.913},
                {zone_1: 1229.47, zone_2: 1137.59, zone_3: 972.92, zone_4_L: 987.61, zone_4_R: 1000.68, temp_gradient: 256.6, thermal_stability: 0.853},
                {zone_1: 1210.71, zone_2: 1152.71, zone_3: 961.90, zone_4_L: 986.33, zone_4_R: 1022.54, temp_gradient: 248.8, thermal_stability: 0.946},
                {zone_1: 1212.46, zone_2: 1151.57, zone_3: 1002.13, zone_4_L: 987.71, zone_4_R: 1026.14, temp_gradient: 224.7, thermal_stability: 0.938},
                {zone_1: 1236.19, zone_2: 1167.79, zone_3: 971.20, zone_4_L: 1006.91, zone_4_R: 1019.96, temp_gradient: 265.0, thermal_stability: 0.819},
                {zone_1: 1228.63, zone_2: 1169.43, zone_3: 1006.22, zone_4_L: 1021.98, zone_4_R: 1028.46, temp_gradient: 222.4, thermal_stability: 0.857},
                {zone_1: 1265.76, zone_2: 1178.55, zone_3: 1003.74, zone_4_L: 1027.83, zone_4_R: 1054.80, temp_gradient: 262.0, thermal_stability: 0.671},
                {zone_1: 1271.26, zone_2: 1176.89, zone_3: 998.08, zone_4_L: 1028.30, zone_4_R: 1040.06, temp_gradient: 273.2, thermal_stability: 0.644},
                {zone_1: 1282.11, zone_2: 1183.20, zone_3: 1016.06, zone_4_L: 1045.10, zone_4_R: 1050.06, temp_gradient: 266.0, thermal_stability: 0.589},
                {zone_1: 1278.37, zone_2: 1211.23, zone_3: 1031.18, zone_4_L: 1028.01, zone_4_R: 1059.49, temp_gradient: 250.4, thermal_stability: 0.608},
                {zone_1: 1294.43, zone_2: 1213.21, zone_3: 1012.95, zone_4_L: 1039.69, zone_4_R: 1059.10, temp_gradient: 281.5, thermal_stability: 0.528},
                {zone_1: 1292.95, zone_2: 1230.40, zone_3: 1035.10, zone_4_L: 1054.56, zone_4_R: 1057.89, temp_gradient: 257.8, thermal_stability: 0.535},
                {zone_1: 1300.00, zone_2: 1227.17, zone_3: 1037.36, zone_4_L: 1064.97, zone_4_R: 1066.93, temp_gradient: 262.6, thermal_stability: 0.500},
                {zone_1: 1300.00, zone_2: 1221.83, zone_3: 1048.45, zone_4_L: 1060.67, zone_4_R: 1070.49, temp_gradient: 251.6, thermal_stability: 0.500}
            ];
        }

        /**
         * Generate thermal data for heatmap using exact dataset
         */
        generateThermalData(width, height) {
            const thermalDataset = this.getThermalDataset();
            const data = [];
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // Map position to thermal zone data - same logic as original HTML
                    const normalizedX = (x / width) * 15 - 7.5; // Convert to -7.5 to 7.5 range
                    const dataIndex = Math.floor(((normalizedX + 7.5) / 15) * thermalDataset.length);
                    const data_point = thermalDataset[Math.min(Math.max(dataIndex, 0), thermalDataset.length - 1)];
                    
                    // Calculate temperature based on position and zone data - exact same logic
                    let temperature;
                    if (normalizedX < -3) {
                        temperature = data_point.zone_1;
                    } else if (normalizedX < 0) {
                        temperature = data_point.zone_2;
                    } else if (normalizedX < 3) {
                        temperature = data_point.zone_3;
                    } else {
                        temperature = (data_point.zone_4_L + data_point.zone_4_R) / 2;
                    }
                    
                    // Add variation based on Y position and thermal stability - same as original
                    const normalizedY = (y / height) * 10 - 5; // Convert to -5 to 5 range
                    const variation = (Math.sin(normalizedY * 0.5) * data_point.thermal_stability * 50);
                    temperature += variation;
                    
                    data.push(temperature);
                }
            }
            return data;
        }
        
        /**
         * Initialize the thermal heatmap visualization
         */
        async activate() {
            await super.activate();
            console.log('Activating 열간압연 데이터 05: 열 확산 히트맵 시각화 module');
            
            // Generate thermal data
            this.thermalData.data = this.generateThermalData(this.thermalData.width, this.thermalData.height);
            
            this.initializeVisualization();
            this.createThermalHeatmap();
            this.animate();
            this.startDataCycling();
        }
        
        /**
         * Initialize Three.js scene for thermal visualization
         */
        initializeVisualization() {
            const container = document.getElementById('visualization-container');
            if (!container) return;
            
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a0a);
            
            // Camera setup
            const aspect = container.clientWidth / container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
            this.camera.position.set(10, 8, 15);
            this.camera.lookAt(10, 7.5, 0);
            
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(this.renderer.domElement);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
            directionalLight.position.set(15, 15, 10);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);
            
            // Controls
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
        
        /**
         * Create thermal heatmap visualization - exact same as original HTML
         */
        createThermalHeatmap() {
            this.clearHeatmap();
            
            const gridSize = 20;
            const geometry = new THREE.PlaneGeometry(15, 10, gridSize - 1, gridSize - 1);
            const positions = geometry.attributes.position.array;
            const colors = [];
            const thermalDataset = this.getThermalDataset();

            // Generate height and color data based on thermal zones - exact same logic
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                
                // Map position to thermal zone data
                const dataIndex = Math.floor(((x + 7.5) / 15) * thermalDataset.length);
                const data = thermalDataset[Math.min(Math.max(dataIndex, 0), thermalDataset.length - 1)];
                
                // Calculate temperature based on position and zone data
                let temperature;
                if (x < -3) {
                    temperature = data.zone_1;
                } else if (x < 0) {
                    temperature = data.zone_2;
                } else if (x < 3) {
                    temperature = data.zone_3;
                } else {
                    temperature = (data.zone_4_L + data.zone_4_R) / 2;
                }
                
                // Add some variation based on Y position and thermal stability
                const variation = (Math.sin(y * 0.5) * data.thermal_stability * 50);
                temperature += variation;
                
                // Set height based on temperature
                positions[i + 2] = (temperature - 1000) * 0.01;
                
                // Set color based on temperature
                const normalizedTemp = (temperature - 950) / 350; // Normalize to 0-1
                const currentScheme = this.colorSchemes[this.currentColorScheme];
                const colorIndex = Math.floor(normalizedTemp * (currentScheme.length - 1));
                const color = currentScheme[Math.min(Math.max(colorIndex, 0), currentScheme.length - 1)];
                
                colors.push(color.r, color.g, color.b);
            }

            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.computeVertexNormals();

            const material = new THREE.MeshLambertMaterial({ 
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });

            this.heatmapMesh = new THREE.Mesh(geometry, material);
            this.heatmapMesh.position.set(0, 0, 0);
            this.scene.add(this.heatmapMesh);
            this.heatmapLayers.push(this.heatmapMesh);

            // Add contour lines
            this.createContourLines();
        }
        
        /**
         * Create contour lines - exact same as original HTML
         */
        createContourLines() {
            const contourGroup = new THREE.Group();
            const contourLevels = [1000, 1050, 1100, 1150, 1200, 1250];
            
            contourLevels.forEach((level, index) => {
                const points = [];
                const resolution = 50;
                
                for (let i = 0; i <= resolution; i++) {
                    const angle = (i / resolution) * Math.PI * 2;
                    const radius = 2 + index * 1.5;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const z = (level - 1000) * 0.01 + 0.1;
                    
                    points.push(new THREE.Vector3(x, y, z));
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color: 0x666666,
                    transparent: true,
                    opacity: 0.5
                });
                
                const contourLine = new THREE.Line(geometry, material);
                contourGroup.add(contourLine);
            });
            
            this.scene.add(contourGroup);
            this.thermalContours.push(contourGroup);
        }
        
        /**
         * Interpolate color from color array
         */
        interpolateColor(colors, t) {
            t = Math.max(0, Math.min(1, t));
            const index = t * (colors.length - 1);
            const i = Math.floor(index);
            const f = index - i;
            
            if (i >= colors.length - 1) {
                return new THREE.Color(colors[colors.length - 1]);
            }
            
            const c1 = new THREE.Color(colors[i]);
            const c2 = new THREE.Color(colors[i + 1]);
            
            return c1.lerp(c2, f);
        }
        
        /**
         * Clear heatmap elements
         */
        clearHeatmap() {
            // Remove heatmap layers
            this.heatmapLayers.forEach(layer => {
                this.scene.remove(layer);
                if (layer.geometry) layer.geometry.dispose();
                if (layer.material) layer.material.dispose();
            });
            this.heatmapLayers = [];
            
            // Remove thermal contours
            this.thermalContours.forEach(contour => {
                this.scene.remove(contour);
                if (contour.geometry) contour.geometry.dispose();
                if (contour.material) contour.material.dispose();
            });
            this.thermalContours = [];
        }
        
        /**
         * Animation loop - exact same as original HTML
         */
        animate() {
            if (!this.isActive) return;
            
            this.animationFrame = requestAnimationFrame(() => this.animate());

            if (this.heatmapMesh) {
                // Gentle rotation animation
                this.heatmapMesh.rotation.z += 0.003;
                
                // Subtle breathing effect on the heatmap
                const time = Date.now() * 0.001;
                this.heatmapMesh.scale.setScalar(1 + Math.sin(time * 0.5) * 0.02);
            }

            // Update controls and render
            if (this.controls) this.controls.update();
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        /**
         * Start data cycling for popup
         */
        startDataCycling() {
            if (this.dataCycleInterval) {
                clearInterval(this.dataCycleInterval);
            }
            
            this.dataCycleInterval = setInterval(() => {
                if (this.overlayVisible) {
                    this.updateDataPoints();
                }
            }, 2000);
        }
        
        /**
         * Stop data cycling
         */
        stopDataCycling() {
            if (this.dataCycleInterval) {
                clearInterval(this.dataCycleInterval);
                this.dataCycleInterval = null;
            }
        }
        
        /**
         * Update data points with actual thermal dataset values
         */
        updateDataPoints() {
            const thermalDataset = this.getThermalDataset();
            const randomIndex = Math.floor(Math.random() * thermalDataset.length);
            const currentData = thermalDataset[randomIndex];
            
            // Update with actual dataset values
            this.dataPoints[0].value = Math.round(currentData.zone_1 * 100) / 100;
            this.dataPoints[1].value = Math.round(currentData.zone_2 * 100) / 100;
            this.dataPoints[2].value = Math.round(currentData.temp_gradient * 100) / 100;
            this.dataPoints[3].value = Math.round(currentData.thermal_stability * 1000) / 1000;
            
            // Update UI elements
            this.dataPoints.forEach((point, index) => {
                const element = document.querySelector(`#data-overlay .metric:nth-child(${index + 1}) .metric-value`);
                if (element) {
                    element.textContent = point.value + (point.unit ? ' ' + point.unit : '');
                }
            });
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
         * Show data overlay with current metrics
         */
        showDataOverlay() {
            const overlay = document.getElementById('data-overlay');
            if (!overlay) return;
            
            // Update overlay content
            const content = `
                <div class="data-content">
                    <h3>열 확산 히트맵 분석</h3>
                    <div class="metrics-grid">
                        ${this.dataPoints.map(point => `
                            <div class="metric">
                                <span class="metric-label">${point.label}</span>
                                <span class="metric-value">${point.value} ${point.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            overlay.innerHTML = content;
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            this.overlayVisible = true;
            
            // Add click handler to cycle through datasets
            overlay.addEventListener('click', () => this.cycleDataset());
        }
        
        /**
         * Hide data overlay
         */
        hideDataOverlay() {
            const overlay = document.getElementById('data-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.innerHTML = '';
                }, 300);
            }
            this.overlayVisible = false;
        }
        
        /**
         * Cycle through different color schemes
         */
        cycleDataset() {
            // Cycle through color schemes like original HTML
            const schemes = Object.keys(this.colorSchemes);
            const currentIndex = schemes.indexOf(this.currentColorScheme);
            this.currentColorScheme = schemes[(currentIndex + 1) % schemes.length];
            
            // Regenerate heatmap with new color scheme
            this.createThermalHeatmap();
            
            // Update data points
            this.updateDataPoints();
        }
        
        /**
         * Deactivate the module
         */
        deactivate() {
            super.deactivate();
            console.log('Deactivating 열간압연 데이터 05: 열 확산 히트맵 시각화 module');
            
            if (this.overlayVisible) {
                this.hideDataOverlay();
            }
            
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            
            this.stopDataCycling();
        }
        
        /**
         * Clean up resources
         */
        cleanup() {
            super.cleanup();
            console.log('Cleaning up 열간압연 데이터 05: 열 확산 히트맵 시각화 module');
            
            this.stopDataCycling();
            
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            
            // Clear heatmap elements
            this.clearHeatmap();
            
            // Dispose of Three.js objects
            if (this.controls) {
                this.controls.dispose();
                this.controls = null;
            }
            
            if (this.renderer) {
                const container = document.getElementById('visualization-container');
                if (container && this.renderer.domElement) {
                    container.removeChild(this.renderer.domElement);
                }
                this.renderer.dispose();
                this.renderer = null;
            }
            
            this.scene = null;
            this.camera = null;
        }
    }
    
    // Register this class with the global scope
    window.Artwork5 = Artwork5;
    
} // End of if statement checking for existing class
