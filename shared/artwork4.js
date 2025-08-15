/**
 * Artwork4 - 열간 압연 데이터 04: 응력 누적 분포
 * Voronoi Stress Accumulation Visualization
 * Based on artwork4.html Three.js animation
 */

// Check if the class already exists to prevent redefinition
if (typeof window.Artwork4 === 'undefined') {

    class Artwork4 extends ArtworkBase {
        constructor() {
            super();
            this.title = '열간 압연 데이터 04: 응력 누적 분포';
            
            // Voronoi-specific properties
            this.voronoiCells = [];
            this.seedPoints = [];
            this.phaseBoundaryLine = null;
            this.currentColorScheme = 0;
            this.wireframeMode = false;
            this.showPhaseLines = true;
            
            // Color schemes for Voronoi visualization
            this.colorSchemes = [
                {
                    name: 'Thermal',
                    colors: ['#000428', '#004e92', '#009ffd', '#00d2ff']
                },
                {
                    name: 'Stress',
                    colors: ['#8360c3', '#2ebf91', '#52c234', '#cddc39']
                },
                {
                    name: 'Plasma',
                    colors: ['#f093fb', '#f5576c', '#4facfe', '#00f2fe']
                }
            ];
            
            // Embedded stress accumulation data
            this.stressData = [
                { x: 2, y: 3, total_accumulation: 85.2, phase: 'austenite' },
                { x: 5, y: 4, total_accumulation: 92.7, phase: 'ferrite' },
                { x: 8, y: 2, total_accumulation: 78.4, phase: 'pearlite' },
                { x: 3, y: 6, total_accumulation: 96.1, phase: 'austenite' },
                { x: 7, y: 7, total_accumulation: 88.9, phase: 'ferrite' },
                { x: 1, y: 5, total_accumulation: 73.6, phase: 'martensite' },
                { x: 9, y: 1, total_accumulation: 91.3, phase: 'bainite' },
                { x: 4, y: 8, total_accumulation: 84.7, phase: 'austenite' },
                { x: 6, y: 3, total_accumulation: 89.5, phase: 'ferrite' },
                { x: 2, y: 7, total_accumulation: 76.8, phase: 'pearlite' }
            ];
            
            // Data points for popup display
            this.dataPoints = [
                { label: '응력 누적도', value: 87.3, unit: 'MPa', baseValue: 87.3 },
                { label: '변형 속도', value: 0.045, unit: 's⁻¹', baseValue: 0.045 },
                { label: '온도 구배', value: 1250, unit: '°C', baseValue: 1250 },
                { label: '상 분포율', value: 68.2, unit: '%', baseValue: 68.2 }
            ];
            
            // Animation properties
            this.animationFrame = null;
            this.time = 0;
        }
        
        /**
         * Initialize the Voronoi visualization
         */
        async activate() {
            await super.activate();
            console.log('Activating 연간압연 데이터 04: 보로노이 응력 누적 시각화 module');
            
            this.initializeVisualization();
            this.createVoronoiVisualization();
            this.animate();
            this.startDataCycling();
        }
        
        /**
         * Initialize Three.js scene for Voronoi visualization
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
            this.camera.position.set(6, 6, 10);
            this.camera.lookAt(5, 4, 0);
            
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(this.renderer.domElement);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);
            
            // Controls
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
        
        /**
         * Create Voronoi diagram visualization
         */
        createVoronoiVisualization() {
            this.clearScene();
            
            // Generate sample points for Voronoi diagram
            const points2D = this.stressData.map(d => [d.x, d.y]);
            
            // Create Voronoi diagram using d3-delaunay
            const delaunay = d3.Delaunay.from(points2D);
            const voronoi = delaunay.voronoi([0, 0, 10, 8]);
            
            // Create Voronoi cells
            for (let i = 0; i < points2D.length; i++) {
                const cellPolygon = voronoi.cellPolygon(i);
                if (cellPolygon) {
                    this.createVoronoiCell(cellPolygon, this.stressData[i], i, this.stressData);
                }
            }
            
            // Create seed points
            this.createSeedPoints(points2D, this.stressData);
            
            // Create phase boundary
            this.createPhaseBoundary();
        }
        
        /**
         * Create individual Voronoi cell
         */
        createVoronoiCell(cellPolygon, data, index, allData) {
            if (!cellPolygon || cellPolygon.length < 3) return;
            
            const shape = new THREE.Shape();
            cellPolygon.forEach((point, i) => {
                if (i === 0) {
                    shape.moveTo(point[0], point[1]);
                } else {
                    shape.lineTo(point[0], point[1]);
                }
            });
            
            const maxAcc = Math.max(...allData.map(d => d.total_accumulation));
            const minAcc = Math.min(...allData.map(d => d.total_accumulation));
            const colorIntensity = maxAcc > minAcc ? (data.total_accumulation - minAcc) / (maxAcc - minAcc) : 0.5;
            
            const currentScheme = this.colorSchemes[this.currentColorScheme];
            const color = this.interpolateColor(currentScheme.colors, colorIntensity);
            
            const geometry = new THREE.ShapeGeometry(shape);
            const material = new THREE.MeshLambertMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                wireframe: this.wireframeMode
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.z = 0;
            mesh.receiveShadow = true;
            
            mesh.userData = { data: data, index: index };
            
            this.scene.add(mesh);
            this.voronoiCells.push(mesh);
        }
        
        /**
         * Create seed points visualization
         */
        createSeedPoints(points2D, pointData) {
            points2D.forEach((point, index) => {
                const data = pointData[index];
                
                const geometry = new THREE.SphereGeometry(0.1, 8, 6);
                const material = new THREE.MeshLambertMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8
                });
                
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(point[0], point[1], 0.05);
                sphere.userData = { data: data };
                
                this.scene.add(sphere);
                this.seedPoints.push(sphere);
            });
        }
        
        /**
         * Create phase boundary line
         */
        createPhaseBoundary() {
            if (!this.showPhaseLines) return;
            
            const points = [];
            for (let i = 0; i <= 50; i++) {
                const x = (i / 50) * 10;
                const y = 4 + Math.sin(x * 0.5) * 0.8;
                points.push(new THREE.Vector3(x, y, 0.01));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: 0xff6b6b,
                transparent: true,
                opacity: 0.6,
                linewidth: 2
            });
            
            this.phaseBoundaryLine = new THREE.Line(geometry, material);
            this.scene.add(this.phaseBoundaryLine);
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
         * Clear scene of Voronoi elements
         */
        clearScene() {
            // Remove Voronoi cells
            this.voronoiCells.forEach(cell => {
                this.scene.remove(cell);
                if (cell.geometry) cell.geometry.dispose();
                if (cell.material) cell.material.dispose();
            });
            this.voronoiCells = [];
            
            // Remove seed points
            this.seedPoints.forEach(point => {
                this.scene.remove(point);
                if (point.geometry) point.geometry.dispose();
                if (point.material) point.material.dispose();
            });
            this.seedPoints = [];
            
            // Remove phase boundary
            if (this.phaseBoundaryLine) {
                this.scene.remove(this.phaseBoundaryLine);
                if (this.phaseBoundaryLine.geometry) this.phaseBoundaryLine.geometry.dispose();
                if (this.phaseBoundaryLine.material) this.phaseBoundaryLine.material.dispose();
                this.phaseBoundaryLine = null;
            }
        }
        
        /**
         * Animation loop
         */
        animate() {
            if (!this.isActive) return;
            
            this.animationFrame = requestAnimationFrame(() => this.animate());
            this.time += 0.01;
            
            // Animate Voronoi cells with subtle pulsing
            this.voronoiCells.forEach((cell, index) => {
                const pulse = Math.sin(this.time * 2 + index * 0.5) * 0.05 + 1;
                cell.scale.set(pulse, pulse, 1);
            });
            
            // Animate seed points
            this.seedPoints.forEach((point, index) => {
                const bob = Math.sin(this.time * 3 + index * 0.8) * 0.02;
                point.position.z = 0.05 + bob;
            });
            
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
         * Update data points with realistic variations
         */
        updateDataPoints() {
            this.dataPoints.forEach((point, index) => {
                const variation = (Math.random() - 0.5) * 0.1;
                const newValue = point.baseValue * (1 + variation);
                point.value = Math.round(newValue * 100) / 100;
                
                const element = document.querySelector(`#data-overlay .metric:nth-child(${index + 1}) .metric-value`);
                if (element) {
                    element.textContent = point.value + ' ' + point.unit;
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
                    <h3>보로노이 응력 누적 분석</h3>
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
         * Cycle through different datasets
         */
        cycleDataset() {
            // Cycle color scheme
            this.currentColorScheme = (this.currentColorScheme + 1) % this.colorSchemes.length;
            
            // Regenerate visualization with new color scheme
            this.createVoronoiVisualization();
            
            // Update data points
            this.updateDataPoints();
        }
        
        /**
         * Deactivate the module
         */
        deactivate() {
            super.deactivate();
            console.log('Deactivating 연간압연 데이터 04: 보로노이 응력 누적 시각화 module');
            
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
            console.log('Cleaning up 연간압연 데이터 04: 보로노이 응력 누적 시각화 module');
            
            this.stopDataCycling();
            
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            
            // Clear Voronoi elements
            this.clearScene();
            
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
    window.Artwork4 = Artwork4;
    
} // End of if statement checking for existing class
