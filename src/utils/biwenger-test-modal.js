import { supabase } from '../supabase';

export async function openBiwengerTestModal() {
  const existing = document.querySelector('#biwenger-test-modal');
  if (existing) existing.remove();

  // Check if the user is authenticated
  const session = supabase.auth.session ? supabase.auth.session() : null;
  let user = session?.user;
  if (!user) {
    try {
      user = (await supabase.auth.getUser()).data?.user;
    } catch (_) {}
  }
  const isLoggedIn = !!user;

  const modal = document.createElement('div');
  modal.id = 'biwenger-test-modal';
  modal.className = 'modal-overlay active';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div class="modal-content glass" style="max-width: 550px; width: 95%; border: 1.5px solid var(--border-color-glow); box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(222,237,0,0.15); max-height: 90vh; display: flex; flex-direction: column;">
      <div class="modal-header" style="border-bottom: 1px solid var(--border-color-glow); display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem; flex-shrink: 0;">
        <h3 class="gradient-text-green" style="font-family: var(--font-display); font-weight: 900; font-size: 1.1rem; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span style="display:inline-block; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow:0 0 8px var(--accent);"></span>
          Prueba Sincronización Biwenger
        </h3>
        <button id="close-biwenger-modal" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;line-height:1;">✕</button>
      </div>
      
      <div class="modal-body" style="padding: 1.5rem; overflow-y: auto; flex-grow: 1;">
        <!-- Explicación de producción vs desarrollo -->
        <div style="background: rgba(0, 180, 216, 0.05); border: 1.5px solid var(--border-color-glow); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
          <span style="color: var(--primary); font-weight: 800; font-size: 0.75rem; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">ℹ️ Seguridad de la Función</span>
          <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin: 0;">
            La función en la nube <strong>solo puede ser invocada por usuarios registrados y logeados</strong> en tu aplicación. Los usuarios no autenticados tienen el acceso bloqueado de forma automática por la pasarela de Supabase.
          </p>
        </div>

        <p style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 1rem; font-weight: 700;">
          Elige cómo deseas realizar la prueba en local:
        </p>

        <!-- Botones de Acción Principales -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
          <button id="btn-simulate-sync" class="btn-primary" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000; box-shadow: 3px 3px 0 #000; background: var(--accent); color: #000; width: 100%; padding: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ⚡ Simular Sincronización (Recomendado Local)
          </button>
          
          <button id="btn-toggle-real-options" class="btn-select-league" style="font-size: 0.75rem; padding: 0.5rem; width: 100%; border: 1.5px dashed var(--border-color-glow);">
            Mostrar opciones para conectar con la API real en local...
          </button>
        </div>

        <!-- Formulario de Conexión Real (Escondido al inicio) -->
        <div id="real-connection-container" style="display: none; border-top: 1.5px dashed var(--border-color-glow); padding-top: 1.25rem; margin-top: 1.25rem;">
          <h4 style="color: var(--text-light); font-size: 0.8rem; font-weight: 800; margin-bottom: 0.75rem; text-transform: uppercase;">Conexión con la API Real (Pruebas Técnicas)</h4>
          
          <form id="biwenger-test-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">ID de la Liga de Biwenger</label>
              <input type="text" id="biwenger-league-id" class="input-field" value="cwRzHsqCc6nx" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Correo de Biwenger</label>
              <input type="email" id="biwenger-email" class="input-field" value="ytnoxgames@gmail.com" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Contraseña de Biwenger</label>
              <input type="password" id="biwenger-password" class="input-field" value="contraseñaprueba" required style="border: 1.5px solid var(--border-color-glow); font-weight: 700; background: var(--bg-input); width: 100%; padding: 0.65rem 0.85rem;" />
            </div>

            <!-- Selector de tipo de conexión -->
            <div class="form-group" style="margin-bottom: 0.5rem;">
              <label style="color: var(--text-light); font-weight: 700; font-size: 0.75rem; display: block; margin-bottom: 0.4rem;">Método de Conexión Real</label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color-glow);">
                
                <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: ${isLoggedIn ? 'pointer' : 'not-allowed'}; opacity: ${isLoggedIn ? 1 : 0.5};">
                  <input type="radio" name="conn-method" value="supabase" ${isLoggedIn ? 'checked' : 'disabled'} style="margin-top: 0.15rem;" />
                  <div>
                    <span style="font-size: 0.78rem; font-weight: bold; color: var(--primary);">Supabase Edge Function ${isLoggedIn ? '(Recomendado)' : '🔒 (Requiere Iniciar Sesión)'}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); display: block; line-height: 1.2;">
                      Se conecta usando tu token de usuario registrado. Protegido y libre de CORS.
                    </span>
                  </div>
                </label>
                
                <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <input type="radio" name="conn-method" value="direct" ${!isLoggedIn ? 'checked' : ''} style="margin-top: 0.15rem;" />
                  <div>
                    <span style="font-size: 0.78rem; font-weight: bold; color: var(--accent);">Conexión Directa del Navegador (Bypass)</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); display: block; line-height: 1.2;">
                      Petición directa a Biwenger. Requiere activar una extensión CORS en tu navegador.
                    </span>
                  </div>
                </label>

                <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <input type="radio" name="conn-method" value="proxy" style="margin-top: 0.15rem;" />
                  <div>
                    <span style="font-size: 0.78rem; font-weight: bold; color: var(--danger);">Proxy local de Vite (Sujeto a bloqueos)</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); display: block; line-height: 1.2;">
                      Petición a través de Node/Vite (bloqueada por Cloudflare en este entorno).
                    </span>
                  </div>
                </label>
                
              </div>
            </div>

            <button type="submit" class="btn-primary" id="btn-run-biwenger-sync" style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 2.5px solid #000000; box-shadow: 3px 3px 0px #000000; width: 100%; padding: 0.75rem; cursor: pointer;">
              Sincronizar API Real 🔄
            </button>
          </form>
        </div>

        <div id="biwenger-sync-status" style="margin-top: 1.25rem; font-size: 0.8rem; line-height: 1.4; color: var(--text-muted);">
          Estado: En espera.
        </div>

        <div id="biwenger-sync-result"></div>
        
        <div id="biwenger-json-toggle-container" style="display: none; margin-top: 1.5rem; border-top: 1px dashed var(--border-color-glow); padding-top: 1rem;">
          <button id="btn-toggle-raw-json" class="btn-select-league" style="font-size: 0.7rem; padding: 0.35rem 0.65rem;">
            Mostrar Respuesta JSON Completa (Raw)
          </button>
          <pre id="biwenger-raw-json" style="display: none; margin-top: 0.75rem; background: rgba(0,0,0,0.4); padding: 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.7rem; max-height: 250px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; border: 1px solid var(--border-color); color: #88ff88;"></pre>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#close-biwenger-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  const simulateBtn = modal.querySelector('#btn-simulate-sync');
  const toggleRealBtn = modal.querySelector('#btn-toggle-real-options');
  const realConnContainer = modal.querySelector('#real-connection-container');
  const form = modal.querySelector('#biwenger-test-form');
  const statusEl = modal.querySelector('#biwenger-sync-status');
  const resultEl = modal.querySelector('#biwenger-sync-result');
  const jsonContainer = modal.querySelector('#biwenger-json-toggle-container');
  const rawJsonEl = modal.querySelector('#biwenger-raw-json');
  const toggleJsonBtn = modal.querySelector('#btn-toggle-raw-json');

  let rawJsonData = null;

  // Toggle real options visibility
  toggleRealBtn.addEventListener('click', () => {
    if (realConnContainer.style.display === 'none') {
      realConnContainer.style.display = 'block';
      toggleRealBtn.textContent = 'Ocultar opciones para conectar con la API real...';
    } else {
      realConnContainer.style.display = 'none';
      toggleRealBtn.textContent = 'Mostrar opciones para conectar con la API real en local...';
    }
  });

  toggleJsonBtn.addEventListener('click', () => {
    if (rawJsonEl.style.display === 'none') {
      rawJsonEl.style.display = 'block';
      toggleJsonBtn.textContent = 'Ocultar Respuesta JSON Completa (Raw)';
      rawJsonEl.textContent = JSON.stringify(rawJsonData, null, 2);
    } else {
      rawJsonEl.style.display = 'none';
      toggleJsonBtn.textContent = 'Mostrar Respuesta JSON Completa (Raw)';
    }
  });

  // 1. Simular Sincronización (No requiere red, no requiere extensiones)
  simulateBtn.addEventListener('click', async () => {
    simulateBtn.disabled = true;
    jsonContainer.style.display = 'none';
    rawJsonEl.style.display = 'none';
    toggleJsonBtn.textContent = 'Mostrar Respuesta JSON Completa (Raw)';
    
    statusEl.innerHTML = '<span class="spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:10px;"></span>[Simulación] Autenticando con Biwenger...';
    resultEl.innerHTML = '';

    await new Promise(r => setTimeout(r, 800));
    statusEl.innerHTML = '<span class="spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:10px;"></span>[Simulación] Sesión establecida. Descargando clasificación de liga "cwRzHsqCc6nx"...';
    
    await new Promise(r => setTimeout(r, 1000));
    
    const mockLeagueData = {
      status: 200,
      data: {
        id: "cwRzHsqCc6nx",
        name: "Liga CastigosFantasy de Prueba (Simulada)",
        users: [
          { id: 101, name: "YtnoxGames (Tú)", email: "ytnoxgames@gmail.com" },
          { id: 102, name: "Carlos M.", email: "carlos.m@example.com" },
          { id: 103, name: "Adrián Moroso", email: "adrian.mor@example.com" },
          { id: 104, name: "Míster X", email: "misterx@example.com" }
        ],
        standings: [
          { id: 101, points: 145, position: 1 },
          { id: 102, points: 132, position: 2 },
          { id: 103, points: 95, position: 3 },
          { id: 104, points: 72, position: 4 }
        ]
      }
    };

    rawJsonData = mockLeagueData;
    const users = mockLeagueData.data.users;
    const standings = mockLeagueData.data.standings;

    statusEl.innerHTML = '<strong style="color:var(--accent);">✓ [Simulación] ¡Clasificación simulada con éxito!</strong>';
    jsonContainer.style.display = 'block';

    const sortedStandings = standings.map(s => {
      const u = users.find(user => user.id === s.id) || {};
      return {
        name: u.name || 'Entrenador',
        email: u.email || '-',
        points: s.points || 0,
        position: s.position || 1
      };
    }).sort((a, b) => a.position - b.position);

    resultEl.innerHTML = renderTableHTML(sortedStandings);
    simulateBtn.disabled = false;
  });

  // 2. Ejecutar con API Real (Soporta Supabase Cloud, Directa o Proxy)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('#btn-run-biwenger-sync');
    const id = form.querySelector('#biwenger-league-id').value.trim();
    const emailVal = form.querySelector('#biwenger-email').value.trim();
    const passVal = form.querySelector('#biwenger-password').value.trim();
    
    const method = form.querySelector('input[name="conn-method"]:checked').value;

    btn.disabled = true;
    jsonContainer.style.display = 'none';
    rawJsonEl.style.display = 'none';
    toggleJsonBtn.textContent = 'Mostrar Respuesta JSON Completa (Raw)';
    
    statusEl.innerHTML = '<span class="spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:10px;"></span>Iniciando sincronización...';
    resultEl.innerHTML = '';

    try {
      let leagueData = null;

      if (method === 'supabase') {
        statusEl.innerHTML = '<span class="spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:10px;"></span>Conectando con la Supabase Edge Function...';
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('CF_SUPABASE_URL') || '';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CF_SUPABASE_ANON_KEY') || '';
        
        let token = supabaseAnonKey;
        try {
          const sessionData = await supabase.auth.getSession();
          if (sessionData.data?.session?.access_token) {
            token = sessionData.data.session.access_token;
          }
        } catch (_) {}

        const res = await fetch(`${supabaseUrl}/functions/v1/biwenger-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({ email: emailVal, password: passVal, leagueId: id })
        });

        if (res.status !== 200) {
          const errText = await res.text();
          let errMsg = `Error de Edge Function (Status ${res.status})`;
          try {
            const errJSON = JSON.parse(errText);
            errMsg = errJSON.error || errJSON.message || errMsg;
          } catch (_) {}
          throw new Error(errMsg);
        }

        leagueData = await res.json();

      } else {
        // Métodos HTTP directos tradicionales
        const apiBase = method === 'direct' ? 'https://api.biwenger.com' : '/api-biwenger';
        statusEl.innerHTML = '<span class="spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:10px;"></span>Autenticando en Biwenger...';

        const loginRes = await fetch(`${apiBase}/v2/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json"
          },
          body: JSON.stringify({ email: emailVal, password: passVal })
        });

        if (loginRes.status !== 200) {
          const errText = await loginRes.text();
          let errMsg = `Error de Login (Status ${loginRes.status})`;
          try {
            const errJSON = JSON.parse(errText);
            errMsg = errJSON.message || errMsg;
          } catch (_) {}
          throw new Error(errMsg);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error("No se devolvió un token de sesión");

        statusEl.innerHTML = '<span class="spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:10px;"></span>Sesión iniciada. Descargando clasificación...';

        const leagueRes = await fetch(`${apiBase}/v2/league?fields=standings,users`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Version": "h3g456hj",
            "X-League": id,
            "Accept": "application/json"
          }
        });

        if (leagueRes.status !== 200) {
          throw new Error(`Error al obtener liga (Status ${leagueRes.status})`);
        }

        leagueData = await leagueRes.json();
      }

      rawJsonData = leagueData;
      const users = leagueData.data?.users || [];
      const standings = leagueData.data?.standings || [];

      statusEl.innerHTML = '<strong style="color:var(--accent);">✓ ¡Éxito! Datos obtenidos de Biwenger.</strong>';
      jsonContainer.style.display = 'block';

      const sortedStandings = standings.map(s => {
        const u = users.find(user => user.id === s.id) || {};
        return {
          name: u.name || 'Entrenador',
          email: u.email || '-',
          points: s.points || 0,
          position: s.position || 1
        };
      }).sort((a, b) => a.position - b.position);

      resultEl.innerHTML = renderTableHTML(sortedStandings);

    } catch (err) {
      console.error(err);
      if (method === 'supabase') {
        let displayMsg = err.message;
        
        // Extract the error message returned from the Edge Function body if available
        if (err.context && typeof err.context.json === 'function') {
          try {
            const body = await err.context.json();
            if (body && body.error) {
              displayMsg = body.error;
            }
          } catch (_) {}
        } else if (err.context && typeof err.context.text === 'function') {
          try {
            displayMsg = await err.context.text();
          } catch (_) {}
        }

        statusEl.innerHTML = `
          <strong style="color:var(--danger);">❌ Error de Supabase Cloud</strong><br/>
          <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.4rem; line-height:1.45;">
            Detalle del error: <strong style="color: #ff8888;">${displayMsg}</strong><br/><br/>
            <em>Asegúrate de estar logeado en tu cuenta de la app y de haber desplegado la función ejecutando <code>npx supabase functions deploy biwenger-sync</code>.</em>
          </span>
        `;
      } else {
        if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('failed to fetch') || err.message.includes('network socket disconnected') || err.message.includes('502'))) {
          statusEl.innerHTML = `
            <strong style="color:var(--danger);">❌ Error de Red / CORS</strong><br/>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.4rem; line-height:1.45;">
              La conexión falló debido a políticas de red o CORS en local.<br/><br/>
              <strong>Te recomendamos:</strong> Inicia sesión en la app y usa el método <strong>Supabase Edge Function</strong>.
            </span>
          `;
        } else {
          statusEl.innerHTML = `<strong style="color:var(--danger);">❌ Error: ${err.message}</strong>`;
        }
      }
    } finally {
      btn.disabled = false;
    }
  });

  function renderTableHTML(sortedStandings) {
    return `
      <div style="margin-top: 1.25rem;">
        <h4 style="color: var(--text-light); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase;">Clasificación Obtenida</h4>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; border: 1.5px solid var(--border-color);">
            <thead>
              <tr style="background: rgba(222,237,0,0.1); border-bottom: 2px solid #000000;">
                <th style="padding: 0.55rem; color: var(--accent); width: 60px;">Pos</th>
                <th style="padding: 0.55rem;">Nombre</th>
                <th style="padding: 0.55rem; text-align: right;">Puntos</th>
              </tr>
            </thead>
            <tbody>
              ${sortedStandings.length === 0 ? `
                <tr>
                  <td colspan="3" style="padding:0.75rem; text-align:center; color:var(--text-muted);">Sin entrenadores activos en la liga.</td>
                </tr>
              ` : sortedStandings.map(s => `
                <tr style="border-bottom: 1.5px solid var(--border-color); background: rgba(255,255,255,0.01);">
                  <td style="padding: 0.55rem; font-weight: bold; color: var(--text-muted);">${s.position}º</td>
                  <td style="padding: 0.55rem; font-weight: bold; color: var(--text-light);">${s.name} <span style="font-size:0.65rem; color:var(--text-muted); font-weight:normal; display:block;">${s.email}</span></td>
                  <td style="padding: 0.55rem; color: var(--accent); font-weight: 900; text-align: right; font-size:0.85rem;">${s.points} pts</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
