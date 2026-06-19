# Technical Report — Sitio web

Sitio institucional de **Technical Report**, empresa de **inspección, ensayo y certificación de equipos de izaje**.

> No comercializamos equipos: brindamos el respaldo técnico que confirma que los equipos del cliente están aptos para operar.

## Stack

Sitio estático, sin build ni dependencias:

- `index.html` — estructura y contenido
- `styles.css` — estilos (identidad de marca, color `#f7b926`)
- `script.js` — menú móvil, validación del formulario y carga de imágenes
- `images/` — logos y fotografías

## Cómo verlo

Abrí `index.html` en cualquier navegador (doble clic). No requiere servidor.

## Imágenes

Las tarjetas de equipos y la tarjeta de reporte cargan su foto por **nombre base, sin importar la extensión** (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`). Ver `images/README.txt` para los nombres esperados.

## Secciones

Servicios · Alcance (7 tipos de equipos) · Proceso · Nosotros · Contacto

## Pendientes

- Teléfono / WhatsApp reales (placeholder en `index.html`, reemplazar por `https://wa.me/54...`).
- Completar fotos faltantes en `images/`.
- Fuente **Conthrax**: se carga vía CDN; para producción conviene licenciarla e incrustarla localmente.
