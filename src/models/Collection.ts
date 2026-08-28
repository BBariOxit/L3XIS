import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose"

// ─── Interface ────────────────────────────────────────────

export interface ICollectionFields {
  slug: string    // URL-safe key, e.g. "general", "my-science"
  name: string    // Display name, e.g. "General", "My Science"
  color: string   // Tailwind color name or hex, e.g. "indigo", "#ff5733"
  icon?: string   // Optional emoji or lucide icon name
  createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────

const CollectionSchema = new Schema<ICollectionFields>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // Enforce URL-safe: only a-z, 0-9, hyphens
      match: /^[a-z0-9-]+$/,
    },
    name:  { type: String, required: true, trim: true },
    color: { type: String, default: "indigo" },
    icon:  { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Each slug must be unique
CollectionSchema.index({ slug: 1 }, { unique: true })

// ─── Types ────────────────────────────────────────────────

export type CollectionDocument = HydratedDocument<ICollectionFields>

// ─── Model export ─────────────────────────────────────────

const Collection: Model<ICollectionFields> =
  mongoose.models.Collection ??
  mongoose.model<ICollectionFields>("Collection", CollectionSchema)

export default Collection
