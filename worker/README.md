# Worker de formularios — Technical Report

Recibe los formularios del sitio (solicitud de inspección y opiniones) y envía el
correo a **info@technicalreport.com.ar** con copia a **victorandres.torres@copime.org.ar**
usando [Resend](https://resend.com).

## Puesta en marcha

1. **Resend → verificar dominio de envío**
   - Crear cuenta en Resend.
   - Domains → Add Domain → `send.technicalreport.com.ar`.
   - Cargar en Cloudflare DNS los registros que indica Resend (DKIM CNAME, SPF TXT y
     el MX de rebotes). Todos van sobre el subdominio `send.`, así que **no tocan**
     el MX/SPF de Google Workspace del dominio raíz.
   - Esperar a que Resend marque el dominio como *Verified*.
   - API Keys → crear una key (permiso de envío).

2. **Desplegar el Worker**
   ```sh
   cd worker
   npm install -g wrangler        # si no lo tenés
   wrangler login
   wrangler secret put RESEND_API_KEY   # pegar la key de Resend
   wrangler deploy
   ```
   `wrangler deploy` imprime la URL del Worker, por ej.:
   `https://technicalreport-contact.<subdominio>.workers.dev`

3. **Conectar el sitio**
   - Pegar esa URL en `ENDPOINT`, al inicio de `script.js`.

## Notas

- `ALLOWED_ORIGINS` (en `src/index.js`) limita desde qué orígenes se acepta el POST.
  Agregar/ajustar dominios según dónde se sirva el sitio.
- El remitente (`FROM`) debe estar en el dominio verificado en Resend.
- `reply_to` se setea con el email del visitante: al responder, va directo a él.
