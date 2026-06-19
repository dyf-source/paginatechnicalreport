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

// Validación básica del formulario (demo, sin backend)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  note.className = 'form-note';

  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!nombre || !emailOk) {
    note.textContent = 'Completá tu nombre y un email válido.';
    note.classList.add('err');
    return;
  }

  note.textContent = '¡Gracias! Recibimos tu solicitud y te contactaremos pronto.';
  note.classList.add('ok');
  form.reset();
});

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
