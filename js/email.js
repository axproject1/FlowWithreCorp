/**
 * FLOW WITHRE CORP — Integración de EmailJS
 * 
 * GUÍA RÁPIDA DE CONFIGURACIÓN:
 * 1. Crea una cuenta gratuita en https://www.emailjs.com/
 * 2. Ve a "Email Services" > "Add New Service" (ej. Gmail, conecta flowwithrecorp@gmail.com)
 *    -> Copia tu SERVICE_ID y pégalo abajo.
 * 3. Ve a "Email Templates" > "Create New Template"
 *    -> Configura tu plantilla usando estas variables entre dobles llaves:
 *       {{user_name}}      : Nombre del remitente
 *       {{user_lastname}}  : Apellido
 *       {{user_email}}     : Correo del remitente
 *       {{subject}}        : Asunto seleccionado
 *       {{message}}        : Mensaje
 *    -> Copia tu TEMPLATE_ID y pégalo abajo.
 * 4. Ve a "Account" > "Public Key" (API Keys)
 *    -> Copia tu PUBLIC_KEY y pégalo abajo.
 */

const EMAILJS_CONFIG = {
  PUBLIC_KEY: "JeIBNGDL48k5cD7sI",   // Clave Pública de EmailJS
  SERVICE_ID: "service_1z6pl5g",     // Service ID (Gmail)
  TEMPLATE_ID: "template_j5icize",   // Template ID de Contacto
  // Si deseas una plantilla distinta para solicitudes de membresía más adelante, ponla aquí:
  MEMBER_TEMPLATE_ID: "TU_TEMPLATE_ID"
};

// Inicializar EmailJS si la clave pública está presente y es válida
document.addEventListener('DOMContentLoaded', () => {
  const isKeyConfigured = EMAILJS_CONFIG.PUBLIC_KEY && 
                          EMAILJS_CONFIG.PUBLIC_KEY !== "TU_PUBLIC_KEY";

  if (window.emailjs && isKeyConfigured) {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
    });
  }

  // ==========================================
  // 1. FORMULARIO DE CONTACTO PRINCIPAL
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const contactSuccess = document.getElementById('contact-success');
  const contactResetBtn = document.getElementById('contact-reset-btn');
  const contactAlert = document.getElementById('contact-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.contact-submit') || contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      // Ocultar alerta previa si existe
      if (contactAlert) {
        contactAlert.style.display = 'none';
        contactAlert.className = 'form-alert';
        contactAlert.innerHTML = '';
      }

      // Estado de carga
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;

      // Si las claves aún no han sido configuradas, simular envío con aviso amigable
      if (!isKeyConfigured || EMAILJS_CONFIG.SERVICE_ID === "TU_SERVICE_ID" || EMAILJS_CONFIG.TEMPLATE_ID === "TU_TEMPLATE_ID") {
        console.warn('⚠️ [EmailJS]: No has configurado tus credenciales en js/email.js. Mostrando simulación de envío.');
        
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.disabled = false;
          contactForm.reset();
          contactForm.style.display = 'none';
          if (contactSuccess) contactSuccess.style.display = 'flex';

          if (contactAlert) {
            contactAlert.style.display = 'block';
            contactAlert.className = 'form-alert form-alert-warning';
            contactAlert.innerHTML = '<i class="fas fa-triangle-exclamation"></i> <strong>Modo Demo:</strong> Configura tus claves de EmailJS en <code>js/email.js</code> para recibir mensajes reales en tu bandeja de entrada.';
          }
        }, 1000);
        return;
      }

      // Envío real con EmailJS
      emailjs.sendForm(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, contactForm)
        .then(() => {
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.disabled = false;
          contactForm.reset();
          contactForm.style.display = 'none';
          if (contactSuccess) contactSuccess.style.display = 'flex';
        })
        .catch((error) => {
          console.error('❌ Error al enviar con EmailJS:', error);
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.disabled = false;

          if (contactAlert) {
            contactAlert.style.display = 'block';
            contactAlert.className = 'form-alert form-alert-error';
            contactAlert.innerHTML = `<i class="fas fa-circle-exclamation"></i> Ocurrió un error al enviar el mensaje (${error.text || error.message || 'Error de conexión'}). Por favor, intenta de nuevo o escríbenos directamente a flowwithrecorp@gmail.com`;
          } else {
            alert('Error al enviar el mensaje. Inténtalo de nuevo más tarde.');
          }
        });
    });

    // Botón para resetear y enviar otro mensaje
    if (contactResetBtn) {
      contactResetBtn.addEventListener('click', () => {
        if (contactSuccess) contactSuccess.style.display = 'none';
        contactForm.style.display = 'flex';
        if (contactAlert) contactAlert.style.display = 'none';
      });
    }
  }

  // ==========================================
  // 2. FORMULARIO DE MEMBRESÍA (MODAL)
  // ==========================================
  const memberForm = document.getElementById('member-form');
  const memberSuccess = document.getElementById('form-success');
  const memberAlert = document.getElementById('member-alert');

  if (memberForm) {
    memberForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const memberBtn = memberForm.querySelector('.form-submit') || memberForm.querySelector('button[type="submit"]');
      const originalMemberBtnHtml = memberBtn.innerHTML;

      if (memberAlert) {
        memberAlert.style.display = 'none';
        memberAlert.className = 'form-alert';
      }

      memberBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      memberBtn.disabled = true;

      // Si no hay configuración real para membresía
      const hasMemberTemplate = isKeyConfigured && 
                                EMAILJS_CONFIG.MEMBER_TEMPLATE_ID && 
                                EMAILJS_CONFIG.MEMBER_TEMPLATE_ID !== "TU_TEMPLATE_ID";

      if (!hasMemberTemplate) {
        // Simulación exitosa si no está configurada la plantilla
        setTimeout(() => {
          memberBtn.innerHTML = originalMemberBtnHtml;
          memberBtn.disabled = false;
          memberForm.reset();
          memberForm.style.display = 'none';
          if (memberSuccess) memberSuccess.style.display = 'flex';
        }, 900);
        return;
      }

      emailjs.sendForm(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.MEMBER_TEMPLATE_ID, memberForm)
        .then(() => {
          memberBtn.innerHTML = originalMemberBtnHtml;
          memberBtn.disabled = false;
          memberForm.reset();
          memberForm.style.display = 'none';
          if (memberSuccess) memberSuccess.style.display = 'flex';
        })
        .catch((error) => {
          console.error('❌ Error al enviar solicitud de membresía:', error);
          memberBtn.innerHTML = originalMemberBtnHtml;
          memberBtn.disabled = false;

          if (memberAlert) {
            memberAlert.style.display = 'block';
            memberAlert.className = 'form-alert form-alert-error';
            memberAlert.innerHTML = `<i class="fas fa-circle-exclamation"></i> Error al enviar solicitud. Intenta nuevamente.`;
          }
        });
    });
  }
});
