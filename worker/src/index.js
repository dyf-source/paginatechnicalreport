// Worker de Technical Report — recibe los formularios del sitio y envía el correo vía SMTP2GO.
// Secret requerido: SMTP2GO_API_KEY (npx wrangler secret put SMTP2GO_API_KEY)

const RECIPIENT = 'info@technicalreport.com.ar';
const RECIPIENT_CC = 'victorandres.torres@copime.org.ar';
const FROM = 'Technical Report <web@technicalreport.com.ar>';

const ALLOWED_ORIGINS = [
  'https://technicalreport.com.ar',
  'https://www.technicalreport.com.ar',
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, cors);

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: 'Cuerpo inválido' }, 400, cors);
    }

    // Honeypot: si un bot rellena este campo oculto, fingimos éxito y no enviamos.
    if (data._gotcha) return json({ ok: true }, 200, cors);

    const tipo = data.tipo === 'opinion' ? 'opinion' : 'inspeccion';
    const nombre = (data.nombre || '').trim();
    const email = (data.email || '').trim();

    if (!nombre || !EMAIL_RE.test(email)) {
      return json({ ok: false, error: 'Datos incompletos' }, 422, cors);
    }
    if (tipo === 'inspeccion' && !(data.cuit || '').trim()) {
      return json({ ok: false, error: 'Falta CUIT / CUIL' }, 422, cors);
    }

    const { subject, lines } = tipo === 'opinion' ? buildOpinion(data) : buildInspeccion(data);
    const text = lines.filter((l) => l !== null).join('\n');

    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': env.SMTP2GO_API_KEY,
      },
      body: JSON.stringify({
        sender: FROM,
        to: [RECIPIENT],
        // cc: [RECIPIENT_CC], // desactivado temporalmente para pruebas
        subject,
        text_body: text,
        custom_headers: [{ header: 'Reply-To', value: email }],
      }),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result?.data?.succeeded) {
      console.log('SMTP2GO error', res.status, JSON.stringify(result));
      return json({ ok: false, error: 'No se pudo enviar' }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

function field(label, value) {
  const v = (value || '').trim();
  return v ? [`${label}:`, v, ''] : [];
}

function buildInspeccion(d) {
  return {
    subject: 'Solicitud de inspección — Technical Report',
    lines: [
      ...field('Nombre / Empresa', d.nombre),
      ...field('CUIT / CUIL', d.cuit),
      ...field('Teléfono', d.telefono),
      ...field('Equipo', d.equipo),
      ...field('Modelo/s', d.modelo),
      ...field('Email de contacto', d.email),
      ...field('Mensaje', d.mensaje),
    ],
  };
}

function buildOpinion(d) {
  return {
    subject: 'Opinión — Technical Report',
    lines: [
      ...field('Nombre / Empresa', d.nombre),
      ...field('Email de contacto', d.email),
      ...field('Opinión', d.mensaje),
    ],
  };
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
