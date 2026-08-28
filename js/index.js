document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. STICKY NAVBAR & BACK-TO-TOP TRIGGER
  // ==========================================================================
  const header = document.querySelector('.header');
  const scrollThreshold = 50;

  const handleScroll = () => {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Run on load and on scroll
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ==========================================================================
  // 2. MOBILE MENU NAVIGATION TOGGLE
  // ==========================================================================
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isActive = navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
      
      // Prevent body scrolling when menu is active
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================================================
  // 3. FAQ ACCORDION INTERACTIVITY
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other accordion items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          content.style.maxHeight = null;
        } else {
          item.classList.add('active');
          // Calculate height of inner contents including padding
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // Open first FAQ item by default
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    firstItem.classList.add('active');
    const firstContent = firstItem.querySelector('.faq-content');
    if (firstContent) {
      firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
    }
  }

  // ==========================================================================
  // 4. INTERSECTION OBSERVER FOR SCROLL FADE-IN & REVEALS
  // ==========================================================================
  const animatedElements = document.querySelectorAll(
    '.animate-on-scroll, .scale-up, .slide-in-left, .slide-in-right'
  );

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12 // Trigger when 12% of the element is visible
  };

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Stop observing once animated to avoid re-triggering (increases performance)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(element => {
    animationObserver.observe(element);
  });

  // ==========================================================================
  // 5. NAV LINK ACTIVE STATE SYNCHRONIZATION ON SCROLL
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  
  const syncNavActiveState = () => {
    const scrollPos = window.scrollY + 150; // offset for nav bar

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', syncNavActiveState, { passive: true });
  syncNavActiveState(); // run once on load

  // ==========================================================================
  // 6. CONTACT FORM SUBMISSION MOCK
  // ==========================================================================
  const contactForm = document.getElementById('ecgm-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn.innerHTML;
      
      // Visual feedback
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Message...';
      
      setTimeout(() => {
        // Successful message simulated
        alert('Thank you for contacting ECGM! Your message has been sent successfully. We will get back to you shortly.');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 1500);
    });
  }

  // ==========================================================================
  // 7. DYNAMIC CLOUDINARY MEDIA GALLERY - FAST LOADING + SLIDER
  // ==========================================================================
  const galleryGrid = document.getElementById('cloudinary-gallery-grid');
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const gallerySlider = document.getElementById('gallery-slider');
  const galleryViewport = document.querySelector('.gallery-slider-viewport');
  const galleryLoader = document.getElementById('gallery-loader');
  const galleryDots = document.getElementById('gallery-dots');
  const galleryEmpty = document.getElementById('gallery-empty');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');

  const cloudName = 'xm0awdem';
  let allMedia = [];
  let filteredMedia = [];
  let currentIndex = 0;
  let autoplayTimer = null;
  let slidesPerView = 3;

  const updateSlidesPerView = () => {
    if (window.matchMedia('(max-width: 640px)').matches) slidesPerView = 1;
    else if (window.matchMedia('(max-width: 991px)').matches) slidesPerView = 2;
    else slidesPerView = 3;
  };

  // Lightbox with slider navigation
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-modal';
  lightbox.innerHTML = `
    <div class="lightbox-dialog" style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;">
      <button class="lightbox-close" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer;" aria-label="Close">&times;</button>
      <button class="lightbox-nav lightbox-prev" style="position: absolute; left: -48px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">&#10094;</button>
      <button class="lightbox-nav lightbox-next" style="position: absolute; right: -48px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">&#10095;</button>
      <div class="lightbox-content"></div>
    </div>
  `;
  document.body.appendChild(lightbox);
  let lightboxIndex = 0;

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    const contentDiv = lightbox.querySelector('.lightbox-content');
    if (contentDiv) contentDiv.innerHTML = '';
  };
  const closeBtn = lightbox.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-dialog')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
    }
  });
  const lbPrev = lightbox.querySelector('.lightbox-prev');
  const lbNext = lightbox.querySelector('.lightbox-next');
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(lightboxIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(lightboxIndex + 1); });

  const showLightbox = (idx) => {
    if (!filteredMedia.length) return;
    lightboxIndex = (idx + filteredMedia.length) % filteredMedia.length;
    const item = filteredMedia[lightboxIndex];
    lightbox.classList.add('active');
    const contentDiv = lightbox.querySelector('.lightbox-content');
    if (item.type === 'video') {
      const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/v${item.version}/${item.public_id}.${item.format}`;
      contentDiv.innerHTML = `<video src="${videoUrl}" controls autoplay preload="metadata" style="max-width: 90vw; max-height: 80vh; border-radius: 8px;"></video>`;
    } else {
      const imgUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,dpr_auto,w_1200/v${item.version}/${item.public_id}.${item.format}`;
      contentDiv.innerHTML = `<img src="${imgUrl}" alt="Gallery full ${lightboxIndex + 1}" loading="eager" decoding="async" fetchpriority="high" style="max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px;">`;
    }
  };

  const buildThumbUrls = (item) => {
    const base = item.type === 'video'
      ? `https://res.cloudinary.com/${cloudName}/video/upload`
      : `https://res.cloudinary.com/${cloudName}/image/upload`;
    const thumb400 = item.type === 'video'
      ? `${base}/c_fill,w_400,h_300,f_auto,q_auto:eco/v${item.version}/${item.public_id}.jpg`
      : `${base}/c_fill,w_400,h_300,f_auto,q_auto:eco/v${item.version}/${item.public_id}.${item.format}`;
    const thumb800 = item.type === 'video'
      ? `${base}/c_fill,w_800,h_600,f_auto,q_auto:eco/v${item.version}/${item.public_id}.jpg`
      : `${base}/c_fill,w_800,h_600,f_auto,q_auto:eco/v${item.version}/${item.public_id}.${item.format}`;
    const thumb1200 = item.type === 'video'
      ? `${base}/c_fill,w_1200,h_900,f_auto,q_auto:eco/v${item.version}/${item.public_id}.jpg`
      : `${base}/c_fill,w_1200,h_900,f_auto,q_auto:eco/v${item.version}/${item.public_id}.${item.format}`;
    return { thumb400, thumb800, thumb1200 };
  };

  const lazyObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        if (src) {
          img.src = src;
          if (srcset) img.srcset = srcset;
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
        }
        img.classList.add('is-loaded');
        lazyObserver.unobserve(img);
      }
    });
  }, { root: galleryViewport || null, rootMargin: '200px', threshold: 0.01 }) : null;

  const renderGallery = (media) => {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    if (galleryDots) galleryDots.innerHTML = '';
    allMedia = media;
    filteredMedia = [...media];
    currentIndex = 0;

    if (galleryLoader) galleryLoader.hidden = true;

    if (media.length === 0) {
      if (gallerySlider) gallerySlider.hidden = true;
      if (galleryEmpty) galleryEmpty.hidden = false;
      return;
    }
    if (gallerySlider) gallerySlider.hidden = false;
    if (galleryEmpty) galleryEmpty.hidden = true;

    media.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = `media-card ${item.type}`;
      card.dataset.type = item.type;
      card.setAttribute('role', 'listitem');
      const { thumb400, thumb800, thumb1200 } = buildThumbUrls(item);
      const eager = idx < slidesPerView ? 'eager' : 'lazy';
      const fetchPri = idx < slidesPerView ? 'high' : 'low';
      // data-src lazy pattern: first viewport eager, rest lazy via observer
      const imgAttrs = idx < slidesPerView
        ? `src="${thumb800}" srcset="${thumb400} 400w, ${thumb800} 800w, ${thumb1200} 1200w" sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw"`
        : `data-src="${thumb800}" data-srcset="${thumb400} 400w, ${thumb800} 800w, ${thumb1200} 1200w" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f0ece6'/%3E%3C/svg%3E"`;
      card.innerHTML = `
        <img ${imgAttrs} class="media-card-img" alt="Gallery ${item.type} ${idx+1}" width="800" height="600" loading="${eager}" decoding="async" fetchpriority="${fetchPri}" sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw">
        <div class="media-card-overlay">
          ${item.type === 'video' ? '<div class="media-play-icon">▶</div>' : '<div class="media-play-icon">🔍</div>'}
        </div>
      `;
      const img = card.querySelector('img');
      if (img) {
        img.addEventListener('error', () => { img.src = thumb400; });
        if (lazyObserver && img.dataset.src) lazyObserver.observe(img);
      }
      card.addEventListener('click', () => {
        const visibleIndex = filteredMedia.indexOf(item);
        showLightbox(visibleIndex >= 0 ? visibleIndex : idx);
      });
      galleryGrid.appendChild(card);
    });

    updateSlidesPerView();
    buildDots();
    updateSlider(false);
    startAutoplay();
  };

  const maxIndex = () => Math.max(0, filteredMedia.length - slidesPerView);

  const buildDots = () => {
    if (!galleryDots) return;
    galleryDots.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i+1}`);
      dot.addEventListener('click', () => goTo(i));
      galleryDots.appendChild(dot);
    }
  };

  const updateSlider = (smooth = true) => {
    if (!galleryGrid || !galleryViewport) return;
    updateSlidesPerView();
    const gap = 20; // matches 1.25rem
    const viewportW = galleryViewport.clientWidth;
    const cardW = (viewportW - gap * (slidesPerView - 1)) / slidesPerView;
    // enforce card width via flex-basis already in CSS but translate needs cardW+gap
    const offset = currentIndex * (cardW + gap);
    galleryGrid.style.transition = smooth ? '' : 'none';
    galleryGrid.style.transform = `translateX(-${offset}px)`;
    // dots active
    if (galleryDots) {
      [...galleryDots.children].forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex();
  };

  const goTo = (idx) => {
    currentIndex = Math.max(0, Math.min(idx, maxIndex()));
    updateSlider(true);
    restartAutoplay();
  };
  const next = () => goTo(currentIndex + 1 > maxIndex() ? 0 : currentIndex + 1);
  const prev = () => goTo(currentIndex - 1 < 0 ? maxIndex() : currentIndex - 1);

  const startAutoplay = () => {
    stopAutoplay();
    if (filteredMedia.length <= slidesPerView) return;
    autoplayTimer = setInterval(next, 4000);
  };
  const stopAutoplay = () => { if (autoplayTimer) clearInterval(autoplayTimer); autoplayTimer = null; };
  const restartAutoplay = () => { stopAutoplay(); startAutoplay(); };

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (gallerySlider) {
    gallerySlider.addEventListener('mouseenter', stopAutoplay);
    gallerySlider.addEventListener('mouseleave', startAutoplay);
    gallerySlider.addEventListener('focusin', stopAutoplay);
    gallerySlider.addEventListener('focusout', startAutoplay);
  }

  // Touch swipe
  let touchStartX = 0;
  let touchDelta = 0;
  if (galleryViewport) {
    galleryViewport.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAutoplay(); }, { passive: true });
    galleryViewport.addEventListener('touchmove', (e) => { touchDelta = e.touches[0].clientX - touchStartX; }, { passive: true });
    galleryViewport.addEventListener('touchend', () => {
      if (Math.abs(touchDelta) > 50) {
        if (touchDelta < 0) next(); else prev();
      }
      touchDelta = 0; startAutoplay();
    });
  }

  window.addEventListener('resize', () => { updateSlidesPerView(); buildDots(); updateSlider(false); });

  const applyFilter = (filter) => {
    // update filteredMedia from allMedia
    if (filter === 'all') filteredMedia = [...allMedia];
    else filteredMedia = allMedia.filter(m => m.type === filter);
    // show/hide cards by re-rendering track from filtered set? keep simple: toggle display but slider expects contiguous
    // Re-render filtered set for slider correctness
    if (galleryGrid) galleryGrid.innerHTML = '';
    if (galleryDots) galleryDots.innerHTML = '';
    currentIndex = 0;
    if (filteredMedia.length === 0) {
      if (gallerySlider) gallerySlider.hidden = true;
      if (galleryEmpty) { galleryEmpty.hidden = false; galleryEmpty.textContent = `No ${filter} assets found.`; }
      return;
    }
    if (gallerySlider) gallerySlider.hidden = false;
    if (galleryEmpty) galleryEmpty.hidden = true;
    filteredMedia.forEach((item, idx) => {
      const originalIdx = allMedia.indexOf(item);
      const card = document.createElement('div');
      card.className = `media-card ${item.type}`;
      card.dataset.type = item.type;
      card.setAttribute('role', 'listitem');
      const { thumb400, thumb800, thumb1200 } = buildThumbUrls(item);
      const eager = idx < slidesPerView ? 'eager' : 'lazy';
      const fetchPri = idx < slidesPerView ? 'high' : 'low';
      const imgAttrs = idx < slidesPerView
        ? `src="${thumb800}" srcset="${thumb400} 400w, ${thumb800} 800w, ${thumb1200} 1200w" sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw"`
        : `data-src="${thumb800}" data-srcset="${thumb400} 400w, ${thumb800} 800w, ${thumb1200} 1200w" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f0ece6'/%3E%3C/svg%3E"`;
      card.innerHTML = `
        <img ${imgAttrs} class="media-card-img" alt="Gallery ${item.type} ${idx+1}" width="800" height="600" loading="${eager}" decoding="async" fetchpriority="${fetchPri}" sizes="(max-width: 640px) 100vw, (max-width: 991px) 50vw, 33vw">
        <div class="media-card-overlay">
          ${item.type === 'video' ? '<div class="media-play-icon">▶</div>' : '<div class="media-play-icon">🔍</div>'}
        </div>
      `;
      const img = card.querySelector('img');
      if (img) {
        img.addEventListener('error', () => { img.src = thumb400; });
        if (lazyObserver && img.dataset.src) lazyObserver.observe(img);
      }
      card.addEventListener('click', () => showLightbox(idx));
      galleryGrid.appendChild(card);
    });
    updateSlidesPerView();
    buildDots();
    updateSlider(false);
    startAutoplay();
  };

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilter(tab.dataset.filter);
    });
  });

  const loadGallery = async () => {
    try {
      const response = await fetch('js/gallery-data.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error('Failed to load gallery data');
      const mediaList = await response.json();
      renderGallery(mediaList);
    } catch (err) {
      console.error('Error loading gallery:', err);
      if (galleryLoader) galleryLoader.innerHTML = `<p style="text-align: center; color: var(--blackgreen);">Unable to load media gallery at this moment.</p>`;
    }
  };

  updateSlidesPerView();
  loadGallery();
});
