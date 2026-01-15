import { MongoClient } from 'mongodb';

const connectionString = process.env.ATLAS_URI || 'mongodb://localhost:27017';

const client = new MongoClient(connectionString);

let connectedClient;
try {
  connectedClient = await client.connect();
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('Error connecting to MongoDB:', error);
}       

let db = connectedClient.db('Civ7');

export default db;
