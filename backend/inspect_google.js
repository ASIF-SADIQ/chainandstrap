const axios = require('axios');

async function run() {
  try {
    const fileId = '1M3oarRyKRSkN1TIhskSam7447r_SOlc0';
    const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    console.log('Fetching:', url);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data sample:', String(response.data).substring(0, 1000));
  } catch (err) {
    if (err.response) {
      console.log('Error status:', err.response.status);
      console.log('Error headers:', err.response.headers);
      console.log('Error body sample:', String(err.response.data).substring(0, 1000));
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
