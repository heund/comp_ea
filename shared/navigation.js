/* Simple Exhibition Navigation - Direct Navigation (No Iframe) */

class ExhibitionNavigator {
    constructor() {
        // Simple page sequence like original - metal-slab.html is the landing/home page
        this.pages = {
            'metal-slab.html': {
                title: 'Metal Slab Simulation',
                next: 'artwork1_clean.html',
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
        this.navButton = document.getElementById('navButton');
        this.backButton = document.getElementById('backButton');
        this.statusIndicator = document.getElementById('statusIndicator');
        
        // Only create if they don't exist (for artwork pages that might not have them)
        if (!this.navButton) {
            const navHTML = `
                <!-- Simple Navigation (like original) -->
                <button class="nav-button" id="navButton">
                    <i class="bi bi-arrow-right"></i>
                </button>
                
                <button class="back-button" id="backButton">
                    <i class="bi bi-arrow-left"></i>
                </button>
                
                <button class="home-button" id="homeButton">
                    <i class="bi bi-house"></i>
                </button>
                
                <div class="status-indicator" id="statusIndicator">
                    Loading...
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', navHTML);
            
            // Re-get the elements after creating them
            this.navButton = document.getElementById('navButton');
            this.backButton = document.getElementById('backButton');
            this.homeButton = document.getElementById('homeButton');
            this.statusIndicator = document.getElementById('statusIndicator');
        } else {
            // If elements exist, also get the home button
            this.homeButton = document.getElementById('homeButton');
        }
    }

    setupEventListeners() {
        // Navigation button - go to next page
        if (this.navButton) {
            this.navButton.addEventListener('click', () => {
                // Play click sound if available
                if (typeof playClickSound === 'function') {
                    playClickSound();
                }
                this.navigateNext();
            });
        }

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
            this.showLoadingScreen();
            
            // Preload the next page
            if (currentPageInfo && currentPageInfo.next) {
                const nextPage = currentPageInfo.next;
                
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
            
            // Create the loading content
            const loadingContent = document.createElement('div');
            loadingContent.className = 'loading-content';
            
            // Create loading spinner
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            // Create loading text
            const loadingText = document.createElement('div');
            loadingText.className = 'loading-text';
            loadingText.textContent = '로딩 중...'; // 'Loading...' in Korean
            
            // Assemble the loading screen
            loadingContent.appendChild(spinner);
            loadingContent.appendChild(loadingText);
            loadingScreen.appendChild(loadingContent);
            
            // Add the CSS for the loading screen
            const style = document.createElement('style');
            style.textContent = `
                .glassmorphism-loading {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    overflow: hidden;
                }
                
                .glassmorphism-loading::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, 
                        rgba(255, 0, 128, 0.2), 
                        rgba(0, 128, 255, 0.2), 
                        rgba(128, 255, 0, 0.2), 
                        rgba(255, 0, 128, 0.2));
                    z-index: -1;
                    animation: gradientMove 8s linear infinite;
                    opacity: 0.7;
                }
                
                @keyframes gradientMove {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                
                .glassmorphism-loading.visible {
                    opacity: 1;
                }
                
                .loading-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
                }
                
                .loading-spinner {
                    width: 60px;
                    height: 60px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: #ffffff;
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: 20px;
                }
                
                .loading-text {
                    color: white;
                    font-family: 'Noto Serif KR', serif;
                    font-size: 18px;
                    font-weight: 400;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(loadingScreen);
        }
        
        // Show the loading screen
        setTimeout(() => {
            loadingScreen.classList.add('visible');
        }, 10);
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
        
        // Always ensure next button is visible
        if (this.navButton) {
            this.navButton.style.opacity = '1';
            this.navButton.style.visibility = 'visible';
        }
    }
}

// Auto-initialize when DOM is ready (all pages now have navigation)
document.addEventListener('DOMContentLoaded', () => {
    window.exhibitionNavigator = new ExhibitionNavigator();
});
