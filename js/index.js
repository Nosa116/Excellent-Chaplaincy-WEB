document.addEventListener('DOMContentLoaded', () => {
  // SW + Cache hardening for images/videos
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  // Pre-warm Cloudinary cache for above-the-fold service cards (no-op if cached)
  try {
    ['https://res.cloudinary.com/xm0awdem/image/upload/c_fill,w_800,h_600,f_auto,q_auto:eco,dpr_auto/v1787171993/WhatsApp_Image_2026-08-19_at_6.19.17_PM.jpg','https://res.cloudinary.com/xm0awdem/image/upload/c_fill,w_800,h_600,f_auto,q_auto:eco,dpr_auto/v1787171987/WhatsApp_Image_2026-08-19_at_6.19.16_PM_4.jpg','https://res.cloudinary.com/xm0awdem/image/upload/c_fill,w_800,h_600,f_auto,q_auto:eco,dpr_auto/v1787171991/WhatsApp_Image_2026-08-19_at_6.19.17_PM_3.jpg'].forEach(u => { const i=new Image(); i.decoding='async'; i.src=u; });
  } catch(e) {}

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

  const GALLERY_CACHE_KEY = 'ecgm_gallery_v1';
  const GALLERY_TTL = 1000 * 60 * 60 * 6; // 6h
  const loadGallery = async () => {
    const tryLocal = () => {
      try {
        const raw = localStorage.getItem(GALLERY_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.t || !parsed.data) return null;
        if (Date.now() - parsed.t > GALLERY_TTL) return null;
        return parsed.data;
      } catch { return null; }
    };
    const cached = tryLocal();
    if (cached) {
      renderGallery(cached);
      // revalidate in background
      fetch('js/gallery-data.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(data => {
        if (data && JSON.stringify(data) !== JSON.stringify(cached)) {
          try { localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch {}
          renderGallery(data);
        }
      }).catch(()=>{});
      return;
    }
    try {
      const response = await fetch('js/gallery-data.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error('Failed to load gallery data');
      const mediaList = await response.json();
      try { localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify({ t: Date.now(), data: mediaList })); } catch {}
      renderGallery(mediaList);
    } catch (err) {
      console.error('Error loading gallery:', err);
      if (galleryLoader) galleryLoader.innerHTML = `<p style="text-align: center; color: var(--blackgreen);">Unable to load media gallery at this moment.</p>`;
    }
  };

  updateSlidesPerView();
  loadGallery();

  // ==========================================================================
  // 8. IMPACT REPORTS & BLOG SECTION INTERACTIVE READER MODAL
  // ==========================================================================
  const blogReportsData = {
    'report-1': {
      tag: 'Milestone Event • Chapel & Medical Outreach',
      title: 'CPFN IGANDO UNIT SUCCESS STORY: 3-in-1 Milestone Events',
      date: 'April 18, 2026',
      readTime: '3 min read',
      authorName: 'Chpl. Amb. Dr. J.O. Fabunmi',
      authorRole: 'ECGM Mission Command & Founder',
      authorInitials: 'JF',
      heroImg: 'https://res.cloudinary.com/xm0awdem/image/upload/c_fill,w_1000,h_550,f_auto,q_auto:eco/v1787171984/WhatsApp_Image_2026-08-19_at_6.19.15_PM.jpg',
      contentHtml: `
        <p class="modal-lead-p">Glory be to God. Today April 18th, 2026 is a remarkable day for <strong>3 in 1 events</strong>:</p>

        <div class="modal-milestones-box">
          <div class="modal-milestones-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="color:var(--original);"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>Core Event Milestones:</span>
          </div>
          <ul class="modal-milestones-list">
            <li>
              <span class="modal-num-badge">1</span>
              <div><strong>Official visitation of Lagos State Police command Chaplain</strong> — OUR Visitor.</div>
            </li>
            <li>
              <span class="modal-num-badge">2</span>
              <div><strong>Dedication of CPFN Praise Chapel</strong> at Igando Divisional Police Headquarters.</div>
            </li>
            <li>
              <span class="modal-num-badge">3</span>
              <div><strong>Free Medical Outreach</strong> to Igando Divisional Police Hqts personnels and their families.</div>
            </li>
          </ul>
        </div>

        <p class="modal-p">We were honoured to see Our fellow military Chaplains from <strong>Ojo Army Cantonment Chaplains</strong>, <strong>Regnum gallant Chaplains</strong>, <strong>Igando PCRC members</strong>, fellow <strong>Police pastors</strong>, <strong>police Chaplains</strong>, and well wishers that graced the occasion.</p>

        <div class="modal-quote-box">
          <div class="modal-quote-title">Special Police Leadership Commendation</div>
          <div class="modal-quote-item">
            <p class="modal-quote-text">“Kudos to our amiable, astute and gallant DPO in person of CSP. Amori Fatai for his love for the things of God.”</p>
          </div>
        </div>

        <p class="modal-p">This Success story will not be completed without mentioning <strong>Able God Foundation members</strong> &amp; <strong>Excellent Chaplaincy Global Missions members</strong> for their undaunted vision and relentless burden for humanity, government, community, military, hospitals, schools, correctional centers services to mention but few.</p>
      `,
      signoff: 'Thank you all. From Chpl. Amb. Dr. J.O. Fabunmi.'
    },

    'report-2': {
      tag: 'Anniversary Outreach • Highway Corridor Mission',
      title: 'REPORT FROM POLICE - EXCELLENT CHAPLAINS UNIT, IGANDO DIV. POLICE HQTS, IGANDO',
      date: 'June 24, 2026',
      readTime: '4 min read',
      authorName: 'Police - Excellent Chaplains Unit',
      authorRole: 'Igando Div. Police Hqts, Lagos Command',
      authorInitials: 'PC',
      heroImg: 'https://res.cloudinary.com/xm0awdem/image/upload/c_fill,w_1000,h_550,f_auto,q_auto:eco/v1787171982/WhatsApp_Image_2026-08-19_at_6.19.15_PM_1.jpg',
      contentHtml: `
        <p class="modal-lead-p">Praise the Lord! The Nigeria Police Chaplaincy Service 20th Years Anniversary mobile outreach took place today Wednesday 24th, June 2026 in grand style at exactly 10:00am from CPFN Igando Divisional Police Hqts, Igando.</p>

        <div class="modal-milestones-box">
          <div class="modal-milestones-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="color:var(--original);"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/></svg>
            <span>Outreach Logistics &amp; Deployment Convoy:</span>
          </div>
          <p class="modal-p" style="margin-bottom:0.75rem;">We hired an <strong>eighteen passenger bus</strong> together with a <strong>bus car</strong> occupied by Excellent Chaplains, Two senior Police personnels, Professional photo graphers, and Two prints Media journalists.</p>
          <p class="modal-p" style="margin-bottom:0;"><strong>Provision of Incentives:</strong> Bottled water, Soft drinks, Fruit drinks, Cracker biscuits snacks, and sizeable face towels among other welfare provisions were made available.</p>
        </div>

        <div class="modal-route-box">
          <strong style="color:var(--blackgreen); font-size:0.95rem; display:block; margin-bottom:0.4rem;">Mobile Outreach Corridor Route:</strong>
          <div class="modal-route-flow">
            <span class="modal-route-step">CPFN Igando Div. HQ</span>
            <span class="modal-route-arrow">➔</span>
            <span class="modal-route-step">Idimu Police Checkpoints</span>
            <span class="modal-route-arrow">➔</span>
            <span class="modal-route-step">Igando Checkpoints</span>
            <span class="modal-route-arrow">➔</span>
            <span class="modal-route-step">Iba Checkpoint</span>
            <span class="modal-route-arrow">➔</span>
            <span class="modal-route-step">Iyana Ira Checkpoints</span>
            <span class="modal-route-arrow">➔</span>
            <span class="modal-route-step">Agbara Roundabout</span>
          </div>
        </div>

        <p class="modal-p">To God be the glory, the exercise was tremendously inspiring, robust, and acceptable with appreciation from all the beneficiaries across our law enforcement, security, and traffic agencies.</p>

        <div class="modal-chips-section">
          <div class="modal-chips-title">Cross-Agency Beneficiaries Reached:</div>
          <div class="modal-chips-wrap">
            <span class="modal-chip">🛡️ Nigeria Police Personnel</span>
            <span class="modal-chip">🚗 FRSC Road Safety Officers</span>
            <span class="modal-chip">🚦 LASTMA Officers</span>
            <span class="modal-chip">📋 VIO Officers</span>
            <span class="modal-chip">🎖️ Military / Soldiers</span>
            <span class="modal-chip">🛂 Nigeria Immigration Service</span>
            <span class="modal-chip">⚖️ NDLEA Officers</span>
            <span class="modal-chip">📦 Nigeria Customs Officers</span>
          </div>
        </div>

        <div class="modal-quote-box">
          <div class="modal-quote-title">Direct Testimonials From The Field</div>
          <div class="modal-quote-item">
            <p class="modal-quote-text">“All our audience enjoyed our introduction / motives of encouragement, recognition and prayers.”</p>
          </div>
          <div class="modal-quote-item">
            <p class="modal-quote-text">“All were served accordingly with incentive package 📦”</p>
          </div>
          <div class="modal-quote-item">
            <p class="modal-quote-text">“The officers including our Police personnels confessed that this is the first experience of this kind of mobile outreach since they join The Nigeria Police Force.”</p>
          </div>
        </div>

        <p class="modal-p">More than <strong>250 pictures</strong> are available with few video clips. Featured media coverage is being prepared alongside national print media reports for wider publicity and awareness of the good gestures by The Nigeria Police Chaplaincy Service.</p>
      `,
      signoff: 'From Police - Excellent Chaplains Unit, Igando Divisional Police Hqts, Lagos Command.'
    }
  };

  const blogModal = document.getElementById('blog-reader-modal');
  const blogModalBackdrop = document.getElementById('blog-modal-backdrop');
  const blogModalClose = document.getElementById('blog-modal-close');
  const blogModalContent = document.getElementById('blog-modal-content');
  const blogCards = document.querySelectorAll('.blog-card');
  const blogReadBtns = document.querySelectorAll('.blog-read-btn');

  const openBlogReport = (reportId) => {
    const report = blogReportsData[reportId];
    if (!report || !blogModal || !blogModalContent) return;

    blogModalContent.innerHTML = `
      <span class="modal-header-tag">${report.tag}</span>
      <h2 class="modal-header-title">${report.title}</h2>
      
      <div class="modal-header-meta">
        <span class="blog-date">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
          ${report.date}
        </span>
        <span class="blog-read-time">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>
          ${report.readTime}
        </span>
        <span>•</span>
        <span>${report.authorName}</span>
      </div>

      <img src="${report.heroImg}" alt="${report.title}" class="modal-hero-img" loading="eager" decoding="async">

      <div class="modal-article-body">
        ${report.contentHtml}
      </div>

      <div class="modal-author-signoff">
        <div class="modal-author-block">
          <div class="modal-author-avatar-lg">${report.authorInitials}</div>
          <div class="modal-author-details">
            <strong>${report.authorName}</strong>
            <span>${report.authorRole}</span>
          </div>
        </div>
        <p style="font-weight:600; color:var(--original); margin:0;">${report.signoff}</p>
      </div>
    `;

    blogModal.classList.add('active');
    blogModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    if (blogModalClose) blogModalClose.focus();
  };

  const closeBlogReport = () => {
    if (!blogModal) return;
    blogModal.classList.remove('active');
    blogModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (blogReadBtns) {
    blogReadBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.target;
        openBlogReport(targetId);
      });
    });
  }

  if (blogCards) {
    blogCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // If clicking a link or button directly inside, let it handle
        if (e.target.closest('a')) return;
        const targetId = card.dataset.postId;
        openBlogReport(targetId);
      });
    });
  }

  if (blogModalClose) {
    blogModalClose.addEventListener('click', closeBlogReport);
  }

  if (blogModalBackdrop) {
    blogModalBackdrop.addEventListener('click', closeBlogReport);
  }

  blogModal?.addEventListener('click', (e) => {
    if (e.target === blogModal) {
      closeBlogReport();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && blogModal && blogModal.classList.contains('active')) {
      closeBlogReport();
    }
  });
});

