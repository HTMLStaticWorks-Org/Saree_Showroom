/**
 * SAREE SHOWROOM - MAIN APPLICATION SCRIPT
 * South Indian Heritage × Luxury Silk × Modern Editorial
 */

// Universal image fallback handler: guarantees no image placeholder is ever broken
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    if (!e.target.dataset.fallbackApplied) {
      e.target.dataset.fallbackApplied = 'true';
      e.target.src = 'IMGAE/shades-by-43-Rm9DL9DmGi4-unsplash.jpg';
    }
  }
}, true);

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initLucideIcons();
  initHeaderScroll();
  initDrawers();
  initModals();
  initSwipers();
  initAOSAndGSAP();
  updateWishlistUI();
  updateCartUI();
  initForms();
  initHeaderGlobalSearch();
  initFloatingScrollWidget();
  initLazyVideoPlayback();
});

/* ==========================================================================
   Header Global Search
   ========================================================================== */
function initHeaderGlobalSearch() {
  const searchInputs = document.querySelectorAll('.header-search-input');
  searchInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          window.location.href = `collections.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });
}

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('saree_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('saree_theme', newTheme);
      updateThemeIcons(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Royal Midnight Dark' : 'Heritage Warm Light'} theme`);
    });
  });
}

function updateThemeIcons(theme) {
  const icons = document.querySelectorAll('.theme-icon');
  const labels = document.querySelectorAll('.theme-label');
  
  icons.forEach(icon => {
    if (theme === 'dark') {
      icon.setAttribute('data-lucide', 'sun');
    } else {
      icon.setAttribute('data-lucide', 'moon');
    }
  });

  labels.forEach(label => {
    label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   2. RTL Management
   ========================================================================== */
function initRTL() {
  const savedRTL = localStorage.getItem('saree_dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedRTL);
  updateRTLButtons(savedRTL);

  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('saree_dir', newDir);
      updateRTLButtons(newDir);
      showToast(`Direction updated to ${newDir.toUpperCase()}`);
    });
  });
}

function updateRTLButtons(dir) {
  const rtlLabels = document.querySelectorAll('.rtl-label');
  rtlLabels.forEach(label => {
    label.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  });
}

/* ==========================================================================
   3. Header Sticky & Scroll Effect
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   4. Lucide Icons Helper
   ========================================================================== */
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   5. Drawers (Cart, Wishlist, Mobile Offcanvas)
   ========================================================================== */
const state = {
  cart: JSON.parse(localStorage.getItem('saree_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('saree_wishlist') || '[]')
};

function initDrawers() {
  // Cart Drawer toggles
  const cartBtns = document.querySelectorAll('.open-cart-btn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCloseBtns = document.querySelectorAll('.close-cart-btn');

  // Wishlist Drawer toggles
  const wishlistBtns = document.querySelectorAll('.open-wishlist-btn');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistCloseBtns = document.querySelectorAll('.close-wishlist-btn');

  const backdrop = document.getElementById('drawerBackdrop');

  function openDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAllDrawers() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (wishlistDrawer) wishlistDrawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer(cartDrawer);
  }));

  cartCloseBtns.forEach(btn => btn.addEventListener('click', closeAllDrawers));

  wishlistBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer(wishlistDrawer);
  }));

  wishlistCloseBtns.forEach(btn => btn.addEventListener('click', closeAllDrawers));

  if (backdrop) {
    backdrop.addEventListener('click', closeAllDrawers);
  }
}

/* ==========================================================================
   6. Cart Management
   ========================================================================== */
