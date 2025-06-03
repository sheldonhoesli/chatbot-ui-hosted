import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const MESSAGE_LIMIT = 20

async function summarizeMessages(
  messages: { role: string; content: string }[]
) {
  const joined = messages.map(m => `${m.role}: ${m.content}`).join("\n")

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" })
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Summarize the conversation." },
        { role: "user", content: joined }
      ]
    })
    return response.choices[0].message.content || ""
  } catch (e) {
    return joined.slice(-1000)
  }
}

export async function updateChatMemory(chatId: string) {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: chat } = await supabaseAdmin
    .from("chats")
    .select("user_id")
    .eq("id", chatId)
    .single()

  if (!chat) throw new Error("Chat not found")

  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("sequence_number", { ascending: false })
    .limit(MESSAGE_LIMIT)

  const summary = await summarizeMessages(messages?.reverse() || [])

  const { data: memory, error } = await supabaseAdmin
    .from("chat_memory")
    .upsert({
      chat_id: chatId,
      user_id: chat.user_id,
      content: summary,
      updated_at: new Date().toISOString()
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return memory
}
