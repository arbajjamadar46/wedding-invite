// ===== SCROLL INTRO =====
const siCta       = document.getElementById('siCta');
const scrollIntro = document.getElementById('scroll-intro');
const mainSite    = document.getElementById('main-site');
const goldBurst   = document.getElementById('goldBurst');

siCta.addEventListener('click', () => {
  burstParticles();

  const wrap = document.getElementById('siScrollWrap');
  wrap.style.transition = 'transform 0.85s cubic-bezier(0.4,0,0.2,1), opacity 0.85s ease';
  wrap.style.transform  = 'scale(1.05) translateY(-24px)';
  wrap.style.opacity    = '0';

  setTimeout(() => {
    scrollIntro.classList.add('opened');
    mainSite.classList.add('visible');
    document.body.style.overflow = '';
    setTimeout(() => {
      document.querySelector('.site-header').classList.add('visible');
      initCanvas();
      initFloatingLove();
      initScrollObserver();
      tickCountdown();
    }, 350);
  }, 750);
});

// ===== GOLD BURST PARTICLES =====
function burstParticles() {
  const count = window.innerWidth < 480 ? 28 : 44; // fewer on mobile
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

  // Reduced, curated set — no overwhelming emoji rain
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

  // Spawn far fewer items — 6 initial, then 1 every 4 sec (vs 1 per sec before)
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

  // Mobile: 20 dots; desktop: 35 — was 60
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
  (function draw() {
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
  })();

  // Pause canvas when tab is hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(draw); // resume
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
      void el.offsetWidth; // force reflow
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