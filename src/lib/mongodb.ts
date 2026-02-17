import { MongoClient, type Db } from "mongodb";

const DB_NAME = process.env.MONGODB_DB ?? "korea_tourism";

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 60_000,
};

// Vercel serverless: global 변수로 커넥션 풀 캐싱 (cold start 대응)
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (globalForMongo._mongoClientPromise) {
    return globalForMongo._mongoClientPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI 환경변수가 설정되지 않았습니다.");
  }

  const client = new MongoClient(uri, options);
  globalForMongo._mongoClientPromise = client.connect();
  globalForMongo._mongoClient = client;

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
