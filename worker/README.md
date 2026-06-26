# Worker de formularios — Technical Report

Recibe los formularios del sitio (solicitud de inspección y consultas) y envía el
correo a **info@technicalreport.com.ar** con copia a **victorandres.torres@copime.org.ar**
usando [SMTP2GO](https://www.smtp2go.com) (API HTTP `/v3/email/send`).

## Puesta en marcha

1. **SMTP2GO → verificar dominio de envío**
   - Crear cuenta en SMTP2GO.
   - Sending → Verified Senders → Sender Domains → agregar `technicalreport.com.ar`.
   - Cargar en Cloudflare DNS los registros CNAME (DKIM/return-path) que indica SMTP2GO.
     Usan selectores propios, así que **no tocan** el MX/SPF/DKIM de Google Workspace.
   - Esperar a que SMTP2GO marque el dominio como *Verified*.
   - Settings → API Keys → crear una API key (empieza con `api-...`).

2. **Desplegar el Worker**
   ```sh
   cd worker
   npm install -g wrangler        # si no lo tenés
   wrangler login
   wrangler secret put SMTP2GO_API_KEY   # pegar la API key de SMTP2GO
   wrangler deploy
   ```
   `wrangler deploy` imprime la URL del Worker, por ej.:
   `https://technicalreport-contact.<subdominio>.workers.dev`

3. **Conectar el sitio**
   - Pegar esa URL en `ENDPOINT`, al inicio de `script.js`.

## Notas

- `ALLOWED_ORIGINS` (en `src/index.js`) limita desde qué orígenes se acepta el POST.
  Agregar/ajustar dominios según dónde se sirva el sitio.
- El remitente (`FROM`) debe estar en el dominio verificado en SMTP2GO.
- El `Reply-To` se setea con el email del visitante: al responder, va directo a él.
