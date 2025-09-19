// Netflix Clone Interactive Features
class NetflixClone {
    constructor() {
        this.myList = JSON.parse(localStorage.getItem('myList')) || [];
        this.likedMovies = JSON.parse(localStorage.getItem('likedMovies')) || [];
        this.dislikedMovies = JSON.parse(localStorage.getItem('dislikedMovies')) || [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupCarousel();
        this.updateMyListDisplay();
        this.updateButtonStates();
        this.setupLazyLoading();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.getElementById('hamburger');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const closeMenu = document.getElementById('closeMenu');

        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
        });

        closeMenu?.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
        });

        // Close mobile menu when clicking on overlay
        mobileMenuOverlay?.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                hamburger.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
            }
        });

        // Mobile menu navigation
        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
            });
        });

        // Movie card interactions
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    this.openMovieModal(card);
                }
            });
        });

        // Card action buttons
        document.querySelectorAll('.like-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLike(btn.dataset.movieId, btn);
            });
        });

        document.querySelectorAll('.dislike-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDislike(btn.dataset.movieId, btn);
            });
        });

        document.querySelectorAll('.add-list-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMyList(btn.dataset.movieId, btn);
            });
        });

        // Modal interactions
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');

        closeModal?.addEventListener('click', () => {
            this.closeMovieModal();
        });

        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeMovieModal();
            }
        });

        // Modal action buttons
        document.getElementById('modalLikeBtn')?.addEventListener('click', () => {
            const movieId = document.getElementById('movieModal').dataset.movieId;
            this.toggleLike(movieId, document.getElementById('modalLikeBtn'));
        });

        document.getElementById('modalDislikeBtn')?.addEventListener('click', () => {
            const movieId = document.getElementById('movieModal').dataset.movieId;
            this.toggleDislike(movieId, document.getElementById('modalDislikeBtn'));
        });

        document.getElementById('modalAddToListBtn')?.addEventListener('click', () => {
            const movieId = document.getElementById('movieModal').dataset.movieId;
            this.toggleMyList(movieId, document.getElementById('modalAddToListBtn'));
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchInput?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterMovies();
        });

        searchBtn?.addEventListener('click', () => {
            searchInput.focus();
        });

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterMovies();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMovieModal();
                hamburger.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollEffects() {
        const navbar = document.getElementById('navbar');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    setupCarousel() {
        const scrollBtns = document.querySelectorAll('.scroll-btn');
        
        scrollBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                const scroller = document.getElementById('trendingScroller');
                const scrollAmount = 300;
                
                if (direction === 'left') {
                    scroller.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            });
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let scrollLeft = 0;
        const scroller = document.getElementById('trendingScroller');

        scroller.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - scroller.offsetLeft;
            scrollLeft = scroller.scrollLeft;
        });

        scroller.addEventListener('touchmove', (e) => {
            if (!startX) return;
            e.preventDefault();
            const x = e.touches[0].pageX - scroller.offsetLeft;
            const walk = (x - startX) * 2;
            scroller.scrollLeft = scrollLeft - walk;
        });

        scroller.addEventListener('touchend', () => {
            startX = 0;
        });
    }

    openMovieModal(card) {
        const movieData = {
            id: card.dataset.movieId,
            title: card.dataset.title,
            year: card.dataset.year,
            rating: card.dataset.rating,
            duration: card.dataset.duration,
            description: card.dataset.description,
            poster: card.querySelector('img').src
        };

        // Populate modal with movie data
        document.getElementById('modalTitle').textContent = movieData.title;
        document.getElementById('modalYear').textContent = movieData.year;
        document.getElementById('modalRating').textContent = `★ ${movieData.rating}`;
        document.getElementById('modalDuration').textContent = movieData.duration;
        document.getElementById('modalDescription').textContent = movieData.description;
        document.getElementById('modalPoster').src = movieData.poster;
        document.getElementById('movieModal').dataset.movieId = movieData.id;

        // Update button states
        this.updateModalButtonStates(movieData.id);

        // Show modal
        const modalOverlay = document.getElementById('modalOverlay');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMovieModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    toggleLike(movieId, button) {
        const isLiked = this.likedMovies.includes(movieId);
        
        if (isLiked) {
            this.likedMovies = this.likedMovies.filter(id => id !== movieId);
            button.classList.remove('active');
        } else {
            this.likedMovies.push(movieId);
            button.classList.add('active');
            // Remove from disliked if it was disliked
            this.dislikedMovies = this.dislikedMovies.filter(id => id !== movieId);
            // Update dislike button
            const dislikeBtn = document.querySelector(`[data-movie-id="${movieId}"].dislike-btn-small, #modalDislikeBtn`);
            if (dislikeBtn) dislikeBtn.classList.remove('active');
        }
        
        localStorage.setItem('likedMovies', JSON.stringify(this.likedMovies));
        localStorage.setItem('dislikedMovies', JSON.stringify(this.dislikedMovies));
        
        // Add visual feedback
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
    }

    toggleDislike(movieId, button) {
        const isDisliked = this.dislikedMovies.includes(movieId);
        
        if (isDisliked) {
            this.dislikedMovies = this.dislikedMovies.filter(id => id !== movieId);
            button.classList.remove('active');
        } else {
            this.dislikedMovies.push(movieId);
            button.classList.add('active');
            // Remove from liked if it was liked
            this.likedMovies = this.likedMovies.filter(id => id !== movieId);
            // Update like button
            const likeBtn = document.querySelector(`[data-movie-id="${movieId}"].like-btn-small, #modalLikeBtn`);
            if (likeBtn) likeBtn.classList.remove('active');
        }
        
        localStorage.setItem('likedMovies', JSON.stringify(this.likedMovies));
        localStorage.setItem('dislikedMovies', JSON.stringify(this.dislikedMovies));
        
        // Add visual feedback
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
    }

    toggleMyList(movieId, button) {
        const card = document.querySelector(`[data-movie-id="${movieId}"]`);
        const movieData = {
            id: movieId,
            title: card.dataset.title,
            poster: card.querySelector('img').src,
            year: card.dataset.year,
            rating: card.dataset.rating,
            duration: card.dataset.duration,
            category: card.dataset.category,
            description: card.dataset.description
        };

        const isInList = this.myList.some(movie => movie.id === movieId);
        
        if (isInList) {
            this.myList = this.myList.filter(movie => movie.id !== movieId);
            button.classList.remove('active');
            button.textContent = button.textContent.includes('My List') ? '+ My List' : '+';
        } else {
            this.myList.push(movieData);
            button.classList.add('active');
            button.textContent = button.textContent.includes('My List') ? '✓ My List' : '✓';
        }
        
        localStorage.setItem('myList', JSON.stringify(this.myList));
        this.updateMyListDisplay();
        
        // Add visual feedback
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
    }

    updateMyListDisplay() {
        const myListContainer = document.getElementById('myListContainer');
        const emptyList = document.getElementById('emptyList');
        
        if (this.myList.length === 0) {
            emptyList.style.display = 'block';
            return;
        }
        
        emptyList.style.display = 'none';
        
        // Clear existing content except empty list message
        const existingCards = myListContainer.querySelectorAll('.my-list-card');
        existingCards.forEach(card => card.remove());
        
        this.myList.forEach(movie => {
            const cardElement = document.createElement('div');
            cardElement.className = 'my-list-card fade-in';
            cardElement.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <button class="remove-from-list" data-movie-id="${movie.id}">×</button>
            `;
            
            // Add click event to open modal
            cardElement.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-from-list')) {
                    // Create a temporary card element for modal opening
                    const tempCard = document.createElement('div');
                    tempCard.dataset.movieId = movie.id;
                    tempCard.dataset.title = movie.title;
                    tempCard.dataset.year = movie.year;
                    tempCard.dataset.rating = movie.rating;
                    tempCard.dataset.duration = movie.duration;
                    tempCard.dataset.description = movie.description;
                    tempCard.innerHTML = `<img src="${movie.poster}" alt="${movie.title}">`;
                    
                    this.openMovieModal(tempCard);
                }
            });
            
            // Add remove button event
            const removeBtn = cardElement.querySelector('.remove-from-list');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromMyList(movie.id);
            });
            
            myListContainer.appendChild(cardElement);
        });
    }

    removeFromMyList(movieId) {
        this.myList = this.myList.filter(movie => movie.id !== movieId);
        localStorage.setItem('myList', JSON.stringify(this.myList));
        this.updateMyListDisplay();
        this.updateButtonStates();
    }

    updateButtonStates() {
        // Update like buttons
        this.likedMovies.forEach(movieId => {
            const buttons = document.querySelectorAll(`[data-movie-id="${movieId}"].like-btn-small`);
            buttons.forEach(btn => btn.classList.add('active'));
        });

        // Update dislike buttons
        this.dislikedMovies.forEach(movieId => {
            const buttons = document.querySelectorAll(`[data-movie-id="${movieId}"].dislike-btn-small`);
            buttons.forEach(btn => btn.classList.add('active'));
        });

        // Update add to list buttons
        this.myList.forEach(movie => {
            const buttons = document.querySelectorAll(`[data-movie-id="${movie.id}"].add-list-btn-small`);
            buttons.forEach(btn => {
                btn.classList.add('active');
                btn.textContent = '✓';
            });
        });
    }

    updateModalButtonStates(movieId) {
        const modalLikeBtn = document.getElementById('modalLikeBtn');
        const modalDislikeBtn = document.getElementById('modalDislikeBtn');
        const modalAddToListBtn = document.getElementById('modalAddToListBtn');

        // Reset states
        modalLikeBtn.classList.remove('active');
        modalDislikeBtn.classList.remove('active');
        modalAddToListBtn.classList.remove('active');
        modalAddToListBtn.textContent = '+ My List';

        // Update based on current state
        if (this.likedMovies.includes(movieId)) {
            modalLikeBtn.classList.add('active');
        }
        
        if (this.dislikedMovies.includes(movieId)) {
            modalDislikeBtn.classList.add('active');
        }
        
        if (this.myList.some(movie => movie.id === movieId)) {
            modalAddToListBtn.classList.add('active');
            modalAddToListBtn.textContent = '✓ My List';
        }
    }

    filterMovies() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const title = card.dataset.title?.toLowerCase() || '';
            const category = card.dataset.category?.toLowerCase() || '';
            
            const matchesSearch = !this.searchQuery || title.includes(this.searchQuery);
            const matchesCategory = this.currentFilter === 'all' || category === this.currentFilter;
            
            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
            } else {
                card.classList.add('hidden');
                card.classList.remove('fade-in');
            }
        });
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
}

// Initialize the Netflix Clone when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NetflixClone();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add hover sound effect simulation (visual feedback)
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 10px 30px rgba(229, 9, 20, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
        });
    });

    // Add typing effect for search placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const placeholders = [
            'Search movies, TV shows...',
            'Find your next binge...',
            'Discover new content...',
            'What are you watching?'
        ];
        
        let currentPlaceholder = 0;
        
        setInterval(() => {
            searchInput.placeholder = placeholders[currentPlaceholder];
            currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        }, 3000);
    }

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const box = document.querySelector('.box');
        
        if (hero && box) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            box.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // Add random movie suggestions
    const suggestions = [
        "Try watching 'Stranger Things' - it's trending!",
        "New episodes of 'The Crown' are available",
        "Don't miss 'Money Heist' - action-packed thriller",
        "Comedy lovers will enjoy 'Wednesday'",
        "Fantasy fans should check out 'The Witcher'"
    ];

    // Show random suggestion every 10 seconds
    setInterval(() => {
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #e50914;
            z-index: 1000;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = randomSuggestion;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }, 10000);
});