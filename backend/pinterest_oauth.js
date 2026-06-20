const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const CLIENT_ID = '1575951';
const CLIENT_SECRET = '263229d834c3b9ce3d857a3b70247a4326946c44';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

app.get('/login', (req, res) => {
    // Pinterest OAuth requires specific scopes
    const scope = 'boards:read,boards:write,pins:read,pins:write';
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.send('Error: No code provided');
    }

    try {
        console.log('⏳ Getting Access Token from Pinterest...');
        const tokenResponse = await axios.post('https://api.pinterest.com/v5/oauth/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
                }
            }
        );

        console.log('\n\n======================================================');
        console.log('✅ SUCCESS! Yahan se naya Access Token copy karein:');
        console.log('======================================================\n');
        console.log(tokenResponse.data.access_token);
        console.log('\n======================================================\n');
        
        res.send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1 style="color: green;">✅ Success!</h1>
                <p>Naya Token generate ho gaya hai. Ab aap terminal (PowerShell) check karein.</p>
            </div>
        `);
        
        setTimeout(() => process.exit(0), 1000);
    } catch (error) {
        console.error('❌ Error getting token:', error.response ? error.response.data : error.message);
        res.send('Error getting token. Terminal check karein.');
    }
});

app.listen(port, () => {
    console.log(`\n🚀 OAUTH SERVER STARTED 🚀`);
    console.log(`--------------------------------------------------`);
    console.log(`Zaroori Hidayat:`);
    console.log(`Pehle apni Pinterest Developer App mein jayen.`);
    console.log(`Wahan 'Redirect URIs' wale box mein yeh address paste kar ke 'Add' dabayen:`);
    console.log(`http://localhost:3000/auth/callback`);
    console.log(`--------------------------------------------------`);
    console.log(`Uske baad apne browser mein yeh link open karein:`);
    console.log(`http://localhost:3000/login\n`);
});