function addToCart(productId, quantity = 1) {
  const product = SAREE_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = state.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      fabric: product.fabric,
      quantity: quantity
    });
  }

  saveCart();
  updateCartUI();
  showToast(`"${product.title}" added to your Bag`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('saree_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const countBadges = document.querySelectorAll('.cart-count-badge');
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  countBadges.forEach(b => b.textContent = totalCount);

  const cartList = document.getElementById('cartDrawerItems');
  const cartSubtotalEl = document.getElementById('cartSubtotalAmount');
  const cartCheckoutBtn = document.getElementById('cartCheckoutWhatsAppBtn');

  if (!cartList) return;

  if (state.cart.length === 0) {
    cartList.innerHTML = `
      <div class="drawer-empty-state">
        <i data-lucide="shopping-bag" style="width: 48px; height: 48px; color: var(--color-gold); margin-bottom: 1rem;"></i>
        <h5 style="font-family: var(--font-serif-heading);">Your Bag is Empty</h5>
        <p style="font-size: 0.88rem; color: var(--color-text-muted);">Explore our heritage handwoven silks and find your dream drape.</p>
        <a href="collections.html" class="btn-gold" style="margin-top: 1rem;">Browse Collections</a>
      </div>
    `;
    if (cartSubtotalEl) cartSubtotalEl.textContent = '₹0';
    if (cartCheckoutBtn) cartCheckoutBtn.style.display = 'none';
    initLucideIcons();
    return;
  }

  let subtotal = 0;
  let html = '';

  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    html += `
      <div class="d-flex align-items-center gap-3 py-3 border-bottom border-light">
        <img src="${item.image}" alt="${item.title}" style="width: 70px; height: 90px; object-fit: cover; border-radius: 2px; border: 1px solid var(--color-border);" />
        <div class="flex-grow-1">
          <div style="font-family: var(--font-serif-heading); font-size: 0.72rem; color: var(--color-gold); text-transform: uppercase;">${item.fabric}</div>
          <h6 style="font-family: var(--font-serif-editorial); font-size: 0.95rem; margin-bottom: 0.25rem;">${item.title}</h6>
          <div style="font-weight: 700; color: var(--color-maroon); font-size: 0.95rem;">${formatINR(item.price)}</div>
          <div class="d-flex align-items-center gap-2 mt-2">
            <button class="btn btn-sm btn-outline-secondary p-0" style="width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center;" onclick="updateCartQuantity('${item.id}', -1)">-</button>
            <span style="font-size: 0.85rem; font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary p-0" style="width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center;" onclick="updateCartQuantity('${item.id}', 1)">+</button>
            <button class="btn btn-sm text-danger ms-auto p-0" onclick="removeFromCart('${item.id}')" title="Remove item">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  cartList.innerHTML = html;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatINR(subtotal);

  if (cartCheckoutBtn) {
    cartCheckoutBtn.style.display = 'flex';
    // WhatsApp inquiry link with cart summary
    const summaryText = state.cart.map(i => `• ${i.title} (${i.quantity}x) - ${formatINR(i.price * i.quantity)}`).join('%0A');
    const waUrl = `https://wa.me/919876543210?text=Hello%20Saree%20Showroom,%20I%20would%20like%20to%20place%20an%20order%20for:%0A${summaryText}%0ATotal:%20${formatINR(subtotal)}`;
    cartCheckoutBtn.setAttribute('href', waUrl);
  }

  initLucideIcons();
}

/* ==========================================================================
   7. Wishlist Management
   ========================================================================== */
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = SAREE_PRODUCTS.find(p => p.id === productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast(`Removed from Wishlist`);
  } else {
    state.wishlist.push(productId);
    showToast(`Added "${product ? product.title : 'Saree'}" to Wishlist`);
  }

  saveWishlist();
  updateWishlistUI();
}

function saveWishlist() {
  localStorage.setItem('saree_wishlist', JSON.stringify(state.wishlist));
}

