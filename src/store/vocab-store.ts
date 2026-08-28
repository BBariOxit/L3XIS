import { create } from "zustand"

// ─── Types ────────────────────────────────────────────────

export interface VocabWord {
  id: string
  word: string
  phonetic: string
  definition: string
  definitionVi?: string
  partOfSpeech: string
  synonyms: string[]
  collection: string
  addedAt: Date
  masteryLevel: number // 0-4
  lastReviewed?: Date
  isFavorited?: boolean
}

export interface VocabCollection {
  id: string
  slug: string
  name: string
  color: string
  icon?: string | null
}

interface VocabState {
  words: VocabWord[]
  collections: VocabCollection[]
  isLoading: boolean
  hasFetched: boolean
  collectionsLoading: boolean
  collectionsFetched: boolean

  // Word actions
  fetchWords: () => Promise<void>
  addWord: (word: Omit<VocabWord, "id" | "addedAt" | "masteryLevel">) => void
  removeWord: (id: string) => Promise<void>
  updateWord: (id: string, updates: Partial<VocabWord>) => void

  // Collection actions
  fetchCollections: () => Promise<void>
  addCollection: (name: string, color: string, icon?: string) => Promise<VocabCollection | null>
  removeCollection: (id: string) => Promise<void>
}

// ─── Store ────────────────────────────────────────────────

export const useVocabStore = create<VocabState>((set, get) => ({
  words: [],
  collections: [],
  isLoading: false,
  hasFetched: false,
  collectionsLoading: false,
  collectionsFetched: false,

  // ── fetchWords ──────────────────────────────────────────
  // Loads all words from MongoDB via GET /api/words.
  // Idempotent -- only fetches once per session (hasFetched guard).

  fetchWords: async () => {
    if (get().hasFetched || get().isLoading) return

    set({ isLoading: true })
    try {
      const res = await fetch("/api/words")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { words } = await res.json()

      // Convert addedAt string -> Date
      const parsed: VocabWord[] = words.map(
        (w: Omit<VocabWord, "addedAt"> & { addedAt: string }) => ({
          ...w,
          addedAt: new Date(w.addedAt),
        })
      )

      set({ words: parsed, isLoading: false, hasFetched: true })
    } catch (err) {
      console.error("[fetchWords]", err)
      set({ isLoading: false, hasFetched: true }) // don't retry endlessly
    }
  },

  // ── addWord ─────────────────────────────────────────────
  // Optimistic local update -- the API call is made by the modal before this.

  addWord: (word) =>
    set((state) => ({
      words: [
        {
          ...word,
          id: crypto.randomUUID(),
          addedAt: new Date(),
          masteryLevel: 0,
          isFavorited: false,
        },
        ...state.words,
      ],
    })),

  // ── removeWord ──────────────────────────────────────────
  // Optimistic: remove from local state immediately, then persist to DB.

  removeWord: async (id) => {
    set((state) => ({
      words: state.words.filter((w) => w.id !== id),
    }))

    try {
      const res = await fetch(`/api/words/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        console.error("[removeWord] API error:", json.error ?? res.status)
      }
    } catch (err) {
      console.error("[removeWord]", err)
    }
  },

  // ── updateWord ──────────────────────────────────────────

  updateWord: (id, updates) =>
    set((state) => ({
      words: state.words.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  // ── fetchCollections ────────────────────────────────────
  // Loads all collections from MongoDB via GET /api/collections.
  // Seeds the 3 defaults on the server if they don't exist yet.

  fetchCollections: async () => {
    if (get().collectionsFetched || get().collectionsLoading) return

    set({ collectionsLoading: true })
    try {
      const res = await fetch("/api/collections")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { collections } = await res.json()

      set({
        collections: collections as VocabCollection[],
        collectionsLoading: false,
        collectionsFetched: true,
      })
    } catch (err) {
      console.error("[fetchCollections]", err)
      set({ collectionsLoading: false, collectionsFetched: true })
    }
  },

  // ── addCollection ───────────────────────────────────────
  // POSTs to API, then optimistically adds to local state on success.
  // Returns the created collection or null on failure.

  addCollection: async (name, color, icon?) => {
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed")

      const col: VocabCollection = json.collection
      set((state) => ({
        collections: [...state.collections, col],
      }))
      return col
    } catch (err) {
      console.error("[addCollection]", err)
      return null
    }
  },

  // ── removeCollection ────────────────────────────────────
  // Optimistic removal + API call.
  // Words in the deleted collection are moved to "general" by the API.

  removeCollection: async (id) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }))

    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        console.error("[removeCollection] API error:", json.error ?? res.status)
      } else {
        // Sync words that were moved to general
        set((state) => ({
          words: state.words.map((w) =>
            w.collection !== "general" &&
            !state.collections.some((c) => c.slug === w.collection)
              ? { ...w, collection: "general" }
              : w
          ),
        }))
      }
    } catch (err) {
      console.error("[removeCollection]", err)
    }
  },
}))
