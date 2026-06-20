/**
 * Helper to send admin email notification via Resend API using VITE_RESEND_API_KEY.
 * Prevents duplicates by caching in localStorage.
 * 
 * @param {string} email 
 * @param {string} username 
 * @param {string} apodo 
 */
export async function sendAdminNotification(email, username, apodo) {
  if (!email) return;

  const cacheKey = `CF_NOTIFIED_${email.toLowerCase()}`;
  if (localStorage.getItem(cacheKey)) {
    return; // Already notified for this user
  }

  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('VITE_RESEND_API_KEY no está configurada.');
    return;
  }

  // Format date to CET (Europe/Madrid)
  const date = new Date();
  const options = { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
  let formattedDate;
  try {
    formattedDate = new Intl.DateTimeFormat('es-ES', options).format(date);
  } catch (err) {
    formattedDate = date.toLocaleString();
  }

  const html = `
    <div style="background-color: #0b0f19; color: #f8fafc; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; text-align: center; min-height: 100%;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #121826; border: 3px solid #000000; padding: 0; box-shadow: 8px 8px 0px #000000; text-align: left;">
        
        <!-- Header Banner -->
        <div style="background-color: #e2b13c; color: #000000; padding: 20px 24px; border-bottom: 3px solid #000000;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 950; text-transform: uppercase; letter-spacing: -0.5px; display: inline-block;">
            CastigoFantasy
          </h2>
          <span style="float: right; background-color: #000000; color: #e2b13c; font-size: 10px; font-weight: 900; padding: 4px 10px; border: 1.5px solid #000000; text-transform: uppercase; letter-spacing: 0.5px;">
            Nuevo Míster
          </span>
          <div style="clear: both;"></div>
        </div>

        <div style="padding: 32px 24px;">
          <p style="color: #94a3b8; font-size: 14px; margin-top: 0; line-height: 1.6; font-weight: 500;">
            Se ha unido un nuevo entrenador a la plataforma. Aquí tienes los detalles del registro:
          </p>
          
          <!-- Details Card -->
          <div style="background-color: #1a2234; border: 3px solid #000000; padding: 16px; margin: 24px 0; box-shadow: 4px 4px 0px #000000;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 11px; font-weight: 800; border-bottom: 2px solid #000000; text-transform: uppercase; letter-spacing: 0.5px;">Nombre Completo</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 13px; font-weight: 800; text-align: right; border-bottom: 2px solid #000000;">${username || 'Sin nombre'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 11px; font-weight: 800; border-bottom: 2px solid #000000; text-transform: uppercase; letter-spacing: 0.5px;">Apodo / Liga</td>
                <td style="padding: 10px 0; color: #e2b13c; font-size: 13px; font-weight: 900; text-align: right; border-bottom: 2px solid #000000;">${apodo || 'Sin apodo'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 11px; font-weight: 800; border-bottom: 2px solid #000000; text-transform: uppercase; letter-spacing: 0.5px;">Correo Electrónico</td>
                <td style="padding: 10px 0; color: #10b981; font-size: 13px; font-weight: 800; text-align: right; border-bottom: 2px solid #000000;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 12px; text-align: right;">${formattedDate} (CET)</td>
              </tr>
            </table>
          </div>

          <!-- Button -->
          <div style="text-align: center; margin-top: 32px; margin-bottom: 8px;">
            <a href="https://www.castigosfantasy.com/" style="display: inline-block; background-color: #10b981; color: #000000; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: 900; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000; text-transform: uppercase; letter-spacing: 0.5px;">
              Acceder a la Plataforma
            </a>
          </div>
        </div>

      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'CastigoFantasy <noreply@castigosfantasy.com>',
        to: 'castigosfantasy2005@gmail.com',
        subject: `Nuevo Registro de Entrenador: ${apodo || 'Sin apodo'}`,
        html: html
      })
    });

    if (response.ok) {
      localStorage.setItem(cacheKey, 'true');
      console.log('Notificación de nuevo entrenador enviada con éxito.');
    } else {
      const errorData = await response.json();
      console.error('Error enviando notificación por Resend:', errorData);
    }
  } catch (error) {
    console.error('Error de red al enviar email con Resend:', error);
  }
}

/**
 * Automatically detects if a logged-in user was registered recently (e.g. via OAuth redirect)
 * and fires the admin notification.
 * 
 * @param {Object} user - Supabase user object 
 */
export async function checkAndNotifyNewUser(user) {
  if (!user || !user.email || !user.created_at) return;

  const createdTime = new Date(user.created_at).getTime();
  const now = Date.now();
  const diffMinutes = (now - createdTime) / (1000 * 60);

  // If the account was created in the last 15 minutes, check and notify
  if (diffMinutes < 15) {
    const username = user.user_metadata?.display_name || user.email.split('@')[0];
    const apodo = user.user_metadata?.apodo || user.email.split('@')[0];
    await sendAdminNotification(user.email, username, apodo);
  }
}