function updateWishlistUI() {
  const countBadges = document.querySelectorAll('.wishlist-count-badge');
  countBadges.forEach(b => b.textContent = state.wishlist.length);

  // Update heart buttons active state across page
  const wishlistBtns = document.querySelectorAll('.wishlist-btn-toggle');
  wishlistBtns.forEach(btn => {
    const id = btn.getAttribute('data-product-id');
    if (state.wishlist.includes(id)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Render Wishlist drawer items
  const wishlistContainer = document.getElementById('wishlistDrawerItems');
  if (!wishlistContainer) return;

  if (state.wishlist.length === 0) {
    wishlistContainer.innerHTML = `
      <div class="drawer-empty-state">
        <i data-lucide="heart" style="width: 48px; height: 48px; color: var(--color-gold); margin-bottom: 1rem;"></i>
        <h5 style="font-family: var(--font-serif-heading);">Your Wishlist is Empty</h5>
        <p style="font-size: 0.88rem; color: var(--color-text-muted);">Save your favorite bridal weaves and festive handlooms here.</p>
        <a href="collections.html" class="btn-gold" style="margin-top: 1rem;">Explore Sarees</a>
      </div>
    `;
    initLucideIcons();
    return;
  }

  let html = '';
  state.wishlist.forEach(id => {
    const product = SAREE_PRODUCTS.find(p => p.id === id);
    if (!product) return;
    html += `
      <div class="d-flex align-items-center gap-3 py-3 border-bottom border-light">
        <img src="${product.image}" alt="${product.title}" style="width: 70px; height: 90px; object-fit: cover; border-radius: 2px; border: 1px solid var(--color-border);" />
        <div class="flex-grow-1">
          <div style="font-family: var(--font-serif-heading); font-size: 0.72rem; color: var(--color-gold); text-transform: uppercase;">${product.fabric}</div>
          <h6 style="font-family: var(--font-serif-editorial); font-size: 0.95rem; margin-bottom: 0.25rem;">${product.title}</h6>
          <div style="font-weight: 700; color: var(--color-maroon); font-size: 0.95rem;">${formatINR(product.price)}</div>
          <div class="d-flex align-items-center gap-2 mt-2">
            <button class="btn btn-sm btn-gold py-1 px-2" style="font-size: 0.72rem;" onclick="addToCart('${product.id}'); toggleWishlist('${product.id}');">Move to Bag</button>
            <button class="btn btn-sm text-danger ms-auto p-0" onclick="toggleWishlist('${product.id}')" title="Remove">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  wishlistContainer.innerHTML = html;
  initLucideIcons();
}

/* ==========================================================================
   8. Quick View Modal
   ========================================================================== */
function openQuickView(productId) {
  const product = SAREE_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modalImg = document.getElementById('qvModalImage');
  const modalCategory = document.getElementById('qvModalCategory');
  const modalTitle = document.getElementById('qvModalTitle');
  const modalSubtitle = document.getElementById('qvModalSubtitle');
  const modalPrice = document.getElementById('qvModalPrice');
  const modalOriginal = document.getElementById('qvModalOriginalPrice');
  const modalZari = document.getElementById('qvModalZari');
  const modalWeave = document.getElementById('qvModalWeave');
  const modalBlouse = document.getElementById('qvModalBlouse');
  const modalLength = document.getElementById('qvModalLength');
  const modalDesc = document.getElementById('qvModalDesc');
  const modalAddToCartBtn = document.getElementById('qvModalAddToCartBtn');
  const modalWhatsAppBtn = document.getElementById('qvModalWhatsAppBtn');

  if (modalImg) modalImg.src = product.image;
  if (modalCategory) modalCategory.textContent = `${product.fabric} • ${product.occasionName}`;
  if (modalTitle) modalTitle.textContent = product.title;
  if (modalSubtitle) modalSubtitle.textContent = product.subtitle;
  if (modalPrice) modalPrice.textContent = formatINR(product.price);
  if (modalOriginal) modalOriginal.textContent = formatINR(product.originalPrice);
  if (modalZari) modalZari.textContent = product.zariType;
  if (modalWeave) modalWeave.textContent = product.weavingTechnique;
  if (modalBlouse) modalBlouse.textContent = product.blousePiece;
  if (modalLength) modalLength.textContent = product.length;
  if (modalDesc) modalDesc.textContent = product.description;

  if (modalAddToCartBtn) {
    modalAddToCartBtn.onclick = () => {
      addToCart(product.id);
      const modalEl = document.getElementById('quickViewModal');
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    };
  }

  if (modalWhatsAppBtn) {
    const waText = `Hello Saree Showroom, I am interested in inquiring about the "${product.title}" (${formatINR(product.price)}). Is this available in Anna Nagar or for video consultation?`;
    modalWhatsAppBtn.href = `https://wa.me/919876543210?text=${encodeURIComponent(waText)}`;
  }

  const modalEl = document.getElementById('quickViewModal');
  if (modalEl) {
    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();
  }
}

/* ==========================================================================
   9. Swiper Carousels Initialization
   ========================================================================== */
function initSwipers() {
  // Collections Swiper Carousel (Curated Edits)
  if (document.querySelector('.collections-swiper')) {
    new Swiper('.collections-swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      centeredSlides: false,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false
      },
      navigation: {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom'
      },
      breakpoints: {
        576: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 24
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 28
        }
      }
    });
  }

  // Testimonials Swiper Carousel
  if (document.querySelector('.testimonials-swiper')) {
    new Swiper('.testimonials-swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5500,
        disableOnInteraction: false
      },
      pagination: {
        el: '.testimonials-pagination',
        clickable: true
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 25
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 30
        }
      }
    });
  }

  // Bridal Lookbook Swiper - Clean alignment across tab, mobile, desktop
  if (document.querySelector('.bridal-lookbook-swiper')) {
    new Swiper('.bridal-lookbook-swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      centeredSlides: false,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false
      },
      breakpoints: {
        576: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 28
        }
      }
    });
  }
}

