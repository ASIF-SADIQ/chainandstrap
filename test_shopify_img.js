const fetch = require('node-fetch');
fetch('https://cdn.shopify.com/s/files/1/0555/1000/7999/files/dragons-bags-horse-brown-tote-bag-front.jpg?v=1754888670')
  .then(res => {
    console.log('STATUS:', res.status);
    console.log('HEADERS:', res.headers.raw());
  })
  .catch(err => console.error('ERROR:', err.message));
