import { supabase, isConfigured, clearSupabaseConfig } from '../supabase';

/**
 * Renders the Authentication screen or Settings panel.
 * @param {HTMLElement} container 
 * @param {Object} callbacks 
 * @param {Function} callbacks.onAuthSuccess 
 * @param {Function} callbacks.showToast 
 */
export function renderAuth(container, callbacks) {
  let isLoginMode = true;

  function render() {
    // 1. --- Settings View for Authenticated Users ---
    const session = isConfigured && supabase.auth.session ? supabase.auth.session() : null;
    const user = session?.user;

    if (isConfigured && user) {
      const storedGeminiKey = localStorage.getItem('CF_GEMINI_API_KEY') || '';

      container.innerHTML = `
        <div class="container" style="display: flex; align-items: center; justify-content: center; min-height: 80vh;">
          <div class="card glass pitch-card" style="width: 100%; max-width: 420px;">
            <h2 class="card-title gradient-text-gold">⚙️ Ajustes de Ligas & APIs</h2>
            
            <div style="margin-bottom: 1.5rem; font-size: 0.9rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
              <span style="color: var(--text-muted);">Sesión iniciada como:</span><br>
              <strong style="color: var(--primary-green);">${user.email}</strong>
            </div>

            <form id="settings-form">
              <div class="form-group">
                <label for="settings-gemini-key">Gemini API Key (Para lectura de capturas)</label>
                <input type="password" id="settings-gemini-key" class="input-field" placeholder="AIzaSy..." value="${storedGeminiKey}" />
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.3;">
                  Permite subir capturas de Comunio, Biwenger, etc., para detectar automáticamente al perdedor. Consíguela gratis en Google AI Studio.
                </p>
              </div>
              <button type="submit" class="btn-primary" style="margin-top: 1rem;">Guardar Cambios</button>
            </form>

            <div style="border-top: 1px solid var(--border-color); margin-top: 1.5rem; padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <button id="sb-disconnect-btn" class="btn-secondary btn-danger">Desconectar base de datos</button>
              <button id="close-settings-btn" class="btn-secondary">Volver al Muro</button>
            </div>
          </div>
        </div>
      `;

      const settingsForm = container.querySelector('#settings-form');
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const geminiKey = settingsForm.querySelector('#settings-gemini-key').value.trim();
        localStorage.setItem('CF_GEMINI_API_KEY', geminiKey);
        callbacks.showToast('Ajustes guardados con éxito', 'success');
        callbacks.onAuthSuccess();
      });

      container.querySelector('#sb-disconnect-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar las credenciales de Supabase? Se reiniciará el proyecto.')) {
          localStorage.removeItem('CF_GEMINI_API_KEY');
          clearSupabaseConfig();
        }
      });

      container.querySelector('#close-settings-btn').addEventListener('click', () => {
        callbacks.onAuthSuccess();
      });
      return;
    }

    // 2. --- Database Configuration Panel (Supabase URL & Keys) ---
    if (!isConfigured) {
      const storedGeminiKey = localStorage.getItem('CF_GEMINI_API_KEY') || '';

      container.innerHTML = `
        <div class="container" style="display: flex; align-items: center; justify-content: center; min-height: 80vh;">
          <div class="card glass pitch-card" style="width: 100%; max-width: 400px;">
            <h2 class="card-title gradient-text-gold">Configurar APIs</h2>
            <p style="margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.5; color: var(--text-muted);">
              Copia las credenciales API de tu panel de Supabase para conectar la base de datos persistente.
            </p>
            <form id="sb-setup-form">
              <div class="form-group">
                <label for="sb-url">Project URL (Supabase)</label>
                <input type="text" id="sb-url" class="input-field" placeholder="https://xxxx.supabase.co" required />
              </div>
              <div class="form-group">
                <label for="sb-key">API Anon Key (Supabase)</label>
                <input type="password" id="sb-key" class="input-field" placeholder="eyJhbGciOi..." required />
              </div>
              <div class="form-group" style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                <label for="gemini-key">Gemini API Key (Opcional - Lector IA)</label>
                <input type="password" id="gemini-key" class="input-field" placeholder="AIzaSy..." value="${storedGeminiKey}" />
              </div>
              <button type="submit" class="btn-primary">Guardar Configuración</button>
            </form>
            
            <div style="text-align: center; margin-top: 1rem;">
              <button id="back-to-demo-btn" class="btn-secondary" style="border: none; background: transparent; color: var(--text-muted); font-size: 0.9rem; cursor: pointer;">
                ← Usar Modo Demo Local
              </button>
            </div>
          </div>
        </div>
      `;

      const form = container.querySelector('#sb-setup-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = form.querySelector('#sb-url').value;
        const key = form.querySelector('#sb-key').value;
        const geminiKey = form.querySelector('#gemini-key').value.trim();

        localStorage.setItem('CF_SUPABASE_URL', url.trim());
        localStorage.setItem('CF_SUPABASE_ANON_KEY', key.trim());
        if (geminiKey) {
          localStorage.setItem('CF_GEMINI_API_KEY', geminiKey);
        }

        callbacks.showToast('Configuración guardada. Reiniciando...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      });

      const backBtn = container.querySelector('#back-to-demo-btn');
      backBtn.addEventListener('click', () => {
        callbacks.onAuthSuccess();
      });
      return;
    }

    // 3. --- Login / Signup Panel ---
    container.innerHTML = `
      <div class="container" style="display: flex; align-items: center; justify-content: center; min-height: 80vh;">
        <div class="card glass pitch-card" style="width: 100%; max-width: 400px;">
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 1rem;">
              <img src="/logo.png" alt="CastigoFantasy Logo" style="width: 90px; height: 90px; border-radius: 16px; object-fit: cover; border: 2px solid var(--border-color-glow); margin-bottom: 0.75rem; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);" />
              <h1 class="logo gradient-text-green" style="justify-content: center; font-size: 1.9rem; font-weight: 900; margin-bottom: 0.25rem;">
                CastigoFantasy
              </h1>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Registra los piques y castigos de tu liga</p>

          <form id="auth-form">
            ${!isLoginMode ? `
              <div class="form-group">
                <label for="username">Nombre de Entrenador (Ej: Paco G.)</label>
                <input type="text" id="username" class="input-field" placeholder="Tu nombre en la liga" required />
              </div>
            ` : ''}
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="input-field" placeholder="tu@email.com" required />
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" class="input-field" placeholder="••••••••" required />
            </div>

            <button type="submit" class="btn-primary" id="submit-btn" style="margin-top: 1.5rem;">
              <span>${isLoginMode ? 'Entrar a la Liga' : 'Crear Cuenta'}</span>
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
            <button id="toggle-mode-btn" style="background: transparent; border: none; color: var(--primary-green); font-family: var(--font-sans); font-weight: 600; cursor: pointer; font-size: 0.9rem;">
              ${isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            <button id="back-to-demo-btn" style="background: transparent; border: none; color: var(--text-muted); font-family: var(--font-sans); font-weight: 500; cursor: pointer; font-size: 0.85rem; text-decoration: underline;">
              ← Volver al Modo Demo
            </button>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#auth-form');
    const toggleBtn = container.querySelector('#toggle-mode-btn');
    const backBtn = container.querySelector('#back-to-demo-btn');

    toggleBtn.addEventListener('click', () => {
      isLoginMode = !isLoginMode;
      render();
    });

    backBtn.addEventListener('click', () => {
      callbacks.onAuthSuccess();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('#submit-btn');
      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span>';

      try {
        if (isLoginMode) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          callbacks.showToast('¡Bienvenido a los castigos!', 'success');
          callbacks.onAuthSuccess();
        } else {
          const username = form.querySelector('#username').value;
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: username
              }
            }
          });
          if (error) throw error;

          if (data?.session) {
            callbacks.showToast('¡Cuenta creada y sesión iniciada!', 'success');
            callbacks.onAuthSuccess();
          } else {
            callbacks.showToast('Registro completado. Revisa tu email para confirmar.', 'info');
            isLoginMode = true;
            render();
          }
        }
      } catch (err) {
        console.error(err);
        callbacks.showToast(err.message || 'Error en la autenticación', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>${isLoginMode ? 'Entrar a la Liga' : 'Crear Cuenta'}</span>`;
      }
    });
  }

  render();
}
