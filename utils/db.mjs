/**
 * MongoDB Client Module
 *
 * This module provides an interface to interact with a MongoDB database.
 * It handles connections, checks the database status, and provides methods
 * for interacting with the 'users' and 'files' collections.
 */

import { MongoClient } from 'mongodb';

// Configuration settings for the MongoDB connection
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

// Define the DBClient class to handle MongoDB operations
class DBClient {
  constructor() {
    // Property to hold the database connection
    this.db = null;

    // Connect to the MongoDB server
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.log(error);
        return;
      }

      // Set the database object for further operations
      this.db = client.db(database);

      // Ensure the necessary collections exist in the database
      (async () => {
        try {
          const collections = await this.db.listCollections().toArray();
          const collectionNames = collections.map((col) => col.name);

          // Create 'users' collection if it doesn't exist
          if (!collectionNames.includes('users')) {
            await this.db.createCollection('users');
          }

          // Create 'files' collection if it doesn't exist
          if (!collectionNames.includes('files')) {
            await this.db.createCollection('files');
          }
        } catch (err) {
          console.error('Failed to create collections', err);
        }
      })();
    });
  }

  /**
   * Check if the MongoDB client is connected
   * @returns {boolean} True if the client is connected, false otherwise
   */
  isAlive() {
    return !!this.db;
  }

  /**
   * Count the number of documents in the 'users' collection
   * @returns {Promise<number>} A promise that resolves to the count of documents
   */
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
   * Retrieve a user document from the 'users' collection
   * @param {object} query - The query object to search for the user
   * @returns {Promise<object|null>} A promise that resolves to the user document or null if not found
   */
  async getUser(query) {
    console.log('QUERY IN DB.JS', query);
    const user = await this.db.collection('users').findOne(query);
    console.log('GET USER IN DB.JS', user);
    return user;
  }

  /**
   * Count the number of documents in the 'files' collection
   * @returns {Promise<number>} A promise that resolves to the count of documents
   */
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  /**
   * Insert a new document into the 'files' collection
   * @param {object} fileData - The data of the file to insert
   * @returns {Promise<object>} A promise that resolves to the inserted file document with its ID
   */
  async saveFile(fileData) {
    const result = await this.db.collection('files').insertOne(fileData);
    return { _id: result.insertedId, ...fileData };
  }
}

// Create and export an instance of DBClient for use in other parts of the application
module.exports = new DBClient();