const fetch = require('node-fetch');
fetch('https://chainandstrap.com/backend-api/products?limit=5')
  .then(res => res.json())
  .then(json => {
    console.log('LIVE PRODUCTS IMAGE URLS:');
    if (json.data && json.data.length > 0) {
      json.data.forEach(p => {
        console.log(`Product: ${p.Title}`);
        console.log(`Images:`, p.images);
      });
    } else {
      console.log('No data returned from live backend-api.');
    }
  })
  .catch(err => console.error('ERROR:', err.message));
