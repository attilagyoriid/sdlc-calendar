// src/app/lib/db/connection.ts
import mongoose from 'mongoose';

// MongoDB URI should include the database name: mongodb+srv://username:password@cluster.mongodb.net/databaseName
const MONGODB_URI = process.env.MONGODB_URI || '';
const DATABASE_NAME = process.env.DATABASE_NAME || 'sap_calendar_db';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Extract the database name from the URI or use the default
let dbName = DATABASE_NAME;
if (MONGODB_URI.includes('?')) {
  const uriParts = MONGODB_URI.split('?');
  const baseUri = uriParts[0];
  if (baseUri.lastIndexOf('/') !== baseUri.length - 1) {
    dbName = baseUri.substring(baseUri.lastIndexOf('/') + 1);
  }
}

console.log(`Connecting to database: ${dbName}`);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: dbName, // Explicitly set the database name
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(`Connected to MongoDB database: ${dbName}`);
        return mongoose;
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
