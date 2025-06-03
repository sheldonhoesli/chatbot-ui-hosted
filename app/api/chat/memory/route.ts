import { updateChatMemory } from "@/lib/server/chat-memory"
import { createResponse } from "@/lib/server/server-utils"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatId } = json as { chatId: string }

  try {
    const memory = await updateChatMemory(chatId)
    return createResponse({ memory: memory.content }, 200)
  } catch (error: any) {
    const message = error.message || "Failed to update memory"
    return createResponse({ message }, 500)
  }
}
