import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env variables if they exist
dotenv.config();

// Get these from your local environment or the user will need to provide them
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'REPLACE_WITH_YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_WITH_YOUR_SUPABASE_KEY';

let supabase = null;
if (SUPABASE_URL.startsWith('http')) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function fetchLaLigaClubs() {
  const url = 'https://www.transfermarkt.es/laliga/startseite/wettbewerb/ES1';
  console.log(`Fetching clubs from ${url}...`);
  try {
    const response = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(response.data);
    
    const clubs = [];
    $('#yw1 table.items tbody tr').each((i, el) => {
      const aTag = $(el).find('td.hauptlink.no-border-links a');
      if (aTag.length) {
        const clubName = aTag.text().trim();
        const clubHref = aTag.attr('href');
        if (clubName && clubHref) {
          clubs.push({ name: clubName, href: clubHref });
        }
      }
    });
    return clubs;
  } catch (error) {
    console.error('Error fetching clubs:', error.message);
    return [];
  }
}

async function fetchPlayersFromClub(club) {
  const url = `https://www.transfermarkt.es${club.href}`;
  console.log(`Fetching players for ${club.name}...`);
  try {
    const response = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(response.data);
    
    const players = [];
    $('#yw1 table.items tbody tr').each((i, el) => {
      // Find the row containing player data. Some rows are just category headers.
      if (!$(el).hasClass('odd') && !$(el).hasClass('even')) return;
      
      const aTag = $(el).find('td.hauptlink a');
      const name = aTag.text().trim();
      const href = aTag.attr('href');
      
      const tm_id = href ? href.split('/').pop() : null;
      
      // Position is usually in the inline table next to the name
      const position = $(el).find('table.inline-table tr:nth-child(2) td').text().trim();
      
      // Market value
      const valueText = $(el).find('td.rechts.hauptlink').text().trim();
      
      // Photo url (sometimes lazy loaded)
      let photo_url = $(el).find('td img.bilderrahmen-fixed').attr('data-src') || $(el).find('td img.bilderrahmen-fixed').attr('src');
      
      if (name && tm_id) {
        players.push({
          tm_id,
          name,
          position: position || 'Desconocida',
          club: club.name,
          market_value: valueText || '-',
          photo_url: photo_url ? photo_url.replace('small', 'medium') : null
        });
      }
    });
    return players;
  } catch (error) {
    console.error(`Error fetching players for ${club.name}:`, error.message);
    return [];
  }
}

async function run() {
  if (SUPABASE_URL === 'REPLACE_WITH_YOUR_SUPABASE_URL') {
    console.log('⚠️ AVISO: Introduce tu URL y KEY de Supabase en el script o usa un archivo .env.');
    // We will not block it entirely so it can at least test fetching
  }

  const clubs = await fetchLaLigaClubs();
  console.log(`Found ${clubs.length} clubs.`);
  
  // To avoid getting banned, let's just fetch 2 clubs for the initial test run
  // You can remove the slice(0, 2) to fetch all clubs
  const targetClubs = clubs.slice(0, 2);
  
  let allPlayers = [];
  
  for (const club of targetClubs) {
    const players = await fetchPlayersFromClub(club);
    allPlayers = allPlayers.concat(players);
    // Be polite to the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`Fetched ${allPlayers.length} players.`);
  
  if (SUPABASE_URL === 'REPLACE_WITH_YOUR_SUPABASE_URL') {
    console.log('Skipping Supabase insertion because credentials are missing.');
    return;
  }
  
  if (allPlayers.length > 0) {
    console.log('Upserting to Supabase...');
    const { data, error } = await supabase
      .from('football_players')
      .upsert(allPlayers, { onConflict: 'tm_id' })
      .select();
      
    if (error) {
      console.error('Error inserting to Supabase:', error);
    } else {
      console.log(`✅ Successfully saved ${data.length} players to Supabase!`);
    }
  }
}

run();
