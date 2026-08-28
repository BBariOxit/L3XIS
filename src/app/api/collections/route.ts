import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"

// ─── Seed defaults ────────────────────────────────────────
// Ensures the 3 built-in collections always exist in DB.
// Called lazily on the first GET — idempotent (upsert).

const DEFAULTS = [
  { slug: "general",  name: "General",  color: "indigo" },
  { slug: "academic", name: "Academic", color: "violet" },
  { slug: "business", name: "Business", color: "emerald" },
]

async function seedDefaults() {
  for (const d of DEFAULTS) {
    await Collection.updateOne(
      { slug: d.slug },
      { $setOnInsert: d },
      { upsert: true }
    )
  }
}

// ─── GET /api/collections ─────────────────────────────────
// Returns all collections sorted by createdAt ascending.

export async function GET() {
  try {
    await connectDB()
    await seedDefaults()

    const docs = await Collection.find({}).sort({ createdAt: 1 }).lean()

    const payload = docs.map((c) => ({
      id:        String(c._id),
      slug:      c.slug,
      name:      c.name,
      color:     c.color,
      icon:      c.icon ?? null,
      createdAt: c.createdAt,
    }))

    return NextResponse.json({ collections: payload })
  } catch (err) {
    console.error("[GET /api/collections]", err)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  }
}

// ─── POST /api/collections ────────────────────────────────
// Creates a new collection. Body: { name, color?, icon? }
// Auto-generates slug from name.

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, color = "indigo", icon } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    // Generate slug: lowercase, replace spaces with hyphens, strip non-alphanumeric
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    if (!slug) {
      return NextResponse.json({ error: "name produces an invalid slug" }, { status: 400 })
    }

    const saved = await Collection.create({ slug, name: name.trim(), color, icon })

    return NextResponse.json(
      {
        collection: {
          id:        String(saved._id),
          slug:      saved.slug,
          name:      saved.name,
          color:     saved.color,
          icon:      saved.icon ?? null,
          createdAt: saved.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 409 }
      )
    }
    console.error("[POST /api/collections]", err)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
}
