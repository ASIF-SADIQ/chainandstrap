const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvPath = '/root/chain-backend/data.csv';

async function run() {
  if (!fs.existsSync(csvPath)) {
    console.error('data.csv does not exist at', csvPath);
    process.exit(1);
  }

  const hermesRows = [];
  
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      const vendor = row['Vendor'] || '';
      if (vendor.toLowerCase().includes('hermes')) {
        hermesRows.push({
          Handle: row['Handle'],
          Title: row['Title'],
          Vendor: vendor,
          'Image Src': row['Image Src']
        });
      }
    })
    .on('end', () => {
      console.log(`Found ${hermesRows.length} Hermes rows in CSV.`);
      console.log('Sample rows:');
      hermesRows.slice(0, 10).forEach((r, idx) => {
        console.log(`${idx + 1}. Handle: ${r.Handle} | Vendor: ${r.Vendor} | Image: ${r['Image Src']}`);
      });
      process.exit(0);
    });
}

run();
