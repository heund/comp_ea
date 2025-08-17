/* Simple Exhibition Navigation - Direct Navigation (No Iframe) */

class ExhibitionNavigator {
    constructor() {
        // Simple page sequence like original - metal-slab.html is the landing/home page
        this.pages = {
            'metal-slab.html': {
                title: 'Metal Slab Simulation',
                next: 'ar_detection.html',
                prev: null  // No previous page (home page)
            },
            'artwork1_clean.html': {
                title: 'Machine Correction Network AR',
                next: 'artwork2.html',
                prev: 'metal-slab.html'
            },
            'artwork2.html': {
                title: 'Compression Spheres AR',
                next: 'artwork3.html',
                prev: 'artwork1_clean.html'
            },
            'artwork3.html': {
                title: 'Audio Wave Analysis AR',
                next: 'artwork5.html',
                prev: 'artwork2.html'
            },
            'artwork5.html': {
                title: 'Thermal Contour Analysis AR',
                next: 'metal-slab.html',  // Loop back to home (metal slab)
                prev: 'artwork3.html'
            }
        };

        this.currentPage = this.getCurrentPageName();
        this.init();
    }

    init() {
        // Add navigation to all pages (metal_slab.html is the home page)
        this.createNavigationElements();
        this.setupEventListeners();
        this.updateUI();
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    }