/* ==========================================================================
   10. AOS and GSAP Animations
   ========================================================================== */
function initAOSAndGSAP() {
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  if (window.gsap) {
    // Hero elements reveal
    gsap.from('.hero-headline', {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.hero-description', {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out',
      delay: 0.5
    });

    gsap.from('.hero-btn-group', {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power3.out',
      delay: 0.7
    });
  }
}

/* ==========================================================================
   11. Toast Notifications
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('luxuryToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'luxuryToast';
    toast.className = 'luxury-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <i data-lucide="sparkles" style="width: 20px; height: 20px; color: var(--color-gold); flex-shrink: 0;"></i>
    <span>${message}</span>
  `;

  initLucideIcons();
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   12. Appointment & Contact Forms Handler
   ========================================================================== */
function initForms() {
  const appointmentForms = document.querySelectorAll('.appointment-form');
  appointmentForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('input[type="text"]');
      const clientName = nameInput ? nameInput.value : 'Guest';
      showToast(`Thank you, ${clientName}! Your Showroom Consultation has been booked. Our master stylist will contact you shortly.`);
      form.reset();

      const modalEl = form.closest('.modal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
    });
  });

  const contactForm = document.getElementById('mainContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to our flagship showroom team.');
      contactForm.reset();
    });
  }

  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you for subscribing to our Heritage Silk Gazette!');
      f.reset();
    });
  });
}

function initModals() {
  // Empty helper if needed
}

/* ==========================================================================
   13. Kankatala-Style Arched Testimonials Engine
   ========================================================================== */
