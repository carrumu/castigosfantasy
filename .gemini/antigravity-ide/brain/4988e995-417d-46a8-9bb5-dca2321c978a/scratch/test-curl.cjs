const { execSync } = require('child_process');
const fs = require('fs');

const email = "ytnoxgames@gmail.com";
const password = "contraseñaprueba";
const leagueId = "cwRzHsqCc6nx";

async function run() {
  console.log("Iniciando sesión en Biwenger usando curl.exe con flag -k...");
  const tempFile = "./temp_payload.json";
  try {
    const payload = JSON.stringify({ email, password });
    fs.writeFileSync(tempFile, payload, 'utf-8');

    // Agregamos -k para ignorar certificados de proxy autofirmados en el sandbox
    const loginCmd = `curl.exe -k -s -X POST https://api.biwenger.com/v2/auth/login -H "Content-Type: application/json;charset=utf-8" -d "@${tempFile}"`;
    
    let loginOutput = '';
    try {
      loginOutput = execSync(loginCmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    } catch (cmdErr) {
      console.error("Fallo de curl.exe:");
      console.log("stdout:", cmdErr.stdout ? cmdErr.stdout.toString() : '');
      console.log("stderr:", cmdErr.stderr ? cmdErr.stderr.toString() : '');
      throw cmdErr;
    }
    
    // Eliminamos el archivo temporal
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

    const loginData = JSON.parse(loginOutput);
    
    if (loginData.status !== 200) {
      console.error("Error al iniciar sesión:", loginOutput);
      return;
    }

    const token = loginData.token;
    console.log("Token obtenido con éxito:", token.substring(0, 15) + "...");
    
    // Obtener datos del usuario
    const userCmd = `curl.exe -k -s -X GET https://api.biwenger.com/v2/user -H "Authorization: Bearer ${token}" -H "X-Version: h3g456hj" -H "Accept: application/json"`;
    const userOutput = execSync(userCmd).toString();
    const userData = JSON.parse(userOutput);
    console.log("Ligas del usuario:", userData.data?.leagues);

    // Obtener datos de la clasificación
    console.log("Obteniendo clasificación de la liga...");
    const leagueCmd = `curl.exe -k -s -X GET "https://api.biwenger.com/v2/league?fields=standings,users" -H "Authorization: Bearer ${token}" -H "X-Version: h3g456hj" -H "X-League: ${leagueId}" -H "Accept: application/json"`;
    const leagueOutput = execSync(leagueCmd).toString();
    const leagueData = JSON.parse(leagueOutput);

    console.log("Clasificación de la liga (Usuarios):");
    console.table(leagueData.data.users.map(u => ({ id: u.id, name: u.name, email: u.email })));

    console.log("Clasificación de la liga (Puntos):");
    console.table(leagueData.data.standings.map(s => ({ userId: s.id, points: s.points, position: s.position })));

  } catch (err) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    console.error("Error final:", err.message);
  }
}

run();
