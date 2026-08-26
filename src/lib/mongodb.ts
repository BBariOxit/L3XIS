import mongoose from "mongoose"

// ─── Types ────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

// ─── Singleton cache ──────────────────────────────────────
// In development, Next.js clears module cache on every reload.
// We attach the connection to the global object to reuse it.

if (!global._mongooseConn) {
  global._mongooseConn = { conn: null, promise: null }
}

const cached = global._mongooseConn

/**
 * Returns a cached Mongoose connection, creating one if necessary.
 * Safe to call in every API route without opening multiple connections.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to your .env file (see .env.example)."
    )
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
