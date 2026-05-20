import { useState } from 'react'
import { chatService } from '../services/chatService'
import type { MemoryItem } from '../types'

export function useMemory() {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading]   = useState(false)

  const search = async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const results = await chatService.getMemories(query)
      setMemories(results)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    await chatService.deleteMemory(id)
    setMemories((m) => m.filter((x) => x.id !== id))
  }

  return { memories, loading, search, remove }
}
