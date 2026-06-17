(function () {
  'use strict';

  // Elements
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const bookingForm = document.getElementById('bookingForm');
  const yearSpan = document.getElementById('year');
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // Current year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Header background on scroll
  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Mobile menu toggle
  function toggleMenu(forceClose = false) {
    const isOpen = navLinks.classList.contains('active');
    const shouldOpen = forceClose ? false : !isOpen;

    menuToggle.setAttribute('aria-expanded', shouldOpen);
    navLinks.classList.toggle('active', shouldOpen);
    document.body.classList.toggle('menu-open', shouldOpen);
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => toggleMenu());

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(true));
    });
  }

  // Smooth scroll for anchor links (offset for sticky header)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  // Scroll animations using IntersectionObserver
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    animatedElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for older browsers
    animatedElements.forEach((el) => el.classList.add('animate-visible'));
  }

  // Lightbox gallery
  const galleryArray = Array.from(galleryItems);
  let currentImageIndex = 0;

  function openLightbox(index) {
    if (!galleryArray.length) return;
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const item = galleryArray[currentImageIndex];
    const fullUrl = item.getAttribute('data-full');
    const alt = item.querySelector('img')?.getAttribute('alt') || '';

    if (fullUrl) {
      lightboxImg.src = fullUrl;
      lightboxImg.alt = alt;
    }
  }

  function showPrev() {
    currentImageIndex = (currentImageIndex - 1 + galleryArray.length) % galleryArray.length;
    updateLightboxImage();
  }

  function showNext() {
    currentImageIndex = (currentImageIndex + 1) % galleryArray.length;
    updateLightboxImage();
  }

  galleryArray.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Testimonial slider
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');
  const sliderDots = document.querySelectorAll('#sliderDots .dot');

  if (sliderTrack && sliderPrev && sliderNext) {
    const slides = sliderTrack.children;
    let currentSlide = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentSlide = index;
      sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      sliderDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    sliderPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
    sliderNext.addEventListener('click', () => goToSlide(currentSlide + 1));

    sliderDots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    // Swipe support
    const slider = sliderTrack.parentElement;

    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - currentX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
    });

    // Auto-play pause on hover/focus
    let autoPlay = setInterval(() => goToSlide(currentSlide + 1), 6000);

    slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
    slider.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goToSlide(currentSlide + 1), 6000);
    });
    slider.addEventListener('focusin', () => clearInterval(autoPlay));
    slider.addEventListener('focusout', () => {
      autoPlay = setInterval(() => goToSlide(currentSlide + 1), 6000);
    });
  }

  // Video modal
  const heroVideoBtn = document.getElementById('heroVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const videoClose = document.getElementById('videoClose');
  const videoContainer = document.getElementById('videoContainer');
  const venueVideo = document.getElementById('venueVideo');
  const videoPlay = document.getElementById('videoPlay');
  const videoRewind = document.getElementById('videoRewind');
  const videoForward = document.getElementById('videoForward');
  const videoShare = document.getElementById('videoShare');
  const videoSeek = document.getElementById('videoSeek');
  const videoTime = document.getElementById('videoTime');
  const playIcon = videoPlay ? videoPlay.querySelector('.icon-play') : null;
  const pauseIcon = videoPlay ? videoPlay.querySelector('.icon-pause') : null;

  function openVideoModal() {
    if (!videoModal || !venueVideo) return;
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    venueVideo.play().catch(() => {});
    updatePlayIcon();
  }

  function closeVideoModal() {
    if (!videoModal || !venueVideo) return;
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    venueVideo.pause();
    updatePlayIcon();
  }

  function toggleVideoPlay() {
    if (!venueVideo) return;
    if (venueVideo.paused) {
      venueVideo.play().catch(() => {});
    } else {
      venueVideo.pause();
    }
    updatePlayIcon();
  }

  function updatePlayIcon() {
    if (!playIcon || !pauseIcon) return;
    if (venueVideo.paused) {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      videoPlay.setAttribute('aria-label', 'Play video');
    } else {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      videoPlay.setAttribute('aria-label', 'Pause video');
    }
  }

  if (heroVideoBtn) {
    heroVideoBtn.addEventListener('click', openVideoModal);
  }

  if (videoClose) {
    videoClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  if (videoPlay) {
    videoPlay.addEventListener('click', toggleVideoPlay);
  }

  if (videoRewind) {
    videoRewind.addEventListener('click', () => {
      if (venueVideo) venueVideo.currentTime = Math.max(0, venueVideo.currentTime - 10);
    });
  }

  if (videoForward) {
    videoForward.addEventListener('click', () => {
      if (venueVideo) venueVideo.currentTime = Math.min(venueVideo.duration || Infinity, venueVideo.currentTime + 10);
    });
  }

  if (videoShare) {
    videoShare.addEventListener('click', async () => {
      if (!venueVideo) return;
      const url = venueVideo.src;
      try {
        await navigator.clipboard.writeText(url);
        const originalText = videoShare.textContent;
        videoShare.textContent = 'Copied!';
        setTimeout(() => (videoShare.textContent = originalText), 2000);
      } catch (err) {
        window.open(url, '_blank');
      }
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function updateTime() {
    if (!venueVideo || !videoTime || !videoSeek) return;
    const current = venueVideo.currentTime || 0;
    const duration = venueVideo.duration || 0;
    videoTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    if (duration) {
      videoSeek.value = (current / duration) * 100;
    }
  }

  if (videoSeek) {
    videoSeek.addEventListener('input', () => {
      if (!venueVideo || !venueVideo.duration) return;
      venueVideo.currentTime = (videoSeek.value / 100) * venueVideo.duration;
    });
  }

  if (venueVideo) {
    venueVideo.addEventListener('click', toggleVideoPlay);
    venueVideo.addEventListener('play', updatePlayIcon);
    venueVideo.addEventListener('pause', updatePlayIcon);
    venueVideo.addEventListener('timeupdate', updateTime);
    venueVideo.addEventListener('loadedmetadata', () => {
      updateTime();
      if (videoSeek) videoSeek.max = 100;
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
      closeVideoModal();
    }
  });

  // WhatsApp booking form
  if (bookingForm) {
    const fields = {
      name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
      email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
      eventDate: { input: document.getElementById('eventDate'), error: document.getElementById('dateError') },
    };

    const messageInput = document.getElementById('message');
    const successMessage = document.getElementById('formSuccess');
    const WHATSAPP_NUMBER = '2349033173219';

    function clearError(field) {
      field.input.parentElement.classList.remove('error');
    }

    function showError(field) {
      field.input.parentElement.classList.add('error');
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateDate(dateString) {
      if (!dateString) return false;
      const [year, month, day] = dateString.split('-').map(Number);
      const selected = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }

    // Set minimum date to today
    const todayLocal = new Date();
    const yyyy = todayLocal.getFullYear();
    const mm = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const dd = String(todayLocal.getDate()).padStart(2, '0');
    fields.eventDate.input.setAttribute('min', `${yyyy}-${mm}-${dd}`);

    Object.values(fields).forEach((field) => {
      field.input.addEventListener('input', () => clearError(field));
      field.input.addEventListener('change', () => clearError(field));
    });

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;

      if (!fields.name.input.value.trim()) {
        showError(fields.name);
        isValid = false;
      }

      if (!validateEmail(fields.email.input.value.trim())) {
        showError(fields.email);
        isValid = false;
      }

      if (!validateDate(fields.eventDate.input.value)) {
        showError(fields.eventDate);
        isValid = false;
      }

      if (!isValid) return;

      const name = fields.name.input.value.trim();
      const email = fields.email.input.value.trim();
      const date = fields.eventDate.input.value;
      const requests = messageInput ? messageInput.value.trim() : '';

      const text = `Hello WhiteJade Event Centre,\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Event Date: ${date}\n` +
        (requests ? `Requests: ${requests}` : 'No additional requests yet.');

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      if (successMessage) {
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 6000);
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      window.open(whatsappUrl, '_blank');
    });
  }
})();
