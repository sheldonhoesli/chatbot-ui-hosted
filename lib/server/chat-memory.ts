import { Database } from "@/supabase/types"
import { type SupabaseClient } from "@supabase/supabase-js"
const MESSAGE_LIMIT = 20

async function summarizeMessages(
  messages: { role: string; content: string }[]
) {
  const joined = messages.map(m => `${m.role}: ${m.content}`).join("\n")
  return joined.slice(-1000)
}

export async function updateChatMemory(
  chatId: string,
  supabase: SupabaseClient<Database>
) {
  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("sequence_number", { ascending: true })
    .limit(MESSAGE_LIMIT)

  if (!messages || messages.length === 0) {
    throw new Error("Chat not found")
  }

  const summary = await summarizeMessages(messages)

  const { error } = await supabase.from("chat_memory").upsert({
    chat_id: chatId,
    content: summary,
    updated_at: new Date().toISOString()
  })

  if (error) throw new Error(error.message)
  return summary
}
