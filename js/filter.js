/**
 * SAREE SHOWROOM - COLLECTIONS FILTER & SORT ENGINE
 */

const filterState = {
  fabric: 'all',
  occasion: 'all',
  priceRange: 'all',
  color: 'all',
  sortBy: 'featured',
  searchQuery: ''
};

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('collectionsProductGrid');
  if (!gridContainer) return;

  initFilterEvents();
  parseUrlParams();
  renderProducts();
});

function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const fabricParam = urlParams.get('fabric');
  const occasionParam = urlParams.get('occasion');
  const searchParam = urlParams.get('search');

  if (searchParam) {
    filterState.searchQuery = searchParam.trim().toLowerCase();
    const searchInput = document.getElementById('collectionSearchInput');
    if (searchInput) searchInput.value = searchParam;
  }

  if (fabricParam) {
    filterState.fabric = fabricParam;
    const matchingBtn = document.querySelector(`[data-filter-fabric="${fabricParam}"]`);
    if (matchingBtn) {
      document.querySelectorAll('[data-filter-fabric]').forEach(b => b.classList.remove('active'));
      matchingBtn.classList.add('active');
    }
  }

  if (occasionParam) {
    filterState.occasion = occasionParam;
    const matchingOccasion = document.querySelector(`[data-filter-occasion="${occasionParam}"]`);
    if (matchingOccasion) {
      document.querySelectorAll('[data-filter-occasion]').forEach(b => b.classList.remove('active'));
      matchingOccasion.classList.add('active');
    }
  }
}

function initFilterEvents() {
  // Fabric filter pills
  const fabricBtns = document.querySelectorAll('[data-filter-fabric]');
  fabricBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      fabricBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterState.fabric = btn.getAttribute('data-filter-fabric');
      renderProducts();
    });
  });

  // Occasion filter pills
  const occasionBtns = document.querySelectorAll('[data-filter-occasion]');
  occasionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      occasionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterState.occasion = btn.getAttribute('data-filter-occasion');
      renderProducts();
    });
  });

  // Price range filters
  const priceRadios = document.querySelectorAll('input[name="priceFilter"]');
  priceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      filterState.priceRange = radio.value;
      renderProducts();
    });
  });

  // Color Swatch filters
  const colorBtns = document.querySelectorAll('[data-filter-color]');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedColor = btn.getAttribute('data-filter-color');
      if (filterState.color === selectedColor) {
        btn.classList.remove('active');
        filterState.color = 'all';
      } else {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.color = selectedColor;
      }
      renderProducts();
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById('productSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterState.sortBy = sortSelect.value;
      renderProducts();
    });
  }

  // Live Search Input
  const searchInput = document.getElementById('collectionSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterState.searchQuery = e.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  // Clear all filters button
  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterState.fabric = 'all';
      filterState.occasion = 'all';
      filterState.priceRange = 'all';
      filterState.color = 'all';
      filterState.searchQuery = '';
      filterState.sortBy = 'featured';

      // Reset DOM states
      fabricBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
      occasionBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
      colorBtns.forEach(b => b.classList.remove('active'));
      priceRadios.forEach((r, i) => r.checked = (i === 0));
      if (sortSelect) sortSelect.value = 'featured';
      if (searchInput) searchInput.value = '';

      renderProducts();
    });
  }

  // Mobile Filter Sidebar Toggle
  const mobileFilterBtn = document.getElementById('mobileFilterToggleBtn');
  const filterSidebar = document.getElementById('collectionFilterSidebar');
  const closeFilterSidebarBtn = document.getElementById('closeFilterSidebarBtn');

  if (mobileFilterBtn && filterSidebar) {
    mobileFilterBtn.addEventListener('click', () => {
      filterSidebar.classList.add('active');
    });
  }

  if (closeFilterSidebarBtn && filterSidebar) {
    closeFilterSidebarBtn.addEventListener('click', () => {
      filterSidebar.classList.remove('active');
    });
  }
}

