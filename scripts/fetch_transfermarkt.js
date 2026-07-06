import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env variables if they exist
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'REPLACE_WITH_YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_WITH_YOUR_SUPABASE_KEY';

let supabase = null;
if (SUPABASE_URL.startsWith('http')) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

const START_YEAR = 1970;
const END_YEAR = 2026;
const PROGRESS_FILE = path.join(process.cwd(), 'scripts', 'progress.json');
const BATCH_SIZE = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading progress file', e);
    }
  }
  return { lastYearCompleted: START_YEAR - 1, clubsCompletedForCurrentYear: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function fetchLaLigaClubsForYear(year) {
  const url = `https://www.transfermarkt.es/laliga/startseite/wettbewerb/ES1/plus/?saison_id=${year}`;
  console.log(`[${year}] Fetching clubs from ${url}...`);
  try {
    const response = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(response.data);
    
    const clubs = [];
    $('#yw1 table.items tbody tr').each((i, el) => {
      const aTag = $(el).find('td.hauptlink.no-border-links a');
      if (aTag.length) {
        const clubName = aTag.text().trim();
        const clubHref = aTag.attr('href'); // /real-madrid/spielplan/verein/418/saison_id/1970
        
        if (clubName && clubHref) {
          const parts = clubHref.split('/');
          const vereinIndex = parts.indexOf('verein');
          if (vereinIndex !== -1 && vereinIndex + 1 < parts.length) {
            const clubSlug = parts[1] || 'club';
            const clubId = parts[vereinIndex + 1];
            clubs.push({ name: clubName, slug: clubSlug, id: clubId });
          }
        }
      }
    });
    return clubs;
  } catch (error) {
    console.error(`[${year}] Error fetching clubs:`, error.message);
    return [];
  }
}

async function fetchPlayersFromClub(club, year) {
  const url = `https://www.transfermarkt.es/${club.slug}/kader/verein/${club.id}/saison_id/${year}/plus/1`;
  console.log(`[${year}] Fetching players for ${club.name}...`);
  try {
    const response = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(response.data);
    
    const players = [];
    $('#yw1 table.items tbody tr').each((i, el) => {
      if (!$(el).hasClass('odd') && !$(el).hasClass('even')) return;
      
      const aTag = $(el).find('td.hauptlink a');
      const name = aTag.text().trim();
      const href = aTag.attr('href');
      
      const tm_id = href ? href.split('/').pop() : null;
      
      const position = $(el).find('table.inline-table tr:nth-child(2) td').text().trim();
      const valueText = $(el).find('td.rechts.hauptlink').text().trim();
      
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
    console.error(`[${year}] Error fetching players for ${club.name}:`, error.message);
    return [];
  }
}

async function upsertPlayers(players) {
  if (SUPABASE_URL === 'REPLACE_WITH_YOUR_SUPABASE_URL' || !supabase) {
    console.log('Skipping Supabase insertion (credentials missing).');
    return;
  }
  
  if (players.length === 0) return;

  const uniquePlayers = [];
  const seenIds = new Set();
  for (const p of players) {
    if (!seenIds.has(p.tm_id)) {
      uniquePlayers.push(p);
      seenIds.add(p.tm_id);
    }
  }

  for (let i = 0; i < uniquePlayers.length; i += BATCH_SIZE) {
    const batch = uniquePlayers.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('football_players')
      .upsert(batch, { onConflict: 'tm_id' });
      
    if (error) {
      console.error('Error inserting batch to Supabase:', error);
    }
  }
}

async function run() {
  console.log(`Starting historical scrape from ${START_YEAR} to ${END_YEAR}...`);
  let progress = loadProgress();
  
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    if (year < progress.lastYearCompleted) {
      continue;
    }
    
    let completedClubs = [];
    if (year === progress.lastYearCompleted) {
      completedClubs = progress.clubsCompletedForCurrentYear || [];
    }
    
    const clubs = await fetchLaLigaClubsForYear(year);
    if (clubs.length === 0) {
      console.log(`[${year}] No clubs found, skipping...`);
      await sleep(2500);
      continue;
    }
    
    console.log(`[${year}] Found ${clubs.length} clubs. Resuming from index ${completedClubs.length}...`);
    
    let yearPlayers = [];
    
    for (const club of clubs) {
      if (completedClubs.includes(club.id)) {
        continue;
      }
      
      const players = await fetchPlayersFromClub(club, year);
      yearPlayers = yearPlayers.concat(players);
      
      completedClubs.push(club.id);
      progress.lastYearCompleted = year;
      progress.clubsCompletedForCurrentYear = completedClubs;
      saveProgress(progress);
      
      await upsertPlayers(players);
      
      await sleep(2500 + Math.random() * 1500);
    }
    
    progress.lastYearCompleted = year + 1;
    progress.clubsCompletedForCurrentYear = [];
    saveProgress(progress);
    
    console.log(`[${year}] Completed year. Extracted ${yearPlayers.length} total raw entries.`);
    await sleep(3000);
  }
  
  console.log('✅ ALL YEARS COMPLETED.');
}

run();
