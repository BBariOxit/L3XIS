import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose"

// ─── Main Schema types ────────────────────────────────────
// Avoid extending Mongoose Document directly — its built-in `collection`
// property (Collection<Document>) conflicts with our string field.
// Use a plain interface + HydratedDocument<IWord> instead.

export interface IWordFields {
  word: string
  phonetic: string
  definition: string
  definitionVi: string
  partOfSpeech: string
  synonyms: string[]
  meanings?: Array<{ partOfSpeech: string; definitionVi: string }>
  wordCollection: string  // Maps to "collection" in DB via schema key alias below
  addedAt: Date
  masteryLevel: number
  lastReviewed?: Date
  isFavorited: boolean
}

// ─── Schema ───────────────────────────────────────────────

const WordSchema = new Schema(
  {
    word: { type: String, required: true, trim: true, lowercase: true },
    phonetic: { type: String, default: "" },
    definition: { type: String, required: true },
    definitionVi: { type: String, default: "" },
    partOfSpeech: { type: String, default: "unknown" },
    synonyms: { type: [String], default: [] },
    meanings: {
      type: [
        {
          partOfSpeech: { type: String },
          definitionVi: { type: String },
        },
      ],
      default: [],
    },
    // Store as "collection" in MongoDB (renamed from wordCollection in interface
    // to avoid Document.collection built-in collision)
    wordCollection: { type: String, default: "default" },
    addedAt: { type: Date, default: Date.now },
    masteryLevel: { type: Number, default: 0, min: 0, max: 4 },
    lastReviewed: { type: Date },
    isFavorited: { type: Boolean, default: false },
  },
  {
    timestamps: false, // we manage addedAt manually
  }
)

// Prevent duplicate words per collection
WordSchema.index({ word: 1, wordCollection: 1 }, { unique: true })

// ─── Types ────────────────────────────────────────────────

export type WordDocument = HydratedDocument<IWordFields>

// ─── Model export ─────────────────────────────────────────
// Guard against Mongoose model re-registration during hot-reload in dev

const Word: Model<IWordFields> =
  mongoose.models.Word ?? mongoose.model<IWordFields>("Word", WordSchema)

export default Word
