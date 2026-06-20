const axios = require('axios');

async function testDownload() {
  try {
    const fileId = '1M3oarRyKRSkN1TIhskSam7447r_SOlc0'; // From Hermes 1167
    const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    console.log(`Downloading from thumbnail URL: ${url}`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log('Download complete!');
    console.log('Status Code:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Length:', response.headers['content-length'] || response.data.length);
    
    const buffer = Buffer.from(response.data);
    console.log('First 20 bytes (hex):', buffer.slice(0, 20).toString('hex'));
    
    // Check if it starts with JPEG magic bytes FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      console.log('✅ Success! The downloaded file is a valid JPEG image.');
    } else {
      console.log('❌ Failed! The downloaded file is NOT a JPEG image.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testDownload();
