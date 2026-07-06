import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno de Supabase en el .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapeMatchdays() {
  console.log('Iniciando cálculo del calendario de LaLiga...');
  
  for (let matchday = 1; matchday <= 38; matchday++) {
    try {
      // Simular que el último partido es a las 21:00 del Lunes de esa jornada
      // Jornada 1 empezó el finde del 18 Agosto 2024. Lunes fue 19 de Agosto.
      const baseDate = new Date('2024-08-19T21:00:00.000Z'); 
      baseDate.setDate(baseDate.getDate() + ((matchday - 1) * 7));
      
      const closingDate = baseDate.toISOString();

      await supabase.from('matchdays_calendar').upsert({
        matchday_number: matchday,
        last_match_time: closingDate
      });

      console.log(`[Jornada ${matchday}] Fecha límite establecida: ${closingDate}`);
      
    } catch (e) {
      console.error(`Error en jornada ${matchday}:`, e.message);
    }
  }
  
  console.log('Calendario inyectado en Supabase con éxito.');
}

scrapeMatchdays();
