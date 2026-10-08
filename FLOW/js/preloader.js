// ===== PRELOADER JS — Flow Withre Corp =====
document.addEventListener('DOMContentLoaded', function () {
  const preloader = document.getElementById('preloader');
  const loaderFill = document.querySelector('.loader-fill');
  const accessBtn = document.getElementById('access-btn');

  if (!preloader) return;

  // Si ya pasó el preloader en esta sesión, ocultarlo de inmediato
  if (sessionStorage.getItem('preloaderPassed')) {
    preloader.style.display = 'none';
    return;
  }

  // Simular carga con incremento progresivo
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 85) {
      clearInterval(interval);
      progress = 85;
    }
    loaderFill.style.width = progress + '%';
  }, 200);

  function dismiss() {
    clearInterval(interval);
    loaderFill.style.width = '100%';

    setTimeout(() => {
      preloader.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      preloader.style.opacity = '0';
      preloader.style.transform = 'scale(1.03)';
      setTimeout(() => {
        preloader.style.display = 'none';
        sessionStorage.setItem('preloaderPassed', 'true');
      }, 500);
    }, 300);
  }

  // Botón Acceder
  if (accessBtn) {
    accessBtn.addEventListener('click', dismiss);
  }

  // Auto-ocultar después de 3.5s
  setTimeout(dismiss, 3500);
});