const ARCHED_TESTIMONIALS = [
  {
    quote: "Picked this beautiful Banarasi chiffon saree from Saree Showroom Anna Nagar and absolutely loved it! Thank you for such timeless grace.",
    author: "Dr. Sindhuja Rajgopal",
    meta: "Bangalore • Banarasi Chiffon Saree",
    img: "IMGAE/shibnarayaninpace-woman-8060193_1920.jpg"
  },
  {
    quote: "The crimson Muhurtham Kanchipuram I selected from their Chennai showroom was the crown of my wedding. The weight of the real gold zari and the sharp Korvai contrast felt like wearing royal history.",
    author: "Dr. Radhika Sundaram",
    meta: "Chennai Bride • Sacred Muhurtham Saree",
    img: "IMGAE/sushanta-rokka-FWfhfJks5N4-unsplash.jpg"
  },
  {
    quote: "Ordering from London, I was nervous about purchasing an heirloom bridal silk online. Their private video styling call with Mr. Natarajan was unbelievable! The saree arrived perfectly packaged within 4 days.",
    author: "Ananya Krishnan",
    meta: "London, UK • Virtual Video Consultation",
    img: "IMGAE/happysurd-photography-7q-Z4IrqyYY-unsplash.jpg"
  },
  {
    quote: "My grandmother bought her wedding saree from this very family lineage back in 1968. Today, sixty years later, I picked my own reception Banarasi brocade here. The purity of silk and respect for craft remains untouched.",
    author: "Meenakshi Ramanathan",
    meta: "Bangalore • 3rd-Generation Customer",
    img: "IMGAE/shades-by-43-Rm9DL9DmGi4-unsplash.jpg"
  }
];

let currentTestimonialIdx = 0;

window.goToTestimonial = function(idx) {
  if (idx < 0) idx = ARCHED_TESTIMONIALS.length - 1;
  if (idx >= ARCHED_TESTIMONIALS.length) idx = 0;
  currentTestimonialIdx = idx;

  const data = ARCHED_TESTIMONIALS[idx];
  const imgEl = document.getElementById('archedTestimonialImg');
  const quoteEl = document.getElementById('archedTestimonialQuote');
  const authorEl = document.getElementById('archedTestimonialAuthor');
  const metaEl = document.getElementById('archedTestimonialMeta');

  // Update active thumbnail
  const thumbs = document.querySelectorAll('.testimonial-thumb-item');
  thumbs.forEach((t, i) => {
    if (i === idx) t.classList.add('active');
    else t.classList.remove('active');
  });

  if (window.gsap && imgEl && quoteEl) {
    gsap.to([imgEl, quoteEl, authorEl, metaEl], {
      opacity: 0,
      duration: 0.25,
      onComplete: () => {
        if (imgEl) imgEl.src = data.img;
        if (quoteEl) quoteEl.textContent = `"${data.quote}"`;
        if (authorEl) authorEl.textContent = data.author;
        if (metaEl) metaEl.textContent = data.meta;
        gsap.to([imgEl, quoteEl, authorEl, metaEl], { opacity: 1, duration: 0.35 });
      }
    });
  } else {
    if (imgEl) imgEl.src = data.img;
    if (quoteEl) quoteEl.textContent = `"${data.quote}"`;
    if (authorEl) authorEl.textContent = data.author;
    if (metaEl) metaEl.textContent = data.meta;
  }
};

window.prevTestimonial = function() {
  window.goToTestimonial(currentTestimonialIdx - 1);
};

window.nextTestimonial = function() {
  window.goToTestimonial(currentTestimonialIdx + 1);
};

/* ==========================================================================
   14. Video Controls & Sound Toggles
   ========================================================================== */
window.toggleVideoSound = function(videoId, btn) {
  const vid = document.getElementById(videoId);
  if (!vid) return;

  vid.muted = !vid.muted;
  if (vid.muted) {
    btn.innerHTML = '<i data-lucide="volume-x" style="width: 17px; height: 17px;"></i>';
    showToast('Video audio muted');
  } else {
    btn.innerHTML = '<i data-lucide="volume-2" style="width: 17px; height: 17px; color: var(--color-gold);"></i>';
    vid.play().catch(() => {});
    showToast('Video audio enabled (Pure Handloom Loom Audio)');
  }
  if (window.lucide) window.lucide.createIcons();
};

