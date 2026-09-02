import "server-only";
import { MongoClient, type Db, type Document, type Collection } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

/** MongoDB is optional for the offline/demo experience. */
export const databaseConfigured = Boolean(uri && dbName);

type MongoCache = {
  client?: MongoClient;
  db?: Db;
  connecting?: Promise<Db>;
  indexes?: Promise<void>;
};

const globalForMongo = globalThis as typeof globalThis & { __studyPilotMongo?: MongoCache };
const cache = globalForMongo.__studyPilotMongo ?? (globalForMongo.__studyPilotMongo = {});

async function createIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ sessionToken: 1 }, { unique: true }),
    db.collection("user_preferences").createIndex({ userId: 1 }, { unique: true }),
    db.collection("courses").createIndex({ userId: 1, id: 1 }, { unique: true }),
    db.collection("courses").createIndex({ userId: 1, createdAt: 1 }),
    db.collection("materials").createIndex({ userId: 1, courseId: 1, createdAt: -1 }),
    db.collection("lecture_analyses").createIndex({ userId: 1, materialId: 1, createdAt: -1 }),
    db.collection("assessments").createIndex({ userId: 1, courseId: 1, createdAt: -1 }),
    db.collection("assessment_attempts").createIndex({ userId: 1, courseId: 1, createdAt: -1 }),
    db.collection("tutor_conversations").createIndex({ userId: 1, courseId: 1, updatedAt: -1 }),
    db.collection("tutor_messages").createIndex({ conversationId: 1, createdAt: 1 }),
    db.collection("study_plans").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("study_sessions").createIndex({ planId: 1, id: 1 }),
  ]);
}

/** Return a cached Mongo database. Connections are reused across Vercel invocations. */
export async function getDatabase(): Promise<Db | null> {
  if (!databaseConfigured || !uri || !dbName) return null;
  if (!cache.db) cache.connecting ??= (async () => {
    try {
      cache.client ??= new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5_000 });
      await cache.client.connect();
      cache.db = cache.client.db(dbName);
      return cache.db;
    } catch (error) {
      cache.connecting = undefined;
      throw error;
    }
  })();
  await cache.connecting;
  const db = cache.db;
  if (!db) throw new Error("MongoDB connection was not initialized.");
  cache.indexes ??= createIndexes(db).catch((error) => {
    cache.indexes = undefined;
    throw error;
  });
  await cache.indexes;
  return db;
}

export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T> | null> {
  const db = await getDatabase();
  return db?.collection<T>(name) ?? null;
}

export function now(): Date {
  return new Date();
}
