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
    <div style="background-color: #090c15; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; min-height: 100%;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111625; border: 1px solid rgba(255,255,255,0.05); padding: 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); text-align: left;">
        <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #10b981; font-size: 20px; font-weight: 800; margin: 0; display: inline-block; letter-spacing: -0.5px;">CastigoFantasy</h2>
          <span style="float: right; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Nuevo Míster</span>
          <div style="clear: both;"></div>
        </div>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 0; line-height: 1.5;">Se ha unido un nuevo entrenador a la plataforma. Aquí tienes los detalles del registro:</p>
        <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 12px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.04); text-transform: uppercase; letter-spacing: 0.5px;">NOMBRE COMPLETO</td>
              <td style="padding: 10px 0; color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.04);">${username || 'Sin nombre'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 12px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.04); text-transform: uppercase; letter-spacing: 0.5px;">APODO / LIGA</td>
              <td style="padding: 10px 0; color: #e2b13c; font-size: 13px; font-weight: 800; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.04);">${apodo || 'Sin apodo'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 12px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.04); text-transform: uppercase; letter-spacing: 0.5px;">CORREO ELECTRÓNICO</td>
              <td style="padding: 10px 0; color: #3b82f6; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.04);">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">FECHA Y HORA</td>
              <td style="padding: 10px 0; color: #94a3b8; font-size: 13px; text-align: right;">${formattedDate} (CET)</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="https://www.castigosfantasy.com/" style="display: inline-block; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px;">Acceder a la Plataforma</a>
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

