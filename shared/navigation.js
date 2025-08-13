/* Simple Exhibition Navigation - Direct Navigation (No Iframe) */

class ExhibitionNavigator {
    constructor() {
        // Simple page sequence like original - metal-slab.html is the landing/home page
        this.pages = {
            'metal-slab.html': {
                title: 'Metal Slab Simulation',
                next: 'artwork1.html',
                prev: null  // No previous page (home page)
            },
            'artwork1.html': {
                title: 'Machine Correction Network AR',
                next: 'artwork2.html',
                prev: 'metal-slab.html'
            },
            'artwork2.html': {
                title: 'Compression Spheres AR',
                next: 'artwork3.html',
                prev: 'artwork1.html'
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
                this.navigateNext();
            });
        }

        // Back button - go to previous page
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                this.navigatePrevious();
            });
        }

        // Home button - go to home page
        if (this.homeButton) {
            this.homeButton.addEventListener('click', () => {
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
        if (currentPageInfo && currentPageInfo.next) {
            this.navigateTo(currentPageInfo.next);
        } else {
            // If no next page, go back to start
            this.navigateTo('metal-slab.html');
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

        // Show/hide back button (previous page)
        if (this.backButton) {
            const currentPageInfo = this.pages[this.currentPage];
            if (currentPageInfo && currentPageInfo.prev) {
                this.backButton.classList.add('visible');
            } else {
                this.backButton.classList.remove('visible');
            }
        }

        // Show/hide home button
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
});
