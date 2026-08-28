import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Word from "@/models/Word"

// ─── DELETE /api/words/[id] ───────────────────────────────
// Deletes a single word document by its MongoDB ObjectId.

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

    const deleted = await Word.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/words/[id]]", err)
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    )
  }
}
