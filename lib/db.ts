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
    db.collection("students").createIndex({ email: 1 }, { unique: true }),
    db.collection("courses").createIndex({ studentId: 1 }),
    db.collection("exams").createIndex({ studentId: 1 }),
    db.collection("exams").createIndex({ courseId: 1 }),
    db.collection("exams").createIndex({ courseId: 1, examDate: 1 }),
    db.collection("materials").createIndex({ studentId: 1 }),
    db.collection("materials").createIndex({ courseId: 1 }),
    db.collection("lectureAnalyses").createIndex({ materialId: 1 }),
    db.collection("assessments").createIndex({ studentId: 1 }),
    db.collection("assessments").createIndex({ courseId: 1 }),
    db.collection("knowledgeProfiles").createIndex({ studentId: 1 }),
    db.collection("knowledgeProfiles").createIndex({ studentId: 1, courseId: 1 }),
    db.collection("studyPlans").createIndex({ studentId: 1 }),
    db.collection("tutor_conversations").createIndex({ studentId: 1, courseId: 1, updatedAt: -1 }),
    db.collection("tutor_messages").createIndex({ conversationId: 1, createdAt: 1 }),
  ]);
}

/** Return a cached Mongo database, or null if unconfigured or unreachable (offline/demo experience). */
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
      cache.client = undefined;
      throw error;
    }
  })();
  try {
    await cache.connecting;
  } catch {
    return null;
  }
  const db = cache.db;
  if (!db) return null;
  cache.indexes ??= createIndexes(db).catch((error) => {
    cache.indexes = undefined;
    throw error;
  });
  try {
    await cache.indexes;
  } catch {
    return db;
  }
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
