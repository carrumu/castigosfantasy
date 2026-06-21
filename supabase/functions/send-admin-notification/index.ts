// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, username, apodo } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Resend API key not configured on server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format date to CET (Europe/Madrid)
    const date = new Date();
    const options = { timeZone: "Europe/Madrid", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false } as const;
    let formattedDate;
    try {
      formattedDate = new Intl.DateTimeFormat("es-ES", options).format(date);
    } catch {
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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CastigoFantasy <noreply@castigosfantasy.com>",
        to: "castigosfantasy2005@gmail.com",
        subject: `Nuevo Registro de Entrenador: ${apodo || 'Sin apodo'}`,
        html: html,
      }),
    });

    const resData = await response.json();

    return new Response(JSON.stringify(resData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
