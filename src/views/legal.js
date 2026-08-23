/**
 * Legal pages: Privacy Policy, Cookie Policy and Terms & Conditions.
 * A single view that renders one of the three based on `page`.
 *
 * NOTE: These are good-faith, project-specific drafts, not legal advice.
 * Responsable: Carlos Rubio Muriel · carrumu05@gmail.com · castigosfantasy.com
 */

const LAST_UPDATED = '23 de agosto de 2026';
const OWNER = 'Carlos Rubio Muriel';
const EMAIL = 'castigosfantasy2005@gmail.com';
const SITE = 'castigosfantasy.com';

const LEGAL_BODIES = {
  privacidad: privacyBody,
  cookies: cookiesBody,
  terminos: termsBody
};
const LEGAL_TITLES = {
  privacidad: 'Política de Privacidad',
  cookies: 'Política de Cookies',
  terminos: 'Términos y Condiciones'
};

// Exported so scripts/prerender.mjs can bake each of these into a real
// static dist/<page>/index.html — see the matching note in about.js for why
// that matters for indexing (Google was seeing all three as duplicates of
// the homepage, since only client-side JS ever gave them their own content).
export function legalPageHTML(page = 'privacidad') {
  const current = LEGAL_BODIES[page] ? page : 'privacidad';
  const titles = LEGAL_TITLES;
  const currentBody = LEGAL_BODIES[current]();
  return `
    <div class="legal-page" style="max-width: 820px; margin: 0 auto; padding: 1rem 0 3rem;">
      <a id="legal-back" style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--text-muted);font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:1.25rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Volver
      </a>

      <h1 style="font-family:var(--font-display);font-weight:900;font-size:1.9rem;text-transform:uppercase;line-height:1.05;margin-bottom:0.35rem;">${titles[current]}</h1>
      <p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:1.5rem;">Última actualización: ${LAST_UPDATED}</p>

      <nav style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:2rem;">
        ${['privacidad','cookies','terminos'].map(p => `
          <button class="legal-tab" data-page="${p}" style="
            font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.3px;
            padding:0.45rem 0.85rem;border-radius:6px;cursor:pointer;
            border:1.5px solid ${p===current?'var(--accent)':'var(--border-color)'};
            background:${p===current?'rgba(222,237,0,0.1)':'transparent'};
            color:${p===current?'var(--accent)':'var(--text-muted)'};
          ">${titles[p].replace('Política de ','').replace('Términos y ','Términos y ')}</button>
        `).join('')}
      </nav>

      <div class="legal-body" style="font-size:0.9rem;line-height:1.65;color:var(--text-light);">
        ${currentBody}
      </div>
    </div>
  `;
}

export function renderLegal(container, { page = 'privacidad', onNavigate } = {}) {
  container.innerHTML = legalPageHTML(page);

  container.querySelector('#legal-back')?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else onNavigate?.('inicio');
  });
  container.querySelectorAll('.legal-tab').forEach(btn => {
    btn.addEventListener('click', () => onNavigate?.(btn.dataset.page));
  });
}

// Shared inline styles for headings / paragraphs inside the legal body.
const H = 'font-family:var(--font-display);font-weight:800;font-size:1.05rem;text-transform:uppercase;margin:1.75rem 0 0.6rem;color:var(--text-light);';
const P = 'margin:0 0 0.85rem;';
const UL = 'margin:0 0 0.85rem;padding-left:1.25rem;';
const LI = 'margin-bottom:0.35rem;';

