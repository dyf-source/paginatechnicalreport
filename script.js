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

// Formularios — abren el cliente de correo del visitante (mailto)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECIPIENT = 'info@technicalreport.com.ar';
const RECIPIENT_CC = 'victorandres.torres@copime.org.ar';

function openMailto(subject, lines) {
  const body = lines.filter((l) => l !== null).join('\n');
  const query = `cc=${encodeURIComponent(RECIPIENT_CC)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = `mailto:${RECIPIENT}?${query}`;
}

const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', (e) => {
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

    const telefono = form.telefono.value.trim();
    const equipo = form.equipo.value;
    const modelo = form.modelo.value.trim();
    const mensaje = form.mensaje.value.trim();

    openMailto('Solicitud de inspección — Technical Report', [
      `Nombre / empresa: ${nombre}`,
      `CUIT / CUIL: ${cuit}`,
      telefono ? `Teléfono: ${telefono}` : null,
      equipo ? `Equipo: ${equipo}` : null,
      modelo ? `Modelo/s: ${modelo}` : null,
      '',
      mensaje,
    ]);

    note.textContent = 'Abrimos tu correo para enviar la solicitud. Si no se abre, escribinos a info@technicalreport.com.ar.';
    note.classList.add('ok');
    form.reset();
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

  fbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fbNote.className = 'form-note';

    const nombre = fbForm.nombre.value.trim();
    const email = fbForm.email.value.trim();
    const mensaje = fbForm.mensaje.value.trim();

    if (!nombre || !EMAIL_RE.test(email) || !mensaje) {
      fbNote.textContent = 'Completá tu nombre, un email válido y tu opinión.';
      fbNote.classList.add('err');
      return;
    }

    openMailto('Opinión — Technical Report', [
      `Nombre / empresa: ${nombre}`,
      '',
      mensaje,
    ]);

    fbNote.textContent = 'Abrimos tu correo para enviar tu opinión.';
    fbNote.classList.add('ok');
    fbForm.reset();
    setTimeout(() => fbModal.close(), 1500);
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
