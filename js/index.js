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
  // 7. DYNAMIC CLOUDINARY MEDIA GALLERY (Static JSON + Custom Lightbox)
  // ==========================================================================
  const galleryGrid = document.getElementById('cloudinary-gallery-grid');
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  
  // Create Lightbox Modal
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-modal';
  lightbox.innerHTML = `
    <div class="lightbox-dialog" style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;">
      <button class="lightbox-close" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer;">&times;</button>
      <div class="lightbox-content"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

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
  });

  const loadGallery = async () => {
    try {
      const response = await fetch('js/gallery-data.json');
      if (!response.ok) throw new Error('Failed to load gallery data');
      const mediaList = await response.json();
      renderGallery(mediaList);
    } catch (err) {
      console.error('Error loading gallery:', err);
      if (galleryGrid) {
        galleryGrid.innerHTML = `<p style="text-align: center; color: var(--blackgreen);">Unable to load media gallery at this moment.</p>`;
      }
    }
  };

  const renderGallery = (media) => {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    if (media.length === 0) {
      galleryGrid.innerHTML = `<p style="text-align: center; color: var(--blackgreen);">No media assets found.</p>`;
      return;
    }

    media.forEach(item => {
      const card = document.createElement('div');
      card.className = `media-card ${item.type}`;
      card.dataset.type = item.type;

      // Cloudinary optimized thumbnail URLs
      const cloudName = 'xm0awdem';
      const thumbUrl = item.type === 'video'
        ? `https://res.cloudinary.com/${cloudName}/video/upload/c_fill,w_800,h_600,f_auto,q_auto/v${item.version}/${item.public_id}.jpg`
        : `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_600,f_auto,q_auto/v${item.version}/${item.public_id}.${item.format}`;

      card.innerHTML = `
        <img src="${thumbUrl}" class="media-card-img" alt="Gallery Media" loading="lazy">
        <div class="media-card-overlay">
          ${item.type === 'video' ? '<div class="media-play-icon">▶</div>' : '<div class="media-play-icon">🔍</div>'}
        </div>
      `;

      card.addEventListener('click', () => {
        lightbox.classList.add('active');
        const contentDiv = lightbox.querySelector('.lightbox-content');
        
        if (item.type === 'video') {
          const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/v${item.version}/${item.public_id}.${item.format}`;
          contentDiv.innerHTML = `<video src="${videoUrl}" controls autoplay style="max-width: 90vw; max-height: 80vh; border-radius: 8px;"></video>`;
        } else {
          const imgUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${item.version}/${item.public_id}.${item.format}`;
          contentDiv.innerHTML = `<img src="${imgUrl}" alt="Lightbox Full" style="max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px;">`;
        }
      });

      galleryGrid.appendChild(card);
    });
  };

  // Filter tabs functionality
  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      
      document.querySelectorAll('.media-card').forEach(card => {
        if (filter === 'all' || card.classList.contains(filter)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  loadGallery();
});
