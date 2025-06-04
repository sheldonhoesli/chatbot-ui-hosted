import { updateChatMemory } from "@/lib/server/chat-memory"
import { createResponse } from "@/lib/server/server-utils"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatId } = json as { chatId: string }

  try {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const memory = await updateChatMemory(chatId, supabase)
    return createResponse({ content: memory }, 200)
  } catch (error: any) {
    const message = error.message || "Failed to update memory"
    return createResponse({ message }, 500)
  }
}
