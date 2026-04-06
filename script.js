// ===== ENVELOPE =====
const envStamp = document.getElementById('envStamp');
const envWrapper = document.getElementById('envWrapper');
const envOverlay = document.getElementById('envelope-overlay');
const mainSite = document.getElementById('main-site');
const goldBurst = document.getElementById('goldBurst');

envStamp.addEventListener('click', () => {
  envWrapper.classList.add('flap-open');
  burstParticles();
  setTimeout(() => envWrapper.classList.add('letter-out'), 900);
  setTimeout(() => {
    envOverlay.classList.add('opened');
    mainSite.classList.add('visible');
    document.body.style.overflow = '';
    setTimeout(() => {
      document.querySelector('.site-header').classList.add('visible');
      initCanvas();
      initFloatingLove();
      initScrollObserver();
      tickCountdown();
    }, 500);
  }, 2200);
});

function burstParticles() {
  for (let i = 0; i < 55; i++) {
    const p = document.createElement('div');
    p.className = 'g-particle';
    const s = Math.random() * 7 + 2;
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * 400 + 80;
    Object.assign(p.style, {
      width: s+'px', height: s+'px', left: '50%', top: '45%',
      '--gx': Math.cos(a)*d+'px', '--gy': Math.sin(a)*d+'px',
      animationDelay: Math.random()*0.6+'s',
      animationDuration: (Math.random()*1.5+1.5)+'s'
    });
    goldBurst.appendChild(p);
  }
}

// ===== FLOATING LOVE ELEMENTS =====
function initFloatingLove() {
  const container = document.querySelector('.floating-love');
  if (!container) return;
  const items = ['❤️','✨','💫','♥','✦','💖','⭐'];
  function spawn() {
    const el = document.createElement('div');
    el.className = 'fl-item';
    el.textContent = items[Math.floor(Math.random()*items.length)];
    el.style.left = Math.random()*100+'%';
    el.style.fontSize = (Math.random()*14+10)+'px';
    el.style.animationDuration = (Math.random()*12+10)+'s';
    el.style.animationDelay = Math.random()*2+'s';
    container.appendChild(el);
    setTimeout(() => el.remove(), 24000);
  }
  for(let i=0;i<20;i++) setTimeout(spawn, i*600);
  setInterval(spawn, 1000);
}

// ===== GOLD PARTICLE CANVAS =====
function initCanvas() {
  const c = document.getElementById('particleCanvas');
  const ctx = c.getContext('2d');
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  const dots = Array.from({length:60}, () => ({
    x: Math.random()*c.width, y: Math.random()*c.height,
    s: Math.random()*2.5+0.5, vy: -(Math.random()*0.25+0.06),
    vx: (Math.random()-0.5)*0.15, o: Math.random()*0.15+0.03, age: 0, life: Math.random()*350+150
  }));
  (function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    dots.forEach(d => {
      d.x += d.vx + Math.sin(d.age*0.012)*0.1;
      d.y += d.vy; d.age++;
      if (d.age > d.life || d.y < -5) { d.x=Math.random()*c.width; d.y=c.height+5; d.age=0; }
      const f = 1-d.age/d.life;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.s,0,Math.PI*2);
      ctx.fillStyle = `rgba(212,175,55,${d.o*f})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

// ===== SCROLL REVEAL =====
function initScrollObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.anim-up,.anim-left,.anim-right,.anim-scale').forEach(el => obs.observe(el));
}

// ===== COUNTDOWN =====
function tickCountdown() {
  const target = new Date('2026-04-26T11:35:00+05:30').getTime();
  (function tick() {
    const d = target - Date.now();
    if (d<=0) return;
    document.getElementById('cDays').textContent = Math.floor(d/864e5);
    document.getElementById('cHrs').textContent = String(Math.floor(d%864e5/36e5)).padStart(2,'0');
    document.getElementById('cMin').textContent = String(Math.floor(d%36e5/6e4)).padStart(2,'0');
    document.getElementById('cSec').textContent = String(Math.floor(d%6e4/1e3)).padStart(2,'0');
    requestAnimationFrame(tick);
  })();
}

// ===== PARALLAX + SCROLL PROGRESS =====
addEventListener('scroll', () => {
  const y = scrollY;
  const hero = document.querySelector('.hero-content');
  if(hero){hero.style.transform=`translateY(${y*0.3}px)`;hero.style.opacity=Math.max(0,1-y/700);}
  const h = document.documentElement.scrollHeight - innerHeight;
  const bar = document.getElementById('scrollProgress');
  if(bar) bar.style.width = (y/h*100)+'%';
});