function privacyBody() {
  return `
    <p style="${P}">En CastigosFantasy nos tomamos en serio tu privacidad. Esta política explica qué datos personales tratamos, con qué finalidad y qué derechos tienes sobre ellos, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).</p>

    <h2 style="${H}">1. Responsable del tratamiento</h2>
    <p style="${P}">${OWNER}, titular del sitio web <strong>${SITE}</strong>.<br/>Correo de contacto: <a href="mailto:${EMAIL}" style="color:var(--accent);">${EMAIL}</a>.</p>

    <h2 style="${H}">2. Qué datos tratamos</h2>
    <ul style="${UL}">
      <li style="${LI}"><strong>Datos de cuenta:</strong> tu correo electrónico, contraseña (gestionada y cifrada por nuestro proveedor de autenticación; nunca la almacenamos ni la vemos en texto claro), nombre para mostrar, apodo y avatar (opcional). Si te registras con Google, recibimos tu correo, nombre y foto de perfil de tu cuenta de Google.</li>
      <li style="${LI}"><strong>Datos de uso del servicio:</strong> ligas a las que perteneces, registros de castigos y deudas simbólicas, votaciones y mensajes que publiques en el foro o el muro.</li>
      <li style="${LI}"><strong>Sincronización con Biwenger, Comunio o Mister (opcional):</strong> si el administrador de una liga la activa, se almacenan sus credenciales de esa plataforma de forma restringida, usadas únicamente para leer la clasificación de esa liga.</li>
      <li style="${LI}"><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo y navegador, e información almacenada en tu dispositivo (ver la <a href="/cookies" style="color:var(--accent);">Política de Cookies</a>).</li>
    </ul>

    <h2 style="${H}">3. Finalidades y base jurídica</h2>
    <ul style="${UL}">
      <li style="${LI}"><strong>Prestar el servicio y gestionar tu cuenta</strong> (incluido el inicio de sesión con Google, si lo eliges): ejecución de la relación contractual que aceptas al registrarte.</li>
      <li style="${LI}"><strong>Notificarnos internamente de altas nuevas:</strong> interés legítimo en detectar problemas de registro, con el mínimo dato necesario.</li>
      <li style="${LI}"><strong>Publicidad (Adsterra) y fuentes de terceros (Google Fonts):</strong> tu consentimiento, que puedes retirar en cualquier momento.</li>
      <li style="${LI}"><strong>Atender tus consultas de soporte:</strong> tu consentimiento al contactarnos.</li>
    </ul>

    <h2 style="${H}">4. Destinatarios y encargados del tratamiento</h2>
    <p style="${P}">No vendemos tus datos. Compartimos la información estrictamente necesaria con proveedores que nos prestan servicio:</p>
    <ul style="${UL}">
      <li style="${LI}"><strong>Supabase, Inc.</strong> — autenticación y base de datos.</li>
      <li style="${LI}"><strong>Render</strong> — alojamiento de la aplicación. <strong>Cloudflare</strong> — red de distribución de contenido y protección frente a abuso. <strong>Nominalia</strong> — registro del dominio.</li>
      <li style="${LI}"><strong>Biwenger, Comunio y Mister</strong> — únicamente si activas la sincronización de una liga con esa plataforma.</li>
      <li style="${LI}"><strong>Google</strong> — inicio de sesión con tu cuenta de Google (si lo usas) y tipografías del sitio (Google Fonts).</li>
      <li style="${LI}"><strong>Resend</strong> — envío del correo interno que nos avisa cuando alguien se registra.</li>
      <li style="${LI}"><strong>Adsterra</strong> — red publicitaria que muestra los anuncios del sitio, junto con sus anunciantes y socios de medición.</li>
    </ul>

    <h2 style="${H}">5. Transferencias internacionales</h2>
    <p style="${P}">Algunos proveedores (por ejemplo, Adsterra o Google) pueden tratar datos fuera del Espacio Económico Europeo. En esos casos, dichas transferencias se amparan en las garantías adecuadas previstas por el RGPD, como las Cláusulas Contractuales Tipo de la Comisión Europea.</p>

    <h2 style="${H}">6. Conservación</h2>
    <p style="${P}">Conservamos tus datos mientras mantengas tu cuenta y sean necesarios para prestar el servicio. Puedes solicitar su supresión en cualquier momento.</p>

    <h2 style="${H}">7. Tus derechos</h2>
    <p style="${P}">Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a <a href="mailto:${EMAIL}" style="color:var(--accent);">${EMAIL}</a>. Si consideras que no se han atendido correctamente, tienes derecho a reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener" style="color:var(--accent);">www.aepd.es</a>).</p>

    <h2 style="${H}">8. Menores de edad</h2>
    <p style="${P}">El servicio está dirigido a personas mayores de 14 años. Si eres menor de esa edad, no debes registrarte ni facilitar datos personales.</p>

    <h2 style="${H}">9. Seguridad</h2>
    <p style="${P}">Aplicamos medidas técnicas y organizativas razonables para proteger tu información, incluyendo el cifrado de las comunicaciones y el control de acceso a la base de datos mediante políticas de seguridad por fila.</p>
  `;
}

