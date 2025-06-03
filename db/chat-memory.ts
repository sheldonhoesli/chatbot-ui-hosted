import { supabase } from "@/lib/supabase/browser-client"

export const getChatMemory = async (chatId: string) => {
  const { data } = await supabase
    .from("chat_memory")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle()

  return data
}
