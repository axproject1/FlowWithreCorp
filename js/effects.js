/**
 * FLOW WITHRE CORP — Minimalist Visual Effects & Mascot Controller
 * =================================================================
 * 1. Subtle Ambient Aurora Canvas (Low-opacity, sleek, modern)
 * 2. Interactive Mascot Pose Switcher
 * 3. Card 3D Subtle Tilt & Micro-interactions
 * 4. Header Scroll Elevation
 */

(() => {
  'use strict';

  /* ============================================================
     1. SUBTLE AMBIENT AURORA CANVAS
     ============================================================ */
  const canvas = document.getElementById('liquid-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resizeCanvas() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    // Minimalist, elegant palette derived from new logo
    const AURORA_BLOBS = [
      { x: 0.2, y: 0.3, r: 350, color: 'rgba(121, 40, 202, 0.05)', vx: 0.0003, vy: 0.0002 },
      { x: 0.8, y: 0.4, r: 400, color: 'rgba(255, 0, 122, 0.045)', vx: -0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.8, r: 450, color: 'rgba(100, 30, 180, 0.035)', vx: 0.0002, vy: -0.0002 }
    ];

    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    let lastTime = 0;
    function render(time) {
      ctx.clearRect(0, 0, W, H);

      // Deep dark base
      ctx.fillStyle = '#07080c';
      ctx.fillRect(0, 0, W, H);

      // Subtle ambient blobs
      AURORA_BLOBS.forEach((b, i) => {
        const cx = (b.x + Math.sin(time * b.vx + i) * 0.15) * W;
        const cy = (b.y + Math.cos(time * b.vy + i) * 0.15) * H;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Smooth mouse follow spotlight (subtle)
      if (mouse.targetX > 0) {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
        mouseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.025)');
        mouseGrad.addColorStop(0.5, 'rgba(255, 0, 122, 0.015)');
        mouseGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 280, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(render);
  }

  /* ============================================================
     2. INTERACTIVE MASCOT POSE SWITCHER
     ============================================================
     📷 CONFIGURACIÓN DE IMÁGENES DE PERSONAJES:
     Puedes reemplazar las imágenes en la carpeta 'img/personajes/'
     o cambiar directamente las rutas y textos aquí:
     ============================================================ */
  const poseBtns = document.querySelectorAll('.pose-btn');
  const mascotImg = document.getElementById('hero-mascot-img');
  const mascotRole = document.getElementById('mascot-role-text');

  const POSE_DATA = {
    'standing': {
      src: 'img/personajes/personaje-1.png', // <-- TU IMAGEN 1 (Principal)
      role: 'Streetwear & Outfit Principal'
    },
    'laptop': {
      src: 'img/personajes/personaje-2.png', // <-- TU IMAGEN 2 (Studio)
      role: 'Studio, Creación & Digital Tech'
    },
    'headphones': {
      src: 'img/personajes/personaje-3.png', // <-- TU IMAGEN 3 (Gamer)
      role: 'Gaming Session & Beats'
    },
    'crouch': {
      src: 'img/personajes/personaje-4.png', // <-- TU IMAGEN 4 (Urbano/Flow)
      role: 'Actitud Urbana & Flow 100%'
    }
  };

  if (poseBtns.length && mascotImg) {
    poseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const poseKey = btn.getAttribute('data-pose');
        if (!POSE_DATA[poseKey]) return;

        // Switch active button class
        poseBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Smooth image crossfade
        mascotImg.style.opacity = '0';
        mascotImg.style.transform = 'scale(0.96)';

        setTimeout(() => {
          mascotImg.src = POSE_DATA[poseKey].src;
          if (mascotRole) {
            mascotRole.textContent = POSE_DATA[poseKey].role;
          }
          mascotImg.style.opacity = '1';
          mascotImg.style.transform = 'scale(1)';
        }, 180);
      });
    });
  }

  /* ============================================================
     3. SUBTLE CARD 3D TILT
     ============================================================ */
  const tiltCards = document.querySelectorAll('.cat-card, .mascot-showcase-card');

  tiltCards.forEach(card => {
    let bounds;

    function onMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      const nx = (x / bounds.width) - 0.5;
      const ny = (y / bounds.height) - 0.5;

      const rotX = ny * -8;
      const rotY = nx * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    }

    function onLeave() {
      card.style.transform = '';
      bounds = null;
    }

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.15s ease';
    });
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      onLeave();
    });
  });

  /* ============================================================
     4. HEADER SCROLL ELEVATION
     ============================================================ */
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('nav-scrolled');
      } else {
        header.classList.remove('nav-scrolled');
      }
    }, { passive: true });
  }

  console.log('Flow Withre — Minimalist Engine Initialized ✨');
})();
