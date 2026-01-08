const https = require('https');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('Could not read .env.local');
        return {};
    }
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection with:');
console.log('URL:', url);
console.log('Key (first 10):', key ? key.substring(0, 10) : 'MISSING');

if (!url || !key) {
    console.error('Missing URL or Key in .env.local');
    process.exit(1);
}

// Extract hostname
const hostname = url.replace('https://', '').replace('http://', '').split('/')[0];

const options = {
    hostname: hostname,
    path: '/rest/v1/',
    method: 'GET',
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('SUCCESS: Connection valid!');
    } else {
        console.log('FAILED: Supabase rejected the key.');
        console.log('Reason:', res.statusMessage);
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