window.openVideoLightbox = function(src, title) {
  let modal = document.getElementById('videoLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'videoLightboxModal';
    modal.className = 'modal fade modal-luxury';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="background: #0B0507; border: 1.5px solid var(--color-gold); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <div class="modal-header border-0 pb-0 justify-content-between align-items-center">
            <h5 class="modal-title" id="videoLightboxTitle" style="color: var(--color-gold); font-family: var(--font-serif-heading); font-size: 1.05rem; letter-spacing: 0.05em; margin: 0;"></h5>
            <button type="button" class="btn-close-contrast" data-bs-dismiss="modal" aria-label="Close" style="background: var(--color-gold); color: #1A0D08; border: none; border-radius: 50%; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.5); transition: 0.2s;" title="Close Video">✕</button>
          </div>
          <div class="modal-body p-2 text-center">
            <video id="lightboxVideoPlayer" controls autoplay style="width: 100%; max-height: 75vh; border-radius: 4px; object-fit: contain;"></video>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('hidden.bs.modal', () => {
      const v = document.getElementById('lightboxVideoPlayer');
      if (v) v.pause();
    });
  }

  const titleEl = document.getElementById('videoLightboxTitle');
  const player = document.getElementById('lightboxVideoPlayer');
  if (titleEl) titleEl.textContent = title || 'Pure Silk Weaving Film';
  if (player) {
    player.src = src;
    player.play().catch(() => {});
  }

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
};

/* ==========================================================================
   15. Home 2 Specific Functions (Cinematic Atelier Video Stage & Hero Drape)
   ========================================================================== */
window.switchHome2Video = function(src, title, desc, btn) {
  const mainVideo = document.getElementById('home2MainVideo');
  const titleEl = document.getElementById('home2VideoTitle');
  const descEl = document.getElementById('home2VideoDesc');

  document.querySelectorAll('.video-pill-option').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (mainVideo) {
    if (window.gsap) {
      gsap.to(mainVideo, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          mainVideo.src = src;
          mainVideo.play().catch(() => {});
          if (titleEl) titleEl.textContent = title;
          if (descEl) descEl.textContent = desc;
          gsap.to(mainVideo, { opacity: 1, duration: 0.35 });
        }
      });
    } else {
      mainVideo.src = src;
      mainVideo.play().catch(() => {});
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
    }
  }
};

window.toggleHeroVideoMode = function(enableVideo) {
  const imgFrame = document.getElementById('heroAtelierMainImg');
  const vidWrapper = document.getElementById('heroAtelierVideoWrapper');
  const photoBtn = document.getElementById('heroPhotoToggleBtn');
  const videoBtn = document.getElementById('heroVideoToggleBtn');
  const heroVid = document.getElementById('heroAtelierVideo');

  if (enableVideo) {
    if (imgFrame) imgFrame.style.display = 'none';
    if (vidWrapper) vidWrapper.classList.add('active');
    if (photoBtn) photoBtn.classList.remove('active');
    if (videoBtn) videoBtn.classList.add('active');
    if (heroVid) heroVid.play().catch(() => {});
    showToast('Switched Hero to 4K Video Drape in Motion');
  } else {
    if (imgFrame) imgFrame.style.display = 'block';
    if (vidWrapper) vidWrapper.classList.remove('active');
    if (photoBtn) photoBtn.classList.add('active');
    if (videoBtn) videoBtn.classList.remove('active');
    if (heroVid) heroVid.pause();
    showToast('Switched Hero to High-Resolution Editorial Still');
  }
};

/* ==========================================================================
   Point 11: Top to Bottom Navigation Floating Control
   ========================================================================== */
function initFloatingScrollWidget() {
  const topBtn = document.getElementById('scrollTopBtn');
  const bottomBtn = document.getElementById('scrollBottomBtn');

  if (topBtn) {
    topBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (bottomBtn) {
    bottomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   Point 12: Lazy Video & Asset Loading to Resolve Performance Issues
   ========================================================================== */
function initLazyVideoPlayback() {
  const lazyVideos = document.querySelectorAll('video[data-lazy-play]');
  if ('IntersectionObserver' in window && lazyVideos.length > 0) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.15 });

    lazyVideos.forEach(v => videoObserver.observe(v));
  }
}



