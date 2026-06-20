const { MongoClient } = require('mongodb');

async function run() {
  let client;
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    console.log('Connected to MongoDB');
    
    const admin = client.db().admin();
    const dbsInfo = await admin.listDatabases();
    
    for (const dbInfo of dbsInfo.databases) {
      const db = client.db(dbInfo.name);
      const cols = await db.listCollections().toArray();
      for (const col of cols) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`Database: ${dbInfo.name} | Collection: ${col.name} | Count: ${count}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

run();
