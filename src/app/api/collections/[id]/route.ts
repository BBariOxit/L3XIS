import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"
import Word from "@/models/Word"

// ─── DELETE /api/collections/[id] ────────────────────────
// Deletes a collection by ObjectId.
// Words in that collection are moved to "general" (not deleted).

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    await connectDB()

    const col = await Collection.findById(id)
    if (!col) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Prevent deleting the built-in "general" collection
    if (col.slug === "general") {
      return NextResponse.json(
        { error: "Cannot delete the default General collection" },
        { status: 403 }
      )
    }

    // Reassign words from deleted collection → "general"
    await Word.updateMany(
      { wordCollection: col.slug },
      { $set: { wordCollection: "general" } }
    )

    await col.deleteOne()

    return NextResponse.json({ success: true, movedToGeneral: true })
  } catch (err) {
    console.error("[DELETE /api/collections/[id]]", err)
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 })
  }
}
