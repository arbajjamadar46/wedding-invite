// ===== SCROLL INTRO =====
const siCta       = document.getElementById('siCta');
const scrollIntro = document.getElementById('scroll-intro');
const mainSite    = document.getElementById('main-site');
const goldBurst   = document.getElementById('goldBurst');
const bgMusic     = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

let isAutoScrolling = false;
let autoScrollRAF   = null;

// ===== OPEN THE INVITATION (shared logic) =====
function openInvitation() {
  burstParticles();

  const wrap = document.getElementById('siScrollWrap');
  const overlay = document.getElementById('transitionOverlay');

  // Step 1: Fade out the scroll parchment
  wrap.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease';
  wrap.style.transform  = 'scale(1.08) translateY(-30px)';
  wrap.style.opacity    = '0';

  // Hide the CTA button immediately
  siCta.style.transition = 'opacity 0.4s ease';
  siCta.style.opacity = '0';
  siCta.style.pointerEvents = 'none';

  // Step 2: After parchment fades, trigger the splash overlay
  setTimeout(() => {
    // Fire the cinematic splash overlay
    overlay.classList.add('flash');

    // Step 3: At peak splash opacity — start music here for dramatic effect
    setTimeout(() => {
      startMusic();
    }, 350);

    // Step 4: While overlay is still covering, prepare the main site behind it
    setTimeout(() => {
      scrollIntro.classList.add('opened');
      mainSite.classList.add('visible');
      document.body.style.overflow = '';
    }, 500);

    // Step 5: After overlay begins fading out, reveal everything
    setTimeout(() => {
      document.querySelector('.site-header').classList.add('visible');
      initCanvas();
      initFloatingLove();
      initScrollObserver();
      tickCountdown();

      // Show music toggle button
      musicToggle.classList.add('show');

      // Start auto-scroll after main site settles
      setTimeout(() => startAutoScroll(), 2200);
    }, 1000);

    // Clean up overlay after animation completes
    setTimeout(() => {
      overlay.classList.remove('flash');
    }, 2000);
  }, 600);
}

// ===== MANUAL CTA CLICK =====
siCta.addEventListener('click', () => {
  // Clear auto-open timer if user clicks manually
  if (autoOpenTimer) clearTimeout(autoOpenTimer);
  if (autoOpenCountdown) clearInterval(autoOpenCountdown);
  const timerEl = document.querySelector('.si-auto-timer');
  if (timerEl) timerEl.remove();

  openInvitation();
});

// ===== AUTO-OPEN AFTER 3 SECONDS =====
let autoOpenTimer    = null;
let autoOpenCountdown = null;

(function initAutoOpen() {
  // Add countdown text below the CTA
  const timerDisplay = document.createElement('div');
  timerDisplay.className = 'si-auto-timer';
  timerDisplay.textContent = 'Opening in 3...';
  siCta.parentElement.appendChild(timerDisplay);

  let remaining = 3;

  // Add shimmer to CTA
  setTimeout(() => siCta.classList.add('auto-opening'), 1500);

  autoOpenCountdown = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      timerDisplay.textContent = `Opening in ${remaining}...`;
    } else {
      timerDisplay.textContent = 'Opening...';
      clearInterval(autoOpenCountdown);
    }
  }, 1000);

  autoOpenTimer = setTimeout(() => {
    clearInterval(autoOpenCountdown);
    siCta.classList.remove('auto-opening');
    openInvitation();
  }, 3000);
})();

// ===== MUSIC CONTROL =====
function startMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0.45;
  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      musicToggle.classList.add('playing');
    }).catch(() => {
      // Auto-play blocked — user must click toggle
      musicToggle.classList.remove('playing');
    });
  }
}

musicToggle.addEventListener('click', () => {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      musicToggle.classList.add('playing');
    }).catch(() => {});
  } else {
    bgMusic.pause();
    musicToggle.classList.remove('playing');
  }
});

// ===== AUTO-SCROLL — seamless continuous glide =====
function startAutoScroll() {
  isAutoScrolling = true;

  // Disable CSS smooth scrolling during auto-scroll (causes stutter)
  document.documentElement.style.scrollBehavior = 'auto';

  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const speed = 1.8; // px per frame at 60fps (~108px/sec)
  let scrollY = window.pageYOffset;
  let lastTime = 0;

  function glide(timestamp) {
    if (!isAutoScrolling) return;

    if (!lastTime) { lastTime = timestamp; autoScrollRAF = requestAnimationFrame(glide); return; }

    const dt = Math.min(timestamp - lastTime, 50); // cap delta to avoid jumps on tab switch
    lastTime = timestamp;

    // Accumulate fractional pixels for perfectly smooth motion
    scrollY += speed * (dt / 16.667);

    if (scrollY >= totalHeight) {
      scrollY = totalHeight;
      window.scrollTo(0, scrollY);
      isAutoScrolling = false;
      document.documentElement.style.scrollBehavior = '';
      return;
    }

    window.scrollTo(0, scrollY);
    autoScrollRAF = requestAnimationFrame(glide);
  }

  autoScrollRAF = requestAnimationFrame(glide);

  // Stop auto-scroll on any user interaction
  const stopEvents = ['wheel', 'touchstart', 'mousedown', 'keydown'];
  function stopAutoScroll() {
    isAutoScrolling = false;
    if (autoScrollRAF) {
      cancelAnimationFrame(autoScrollRAF);
      autoScrollRAF = null;
    }
    document.documentElement.style.scrollBehavior = '';
    stopEvents.forEach(evt => window.removeEventListener(evt, stopAutoScroll));
  }
  stopEvents.forEach(evt => window.addEventListener(evt, stopAutoScroll, { passive: true, once: true }));
}

