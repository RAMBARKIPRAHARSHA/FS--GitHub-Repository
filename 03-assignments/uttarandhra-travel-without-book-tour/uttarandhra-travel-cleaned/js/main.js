/**
 * Uttarandhra Odyssey - Main Application JavaScript
 * Orchestrates navigation, attraction filtering, modal lightbox, wishlist, dark mode & booking
 */

(function () {
  'use strict';

  // --- STATE MANAGEMENT ---
  const state = {
    selectedCity: 'all',
    selectedCategory: 'all',
    searchQuery: '',
    wishlist: JSON.parse(localStorage.getItem('uttarandhra_wishlist') || '[]'),
    activeTheme: localStorage.getItem('uttarandhra_theme') || 'light'
  };

  // --- DOM READY INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initWishlistBadge();
    initAttractionExplorer();
    initHeaderScroll();
    initWishlistDrawer();
  });

  // --- THEME TOGGLING ---
  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.activeTheme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      updateThemeIcon(themeBtn);
      themeBtn.addEventListener('click', () => {
        state.activeTheme = state.activeTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.activeTheme);
        localStorage.setItem('uttarandhra_theme', state.activeTheme);
        updateThemeIcon(themeBtn);
        showToast(`Switched to ${state.activeTheme} mode`, 'info');
      });
    }
  }

  function updateThemeIcon(btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = state.activeTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // --- HEADER & MOBILE NAV ---
  function initNavigation() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('is-open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });

      // Close mobile menu on link click
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
          const icon = mobileToggle.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        });
      });
    }
  }

  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- ATTRACTION EXPLORER & FILTERING ---
  function initAttractionExplorer() {
    const grid = document.getElementById('attractions-grid');
    if (!grid || !window.TRAVEL_DATA) return;

    // Check if on a specific city page (data-city attribute on body or container)
    const pageCity = document.body.dataset.pageCity;
    if (pageCity) {
      state.selectedCity = pageCity;
    }

    renderAttractions();

    // City Filter Pills
    const cityButtons = document.querySelectorAll('[data-filter-city]');
    cityButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        cityButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedCity = btn.dataset.filterCity;
        renderAttractions();
      });
    });

    // Category Filter Pills
    const categoryButtons = document.querySelectorAll('[data-filter-category]');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedCategory = btn.dataset.filterCategory;
        renderAttractions();
      });
    });

    // Search Input
    const searchInput = document.getElementById('explorer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderAttractions();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('explorer-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        renderAttractions();
      });
    }
  }

  function renderAttractions() {
    const grid = document.getElementById('attractions-grid');
    if (!grid || !window.TRAVEL_DATA) return;

    let items = window.TRAVEL_DATA.attractions.slice();

    // Filter by City
    if (state.selectedCity && state.selectedCity !== 'all') {
      items = items.filter(item => item.city === state.selectedCity);
    }

    // Filter by Category
    if (state.selectedCategory && state.selectedCategory !== 'all') {
      items = items.filter(item => item.category === state.selectedCategory);
    }

    // Filter by Search Query
    if (state.searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(state.searchQuery) ||
        item.shortDesc.toLowerCase().includes(state.searchQuery) ||
        item.cityName.toLowerCase().includes(state.searchQuery) ||
        (item.highlights && item.highlights.some(h => h.toLowerCase().includes(state.searchQuery)))
      );
    }

    // Sort items
    const sortSelect = document.getElementById('explorer-sort-select');
    if (sortSelect) {
      const val = sortSelect.value;
      if (val === 'rating-desc') {
        items.sort((a, b) => b.rating - a.rating);
      } else if (val === 'reviews-desc') {
        items.sort((a, b) => b.reviewsCount - a.reviewsCount);
      } else if (val === 'name-asc') {
        items.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    // Render Cards
    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-compass"></i>
          <h3>No Attractions Found</h3>
          <p>Try adjusting your search keywords or switching filters to explore more landmarks.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(attraction => {
      const isWishlisted = state.wishlist.includes(attraction.id);
      return `
        <article class="attraction-card" data-id="${attraction.id}">
          <div class="attraction-card-img-wrap">
            <img 
              src="${attraction.image}" 
              alt="${attraction.name}" 
              class="attraction-card-img" 
              loading="lazy"
              onerror="this.onerror=null;this.src='${attraction.fallbackImage}';"
            >
            <span class="badge-city-tag">${attraction.cityName}</span>
            <button 
              class="btn-wishlist-toggle ${isWishlisted ? 'is-active' : ''}" 
              data-wishlist-id="${attraction.id}" 
              aria-label="Add to Wishlist"
              title="Save to favorites"
            >
              <i class="${isWishlisted ? 'fas fa-heart' : 'far fa-heart'}"></i>
            </button>
          </div>
          <div class="attraction-card-content">
            <span class="attraction-category">${attraction.categoryName}</span>
            <h3 class="attraction-title">${attraction.name}</h3>
            <div class="rating-badge">
              <i class="fas fa-star"></i>
              <span>${attraction.rating}</span>
              <span style="color:var(--text-muted);font-weight:400;font-size:0.75rem;">(${attraction.reviewsCount.toLocaleString()} reviews)</span>
            </div>
            <p class="attraction-desc">${attraction.shortDesc}</p>
            <div class="attraction-card-footer">
              <span style="font-size:0.8rem;color:var(--text-muted);">
                <i class="far fa-clock"></i> ${attraction.timings.split('(')[0].trim().substring(0, 22)}...
              </span>

            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card event listeners
    attachCardListeners(grid);
  }

  function attachCardListeners(container) {
    // Wishlist Buttons
    container.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.wishlistId;
        toggleWishlist(id, btn);
      });
    });

  }

  // --- WISHLIST FUNCTIONALITY ---
  function toggleWishlist(id, btn) {
    const idx = state.wishlist.indexOf(id);
    let added = false;
    if (idx === -1) {
      state.wishlist.push(id);
      added = true;
    } else {
      state.wishlist.splice(idx, 1);
      added = false;
    }

    localStorage.setItem('uttarandhra_wishlist', JSON.stringify(state.wishlist));
    initWishlistBadge();

    if (btn) {
      btn.classList.toggle('is-active', added);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = added ? 'fas fa-heart' : 'far fa-heart';
      }
    }

    const item = window.TRAVEL_DATA ? window.TRAVEL_DATA.attractions.find(a => a.id === id) : null;
    const name = item ? item.name : 'Attraction';

    if (added) {
      showToast(`Added "${name}" to your wishlist!`, 'success');
    } else {
      showToast(`Removed "${name}" from your wishlist`, 'info');
    }

    renderWishlistDrawer();
  }

  function initWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-count');
    badges.forEach(b => {
      b.textContent = state.wishlist.length;
      b.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
    });
  }

  function initWishlistDrawer() {
    const openBtn = document.getElementById('wishlist-open-btn');
    const closeBtn = document.getElementById('wishlist-close-btn');
    const drawer = document.getElementById('wishlist-drawer');

    if (openBtn && drawer) {
      openBtn.addEventListener('click', () => {
        renderWishlistDrawer();
        drawer.classList.add('is-open');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('is-open');
      });
    }
  }

  function renderWishlistDrawer() {
    const list = document.getElementById('wishlist-items-container');
    if (!list || !window.TRAVEL_DATA) return;

    if (state.wishlist.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
          <i class="far fa-heart" style="font-size:2.5rem;margin-bottom:0.75rem;display:block;"></i>
          <p>Your travel wishlist is currently empty.</p>
          <span style="font-size:0.8rem;">Tap the heart icon on any attraction to save it for your journey!</span>
        </div>
      `;
      return;
    }

    const items = window.TRAVEL_DATA.attractions.filter(a => state.wishlist.includes(a.id));
    list.innerHTML = items.map(item => `
      <div class="wishlist-item">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="wishlist-thumb" 
          onerror="this.onerror=null;this.src='${item.fallbackImage}';"
        >
        <div class="wishlist-info">
          <h4 class="wishlist-item-title">${item.name}</h4>
          <p class="wishlist-item-city"><i class="fas fa-map-marker-alt"></i> ${item.cityName}</p>
          <button class="btn-details" style="font-size:0.78rem;padding:0;margin-top:0.3rem;" onclick="window.openAttractionModal('${item.id}')">
            View Details
          </button>
        </div>
        <button class="wishlist-remove-btn" title="Remove" onclick="window.toggleWishlist('${item.id}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `).join('');
  }

  // --- TOAST ALERTS ---
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    toast.innerHTML = `
      <i class="fas ${iconClass}" style="color:${type === 'success' ? 'var(--color-emerald)' : 'var(--color-primary)'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Export globally for HTML inline access
  window.openAttractionModal = openAttractionModal;
  window.toggleWishlist = toggleWishlist;
  window.showToast = showToast;

})();
