import { create } from "zustand"

// ─── Types ────────────────────────────────────────────────

export interface WordExample {
  sentence: string
  translation: string
  context: string
}

export interface VocabWord {
  id: string
  word: string
  phonetic: string
  definition: string
  definitionVi?: string
  partOfSpeech: string
  examples: WordExample[]
  synonyms: string[]
  collection: string
  addedAt: Date
  masteryLevel: number // 0–4
  lastReviewed?: Date
}

export interface VocabCollection {
  id: string
  name: string
  color: string
  wordCount: number
}

interface VocabState {
  words: VocabWord[]
  collections: VocabCollection[]
  isLoading: boolean
  hasFetched: boolean

  // Actions
  fetchWords: () => Promise<void>
  addWord: (word: Omit<VocabWord, "id" | "addedAt" | "masteryLevel">) => void
  removeWord: (id: string) => Promise<void>
  updateWord: (id: string, updates: Partial<VocabWord>) => void
  addCollection: (name: string, color: string) => void
}

// ─── Default collections ──────────────────────────────────

const DEFAULT_COLLECTIONS: VocabCollection[] = [
  { id: "default", name: "General", color: "indigo", wordCount: 0 },
  { id: "academic", name: "Academic", color: "violet", wordCount: 0 },
  { id: "business", name: "Business", color: "emerald", wordCount: 0 },
]

// ─── Store ────────────────────────────────────────────────

export const useVocabStore = create<VocabState>((set, get) => ({
  words: [],
  collections: DEFAULT_COLLECTIONS,
  isLoading: false,
  hasFetched: false,

  // ── fetchWords ──────────────────────────────────────────
  // Loads all words from MongoDB via GET /api/words.
  // Idempotent — only fetches once per session (hasFetched guard).

  fetchWords: async () => {
    if (get().hasFetched || get().isLoading) return

    set({ isLoading: true })
    try {
      const res = await fetch("/api/words")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { words } = await res.json()

      // Convert addedAt string → Date
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
  // Optimistic local update — the API call is made by the modal before this.

  addWord: (word) =>
    set((state) => ({
      words: [
        {
          ...word,
          id: crypto.randomUUID(),
          addedAt: new Date(),
          masteryLevel: 0,
        },
        ...state.words,
      ],
    })),

  // ── removeWord ──────────────────────────────────────────
  // Optimistic: remove from local state immediately, then persist to DB.
  // If the API call fails, the word is NOT restored (acceptable UX tradeoff;
  // a page refresh will re-sync from MongoDB).

  removeWord: async (id) => {
    // Optimistic removal
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

  // ── addCollection ───────────────────────────────────────

  addCollection: (name, color) =>
    set((state) => ({
      collections: [
        ...state.collections,
        { id: crypto.randomUUID(), name, color, wordCount: 0 },
      ],
    })),
}))

