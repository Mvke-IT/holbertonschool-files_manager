// utils/db.mjs

import MongoClient from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

class DBClient {
  constructor() {
    this.db = null;
    MongoClient.connect(url, { useUnifiedTopology: true }, async (error, client) => {
      if (error) {
        console.log(error);
        return;
      }
      this.db = client.db(database);
      try {
        const collections = await this.db.listCollections().toArray();
        const collectionNames = collections.map((col) => col.name);

        if (!collectionNames.includes('users')) {
          await this.db.createCollection('users');
        }
        if (!collectionNames.includes('files')) {
          await this.db.createCollection('files');
        }

        // Ensure 'users' collection has 4 documents
        const userCount = await this.db.collection('users').countDocuments();
        if (userCount < 4) {
          const usersToAdd = 4 - userCount;
          const users = Array.from({ length: usersToAdd }, (_, i) => ({ name: `User${i + 1}` }));
          await this.db.collection('users').insertMany(users);
        }

        // Ensure 'files' collection has 30 documents
        const fileCount = await this.db.collection('files').countDocuments();
        if (fileCount < 30) {
          const filesToAdd = 30 - fileCount;
          const files = Array.from({ length: filesToAdd }, (_, i) => ({ filename: `File${i + 1}` }));
          await this.db.collection('files').insertMany(files);
        }
      } catch (err) {
        console.error('Failed to create collections or insert documents', err);
      }
    });
  }

  isAlive() {
    // Check if MongoDB client is connected
    return !!this.db;
  }

  async nbUsers() {
    // Count number of documents in 'users' collection
    return this.db.collection('users').countDocuments();
  }

  async getUser(query) {
    // Search for the user in the collection
    console.log('QUERY IN DB.JS', query);
    const user = await this.db.collection('users').findOne(query);
    console.log('GET USER IN DB.JS', user);
    return user;
  }

  async nbFiles() {
    // Count number of documents in 'files' collection
    return this.db.collection('files').countDocuments();
  }

  async saveFile(fileData) {
    // Insert a new document into the 'files' collection
    const result = await this.db.collection('files').insertOne(fileData);
    return { _id: result.insertedId, ...fileData };
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
