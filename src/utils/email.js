import { supabase } from '../supabase';

/**
 * Helper to send admin email notification via Supabase Edge Function.
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

  try {
    const { data, error } = await supabase.functions.invoke('send-admin-notification', {
      body: { email, username, apodo }
    });

    if (error) {
      console.error('Error devuelto por la Edge Function:', error);
      return;
    }

    localStorage.setItem(cacheKey, 'true');
    console.log('Notificación de nuevo entrenador enviada con éxito.');
  } catch (error) {
    console.error('Error de red al invocar la Edge Function:', error);
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

