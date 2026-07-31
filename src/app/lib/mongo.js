import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://teste:TESTE222@meubanco.drgd8c5.mongodb.net/COMPROVANTE";

if (!MONGODB_URI) {
  throw new Error("MongoDB URI não definida");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
