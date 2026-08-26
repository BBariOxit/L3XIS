import mongoose, { Schema, type Document, type Model } from "mongoose"

// ─── Sub-schemas ──────────────────────────────────────────

const WordExampleSchema = new Schema(
  {
    sentence: { type: String, required: true },
    translation: { type: String, required: true },
    context: { type: String, default: "general" },
  },
  { _id: false }
)

// ─── Main Schema ──────────────────────────────────────────

export interface IWord extends Document {
  word: string
  phonetic: string
  definition: string
  definitionVi: string
  partOfSpeech: string
  examples: { sentence: string; translation: string; context: string }[]
  synonyms: string[]
  collection: string
  addedAt: Date
  masteryLevel: number
  lastReviewed?: Date
}

const WordSchema = new Schema<IWord>(
  {
    word: { type: String, required: true, trim: true, lowercase: true },
    phonetic: { type: String, default: "" },
    definition: { type: String, required: true },
    definitionVi: { type: String, default: "" },
    partOfSpeech: { type: String, default: "unknown" },
    examples: { type: [WordExampleSchema], default: [] },
    synonyms: { type: [String], default: [] },
    collection: { type: String, default: "default" },
    addedAt: { type: Date, default: Date.now },
    masteryLevel: { type: Number, default: 0, min: 0, max: 4 },
    lastReviewed: { type: Date },
  },
  {
    timestamps: false, // we manage addedAt manually
  }
)

// Prevent duplicate words in the same collection (case-insensitive via lowercase)
WordSchema.index({ word: 1, collection: 1 }, { unique: true })

// ─── Model export ─────────────────────────────────────────
// Guard against Mongoose model re-registration during hot-reload in dev

const Word: Model<IWord> =
  mongoose.models.Word ?? mongoose.model<IWord>("Word", WordSchema)

export default Word