    createNavigationElements() {
        // Get existing navigation elements (they should already exist in HTML)
        this.backButton = document.getElementById('backButton');
        this.homeButton = document.getElementById('homeButton');
        this.statusIndicator = document.getElementById('statusIndicator');
        
        // Only create if they don't exist (for artwork pages that might not have them)
        if (!this.backButton) {
            const navHTML = `
                <!-- Simple Navigation with SVG icons -->
                <button class="back-button" id="backButton">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                </button>
                
                <button class="home-button" id="homeButton">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </button>
                
                <div class="status-indicator" id="statusIndicator">
                    Loading...
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', navHTML);
            
            // Re-get the elements after creating them
            this.backButton = document.getElementById('backButton');
            this.homeButton = document.getElementById('homeButton');
            this.statusIndicator = document.getElementById('statusIndicator');
        } else if (!this.homeButton) {
            // If back button exists but home button doesn't, get the home button
            this.homeButton = document.getElementById('homeButton');
        }
    }

    setupEventListeners() {
        // Back button - go to previous page
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                // Play click sound if available
                if (typeof playClickSound === 'function') {
                    playClickSound();
                }
                this.navigatePrevious();
            });
        }

        // Home button - go to home page
        if (this.homeButton) {
            this.homeButton.addEventListener('click', () => {
                // Play click sound if available
                if (typeof playClickSound === 'function') {
                    playClickSound();
                }
                this.navigateHome();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                this.navigateNext();
            } else if (event.key === 'ArrowLeft') {
                this.navigatePrevious();
            } else if (event.key === 'Home' || event.key === 'Escape') {
                this.navigateHome();
            }
        });

        // PWA app visibility handling for audio management
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // App is being backgrounded/minimized
                console.log('App backgrounded - pausing audio');
                // Pause Tone.js
                if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                    Tone.context.suspend();
                }
                // Pause HTML5 audio
                const audioElements = document.querySelectorAll('audio');
                audioElements.forEach(audio => {
                    if (!audio.paused) {
                        audio.pause();
                        audio.dataset.wasPlaying = 'true';
                    }
                });
            } else {
                // App is being foregrounded/restored
                console.log('App foregrounded - resuming audio');
                // Resume Tone.js
                if (typeof Tone !== 'undefined' && Tone.context.state === 'suspended') {
                    Tone.context.resume();
                }
                // Resume HTML5 audio that was playing
                const audioElements = document.querySelectorAll('audio');
                audioElements.forEach(audio => {
                    if (audio.dataset.wasPlaying === 'true') {
                        audio.play();
                        delete audio.dataset.wasPlaying;
                    }
                });
            }
        });

        // Handle page hide/show events for iOS PWA
        window.addEventListener('pagehide', () => {
            console.log('Page hidden - pausing audio');
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                Tone.context.suspend();
            }
        });

        window.addEventListener('pageshow', () => {
            console.log('Page shown - resuming audio');
            if (typeof Tone !== 'undefined' && Tone.context.state === 'suspended') {
                Tone.context.resume();
            }
        });
    }

    navigateNext() {
        const currentPageInfo = this.pages[this.currentPage];
        
        // Show loading screen if we're on metal-slab.html
        if (this.currentPage === 'metal-slab.html') {
            // Ensure the loading screen is visible
            this.showPersistentLoadingScreen();
            
            // For AR pages, don't preload with iframe (prevents duplicate camera permission)
            if (currentPageInfo && currentPageInfo.next) {
                const nextPage = currentPageInfo.next;
                
                // Check if the next page is an AR page (contains "artwork" or "ar_" in the name)
                const isARPage = nextPage.includes('artwork') || nextPage.includes('ar_');
                
                if (isARPage) {
                    // For AR pages, just show loading screen and navigate directly after a delay
                    // This prevents duplicate camera permission requests
                    setTimeout(() => {
                        // Set a flag to indicate we're coming from a loading screen
                        sessionStorage.setItem('loadingScreenActive', 'true');
                        this.navigateTo(nextPage);
                    }, 1500); // 1.5 second delay for loading animation
                } else {
                    // For non-AR pages, use the preloading iframe approach
                    // Create a hidden iframe to preload the next page
                    const preloadFrame = document.createElement('iframe');
                    preloadFrame.style.width = '0';
                    preloadFrame.style.height = '0';
                    preloadFrame.style.border = 'none';
                    preloadFrame.style.position = 'absolute';
                    preloadFrame.style.left = '-9999px';
                    preloadFrame.style.top = '-9999px';
                    preloadFrame.src = nextPage;
                    
                    // Listen for the iframe to load
                    preloadFrame.onload = () => {
                        // Wait a bit more to ensure everything is loaded and show animation
                        setTimeout(() => {
                            // Remove the preload frame
                            if (preloadFrame.parentNode) {
                                preloadFrame.parentNode.removeChild(preloadFrame);
                            }
                            
                            // Navigate to the next page
                            this.navigateTo(nextPage);
                        }, 1500); // 1.5 second additional delay after preload completes
                    };
                    
                    // Add the preload frame to the document
                    document.body.appendChild(preloadFrame);
                    
                    // Set a fallback timeout in case the iframe load event doesn't fire
                    setTimeout(() => {
                        if (preloadFrame.parentNode) {
                            preloadFrame.parentNode.removeChild(preloadFrame);
                            this.navigateTo(nextPage);
                        }
                    }, 5000); // 5 second fallback timeout
                }
            } else {
                // If no next page defined, go back to start after delay
                setTimeout(() => {
                    this.navigateTo('metal-slab.html');
                }, 1500);
            }
        } else {
            // Normal navigation for other pages
            if (currentPageInfo && currentPageInfo.next) {
                this.navigateTo(currentPageInfo.next);
            } else {
                // If no next page, go back to start
                this.navigateTo('metal-slab.html');
            }
        }
    }

    navigatePrevious() {
        const currentPageInfo = this.pages[this.currentPage];
        if (currentPageInfo && currentPageInfo.prev) {
            this.navigateTo(currentPageInfo.prev);
        } else {
            // If no previous page, go back to start
            this.navigateTo('metal-slab.html');
        }
    }

    navigateHome() {
        this.navigateTo('metal-slab.html');
    }

    navigateTo(pageName) {
        if (pageName === this.currentPage) return;
        
        // For artwork1_clean.html, we need to handle the AR camera initialization
        if (pageName === 'artwork1_clean.html') {
            // Store the target page in sessionStorage so artwork1_clean.html knows we're coming from loading screen
            sessionStorage.setItem('comingFromLoadingScreen', 'true');
        }
        
        // Direct navigation (no iframe)
        window.location.href = pageName;
    }

    showLoadingScreen() {
        // Create loading screen if it doesn't exist
        let loadingScreen = document.getElementById('glassmorphismLoading');
        
        if (!loadingScreen) {
            // Create the loading screen element
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'glassmorphismLoading';
            loadingScreen.className = 'glassmorphism-loading';
            
            // Create loading spinner only (no container, no text)
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            // Assemble the loading screen (just the spinner)
            loadingScreen.appendChild(spinner);
            
            // Add the CSS for the loading screen
            const style = document.createElement('style');
            style.textContent = `
                /* Glassmorphism Loading Screen */
                .glassmorphism-loading {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.5s ease;
                    overflow: hidden;
                }
                
                /* Simple black background */
                .glassmorphism-loading::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000000;
                    z-index: -2;
                    opacity: 1;
                }
                
                /* Glassmorphism overlay */
                .glassmorphism-loading::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.1);
                    z-index: -1;
                }
                
                .glassmorphism-loading.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                @keyframes gradientMove {
                    0% {
                        background-position: 0% 0%;
                    }
                    25% {
                        background-position: 50% 50%;
                    }
                    50% {
                        background-position: 100% 100%;
                    }
                    75% {
                        background-position: 50% 50%;
                    }
                    100% {
                        background-position: 0% 0%;
                    }
                }
                
                .loading-spinner {
                    width: 80px;
                    height: 80px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: #ffffff;
                    animation: spin 1s ease-in-out infinite;
                    z-index: 1;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(loadingScreen);
            
            // Expose global methods to control the loading screen
            window.persistentLoadingScreen = {
                show: () => this.showPersistentLoadingScreen(),
                hide: () => this.hidePersistentLoadingScreen(),
                setARMode: (isAR) => this.setARLoadingMode(isAR)
            };
        }
        
        // Show the loading screen
        setTimeout(() => {
            loadingScreen.classList.add('visible');
        }, 10);
    }
    
    // Method to show the persistent loading screen
    showPersistentLoadingScreen() {
        const loadingScreen = document.getElementById('glassmorphismLoading');
        if (loadingScreen) {
            loadingScreen.classList.add('visible');
        } else {
            // Create it if it doesn't exist yet
            this.showLoadingScreen();
        }
    }
    
    // Method to hide the persistent loading screen
    hidePersistentLoadingScreen() {
        const loadingScreen = document.getElementById('glassmorphismLoading');
        if (loadingScreen) {
            loadingScreen.classList.remove('visible');
        }
    }
    
    // Method to set AR loading mode (can be used to modify the loading screen appearance for AR)
    setARLoadingMode(isAR) {
        const loadingScreen = document.getElementById('glassmorphismLoading');
        if (loadingScreen) {
            if (isAR) {
                loadingScreen.setAttribute('data-mode', 'ar');
            } else {
                loadingScreen.removeAttribute('data-mode');
            }
        }
    }
    
    updateUI() {
        const pageInfo = this.pages[this.currentPage];
        if (!pageInfo) return;
        
        // Update status indicator
        if (this.statusIndicator) {
            this.statusIndicator.textContent = pageInfo.title;
            this.statusIndicator.classList.add('visible');

            // Hide status indicator after a few seconds
            setTimeout(() => {
                this.statusIndicator.classList.remove('visible');
            }, 3000);
        }

        // Show/hide back button (previous page) - only if it exists
        if (this.backButton) {
            const currentPageInfo = this.pages[this.currentPage];
            if (currentPageInfo && currentPageInfo.prev) {
                this.backButton.classList.add('visible');
            } else {
                this.backButton.classList.remove('visible');
            }
        }

        // Show/hide home button - only if it exists
        if (this.homeButton) {
            if (this.currentPage === 'metal-slab.html') {
                this.homeButton.classList.remove('visible');
            } else {
                this.homeButton.classList.add('visible');
            }
        }
    }
}

// Auto-initialize when DOM is ready (all pages now have navigation)
document.addEventListener('DOMContentLoaded', () => {
    window.exhibitionNavigator = new ExhibitionNavigator();
    
    // Check if this is an AR page and set up AR loading screen integration
    if (document.querySelector('a-scene')) {
        // This is an AR page, set up AR loading screen integration
        const scene = document.querySelector('a-scene');
        const marker = document.getElementById('marker');
        
        if (scene) {
            // When the AR.js scene is loaded and camera is ready
            scene.addEventListener('loaded', () => {
                console.log('A-Frame scene loaded, camera initializing...');
                // Keep the loading screen visible until marker is found or timeout
                // The loading screen will be hidden by the markerFound event
            });
        }
        
        if (marker) {
            marker.addEventListener('markerFound', () => {
                console.log('AR Marker detected! Hiding loading screen.');
                // Hide the loading screen when marker is found
                if (window.persistentLoadingScreen) {
                    window.persistentLoadingScreen.hide();
                }
            });
        }
    }
});
