// Año en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menú móvil
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});

// Cerrar el menú al hacer clic en un enlace
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Formularios — envío al Worker de Cloudflare (Resend)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ENDPOINT = 'https://technicalreport-contact.technicalreportnetadmin.workers.dev';

async function postForm(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || 'Error de envío');
}

const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.className = 'form-note';

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const cuit = form.cuit.value.trim();

    if (!nombre || !cuit || !EMAIL_RE.test(email)) {
      note.textContent = 'Completá tu nombre, CUIT / CUIL y un email válido.';
      note.classList.add('err');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    note.textContent = 'Enviando…';

    try {
      await postForm({
        tipo: 'inspeccion',
        nombre,
        email,
        cuit,
        telefono: form.telefono.value.trim(),
        equipo: form.equipo.value,
        modelo: form.modelo.value.trim(),
        mensaje: form.mensaje.value.trim(),
        _gotcha: form._gotcha.value,
      });
      note.textContent = '¡Gracias! Recibimos tu solicitud y te contactaremos pronto.';
      note.classList.add('ok');
      form.reset();
    } catch (err) {
      note.textContent = 'No se pudo enviar. Probá de nuevo o escribinos a info@technicalreport.com.ar.';
      note.classList.add('err');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Modal de opiniones
const fbModal = document.getElementById('feedbackModal');
const fbOpen = document.getElementById('feedbackOpen');
const fbClose = document.getElementById('feedbackClose');
const fbForm = document.getElementById('feedbackForm');
const fbNote = document.getElementById('feedbackNote');

if (fbModal && fbOpen) {
  fbOpen.addEventListener('click', () => {
    fbNote.textContent = '';
    fbNote.className = 'form-note';
    fbModal.showModal();
  });

  fbClose.addEventListener('click', () => fbModal.close());

  // Cerrar al hacer clic fuera del contenido
  fbModal.addEventListener('click', (e) => {
    if (e.target === fbModal) fbModal.close();
  });

  fbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    fbNote.className = 'form-note';

    const motivo = fbForm.motivo.value.trim();
    const nombre = fbForm.nombre.value.trim();
    const email = fbForm.email.value.trim();
    const mensaje = fbForm.mensaje.value.trim();

    if (!motivo || !nombre || !EMAIL_RE.test(email) || !mensaje) {
      fbNote.textContent = 'Completá el motivo, tu nombre, un email válido y tu mensaje.';
      fbNote.classList.add('err');
      return;
    }

    const submitBtn = fbForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    fbNote.textContent = 'Enviando…';

    try {
      await postForm({
        tipo: 'consulta',
        motivo,
        nombre,
        cuit: fbForm.cuit.value.trim(),
        email,
        asunto: fbForm.asunto.value.trim(),
        mensaje,
        _gotcha: fbForm._gotcha.value,
      });
      fbNote.textContent = '¡Gracias! Recibimos tu consulta.';
      fbNote.classList.add('ok');
      fbForm.reset();
      setTimeout(() => fbModal.close(), 1500);
    } catch (err) {
      fbNote.textContent = 'No se pudo enviar. Probá de nuevo más tarde.';
      fbNote.classList.add('err');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Resaltar el enlace de navegación según la sección visible
const sections = document.querySelectorAll('section[id]');
const navLinks = nav.querySelectorAll('a');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((l) => {
          l.style.color = l.getAttribute('href') === `#${id}` ? 'var(--ink)' : '';
        });
      }
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);

sections.forEach((s) => observer.observe(s));

// Cargar como background la foto de cualquier elemento con data-img,
// probando varias extensiones y usando el primer archivo que exista en images/.
const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

document.querySelectorAll('[data-img]').forEach((card) => {
  const base = card.getAttribute('data-img');
  let i = 0;

  const tryNext = () => {
    if (i >= IMG_EXTS.length) return; // no se encontró ninguna: queda el panel oscuro
    const url = `images/${base}.${IMG_EXTS[i++]}`;
    const probe = new Image();
    probe.onload = () => { card.style.backgroundImage = `url('${url}')`; };
    probe.onerror = tryNext;
    probe.src = url;
  };

  tryNext();
});