// ===== GOLD BURST PARTICLES =====
function burstParticles() {
  const count = window.innerWidth < 480 ? 28 : 44;
  for (let i = 0; i < count; i++) {
    const p   = document.createElement('div');
    p.className = 'g-particle';
    const s = Math.random() * 6 + 2;
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * 380 + 60;
    Object.assign(p.style, {
      width:  s + 'px',
      height: s + 'px',
      left: '50%', top: '50%',
      '--gx': Math.cos(a) * d + 'px',
      '--gy': Math.sin(a) * d + 'px',
      animationDelay:    (Math.random() * 0.35) + 's',
      animationDuration: (Math.random() * 1.2 + 1.4) + 's'
    });
    goldBurst.appendChild(p);
  }
}

// ===== FLOATING LOVE ELEMENTS — Minimal & subtle =====
function initFloatingLove() {
  const container = document.querySelector('.floating-love');
  if (!container) return;

  const items = ['✦', '♥', '✧', '⬡'];
  const isMobile = window.innerWidth < 768;

  function spawn() {
    const el = document.createElement('div');
    el.className = 'fl-item';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    Object.assign(el.style, {
      left:              Math.random() * 100 + '%',
      fontSize:          (Math.random() * 8 + 7) + 'px',
      opacity:           String(Math.random() * 0.15 + 0.05),
      color:             Math.random() > 0.5 ? 'rgba(212,175,55,0.4)' : 'rgba(156,18,68,0.25)',
      animationDuration: (Math.random() * 18 + 16) + 's',
      animationDelay:    Math.random() * 3 + 's',
    });
    container.appendChild(el);
    setTimeout(() => el.remove(), 38000);
  }

  const initialCount = isMobile ? 3 : 6;
  for (let i = 0; i < initialCount; i++) setTimeout(spawn, i * 1200);
  setInterval(spawn, isMobile ? 6000 : 3500);
}

// ===== GOLD PARTICLE CANVAS — Reduced count & lighter =====
function initCanvas() {
  const c   = document.getElementById('particleCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');

  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize();
  addEventListener('resize', resize);

  const count = window.innerWidth < 768 ? 20 : 35;

  const dots = Array.from({ length: count }, () => ({
    x:    Math.random() * innerWidth,
    y:    Math.random() * innerHeight,
    s:    Math.random() * 1.8 + 0.4,
    vy:   -(Math.random() * 0.2 + 0.05),
    vx:   (Math.random() - 0.5) * 0.12,
    o:    Math.random() * 0.1 + 0.02,
    age:  0,
    life: Math.random() * 400 + 180
  }));

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    dots.forEach(d => {
      d.x += d.vx + Math.sin(d.age * 0.01) * 0.08;
      d.y += d.vy;
      d.age++;
      if (d.age > d.life || d.y < -5) {
        d.x = Math.random() * c.width;
        d.y = c.height + 5;
        d.age = 0;
      }
      const f = 1 - d.age / d.life;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${d.o * f})`;
      ctx.fill();
    });
    rafId = requestAnimationFrame(draw);
  }
  draw();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(draw);
  });
}

// ===== SCROLL REVEAL =====
function initScrollObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim-up,.anim-left,.anim-right,.anim-scale')
    .forEach(el => obs.observe(el));
}

// ===== COUNTDOWN — with number flip =====
function tickCountdown() {
  const target = new Date('2026-04-26T11:35:00+05:30').getTime();
  let prev = {};

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const strVal = String(val).padStart(2, '0');
    if (prev[id] !== strVal) {
      el.classList.remove('cd-flip');
      void el.offsetWidth;
      el.classList.add('cd-flip');
      el.textContent = strVal;
      prev[id] = strVal;
    }
  }

  (function tick() {
    const d = target - Date.now();
    if (d <= 0) {
      ['cDays', 'cHrs', 'cMin', 'cSec'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    setVal('cDays', Math.floor(d / 864e5));
    setVal('cHrs',  Math.floor(d % 864e5 / 36e5));
    setVal('cMin',  Math.floor(d % 36e5 / 6e4));
    setVal('cSec',  Math.floor(d % 6e4 / 1e3));
    setTimeout(tick, 1000);
  })();
}

// ===== SCROLL: PARALLAX + PROGRESS + NAV =====
let ticking = false;
addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y    = scrollY;
      const hero = document.querySelector('.hero-content');
      if (hero) {
        hero.style.transform = `translateY(${y * 0.28}px)`;
        hero.style.opacity   = Math.max(0, 1 - y / 680);
      }

      const h   = document.documentElement.scrollHeight - innerHeight;
      const bar = document.getElementById('scrollProgress');
      if (bar) bar.style.width = (y / h * 100) + '%';

      // Mobile nav active state
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.mobile-nav a');
      let current = '';
      sections.forEach(s => {
        if (y >= s.offsetTop - 100) current = s.id;
      });
      navLinks.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + current;
        a.classList.toggle('active', isActive);
        a.style.opacity = isActive ? '1' : '0.45';
      });

      ticking = false;
    });
    ticking = true;
  }
});

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('.mobile-nav a, a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    // Stop any auto-scroll in progress
    isAutoScrolling = false;
    if (autoScrollRAF) { cancelAnimationFrame(autoScrollRAF); autoScrollRAF = null; }

    const start = window.pageYOffset;
    const end = target.getBoundingClientRect().top + start - 60;
    const dist = end - start;
    const dur = 800;
    const t0 = performance.now();

    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      window.scrollTo(0, start + dist * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
});