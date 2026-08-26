import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Word from "@/models/Word"

// ─── GET /api/words ───────────────────────────────────────
// Returns all saved vocabulary words, sorted by addedAt descending

export async function GET() {
  try {
    await connectDB()

    const words = await Word.find({}).sort({ addedAt: -1 }).lean()

    // Map _id → id for the frontend store
    const payload = words.map((w) => ({
      id: String(w._id),
      word: w.word,
      phonetic: w.phonetic,
      definition: w.definition,
      definitionVi: w.definitionVi,
      partOfSpeech: w.partOfSpeech,
      examples: w.examples,
      synonyms: w.synonyms,
      collection: w.wordCollection,
      addedAt: w.addedAt,
      masteryLevel: w.masteryLevel,
      lastReviewed: w.lastReviewed,
    }))

    return NextResponse.json({ words: payload })
  } catch (err) {
    console.error("[GET /api/words]", err)
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    )
  }
}

// ─── POST /api/words ──────────────────────────────────────
// Saves a new word to MongoDB. Returns the saved document.

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()

    const {
      word,
      phonetic = "",
      definition,
      definitionVi = "",
      partOfSpeech = "unknown",
      examples = [],
      synonyms = [],
      collection = "default",
    } = body

    if (!word || !definition) {
      return NextResponse.json(
        { error: "word and definition are required" },
        { status: 400 }
      )
    }

    const saved = await Word.create({
      word: word.trim().toLowerCase(),
      phonetic,
      definition,
      definitionVi,
      partOfSpeech,
      examples,
      synonyms,
      wordCollection: collection,
    })

    return NextResponse.json(
      {
        word: {
          id: String(saved._id),
          word: saved.word,
          phonetic: saved.phonetic,
          definition: saved.definition,
          definitionVi: saved.definitionVi,
          partOfSpeech: saved.partOfSpeech,
          examples: saved.examples,
          synonyms: saved.synonyms,
          collection: saved.wordCollection,
          addedAt: saved.addedAt,
          masteryLevel: saved.masteryLevel,
        },
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    // Handle MongoDB duplicate key error (word already exists in collection)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "This word already exists in your vocabulary" },
        { status: 409 }
      )
    }

    console.error("[POST /api/words]", err)
    return NextResponse.json(
      { error: "Failed to save word" },
      { status: 500 }
    )
  }
}
