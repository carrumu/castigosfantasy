const https = require('https');

const email = 'ytnoxgames@gmail.com';
const password = 'contraseñaprueba';
const leagueId = '2137733';
const globalUserId = '4578169';
const leagueUserId = '13911888';

// Login first
const loginData = JSON.stringify({ email, password });
const loginOptions = {
  hostname: 'biwenger.as.com',
  port: 443,
  path: '/api/v2/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.token;
    testLeague(token);
  });
});
req.write(loginData);
req.end();

function testLeague(token) {
  // Test combinations
  const tests = [
    { name: 'Only X-League', headers: { 'X-League': leagueId } },
    { name: 'X-League + X-User (leagueUserId)', headers: { 'X-League': leagueId, 'X-User': leagueUserId } },
    { name: 'X-League + X-User (globalUserId)', headers: { 'X-League': leagueId, 'X-User': globalUserId } },
    { name: 'X-League + X-User (leagueUserId) + X-Version', headers: { 'X-League': leagueId, 'X-User': leagueUserId, 'X-Version': 'h3g456hj' } }
  ];
  
  tests.forEach((t) => {
    const options = {
      hostname: 'biwenger.as.com',
      port: 443,
      path: '/api/v2/league?fields=standings,users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...t.headers
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Test: ${t.name} | Status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
          console.log('Error payload:', body);
        } else {
          console.log('Success! Data length:', body.length);
        }
      });
    });
    req.end();
  });
}
