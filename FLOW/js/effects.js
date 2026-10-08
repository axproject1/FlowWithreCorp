/**
 * Flow Withre Corp — Visual Effects Engine
 * ==========================================
 * 1. Liquid Morphing Background (WebGL-style via Canvas 2D)
 * 2. Holographic / Iridescent Cards (cursor tracking)
 * 3. Mouse trail glow
 */

(() => {
  'use strict';

  /* ============================================================
     1. LIQUID MORPHING BACKGROUND
     Uses metaballs / organic blob animation via Canvas 2D
     ============================================================ */
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const blobs = [];
  const BLOB_COUNT = 6;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Define colour palette for blobs
  const PALETTE = [
    { r: 255, g: 45,  b: 85  },  // neon-red
    { r: 191, g: 90,  b: 242 },  // neon-purple
    { r: 0,   g: 245, b: 255 },  // neon-cyan
    { r: 255, g: 107, b: 0   },  // neon-orange
    { r: 255, g: 214, b: 10  },  // neon-yellow
    { r: 48,  g: 209, b: 88  },  // neon-green
  ];

  class Blob {
    constructor(index) {
      this.color = PALETTE[index % PALETTE.length];
      this.reset();
    }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.radius = 150 + Math.random() * 220;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.opacity = 0.07 + Math.random() * 0.09;
      // Sinusoidal oscillation params
      this.phaseX = Math.random() * Math.PI * 2;
      this.phaseY = Math.random() * Math.PI * 2;
      this.freqX  = 0.0003 + Math.random() * 0.0004;
      this.freqY  = 0.0003 + Math.random() * 0.0004;
      this.ampX   = 50 + Math.random() * 80;
      this.ampY   = 50 + Math.random() * 80;
      this.baseX  = Math.random() * W;
      this.baseY  = Math.random() * H;
      // Morphing radius
      this.radiusPhase = Math.random() * Math.PI * 2;
      this.radiusFreq  = 0.0005 + Math.random() * 0.0008;
      this.radiusAmp   = 40 + Math.random() * 60;
    }

    update(time) {
      this.x = this.baseX + Math.sin(time * this.freqX + this.phaseX) * this.ampX;
      this.y = this.baseY + Math.cos(time * this.freqY + this.phaseY) * this.ampY;
      this.currentRadius = this.radius + Math.sin(time * this.radiusFreq + this.radiusPhase) * this.radiusAmp;
    }

    draw() {
      const { r, g, b } = this.color;
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.currentRadius
      );
      gradient.addColorStop(0,   `rgba(${r},${g},${b},${this.opacity})`);
      gradient.addColorStop(0.5, `rgba(${r},${g},${b},${this.opacity * 0.5})`);
      gradient.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function initBlobs() {
    blobs.length = 0;
    for (let i = 0; i < BLOB_COUNT; i++) {
      blobs.push(new Blob(i));
    }
  }

  let animFrame;
  function animateLiquid(time) {
    ctx.clearRect(0, 0, W, H);

    // Subtle dark base
    ctx.fillStyle = 'rgba(6,6,16,0.95)';
    ctx.fillRect(0, 0, W, H);

    // Draw blobs
    ctx.globalCompositeOperation = 'screen';
    blobs.forEach(b => {
      b.update(time);
      b.draw();
    });
    ctx.globalCompositeOperation = 'source-over';

    animFrame = requestAnimationFrame(animateLiquid);
  }

  // Mouse-responsive blob
  let mouseBlob = null;
  window.addEventListener('mousemove', (e) => {
    if (!mouseBlob) {
      mouseBlob = {
        x: e.clientX, y: e.clientY,
        targetX: e.clientX, targetY: e.clientY,
        radius: 180, opacity: 0.05,
        color: { r: 255, g: 255, b: 255 }
      };
    }
    mouseBlob.targetX = e.clientX;
    mouseBlob.targetY = e.clientY;
  });

  function drawMouseBlob() {
    if (!mouseBlob) return;
    mouseBlob.x += (mouseBlob.targetX - mouseBlob.x) * 0.06;
    mouseBlob.y += (mouseBlob.targetY - mouseBlob.y) * 0.06;

    const grad = ctx.createRadialGradient(
      mouseBlob.x, mouseBlob.y, 0,
      mouseBlob.x, mouseBlob.y, mouseBlob.radius
    );
    grad.addColorStop(0, `rgba(255,255,255,0.06)`);
    grad.addColorStop(1, `rgba(255,255,255,0)`);

    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(mouseBlob.x, mouseBlob.y, mouseBlob.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // Override animate to include mouse blob
  function animate(time) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(6,6,16,1)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    blobs.forEach(b => {
      b.update(time);
      b.draw();
    });
    drawMouseBlob();
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    blobs.forEach(b => b.reset());
  });

  resizeCanvas();
  initBlobs();
  requestAnimationFrame(animate);


  /* ============================================================
     2. HOLOGRAPHIC / IRIDESCENT CARD EFFECT
     Tracks cursor position to create rainbow tilt glow
     ============================================================ */
  const cards = document.querySelectorAll('.cat-card');

  cards.forEach(card => {
    let bounds;
    let glowAngle = 135;
    let rafId;

    function onEnter() {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'box-shadow 0.15s ease';
    }

    function onMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();

      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      // Normalize to -0.5 to 0.5
      const nx = (x / bounds.width)  - 0.5;
      const ny = (y / bounds.height) - 0.5;

      // 3D tilt
      const rotateX = ny * -18;
      const rotateY = nx *  18;

      // Angle of holo glow based on cursor
      glowAngle = Math.atan2(ny, nx) * (180 / Math.PI) + 90;

      // Highlight position percentage
      const px = (x / bounds.width)  * 100;
      const py = (y / bounds.height) * 100;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        card.style.setProperty('--holo-angle', `${glowAngle}deg`);

        // Dynamic holographic shimmer
        card.style.background = `
          radial-gradient(
            ellipse at ${px}% ${py}%,
            rgba(255,255,255,0.12) 0%,
            rgba(255,255,255,0.04) 40%,
            rgba(255,255,255,0.02) 70%,
            transparent 100%
          ),
          rgba(255, 255, 255, 0.07)
        `;
      });
    }

    function onLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
      card.style.background = '';
      card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, background 0.5s ease';
      bounds = null;
    }

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);

    // Touch support - simplified
    card.addEventListener('touchstart', (e) => {
      bounds = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('touchend', onLeave);
  });


  /* ============================================================
     3. SECTION REVEAL ANIMATIONS (IntersectionObserver)
     ============================================================ */
  const revealElements = document.querySelectorAll('.cat-card, .categories h2, .section-subtitle');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    revealObserver.observe(el);
  });


  /* ============================================================
     4. HEADER SCROLL STICKY REVEAL & TRANSPARENCY
     ============================================================ */
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Ocultamiento inteligente (Sticky Reveal):
    // Si hace scroll hacia abajo y ha bajado más de 80px -> ocultar header
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      header.classList.add('nav-hidden');
    } else {
      // Si hace scroll hacia arriba o está arriba del todo -> mostrar header
      header.classList.remove('nav-hidden');
    }

    // Efecto de transparencia cristal al desplazarse
    if (currentScrollY > 50) {
      header.style.background = 'rgba(6, 6, 16, 0.55)';
      header.style.boxShadow = '0 12px 35px rgba(0,0,0,0.6), 0 0 25px rgba(255,45,85,0.15)';
    } else {
      header.style.background = 'rgba(6, 6, 16, 0.35)';
      header.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(255,45,85,0.08)';
    }

    lastScrollY = currentScrollY;
  }, { passive: true });


  /* ============================================================
     5. MENU TOGGLE (hamburger)
     ============================================================ */
  const menuToggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');

  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    // Close on nav link click
    navbar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });
  }

})();