function cookiesBody() {
  return `
    <p style="${P}">Esta Política de Cookies explica qué cookies y tecnologías de almacenamiento utiliza <strong>${SITE}</strong> y cómo puedes gestionarlas.</p>

    <h2 style="${H}">1. Qué son</h2>
    <p style="${P}">Las cookies y el almacenamiento local (<em>localStorage</em>) son pequeños archivos o datos que un sitio web guarda en tu dispositivo para recordar información entre visitas o durante tu sesión.</p>

    <h2 style="${H}">2. Cookies que utilizamos</h2>
    <ul style="${UL}">
      <li style="${LI}"><strong>Técnicas o necesarias</strong> (no requieren consentimiento): mantienen tu sesión iniciada, recuerdan tu liga activa, el modo invitado y tus preferencias básicas. Sin ellas la aplicación no funciona correctamente.</li>
      <li style="${LI}"><strong>De terceros / publicidad</strong> (requieren tu consentimiento): <strong>Adsterra</strong>, la red que muestra los anuncios del sitio, y sus anunciantes pueden instalar cookies e identificadores para mostrar y medir esos anuncios, incluida la personalización. <strong>Google Fonts</strong> carga las tipografías del sitio y puede registrar tu dirección IP.</li>
    </ul>

    <h2 style="${H}">3. Cómo gestionarlas</h2>
    <p style="${P}">Al entrar por primera vez te mostramos un aviso donde puedes <strong>aceptar</strong> o <strong>rechazar</strong> las cookies no esenciales. Rechazarlas no te impide usar la aplicación. Además, puedes configurar o eliminar las cookies desde los ajustes de tu navegador en cualquier momento.</p>

    <h2 style="${H}">4. Cambios</h2>
    <p style="${P}">Podemos actualizar esta política si cambian las tecnologías que utilizamos. La versión vigente es siempre la publicada en esta página.</p>
  `;
}

function termsBody() {
  return `
    <p style="${P}">El acceso y uso de <strong>${SITE}</strong> ("el Servicio") implica la aceptación de estos Términos y Condiciones. Si no estás de acuerdo, por favor no utilices el Servicio.</p>

    <h2 style="${H}">1. Objeto</h2>
    <p style="${P}">CastigosFantasy es una aplicación web gratuita para organizar ligas de fútbol fantasy entre amigos y llevar el registro de "castigos" y deudas simbólicas de cada jornada.</p>

    <h2 style="${H}">2. Sin gestión de dinero real</h2>
    <p style="${P}">El Servicio <strong>no procesa pagos ni gestiona dinero</strong>. Los "botes", "deudas", "multas" o castigos son acuerdos privados entre los miembros de cada liga. CastigosFantasy se limita a registrarlos a título informativo y <strong>no interviene ni se responsabiliza</strong> de su cumplimiento o cobro.</p>

    <h2 style="${H}">3. Sin afiliación con terceros</h2>
    <p style="${P}">CastigosFantasy no está asociado, patrocinado ni respaldado por Biwenger, Comunio, Mister, LaLiga ni ninguna otra marca. Todas las marcas mencionadas pertenecen a sus respectivos titulares.</p>

    <h2 style="${H}">4. Cuenta y credenciales</h2>
    <p style="${P}">Eres responsable de mantener la confidencialidad de tu cuenta y de la actividad que se realice con ella. La sincronización con Biwenger es opcional y se realiza bajo tu responsabilidad.</p>

    <h2 style="${H}">5. Conducta del usuario</h2>
    <p style="${P}">Te comprometes a no publicar contenido ilícito, ofensivo, difamatorio o datos de terceros sin su permiso en el foro, el muro u otras áreas del Servicio. Podemos retirar contenido o suspender cuentas que incumplan estas normas.</p>

    <h2 style="${H}">6. Propiedad intelectual</h2>
    <p style="${P}">El software, el diseño y los elementos gráficos del Servicio pertenecen a su titular. El contenido que publicas sigue siendo tuyo, pero concedes permiso para mostrarlo dentro del Servicio con el fin de prestarlo.</p>

    <h2 style="${H}">7. Disponibilidad</h2>
    <p style="${P}">El Servicio se ofrece "tal cual" y "según disponibilidad". No garantizamos que esté disponible de forma ininterrumpida y podemos modificarlo, suspenderlo o interrumpirlo total o parcialmente.</p>

    <h2 style="${H}">8. Limitación de responsabilidad</h2>
    <p style="${P}">En la máxima medida permitida por la ley, el titular no será responsable de daños derivados del uso o la imposibilidad de uso del Servicio, ni de los acuerdos privados entre los usuarios de una liga.</p>

    <h2 style="${H}">9. Modificaciones</h2>
    <p style="${P}">Podemos actualizar estos Términos. Los cambios se publicarán en esta página y entrarán en vigor desde su publicación.</p>

    <h2 style="${H}">10. Legislación aplicable</h2>
    <p style="${P}">Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la normativa vigente.</p>

    <h2 style="${H}">11. Contacto</h2>
    <p style="${P}">Para cualquier duda sobre estos Términos, escríbenos a <a href="mailto:${EMAIL}" style="color:var(--accent);">${EMAIL}</a>.</p>
  `;
}
