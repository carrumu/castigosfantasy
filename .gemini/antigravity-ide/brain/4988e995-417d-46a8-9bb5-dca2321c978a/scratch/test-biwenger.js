const email = "ytnoxgames@gmail.com";
const password = "contraseñaprueba";
const leagueId = "cwRzHsqCc6nx";

async function run() {
  console.log("Iniciando sesión en Biwenger con headers de navegador...");
  try {
    const loginRes = await fetch("https://api.biwenger.com/v2/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://biwenger.as.com",
        "Referer": "https://biwenger.as.com/"
      },
      body: JSON.stringify({ email, password })
    });

    console.log("Status de Login:", loginRes.status);
    const loginData = await loginRes.json();
    console.log("Respuesta de Login:", JSON.stringify(loginData, null, 2));

    if (loginRes.status !== 200) {
      console.error("Error al iniciar sesión");
      return;
    }

    const token = loginData.token;
    if (!token) {
      console.error("No se encontró el token en la respuesta");
      return;
    }

    console.log("Token obtenido con éxito:", token.substring(0, 15) + "...");

    console.log(`Obteniendo datos del usuario...`);
    const userRes = await fetch(`https://api.biwenger.com/v2/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Version": "h3g456hj",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-League": leagueId
      }
    });
    const userData = await userRes.json();
    console.log("Respuesta del Usuario:", JSON.stringify(userData, null, 2));

    console.log(`Obteniendo datos de la liga...`);
    const leagueRes = await fetch(`https://api.biwenger.com/v2/league?fields=standings,users`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Version": "h3g456hj",
        "X-League": leagueId,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    console.log("Status de Liga:", leagueRes.status);
    const leagueData = await leagueRes.json();
    console.log("Respuesta de Liga (Resumida):", JSON.stringify(leagueData, null, 2).substring(0, 1500));
  } catch (err) {
    console.error("Error en la ejecución:", err);
  }
}

run();