function getFilteredProducts() {
  return SAREE_PRODUCTS.filter(product => {
    // Fabric filter
    if (filterState.fabric !== 'all') {
      if (product.category !== filterState.fabric && product.fabric.toLowerCase() !== filterState.fabric.toLowerCase()) {
        return false;
      }
    }

    // Occasion filter
    if (filterState.occasion !== 'all') {
      if (product.occasion !== filterState.occasion) {
        return false;
      }
    }

    // Color filter
    if (filterState.color !== 'all') {
      if (product.color !== filterState.color) {
        return false;
      }
    }

    // Price range filter
    if (filterState.priceRange !== 'all') {
      if (filterState.priceRange === 'under10k' && product.price > 10000) return false;
      if (filterState.priceRange === '10k-25k' && (product.price < 10000 || product.price > 25000)) return false;
      if (filterState.priceRange === '25k-50k' && (product.price < 25000 || product.price > 50000)) return false;
      if (filterState.priceRange === 'above50k' && product.price < 50000) return false;
    }

    // Search query
    if (filterState.searchQuery) {
      const matchTitle = product.title.toLowerCase().includes(filterState.searchQuery);
      const matchFabric = product.fabric.toLowerCase().includes(filterState.searchQuery);
      const matchOccasion = product.occasionName.toLowerCase().includes(filterState.searchQuery);
      const matchDesc = product.description.toLowerCase().includes(filterState.searchQuery);
      if (!matchTitle && !matchFabric && !matchOccasion && !matchDesc) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filterState.sortBy === 'price-low') return a.price - b.price;
    if (filterState.sortBy === 'price-high') return b.price - a.price;
    if (filterState.sortBy === 'rating') return b.rating - a.rating;
    if (filterState.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0; // default featured
  });
}

function renderProducts() {
  const container = document.getElementById('collectionsProductGrid');
  const countDisplay = document.getElementById('filteredCountDisplay');
  if (!container) return;

  const filtered = getFilteredProducts();

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} Handwoven Sarees`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i data-lucide="sparkles" style="width: 56px; height: 56px; color: var(--color-gold); margin-bottom: 1.25rem;"></i>
        <h4 style="font-family: var(--font-serif-heading);">No Sarees Found</h4>
        <p style="color: var(--color-text-muted); max-width: 480px; margin: 0 auto 1.5rem;">We couldn't find any weaves matching your current filter selections. Try clearing your filters to explore our full royal collection.</p>
        <button id="emptyStateResetBtn" class="btn-gold">Reset All Filters</button>
      </div>
    `;
    const emptyBtn = document.getElementById('emptyStateResetBtn');
    if (emptyBtn) {
      emptyBtn.onclick = () => document.getElementById('resetFiltersBtn')?.click();
    }
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = '';
  filtered.forEach(product => {
    const isWishlisted = state.wishlist && state.wishlist.includes(product.id);
    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    html += `
      <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-4 d-flex" data-aos="fade-up">
        <div class="product-card w-100 d-flex flex-column">
          <!-- Floating Badges -->
          <div class="product-badges-group">
            ${product.badge ? `<span class="product-badge ${product.badge.toLowerCase().includes('royal') || product.badge.toLowerCase().includes('heirloom') ? 'gold' : ''}">${product.badge}</span>` : ''}
            ${product.isNew ? `<span class="product-badge gold">New Arrival</span>` : ''}
          </div>

          <!-- Floating Wishlist Button -->
          <div class="product-actions-floating">
            <button class="action-float-btn wishlist-btn-toggle ${isWishlisted ? 'active' : ''}" 
                    data-product-id="${product.id}" 
                    onclick="toggleWishlist('${product.id}')"
                    title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
              <i data-lucide="heart" style="width: 17px; height: 17px;"></i>
            </button>
          </div>

          <!-- Product Media with Dual Drape Flip -->
          <div class="product-media-wrapper" onclick="openQuickView('${product.id}')" style="cursor: pointer;">
            <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy" />
            <img src="${product.hoverImage}" alt="${product.title} Angle" class="product-img-hover" loading="lazy" />
            
            <!-- Quick View Overlay Bar -->
            <div class="product-quick-view-bar" onclick="event.stopPropagation(); openQuickView('${product.id}');">
              <button class="quick-view-btn">
                <i data-lucide="eye" style="width: 15px; height: 15px;"></i> Quick View
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="product-info">
            <div class="product-fabric-tag">${product.fabric} • ${product.occasionName}</div>
            <h3 class="product-title">
              <a href="javascript:void(0)" onclick="openQuickView('${product.id}')">${product.title}</a>
            </h3>

            <div class="product-meta-row">
              <span class="product-rating">
                <i data-lucide="star" style="width: 13px; height: 13px; fill: currentColor;"></i>
                ${product.rating.toFixed(1)} (${product.reviewsCount})
              </span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">${product.colorName}</span>
            </div>

            <div class="product-price-row">
              <span class="product-price">${formatINR(product.price)}</span>
              <span class="product-price-original">${formatINR(product.originalPrice)}</span>
              <span class="product-discount-pill">${discountPercent}% OFF</span>
            </div>

            <!-- Action CTAs -->
            <div class="product-card-cta">
              <button class="btn-card-add" onclick="addToCart('${product.id}')">
                <i data-lucide="shopping-bag" style="width: 15px; height: 15px;"></i> Add to Bag
              </button>
              <a href="https://wa.me/919876543210?text=Hello%20Saree%20Showroom,%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(product.title)}%20(${encodeURIComponent(formatINR(product.price))})" 
                 target="_blank" 
                 class="btn-card-whatsapp" 
                 title="Instant WhatsApp Enquiry">
                <i data-lucide="message-circle" style="width: 17px; height: 17px;"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}
