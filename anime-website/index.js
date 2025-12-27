    // ============================================
    // HEADER SCROLL BEHAVIOR
    // ============================================

    function showHero() {
    const hero = document.getElementById('home');
    if (hero) hero.style.display = 'block';
}

function hideHero() {
    const hero = document.getElementById('home');
    if (hero) hero.style.display = 'none';
}

    let header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    // ============================================
    // THEME TOGGLE FUNCTIONALITY
    // ============================================

    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const html = document.documentElement;
        
        // Check for saved theme preference or default to dark
        const currentTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme, themeIcon);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme, themeIcon);
            });
        }
    }

    function updateThemeIcon(theme, iconElement) {
        if (!iconElement) return;
        
        if (theme === 'dark') {
            iconElement.className = 'bx bx-moon';
        } else {
            iconElement.className = 'bx bx-sun';
        }
    }

    // ============================================
    // ANIME API INTEGRATION
    // ============================================

    const API_BASE_URL = 'https://api.jikan.moe/v4/anime';
    let searchTimeout = null;
    let currentAnimeData = [];
    let heroSwiperInstance = null;
    let comingSwiperInstance = null;
    // Track hero anime IDs to prevent duplication in trending grid
    let heroAnimeIds = [];

    /**
     * Fetch anime data from Jikan API
     * @param {string} searchTerm - Optional search term
     * @param {number} limit - Number of results to fetch (default: 20)
     * @param {string} orderBy - Order by field (default: 'popularity')
     * @returns {Promise<Array>} Array of anime data
     */
    async function fetchAnime(searchTerm = '', limit = 20, orderBy = 'popularity') {
        try {
            // Add delay to respect API rate limits (3 requests per second)
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const url = searchTerm 
                ? `${API_BASE_URL}?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
                : `${API_BASE_URL}?order_by=${orderBy}&limit=${limit}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limit exceeded, wait and retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return fetchAnime(searchTerm, limit, orderBy);
                }
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching anime:', error);
            throw error;
        }
    }

    /**
     * Get image URL from anime data with fallback
     * @param {Object} anime - Anime data object
     * @returns {string} Image URL or empty string
     */
    function getAnimeImageUrl(anime) {
        if (!anime || !anime.images) return '';
        return anime.images.jpg?.large_image_url || anime.images.jpg?.image_url || '';
    }

    /**
     * Get initials from title for placeholder
     * @param {string} title - Anime title
     * @returns {string} Initials (max 2 characters)
     */
    function getTitleInitials(title) {
        if (!title) return '?';
        const words = title.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return title.substring(0, 2).toUpperCase();
    }

    /**
     * Handle image load with fade-in effect
     * @param {HTMLImageElement} img - Image element
     */
    function handleImageLoad(img) {
        img.classList.add('loaded');
        img.classList.remove('error');
    }

    /**
     * Handle image error with placeholder
     * @param {HTMLImageElement} img - Image element
     * @param {string} title - Anime title for placeholder
     */
    function handleImageError(img, title) {
        img.classList.add('error');
        img.classList.remove('loaded');
        
        // Create placeholder if it doesn't exist
        const poster = img.parentElement;
        if (!poster.querySelector('.card-poster-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'card-poster-placeholder';
            placeholder.textContent = getTitleInitials(title);
            poster.appendChild(placeholder);
        }
    }

    /**
     * Trim synopsis to 150 characters
     * @param {string} synopsis - Full synopsis text
     * @returns {string} Trimmed synopsis
     */
    function trimSynopsis(synopsis) {
        if (!synopsis) return 'No synopsis available.';
        if (synopsis.length <= 150) return synopsis;
        return synopsis.substring(0, 150).trim() + '...';
    }

    /**
     * Format genres as a string
     * @param {Array} genres - Array of genre objects
     * @returns {string} Formatted genre string
     */
    function formatGenres(genres) {
        if (!genres || genres.length === 0) return 'Unknown';
        return genres.map(g => g.name).join(', ');
    }

    /**
     * Render anime cards to the DOM
     * @param {Array} animeList - Array of anime data
     */
    function renderAnime(animeList) {
        const container = document.getElementById('movies-container');
        const loadingMessage = document.getElementById('loading-message');
        const errorMessage = document.getElementById('error-message');
        
        // Hide loading and error messages
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        
        // Clear existing content
        container.innerHTML = '';
        
        if (!animeList || animeList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-primary); grid-column: 1 / -1; padding: 2rem;">No anime found. Try a different search term.</p>';
            return;
        }
        
        // Create anime cards with new design
        animeList.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'anime-card';
            card.setAttribute('data-anime-id', anime.mal_id);
            
            const imageUrl = getAnimeImageUrl(anime);
            const title = anime.title || anime.title_english || 'Unknown Title';
            const genres = anime.genres && anime.genres.length > 0 ? anime.genres : [];
            const score = anime.score ? anime.score.toFixed(1) : 'N/A';
            const synopsis = trimSynopsis(anime.synopsis);
            
            // Build genre chips
            const genreChips = genres.length > 0
                ? genres.slice(0, 2).map(g => `<span class="genre-chip">${g.name}</span>`).join('')
                : '<span class="genre-chip">Unknown</span>';
            
            card.innerHTML = `
                <div class="card-poster">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy">` : `<div class="card-poster-placeholder">${getTitleInitials(title)}</div>`}
                    <div class="card-overlay">
                        <div class="card-overlay-content">${synopsis}</div>
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${title}</h3>
                    <div class="card-genres">${genreChips}</div>
                    <span class="card-score">⭐ ${score}</span>
                </div>
            `;
            
            // Handle image loading if image exists
            if (imageUrl) {
                const img = card.querySelector('img');
                if (img) {
                    img.addEventListener('load', () => handleImageLoad(img));
                    img.addEventListener('error', () => handleImageError(img, title));
                }
            }
            
            // Add click event to open modal
            card.addEventListener('click', () => openAnimeModal(anime));
            
            container.appendChild(card);
        });
    }

    /**
     * Show loading state
     */
    function showLoading() {
        const loadingMessage = document.getElementById('loading-message');
        const errorMessage = document.getElementById('error-message');
        const container = document.getElementById('movies-container');
        
        if (loadingMessage) loadingMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
        if (container) container.innerHTML = '';
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    function showError(message) {
        const loadingMessage = document.getElementById('loading-message');
        const errorMessage = document.getElementById('error-message');
        const container = document.getElementById('movies-container');
        
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        if (container) container.innerHTML = '';
    }

    /**
     * Load and display anime (default or search)
     * @param {string} searchTerm - Optional search term
     */
    async function loadAnime(searchTerm = '') {
        showLoading();
        
        try {
            const animeData = await fetchAnime(searchTerm, 20);
            
            // Filter out hero anime to prevent duplication (only for default trending view, not search)
            let filteredAnime = animeData;
            if (!searchTerm && heroAnimeIds.length > 0) {
                filteredAnime = animeData.filter(anime => !heroAnimeIds.includes(anime.mal_id));
            }
            
            currentAnimeData = filteredAnime;
            renderAnime(filteredAnime);
        } catch (error) {
            showError('Failed to load anime. Please check your internet connection and try again.');
            console.error('Error loading anime:', error);
        }
    }

    /**
     * Load hero section with trending anime from API
     * Hero represents a category of trending anime, not a single featured anime
     */
    async function loadHeroSection() {
        const heroLoading = document.getElementById('hero-loading');
        const heroSwiper = document.getElementById('hero-swiper');
        const heroWrapper = document.getElementById('hero-wrapper');
        
        try {
            // Fetch multiple trending anime for hero slider (5-7 anime)
            const heroAnimeRaw = await fetchAnime('', 12, 'popularity');

// 🔥 FILTER UNIQUE TITLES
const seenTitles = new Set();
const heroAnime = heroAnimeRaw.filter(anime => {
    const title = anime.title || anime.title_english;
    if (!title || seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
}).slice(0, 5); // ✅ LIMIT TO 5 UNIQUE ANIME

// Store hero anime IDs (after filtering)
heroAnimeIds = heroAnime.map(anime => anime.mal_id);

            
            heroWrapper.innerHTML = '';
            
            // Static badge text - all slides show "TRENDING" to represent trending category
            const badge = "TRENDING";
            
            heroAnime.forEach((anime, index) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide hero-slide';
                
                // Store slide index for reference (not badge-related)
                slide.setAttribute('data-slide-index', index);
                
                const imageUrl = getAnimeImageUrl(anime);
                const title = anime.title || anime.title_english || 'Unknown Title';
                const synopsis = trimSynopsis(anime.synopsis);
                
                slide.innerHTML = `
                    <div class="hero-background">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ''}
                    </div>
                    <div class="hero-content">
                        <div class="hero-badge">${badge}</div>
                        <h1 class="hero-title">${title}</h1>
                        <p class="hero-description">${synopsis}</p>
                        <div class="hero-actions">
                            <button class="btn-primary">
                                <i class='bx bx-play'></i> Watch Now
                            </button>
                            <button class="btn-secondary">
                                <i class='bx bx-info-circle'></i> More Info
                            </button>
                        </div>
                    </div>
                `;
                
                // Handle image loading
                if (imageUrl) {
                    const img = slide.querySelector('img');
                    if (img) {
                        img.addEventListener('load', () => handleImageLoad(img));
                        img.addEventListener('error', () => {
                            img.classList.add('error');
                            // Keep the slide but without image
                        });
                    }
                }
                
                // Add click handlers for buttons
                const moreInfoBtn = slide.querySelector('.btn-secondary');
                if (moreInfoBtn) {
                    moreInfoBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openAnimeModal(anime);
                    });
                }
                
                const watchBtn = slide.querySelector('.btn-primary');
                if (watchBtn) {
                    watchBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openAnimeModal(anime);
                    });
                }
                
                heroWrapper.appendChild(slide);
            });
            
            // Hide loading, show swiper
            if (heroLoading) heroLoading.style.display = 'none';
            if (heroSwiper) heroSwiper.style.display = 'block';
            
            // Initialize or update Swiper
            if (heroSwiperInstance) {
                heroSwiperInstance.update();
            } else {
                initHeroSwiper();
            }
        } catch (error) {
            console.error('Error loading hero section:', error);
            if (heroLoading) heroLoading.style.display = 'none';
            if (heroSwiper) heroSwiper.style.display = 'block';
        }
    }

    /**
     * Load coming soon section with upcoming anime from API
     */
    async function loadComingSoonSection() {
        const comingLoading = document.getElementById('coming-loading');
        const comingSwiper = document.getElementById('coming-swiper');
        const comingWrapper = document.getElementById('coming-wrapper');
        
        try {
            // Show loading
            if (comingLoading) comingLoading.style.display = 'flex';
            
            // Fetch upcoming anime (filtered by status or use top rated)
            const comingAnime = await fetchAnime('', 10, 'score');
            
            if (!comingAnime || comingAnime.length === 0) {
                if (comingLoading) comingLoading.style.display = 'none';
                return;
            }
            
            comingWrapper.innerHTML = '';
            
            comingAnime.forEach(anime => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                
                const imageUrl = getAnimeImageUrl(anime);
                const title = anime.title || anime.title_english || 'Unknown Title';
                const genres = anime.genres && anime.genres.length > 0 
                    ? anime.genres[0].name 
                    : 'Unknown';
                
                slide.innerHTML = `
                    <div class="anime-card-small">
                        <div class="card-poster">
                            ${imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy">` : `<div class="card-poster-placeholder">${getTitleInitials(title)}</div>`}
                        </div>
                        <div class="card-info">
                            <h3>${title}</h3>
                            <span>${genres}</span>
                        </div>
                    </div>
                `;
                
                // Handle image loading
                if (imageUrl) {
                    const img = slide.querySelector('img');
                    if (img) {
                        img.addEventListener('load', () => handleImageLoad(img));
                        img.addEventListener('error', () => handleImageError(img, title));
                    }
                }
                
                // Add click event
                slide.addEventListener('click', () => openAnimeModal(anime));
                
                comingWrapper.appendChild(slide);
            });
            
            // Hide loading
            if (comingLoading) comingLoading.style.display = 'none';
            
            // Initialize or update Swiper
            if (comingSwiperInstance) {
                comingSwiperInstance.update();
            } else {
                initComingSwiper();
            }
        } catch (error) {
            console.error('Error loading coming soon section:', error);
            if (comingLoading) comingLoading.style.display = 'none';
        }
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================

    /**
     * Debounced search function
     * @param {string} searchTerm - Search term
     */
    function searchAnime(searchTerm) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        const term = searchTerm.trim();

        if (term === '') {
            // 🔁 BACK TO DEFAULT PAGE
            showHero();
            loadAnime(); // trending
        } else {
            // 🔍 SEARCH MODE
            hideHero();
            loadAnime(term);
        }
    }, 300);
}


    // ============================================
    // ABOUT MODAL FUNCTIONALITY
    // ============================================

    /**
     * Open About AniVerse modal
     */
    function openAboutModal() {
        const modal = document.getElementById('about-modal');
        if (!modal) return;
        
        modal.style.display = 'block';
        
        // Close modal function
        const closeModal = () => {
            modal.style.display = 'none';
        };
        
        // Close modal when clicking the X
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        // Close modal when clicking outside (only set once)
        if (!modal.hasAttribute('data-listener-added')) {
            modal.setAttribute('data-listener-added', 'true');
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // Initialize everything on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize theme toggle
        initThemeToggle();
        
        // Initialize About button
        const aboutBtn = document.getElementById('about-btn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAboutModal();
            });
        }
        
        // Initialize search input
        const searchInput = document.getElementById('search-input');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                searchAnime(searchTerm);
            });
        }
        
        // Load all sections from API
        // Load hero section first to track IDs, then load trending grid (which filters out hero anime)
        loadHeroSection().then(() => {
            showHero();
            // After hero section loads, load trending grid (will filter out hero anime)
            loadAnime();
        });
        // Coming soon can load in parallel
        loadComingSoonSection();
    });

    // ============================================
    // MODAL FUNCTIONALITY
    // ============================================

    /**
     * Open anime details modal
     * @param {Object} anime - Anime data object
     */
    function openAnimeModal(anime) {
        const modal = document.getElementById('anime-modal');
        const modalPoster = document.getElementById('modal-poster');
        const modalTitle = document.getElementById('modal-title');
        const modalScore = document.getElementById('modal-score');
        const modalStatus = document.getElementById('modal-status');
        const modalEpisodes = document.getElementById('modal-episodes');
        const modalGenres = document.getElementById('modal-genres');
        const modalSynopsis = document.getElementById('modal-synopsis');
        
        if (!modal) return;
        
        // Set modal content with API image
        const imageUrl = getAnimeImageUrl(anime);
        if (imageUrl) {
            modalPoster.src = imageUrl;
            modalPoster.alt = anime.title || 'Anime Poster';
            modalPoster.style.display = 'block';
            
            // Handle image load/error
            modalPoster.onload = () => {
                modalPoster.classList.add('loaded');
            };
            modalPoster.onerror = () => {
                modalPoster.style.display = 'none';
                // Could add placeholder here if needed
            };
        } else {
            modalPoster.style.display = 'none';
        }
        
        modalTitle.textContent = anime.title || anime.title_english || 'Unknown Title';
        
        modalScore.textContent = anime.score ? `⭐ Score: ${anime.score.toFixed(1)}` : 'Score: N/A';
        
        modalStatus.textContent = `Status: ${anime.status || 'Unknown'}`;
        
        modalEpisodes.textContent = anime.episodes ? `Episodes: ${anime.episodes}` : 'Episodes: Unknown';
        
        // Set genres
        modalGenres.innerHTML = '';
        if (anime.genres && anime.genres.length > 0) {
            anime.genres.forEach(genre => {
                const genreSpan = document.createElement('span');
                genreSpan.textContent = genre.name;
                modalGenres.appendChild(genreSpan);
            });
        } else {
            modalGenres.innerHTML = '<span>Unknown</span>';
        }
        
        // Set full synopsis
        modalSynopsis.textContent = anime.synopsis || 'No synopsis available.';
        
        // Show modal
        modal.style.display = 'block';
        
        // Close modal function
        const closeModal = () => {
            modal.style.display = 'none';
        };
        
        // Close modal when clicking the X
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        // Close modal when clicking outside (only set once)
        if (!modal.hasAttribute('data-listener-added')) {
            modal.setAttribute('data-listener-added', 'true');
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }


    // ============================================
    // SWIPER INITIALIZATION
    // ============================================

    /**
     * Initialize Hero Swiper
     */
    function initHeroSwiper() {
        const heroSwiperEl = document.querySelector('.hero-swiper');
        if (!heroSwiperEl || heroSwiperInstance) return;
        
        heroSwiperInstance = new Swiper(".hero-swiper", {
            spaceBetween: 0,
            centeredSlides: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".hero-swiper .swiper-pagination",
                clickable: true,
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            loop: true,
        });
    }

    /**
     * Initialize Coming Soon Swiper
     */
    function initComingSwiper() {
        const comingSwiperEl = document.querySelector('.coming-swiper');
        if (!comingSwiperEl || comingSwiperInstance) return;
        
        comingSwiperInstance = new Swiper(".coming-swiper", {
            spaceBetween: 16,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            breakpoints: {
                0: {
                    slidesPerView: 2,
                },
                480: {
                    slidesPerView: 3,
                },
                768: {
                    slidesPerView: 4,
                },
                1024: {
                    slidesPerView: 5,
                },
                1280: {
                    slidesPerView: 6,
                },
            },
        });
    }
