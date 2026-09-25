// Shared shape of a chat mode served by /api/chat. Adding a mode = one new file
// in this folder exporting a ChatModeDefinition, plus one line in ./index.ts.

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface PreparedChat {
  system: string
  messages: ChatMessage[]
}

export interface ChatModeDefinition {
  maxTokens: number
  /** Validates the request body and builds what goes to the model; a string is a 400 error. */
  prepare(body: Record<string, unknown>): PreparedChat | { error: string }
}
