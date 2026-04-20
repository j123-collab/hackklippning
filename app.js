/* ===========================
   L. FALK — TRÄDGÅRD & GÄRDSGÅRD
   Site interactivity
   =========================== */

(function () {
  'use strict';

  // ==================== LANGUAGE TOGGLE ====================
  var currentLang = 'sv';

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    var strings = I18N[lang];
    if (!strings) return;

    // Update all data-i18n elements (textContent)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (strings[key] != null) {
        // For labels with <span class="required">, preserve the span
        var req = el.querySelector('.required');
        if (req) {
          el.textContent = strings[key] + ' ';
          el.appendChild(req);
        } else {
          el.textContent = strings[key];
        }
      }
    });

    // Update data-i18n-html elements (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (strings[key] != null) el.innerHTML = strings[key];
    });

    // Update data-i18n-aria elements (aria-label attribute)
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (strings[key] != null) el.setAttribute('aria-label', strings[key]);
    });

    // Refresh the fence caption if the explainer is on the page
    if (typeof updateFenceCaption === 'function') updateFenceCaption();

    // Update data-i18n-text elements (text node only, preserving child elements like SVGs)
    document.querySelectorAll('[data-i18n-text]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-text');
      if (strings[key] == null) return;
      // Find the last text node (after the SVG)
      var nodes = el.childNodes;
      for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].nodeType === 3 && nodes[i].textContent.trim()) {
          nodes[i].textContent = '\n            ' + strings[key] + '\n          ';
          break;
        }
      }
    });

    // Update toggle buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });

    // Update map region data
    var regionMap = {
      jamtland: 'mapJamtland',
      uppsala: 'mapUppsala',
      vastmanland: 'mapVastmanland',
      stockholm: 'mapStockholm',
      sodermanland: 'mapSodermanland',
      ostergotland: 'mapOstergotland'
    };
    for (var region in regionMap) {
      if (strings[regionMap[region]]) {
        regionData[region].services = strings[regionMap[region]];
      }
    }

    // Update form validation messages
    document.querySelectorAll('.form-error').forEach(function (err) { err.remove(); });
    document.querySelectorAll('.form-group').forEach(function (g) {
      g.classList.remove('valid', 'invalid');
    });
  }

  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-btn');
      if (!btn || btn.classList.contains('active')) return;
      setLanguage(btn.dataset.lang);
    });
  }

  // regionData is referenced in setLanguage, define it early
  var regionData = {
    jamtland:     { name: 'Jämtlands län',       services: 'Gärdsgård (byggnation & renovering), Skogsröjning' },
    uppsala:      { name: 'Uppsala län',          services: 'Häckar, Buskar & Fruktträd, Gärdsgård' },
    vastmanland:  { name: 'Västmanlands län',     services: 'Häckar, Buskar & Fruktträd, Gärdsgård' },
    stockholm:    { name: 'Stockholms län',       services: 'Häckar, Buskar & Fruktträd, Gärdsgård, Gräsmatta' },
    sodermanland: { name: 'Södermanlands län',    services: 'Häckar, Buskar & Fruktträd, Gärdsgård' },
    ostergotland: { name: 'Östergötlands län',    services: 'Häckar, Buskar & Fruktträd, Gärdsgård' }
  };

  // ==================== NAV ====================
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('navHamburger');
  const links = navLinks.querySelectorAll('.nav-link');

  // Scroll state + hero parallax
  var hero = document.getElementById('hem');
  var heroOverlay = hero ? hero.querySelector('.hero-overlay') : null;
  var heroContent = hero ? hero.querySelector('.hero-content') : null;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 40);

    // Hero parallax — only while hero is in view
    if (!prefersReducedMotion && hero && scrollY < window.innerHeight) {
      var rate = scrollY * 0.4;
      hero.style.backgroundPositionY = 'calc(50% + ' + rate + 'px)';
      if (heroContent) heroContent.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
      if (heroOverlay) heroOverlay.style.opacity = 0.55 + (scrollY / window.innerHeight) * 0.35;
    }
  }, { passive: true });

  // Mobile menu
  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  links.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // ==================== SMOOTH SCROLL ====================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Shared: detect reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Normal smooth scrolling — no scroll hijacking

  // ==================== ACTIVE SECTION TRACKING ====================
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinkMap = {};
  links.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href) navLinkMap[href.slice(1)] = link;
  });

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        // Map sub-sections to their parent nav item
        let navId = id;
        if (id === 'klippning' || id === 'ovriga-tjanster' || id === 'sasong') navId = 'tjanster';
        if (id === 'miljopolicy') navId = 'om-oss';

        links.forEach(function (link) { link.classList.remove('active'); });
        if (navLinkMap[navId]) navLinkMap[navId].classList.add('active');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '-80px 0px -40% 0px'
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ==================== SCROLL REVEAL ====================
  const reveals = document.querySelectorAll('.reveal');
  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Immediately show all elements if reduced motion preferred
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ==================== GALLERY LIGHTBOX ====================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');

  let currentGallery = [];
  let currentIndex = 0;

  function openLightbox(galleryName, index) {
    const grid = document.querySelector('[data-gallery="' + galleryName + '"]');
    if (!grid) return;

    currentGallery = Array.from(grid.querySelectorAll('.gallery-item img'));
    currentIndex = index;

    showImage();
    lightbox.hidden = false;
    // Force reflow before adding class for transition
    lightbox.offsetHeight;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function showImage() {
    if (!currentGallery[currentIndex]) return;
    const img = currentGallery[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;

    lightboxPrev.style.display = currentGallery.length > 1 ? '' : 'none';
    lightboxNext.style.display = currentGallery.length > 1 ? '' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(function () {
      lightbox.hidden = true;
      lightboxImg.src = '';
    }, 300);
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage();
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showImage();
  }

  // Gallery item clicks
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      const grid = this.closest('[data-gallery]');
      if (!grid) return;
      const galleryName = grid.dataset.gallery;
      const index = parseInt(this.dataset.index, 10);
      openLightbox(galleryName, index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // ==================== VIMEO LAZY LOAD ====================
  document.querySelectorAll('.video-poster').forEach(function (poster) {
    poster.addEventListener('click', function () {
      const vimeoId = this.dataset.vimeoId;
      if (!vimeoId) return;

      const iframe = document.createElement('iframe');
      iframe.src = 'https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&dnt=1';
      iframe.allow = 'autoplay; fullscreen';
      iframe.title = 'Video: Byggnation av klassisk gärdsgård';

      this.parentNode.replaceChild(iframe, this);
    });
  });

  // ==================== SEASONAL GUIDE ====================
  var seasonTabs = document.querySelectorAll('.season-tab');
  var seasonPanels = document.querySelectorAll('.season-panel');

  seasonTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var season = this.dataset.season;

      seasonTabs.forEach(function (t) { t.classList.remove('active'); });
      seasonPanels.forEach(function (p) { p.classList.remove('active'); });

      this.classList.add('active');
      var panel = document.querySelector('.season-panel[data-season="' + season + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  // ==================== FENCE EXPLAINER ====================
  var fenceSvg = document.querySelector('.fence-svg');
  var fenceParts = document.querySelectorAll('.fence-part');
  var fenceLabels = document.querySelectorAll('.fence-label');
  var fenceInfoCards = document.querySelectorAll('.fence-info-card');
  var fenceCaption = document.getElementById('fenceCaption');
  var activeFencePart = null;

  function updateFenceCaption() {
    if (!fenceCaption) return;
    var strings = I18N[currentLang] || {};
    if (!activeFencePart) {
      fenceCaption.classList.remove('active');
      fenceCaption.textContent = strings.fenceCaptionHint || '';
      return;
    }
    var titleKey = 'explainer' + activeFencePart.charAt(0).toUpperCase() + activeFencePart.slice(1) + 'Title';
    fenceCaption.classList.add('active');
    fenceCaption.textContent = strings[titleKey] || activeFencePart;
  }

  function activateFencePart(partName) {
    fenceSvg.classList.add('highlight');
    activeFencePart = partName;

    fenceParts.forEach(function (p) {
      p.classList.toggle('active', p.dataset.part === partName);
    });

    fenceLabels.forEach(function (l) {
      l.classList.toggle('active', l.dataset.part === partName);
    });

    fenceInfoCards.forEach(function (c) {
      c.classList.toggle('active', c.dataset.part === partName);
    });

    updateFenceCaption();
  }

  function resetFenceParts() {
    fenceSvg.classList.remove('highlight');
    fenceParts.forEach(function (p) { p.classList.remove('active'); });
    fenceLabels.forEach(function (l) { l.classList.remove('active'); });
    fenceInfoCards.forEach(function (c) { c.classList.remove('active'); });
    var defaultCard = document.querySelector('.fence-info-card[data-part="default"]');
    if (defaultCard) defaultCard.classList.add('active');
    activeFencePart = null;
    updateFenceCaption();
  }

  if (fenceSvg) {
    fenceParts.forEach(function (part) {
      part.addEventListener('mouseenter', function () {
        activateFencePart(this.dataset.part);
      });

      part.addEventListener('click', function () {
        activateFencePart(this.dataset.part);
      });

      // Keyboard & focus support
      part.addEventListener('focus', function () {
        activateFencePart(this.dataset.part);
      });

      part.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateFencePart(this.dataset.part);
        } else if (e.key === 'Escape') {
          resetFenceParts();
          this.blur();
        }
      });
    });

    fenceSvg.addEventListener('mouseleave', resetFenceParts);

    // Reset when keyboard focus leaves the SVG entirely
    fenceSvg.addEventListener('focusout', function (e) {
      if (!fenceSvg.contains(e.relatedTarget)) {
        resetFenceParts();
      }
    });

    // Prev / next cycle through the parts
    var fenceOrder = ['stor', 'slana', 'vidja'];
    var fencePrevBtn = document.getElementById('fencePrev');
    var fenceNextBtn = document.getElementById('fenceNext');

    function cycleFencePart(delta) {
      var currentIndex = activeFencePart ? fenceOrder.indexOf(activeFencePart) : (delta > 0 ? -1 : 0);
      var newIndex = (currentIndex + delta + fenceOrder.length) % fenceOrder.length;
      activateFencePart(fenceOrder[newIndex]);
    }

    if (fencePrevBtn) fencePrevBtn.addEventListener('click', function () { cycleFencePart(-1); });
    if (fenceNextBtn) fenceNextBtn.addEventListener('click', function () { cycleFencePart(1); });

    // Initialise caption
    updateFenceCaption();
  }

  // ==================== BEFORE / AFTER SLIDER ====================
  var baSlider = document.getElementById('baSlider');
  var baHandle = document.getElementById('baHandle');

  if (baSlider && baHandle) {
    var isDragging = false;

    function updateSlider(x) {
      var rect = baSlider.getBoundingClientRect();
      var pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));

      var beforeImg = baSlider.querySelector('.ba-image--before');
      beforeImg.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';

      baHandle.style.left = pct + '%';
      baHandle.setAttribute('aria-valuenow', Math.round(pct));
    }

    baSlider.addEventListener('mousedown', function (e) {
      isDragging = true;
      updateSlider(e.clientX);
      e.preventDefault();
    });

    baSlider.addEventListener('touchstart', function (e) {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('mousemove', function (e) {
      if (isDragging) updateSlider(e.clientX);
    });

    document.addEventListener('touchmove', function (e) {
      if (isDragging) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('mouseup', function () { isDragging = false; });
    document.addEventListener('touchend', function () { isDragging = false; });

    // Keyboard support
    baHandle.addEventListener('keydown', function (e) {
      var current = parseInt(this.getAttribute('aria-valuenow'), 10);
      var step = 2;
      if (e.key === 'ArrowLeft') {
        updateSlider(baSlider.getBoundingClientRect().left + (baSlider.offsetWidth * (current - step) / 100));
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        updateSlider(baSlider.getBoundingClientRect().left + (baSlider.offsetWidth * (current + step) / 100));
        e.preventDefault();
      }
    });
  }

  // ==================== INTERACTIVE MAP ====================
  var mapRegions = document.querySelectorAll('.map-region');
  var mapTooltip = document.getElementById('mapTooltip');
  var mapTooltipTitle = document.getElementById('mapTooltipTitle');
  var mapTooltipServices = document.getElementById('mapTooltipServices');

  mapRegions.forEach(function (region) {
    region.addEventListener('mouseenter', function () {
      var data = regionData[this.dataset.region];
      if (!data || !mapTooltip) return;

      mapTooltipTitle.textContent = data.name;
      mapTooltipServices.textContent = data.services;
      mapTooltip.hidden = false;

      mapRegions.forEach(function (r) { r.classList.remove('active'); });
      this.classList.add('active');
    });

    region.addEventListener('mouseleave', function () {
      if (mapTooltip) mapTooltip.hidden = true;
      this.classList.remove('active');
    });

    // Touch support
    region.addEventListener('click', function () {
      var data = regionData[this.dataset.region];
      if (!data || !mapTooltip) return;

      mapTooltipTitle.textContent = data.name;
      mapTooltipServices.textContent = data.services;
      mapTooltip.hidden = false;

      mapRegions.forEach(function (r) { r.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ==================== CONTACT FORM ====================
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    const requiredFields = form.querySelectorAll('[required]');

    // Validate a single field
    function validateField(field) {
      const group = field.closest('.form-group, .form-group--checkbox');
      if (!group) return true;

      let valid = true;

      if (field.type === 'checkbox') {
        valid = field.checked;
      } else if (field.tagName === 'SELECT') {
        valid = field.value !== '';
      } else if (field.type === 'email') {
        valid = field.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      } else if (field.type === 'tel') {
        valid = field.value.trim() !== '';
      } else {
        valid = field.value.trim() !== '';
      }

      // Remove existing error
      const existing = group.querySelector('.form-error');
      if (existing) existing.remove();

      group.classList.remove('valid', 'invalid');

      if (!valid && field.value !== '' || (!valid && field.dataset.touched)) {
        group.classList.add('invalid');
        const error = document.createElement('span');
        error.className = 'form-error';
        error.textContent = field.type === 'email' ? I18N[currentLang].formErrorEmail : I18N[currentLang].formErrorRequired;
        group.appendChild(error);
      } else if (valid && field.value !== '') {
        group.classList.add('valid');
      }

      return valid;
    }

    // Add event listeners for real-time validation
    requiredFields.forEach(function (field) {
      field.addEventListener('blur', function () {
        field.dataset.touched = 'true';
        validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.dataset.touched) validateField(field);
      });
      field.addEventListener('change', function () {
        field.dataset.touched = 'true';
        validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Mark all required fields as touched
      requiredFields.forEach(function (field) {
        field.dataset.touched = 'true';
      });

      // Validate all
      let allValid = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('.invalid input, .invalid select, .invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Collect form data
      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      // TODO: Replace with actual endpoint (e.g., Formspree)
      console.log('Form submission data:', data);

      // Show success message
      formStatus.className = 'form-status success';
      formStatus.textContent = I18N[currentLang].formSuccess;
      form.reset();

      // Clear validation states
      form.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('valid', 'invalid');
        var error = group.querySelector('.form-error');
        if (error) error.remove();
      });

      // Reset touched state
      requiredFields.forEach(function (field) {
        delete field.dataset.touched;
      });
    });
  }

})();
