/* ========================================
   ZEE GRILL V2 — JAVASCRIPT BEHAVIORS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Reduced motion preference
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---- 1. PRELOADER ---- */
  const preloader = document.getElementById('preloader');

  const showPage = () => {
    if (preloader && !preloader.classList.contains('loaded')) {
      preloader.classList.add('loaded');
    }
  };

  window.addEventListener('load', () => {
    setTimeout(showPage, reducedMotion ? 300 : 800);
  });

  // Safety fallback
  setTimeout(showPage, 3000);


  /* ---- 2. NAVBAR SCROLL ---- */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });


  /* ---- 3. MOBILE MENU ---- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const openMobileMenu = () => {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first link
    const firstLink = mobileMenu.querySelector('.mobile-link');
    if (firstLink) firstLink.focus();
  };

  const closeMobileMenu = () => {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  };

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Escape to close + focus trap
  document.addEventListener('keydown', (e) => {
    if (!mobileMenu.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeMobileMenu();
      return;
    }

    // Focus trap
    if (e.key === 'Tab') {
      const focusables = mobileMenu.querySelectorAll('a, button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });


  /* ---- 4. SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ---- 5. ACTIVE NAV HIGHLIGHTING ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-reserve)');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });


  /* ---- 6. MENU TABS ---- */
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuPanels = document.querySelectorAll('.menu-panel');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tabs
      menuTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      menuPanels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
      });

      const activePanel = document.getElementById(`panel-${target}`);
      activePanel.classList.add('active');
      activePanel.removeAttribute('hidden');

      // Staggered menu item animation delays
      if (!reducedMotion) {
        const items = activePanel.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
          item.style.animationDelay = (index * 0.06) + 's';
          // Clean up after animation
          item.addEventListener('animationend', () => {
            item.style.animationDelay = '';
          }, { once: true });
        });
      }
    });
  });


  /* ---- 7. SCROLL REVEAL ---- */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  if (reducedMotion) {
    // Show everything immediately
    revealElements.forEach(el => el.classList.add('revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }


  /* ---- 8. COUNTER ANIMATION ---- */
  const counters = document.querySelectorAll('[data-count]');

  if (reducedMotion) {
    // Show final values immediately
    counters.forEach(el => {
      el.textContent = el.dataset.count;
    });
  } else {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }


  /* ---- 9. PARALLAX ---- */
  if (!reducedMotion) {
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    const heroBg = document.querySelector('.hero-bg');

    window.addEventListener('scroll', () => {
      // Quote section parallax
      parallaxBgs.forEach(bg => {
        const parent = bg.parentElement;
        const rect = parent.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.bottom > 0 && rect.top < viewportHeight) {
          const offset = (rect.top / viewportHeight) * 100;
          bg.style.transform = `translateY(${offset * 0.3}px)`;
        }
      });

      // Hero parallax
      if (window.scrollY < window.innerHeight && heroBg) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    }, { passive: true });
  }


  /* ---- 10. GALLERY LIGHTBOX ---- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');

  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryData = [];
  let currentLightboxIndex = 0;

  // Collect gallery data
  galleryItems.forEach((item, i) => {
    galleryData.push({
      src: item.dataset.full,
      caption: item.dataset.caption
    });

    item.addEventListener('click', () => {
      openLightbox(i);
    });

    // Make keyboard accessible
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    // Return focus to the gallery item
    galleryItems[currentLightboxIndex].focus();
  }

  function updateLightboxImage() {
    const data = galleryData[currentLightboxIndex];
    lightboxImg.src = data.src;
    lightboxImg.alt = data.caption;
    lightboxCaption.textContent = data.caption;

    // Re-trigger animation
    if (!reducedMotion) {
      lightboxImg.style.animation = 'none';
      lightboxImg.offsetHeight; // Force reflow
      lightboxImg.style.animation = '';
    }
  }

  function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryData.length;
    updateLightboxImage();
  }

  function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length;
    updateLightboxImage();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextImage);
  lightboxPrev.addEventListener('click', prevImage);

  // Lightbox keyboard controls + focus trap
  document.addEventListener('keydown', (e) => {
    if (lightbox.hasAttribute('hidden')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'Tab') {
      // Focus trap within lightbox
      const focusables = lightbox.querySelectorAll('button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });


  /* ---- 11. CONTACT FORM ---- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('#form-name');
      const email = contactForm.querySelector('#form-email');
      const message = contactForm.querySelector('#form-message');

      // Basic validation
      const firstInvalid = [name, email, message].find(field => !field.value.trim());

      if (firstInvalid) {
        if (!reducedMotion) {
          firstInvalid.classList.add('shake');
          firstInvalid.addEventListener('animationend', () => {
            firstInvalid.classList.remove('shake');
          }, { once: true });
        }
        firstInvalid.focus();
        return;
      }

      // Email format check
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        if (!reducedMotion) {
          email.classList.add('shake');
          email.addEventListener('animationend', () => {
            email.classList.remove('shake');
          }, { once: true });
        }
        email.focus();
        return;
      }

      // Show success
      contactForm.style.display = 'none';
      formSuccess.removeAttribute('hidden');

      // Reset after 4 seconds
      setTimeout(() => {
        contactForm.reset();
        formSuccess.setAttribute('hidden', '');
        contactForm.style.display = '';
      }, 4000);
    });
  }

});
