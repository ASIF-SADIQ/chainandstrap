const fetch = require('node-fetch');
fetch('https://chainandstraps.live/api/products')
  .then(res => res.json())
  .then(json => console.log('SUCCESS:', json.success, 'count:', json.count))
  .catch(err => console.error('ERROR:', err.message));
