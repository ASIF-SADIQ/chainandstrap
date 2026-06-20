const fetch = require('node-fetch');
fetch('https://chainandstrap.store')
  .then(res => res.text())
  .then(html => {
    console.log('HTML LENGTH:', html.length);
    console.log('CONTAINS PRODUCTS:', html.includes('product') || html.includes('price') || html.includes('strap'));
  })
  .catch(err => console.error('ERROR:', err.message));
