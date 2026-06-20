const { exec } = require('child_process');

console.log('Executing curl request to api.biwenger.com...');

const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"test\\"}" https://api.biwenger.com/v2/auth/login`;

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Error executing curl:', error);
    return;
  }
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
});
