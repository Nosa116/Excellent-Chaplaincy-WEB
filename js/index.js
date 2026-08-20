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
  // 7. DYNAMIC CLOUDINARY MEDIA GALLERY (Product Gallery Widget)
  // ==========================================================================
  // Load Cloudinary Widget script
  const script = document.createElement('script');
  script.src = "https://product-gallery.cloudinary.com/all.js";
  script.async = true;
  document.body.appendChild(script);

  script.onload = () => {
    const myGallery = cloudinary.galleryWidget({
      container: "#cloudinary-gallery-container",
      cloudName: "xm0awdem",
      mediaAssets: [
        { tag: "ecgm-gallery", mediaType: "image" },
        { tag: "ecgm-gallery", mediaType: "video" }
      ],
      thumbnailProps: { width: 120, height: 120 },
      zoom: true
    });
    myGallery.render();
  };
});
